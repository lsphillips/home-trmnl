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
	renderPanel,
	checkPanelConfig
} from './support/panel-utilities.js';
import TubeStatusPanelObject from './panel-objects/tube-status-panel-object.js';
import tflApiResponseWithSomeLineDisruptions from './fixtures/tube-status-api/response-with-some-line-disruptions.json' with { type : 'json' };
import tflApiResponseWithAlotOfLineDisruptions from './fixtures/tube-status-api/response-with-alot-of-line-disruptions.json' with { type : 'json' };
import tflApiResponseWithOnlyPlannedLineDisruptions from './fixtures/tube-status-api/response-with-only-planned-line-disruptions.json' with { type : 'json' };
import tflApiResponseWithNoLineDisruptions from './fixtures/tube-status-api/response-with-no-line-disruptions.json' with { type : 'json' };

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

	describe('shall provide a configuration schema', function ()
	{
		it('that can parse a configuration object containing a valid list of valid TFL lines to prioritize', function ()
		{
			// Act & Assert (valid).
			[
				'bakerloo',
				'central',
				'circle',
				'district',
				'hammersmith-city',
				'jubilee',
				'metropolitan',
				'northern',
				'piccadilly',
				'victoria',
				'waterloo-city',
				'liberty',
				'lioness',
				'mildmay',
				'suffragette',
				'weaver',
				'windrush',
				'elizabeth',
				'dlr'
			].forEach(line => assert.doesNotThrow(() => checkPanelConfig(TubeStatus, {
				prioritizing : [line]
			})));

			// Act & Assert (invalid).
			['thameslink', 'gwr'].forEach(line => assert.throws(() => checkPanelConfig(TubeStatus, {
				prioritizing : [line]
			})));
		});

		it('that cannot parse a configuration object that configures more than 8 TFL lines to prioritize', function ()
		{
			// Act & Assert (valid).
			assert.doesNotThrow(() => checkPanelConfig(TubeStatus, {
				prioritizing : [
					'bakerloo',
					'central',
					'circle',
					'district',
					'hammersmith-city',
					'jubilee',
					'metropolitan',
					'northern'
				]
			}));

			// Act & Assert (invalid).
			assert.throws(() => checkPanelConfig(TubeStatus, {
				prioritizing : [
					'bakerloo',
					'central',
					'circle',
					'district',
					'hammersmith-city',
					'jubilee',
					'metropolitan',
					'northern',
					'piccadilly'
				]
			}));
		});

		it('that can parse a configuration object that does not configure any TFL lines to prioritize', function ()
		{
			// Act & Assert.
			assert.doesNotThrow(() => checkPanelConfig(TubeStatus, {
				prioritizing : []
			}));

			// Act & Assert.
			assert.deepStrictEqual(checkPanelConfig(TubeStatus, {}).prioritizing, []);
		});
	});

	it('shall show the disrupted lines, in alphabetical order, with a summary showing all other lines are operating a good service', async function ()
	{
		// Setup.
		const lines = [
			{ name : 'Circle', status : 'Part suspended' },
			{ name : 'District', status : 'Planned closure' },
			{ name : 'Piccadilly', status : 'Closed' },
			{ name : 'Waterloo & City', status : 'Closed' }
		];

		// Setup.
		server.use(http.get('https://api.tfl.gov.uk/Line/Mode/:lines/status', () => HttpResponse.json(tflApiResponseWithSomeLineDisruptions, {
			status : 200
		})));

		// Act.
		const panel = await renderPanel(TubeStatus, {
			prioritizing : []
		}, TubeStatusPanelObject);

		// Assert.
		assert.strictEqual(panel.getGoodServiceMessage(), '');
		assert.deepStrictEqual(panel.getLinesWithIssues(), lines);
		assert.strictEqual(panel.getRemainingOtherLinesMessage(), 'Good service on all other lines!');
	});

	it('shall show the disrupted lines, prioritizing the configured lines then in alphabetical order, with a summary showing all other lines are operation a good service', async function ()
	{
		// Setup.
		const lines = [
			{ name : 'District', status : 'Planned closure' },
			{ name : 'Piccadilly', status : 'Closed' },
			{ name : 'Circle', status : 'Part suspended' },
			{ name : 'Waterloo & City', status : 'Closed' }
		];

		// Setup.
		server.use(http.get('https://api.tfl.gov.uk/Line/Mode/:lines/status', () => HttpResponse.json(tflApiResponseWithSomeLineDisruptions, {
			status : 200
		})));

		// Act.
		const panel = await renderPanel(TubeStatus, {
			prioritizing : [
				'piccadilly',
				'district'
			]
		}, TubeStatusPanelObject);

		// Assert.
		assert.strictEqual(panel.getGoodServiceMessage(), '');
		assert.deepStrictEqual(panel.getLinesWithIssues(), lines);
		assert.strictEqual(panel.getRemainingOtherLinesMessage(), 'Good service on all other lines!');
	});

	it('shall only show the first 8 disrupted lines, with a summary stating how many other lines are disrupted', async function ()
	{
		// Setup.
		const lines = [
			{ name : 'District', status : 'Planned closure' },
			{ name : 'DLR', status : 'Part closure' },
			{ name : 'Piccadilly', status : 'Closed' },
			{ name : 'Waterloo & City', status : 'Closed' },
			{ name : 'Bakerloo', status : 'Closed' },
			{ name : 'Central', status : 'Suspended' },
			{ name : 'Circle', status : 'Part suspended' },
			{ name : 'Elizabeth line', status : 'Severe delays' }
		];

		// Setup.
		server.use(http.get('https://api.tfl.gov.uk/Line/Mode/:lines/status', () => HttpResponse.json(tflApiResponseWithAlotOfLineDisruptions, {
			status : 200
		})));

		// Act.
		const panel = await renderPanel(TubeStatus, {
			prioritizing : [
				'piccadilly',
				'district',
				'dlr',
				'waterloo-city'
			]
		}, TubeStatusPanelObject);

		// Assert.
		assert.strictEqual(panel.getGoodServiceMessage(), '');
		assert.deepStrictEqual(panel.getLinesWithIssues(), lines);
		assert.strictEqual(panel.getRemainingOtherLinesMessage(), 'Issues also on 2 other lines!');
	});

	it('shall not consider lines that are are in good service but have planned disruption as disrupted', async function ()
	{
		// Setup.
		server.use(http.get('https://api.tfl.gov.uk/Line/Mode/:lines/status', () => HttpResponse.json(tflApiResponseWithOnlyPlannedLineDisruptions, {
			status : 200
		})));

		// Act.
		const panel = await renderPanel(TubeStatus, {
			prioritizing : []
		}, TubeStatusPanelObject);

		// Assert.
		assert.strictEqual(panel.getGoodServiceMessage(), 'Good service on all lines!');
		assert.deepStrictEqual(panel.getLinesWithIssues(), []);
		assert.strictEqual(panel.getRemainingOtherLinesMessage(), '');
	});

	it('shall show a message stating there is a good service on all lines when no line disruptions are reported', async function ()
	{
		// Setup.
		server.use(http.get('https://api.tfl.gov.uk/Line/Mode/:lines/status', () => HttpResponse.json(tflApiResponseWithNoLineDisruptions, {
			status : 200
		})));

		// Act.
		const panel = await renderPanel(TubeStatus, {
			prioritizing : []
		}, TubeStatusPanelObject);

		// Assert.
		assert.strictEqual(panel.getGoodServiceMessage(), 'Good service on all lines!');
		assert.deepStrictEqual(panel.getLinesWithIssues(), []);
		assert.strictEqual(panel.getRemainingOtherLinesMessage(), '');
	});

	it('shall show an appropriate error message when TFL is unavailable ', async function ()
	{
		// Setup.
		server.use(http.get('https://api.tfl.gov.uk/Line/Mode/:lines/status', () => new HttpResponse(null, {
			status : 500
		})));

		// Act.
		const panel = await renderPanel(TubeStatus, {
			prioritizing : []
		}, TubeStatusPanelObject);

		// Assert.
		assert.ok(panel.isError());
		assert.strictEqual(panel.getErrorMessage(), 'Could not load tube status from TFL!');
	});
});
