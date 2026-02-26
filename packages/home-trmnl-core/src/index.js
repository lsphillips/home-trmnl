import {
	DeviceRepository
} from './repositories/device-repository.js';
import {
	FirmwareRepository
} from './repositories/firmware-repository.js';
import {
	ModelRepository
} from './repositories/model-repository.js';
import {
	DeviceRegistrar
} from './device-registrar.js';
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

export async function createTrmnlManager (devices, panels, {
	trmnlApiUri,
	screenImagePath,
	referenceImagePath,
	useSandboxRendering
})
{
	// Initialize data layer.
	const deviceRepository   = new DeviceRepository();
	const modelRepository    = new ModelRepository({ trmnlApiUri });
	const firmwareRepository = new FirmwareRepository({ trmnlApiUri });

	// Initialize device registrar.
	const deviceRegistrar = new DeviceRegistrar({
		deviceRepository,
		modelRepository
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
		screenComposer : await createTrmnlScreenComposer(panels, {
			useSandboxRendering
		})
	});

	// Register devices.
	for (const device of devices)
	{
		await deviceRegistrar.register(device);
	}

	return {
		screens : screenManager,
		devices : deviceManager
	};
}

export async function createTrmnlScreenComposer (panels, {
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
