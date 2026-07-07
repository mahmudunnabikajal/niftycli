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
import pkg from "../package.json" with { type: "json" };

const { version } = pkg;

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

program.command("new").description("Create a new Nifty task").action(newCommand);

const project = program.command("project").description("Manage saved Nifty projects");

project.command("add").description("Add another Nifty project").action(addProjectCommand);

project.command("list").description("List saved Nifty projects").action(listProjectsCommand);

project
  .command("edit")
  .description("Edit a saved Nifty project's name or forwarding email")
  .action(editProjectCommand);

project.command("remove").description("Remove a saved Nifty project").action(removeProjectCommand);

try {
  await program.parseAsync();
} catch (err) {
  if (err.name === "ExitPromptError") {
    console.log(chalk.yellow("\nCancelled."));
    process.exit(130);
  }
  console.log(chalk.red(`\nError: ${err.message}`));
  process.exit(1);
}
