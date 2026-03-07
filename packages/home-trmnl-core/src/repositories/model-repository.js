import debug from 'debug';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const log = debug('home-trmnl:core:model-repository');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function mapEntryToModel (entry)
{
	let name        = entry['label'],
	    rotation    = entry['rotation'],
	    width       = entry['width'],
	    height      = entry['height'],
	    bitDepth    = entry['bit_depth'],
	    css         = entry['css'],
		styles      = [],
		orientation = 'landscape';

	if (css)
	{
		styles = [
			entry['css']['classes']['device'],
			entry['css']['classes']['size']
		];
	}

	// This means that the device is a native portrait
	// device, however the API returns the height and
	// width as though the device was in portrait.
	if (
		(rotation / 90) % 2 === 1
	)
	{
		orientation = 'portrait';

		// Swap.
		[width, height] = [height, width];
	}

	return {
		name,
		width,
		height,
		orientation,
		bitDepth,
		styles
	};
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export class ModelRepository
{
	#models      = null;
	#trmnlApiUri = null;

	constructor ({
		trmnlApiUri
	})
	{
		this.#trmnlApiUri = trmnlApiUri.replace(/\/$/, '');
	}

	async getDeviceModel (name)
	{
		if (!this.#models)
		{
			const endpoint = this.#trmnlApiUri + '/models';

			log('No models are in memory, loading models from %s.', endpoint);

			const response = await fetch(endpoint);

			if (!response.ok)
			{
				log('Failed to retrieve supported model list from %s. Received status code %s.', endpoint, response.status);

				return null;
			}

			const {
				data
			} = await response.json();

			this.#models = data.map(entry => mapEntryToModel(entry));
		}

		return this.#models.find(model => model.name === name) || null;
	}
}
