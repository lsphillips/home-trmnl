function readApiKey (header)
{
	if (
		!header?.trim()
	)
	{
		return null;
	}

	const [scheme, key] = header.trim().split(/\s+/);

	if (
		scheme.toLowerCase() !== 'bearer'
	)
	{
		return null;
	}

	return key || null;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export function readDeviceStatusRequest ({
	params,
	headers
})
{
	const key = readApiKey(headers.authorization);

	return {
		key, address : params['address']
	};
}
