# Harness Ranger HeurChain Bridge - Agent Installation Guide

This is an operator-facing installation contract for bots and coding agents. The demo website is static: it does not expose a credential endpoint, execute commands, or connect to a broker. Configure the actual host plugin instead.

## Guardrails

1. Ask the operator before cloning, installing, restarting a harness, enabling HeurChain, or writing memory.
2. Keep secrets in the host's secret manager or protected plugin configuration. Never paste an API key into this website, chat transcript, source control, or client-side dashboard state.
3. Start with `enabled: false`. Confirm the target broker's `/health` endpoint and persistence behavior before enabling tools or event sinks.
4. Treat broker failures as non-fatal. The Harness Ranger bridge is fail-open: tool execution and compaction must continue if the broker is unavailable.

## Install Harness Ranger

Requirements: Node.js 20 or later, an approved OpenClaw-compatible host, and operator approval.

```sh
git clone https://github.com/synchronic1/enhanced-harness-plugin.git ~/.openclaw/plugins/harness-ranger
cd ~/.openclaw/plugins/harness-ranger
npm ci
npm run test:install
```

Register the plugin using the host's normal plugin mechanism. For OpenClaw, place the plugin at `~/.openclaw/plugins/harness-ranger` and add its configuration to `openclaw.json`. Do not restart the host unless the operator asks for it.

## Local on-prem HeurChain broker

Use the LAN IP address and port supplied by the operator. The development bridge was validated against a local broker that implements `GET /health`, `POST /store`, `POST /agent/store`, `GET /get`, and `GET /search`.

```json
{
  "heurchain": {
    "enabled": true,
    "brokerUrl": "http://<LAN-IP>:<PORT>",
    "agentName": "<stable-agent-name>",
    "timeoutMs": 4000,
    "maxSpillChars": 200000
  }
}
```

Replace `<LAN-IP>`, `<PORT>`, and `<stable-agent-name>` only after the operator approves them. The agent name scopes durable memory and should remain stable across restarts.

## Hosted HeurChain-compatible broker

Use this only when the operator confirms that `https://api.HeurChain.com` provides the required persistence contract. The supplied source integration was validated against a local broker; do not assume a hosted endpoint persists text merely because it responds to HTTP.

```json
{
  "heurchain": {
    "enabled": true,
    "brokerUrl": "https://api.HeurChain.com",
    "agentName": "<stable-agent-name>",
    "apiKey": "${HEURCHAIN_API_KEY}",
    "tenant": "<operator-tenant>",
    "timeoutMs": 4000,
    "maxSpillChars": 200000
  }
}
```

Resolve `${HEURCHAIN_API_KEY}` from the host's secret mechanism. Do not write the literal secret into JSON committed to a repository. `apiKey` maps to the `X-HeurChain-API-Key` header and `tenant` maps to `X-HeurChain-Tenant`.

## What enabling the bridge does

When enabled, the bridge can:

- store verbatim evicted context as compaction spills;
- mirror tool-error incidents for durable postmortems;
- push a latest metrics snapshot to working memory; and
- register `heurchain_store` and `heurchain_search` as agent tools.

The tools and event paths are disabled by default. The bridge validates memory tiers locally: use only `working`, `longterm`, `both`, or `auto`. An invalid tier is treated as a failure rather than a successful no-op.

## Validation sequence

1. Validate the plugin without changing runtime state: `npm run test:install`.
2. Check the configured broker: `GET <brokerUrl>/health`.
3. Enable the bridge for one approved agent only.
4. Confirm that `heurchain_store` and `heurchain_search` appear only after enablement.
5. Record a small approved test memory, search it, and verify the intended persistence tier.
6. Confirm that disabling the broker does not interrupt a tool call or compaction path.

## Operator handoff

Report the selected broker URL without secrets, agent namespace, health result, enabled event sinks, and validation outcome. Do not claim that a cloud broker is persistent until its store and search behavior has been verified.
