# Hosting

Sanchika V0 hosting is a static gallery/docs deployment. It must not add a
backend, account system, telemetry, database, or consumer app runtime.

## GitHub Pages

`.github/workflows/pages.yml` deploys the openable gallery artifact from
`dist/gallery` to GitHub Pages from `master`. It runs automatically on scoped
`master` pushes that can affect the gallery artifact, and it can still be run
manually with `workflow_dispatch`. Manual runs from non-`master` refs are
ignored by the deploy job.

The workflow:

- installs dependencies with `pnpm install --frozen-lockfile --ignore-scripts`;
- runs `pnpm build`;
- runs `pnpm gallery:build`;
- runs `pnpm gallery:check`;
- uploads `dist/gallery` with `actions/upload-pages-artifact`;
- deploys with `actions/deploy-pages`.

All action references are pinned to full commit SHAs. The workflow requests only
the permissions needed for Pages deployment: `contents: read`, `pages: write`,
and `id-token: write`. It deploys only from `master`, does not run on pull
requests, and does not publish npm packages.

## Pages Smoke Check

`.github/workflows/pages-smoke.yml` runs on a daily schedule and by
`workflow_dispatch`. It is read-only, runs only from `master`, and executes
`node scripts/check-pages-smoke.mjs` to confirm
`https://sanchika.complyeaze.com/` returns the expected Sanchika Primitive
Gallery HTML, including the current evidence-workbench hero. The same check is
available locally as `pnpm pages:smoke`. It does not build, deploy, upload
artifacts, or publish packages.

## Custom Domain

The authoritative public host is `sanchika.complyeaze.com`. It is served by
GitHub Pages, and DNS should continue to resolve as:
`sanchika.complyeaze.com. CNAME lamemustafa.github.io.`

Do not add a `CNAME` file for the current GitHub Actions Pages deployment.
GitHub Pages custom-workflow publishing does not create a repository `CNAME`
file, and an existing `CNAME` file is ignored for this publishing mode.

Ongoing live-host checks:

1. Keep GitHub Pages enabled with GitHub Actions as the source.
2. Keep the `sanchika.complyeaze.com` custom domain configured in repository
   Pages settings.
3. Keep HTTPS enforced after GitHub provisions or renews the certificate.
4. Run `pnpm hosting:domain:check` to confirm DNS still points to
   `lamemustafa.github.io`.
5. Run `pnpm pages:smoke` to confirm the custom-domain URL serves the expected
   gallery HTML.
6. Keep `SANCHIKA_PAGES_URL` in `.github/workflows/pages-smoke.yml` pointed at
   `https://sanchika.complyeaze.com/`. The `github.io` URL remains a useful
   fallback for debugging direct GitHub Pages hosting, not the canonical public
   host.

The custom domain is the authoritative Sanchika host. Parent-hosted references
such as `tools.complyeaze.com/sanchika/` remain mirrors, not the authoritative
Sanchika host.
