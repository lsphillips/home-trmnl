import {
	posix
} from 'node:path';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export function respondWithDeviceNotFound (response)
{
	response.code(404).send({
		status  : 404,
		message : 'Device is not registered.'
	});
}

export function respondWithDeviceNotAuthorized (response)
{
	response.code(401).send({
		status  : 401,
		message : 'Device is not authorized.'
	});
}

export function respondWithDeviceSetup (response, key, {
	id
})
{
	response.code(200).send({
		'status'      : 200,
		'api_key'     : key,
		'friendly_id' : id,
		'image_url'   : '',
		'message'     : 'Device successfully registered.'
	});
}

export function respondWithDeviceDisplay (response, update, {
	hash,
	expiresIn,
	file,
	screenImageUri,
	host
})
{
	response.code(200).send({
		'status'            : 0,
		'image_url'         : host + posix.join(screenImageUri, file),
		'image_url_timeout' : 5,
		'filename'          : hash,
		'refresh_rate'      : expiresIn,
		'reset_firmware'    : false,
		'update_firmware'   : update !== null,
		'firmware_url'      : update === null ? '' : update.url,
		'special_function'  : 'rewind'
	});
}

export function respondWithDeviceLogsReceived (response)
{
	response.code(200).send();
}
