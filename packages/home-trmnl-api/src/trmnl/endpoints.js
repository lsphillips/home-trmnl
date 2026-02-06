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
			model,
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

		await devices.updateDeviceDetails(address, {
			model,
			firmware
		});

		return respondWithDeviceSetup(response, key, device);
	});

	server.get('/display', async (request, response) =>
	{
		log('Handling request [GET] /api/display.');

		const {
			model,
			firmware,
			voltage,
			address,
			width,
			height,
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

		const update = await devices.getDeviceUpdate(address);

		await devices.updateDeviceDetails(address, {
			model,
			firmware
		});

		await devices.updateDeviceBattery(address, voltage);

		const screen = await devices
			.updateDeviceToNextScreen(address);

		const render = await screens
			.renderScreen(screen, {
				width,
				height,
				bitDepth : device.bitDepth
			});

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
