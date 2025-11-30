import {
	randomUUID
} from 'node:crypto';
import debug from 'debug';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const log = debug('home-trmnl:core:device-repository');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function createMemoryTable (definitions)
{
	const devices = {};

	for (const { id, address, key, screens, autoUpdate } of definitions)
	{
		devices[address] = {
			id,
			address,
			key,
			autoUpdate,
			screen : 0,
			model : null,
			firmware : null,
			battery : 0,
			error : false,
			screens : screens.map(screen => ({
				id : randomUUID(), ...screen
			}))
		};

		log('Loaded device `%s`, with address `%s`, into data table.', id, address);
	}

	return devices;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export class DeviceRepository
{
	#devices = {};

	constructor (devices)
	{
		this.#devices = createMemoryTable(devices);
	}

	async getDevice (address)
	{
		const device = this.#devices[address];

		if (!device)
		{
			return null;
		}

		const {
			id,
			model,
			firmware,
			battery,
			autoUpdate,
			error
		} = device;

		return {
			id,
			address,
			model,
			firmware,
			battery,
			autoUpdate,
			error
		};
	}

	async getDeviceKey (address)
	{
		return this.#devices[address]?.key;
	}

	async getDeviceScreens (address)
	{
		return this.devices[address]?.screens || [];
	}

	async updateDeviceToNextScreen (address)
	{
		const device = this.#devices[address];

		if (!device)
		{
			return null;
		}

		let next = device.screen + 1;

		if (next >= device.screens.length)
		{
			next = device.screen = 0;
		}

		return device.screens[next];
	}

	async updateDevice (address, {
		model,
		firmware,
		battery,
		error
	})
	{
		const device = this.#devices[address];

		if (!device)
		{
			return;
		}

		if (model != null)
		{
			device.model = model;

			log('Updating device, with address `%s`, to have model `%s`.', address, model);
		}

		if (firmware != null)
		{
			device.firmware = firmware;

			log('Updating device, with address `%s`, to have firmware version `%s`.', address, firmware);
		}

		if (battery != null)
		{
			device.battery = battery;

			log('Updating device, with address `%s`, to have battery level `%s`.', address, battery);
		}

		if (error != null)
		{
			device.error = error;

			log('Updating device, with address `%s`, to have error status of `%s`.', address, error);
		}
	}
}
