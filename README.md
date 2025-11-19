# Home TRMNL

A home-made [TRMNL](https://usetrmnl.com/) server that is solely driven by a single configuration file.

## Getting Started

The server is available as a Docker image, which you can run like so:

``` bash
docker run -p 1992:1992 -v ./example:/data ghcr.io/lsphillips/home-trmnl
```

### Port

The container exposes port `1992`.

### Volumes

The container has the following volume mounts:

- `data`\
  This is where you should place your `config.yaml` file, please see [configuration](#configuration).

### Configuration

The configuration file is a [YAML](https://yaml.org/) file, please reference the [config.exmaple.yaml](./config.example.yaml) for the available structure.

## Local Development

> [!NOTE]
> You will need [Node.js](https://nodejs.org/) v24 (or higher) and [Docker](https://docs.docker.com/) installed.

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
> You can set the `HOST` environment variable if you want to run the server on an alternative host. By default it runs on `localhost`.

### Code Quality

To perform code quality checks, powered by ESLint, run this command:

``` bash
pnpm run lint
```

Please refer to the [eslint.config.js](eslint.config.js) file to familiar yourself with the rules.

### Building

To build a Docker image, run this command:

``` bash
docker build -t home-trmnl .
```
