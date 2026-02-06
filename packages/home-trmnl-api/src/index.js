import {
	resolve
} from 'node:path';
import fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import debug from 'debug';
import {
	createTrmnlManager
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
	log('Loading panels.');

	const panels = await getPanels();

	log('Loading configuration.');

	const {
		devices,
		settings : {
			trmnlApiUri,
			screenImagePath,
			referenceImagePath,
			host,
			useSandboxRendering,
			adminApiKeys
		}
	} = await new ConfigReader(panels)
		.readConfig(
			resolve(process.argv[2])
		);

	log('Initializing core TRMNL manager.');

	const core = createTrmnlManager(devices, panels, {
		trmnlApiUri,
		screenImagePath,
		referenceImagePath,
		useSandboxRendering
	});

	log('Setting up server.');

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

	log('Setting up TRMNL screen endpoints.');

	const screenImageUri = '/screens';

	server.register(fastifyStatic, {
		root   : core.screens.getRenderPath(),
		prefix : screenImageUri
	});

	log('Setting up TRMNL API endpoints.');

	server.register(registerTrmnlEndpoints, {
		...core, screenImageUri, prefix : '/api'
	});

	log('Setting up admin API endpoints.');

	server.register(registerAdminEndpoints, {
		...core, adminApiKeys, prefix : '/admin'
	});

	await server.listen({
		host, port : 1992
	});

	log('Server is running on port 1992.');
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

main();
