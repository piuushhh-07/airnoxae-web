# AIRNOXAE TECHNOLOGIES website

The public AIRNOXAE TECHNOLOGIES website is a lightweight, single-page static site. It uses plain HTML, CSS and JavaScript; there is no build step or frontend framework.

## Local preview

From the repository root, run a static server:

```bash
python -m http.server 8000
```

Then open <http://localhost:8000>.

## Deployments

The `main` branch is connected to Vercel. Pull requests receive preview deployments; merging to `main` triggers the production deployment.

## Brand assets

- `assets/wordmark.png` — horizontal wordmark
- `assets/symbol.png` — brand symbol
- `assets/vertical-logo.png` — stacked logo

The site palette is based on deep navy `#080D1B`, panel navy `#10182B`, blue `#2563EB`, cyan `#38BDF8`, off-white `#F8FAFC` and slate `#94A3B8`.

## Updating site content

Most content and configuration live near the top of the inline script in `index.html`:

- `SITE` contains the public email, phone, location, social links and optional form endpoint.
- `SERVICES` controls the service cards and project-type options.
- `PROJECTS` controls the portfolio. Only add projects with verified descriptions and repository or live-demo URLs. Keep the stage label accurate; do not imply a prototype is a delivered client project.
- `INDUSTRIES`, `WHY` and `STEPS` control the corresponding sections.

Keep the project discovery indexes aligned with the order of `SERVICES` when editing the service list.

## Contact form delivery

The contact form posts to the same-origin Vercel Function at `/api/contact`. The function validates submissions, checks the honeypot field, applies a small per-instance rate limit, and sends enquiries through Resend. The visitor's email address is used as the reply-to address; the recipient is `info@airnoxaetechnologies.com` by default.

Configure these environment variables in Vercel (Production and Preview as appropriate):

- `RESEND_API_KEY` — secret API key from Resend.
- `RESEND_FROM_EMAIL` — sender address on a domain verified in Resend, for example `AIRNOXAE Website <website@your-verified-domain.com>`.
- `CONTACT_TO_EMAIL` — optional destination; defaults to `info@airnoxaetechnologies.com`.

Redeploy after adding or changing environment variables. Never put these values in `index.html` or commit them to Git. Until the variables are configured, or if delivery fails, the form falls back to a prepared email draft. The endpoint does not persist submissions. Its in-memory rate limit is best-effort per serverless instance; add a shared rate-limit store or edge protection before high-volume public campaigns. Test a real submission end-to-end after configuration.

## SEO and indexing

`robots.txt`, `sitemap.xml`, the canonical URL, social metadata and Organization structured data use `https://www.airnoxaetechnologies.com/`. Update these together if the primary domain changes. Keep public business details accurate and do not add unverified social profiles or customer claims.

## Quality checks

Before merging website changes:

1. Check the Vercel preview deployment.
2. Test desktop and mobile navigation and layout.
3. Test project filters and project detail dialogs.
4. Test the one-step inquiry form, including successful server delivery and the email-draft fallback.
5. Check keyboard navigation and `prefers-reduced-motion` behavior.
6. Confirm the Vercel deployment status is successful after merge.
