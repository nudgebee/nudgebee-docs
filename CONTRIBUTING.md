# Contributing to NudgeBee Documentation

Thanks for your interest in improving the NudgeBee docs! This repository
hosts the source for [docs.nudgebee.com](https://docs.nudgebee.com),
built with [Docusaurus](https://docusaurus.io/).

## Ways to contribute

- Fix a typo, broken link, or factual error
- Clarify confusing wording, add missing context, or improve examples
- Add or update documentation for a NudgeBee feature
- File an issue describing a docs gap or suggestion

## Local development

```bash
git clone https://github.com/nudgebee/nudgebee-docs.git
cd nudgebee-docs/doc-server
npm install --legacy-peer-deps
npm start
```

The site will be available at `http://localhost:4000`. Edits to
markdown files under `doc-server/docs/` reload automatically.

Before opening a pull request:

```bash
npm run build   # confirm the site builds
npm run lint    # confirm lint passes
```

## Submitting a change

1. Fork the repo and create a feature branch off `main`.
2. Make your change. Keep PRs focused — one logical change per PR.
3. Sign off your commits (see DCO below).
4. Open a pull request against `main`. Fill in the PR template.

We use [conventional commit](https://www.conventionalcommits.org/)
prefixes (`docs:`, `fix:`, `feat:`, `chore:`, etc.) for PR titles —
match the style you see in recent merged commits.

## Developer Certificate of Origin (DCO)

To keep contribution provenance clear, every commit must be signed off
under the [Developer Certificate of Origin 1.1](https://developercertificate.org).

Signing off is a one-line statement that you wrote the change (or have
the right to submit it) and agree to it being licensed under the
project's license (Apache 2.0). Add it automatically with `git commit -s`:

```bash
git commit -s -m "docs: fix typo in installation guide"
```

This appends a line like:

```
Signed-off-by: Jane Doe <jane@example.com>
```

If you forgot to sign off, amend the most recent commit:

```bash
git commit --amend -s --no-edit
```

Or for older commits, rebase with sign-off:

```bash
git rebase --signoff main
```

The full DCO text is reproduced below for reference:

> By making a contribution to this project, I certify that:
>
> (a) The contribution was created in whole or in part by me and I have
>     the right to submit it under the open source license indicated in
>     the file; or
>
> (b) The contribution is based upon previous work that, to the best of
>     my knowledge, is covered under an appropriate open source license
>     and I have the right under that license to submit that work with
>     modifications, whether created in whole or in part by me, under
>     the same open source license (unless I am permitted to submit
>     under a different license), as indicated in the file; or
>
> (c) The contribution was provided directly to me by some other person
>     who certified (a), (b) or (c) and I have not modified it.
>
> (d) I understand and agree that this project and the contribution are
>     public and that a record of the contribution (including all
>     personal information I submit with it, including my sign-off) is
>     maintained indefinitely and may be redistributed consistent with
>     this project or the open source license(s) involved.

## Reporting issues

For documentation issues, open a GitHub issue using the appropriate
template. For security vulnerabilities, please follow the private
disclosure process in [SECURITY.md](./SECURITY.md) — do **not** file a
public issue.

## Code of Conduct

By participating in this project you agree to abide by the
[Code of Conduct](./CODE_OF_CONDUCT.md).
