# niftycli

Create [Nifty](https://niftypm.com) tasks by email, from your terminal - no browser needed.

[![mahmudunnabikajal - niftycli](https://img.shields.io/static/v1?label=mahmudunnabikajal&message=niftycli&color=blue&logo=github)](https://github.com/mahmudunnabikajal/niftycli "Go to GitHub repo")
[![Latest Stable Version](https://img.shields.io/npm/v/niftycli.svg)](https://www.npmjs.com/package/niftycli)
[![NPM Downloads](https://img.shields.io/npm/dt/niftycli.svg)](https://www.npmjs.com/package/niftycli)
[![License](https://img.shields.io/badge/License-ISC-blue)](#license)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=mahmudunnabikajal_niftycli&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=mahmudunnabikajal_niftycli)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=mahmudunnabikajal_niftycli&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=mahmudunnabikajal_niftycli)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=mahmudunnabikajal_niftycli&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=mahmudunnabikajal_niftycli)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=mahmudunnabikajal_niftycli&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=mahmudunnabikajal_niftycli)

## Setup

```bash
npm i -g niftycli
```

## Commands

| Command                | Does                               |
| ---------------------- | ---------------------------------- |
| `niftycli`             | Setup (first run) or create a task |
| `niftycli init`        | (Re-)run setup                     |
| `niftycli new`         | Create a task                      |
| `niftycli project ...` | Manage projects (see below)        |
| `niftycli --help`      | List all commands                  |

### Creating a task non-interactively

Pass any of these flags to `niftycli new` to skip the matching prompt:

| Flag           | Does                                      | If omitted                        |
| -------------- | ----------------------------------------- | --------------------------------- |
| `-n <name>`    | Task name                                 | prompts for it                    |
| `-d <text>`    | Task description                          | prompts for it (blank if skipped) |
| `-s <status>`  | Task status                               | defaults to `To Do`, no prompt    |
| `-p <project>` | Project name (must match a saved project) | prompts to select one             |

```bash
niftycli new -p "Website" -n "Fix login bug"
```

Any flag left out falls back to an interactive prompt (status defaults to `To Do` if not set).

## Manage projects

```bash
niftycli project add       # add another project
niftycli project list      # list saved projects
niftycli project edit      # rename / update a project's email
niftycli project remove    # remove a project
```

### Finding your project's forwarding email

1. Open your Nifty project, click the **`...`** menu next to the project name in
   the sidebar, and select **Project Control Center**.

   ![Opening the Project Control Center](https://downloads.intercomcdn.com/i/o/830642303/1b277eeae6f1ba4794ef428f/Screen+Shot+2023-09-14+at+10.15.41+AM.png)

2. In the **Automations** section, click **Email Forwarding** and copy the
   address shown - this is the email you'll give `niftycli` for this project.

   ![Copying the project's forwarding email](https://downloads.intercomcdn.com/i/o/827623574/0f986f450854c74966f3db92/Screen+Shot+2023-09-11+at+9.16.19+AM.png)

## Troubleshooting

- **SMTP connection fails** - double-check host/port/username/password. Gmail and
  Microsoft 365 usually need an "app password", not your normal login.
- **Task never arrives in Nifty** - check the project's forwarding email is correct. Duplicate tasks will be ignored by Nifty.
- **Ctrl+C** cancels any prompt cleanly.
