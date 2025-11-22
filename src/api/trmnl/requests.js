const AddressHeader        = 'id';
const KeyHeader            = 'access-token';
const ModelHeader          = 'model';
const FirmwareHeader       = 'fw-version';
const BatteryVoltageHeader = 'battery-voltage';
const WidthHeader          = 'width';
const HeightHeader         = 'height';
const Host                 = 'host';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export function readSetupRequest ({
	headers
})
{
	return {
		model    : headers[ModelHeader],
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
		model    : headers[ModelHeader],
		firmware : headers[FirmwareHeader],
		voltage  : parseFloat(
			headers[BatteryVoltageHeader]
		),
		address  : headers[AddressHeader],
		width    : parseInt(headers[WidthHeader], 10),
		height   : parseInt(headers[HeightHeader], 10),
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
