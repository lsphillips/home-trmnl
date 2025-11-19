export class AccessManager
{
	#admin            = null;
	#deviceRepository = null;

	constructor (admin, {
		deviceRepository
	})
	{
		this.#admin            = admin;
		this.#deviceRepository = deviceRepository;
	}

	async isAuthorizedDevice (address, key)
	{
		if (key == null)
		{
			return false;
		}

		return await this.#deviceRepository.getKeyForDevice(address) === key;
	}

	async isAuthorizedAdmin (key)
	{
		return this.#admin.key === key;
	}
}
