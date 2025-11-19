import {
	posix
} from 'node:path';
import debug from 'debug';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const log = debug('home-trmnl:firmware-repository');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const CacheAge = 21600000;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export class FirmwareRepository
{
	#cache       = null;
	#trmnlApiUri = null;

	constructor ({
		trmnlApiUri
	})
	{
		this.#trmnlApiUri = trmnlApiUri;
	}

	async getLatestFirmware ()
	{
		const checkedAt = Date.now();

		if (
			this.#cache && this.#cache.checkedAt + CacheAge > checkedAt
		)
		{
			log('Using firmware definition from cache.');

			const {
				url,
				version
			} = this.#cache;

			return { url, version };
		}

		const response = await fetch(
			posix.join(this.#trmnlApiUri, 'firmware/latest')
		);

		if (!response.ok)
		{
			log('Failed to retrieve latest firmware location from %s. Received status code %s.', null, null);

			return null;
		}

		const {
			url,
			version
		} = await response.json();

		log('Discovered latest firmware version: %s (v%s).', url, version);

		const firmware = {
			url,
			version,
			checkedAt
		};

		this.#cache = firmware;

		return firmware;
	}
}
