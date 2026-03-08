import debug from 'debug';
import {
	readSetupRequest,
	readDisplayRequest,
	readLogRequest
} from './requests.js';
import {
	respondWithDeviceNotFound,
	respondWithDeviceNotAuthorized,
	respondWithDeviceSetup,
	respondWithDeviceDisplay,
	respondWithDeviceLogsReceived
} from './responses.js';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const log = debug('home-trmnl:api:trmnl');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export function registerTrmnlEndpoints (server, {
	devices,
	screens,
	screenImageUri
})
{
	server.get('/setup', async (request, response) =>
	{
		log('Handling request [GET] /api/setup.');

		const {
			firmware,
			address
		} = readSetupRequest(request);

		const device = await devices.getDevice(address);

		if (!device)
		{
			return respondWithDeviceNotFound(response);
		}

		const key = await devices.getDeviceKey(address);

		if (!key)
		{
			return respondWithDeviceNotFound(response);
		}

		await devices.updateDeviceFirmware(address, firmware);

		return respondWithDeviceSetup(response, key, device);
	});

	server.get('/display', async (request, response) =>
	{
		log('Handling request [GET] /api/display.');

		const {
			firmware,
			battery,
			rssi,
			address,
			key,
			host
		} = readDisplayRequest(request);

		const authorized = await devices.isDeviceAuthorized(address, key);

		if (!authorized)
		{
			return respondWithDeviceNotAuthorized(response);
		}

		const device = await devices.getDevice(address);

		if (!device)
		{
			return respondWithDeviceNotFound(response);
		}

		if (firmware)
		{
			await devices.updateDeviceFirmware(address, firmware);
		}

		if (battery)
		{
			await devices.updateDeviceBattery(address, battery);
		}

		if (rssi)
		{
			await devices.updateDeviceSignalStrength(address, rssi);
		}

		const screen = await devices
			.updateDeviceToNextScreen(address);

		const update = await devices
			.getDeviceUpdate(address);

		const render = await screens
			.renderScreen(screen, device.profile);

		await devices.updateDeviceStatus(address, {
			error : render.error
		});

		return respondWithDeviceDisplay(response, update, {
			...render, host, screenImageUri
		});
	});

	server.post('/log', async (request, response) =>
	{
		log('Handling request [GET] /api/log.');

		const {
			address,
			key,
			logs
		} = readLogRequest(request);

		const authorized = await devices.isDeviceAuthorized(address, key);

		if (!authorized)
		{
			return respondWithDeviceNotAuthorized(response);
		}

		const device = await devices.getDevice(address);

		if (!device)
		{
			return respondWithDeviceNotFound(response);
		}

		await devices
			.handleDeviceLogs(address, logs);

		return respondWithDeviceLogsReceived(response);
	});
}
