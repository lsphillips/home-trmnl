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
	ScreenComposer
} from './screen-composer.js';
import {
	ScreenManager
} from './screen-manager.js';
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

export function createTrmnlManager (devices, panels, {
	trmnlApiUri,
	screenImagePath,
	referenceImagePath,
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
	const screenManager = new ScreenManager({
		screenImagePath,
		referenceImagePath
	}, {
		screenComposer : new ScreenComposer({
			layoutFactory : new LayoutFactory(),
			panelRenderer : new PanelRenderer(panels),
			htmlRenderer  : new HtmlRenderer({
				useSandboxRendering
			})
		})
	});

	return {
		screens : screenManager,
		devices : deviceManager
	};
}

export function createTrmnlScreenComposer (panels, {
	useSandboxRendering
})
{
	return new ScreenComposer({
		layoutFactory : new LayoutFactory(),
		panelRenderer : new PanelRenderer(panels),
		htmlRenderer  : new HtmlRenderer({
			useSandboxRendering
		})
	});
}
