import {
	join
} from 'node:path';
import {
	copyFile,
	writeFile
} from 'node:fs/promises';
import debug from 'debug';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const log = debug('home-trmnl:core:screen-manager');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export class ScreenManager
{
	#screenComposer     = null;
	#screenImagePath    = null;
	#referenceImagePath = null;

	constructor ({
		screenImagePath,
		referenceImagePath
	}, {
		screenComposer
	})
	{
		this.#screenImagePath    = screenImagePath;
		this.#referenceImagePath = referenceImagePath;
		this.#screenComposer     = screenComposer;
	}

	getRenderPath ()
	{
		return this.#screenImagePath;
	}

	async renderScreen (screen, {
		width,
		height,
		bitDepth
	})
	{
		let file  = `${screen.id}.png`;
		let path  = join(this.#screenImagePath, file);
		let error = false;

		if (screen.composed)
		{
			log('Rendering composed screen consisting of %d panels.', screen.panels.length);

			const composed = await this.#screenComposer.composeScreen(screen, {
				width,
				height,
				bitDepth
			});

			log('Finished composing screen, writing the image to %s.', path);

			await writeFile(path, composed.image);

			error = composed.screen;
		}
		else
		{
			const image = join(this.#referenceImagePath, `${screen.image}.png`);

			log('Rendering reference screen, copying image from %s to %s.', image, path);

			await copyFile(image, path);
		}

		const hash = Date.now().toString();

		return {
			file, path, hash, error, duration : screen.duration
		};
	}

	async updateReferenceScreen (name, image)
	{
		const path = join(this.#referenceImagePath, `${name}.png`);

		log('Updating reference screen image %s, persisting to %s.', name, path);

		await writeFile(path, image);
	}
}
