---
name: persistent-memory
description: Auto-captures and recalls user information across sessions using GitHub Gist for storage. Handles automatic extraction of key facts, preferences, projects, and todos after each conversation. Includes smart recall that pulls only relevant context on startup.
---

# Persistent Memory Skill

## Configuration
- GITHUB_TOKEN: Personal access token with gist scope
- MEMORY_GIST_ID: Gist ID (created automatically on first use)

## How It Works

### On Startup
1. Check if MEMORY_GIST_ID is set
2. If not, create a new private Gist and save the ID
3. Fetch the Gist content and parse memory.json
4. Extract what's relevant to the current query

### After Each Conversation
1. Fetch current Gist content
2. Merge new information (facts, projects, todos, conversation summaries)
3. Update the Gist via PATCH

### Commands
- !memory — Show current memory summary
- !remember <fact> — Manually save a specific fact
- !forget <topic> — Remove specific memory

## Key Principles
- Auto-capture, no prompts needed
- Extract what's relevant — don't dump everything
- Structured is better than blob
- Merge, don't clobber
