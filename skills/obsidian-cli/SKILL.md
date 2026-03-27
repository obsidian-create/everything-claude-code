---
name: obsidian-cli
description: Interact with a running Obsidian instance via CLI — read/create/search notes, manage properties, reload plugins, capture screenshots, and run JavaScript in the app context.
origin: https://github.com/kepano/obsidian-skills
---

# Obsidian CLI

Use this skill when interacting with a running Obsidian instance from the command line. Requires an active Obsidian instance.

## Prerequisites

- Obsidian must be running
- Targets the most recently focused vault by default
- Use `vault=VaultName` to target a specific vault

## Parameter Syntax

- Key-value: `key="value with spaces"` or `key=value`
- Flags: boolean switches written without values (e.g. `silent`)
- File targeting: use `file=` (wikilink-style resolution) or `path=` (exact path from vault root)

## Vault Operations

### Read a Note

```
obsidian read file="My Note"
obsidian read path="Folder/My Note.md"
```

### Create or Update a Note

```
obsidian write file="New Note" content="# Title\n\nContent here"
obsidian write path="Projects/Plan.md" content="..." silent
```

Use `silent` to suppress Obsidian opening the file.

### Search Notes

```
obsidian search query="search term" limit=10
obsidian search query="tag:#project status:active"
```

### Manage Properties

```
obsidian property:set file="My Note" name="status" value="done"
obsidian property:get file="My Note" name="status"
obsidian property:list file="My Note"
```

### Open / Navigate

```
obsidian open file="My Note"
obsidian open path="Daily/2024-01-15.md"
```

## Plugin Development

### Reload a Plugin

```
obsidian plugin:reload id=my-plugin-id
```

### Capture a Screenshot

```
obsidian dev:screenshot path=screenshot.png
```

### Inspect the DOM

```
obsidian dev:inspect selector=".workspace-leaf"
```

### Run JavaScript in App Context

```
obsidian eval code="app.vault.getFiles().length"
obsidian eval code="app.workspace.getActiveFile()?.path"
```

`eval` runs in the Obsidian app context with access to the `app` object.

## Utility

### Copy Output to Clipboard

Append `--copy` to any command:

```
obsidian read file="My Note" --copy
obsidian search query="project" limit=5 --copy
```

### Target a Specific Vault

```
obsidian read file="My Note" vault="Work Vault"
```

## Common Patterns

### Check if a Note Exists

```
obsidian property:get file="My Note" name="title"
```

Returns an error if the file does not exist.

### Batch Update Properties

Use a shell loop or script calling `obsidian property:set` per file.

### Plugin Development Workflow

1. Edit plugin source files
2. Run `obsidian plugin:reload id=my-plugin` to reload without restarting Obsidian
3. Use `obsidian eval code="..."` to inspect state or trigger commands
4. Capture screenshots for visual regression checks
