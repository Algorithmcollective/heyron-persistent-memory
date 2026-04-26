---
name: gist-memory-load
description: "Fetches persistent memory from GitHub Gist on session start. Use when session starts with /new or /reset and memory should be loaded from gist."
metadata:
  { "openclaw": { "emoji": "🧠", "events": ["command:new", "command:reset"], "always": true } }
---

# Gist Memory Load
Fetches memory from the GitHub Gist configured in the workspace and makes it available to the agent.

## Configuration
Requires `memory.json` in the workspace with:
- `gist_id`: The Gist ID
- `token`: GitHub token with gist scope

## Behavior
On `command:new` or `command:reset`:
1. Read gist_id and token from workspace memory.json
2. Fetch the gist via GitHub API
3. Parse memory.json from gist content
4. Push the memory as a system message to the session
