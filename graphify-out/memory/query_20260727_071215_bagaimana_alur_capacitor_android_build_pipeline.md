---
type: "query"
date: "2026-07-27T07:12:15.566605+00:00"
question: "Bagaimana alur Capacitor Android build pipeline?"
contributor: "graphify"
outcome: "useful"
---

# Q: Bagaimana alur Capacitor Android build pipeline?

## Answer

Capacitor Android Pipeline: Next.js app → capacitor.config.ts → android/ (native project) → APK build. Package scripts: cap:sync (sync web to native), cap:add:android, build. AGENTS.md + README.md dokumentasikan prosesnya. Capacitor plugins: core, browser, filesystem, share. Native assets: splash screen (11 density variants), launcher icons (3 types × 7 densities). File download: capacitor-download.ts handle native PDF viewer vs web download.

## Outcome

- Signal: useful