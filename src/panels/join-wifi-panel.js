import qr from 'qr';
import * as z from 'zod';
import {
	Panel
} from './panel.js';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function renderWifiQrCode ({
	ssid,
	encryption,
	password,
	hidden = false
})
{
	const escape = value => value.replace(/(["';,\\])/g, '\\$1');

	return qr(`WIFI:S:${ escape(ssid) };T:${encryption};P:${ escape(password) };H:${hidden}`, 'svg', {
		ecc      : 'low',
		encoding : 'byte',
		version  : 5,
		mask     : 0,
		border   : 0,
		scale    : 8
	});
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default class JoinWifiPanel extends Panel
{
	static Schema = z.object({
		message    : z.string().optional(),
		ssid       : z.string(),
		password   : z.string(),
		hidden     : z.boolean().default(false),
		encryption : z.literal([
			'WEP',
			'WPA'
		])
	});

	#network = null;
	#message = null;

	async init (settings)
	{
		const {
			message, ...network
		} = JoinWifiPanel.Schema.parse(settings);

		this.#message = message;
		this.#network = network;
	}

	async render ()
	{
		const html = `<div class="layout layout--col join-wifi-panel">
			<style>
				.join-wifi-panel__qr-code {
					display: block;
					width: 35%;
					height: auto;
				}
				.join-wifi-panel__message {
					margin-top: 10px;
				}
			</style>
			<div class="join-wifi-panel__qr-code">
				${ renderWifiQrCode(this.#network) }
			</div>
			${ this.#message ? `<p class="label text--black join-wifi-panel__message">
				${ this.#message }
			</p>` : '' }
		</div>`;

		return {
			html, error : false
		};
	}
}
