# Integrating with TRMNL HA

[TRMNL HA](https://github.com/usetrmnl/trmnl-home-assistant) is a Home Assistant add-on that captures dashboard screenshots and pushes them to servers like Home TRMNL.

## Prerequisites

First make sure TRMNL HA is installed and configured in Home Assistant. See the [TRMNL HA documentation](https://github.com/usetrmnl/trmnl-home-assistant) for installation instructions.

## Configuring the Webhook in TRMNL HA

TRMNL HA supports pushing screenshots to external endpoints via webhooks. Configure it to use the **Raw Image** webhook format and set the URL to:

```
http://home-trmnl.local:1992/admin/screens/{name}
```

Where `{name}` is the name of the image that will be referenced by a Home TRMNL screen. Each schedule should use a different name.

> [!TIP]
> Home TRMNL does **not** process the uploaded images in any way. This means the screenshot settings in TRMNL HA must generate an image that is compatible with the device(s) referencing it. For consistency it's recommended to use **Floyd-Steinberg** dithering, as that is what Home TRMNL uses.

## Configuring the Screen in Home TRMNL

> [!CAUTION]
> Make sure you do this after you have configured a schedule that sends to Home TRMNL!

In your Home TRMNL `config.yaml` file, add a `referenced` screen to the device that will display the Home Assistant dashboard. The `image` name you choose here must match the name used in the webhook URL you configure in TRMNL HA.

For example, to display a dashboard screenshot named `my-trmnl-dashboard`, the screen configuration would look like this:

``` yaml
- type: referenced
  image: my-trmnl-dashboard
  duration: 300
```
