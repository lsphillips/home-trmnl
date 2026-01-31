import {
	describe,
	it
} from 'node:test';
import assert from 'node:assert';
import {
	renderPanel,
	checkPanelConfig
} from './support/panel-utilities.js';
import JoinWifiPanelObject from './panel-objects/join-wifi-panel-object.js';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

import JoinWifi from '../src/panels/join-wifi.js';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function parseWifiConnectionString (string)
{
	if (
		!string.startsWith('WIFI:')
	)
	{
		throw new Error(`Provided connection string "${string}" is not valid, it does not start with the "WIFI" scheme.`);
	}

	const result = {};

	for (
		const [, key, value] of string.slice(5).matchAll(/([A-Z]):((?:\\.|[^;])*)/g)
	)
	{
		if (key !== 'S' && key !== 'T' && key !== 'P' && key !== 'H' && key !== 'E')
		{
			throw new Error(`Provided connection string "${string}" is not valid, it has a part with an invalid key "${key}".`);
		}

		if (
			typeof result[key] !== 'undefined'
		)
		{
			throw new Error(`Provided connection string "${string}" is not valid, the key "${key}" appears more than once.`);
		}

		result[key] = value;
	}

	return result;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

describe('The Join Wifi Panel', function ()
{
	describe('shall provide a configuration schema', function ()
	{
		it('that can parse a valid configuration object', function ()
		{
			// Act & Assert.
			assert.doesNotThrow(() => checkPanelConfig(JoinWifi, {
				ssid       : 'ssid',
				password   : 'password',
				encryption : 'WPA',
				hidden     : true,
				message    : 'Join our Guest WiFi network'
			}));
		});

		it('that can still parse a configuration object without a message provided', function ()
		{
			// Act.
			const config = checkPanelConfig(JoinWifi, {
				ssid       : 'ssid',
				password   : 'password',
				encryption : 'WPA',
				hidden     : true
			});

			// Assert.
			assert.strictEqual(typeof config.message, 'undefined');
		});

		it('that can still parse a configuration object without its hidden status configured, it will default to `false`', function ()
		{
			// Act.
			const config = checkPanelConfig(JoinWifi, {
				ssid       : 'ssid',
				password   : 'password',
				encryption : 'WPA',
				message    : 'Join our Guest WiFi network'
			});

			// Assert.
			assert.strictEqual(config.hidden, false);
		});

		it('that cannot parse a configuration object without a valid SSID', function ()
		{
			// Act & Assert (with nothing).
			assert.throws(() => checkPanelConfig(JoinWifi, {
				password   : 'password',
				encryption : 'WPA',
				hidden     : false,
				message    : 'Join our Guest WiFi network'
			}));

			// Act & Assert (with no string).
			assert.throws(() => checkPanelConfig(JoinWifi, {
				ssid       : 1992,
				password   : 'password',
				encryption : 'WPA',
				hidden     : false,
				message    : 'Join our Guest WiFi network'
			}));

			// Act & Assert (with null)
			assert.throws(() => checkPanelConfig(JoinWifi, {
				ssid       : null,
				password   : 'password',
				encryption : 'WPA',
				hidden     : false,
				message    : 'Join our Guest WiFi network'
			}));
		});

		it('that cannot parse a configuration object without a valid password', function ()
		{
			// Act & Assert (with nothing).
			assert.throws(() => checkPanelConfig(JoinWifi, {
				ssid       : 'ssid',
				encryption : 'WPA',
				hidden     : false,
				message    : 'Join our Guest WiFi network'
			}));

			// Act & Assert (with no string).
			assert.throws(() => checkPanelConfig(JoinWifi, {
				ssid       : 'ssid',
				password   : 1992,
				encryption : 'WPA',
				hidden     : false,
				message    : 'Join our Guest WiFi network'
			}));

			// Act & Assert (with null)
			assert.throws(() => checkPanelConfig(JoinWifi, {
				ssid       : 'ssid',
				password   : null,
				encryption : 'WPA',
				hidden     : false,
				message    : 'Join our Guest WiFi network'
			}));
		});

		it('that cannot parse a configuration object without a valid encryption type configured', function ()
		{
			// Act & Assert (valid)
			['WPA', 'WEP'].forEach(encryption => assert.doesNotThrow(() => checkPanelConfig(JoinWifi, {
				encryption,
				ssid       : 'ssid',
				password   : 'password',
				hidden     : true,
				message    : 'Join our Guest WiFi network'
			})));

			// Act & Assert (invalid)
			['nopass', 'none'].forEach(encryption => assert.throws(() => checkPanelConfig(JoinWifi, {
				encryption,
				ssid       : 'ssid',
				password   : 'password',
				hidden     : true,
				message    : 'Join our Guest WiFi network'
			})));
		});
	});

	it('shall render the configured message under the QR code', async function ()
	{
		// Act.
		const panel = await renderPanel(JoinWifi, {
			ssid       : 'ssid',
            password   : 'password',
			encryption : 'WPA',
            message    : 'Join our Guest WiFi network'
		}, JoinWifiPanelObject);

		// Assert.
		assert.strictEqual(panel.getMessage(), 'Join our Guest WiFi network');
	});

	it('shall render not render any message under the QR code is a message is not configured', async function ()
	{
		// Act.
		const panel = await renderPanel(JoinWifi, {
			ssid       : 'ssid',
            password   : 'password',
			encryption : 'WPA'
		}, JoinWifiPanelObject);

		// Assert.
		assert.strictEqual(panel.getMessage(), '');
	});

	describe('shall render a QR code', function ()
	{
		it('encoding a Wifi connection string for the configured network details', async function ()
		{
			// Act.
			const panel = await renderPanel(JoinWifi, {
				ssid       : 'ssid',
				password   : 'password',
				encryption : 'WPA',
				hidden     : false
			}, JoinWifiPanelObject);

			const connection = parseWifiConnectionString(
				await panel.getWifiConnectionString()
			);

			// Assert.
			assert.strictEqual(connection.S, 'ssid');
			assert.strictEqual(connection.T, 'WPA');
			assert.strictEqual(connection.P, 'password');
			assert.strictEqual(connection.H, 'false');
		});

		it('encoding a Wifi connection string with passwords correctly escaped', async function ()
		{
			// Act.
			const panel = await renderPanel(JoinWifi, {
				ssid       : 'ssid',
				password   : ';\\.my,:@strange !:;+ password-:\\',
				encryption : 'WEP',
				hidden     : true
			}, JoinWifiPanelObject);

			const connection = parseWifiConnectionString(
				await panel.getWifiConnectionString()
			);

			// Assert.
			assert.strictEqual(connection.P, '\\;\\\\.my,\\:@strange !\\:\\;+ password-\\:\\\\');
		});

		it('encoding a Wifi connection string with SSID correctly escaped', async function ()
		{
			// Act.
			const panel = await renderPanel(JoinWifi, {
				ssid       : ';\\.my,:@ strange!:;+network -:\\',
				password   : 'password',
				encryption : 'WPA',
				hidden     : true
			}, JoinWifiPanelObject);

			const connection = parseWifiConnectionString(
				await panel.getWifiConnectionString()
			);

			// Assert.
			assert.strictEqual(connection.S, '\\;\\\\.my,\\:@ strange!\\:\\;+network -\\:\\\\');
		});

		it('encoding a Wifi connection string reflecting the correct hidden status', async function ()
		{
			// Act.
			const panel = await renderPanel(JoinWifi, {
				ssid       : 'ssid',
				password   : 'password',
				encryption : 'WPA',
				hidden     : true
			}, JoinWifiPanelObject);

			const connection = parseWifiConnectionString(
				await panel.getWifiConnectionString()
			);

			// Assert.
			assert.strictEqual(connection.H, 'true');
		});

		it('encoding a Wifi connection string with the configured encryption type', async function ()
		{
			// Act.
			const panel = await renderPanel(JoinWifi, {
				ssid       : 'ssid',
				password   : 'password',
				encryption : 'WEP',
				hidden     : false
			}, JoinWifiPanelObject);

			const connection = parseWifiConnectionString(
				await panel.getWifiConnectionString()
			);

			// Assert.
			assert.strictEqual(connection.T, 'WEP');
		});
	});
});
