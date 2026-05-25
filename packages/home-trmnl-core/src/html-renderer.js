import {
	launch
} from 'puppeteer';
import debug from 'debug';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const log = debug('home-trmnl:core:html-renderer');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function setupPageRenderingMonitoring (page)
{
	const requests = new WeakMap();

	page.on('request', req => requests.set(
		req, Date.now()
	))
		.on('requestfinished', req =>
		{
			const time = Date.now() - requests.get(req);

			log('Request for %s finished in %dms.', req.url(), time);
		})
		.on('requestfailed', request =>
		{
			const time = Date.now() - requests.get(req);

			log('Request for %s failed after %dms. %s', request.url(), time, request.failure()?.errorText);
		});
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export class HtmlRenderer
{
	#browser             = null;
	#useSandboxRendering = true;

	constructor ({
		useBrowserSandbox
	})
	{
		this.#useSandboxRendering = useBrowserSandbox;
	}

	async render (html, {
		width,
		height
	})
	{
		if (!this.#browser?.connected)
		{
			log('Browser not started or is not connected. Launching.');

			await this.#browser?.close();

			this.#browser = await launch({
				args : this.#useSandboxRendering ? [] : ['--no-sandbox', '--disable-setuid-sandbox']
			});
		}

		log('Creating a new browser page.');

		const page = await this.#browser
			.newPage()

		// Monitor.
		setupPageRenderingMonitoring(page);

		try
		{
			log('Setting browser page size to %s x %s', width, height);

			await page.setViewport({
				width,
				height
			});

			log('Rendering HTML content in browser page.');

			await page.setContent(html);

			log('Capturing screenshot of browser page.');

			const screenshot = await page
				.screenshot();

			return Buffer.from(screenshot);
		}
		finally
		{
			await page.close();
		}
	}
}
