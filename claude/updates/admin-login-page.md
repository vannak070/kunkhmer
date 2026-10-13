# Update: Simple admin sign-in page

| | |
|---|---|
| **Status** | Done in the working tree (2026-10-13), not committed |
| **Jira** | n/a |
| **Feature** | claude/features/admin-pwa.md |
| **Requested by** | vannak070 (2026-10-13: "improve login page") |

## Current behavior
`Login.tsx`: dark blue page with blurred colour blobs, a background picture loaded from transparenttextures.com
(outside site), red header "DIGITAL KUNKHMER", all-caps black labels, an eye icon without text, raw API error text,
no language switch, an invented "Platform v3.0.0" in the footer. A phone capitalised the first letter of the username.

## Change
- Light page like the rest of the admin; logo, "KKF Admin", the federation name; language switch (English / Khmer) at
  the top; the "no internet" / "new version" notices (`PwaBar`).
- Fields: 48 px high, 16 px text (no zoom on iPhone), labels in plain sentence case, username not auto-capitalised,
  no autocorrect / spellcheck, spaces around the username ignored, autofocus; "Show" / "Hide" as a word; Caps Lock
  warning; Enter submits.
- Messages in plain words, EN + KM (`login.*` in `i18n/program.ts`): wrong details (401 / 422), too many tries with
  the wait in minutes (429 + `Retry-After`, now kept on request errors as `retryAfter` in `utils/api.ts`), no
  connection (the request never got an answer). Expired-session notice kept.
- Below the form: "Forgot your password? Ask a Super Admin to set a new one" (there is no email reset) and "You can
  be signed in on one device at a time" (the API's single-session policy — logging in revokes earlier tokens).
- Removed: outside background picture, "Platform v3.0.0", all-caps styling.

## Acceptance criteria
- [x] Admin `tsc` 0 errors.
- [x] Browser (test copy on the test API): wrong details message; Caps Lock warning; Show / Hide; username attributes;
      11th wrong try → "wait 15 minutes" message; Khmer at 375 px incl. the expired notice; successful sign-in with
      spaces around the username → "Signing in…" → /home.
- [ ] Real iPhone / Android keyboard check (auto-capitalisation, password manager fill).

## Log
### 2026-10-13
- Built and checked as above. The owner's own dev session was not touched (sign-in tested only on the disposable test API).
