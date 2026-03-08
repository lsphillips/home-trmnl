const AddressHeader           = 'id';
const KeyHeader               = 'access-token';
const FirmwareHeader          = 'fw-version';
const BatteryVoltageHeader    = 'battery-voltage';
const BatteryPercentageHeader = 'battery-percentage';
const RssiHeader              = 'rssi';
const HostHeader              = 'host';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function readBatteryLevel (headers)
{
	const percentage = parseFloat(
		headers[BatteryPercentageHeader]
	);

	if (percentage)
	{
		return {
			type : 'percentage', percentage
		};
	}

	const voltage = parseFloat(
		headers[BatteryVoltageHeader]
	);

	if (voltage)
	{
		return {
			type : 'voltage', voltage
		};
	}

	return null;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export function readSetupRequest ({
	headers
})
{
	return {
		firmware : headers[FirmwareHeader],
		address  : headers[AddressHeader]
	};
}

export function readDisplayRequest ({
	headers,
	protocol
})
{
	return {
		firmware : headers[FirmwareHeader],
		battery  : readBatteryLevel(headers),
		rssi     : parseFloat(
			headers[RssiHeader]
		),
		address  : headers[AddressHeader],
		key      : headers[KeyHeader],
		host     : `${protocol}://${ headers[HostHeader] }`
	};
}

export function readLogRequest ({
	headers,
	body
})
{
	return {
		address : headers[AddressHeader],
		key     : headers[KeyHeader],
		logs    : body.logs
	};
}
