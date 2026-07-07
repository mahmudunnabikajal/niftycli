# Create a CLI tool for Nifty Automation

## Instructions

1. Create a new directory for your project.
2. This will be a npm package and host in the npm registry.
3. user type niftycli --help to see the help menu.
4. user type niftycli --version to see the version.
5. user type niftycli --init to initialize the project.
   - also need to setup user workmail smtp server details.
   - it will ask for the project name.
   - it will ask for project email from project control center. so taht when user create a new it will show the project name from previous setup instead of the email.
6. user type niftycli --new to create a new task.
   - it will ask for the project name that we created in previous step.
   - if user select to create new project it will ask for the project name and email.
   - it will ask for the task name.

## Steps

1. Initialize the project with `niftycli --init`.
2. Create a new task with `niftycli --new`.
3. after creating the task it will send a mail using nifty access mail server.
4. if done show success.

## Template

- Creating a Task
  ​ - Subject: Task Name [To Do]
  ​ - Body: Task Description (optional)
