# Home TRMNL

> [!IMPORTANT]
> This is still a tinkerer's project, still in its infancy and being developed primarily for my needs. Use at your own risk.

A home-made [TRMNL](https://usetrmnl.com/) server that is solely driven by a single configuration file.

## Getting Started

Please refer to the [Getting Started](./docs/getting-started.md) guide in the documentation.

## Local Development

> [!NOTE]
> You will need [Node.js](https://nodejs.org/) v24 (or higher), [PNPM](https://pnpm.io/) and [Docker](https://docs.docker.com/) installed.

### Running

First create a data directory using the `config.example.yaml` file included in this project:

``` bash
mkdir example && cp config.example.yaml example/config.yaml
```

Then ensure that logs are enabled (the server uses the `debug` library):

``` bash
export DEBUG=home-trmnl:*
```

Now you are ready to start the server that will be running on port `1992`:

``` bash
pnpm run start
```

> [!TIP]
> You can set the `HT_HOST` environment variable if you want to run the server on an alternative host. By default it runs on `localhost`.

### Code Quality

To perform code quality checks, powered by ESLint, run this command:

``` bash
pnpm run lint
```

Please refer to the [eslint.config.js](eslint.config.js) file to familiar yourself with the rules.

### Tests

To run project tests, run this command:

``` bash
pnpm test
```

> [!NOTE]
> Test coverage is still not there yet; there is only robust functionality coverage for the panels.

### Building

To build a Docker image, run this command:

``` bash
docker build -t home-trmnl-server .
```
