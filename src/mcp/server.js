import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { loadConfig, saveConfig, configExists, getConfigPath } from "../config.js";
import { buildTaskEmail, sendTaskEmail } from "../mailer.js";
import pkg from "../../package.json" with { type: "json" };

function requireConfig() {
  const config = loadConfig();
  if (!config) {
    throw new Error(
      `No niftycli configuration found at ${getConfigPath()}. Run \`niftycli init\` in a terminal first.`,
    );
  }
  return config;
}

function findProject(config, name) {
  const project = config.projects.find((p) => p.name.toLowerCase() === name.toLowerCase());
  if (!project) {
    const available = config.projects.map((p) => p.name).join(", ") || "(none)";
    throw new Error(`No project named "${name}". Available projects: ${available}`);
  }
  return project;
}

function textResult(text) {
  return { content: [{ type: "text", text }] };
}

export function createServer() {
  const server = new McpServer({ name: "niftycli", version: pkg.version });

  server.registerTool(
    "niftycli_status",
    {
      title: "niftycli status",
      description:
        "Check whether niftycli is configured (SMTP + projects) and list saved projects.",
      inputSchema: {},
    },
    async () => {
      if (!configExists()) {
        return textResult(
          "niftycli is not configured yet. Run `niftycli init` in a terminal first.",
        );
      }
      const config = loadConfig();
      const projects = config.projects.map(
        (p) => `- ${p.name} <${p.email}>${p.name === config.defaultProject ? " (default)" : ""}`,
      );
      return textResult(
        `niftycli is configured.\nSMTP: ${config.smtp.user}@${config.smtp.host}\nProjects:\n${projects.join("\n") || "(none)"}`,
      );
    },
  );

  server.registerTool(
    "niftycli_list_projects",
    {
      title: "List Nifty projects",
      description: "List all saved Nifty projects and their forwarding emails.",
      inputSchema: {},
    },
    async () => {
      const config = requireConfig();
      if (config.projects.length === 0) {
        return textResult("No projects saved. Use niftycli_add_project to add one.");
      }
      const lines = config.projects.map(
        (p) => `- ${p.name} <${p.email}>${p.name === config.defaultProject ? " (default)" : ""}`,
      );
      return textResult(lines.join("\n"));
    },
  );

  server.registerTool(
    "niftycli_add_project",
    {
      title: "Add a Nifty project",
      description:
        "Save a new Nifty project name and its email-forwarding address, and make it the default.",
      inputSchema: {
        name: z.string().min(1).describe("Project name, e.g. 'Website Revamp'"),
        email: z.string().email().describe("Project's Nifty forwarding email"),
      },
    },
    async ({ name, email }) => {
      const config = requireConfig();
      if (config.projects.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
        throw new Error(`Project "${name}" already exists.`);
      }
      config.projects.push({ name, email });
      config.defaultProject = name;
      saveConfig(config);
      return textResult(`Added project "${name}" <${email}>.`);
    },
  );

  server.registerTool(
    "niftycli_edit_project",
    {
      title: "Edit a Nifty project",
      description: "Rename a saved project and/or update its forwarding email.",
      inputSchema: {
        currentName: z.string().min(1).describe("Existing project name to edit"),
        newName: z.string().min(1).optional().describe("New project name (omit to keep current)"),
        newEmail: z
          .string()
          .email()
          .optional()
          .describe("New forwarding email (omit to keep current)"),
      },
    },
    async ({ currentName, newName, newEmail }) => {
      const config = requireConfig();
      const project = findProject(config, currentName);
      const oldName = project.name;
      if (newName) project.name = newName;
      if (newEmail) project.email = newEmail;
      if (config.defaultProject === oldName) {
        config.defaultProject = project.name;
      }
      saveConfig(config);
      return textResult(`Updated project "${oldName}" -> "${project.name}" <${project.email}>.`);
    },
  );

  server.registerTool(
    "niftycli_remove_project",
    {
      title: "Remove a Nifty project",
      description: "Remove a saved Nifty project by name.",
      inputSchema: {
        name: z.string().min(1).describe("Project name to remove"),
      },
    },
    async ({ name }) => {
      const config = requireConfig();
      const project = findProject(config, name);
      config.projects = config.projects.filter((p) => p.name !== project.name);
      if (config.defaultProject === project.name) {
        config.defaultProject = config.projects[0]?.name;
      }
      saveConfig(config);
      return textResult(`Removed project "${project.name}".`);
    },
  );

  server.registerTool(
    "niftycli_create_task",
    {
      title: "Create a Nifty task",
      description:
        "Create a Nifty task by emailing it to a project's Nifty forwarding address via the configured SMTP account.",
      inputSchema: {
        project: z.string().min(1).describe("Saved project name to create the task in"),
        name: z.string().min(1).describe("Task name"),
        description: z.string().optional().describe("Task description"),
        status: z.string().optional().default("To Do").describe("Task status, defaults to 'To Do'"),
      },
    },
    async ({ project: projectName, name, description, status }) => {
      const config = requireConfig();
      const project = findProject(config, projectName);
      const { subject, text } = buildTaskEmail({ taskName: name, description, status });
      await sendTaskEmail(config.smtp, project.email, { subject, text });
      return textResult(`Task "${name}" sent to project "${project.name}" (${project.email}).`);
    },
  );

  return server;
}

export async function startServer() {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
