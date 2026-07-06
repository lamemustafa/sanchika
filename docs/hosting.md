# Hosting

Sanchika V0 hosting is a static gallery/docs deployment. It must not add a
backend, account system, telemetry, database, or consumer app runtime.

## GitHub Pages

`.github/workflows/pages.yml` deploys the openable gallery artifact from
`dist/gallery` to GitHub Pages when a maintainer runs `workflow_dispatch` from
`master`. Manual runs from non-`master` refs are ignored by the deploy job.
Automatic `master` deployment should be added only after GitHub Pages is enabled
and the first manual deploy succeeds.

The workflow:

- installs dependencies with `pnpm install --frozen-lockfile --ignore-scripts`;
- runs `pnpm build`;
- runs `pnpm gallery:build`;
- runs `pnpm gallery:check`;
- uploads `dist/gallery` with `actions/upload-pages-artifact`;
- deploys with `actions/deploy-pages`.

All action references are pinned to full commit SHAs. The workflow requests only
the permissions needed for Pages deployment: `contents: read`, `pages: write`,
and `id-token: write`. It is manual-only, deploys only from `master`, does not
run on pull requests, and does not publish npm packages.

## Pages Smoke Check

`.github/workflows/pages-smoke.yml` runs on a daily schedule and by
`workflow_dispatch`. It is read-only, runs only from `master`, and executes
`node scripts/check-pages-smoke.mjs` to confirm
`https://sanchika.complyeaze.com/` returns the expected Sanchika Primitive
Gallery HTML. The same check is available locally as
`pnpm pages:smoke`. It does not build, deploy, upload artifacts, or publish
packages.

## Custom Domain

The preferred long-term public host is `sanchika.complyeaze.com`. Do not add a
`CNAME` file for the current GitHub Actions Pages deployment. GitHub Pages
custom-workflow publishing does not create a repository `CNAME` file, and an
existing `CNAME` file is ignored for this publishing mode.

Before enabling the custom domain:

1. Merge the Pages workflow.
2. Enable GitHub Pages with GitHub Actions as the source.
3. Verify the `complyeaze.com` domain in GitHub if that account-level
   verification is not already complete.
4. Add the `sanchika.complyeaze.com` custom domain in repository Pages settings.
5. Configure DNS:
   `sanchika.complyeaze.com. CNAME lamemustafa.github.io.`
6. Run `pnpm hosting:domain:check` and confirm it passes.
7. Keep HTTPS enforced after GitHub provisions the certificate.
8. Run the Pages workflow manually and confirm the custom-domain URL.
9. Keep `SANCHIKA_PAGES_URL` in `.github/workflows/pages-smoke.yml` pointed at
   the custom-domain URL after HTTPS is enforced. The `github.io` URL remains a
   useful fallback for debugging direct GitHub Pages hosting.

The custom domain is the authoritative Sanchika host. Parent-hosted references
such as `tools.complyeaze.com/sanchika/` remain mirrors, not the authoritative
Sanchika host.
