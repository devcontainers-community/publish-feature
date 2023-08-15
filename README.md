# Publish Dev Container Feature

💻 Publish a **single** Dev Container Feature

<p align=center>
  <img height=200 src=https://i.imgur.com/juxM8Xu.png>
</p>

1️⃣ Publishes a **single** feature instead of a whole monorepo \
🤝 Works well with [Dev Container Feature polyrepos] \
0️⃣ Zero-config; sensible defaults

👀 Check out [devcontainers-community/feature-starter] for a template feature
repo that uses this action.

## Usage

![GitHub Actions](https://img.shields.io/static/v1?style=for-the-badge&message=GitHub+Actions&color=2088FF&logo=GitHub+Actions&logoColor=FFFFFF&label=)
![GitHub](https://img.shields.io/static/v1?style=for-the-badge&message=GitHub&color=181717&logo=GitHub&logoColor=FFFFFF&label=)

To get started, just create a new GitHub Repository that has a valid
`devcontainer-feature.json` manifest file and a working `install.sh` script.
Then add this to a GitHub Workflow like `.github/workflows/publish-feature.yml`:

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
  permissions:
    contents: read
    packages: write
  publish-feature:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: devcontainers-community/publish-feature@v1
```

This will publish the Dev Container Feature to
your-username/features/id-of-your-feature and can be used like this:

```jsonc
// devcontainer.json
{
  "features": {
    "ghcr.io/octocat/my-features/my-feature": {}
  }
}
```

### Inputs

- **`path`:** Where the `devcontainer-feature.json` manifest is located. The
  default is `.`.

- **`files`:** Which files to include in the OCI published image. You can
  specify a multiline list of glob patterns to include in the package. By
  default this includes everything. The `README.md`, `LICENSE`, and
  `devcontainer-feature.json` files will always be included in the generated
  image.

- **`source`:** What to put for the `org.opencontainers.source` annotation on
  the image. This defaults to the current GitHub repository using
  `${{ github.server_url }}` and `${{ github.repository }}`.

- **`image`:** The destination image to push to. You can use a `*` which will be
  replaced by the `id` field from the `devcontainer-feature.json` that was used.
  By default this is `ghcr.io/${{ github.repository_owner }}/features/*`

- **`latest`:** A boolean flag to indicate whether or not to push to the
  `:latest` tag of the image. By default this is `true`. Set this to `false` if
  you're publishing an older version.

## Development

![Deno](https://img.shields.io/static/v1?style=for-the-badge&message=Deno&color=000000&logo=Deno&logoColor=FFFFFF&label=)

This GitHub Action is written using Deno. At some point in the future, it may be
transitioned to use plain Node.js. At present, though, we use a wrapper script
to download the self-contained `deno` binary locally and then run the `main.ts`
script.

To get started editing, fork this repo and make your changes. To test those
changes, push them to your own `main` branch or open a PR! We use GitHub
Actions-ception to test this Action using GitHub Actions.

<!-- prettier-ignore-start -->
[dev container feature polyrepos]: https://github.com/devcontainers-community/features
[devcontainers-community/feature-starter]: https://github.comm/devcontainers-community/feature-starter
<!-- prettier-ignore-end -->
