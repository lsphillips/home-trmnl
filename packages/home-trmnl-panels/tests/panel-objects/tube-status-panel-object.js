import HomeTrmnlPanelObject from './home-trmnl-panel-object.js';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default class TubeStatusPanelObject extends HomeTrmnlPanelObject
{
	getGoodServiceMessage ()
	{
		return this.$('.tube-status-panel__all-lines').text().trim();
	}

	getLinesWithIssues ()
	{
		return this.$('.tube-status-panel__disrupted-line')
			.map((_, el) => ({
				name   : this.$(el).find('.tube-status-panel__disrupted-line-name').text().trim(),
				status : this.$(el).find('.tube-status-panel__disrupted-line-status').text().trim()
			}))
			.toArray();
	}

	getRemainingOtherLinesMessage ()
	{
		return this.$('.tube-status-panel__remaining-other-lines').text().trim();
	}
}
