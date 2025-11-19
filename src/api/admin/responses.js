export function respondWithDeviceNotFound (response)
{
	response.code(404).send({
		message : 'Device is not recognized.'
	});
}

export function respondWithNotAuthorized (response)
{
	response.code(401).send({
		message : 'Now authorized to access device.'
	});
}

export function respondWithDeviceStatus (response, {
	model,
	firmware,
	battery
})
{
	response.status(200).send({
		model,
		firmware,
		battery
	});
}
