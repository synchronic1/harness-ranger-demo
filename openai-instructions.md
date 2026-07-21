# OpenAI / Codex operator instructions

Read [agent-instructions.md](agent-instructions.md) before proposing an installation or configuration change.

You may inspect the public Harness Ranger documentation and prepare a configuration patch. Before you install, enable, restart, or send any memory to a broker, ask the operator for approval. Never request, accept, or paste an API key into this demo website.

Use the machine-readable contract at [agent-manifest.json](agent-manifest.json) when structured input is useful. The required HeurChain bridge settings are `enabled`, `brokerUrl`, and `agentName`; `apiKey` and `tenant` are optional host-side secrets for a compatible hosted broker.

The bridge is intentionally fail-open: an unavailable broker must not break agent execution or session compaction. Validate `/health` before enabling the memory tools. Use only the documented tiers: `working`, `longterm`, `both`, or `auto`.
