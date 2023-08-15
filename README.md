# Publish Devcontainer Feature

💻 Publish a **single** Devcontainer Feature

<div align="center">

<!-- TODO: Better header image -->
![](https://picsum.photos/600/400)

</div>

<!-- TODO: Add emoji bullet points -->

## Usage

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

```jsonc
// devcontainer.json
{
  "features": {
    "ghcr.io/octocat/my-feature": {}
  }
}
```

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
      - uses: docker/login-action@v2
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.MY_FATURES_GITHUB_TOKEN }}
      - uses: devcontainers-community/publish-feature@v1
        with:
          # The '*' will be replaced with 'id' from 'devcontainer-feature.json'.
          image: ghcr.io/octocat/my-features/*
```

```jsonc
// devcontainer.json
{
  "features": {
    "ghcr.io/octocat/my-features/my-feature": {}
  }
}
```

### Inputs

<!-- TODO: Describe inputs -->

## Development

<!-- TODO: Provide development blurb -->
