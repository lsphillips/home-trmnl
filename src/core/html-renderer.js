import {
	launch
} from 'puppeteer';
import debug from 'debug';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const log = debug('home-trmnl:html-renderer');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export class HtmlRenderer
{
	#browser           = null;
	#useBrowserSandbox = true;

	constructor ({
		useBrowserSandbox
	})
	{
		this.#useBrowserSandbox = useBrowserSandbox;
	}

	async render (html, {
		width,
		height
	})
	{
		if (!this.#browser?.connected)
		{
			log('Browser not started or is not connected.');

			await this.#browser?.close();

			this.#browser = await launch({
				args : this.#useBrowserSandbox ? [] : ['--no-sandbox', '--disable-setuid-sandbox']
			});
		}

		const page = await this.#browser
			.newPage();

		await page.setViewport({
			width,
			height
		});

		await page.setContent(html);

		const screenshot = await page
			.screenshot();

		await page.close();

		return Buffer.from(screenshot);
	}
}
