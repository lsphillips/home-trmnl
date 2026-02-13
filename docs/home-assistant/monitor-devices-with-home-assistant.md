# Monitor devices with Home Assistant

You can monitor your TRMNL devices managed by Home TRMNL from [Home Assistant](https://www.home-assistant.io/) using the [RESTful](https://www.home-assistant.io/integrations/rest/) integration to consume the admin device status endpoint.

## Prerequisites

Firstly, create, and take not of, an API key that you want Home Assistant to use in your Home TRMNL configuration file:

``` yaml
settings:
  adminApiKeys:
    - "{adminApiKey}"
```

Secondly take note of MAC addresses for the TRMNL devices that you want to monitor in Home Assistant.

## The device status endpoint

The admin endpoint you will be consuming is:

```
GET /admin/{address}/status
```

Where `{address}` is the MAC address of the device. This endpoint requires a Bearer token in the `Authorization` header, which must be one of your configured admin API keys.

This API endpoint has a response body that will look something like this:

``` json
{
  "address" : "8A:3F:CD:91:7B:E4",
  "model" : "TRMNL_2024",
  "firmware" : "1.0.5",
  "battery" : 85,
  "rssi" : -65,
  "healthy" : true
}
```

| Field      | Type    | Nullable | Description                                                    |
| ---------- | ------- | :------: | -------------------------------------------------------------- |
| `address`  | String  | No       | The MAC address of the device.                                 |
| `model`    | String  | Yes      | The model of the device.                                       |
| `firmware` | String  | Yes      | The firmware version running on the device.                    |
| `battery`  | Number  | No       | The battery level of the device as a percentage (0 - 100).     |
| `rssi`     | Number  | No       | The WiFi signal strength reported by the device in dBm.        |
| `healthy`  | Boolean | No       | Whether the device is healthy, i.e. free from any problems.    |

## Configuration

You can configure sensors using the RESTful integration in your Home Assistant `configuration.yaml` file. All examples in this guide assume the Home TRMNL server is available at `http://home-trmnl.local:1992`, please update appropriately.

> [!TIP]
> After updating `configuration.yaml` make sure to restart Home Assistant to pick up theses new sensors.

### Monitoring Battery

You can create a sensor that reports the battery level of the device as a percentage:

``` yaml
rest:
  - resource: http://home-trmnl.local:1992/admin/{deviceMacAddress}/status
    scan_interval: 1800
    headers:
      Authorization: "Bearer {adminApiKey}"
    sensor:
      - name: "My TRMNL Battery"
        device_class: battery
        unit_of_measurement: "%"
        value_template: "{{ value_json.battery }}"
        json_attributes:
          - address
          - model
          - firmware
```

> [!NOTE]
> Sensors can have attributes configured. This example demonstrates how we attach device metadata like the MAC address, model and firmware version to the sensor for extra utility.

### Monitoring WiFi Signal Strength (RSSI)

You can create a sensor that reports the WiFi signal strength of the device in dBm:

``` yaml
rest:
  - resource: http://home-trmnl.local:1992/admin/{deviceMacAddress}/status
    scan_interval: 1800
    headers:
      Authorization: "Bearer {adminApiKey}"
    sensor:
      - name: "My TRMNL Signal Strength"
        device_class: signal_strength
        unit_of_measurement: "dBm"
        value_template: "{{ value_json.rssi }}"
        json_attributes:
          - address
          - model
          - firmware
```

### Monitoring Problem Status

You can create a binary sensor that turns on when the device is unhealthy:

``` yaml
rest:
  - resource: http://home-trmnl.local:1992/admin/{deviceMacAddress}/status
    scan_interval: 1800
    headers:
      Authorization: "Bearer {adminApiKey}"
    binary_sensor:
      - name: "My TRMNL Problem Status"
        device_class: problem
        value_template: "{{ not value_json.healthy }}"
```

> [!NOTE]
> Binary Sensors, unfortunately, can't have attributes configured using the RESTful integration.
