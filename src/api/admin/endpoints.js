import {
	readDeviceStatusRequest
} from './requests.js';
import {
	respondWithDeviceNotFound,
	respondWithNotAuthorized,
	respondWithDeviceStatus
} from './responses.js';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export function registerAdminEndpoints (server, {
	deviceManager,
	accessManager
})
{
	server.get('/admin/:address/status', async (request, response) =>
	{
		const {
			address,
			key
		} = readDeviceStatusRequest(request);

		const authorized = await accessManager.isAuthorizedAdmin(key);

		if (!authorized)
		{
			return respondWithNotAuthorized(response);
		}

		const device = await deviceManager.getDevice(address);

		if (!device)
		{
			return respondWithDeviceNotFound(response);
		}

		return respondWithDeviceStatus(response, device);
	});
}
