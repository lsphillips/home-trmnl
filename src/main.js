import {
	resolve
} from 'node:path';
import debug from 'debug';
import {
	startApiServer
} from './api/server.js';
import {
	DeviceRepository
} from './repositories/device-repository.js';
import {
	FirmwareRepository
} from './repositories/firmware-repository.js';
import {
	ConfigReader
} from './core/config-reader.js';
import {
	DeviceManager
} from './core/device-manager.js';
import {
	ScreenRenderer
} from './core/screen-renderer.js';
import {
	LayoutFactory
} from './core/layout-factory.js';
import {
	PanelRenderer
} from './core/panel-renderer.js';
import {
	HtmlRenderer
} from './core/html-renderer.js';
import {
	AccessManager
} from './core/access-manager.js';
import JoinWifiPanel from './panels/join-wifi-panel.js';
import TubeStatusPanel from './panels/tube-status-panel.js';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const log = debug('home-trmnl:main');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const Panels = {
	'join-wifi'   : JoinWifiPanel,
	'tube-status' : TubeStatusPanel
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

async function main ()
{
	const pathToConfig = process.argv[2];

	if (!pathToConfig)
	{
		log('Configuration file was not specified.');

		return;
	}

	const [config, issues] = await new ConfigReader(Panels)
		.readConfig(
			resolve(pathToConfig)
		);

	if (issues)
	{
		issues.forEach(issue => log(issue));

		return;
	}

	const deviceRepository   = new DeviceRepository(config.devices);
	const firmwareRepository = new FirmwareRepository(config.settings);

	const deviceManager = new DeviceManager({
		deviceRepository, firmwareRepository, screenRenderer : new ScreenRenderer(config.settings, {
			layoutFactory : new LayoutFactory(),
			panelRenderer : new PanelRenderer(Panels),
			htmlRenderer  : new HtmlRenderer(config.settings)
		})
	});

	const accessManager = new AccessManager(config.admin, {
		deviceRepository
	});

	try
	{
		await startApiServer(config.settings, {
			deviceManager,
			accessManager
		});
	}
	catch (error)
	{
		log('Failed to start API server. %s', error);
	}
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

main();
