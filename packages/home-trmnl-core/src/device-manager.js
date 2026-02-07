import debug from 'debug';
import {
	versionToNumber
} from './utils/version.js';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const log = debug('home-trmnl:core:device-manager');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export function voltageToPercentage (voltage)
{
	const minVoltage = 0.45;
	const maxVoltage = 4.05;

	if (voltage <= minVoltage)
	{
		return 10;
	}

	if (voltage > maxVoltage)
	{
		return 100;
	}

	return Math.round(
		(voltage - minVoltage) / (maxVoltage - minVoltage) * 100
	);
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export class DeviceManager
{
	#deviceRepository   = null;
	#firmwareRepository = null;

	constructor ({
		deviceRepository,
		firmwareRepository
	})
	{
		this.#deviceRepository   = deviceRepository;
		this.#firmwareRepository = firmwareRepository;
	}

	async getDevice (address)
	{
		return this.#deviceRepository.getDevice(address);
	}

	async getDeviceKey (address)
	{
		return this.#deviceRepository.getDeviceKey(address);
	}

	async getDeviceUpdate (address)
	{
		const device = await this.#deviceRepository.getDevice(address);

		if (!device?.firmware || !device?.autoUpdate)
		{
			return null;
		}

		const firmware = await this.#firmwareRepository.getLatestFirmware();

		if (!firmware)
		{
			return null;
		}

		if (
			versionToNumber(firmware.version) > versionToNumber(device.firmware)
		)
		{
			log('Device with address `%s` is running firmware version %s which is lower than the latest version (%s).', address, device.firmware, firmware.version);

			return firmware;
		}

		return null;
	}

	async isDeviceAuthorized (address, key)
	{
		if (key == null)
		{
			return false;
		}

		return await this.#deviceRepository.getDeviceKey(address) === key;
	}

	async updateDeviceToNextScreen (address)
	{
		return this.#deviceRepository.updateDeviceToNextScreen(address);
	}

	async updateDeviceDetails (address, {
		model,
		firmware
	})
	{
		await this.#deviceRepository.updateDevice(address, {
			model,
			firmware
		});
	}

	async updateDeviceBattery (address, voltage)
	{
		await this.#deviceRepository.updateDevice(address, {
			battery : voltageToPercentage(voltage)
		});
	}

	async updateDeviceSignalStrength (address, rssi)
	{
		await this.#deviceRepository.updateDevice(address, {
			rssi
		});
	}

	async updateDeviceStatus (address, {
		error
	})
	{
		await this.#deviceRepository.updateDevice(address, {
			error
		});
	}

	async handleDeviceLogs (address, logs)
	{
		for (const message of logs)
		{
			log('Log produced by device with address `%s` - %s', address, message);
		}
	}
}
