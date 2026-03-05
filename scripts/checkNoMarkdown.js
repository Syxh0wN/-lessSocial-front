#!/usr/bin/env node

const { execSync } = require("node:child_process");

const trackedFilesOutput = execSync("git ls-files", { encoding: "utf8" });
const trackedFiles = trackedFilesOutput
  .split("\n")
  .map((value) => value.trim())
  .filter((value) => value.length > 0);

const markdownTracked = trackedFiles.filter((filePath) => filePath.endsWith(".md"));

if (markdownTracked.length > 0) {
  console.error("MarkdownFilesAreBlocked");
  process.exit(1);
}

const stagedFilesOutput = execSync("git diff --cached --name-only", { encoding: "utf8" });
const stagedFiles = stagedFilesOutput
  .split("\n")
  .map((value) => value.trim())
  .filter((value) => value.length > 0);

const markdownStaged = stagedFiles.filter((filePath) => filePath.endsWith(".md"));

if (markdownStaged.length > 0) {
  console.error("MarkdownFilesAreBlocked");
  process.exit(1);
}

process.exit(0);
