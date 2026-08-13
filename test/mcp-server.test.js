import { test, describe, before, beforeEach, after, mock } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

let tmpHome;
let configModule;
let createServer;
let sentEmails;

before(async () => {
  tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), "niftycli-mcp-test-"));
  process.env.HOME = tmpHome;

  const mailerUrl = new URL("../src/mailer.js", import.meta.url).href;
  sentEmails = [];
  mock.module(mailerUrl, {
    namedExports: {
      buildTaskEmail: ({ taskName, description, status = "To Do" }) => ({
        subject: `${taskName} [${status}]`,
        text: description || "",
      }),
      sendTaskEmail: async (smtp, toEmail, email) => {
        sentEmails.push({ smtp, toEmail, email });
      },
    },
  });

  configModule = await import("../src/config.js");
  ({ createServer } = await import("../src/mcp/server.js"));
});

after(() => {
  fs.rmSync(tmpHome, { recursive: true, force: true });
});

function callTool(server, name, args = {}) {
  return server._registeredTools[name].handler(args);
}

describe("mcp server", () => {
  test("niftycli_hello greets by name", async () => {
    const server = createServer();
    const result = await callTool(server, "niftycli_hello", { name: "World" });
    assert.match(result.content[0].text, /Hello, World!/);
  });

  test("niftycli_hello greets without a name", async () => {
    const server = createServer();
    const result = await callTool(server, "niftycli_hello");
    assert.match(result.content[0].text, /^Hello! niftycli-mcp/);
  });

  test("niftycli_status reports not configured", async () => {
    const server = createServer();
    const result = await callTool(server, "niftycli_status");
    assert.match(result.content[0].text, /not configured yet/);
  });

  describe("with a saved config", () => {
    beforeEach(() => {
      configModule.saveConfig({
        projects: [{ name: "Website", email: "web@example.com" }],
        defaultProject: "Website",
        smtp: { host: "smtp.example.com", user: "me@example.com" },
      });
    });

    test("niftycli_status reports configured projects", async () => {
      const server = createServer();
      const result = await callTool(server, "niftycli_status");
      assert.match(result.content[0].text, /niftycli is configured/);
      assert.match(result.content[0].text, /Website/);
    });

    test("niftycli_list_projects lists saved projects", async () => {
      const server = createServer();
      const result = await callTool(server, "niftycli_list_projects");
      assert.match(result.content[0].text, /Website <web@example.com> \(default\)/);
    });

    test("niftycli_add_project adds and defaults the new project", async () => {
      const server = createServer();
      const result = await callTool(server, "niftycli_add_project", {
        name: "Mobile",
        email: "mobile@example.com",
      });
      assert.match(result.content[0].text, /Added project "Mobile"/);
      const config = configModule.loadConfig();
      assert.equal(config.defaultProject, "Mobile");
      assert.equal(config.projects.length, 2);
    });

    test("niftycli_add_project rejects duplicate names", async () => {
      const server = createServer();
      await assert.rejects(
        callTool(server, "niftycli_add_project", { name: "Website", email: "dup@example.com" }),
        /already exists/,
      );
    });

    test("niftycli_edit_project renames and updates email", async () => {
      const server = createServer();
      const result = await callTool(server, "niftycli_edit_project", {
        currentName: "Website",
        newName: "Website Revamp",
        newEmail: "revamp@example.com",
      });
      assert.match(result.content[0].text, /Website Revamp/);
      const config = configModule.loadConfig();
      assert.equal(config.projects[0].name, "Website Revamp");
      assert.equal(config.projects[0].email, "revamp@example.com");
      assert.equal(config.defaultProject, "Website Revamp");
    });

    test("niftycli_edit_project throws for an unknown project", async () => {
      const server = createServer();
      await assert.rejects(
        callTool(server, "niftycli_edit_project", { currentName: "Nope" }),
        /No project named/,
      );
    });

    test("niftycli_remove_project removes the project", async () => {
      const server = createServer();
      const result = await callTool(server, "niftycli_remove_project", { name: "Website" });
      assert.match(result.content[0].text, /Removed project "Website"/);
      const config = configModule.loadConfig();
      assert.equal(config.projects.length, 0);
    });

    test("niftycli_create_task sends an email to the project", async () => {
      const server = createServer();
      const result = await callTool(server, "niftycli_create_task", {
        project: "Website",
        name: "Fix bug",
        description: "Details here",
        status: "In Progress",
      });
      assert.match(result.content[0].text, /Task "Fix bug" sent to project "Website"/);
      assert.equal(sentEmails.length, 1);
      assert.equal(sentEmails[0].toEmail, "web@example.com");
      assert.equal(sentEmails[0].email.subject, "Fix bug [In Progress]");
    });

    test("niftycli_create_task throws for an unknown project", async () => {
      const server = createServer();
      await assert.rejects(
        callTool(server, "niftycli_create_task", { project: "Nope", name: "Task" }),
        /No project named/,
      );
    });
  });
});
