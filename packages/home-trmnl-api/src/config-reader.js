import {
	mkdir,
	readFile
} from 'node:fs/promises';
import {
	dirname,
	resolve
} from 'node:path';
import * as z from 'zod';
import {
	load
} from 'js-yaml';
import debug from 'debug';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const log = debug('home-trmnl:api:config-reader');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function readEnvironmentVariables ()
{
	const env = {
		host                : 'localhost',
		useSandboxRendering : true
	};

	const host = process.env.HT_HOST?.trim();

	if (host)
	{
		env.host = host;

		log('Server host has been configured to `%s` using the HT_HOST environment variable.', host);
	}

	const disableSandboxRendering = process.env.HT_DISABLE_SANDBOX_RENDERING?.trim()?.toLowerCase();

	if (disableSandboxRendering === 'true' || disableSandboxRendering === '1')
	{
		env.useSandboxRendering = false;

		log('Sandbox rendering has been disabled using the HT_DISABLE_SANDBOX_RENDERING environment variable.');
	}

	return env;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export class ConfigReader
{
	#schema = null;

	constructor (panels)
	{
		this.#schema = z.object({

			devices : z.array(z.object({
				id         : z.string(),
				key        : z.string().min(16),
				address    : z.string(),
				autoUpdate : z.boolean().default(true),
				screens    : z.array(z.object({
					layout : z.literal([
						'P1Full',
						'P2L1xR1',
						'P2T1xB1',
						'P3L1xR2',
						'P3L2xR1',
						'P4Grid'
					]),
					panels : z.array(z.union(
						Object.keys(panels).map(name => z.object({
							name     : z.literal(name),
							settings : panels[name].Schema
						}))
					)),
					expiresIn : z.number().default(300)
				}))
			})),

			settings : z.object({
				screenImagePath : z.string().default('screens'),
				trmnlApiUri     : z.string().default('https://trmnl.app/api'),
				adminApiKeys    : z.array(
					z.string().min(16)
				).min(1)
			})
		});
	}

	async readConfig (path)
	{
		log('Reading configuration file `%s`.', path);

		let file;

		try
		{
			file = load(
				await readFile(path)
			);
		}
		catch
		{
			throw new Error(`Configuration file '${path}' does not exist or is not a valid YAML file.`);
		}

		log('Parsing configuration file.');

		let config;

		try
		{
			config = this.#schema.parse(file);
		}
		catch (cause)
		{
			cause.issues.forEach(i => `${ i.message } at ${ i.path.join('.') }`);

			throw new Error(`Configuration file '${path}' is not valid.`, {
				cause
			});
		}

		// Ensure that the image path is an absolute path
		// that is resolved relative to the location of the
		// configuration file.
		config.settings.screenImagePath = resolve(
			dirname(path), config.settings.screenImagePath
		);

		log('Ensuring screen image directory `%s` exists.', config.settings.screenImagePath);

		await mkdir(config.settings.screenImagePath, {
			recursive : true
		});

		config.settings = {
			...config.settings, ...readEnvironmentVariables()
		};

		return config;
	}
}
