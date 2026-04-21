# Contributing

`main` is treated as a protected branch for `lunytales/lunytales-website`.
All changes should flow through feature branches, pull requests, and CI validation before merge.

GitHub operations for this repository are currently executed by the `menciajoel` account inside the `lunytales` repository.

## Default flow

1. Sync `main` before starting work.

```bash
git switch main
git pull --ff-only origin main
```

2. Create a branch from the latest `main`.

```bash
git switch -c feature/short-description
```

Allowed prefixes:

- `feature/` for product or UX work
- `fix/` for bugs or regressions
- `chore/` for maintenance and dependency work
- `docs/` for documentation-only changes

3. Make the change and validate locally.

```bash
npm ci
npm run build
```

4. Open a pull request to `main`.

5. Review the stable Cloudflare Pages branch preview:

```text
https://<normalized-branch>.lunytales-website.pages.dev
```

6. Merge only after `CI Checks` passes on the pull request.

## Pull request expectations

- Keep commits atomic and use professional English commit messages.
- Do not edit `dist/` manually.
- Include a short testing summary in the PR body.
- If the change touches routing, SEO, or i18n behavior, verify `/`, `/en/`, `/faq/`, `/en/faq/`, `/robots.txt`, and `/sitemap.xml`.
- If the change affects UI or copy, include the Cloudflare Pages preview URL in the PR.

## Protected main rules

- No direct pushes to `main`.
- No force-push or history rewrite on `main`.
- Treat a failing `CI Checks` run as a merge blocker.
