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
	address,
	model,
	firmware,
	battery,
	error
})
{
	const healthy = !error;

	response.status(200).send({
		address,
		model,
		firmware,
		battery,
		healthy
	});
}

export function respondWithScreenUploaded (response)
{
	response.status(200).send();
}
