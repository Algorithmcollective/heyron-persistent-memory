# Persistent Memory for Heyron Agents
### Heyron Agent Jam #1 Submission — Memory Systems

---

## What This Does

By default, Heyron agents forget everything when you start a new session. This skill fixes that.

After you install it, your agent will automatically remember who you are, what your projects are, your preferences, open to-dos, and key things from past conversations — without you ever having to remind it.

It works across sessions, across container resets, and requires zero manual prompting. You don't ask it to remember. It just does.

---

## How It Works

Your agent's memory is stored in a **private GitHub Gist** — free, persistent, and only accessible to you. On every new session the agent fetches your memory and loads it before responding. After every meaningful conversation it automatically updates your Gist with anything new it learned.

**Memory structure:**
```json
{
  "user_facts": {
    "name": "Your Name",
    "company": "Your Company",
    "projects": ["Project A", "Project B"],
    "preferences": {"communication": "direct"}
  },
  "conversations": [
    {
      "date": "2026-04-26",
      "topic": "Topic discussed",
      "key_points": ["important point 1", "important point 2"]
    }
  ],
  "todos": [],
  "last_updated": "2026-04-26T00:00:00Z"
}
```

---

## Why GitHub Gist?

| Option | Problem |
|---|---|
| Local files | Wiped on container reset |
| Database | Too complex, requires setup |
| MEMORY.md | Not persistent across reinstalls |
| **GitHub Gist** | **Free, private, persistent, API accessible** |

---

## What You Need

- A GitHub account (free at github.com)
- A GitHub Personal Access Token with Gist permissions
- A Heyron workspace

---

## Setup — Step by Step

### Step 1 — Get a GitHub Personal Access Token

1. Go to **github.com** and sign in
2. Click your profile photo → **Settings**
3. Scroll down and click **Developer settings**
4. Click **Personal access tokens** → **Tokens (classic)**
5. Click **Generate new token (classic)**
6. Give it a name like `heyron-memory`
7. Under **Scopes**, check **gist**
8. Click **Generate token**
9. **Copy the token now** — you won't see it again

---

### Step 2 — Create Your Memory Config File

Create this file in your workspace:

**`/workspace/persistent-memory/memory.json`**
```json
{
  "gist_id": "",
  "token": "your_github_token_here"
}
```

Replace `your_github_token_here` with the token you copied in Step 1. Leave `gist_id` blank — it will be created automatically on first run.

---

### Step 3 — Add the Hook Files

**File 1: `/workspace/hooks/gist-memory-load/HOOK.md`**
```
---
name: gist-memory-load
description: "Fetches persistent memory from GitHub Gist on session start. Use when session starts with /new or /reset and memory should be loaded from gist."
metadata:
  { "openclaw": { "emoji": "🧠", "events": ["command:new", "command:reset"], "always": true } }
---

# Gist Memory Load
Fetches memory from the GitHub Gist configured in the workspace and makes it available to the agent.

## Behavior
On command:new or command:reset:
1. Read gist_id and token from workspace memory.json
2. Fetch the gist via GitHub API
3. Parse memory.json from gist content
4. Push the memory as a system message to the session
```

---

**File 2: `/workspace/hooks/gist-memory-load/handler.js`**
```javascript
const fs = require('fs');
const path = require('path');

const handler = async (event) => {
  if (event.type !== 'command' || (event.action !== 'new' && event.action !== 'reset')) {
    return;
  }

  console.log('[gist-memory-load] Fetching memory from Gist...');

  try {
    const workspaceDir = event.context.workspaceDir;
    const configPath = path.join(workspaceDir, 'persistent-memory', 'memory.json');

    if (!fs.existsSync(configPath)) {
      console.log('[gist-memory-load] No memory.json found, skipping');
      return;
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const gistId = config.gist_id;
    const token = config.token;

    if (!gistId || !token) {
      console.log('[gist-memory-load] Missing gist_id or token');
      return;
    }

    const response = await fetch(`https://api.github.com/gists/${gistId}`, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      console.log('[gist-memory-load] GitHub API error:', response.status);
      return;
    }

    const gist = await response.json();
    const memoryContent = gist.files['memory.json']?.content;

    if (!memoryContent) {
      console.log('[gist-memory-load] No memory.json in gist');
      return;
    }

    const memory = JSON.parse(memoryContent);
    console.log('[gist-memory-load] Loaded memory for:', memory.user_facts?.name || 'unknown');

    const memoryMsg = `📚 **Persistent Memory Loaded:**
- User: ${memory.user_facts?.name || 'unknown'}
- Company: ${memory.user_facts?.company || 'N/A'}
- Projects: ${(memory.projects || []).join(', ') || 'N/A'}
- Last updated: ${memory.last_updated || 'unknown'}`;

    event.messages.push(memoryMsg);

  } catch (err) {
    console.error('[gist-memory-load] Error:', err.message);
  }
};

export default handler;
```

---

**File 3: `/workspace/persistent-memory/SKILL.md`**
```
---
name: persistent-memory
description: Auto-captures and recalls user information across sessions using GitHub Gist for storage. Handles automatic extraction of key facts, preferences, projects, and todos after each conversation. Includes smart recall that pulls only relevant context on startup.
---

# Persistent Memory Skill

## Configuration
Set these in your config or environment:
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
```

---

**File 4: `/workspace/BOOTSTRAP.md`**
```
On every new session, before responding to the user:
1. Call the gist-memory-load hook
2. Load the memory into your context
3. Greet the user naturally using what you remember about them
4. After the conversation ends, update the Gist with any new facts, preferences, or key points
```

---

### Step 4 — Start a New Session

Start a new session in Heyron. Your agent will automatically create a private Gist on first run and begin building your memory from that point forward.

That's it. You're done.

---

## Using It

**Your agent remembers automatically.** Just talk to it normally. It captures your name, projects, preferences, and important context without you asking.

**Commands you can use:**
- `!memory` — Show a summary of what the agent remembers about you
- `!remember <fact>` — Explicitly save something specific
- `!forget <topic>` — Remove something from memory

**To verify it's working:** Check your GitHub Gist after a session and you'll see your memory.json file populated with your conversation context.

**To reset:** Delete the Gist from GitHub and clear the `gist_id` field in `memory.json`. A fresh Gist will be created on the next session.

---

## Files Summary

| File | Purpose |
|---|---|
| `hooks/gist-memory-load/HOOK.md` | Hook definition — fires on new/reset sessions |
| `hooks/gist-memory-load/handler.js` | GitHub API logic — reads and loads memory |
| `persistent-memory/SKILL.md` | Full skill documentation |
| `persistent-memory/memory.json` | Stores your token and Gist ID |
| `BOOTSTRAP.md` | Startup instruction for the agent |

---

## License

MIT — use it, modify it, build on it.

---

*Built for Heyron Agent Jam #1 — Memory Systems*
*Submissions close May 2, 2026*
