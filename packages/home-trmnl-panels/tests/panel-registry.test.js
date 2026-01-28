import {
	describe,
	it
} from 'node:test';
import assert from 'node:assert';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

import {
	getPanel,
	getPanels
} from '../src/index.js';
import JoinWifi from '../src/panels/join-wifi.js';
import TubeStatus from '../src/panels/tube-status.js';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

describe('getPanels()', function ()
{
	it('shall return an object containing all panels', async function ()
	{
		// Act.
		const panels = await getPanels();

		// Assert.
		assert.equal(panels['join-wifi'], JoinWifi);
		assert.equal(panels['tube-status'], TubeStatus);
	});
});

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

describe('getPanel(name)', function ()
{
	it('shall return the panel with the given name', async function ()
	{
		// Act.
		const panel = await getPanel('join-wifi');

		// Assert.
		assert.notEqual(panel, null);
	});

	it('shall return `null` if the panel does not exist', async function ()
	{
		// Act.
		const panel = await getPanel('name-of-panel-that-does-exist');

		// Assert.
		assert.equal(panel, null);
	});

	it('shall always load the panel, bypassing any cache', async function ()
	{
		// Act.
		const panelA = await getPanel('join-wifi');
		const panelB = await getPanel('join-wifi');

		// Assert.
		assert.notEqual(panelA, panelB);
	});
});
