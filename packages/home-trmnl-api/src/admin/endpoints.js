import {
	readDeviceStatusRequest,
	readUploadScreenRequest
} from './requests.js';
import {
	respondWithDeviceNotFound,
	respondWithNotAuthorized,
	respondWithDeviceStatus,
	respondWithScreenUploaded
} from './responses.js';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export function registerAdminEndpoints (server, {
	devices,
	screens,
	adminApiKeys
})
{
	function isAuthorizedAdmin (key)
	{
		return adminApiKeys.includes(key);
	}

	server.addContentTypeParser('image/png', {
		parseAs : 'buffer'
	}, async (_, body) => body);

	server.get('/:address/status', async (request, response) =>
	{
		const {
			address,
			key
		} = readDeviceStatusRequest(request);

		if (
			!isAuthorizedAdmin(key)
		)
		{
			return respondWithNotAuthorized(response);
		}

		const device = await devices.getDevice(address);

		if (!device)
		{
			return respondWithDeviceNotFound(response);
		}

		return respondWithDeviceStatus(response, device);
	});

	server.post('/screens/:name', async (request, response) =>
	{
		const {
			name,
			image
		} = readUploadScreenRequest(request);

		await screens.updateReferenceScreen(name, image);

		respondWithScreenUploaded(response);
	});
}
