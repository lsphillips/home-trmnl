class Result extends Array
{
	constructor (value, error = null)
	{
		super(2);

		this[0] = value;
		this[1] = error;
	}

	get value ()
	{
		return this[0];
	}

	get error ()
	{
		return this[1];
	}

	ok ()
	{
		return this[1] === null;
	}

	fail ()
	{
		return this[0] === null;
	}
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export function ok (value)
{
	return new Result(value);
}

export function fail (error)
{
	return new Result(null, typeof error === 'string' ? new Error(error) : error);
}
