import {
	join
} from 'node:path';
import {
	launch
} from 'puppeteer';
import sharp from 'sharp';
import debug from 'debug';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const log = debug('home-trmnl:screen-renderer');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export async function renderToBitmapFile (html, path, {
	width          = 800,
	height         = 480,
	browserSandbox = true
} = {})
{
	const browser = await launch({
		args : browserSandbox ? [] : ['--no-sandbox', '--disable-setuid-sandbox']
	});

	const page = await browser
		.newPage();

	await page.setViewport({
		width,
		height
	});

	await page.setContent(html);

	const screenshot = await page
		.screenshot();

	await browser.close();

	await sharp(
		Buffer.from(screenshot)
	)
		.resize(width, height)
		.greyscale()
		.threshold(128)
		.toColourspace('b-w')
		.removeAlpha()
		.png({ palette : false, colors : 2 })
		.toFile(path);
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export class ScreenRenderer
{
	#layoutFactory   = null;
	#panelRenderer   = null;
	#screenImagePath = null;
	#browserSandbox  = true;

	constructor ({ screenImagePath, browserSandbox }, {
		layoutFactory,
		panelRenderer
	})
	{
		this.#screenImagePath = screenImagePath;
		this.#browserSandbox  = browserSandbox;
		this.#panelRenderer   = panelRenderer;
		this.#layoutFactory   = layoutFactory;
	}

	async render (screen, {
		width,
		height
	})
	{
		const hash = Date.now().toString();

		const layout = this.#layoutFactory
			.getLayout(screen.layout);

		const panels = await Promise.all(
			screen.panels.map(p => this.#panelRenderer.renderPanel(p.name, p.settings))
		);

		const html = layout(
			panels.map(p => p.html)
		);

		const file = `${screen.id}.png`;

		await renderToBitmapFile(html, join(this.#screenImagePath, file), {
			width, height, browserSandbox : this.#browserSandbox
		});

		const visibleFor = screen.visibleFor;

		log('Created screen image file `%s` that should be visible for %s second(s).', file, visibleFor);

		return {
			html,
			visibleFor,
			hash,
			file
		};
	}
}
