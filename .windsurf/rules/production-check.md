---
trigger: model_decision
---

id: production_readiness_reminder
description: "Reminds user to run production checklist before final build or release."
match:
  - "Final build"
  - "TestFlight"
  - "Submit to store"
  - "Production release"
response:
  - "Reminder: Have you completed the production readiness checklist?"
  - "✅ CI/CD configured?"
  - "✅ Offline mode tested?"
  - "✅ App store assets uploaded?"
  - "🧾 Use checklist in Notion or /checklist.md"
tags:
  - release
  - qa