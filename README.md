# Publish Devcontainer Feature

💻 Publish a **single** Devcontainer Feature

<div align="center">

![](https://picsum.photos/600/400)

</div>

🚝 Designed to help split monorepos \
🚀 Publishes a completely independent devcontainer feature image \
✅ Works with devcontainers without needing a feature index! \
🤝 Integrates well with [devcontainers-community/publish-collection]

## Usage

To get started, just create a new GitHub Repository that has a valid `devcontainer-feature.json` manifest file and a working `install.sh` script. Then add this to a GitHub Workflow like `.github/workflows/publish-feature.yml`:

```yml
# publish-feature.yml
name: Publish feature
on:
  release:
    types: published
  workflow_dispatch:
concurrency:
  group: ${{ github.workflow }}
  cancel-in-progress: true
jobs:
  publish-feature:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: devcontainers-community/publish-feature@v1
```

Now you can access the published Devcontainer Feature

### Inputs

- **`repository`:** The repository slug (like `octocat/my-feature`) to use for the [`org.opencontainers.source`] annotation. By default this is the current repository from `${{ github.repository }}`.

- **`image`:** Where to publish the image to. This action will assume that you've already authenticated using something like [docker/login-action]. By default this will use [GitHub Packages] and the current `${{ github.repository }}` slug. If you're publishing to a feature collection you'll need to change this.

- **`tags`:** By default this action will use the `version` field in the `devcontainer-feature.json` manifest to publish to the `N`, `N.N`, `N.N.N`, and possibly `latest` tags. The provided list should be newline-delimited.

- **`files`:** Which files (as a newline list of globs) to include in the bundled feature tarball. `.git` is **always ignored** and `devcontainer-feature.json`, `install.sh`, `README.md`, and `LICENSE` are **always included**. Use this if you need to include `lib.sh`, `actual-script.js`, or similar additional files.

