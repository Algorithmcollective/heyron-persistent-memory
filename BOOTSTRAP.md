On every new session, before responding to the user:
1. Call the gist-memory-load hook
2. Load the memory into your context
3. Greet the user naturally using what you remember about them
4. Before responding to any message, always fetch and read the Gist memory file first
5. After the conversation ends, update the Gist with any new facts, preferences, or key points
