import debug from 'debug';
import {
	versionToNumber
} from '../utils/version.js';

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

const log = debug('home-trmnl:device-manager');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export class DeviceManager
{
	#deviceRepository   = null;
	#firmwareRepository = null;
	#screenRenderer     = null;

	constructor ({
		deviceRepository,
		firmwareRepository,
		screenRenderer
	})
	{
		this.#deviceRepository   = deviceRepository;
		this.#firmwareRepository = firmwareRepository;
		this.#screenRenderer     = screenRenderer;
	}

	async getDevice (address)
	{
		return this.#deviceRepository.getDevice(address);
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

	async renderNextDeviceScreen (address, size)
	{
		const screen = await this.#deviceRepository
			.updateToNextDeviceScreen(address);

		return this.#screenRenderer.render(screen, size);
	}

	async updateDeviceStatus (address, {
		model,
		firmware,
		voltage
	})
	{
		const update = { model, firmware };

		if (voltage != null)
		{
			update.battery = voltageToPercentage(voltage);
		}

		await this.#deviceRepository.updateDeviceStatus(address, update);
	}

	async handleDeviceLogs (address, logs)
	{
		for (const message of logs)
		{
			log('Log produced by device with address `%s` - %s', address, message);
		}
	}
}
