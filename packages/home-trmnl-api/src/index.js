import {
	resolve
} from 'node:path';
import fastify from 'fastify';
import debug from 'debug';
import {
	createCore
} from 'home-trmnl-core';
import {
	getPanels
} from 'home-trmnl-panels';
import {
	ConfigReader
} from './config-reader.js';
import {
	registerTrmnlEndpoints
} from './trmnl/endpoints.js';
import {
	registerAdminEndpoints
} from './admin/endpoints.js';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const log = debug('home-trmnl:api');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export async function main ()
{
	const panels = await getPanels();

	const {
		devices,
		settings : {
			trmnlApiUri,
			screenImagePath,
			host,
			useSandboxRendering,
			adminApiKeys
		}
	} = await new ConfigReader(panels)
		.readConfig(
			resolve(process.argv[2])
		);

	const core = createCore(devices, panels, {
		trmnlApiUri,
		screenImagePath,
		useSandboxRendering
	});

	const server = fastify({
		routerOptions : {
			ignoreTrailingSlash : true
		},
		logger : false
	});

	server.addHook('onResponse', async ({
		url,
		method
	}, { statusCode }) =>
	{
		log('Responded with a %s status code to request `[%s] %s`.', statusCode, method, url);
	});

	server.setErrorHandler((error, {
		url,
		method
	}, response) =>
	{
		log('An unexpected error occurred whilst handling request `[%s] %s`. %s', method, url, error);

		response.code(500).send();
	});

	log('Setting up TRMNL API endpoints.');

	registerTrmnlEndpoints(server, core);

	log('Setting up admin API endpoints.');

	registerAdminEndpoints(server, core, {
		adminApiKeys
	});

	await server.listen({
		host, port : 1992
	});

	log('Server is running on port 1992.');
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

main();
