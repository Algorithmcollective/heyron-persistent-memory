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
