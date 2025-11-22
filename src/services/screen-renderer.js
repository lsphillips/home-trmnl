import {
	join
} from 'node:path';
import sharp from 'sharp';
import debug from 'debug';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const log = debug('home-trmnl:screen-renderer');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export async function createTrmnlPng (buffer, path, {
	width  = 800,
	height = 480
})
{
	await sharp(buffer)
		.resize(width, height)
		.greyscale()
		.threshold(128)
		.toColourspace('b-w')
		.removeAlpha()
		.png({
			palette : false,
			colors  : 2
		})
		.toFile(path);
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export class ScreenRenderer
{
	#layoutFactory   = null;
	#panelRenderer   = null;
	#htmlRenderer    = null;
	#screenImagePath = null;

	constructor ({ screenImagePath }, {
		layoutFactory,
		panelRenderer,
		htmlRenderer
	})
	{
		this.#screenImagePath = screenImagePath;
		this.#panelRenderer   = panelRenderer;
		this.#htmlRenderer    = htmlRenderer;
		this.#layoutFactory   = layoutFactory;
	}

	async render (screen, {
		width,
		height
	})
	{
		const layout = this.#layoutFactory
			.getLayout(screen.layout);

		const panels = await Promise.all(
			screen.panels.map(p => this.#panelRenderer.renderPanel(p.name, p.settings))
		);

		log('Rendering %s x %s screen using layout `%s`.', width, height, screen.layout);

		const html = layout(
			panels.map(p => p.html)
		);

		const view = await this.#htmlRenderer.render(html, {
			width,
			height
		});

		log('Converting screen to TRMNL compliant PNG image.');

		const file = `${screen.id}.png`;

		await createTrmnlPng(view, join(this.#screenImagePath, file), {
			width,
			height
		});

		log('Finished Created screen image file `%s` that should be visible for %s second(s).', file, screen.expiresIn);

		const hash = Date.now().toString();

		return {
			html, hash, file, expiresIn : screen.expiresIn
		};
	}
}
