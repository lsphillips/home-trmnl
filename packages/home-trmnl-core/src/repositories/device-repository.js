import debug from 'debug';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const log = debug('home-trmnl:core:device-repository');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export class DeviceRepository
{
	#devices = {};

	async addDevice (device)
	{
		const existing = this.#devices[device.address];

		if (existing != null)
		{
			throw new Error(`Cannot add device '${device.id}', it has the same MAC address as device '${existing.id}'.`);
		}

		this.#devices[device.address] = device;
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
			firmware,
			battery,
			rssi,
			autoUpdate,
			error,
			profile
		} = device;

		return {
			id,
			address,
			firmware,
			battery,
			rssi,
			autoUpdate,
			error,
			profile
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

	async updateDevice (address, {
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

		device.screen = next;

		return device.screens[next];
	}
}
