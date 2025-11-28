import {
	createHash
} from 'node:crypto';
import debug from 'debug';
import {
	problem
} from './components/problem.js';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const log = debug('home-trmnl:panel-renderer');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const components = {
	problem
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function renderErrorPanel ()
{
	const html = problem({
		message : 'An unexpected error occurred!'
	});

	return {
		html, error : true
	};
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export class PanelRenderer
{
	#panels = {};
	#cache  = {};

	constructor (panels)
	{
		this.#panels = panels;
	}

	async renderPanel (name, settings)
	{
		const hash = createHash('sha256')
			.update(
				name + '#' + JSON.stringify(settings)
			)
			.digest('hex');

		log('Rendering a `%s` panel with settings hash `%s`.', name, hash);

		let panel = this.#cache[hash];

		if (panel)
		{
			log('Panel already initialized with hash `%s`, skipping to render.', name, hash);
		}
		else
		{
			const Panel = this.#panels[name];

			if (!Panel)
			{
				log('Panel `%s` is not recognized.', name);

				return renderErrorPanel();
			}

			log('Initializing a `%s` panel with settings hash `%s`.', name, hash);

			try
			{
				panel = new Panel();

				await panel.init(settings);
			}
			catch (error)
			{
				log('A `%s` panel failed to initialize. %s', name, error);

				return renderErrorPanel();
			}

			this.#cache[hash] = panel;
		}

		try
		{
			return await panel.render({
				components
			});
		}
		catch (error)
		{
			log('A `%s` panel failed to render. %s', name, error);

			return renderErrorPanel();
		}
	}
}
