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
	devices
}, {
	adminApiKeys = []
})
{
	function isAuthorizedAdmin (key)
	{
		return adminApiKeys.includes(key);
	}

	server.get('/admin/:address/status', async (request, response) =>
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
}
