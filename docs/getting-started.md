# Getting Started

This guide will help you install and configure Home TRMNL to manage your TRMNL devices.

## Installation

Home TRMNL is only available as a Docker image, so you will need [Docker](https://www.docker.com/) installed, or an alternative like [Podman](https://podman.io/).

To run the server, you need to mount a directory containing your configuration file to the `/data` volume:

``` bash
docker run -p 1992:1992 -v /path/to/your/config:/data ghcr.io/lsphillips/home-trmnl-server:latest
```

The server listens on port `1992`. Make sure your configuration directory contains a `config.yaml` file.

## Creating a Configuration File

The configuration file is a YAML file that defines your server settings and devices. Create a file named `config.yaml` in your mounted data directory.

### Settings

The `settings` object contains general server configuration:

``` yaml
settings:
  screenImagePath: screens
  referenceImagePath: references
  adminApiKeys:
    - "your-admin-api-key-here"
```

| Property             | Required  | Default     | Description                                                                                                                                |
| -------------------- | :-------: | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `screenImagePath`    | No        | `./screens` | The path to the directory where screen images are rendered and served from. Resolved relative to the configuration file.                   |
| `referenceImagePath` | No        | `./uploads` | The path to the directory where reference screen images are written to. Resolved relative to the configuration file.                       |
| `adminApiKeys`       | Yes       | -           | A collection of API keys that grant access to the admin API. At least one key must be configured, each key must be at least 16 characters. |

### Devices

The `devices` array defines the TRMNL devices that the server will manage.

``` yaml
devices:
  - id: living-room
    address: XX:XX:XX:XX:XX:XX
    key: LIVING-ROOM-DEVICE-KEY
    autoUpdate: true
    bitDepth: 2
    screens: []
```

| Property     | Required | Default | Description                                                                                         |
| ------------ | :------: | ------- | --------------------------------------------------------------------------------------------------- |
| `id`         | Yes      | -       | A friendly ID for the device.                                                                       |
| `address`    | Yes      | -       | The MAC address of the device.                                                                      |
| `key`        | Yes      | -       | The API key for the device to authenticate with the server. Must be at least 16 characters.         |
| `autoUpdate` | No       | `true`  | Whether the device should receive firmware updates from the server when available.                  |
| `bitDepth`   | No       | `1`     | The bit depth that the device supports, which determines the number of colors in the screen images. |
| `screens`    | Yes      | -       | The collection of screens for the device. See the screens and panels guide for more details.        |

## Onboarding a Device

Follow these steps to connect a new TRMNL device to your Home TRMNL server:

### 1. Get the MAC Address

During the initial setup of your TRMNL device, you will be shown the device's MAC address. Make note of this address as you will need it to register the device.

### 2. Register the Device

Add a new entry to the `devices` array in your `config.yaml` file:

``` yaml
devices:
  - id: my-new-device
    # Replace with your device's MAC address.
    address: XX:XX:XX:XX:XX:XX
    # Generate a unique key.
    key: YOUR-DEVICE-KEY-HERE
    screens: []
```

After updating the configuration, restart the server for the changes to take effect.

### 3. Complete Device Setup

With your device registered, you can now complete the setup process by configuring the server endpoint on the device. Follow the official TRMNL guide for connecting your device to a BYOS (Bring Your Own Server) setup: https://help.trmnl.com/en/articles/12263392-connect-your-device-to-terminus-byos

## Further Reading

- [Configuring Screens](./configuring-screens.md)
- [Monitoring Devices with Home Assistant](./home-assistant/monitor-devices-with-home-assistant.md)
- [Integrating with TRMNL HA](./home-assistant/integrating-with-trmnl-ha.md)
