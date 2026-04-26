# Persistent Memory — Install Guide

## What You Need
- GitHub account
- GitHub Personal Access Token with gist scope
- Heyron workspace

## Setup

### Step 1 — Get Your GitHub Token
1. Go to github.com → Settings → Developer settings
2. Personal access tokens → Tokens (classic)
3. Generate new token — check the gist scope
4. Copy the token immediately

### Step 2 — Configure memory.json
Edit `persistent-memory/memory.json` and add your token:
```json
{
  "gist_id": "",
  "token": "your_github_token_here"
}
```
Leave `gist_id` blank — it will be created automatically on first run.

### Step 3 — Add Files to Your Workspace
Copy all files from this repo into your Heyron workspace maintaining the same folder structure.

### Step 4 — Start a New Session
Type `/new` in Heyron. Your agent will create a private Gist on first run and begin capturing memory automatically.

## Commands
- `!memory` — Show what the agent remembers about you
- `!remember <fact>` — Explicitly save something
- `!forget <topic>` — Remove something from memory

## Verifying It Works
After a conversation, go to your GitHub Gists and check that memory.json was updated with your information.

## Resetting
Delete your Gist from GitHub and clear the `gist_id` field in memory.json. A fresh Gist will be created next session.
