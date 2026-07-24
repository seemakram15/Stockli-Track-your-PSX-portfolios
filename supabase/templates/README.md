# Supabase email templates

These templates cover the current Stockli auth flows:

- `confirm-email.html` — signup confirmation **OTP**
- `reset-password.html` — password recovery **OTP**
- `password-changed-notification.html` — post-change notice

## OTP flow (current)

Emails show `{{ .Token }}` (**6 digits** via `mailer_otp_length: 6`). Codes expire in **10 minutes**
(`otp_expiry: 600` via `npm run supabase:auth-email:apply`).

| Flow | Email | App step | Verify |
| --- | --- | --- | --- |
| Confirm signup | Confirmation code | Enter code on `/signup` | `verifyOtp({ type: "signup" })` → login |
| Reset password | Reset code | Enter code on `/forgot-password` | `verifyOtp({ type: "recovery" })` → `/reset-password` |

There is no primary “click this link” CTA for confirm/reset anymore.

## Recommended subjects

- Confirm signup: `Your Stockli confirmation code`
- Reset password: `Your Stockli password reset code`
- Password changed notification: `Your Stockli password was changed`

## Branding in emails

- Icon: `https://mystockli.com/brand/mystockli-icon-green.png`
- Wordmark: HTML text — green **My** + white **Stockli**

## End-to-end: confirm email

### Development (`http://localhost:3001`)

1. Real Supabase keys in `.env.local` (not demo mode).
2. Sign up → email with confirmation code (10 min).
3. Enter code on the signup screen → “Email verified…” → sign in with password.

### Production (`https://mystockli.com`)

Same flow on the production host after templates + `otp_expiry` are applied and the app is deployed.

## End-to-end: reset password

1. Forgot password → email with reset code (10 min).
2. Enter code → `/reset-password` (authenticated recovery session).
3. Set new password → signed out → sign in.

If the account is still unconfirmed, forgot-password sends a **confirmation** code instead and the UI asks for that first.

## Supabase auth URL settings

Still required for Google OAuth and legacy links:

- Production site URL: `https://mystockli.com`
- Local: `http://localhost:3001`
- Additional redirect URLs include `/auth/callback` for both hosts (see apply script).

## Brevo SMTP settings

- Host: `smtp-relay.brevo.com`
- Port: `587`
- Sender name: `Stockli`
- Disable Brevo click/open tracking for auth emails.

## Apply via script

- `npm run supabase:auth-email:check`
- `npm run supabase:auth-email:apply`

Pushes templates, subjects, sender name, redirect URLs, **`otp_expiry` (default 600 seconds)**,
and **`mailer_otp_length: 6`**.

Required:

- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_PROJECT_REF` (or from `NEXT_PUBLIC_SUPABASE_URL`)

Optional:

- `SUPABASE_AUTH_OTP_EXPIRY` default `600`
- `SUPABASE_AUTH_SMTP_*` (omit to leave SMTP unchanged)
- `SUPABASE_AUTH_SMTP_SENDER_NAME` default `Stockli`

After editing templates, re-run apply (or paste into the dashboard).
