import * as cheerio from 'cheerio';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default class HomeTrmnlPanelObject
{
	$      = null;
	#error = false;

	constructor ({
		html, error
	})
	{
		this.$      = cheerio.load(html);
		this.#error = error;
	}

	isError ()
	{
		return this.#error;
	}

	getErrorMessage ()
	{
		return this.$('.home-trmnl-error').find('.home-trmnl-error__message').text().trim();
	}
}
