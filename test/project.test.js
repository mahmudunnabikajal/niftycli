import { test, describe, before, beforeEach, after, mock } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

let tmpHome;
let configModule;
let projectModule;
let inputQueue;
let selectQueue;
let confirmQueue;

before(async () => {
  tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), "niftycli-project-test-"));
  process.env.HOME = tmpHome;

  mock.module("@inquirer/prompts", {
    namedExports: {
      input: async () => inputQueue.shift(),
      select: async () => selectQueue.shift(),
      confirm: async () => confirmQueue.shift(),
    },
  });

  configModule = await import("../src/config.js");
  projectModule = await import("../src/commands/project.js");
});

beforeEach(() => {
  inputQueue = [];
  selectQueue = [];
  confirmQueue = [];
  process.exitCode = 0;
  configModule.saveConfig({ projects: [], defaultProject: undefined });
});

after(() => {
  fs.rmSync(tmpHome, { recursive: true, force: true });
});

describe("project commands", () => {
  test("promptNewProject appends a project and sets it as default", async () => {
    const config = { projects: [] };
    inputQueue = ["Website", "web@example.com"];
    const project = await projectModule.promptNewProject(config);
    assert.deepEqual(project, { name: "Website", email: "web@example.com" });
    assert.equal(config.projects.length, 1);
    assert.equal(config.defaultProject, "Website");
    assert.deepEqual(configModule.loadConfig().projects, [project]);
  });

  test("addProjectCommand exits with an error when unconfigured", async () => {
    fs.rmSync(configModule.getConfigPath(), { force: true });
    await projectModule.addProjectCommand();
    assert.equal(process.exitCode, 1);
  });

  describe("with an existing project", () => {
    beforeEach(() => {
      configModule.saveConfig({
        projects: [{ name: "Website", email: "web@example.com" }],
        defaultProject: "Website",
      });
    });

    test("listProjectsCommand does not throw for a populated config", async () => {
      await assert.doesNotReject(projectModule.listProjectsCommand());
    });

    test("listProjectsCommand does not throw for an empty config", async () => {
      configModule.saveConfig({ projects: [], defaultProject: undefined });
      await assert.doesNotReject(projectModule.listProjectsCommand());
    });

    test("editProjectCommand renames the selected project", async () => {
      selectQueue = ["Website"];
      inputQueue = ["Website Revamp", "revamp@example.com"];
      await projectModule.editProjectCommand();
      const config = configModule.loadConfig();
      assert.equal(config.projects[0].name, "Website Revamp");
      assert.equal(config.projects[0].email, "revamp@example.com");
      assert.equal(config.defaultProject, "Website Revamp");
    });

    test("removeProjectCommand removes the project when confirmed", async () => {
      selectQueue = ["Website"];
      confirmQueue = [true];
      await projectModule.removeProjectCommand();
      const config = configModule.loadConfig();
      assert.equal(config.projects.length, 0);
      assert.equal(config.defaultProject, undefined);
    });

    test("removeProjectCommand aborts when not confirmed", async () => {
      selectQueue = ["Website"];
      confirmQueue = [false];
      await projectModule.removeProjectCommand();
      const config = configModule.loadConfig();
      assert.equal(config.projects.length, 1);
    });
  });
});
