import sharp from 'sharp';
import debug from 'debug';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const log = debug('home-trmnl:core:screen-composer');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export async function createTrmnlPng (buffer, {
	width    = 800,
	height   = 480,
	bitDepth = 1
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
	const colors   = 1 << bitDepth;
	const delta    = 255 / (colors - 1);

	// Apply Floyd Steinberg Dither.
	for (let y = 0; y < height; y++)
	{
		for (let x = 0; x < width; x++)
		{
			const index    = (y * width) + x;
			const oldPixel = dithered[index];
			const newPixel = Math.round(oldPixel / delta) * delta;
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

	return sharp(Uint8Array.from(dithered), {
		raw : { width, height, channels : 1 }
	})
		.toColourspace('b-w')
		.png({
			colors, palette : false
		})
		.toBuffer();
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export class ScreenComposer
{
	#layoutFactory   = null;
	#panelRenderer   = null;
	#htmlRenderer    = null;

	constructor ({
		layoutFactory,
		panelRenderer,
		htmlRenderer
	})
	{
		this.#panelRenderer = panelRenderer;
		this.#htmlRenderer  = htmlRenderer;
		this.#layoutFactory = layoutFactory;
	}

	async composeScreen (screen, {
		width,
		height,
		bitDepth
	})
	{
		const layout = this.#layoutFactory
			.getLayout(screen.layout);

		const panels = await Promise.all(
			screen.panels.map(p => this.#panelRenderer.renderPanel(p.name, p.settings))
		);

		const error = panels
			.some(panel => panel.error);

		log('Composing %s x %s screen, with bit depth of %s, using layout `%s`.', width, height, bitDepth, screen.layout);

		const html = layout(
			panels.map(p => p.html)
		);

		const view = await this.#htmlRenderer.render(html, {
			width,
			height
		});

		log('Converting screen to TRMNL compliant PNG image.');

		const image = await createTrmnlPng(view, {
			width,
			height,
			bitDepth
		});

		return {
			html, image, error
		};
	}
}
