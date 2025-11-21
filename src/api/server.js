import fastify from 'fastify';
import debug from 'debug';
import {
	registerTrmnlEndpoints
} from './trmnl/endpoints.js';
import {
	registerAdminEndpoints
} from './admin/endpoints.js';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const log = debug('home-trmnl:api');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export async function startApiServer ({
	host,
	screenImagePath
}, {
	deviceManager,
	accessManager
})
{
	const server = fastify({
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

	registerTrmnlEndpoints(server, {
		screenImagePath
	}, {
		deviceManager,
		accessManager
	});

	log('Setting up admin API endpoints.');

	registerAdminEndpoints(server, {
		deviceManager,
		accessManager
	});

	await server.listen({
		host, port : 1992
	});

	log('Server is running on port 1992.');
}
