import {
	createHash
} from 'node:crypto';
import debug from 'debug';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const log = debug('home-trmnl:panel-renderer');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function renderErrorPanel ()
{
	const html = `<div class="error">
		<style>
			@scope
			{
				:scope
				{
					display: flex;
					height: 100%;
					flex-flow: column nowrap;
					align-items: center;
					justify-content: center;
				}

				.error__icon
				{
					display: block;
					width: 100px;
					height: 100px;
				}

				.error__message
				{
					padding: 0;
					margin: 10px 0 0;
					text-align: center;
					font-size: 16px;
				}
			}
		</style>
		<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="error__icon">
			<path stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 2H8L2 8v8l6 6h8l6-6V8zM12 8v4M12 16.02V16" />
		</svg>
		<p class="error__message">
			Error occurred! <br /> Please check your server logs.
		</p>
	</div>`;

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
			return await panel.render();
		}
		catch (error)
		{
			log('A `%s` panel failed to render. %s', name, error);

			return renderErrorPanel();
		}
	}
}
