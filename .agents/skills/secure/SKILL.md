---
name: secure
description: "Comprehensive defensive application security audit checklist: secrets & API keys, auth & authorization, database & RLS, input sanitization, security headers, dependency scanning, and production hardening."
category: security
risk: safe
source: local
tags: "[security, audit, appsec, hardening, checklist]"
---

# /secure — Defensive Application Security Audit Checklist

Use this skill whenever auditing, hardening, or performing pre-launch security reviews on web applications, backends, APIs, and databases.

## 🔐 1. Secrets & Credentials Management
- [ ] **Hide API keys**: Ensure no private/secret API keys are exposed to the browser or client-side bundles.
- [ ] **Hide all `.env` files**: Add `.env`, `.env*.local`, and configuration credentials to `.gitignore`.
- [ ] **Never hardcode secrets**: Use environment variables or secret managers (e.g. Doppler, AWS Secrets Manager, Vault).
- [ ] **Purge Git secrets / Check Git history**: Scan commit history (`git log -S`, `trufflehog`, or `gitleaks`) to ensure secrets were never committed in past commits.
- [ ] **Secure your API keys**: Restrict API keys by HTTP referrer, IP address, or API service constraints (e.g. Google Maps API HTTP restrictions).

## 🛡️ 2. Authentication & Authorization
- [ ] **Add authentication**: Ensure protected views and endpoints require verified authentication.
- [ ] **Enforce server-side auth**: Never trust client-side auth claims alone; validate tokens on the server/edge.
- [ ] **Verify permissions server-side**: Enforce RBAC/ABAC on the backend before executing privileged logic.
- [ ] **Don't trust frontend user IDs**: Derive user identity from validated session cookies or verified JWT claims (`sub`), never from request bodies or URL parameters.
- [ ] **Protect admin routes**: Ensure administrative actions require explicit server-side role validation.
- [ ] **Rate limit login & signup**: Protect authentication endpoints against credential stuffing and brute-force attacks (e.g. using Redis, Upstash, or Cloudflare Turnstile).
- [ ] **Add bot protection**: Implement CAPTCHA, proof-of-work, or bot challenge (e.g. Cloudflare Turnstile / reCAPTCHA v3) on public submission forms.
- [ ] **Secure session cookies**: Set `HttpOnly`, `Secure`, and `SameSite=Lax` (or `Strict`) on all auth cookies.
- [ ] **Hash passwords**: Use modern hashing algorithms like Argon2id or bcrypt (cost factor >= 12); never store plain or weakly hashed passwords.

## 🗄️ 3. Database & Storage Security
- [ ] **Use public DB key for client / Lock down your database**: Only expose anonymous/public read keys to clients; keep service/admin keys strictly on the server.
- [ ] **Enable Row-Level Security (RLS)**: In Supabase/PostgreSQL, ensure RLS is enabled on all tables with explicit read/write policies.
- [ ] **Secure Firebase, Supabase, and storage**: Set strict storage bucket and database rules; never allow open wildcards (`allow read, write: if true;`).
- [ ] **Lock record access / Isolate user data**: Verify tenant and user data isolation so users cannot read or modify records belonging to other accounts.
- [ ] **Parameterize queries / Prevent SQL/NoSQL injection**: Use ORMs, query builders, or parameterized prepared statements; never concatenate raw user input into SQL/NoSQL queries.

## 🧼 4. Input Validation & Content Sanitization
- [ ] **Validate all input / Validate inputs server-side**: Use strict schema validators (e.g. Zod, Joi, Valibot) before processing data.
- [ ] **Escape user content / Sanitize user content**: Sanitize output before injecting into DOM (`innerHTML`) or emails to prevent XSS (Cross-Site Scripting).
- [ ] **Block field tampering**: Strip unrecognized or mass-assigned fields (e.g. `role`, `is_admin`, `balance`) on input schemas.
- [ ] **Encrypt sensitive data**: Encrypt sensitive PII or data at rest using AES-256-GCM.

## 📁 5. File Uploads & Asset Handling
- [ ] **Restrict file uploads / Secure file uploads**: Validate MIME types using magic bytes (not just file extension), restrict allowed extensions, enforce maximum file size limits, and store uploaded files outside public execution directories (or on isolated object storage like S3/R2).
- [ ] **Prevent executable uploads**: Block `.exe`, `.sh`, `.php`, `.svg` (if scriptable), or HTML file uploads in user content.

## 🌐 6. Network, API & Production Hardening
- [ ] **Trim API responses**: Avoid returning full database rows; serialize and return only fields the current client needs to prevent accidental PII leakage.
- [ ] **Add security headers**:
  - `Content-Security-Policy` (CSP)
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY` (or `SAMEORIGIN`)
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy`
- [ ] **Restrict CORS**: Never use `Access-Control-Allow-Origin: *` with credentials; restrict allowed origins to trusted domains.
- [ ] **Force HTTPS**: Ensure all HTTP traffic automatically redirects to HTTPS.
- [ ] **Disable production debug mode**: Turn off verbose stack traces, dev tools, and debug banners in production builds.
- [ ] **Hide detailed errors**: Return generic, helpful error messages to clients; log stack traces privately server-side.
- [ ] **Scan dependencies**: Periodically run `npm audit` / `snyk` / Dependabot to catch vulnerable packages.
- [ ] **Test as an untrusted user**: Conduct smoke tests without authentication or with low privileges to verify boundary enforcement.
