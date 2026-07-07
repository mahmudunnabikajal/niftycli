import chalk from "chalk";
import { input, select, confirm } from "@inquirer/prompts";
import { loadConfig, saveConfig } from "../config.js";

export async function promptNewProject(config) {
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

function requireConfig() {
  const config = loadConfig();
  if (!config) {
    console.log(chalk.red("No configuration found. Run `niftycli init` first."));
    process.exitCode = 1;
    return null;
  }
  return config;
}

export async function addProjectCommand() {
  const config = requireConfig();
  if (!config) return;

  const project = await promptNewProject(config);
  console.log(chalk.green(`\n✔ Added project "${project.name}"`));
}

export async function listProjectsCommand() {
  const config = requireConfig();
  if (!config) return;

  if (config.projects.length === 0) {
    console.log(chalk.yellow("No projects yet. Run `niftycli project add` to create one."));
    return;
  }

  console.log(chalk.bold("\nProjects:"));
  for (const p of config.projects) {
    const isDefault = p.name === config.defaultProject;
    console.log(`  ${isDefault ? chalk.cyan("*") : " "} ${p.name} ${chalk.gray(`<${p.email}>`)}`);
  }
}

export async function editProjectCommand() {
  const config = requireConfig();
  if (!config) return;

  if (config.projects.length === 0) {
    console.log(chalk.yellow("No projects to edit. Run `niftycli project add` to create one."));
    return;
  }

  const originalName = await select({
    message: "Edit which project?",
    choices: config.projects.map((p) => ({ name: p.name, value: p.name })),
  });

  const project = config.projects.find((p) => p.name === originalName);

  const name = await input({ message: "Project name:", required: true, default: project.name });
  const email = await input({
    message: "Project's Nifty forwarding email (Project Settings → Email to Task):",
    required: true,
    default: project.email,
  });

  project.name = name;
  project.email = email;
  if (config.defaultProject === originalName) {
    config.defaultProject = name;
  }

  saveConfig(config);
  console.log(chalk.green(`\n✔ Updated project "${name}"`));
}

export async function removeProjectCommand() {
  const config = requireConfig();
  if (!config) return;

  if (config.projects.length === 0) {
    console.log(chalk.yellow("No projects to remove."));
    return;
  }

  const name = await select({
    message: "Remove which project?",
    choices: config.projects.map((p) => ({ name: p.name, value: p.name })),
  });

  const proceed = await confirm({ message: `Remove "${name}"?`, default: false });
  if (!proceed) {
    console.log(chalk.yellow("Aborted."));
    return;
  }

  config.projects = config.projects.filter((p) => p.name !== name);
  if (config.defaultProject === name) {
    config.defaultProject = config.projects[0]?.name;
  }
  saveConfig(config);
  console.log(chalk.green(`\n✔ Removed project "${name}"`));
}
