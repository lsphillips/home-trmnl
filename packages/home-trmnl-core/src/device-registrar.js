import {
	randomUUID
} from 'node:crypto';
import debug from 'debug';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const log = debug('home-trmnl:core:device-registrar');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function createProfile (model, rotation)
{
	const profile = {
		...model, upsideDowm : false
	};

	if (
		(rotation / 90) % 2 === 1
	)
	{
		profile.orientation = model.orientation === 'landscape' ? 'portrait' : 'landscape';

		// Swap.
		[profile.width, profile.height] = [profile.height, profile.width];
	}

	profile.upsideDowm = rotation === 180 || rotation === 270;

	return profile;
}

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
	rotation,
	autoUpdate,
	screens
}, model)
{
	const profile = createProfile(model, rotation);

	return {
		id,
		address,
		key,
		autoUpdate,
		profile,
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
