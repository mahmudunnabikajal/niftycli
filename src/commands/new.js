import chalk from "chalk";
import { input, select } from "@inquirer/prompts";
import { loadConfig, saveConfig } from "../config.js";
import { buildTaskEmail, sendTaskEmail } from "../mailer.js";

const ADD_NEW_PROJECT = "__add_new_project__";

async function resolveProject(config) {
  if (config.projects.length === 0) {
    return addProject(config);
  }

  const choice = await select({
    message: "Project:",
    choices: [
      ...config.projects.map((p) => ({ name: p.name, value: p.name })),
      { name: "+ Add new project", value: ADD_NEW_PROJECT },
    ],
    default: config.defaultProject,
  });

  if (choice === ADD_NEW_PROJECT) {
    return addProject(config);
  }

  return config.projects.find((p) => p.name === choice);
}

async function addProject(config) {
  const name = await input({ message: "New project name:", required: true });
  const email = await input({
    message: "Project's Nifty forwarding email (Project Settings → Email to Task):",
    required: true,
  });
  const project = { name, email };
  config.projects.push(project);
  config.defaultProject = name;
  saveConfig(config);
  return project;
}

export async function newCommand() {
  const config = loadConfig();
  if (!config) {
    console.log(chalk.red("No configuration found. Run `niftycli init` first."));
    process.exitCode = 1;
    return;
  }

  const project = await resolveProject(config);

  const taskName = await input({ message: "Task name:", required: true });
  const description = await input({ message: "Task description (optional):" });

  const { subject, text } = buildTaskEmail({ taskName, description });

  try {
    await sendTaskEmail(config.smtp, project.email, { subject, text });
    console.log(chalk.green(`\n✔ Task "${taskName}" sent to ${project.name}`));
  } catch (err) {
    console.log(chalk.red(`\nFailed to send task email: ${err.message}`));
    process.exitCode = 1;
  }
}
