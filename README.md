# niftycli

A simple command-line tool that creates tasks in [Nifty](https://niftypm.com) by
sending an email — no need to open Nifty in your browser.

Nifty lets every project receive tasks by email: each project has its own secret
forwarding address, and any email sent to it becomes a new task (the subject line
becomes the task name). `niftycli` automates writing and sending that email for you,
using your own work email account.

## How it works

1. You run `niftycli init` once to tell the CLI your email server details and your
   first Nifty project.
2. Every time you want to create a task, you run `niftycli new`, type a task name
   (and optionally a description), and pick which project it belongs to.
3. `niftycli` sends an email on your behalf to that project's Nifty address, and
   Nifty turns it into a task for you.

## Requirements

- [Node.js](https://nodejs.org) version 18 or newer installed on your computer.
- Your work email address and its SMTP server settings (see [Finding your SMTP
  settings](#finding-your-smtp-settings) below).
- The Nifty forwarding email address for each project (see [Finding your Nifty
  project email](#finding-your-nifty-project-email) below).

## Installation

Clone or download this project, then install its dependencies:

```bash
npm install
```

Make the `niftycli` command available on your computer:

```bash
npm link
```

Check that it worked:

```bash
niftycli --version
```

> If you don't want to install it globally, you can always run it as
> `node bin/niftycli.js <command>` instead of `niftycli <command>`.

## Getting started

### 1. Set up the CLI

Run:

```bash
niftycli init
```

You'll be asked a series of questions:

| Question                         | What to enter                                                                             |
| -------------------------------- | ----------------------------------------------------------------------------------------- |
| SMTP host                        | Your email provider's outgoing mail server, e.g. `smtp.office365.com` or `smtp.gmail.com` |
| SMTP port                        | Usually `587`. Leave the default if you're not sure                                       |
| Use TLS (secure) connection?     | Usually "No" for port `587`, "Yes" for port `465`                                         |
| SMTP username                    | Your work email address                                                                   |
| SMTP password                    | Your email password (or an "app password" — see below)                                    |
| Your name (From)                 | The name you want shown as the sender                                                     |
| Your work email (From)           | Your work email address                                                                   |
| Project name                     | A short name you'll recognize later, e.g. `Website Revamp`                                |
| Project's Nifty forwarding email | The special email address for that Nifty project (see below)                              |

The CLI will try to connect to your email server to make sure the details are
correct before saving anything.

Your settings are saved to a file at `~/.niftycli/config.json` on your computer.
This file contains your email password in plain text, so keep your computer secure
and don't share this file with anyone.

### 2. Create a task

Run:

```bash
niftycli new
```

You'll be asked to:

1. Pick a project (or choose **+ Add new project** to set up another one).
2. Type a task name.
3. Type an optional description (press Enter to skip).

If everything goes well, you'll see:

```
✔ Task "Fix homepage banner" sent to Website Revamp
```

Within a minute or two, the task should appear in that Nifty project's task list.

## Finding your SMTP settings

"SMTP" is just the technical name for the server your email provider uses to send
mail. Common ones:

- **Gmail / Google Workspace**: host `smtp.gmail.com`, port `587`. You'll likely
  need to create an ["App Password"](https://myaccount.google.com/apppasswords)
  instead of your normal login password.
- **Microsoft 365 / Outlook**: host `smtp.office365.com`, port `587`.
- **Other providers**: check your IT department or your provider's help docs for
  "SMTP settings" — they'll give you the host, port, and whether TLS is required.

## Finding your Nifty project email

In Nifty:

1. Open the project you want to send tasks to.
2. Go to **Project Settings**.
3. Look for **Email to Task** (sometimes listed under integrations).
4. Copy the email address shown there — that's what `niftycli` needs.

Each project in Nifty has its own unique address, so you'll need to add each
project separately (either during `niftycli init` or later via `niftycli new` →
**+ Add new project**).

## Commands reference

| Command              | What it does                                                |
| -------------------- | ----------------------------------------------------------- |
| `niftycli --help`    | Show all available commands                                 |
| `niftycli --version` | Show the installed version                                  |
| `niftycli init`      | Set up (or overwrite) your email settings and first project |
| `niftycli new`       | Create a new task                                           |

## Troubleshooting

- **"No configuration found. Run `niftycli init` first."** — you haven't run
  `niftycli init` yet, or the config file was deleted.
- **"Could not connect to SMTP server"** — double check your host, port, username,
  and password. If you use Gmail or Microsoft 365, make sure you're using an app
  password rather than your regular login password if your account has two-factor
  authentication enabled.
- **The task never shows up in Nifty** — double check the project's forwarding
  email address is correct and hasn't changed, and check your email's "Sent" folder
  to confirm the message actually went out.
- **Starting over** — delete the `~/.niftycli/config.json` file and run
  `niftycli init` again.
