const AddressHeader        = 'id';
const KeyHeader            = 'access-token';
const FirmwareHeader       = 'fw-version';
const BatteryVoltageHeader = 'battery-voltage';
const RssiHeader           = 'rssi';
const Host                 = 'host';

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
		voltage  : parseFloat(
			headers[BatteryVoltageHeader]
		),
		rssi     : parseFloat(
			headers[RssiHeader]
		),
		address  : headers[AddressHeader],
		key      : headers[KeyHeader],
		host     : `${protocol}://${ headers[Host] }`
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
