import sharp from 'sharp';
import {
	Bitmap
} from 'qr';
import decodeQR from 'qr/decode.js';
import HomeTrmnlPanelObject from './home-trmnl-panel-object.js';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

async function decodeSvgQrCode (svg)
{
	const { data, info } = await sharp(
		Buffer.from(svg)
	)
		.flatten({
			background : '#fff'
		})
		.raw()
		.toBuffer({
			resolveWithObject : true
		});

	const bitmap = new Bitmap({
		width  : info.width,
		height : info.height
	});

	bitmap.data = Array.from(
		data.map(byte => (byte < 128 ? 0 : 1))
	);

	return decodeQR(bitmap);
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default class JoinWifiPanelObject extends HomeTrmnlPanelObject
{
	getMessage ()
	{
		return this.$('.join-wifi-panel__qr-code + .join-wifi-panel__message').text().trim();
	}

	async getWifiConnectionString ()
	{
		return decodeSvgQrCode(
			this.$('.join-wifi-panel__qr-code').html()
		);
	}
}
