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

## Contact form behavior

The `SITE.formEndpoint` value is currently empty. In this state, the form validates the inquiry locally and prepares a `mailto:` draft; it does **not** send or store form submissions. Visitors must review and send the email themselves.

To enable automatic submissions, configure a trusted HTTPS endpoint that accepts the JSON payload sent by the form and returns a successful HTTP response. The endpoint should implement server-side validation, spam protection, rate limiting, and appropriate privacy/data-retention practices. Do not put API keys or email-provider secrets in this static HTML file. After configuring the endpoint, update the form's success/failure copy and test an end-to-end submission before publishing.

## SEO and indexing

`robots.txt`, `sitemap.xml`, the canonical URL, social metadata and Organization structured data use `https://www.airnoxaetechnologies.com/`. Update these together if the primary domain changes. Keep public business details accurate and do not add unverified social profiles or customer claims.

## Quality checks

Before merging website changes:

1. Check the Vercel preview deployment.
2. Test desktop and mobile navigation and layout.
3. Test project filters and project detail dialogs.
4. Test the three-step inquiry form, including the email-draft fallback.
5. Check keyboard navigation and `prefers-reduced-motion` behavior.
6. Confirm the Vercel deployment status is successful after merge.
