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
	function clamp (value)
	{
		if (value < 0)
		{
			return 0;
		}

		return value > 255 ? 255 : value;
	}

	const {
		data
	} = await sharp(buffer)
		.resize(width, height)
		.greyscale()
		.raw()
		.toBuffer({
			resolveWithObject : true
		});

	const dithered = new Float32Array(data);

	// Apply Floyd Steinberg Dither.
	for (let y = 0; y < height; y++)
	{
		for (let x = 0; x < width; x++)
		{
			const index    = (y * width) + x;
			const oldPixel = dithered[index];
			const newPixel = oldPixel < 128 ? 0 : 255;
			const error    = oldPixel - newPixel;

			dithered[index] = newPixel;

			if (x + 1 < width)
			{
				const pos = index + 1;
				dithered[pos] = clamp(dithered[pos] + (error * (7 / 16)));
			}

			if (y + 1 < height && x - 1 >= 0)
			{
				const pos = index + width - 1;
				dithered[pos] = clamp(dithered[pos] + (error * (3 / 16)));
			}

			if (y + 1 < height)
			{
				const pos = index + width;
				dithered[pos] = clamp(dithered[pos] + (error * (5 / 16)));
			}

			if (y + 1 < height && x + 1 < width)
			{
				const pos = index + width + 1;
				dithered[pos] = clamp(dithered[pos] + (error * (1 / 16)));
			}
		}
	}

	await sharp(Uint8Array.from(dithered), {
		raw : { width, height, channels : 1 }
	})
		.toColourspace('b-w')
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
