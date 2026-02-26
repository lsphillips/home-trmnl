import {
	posix
} from 'node:path';
import debug from 'debug';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const log = debug('home-trmnl:core:model-repository');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export class Model
{
	#name     = null;
	#height   = 0;
	#width    = 0;
	#bitDepth = 0;
	#rotation = 0;
	#styles   = [];

	constructor ({
		name,
		height,
		width,
		bitDepth,
		rotation,
		styles
	})
	{
		this.#name     = name;
		this.#height   = height;
		this.#width    = width;
		this.#bitDepth = bitDepth;
		this.#rotation = rotation;
		this.#styles   = styles;
	}

	get name ()
	{
		return this.#name;
	}

	get height ()
	{
		return this.landscape ? this.#height : this.#width;
	}

	get width ()
	{
		return this.landscape ? this.#width : this.#height;
	}

	get bitDepth ()
	{
		return this.#bitDepth;
	}

	get landscape ()
	{
		return (this.#rotation / 90) % 2 === 1;
	}

	get styles ()
	{
		return this.#styles;
	}
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
		this.#trmnlApiUri = trmnlApiUri;
	}

	async getDeviceModel (name)
	{
		if (!this.#models)
		{
			const endpoint = posix.join(this.#trmnlApiUri, 'models');

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

			this.#models = data.map(model => new Model({
				name     : model['label'],
				rotation : model['rotation'],
				width    : model['width'],
				height   : model['height'],
				bitDepth : model['bit_depth'],
				styles   : model.css ? [
					model['css']['classes']['device'],
					model['css']['classes']['size']
				] : []
			}));
		}

		return this.#models.find(model => model.name === name) || null;
	}
}
