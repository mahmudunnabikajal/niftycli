#!/usr/bin/env node
import chalk from "chalk";
import { Command } from "commander";
import { initCommand } from "../src/commands/init.js";
import { newCommand } from "../src/commands/new.js";
import {
  addProjectCommand,
  listProjectsCommand,
  editProjectCommand,
  removeProjectCommand,
} from "../src/commands/project.js";
import { configExists } from "../src/config.js";
import { checkForUpdate, printUpdateWarning } from "../src/updateNotifier.js";
import pkg from "../package.json" with { type: "json" };

const { name, version } = pkg;

const updateCheck = checkForUpdate(name, version);

const program = new Command();

program
  .name("niftycli")
  .description("Create Nifty tasks by emailing them to a project's Nifty forwarding address")
  .version(version)
  .action(async () => {
    if (configExists()) {
      await newCommand();
    } else {
      await initCommand();
    }
  });

program
  .command("init")
  .description("Set up SMTP credentials and your first Nifty project")
  .action(initCommand);

program
  .command("new")
  .description("Create a new Nifty task")
  .option("-n <name>", "Task name")
  .option("-d <description>", "Task description")
  .option("-s <status>", "Task status", "To Do")
  .option("-p <project>", "Project name")
  .action(newCommand);

const project = program.command("project").description("Manage saved Nifty projects");

project.command("add").description("Add another Nifty project").action(addProjectCommand);

project.command("list").description("List saved Nifty projects").action(listProjectsCommand);

project
  .command("edit")
  .description("Edit a saved Nifty project's name or forwarding email")
  .action(editProjectCommand);

project.command("remove").description("Remove a saved Nifty project").action(removeProjectCommand);

async function warnIfUpdateAvailable() {
  const latestVersion = await updateCheck;
  if (latestVersion) {
    printUpdateWarning(name, version, latestVersion);
  }
}

try {
  await program.parseAsync();
  await warnIfUpdateAvailable();
} catch (err) {
  await warnIfUpdateAvailable();
  if (err.name === "ExitPromptError") {
    console.log(chalk.yellow("\nCancelled."));
    process.exit(130);
  }
  console.log(chalk.red(`\nError: ${err.message}`));
  process.exit(1);
}
