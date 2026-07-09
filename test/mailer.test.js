import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { buildTaskEmail } from "../src/mailer.js";

describe("buildTaskEmail", () => {
  test("includes status in subject and description as body", () => {
    const { subject, text } = buildTaskEmail({
      taskName: "Fix bug",
      description: "Something broke",
      status: "In Progress",
    });
    assert.equal(subject, "Fix bug [In Progress]");
    assert.equal(text, "Something broke");
  });

  test("defaults status to 'To Do' when omitted", () => {
    const { subject } = buildTaskEmail({ taskName: "New task" });
    assert.equal(subject, "New task [To Do]");
  });

  test("defaults text to empty string when description is missing", () => {
    const { text } = buildTaskEmail({ taskName: "New task" });
    assert.equal(text, "");
  });
});
