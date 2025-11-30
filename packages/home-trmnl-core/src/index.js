import {
	DeviceRepository
} from './repositories/device-repository.js';
import {
	FirmwareRepository
} from './repositories/firmware-repository.js';
import {
	DeviceManager
} from './device-manager.js';
import {
	ScreenRenderer
} from './screen-renderer.js';
import {
	LayoutFactory
} from './layout-factory.js';
import {
	PanelRenderer
} from './panel-renderer.js';
import {
	HtmlRenderer
} from './html-renderer.js';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export {
	Panel
} from './panel.js';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export function createCore (devices, panels, {
	trmnlApiUri,
	screenImagePath,
	useSandboxRendering
})
{
	// Initialize data layer.
	const deviceRepository   = new DeviceRepository(devices);
	const firmwareRepository = new FirmwareRepository({
		trmnlApiUri
	});

	// Initialize a device manager.
	const deviceManager = new DeviceManager({
		deviceRepository,
		firmwareRepository
	});

	// Initialize a screen renderer.
	const screenRenderer = new ScreenRenderer({ screenImagePath }, {
		layoutFactory : new LayoutFactory(),
		panelRenderer : new PanelRenderer(panels),
		htmlRenderer  : new HtmlRenderer({
			useSandboxRendering
		})
	});

	return {
		screens : screenRenderer,
		devices : deviceManager
	};
}
