# Credentials

Store secrets live here and are never committed.

- `asc-api-key.p8` — the App Store Connect API key (Admin role, Team Keys). It authenticates every
  Apple operation EAS performs: registering the bundle id, creating the distribution certificate
  and provisioning profile, and uploading builds to TestFlight. It is the same team key AERA uses.

The key id, issuer id and team id that go with it live in `.env.eas` (see `.env.eas.example`).
`tools/eas.sh` loads that file before every eas command.
