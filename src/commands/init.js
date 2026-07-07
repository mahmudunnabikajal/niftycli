import chalk from "chalk";
import { input, password, confirm } from "@inquirer/prompts";
import { configExists, saveConfig, getConfigPath } from "../config.js";
import { createTransport } from "../mailer.js";

export async function initCommand() {
  if (configExists()) {
    const overwrite = await confirm({
      message: `Config already exists at ${getConfigPath()}. Overwrite it?`,
      default: false,
    });
    if (!overwrite) {
      console.log(chalk.yellow("Aborted."));
      return;
    }
  }

  console.log(chalk.bold("\nSet up your work email SMTP server:"));
  const host = await input({ message: "SMTP host:", required: true });
  const portRaw = await input({ message: "SMTP port:", default: "587" });
  const secure = await confirm({ message: "Use TLS (secure) connection?", default: false });
  const user = await input({ message: "SMTP username:", required: true });
  const pass = await password({ message: "SMTP password:", mask: "*" });
  const fromName = await input({ message: "Your name (From):" });
  const fromEmail = await input({ message: "Your work email (From):", required: true, default: user });

  const smtp = {
    host,
    port: Number(portRaw),
    secure,
    user,
    pass,
    fromName,
    fromEmail,
  };

  console.log(chalk.gray("\nVerifying SMTP connection..."));
  try {
    await createTransport(smtp).verify();
    console.log(chalk.green("SMTP connection verified."));
  } catch (err) {
    console.log(chalk.red(`Could not connect to SMTP server: ${err.message}`));
    const proceed = await confirm({
      message: "Save this configuration anyway?",
      default: false,
    });
    if (!proceed) {
      console.log(chalk.yellow("Aborted."));
      return;
    }
  }

  console.log(chalk.bold("\nSet up your first Nifty project:"));
  const projectName = await input({ message: "Project name:", required: true });
  const projectEmail = await input({
    message: "Project's Nifty forwarding email (Project Settings → Email to Task):",
    required: true,
  });

  const config = {
    smtp,
    projects: [{ name: projectName, email: projectEmail }],
    defaultProject: projectName,
  };

  saveConfig(config);
  console.log(chalk.green(`\n✔ Saved configuration to ${getConfigPath()}`));
}
