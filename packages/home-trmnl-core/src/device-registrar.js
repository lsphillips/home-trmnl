import {
	randomUUID
} from 'node:crypto';
import debug from 'debug';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const log = debug('home-trmnl:core:device-registrar');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function createScreen ({
	type,
	duration,
	layout,
	panels,
	image
})
{
	const composed = type === 'composed', id = randomUUID();

	return {
		id,
		composed,
		panels,
		duration,
		layout,
		image
	};
}

function createDevice ({
	id,
	address,
	key,
	autoUpdate,
	screens
}, model)
{
	return {
		id,
		address,
		key,
		autoUpdate,
		model,
		screen   : -1,
		firmware : null,
		battery  : 0,
		rssi     : -100,
		error    : false,
		screens  : screens.map(screen => createScreen(screen))
	};
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export class DeviceRegistrar
{
	#deviceRepository = null;
	#modelRepository  = null;

	constructor ({
		deviceRepository,
		modelRepository
	})
	{
		this.#deviceRepository = deviceRepository;
		this.#modelRepository  = modelRepository;
	}

	async register (device)
	{
		const model = await this.#modelRepository.getDeviceModel(device.model);

		if (!model)
		{
			throw new Error(`Device '${device.id}' is not an officially recognized model.`);
		}

		log('Successfully registered device `%s` with address `%s`.', device.id, device.address);

		await this.#deviceRepository.addDevice(
			createDevice(device, model)
		);
	}
}
