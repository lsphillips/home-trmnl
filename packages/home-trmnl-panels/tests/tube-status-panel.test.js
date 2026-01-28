import {
	describe,
	it,
	before,
	beforeEach,
	after
} from 'node:test';
import assert from 'node:assert';
import {
	http,
	HttpResponse
} from 'msw';
import {
	setupServer
} from 'msw/node';
import {
	renderPanel
} from './support/panel-renderer.js';
import TubeStatusPanelObject from './panel-objects/tube-status-panel-object.js';
import tubeStatsResponseWithAllLinesHealthy from './fixtures/tube-status-api/response-with-all-lines-healthy.json' with { type : 'json' };
import tubeStatsResponseWithMixedLineHealth from './fixtures/tube-status-api/response-with-mixed-line-health.json' with { type : 'json' };

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

import TubeStatus from '../src/panels/tube-status.js';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

describe('The Tube Status Panel', function ()
{
	let server = null;

	before(function ()
	{
		server = setupServer();
		server.listen();
	});

	beforeEach(function ()
	{
		server.resetHandlers();
	});

	after(function ()
	{
		server.close();
	});

	it('shall show the status of the lines that are not in good service', async function ()
	{
		// Setup.
		const lines = [
			{ name : 'Bakerloo',           status : 'Closed' },
			{ name : 'Central',            status : 'Suspended' },
			{ name : 'Circle',             status : 'Part suspended' },
			{ name : 'District',           status : 'Planned closure' },
			{ name : 'DLR',                status : 'Part closure' },
			{ name : 'Elizabeth line',     status : 'Severe delays' },
			{ name : 'Hammersmith & City', status : 'Reduced service' },
			{ name : 'Liberty',            status : 'Minor delays' }
		];

		// Setup.
		server.use(http.get('https://api.tfl.gov.uk/Line/Mode/:lines/status', () => HttpResponse.json(tubeStatsResponseWithMixedLineHealth, {
			status : 200
		})));

		// Act.
		const panel = await renderPanel(TubeStatus, null, TubeStatusPanelObject);

		// Assert.
		assert.strictEqual(panel.getGoodServiceMessage(), '');
		assert.deepStrictEqual(panel.getLinesWithIssues(), lines);
		assert.strictEqual(panel.getGoodServiceOnOtherLinesMessage(), 'Good service on all other lines!');
	});

	it('shall show a message stating there is a good service on all lines when TFL reports no issues', async function ()
	{
		// Setup.
		server.use(http.get('https://api.tfl.gov.uk/Line/Mode/:lines/status', () => HttpResponse.json(tubeStatsResponseWithAllLinesHealthy, {
			status : 200
		})));

		// Act.
		const panel = await renderPanel(TubeStatus, null, TubeStatusPanelObject);

		// Assert.
		assert.strictEqual(panel.getGoodServiceMessage(), 'Good service on all lines!');
		assert.deepStrictEqual(panel.getLinesWithIssues(), []);
		assert.strictEqual(panel.getGoodServiceOnOtherLinesMessage(), '');
	});

	it('shall show an appropriate error message when TFL is unavailable ', async function ()
	{
		// Setup.
		server.use(http.get('https://api.tfl.gov.uk/Line/Mode/:lines/status', () => new HttpResponse(null, {
			status : 500
		})));

		// Act.
		const panel = await renderPanel(TubeStatus, null, TubeStatusPanelObject);

		// Assert.
		assert.ok(panel.isError());
		assert.strictEqual(panel.getErrorMessage(), 'Could not load tube status from TFL!');
	});
});
