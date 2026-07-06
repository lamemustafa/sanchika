# Hosting

Sanchika V0 hosting is a static gallery/docs deployment. It must not add a
backend, account system, telemetry, database, or consumer app runtime.

## GitHub Pages

`.github/workflows/pages.yml` deploys the openable gallery artifact from
`dist/gallery` to GitHub Pages when a maintainer runs `workflow_dispatch`.
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
and `id-token: write`. It does not run on pull requests and does not publish npm
packages.

## Custom Domain

The preferred long-term public host is `sanchika.complyeaze.com`. Do not add a
`CNAME` file until the domain and DNS are configured in GitHub Pages.

Before enabling the custom domain:

1. Merge the Pages workflow.
2. Enable GitHub Pages with GitHub Actions as the source.
3. Add the `sanchika.complyeaze.com` custom domain in repository Pages settings.
4. Configure the required DNS records for GitHub Pages.
5. Run the Pages workflow manually and confirm the generated Pages URL.
6. Add `dist/gallery/CNAME` generation or another reviewed CNAME step only after
   GitHub confirms the custom domain.

Until that domain is active, parent-hosted references such as
`tools.complyeaze.com/sanchika/` remain mirrors, not the authoritative Sanchika
host.
