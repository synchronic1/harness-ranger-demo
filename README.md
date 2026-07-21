# Harness Ranger Interactive Demo

This is a static, UI-only demonstration. Its four harnesses and endpoints are illustrative; it cannot reach Harness Ranger, Connector Runners, databases, or real harnesses.

## Local preview

Run `npx serve .` from this directory, then visit the localhost URL it prints.

## Cloudflare Pages

Create a **private GitHub repository** from this folder. In Cloudflare Pages, connect that repository and set:

- Framework preset: None
- Build command: leave empty
- Build output directory: `/`

Cloudflare Pages' Git integration automatically deploys every push to `main` once this repository is connected. This avoids placing a Cloudflare API token in GitHub Actions for a static UI demo.

Do not deploy this demo at the same hostname as the production control plane. Recommended: `harnessranger.heurchain.com` or `demo.heurchain.com/harnessranger`.
