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
import {
	ok,
	fail
} from '../utils/result.js';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const log = debug('home-trmnl:config-reader');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function readEnvironmentVariables ()
{
	const env = {
		host             : 'localhost',
		sandboxRendering : true
	};

	const host = process.env.HOST?.trim();

	if (host)
	{
		env.host = host;

		log('Server host has been configured to `%s` using the HOST environment variable.', host);
	}

	const disableSandboxRendering = process.env.DISABLE_SANDBOX_RENDERING?.trim()?.toLowerCase();

	if (disableSandboxRendering === 'true' || disableSandboxRendering === '1')
	{
		env.sandboxRendering = false;

		log('Sandbox rendering has been disabled using the DISABLE_SANDBOX_RENDERING environment variable.');
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

			admin : z.object({
				key : z.string().min(16)
			}),

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
					))
				}))
			})),

			settings : z.object({
				screenImagePath : z.string().default('screens'),
				trmnlApiUri     : z.string().default('https://trmnl.app/api')
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
			return fail([
				`Could not read configuration file '${path}' as a valid YAML file.`
			]);
		}

		log('Parsing configuration file.');

		let config;

		try
		{
			config = this.#schema.parse(file);
		}
		catch ({ issues })
		{
			return fail(
				issues.map(i => `${ i.message } at ${ i.path.join('.') }`)
			);
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

		return ok(config);
	}
}
