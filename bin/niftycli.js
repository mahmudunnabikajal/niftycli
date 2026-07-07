#!/usr/bin/env node
import { createRequire } from "node:module";
import { Command } from "commander";
import { initCommand } from "../src/commands/init.js";
import { newCommand } from "../src/commands/new.js";
import {
  addProjectCommand,
  listProjectsCommand,
  editProjectCommand,
  removeProjectCommand,
} from "../src/commands/project.js";

const require = createRequire(import.meta.url);
const { version } = require("../package.json");

const program = new Command();

program
  .name("niftycli")
  .description("Create Nifty tasks by emailing them to a project's Nifty forwarding address")
  .version(version);

program
  .command("init")
  .description("Set up SMTP credentials and your first Nifty project")
  .action(initCommand);

program
  .command("new")
  .description("Create a new Nifty task")
  .action(newCommand);

const project = program.command("project").description("Manage saved Nifty projects");

project
  .command("add")
  .description("Add another Nifty project")
  .action(addProjectCommand);

project
  .command("list")
  .description("List saved Nifty projects")
  .action(listProjectsCommand);

project
  .command("edit")
  .description("Edit a saved Nifty project's name or forwarding email")
  .action(editProjectCommand);

project
  .command("remove")
  .description("Remove a saved Nifty project")
  .action(removeProjectCommand);

program.parse();
