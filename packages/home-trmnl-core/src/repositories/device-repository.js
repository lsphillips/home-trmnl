import {
	randomUUID
} from 'node:crypto';
import debug from 'debug';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const log = debug('home-trmnl:core:device-repository');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function createScreenTable (definitions)
{
	const screens = [];

	for (const { type, duration, layout, panels, image } of definitions)
	{
		const composed = type === 'composed', id = randomUUID();

		screens.push({
			id,
			composed,
			panels,
			duration,
			layout,
			image
		});

		log('Loaded %s screen into data table.', type);
	}

	return screens;
}

function createDeviceTable (definitions)
{
	const devices = {};

	for (const { id, address, key, screens, autoUpdate, bitDepth } of definitions)
	{
		devices[address] = {
			id,
			address,
			key,
			bitDepth,
			autoUpdate,
			screen   : -1,
			model    : null,
			firmware : null,
			battery  : 0,
			rssi     : -100,
			error    : false,
			screens  : createScreenTable(screens)
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
		this.#devices = createDeviceTable(devices);
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
			rssi,
			bitDepth,
			autoUpdate,
			error
		} = device;

		return {
			id,
			address,
			model,
			firmware,
			battery,
			rssi,
			bitDepth,
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
			next = 0;
		}

		// Record.
		device.screen = next;

		return device.screens[next];
	}

	async updateDevice (address, {
		model,
		firmware,
		battery,
		rssi,
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

			log('Updating device, with address `%s`, to have battery level `%d%`.', address, battery);
		}

		if (rssi != null)
		{
			device.rssi = rssi;

			log('Updating device, with address `%s`, to have signal strength of `%ddBm`.', address, rssi);
		}

		if (error != null)
		{
			device.error = error;

			log('Updating device, with address `%s`, to have error status of `%s`.', address, error);
		}
	}
}
