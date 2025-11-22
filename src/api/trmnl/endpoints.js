import fastifyStatic from '@fastify/static';
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

const log = debug('home-trmnl:api');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export function registerTrmnlEndpoints (server, {
	screenImagePath
}, {
	deviceManager,
	accessManager
})
{
	const screenImageUri = '/screens';

	server.register(fastifyStatic, {
		root   : screenImagePath,
		prefix : screenImageUri
	});

	server.get('/api/setup', async (request, response) =>
	{
		log('Handling request [GET] /api/setup.');

		const {
			model,
			firmware,
			address
		} = readSetupRequest(request);

		const device = await deviceManager.getDevice(address);

		if (!device)
		{
			return respondWithDeviceNotFound(response);
		}

		const key = await accessManager.getDeviceKey(address);

		if (!key)
		{
			return respondWithDeviceNotFound(response);
		}

		await deviceManager.updateDeviceStatus(address, {
			model,
			firmware
		});

		return respondWithDeviceSetup(response, key, device);
	});

	server.get('/api/display', async (request, response) =>
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

		const authorized = await accessManager.isAuthorizedDevice(address, key);

		if (!authorized)
		{
			return respondWithDeviceNotAuthorized(response);
		}

		const device = await deviceManager.getDevice(address);

		if (!device)
		{
			return respondWithDeviceNotFound(response);
		}

		await deviceManager.updateDeviceStatus(address, {
			model,
			firmware,
			voltage
		});

		const screen = await deviceManager
			.renderNextDeviceScreen(address, {
				width,
				height
			});

		const update = await deviceManager.getDeviceUpdate(address);

		return respondWithDeviceDisplay(response, update, {
			host, screenImageUri, ...screen
		});
	});

	server.post('/api/log', async (request, response) =>
	{
		log('Handling request [GET] /api/log.');

		const {
			address,
			key,
			logs
		} = readLogRequest(request);

		const authorized = await accessManager.isAuthorizedDevice(address, key);

		if (!authorized)
		{
			return respondWithDeviceNotAuthorized(response);
		}

		const device = await deviceManager.getDevice(address);

		if (!device)
		{
			return respondWithDeviceNotFound(response);
		}

		await deviceManager
			.handleDeviceLogs(address, logs);

		return respondWithDeviceLogsReceived(response);
	});
}
