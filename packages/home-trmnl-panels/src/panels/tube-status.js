import debug from 'debug';
import * as z from 'zod';
import {
	Panel
} from 'home-trmnl-core';
import {
	problem
} from './components/problem.js';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const log = debug('home-trmnl:tfl-status-panel');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

async function getLinesWithDisruption ()
{
	const response = await fetch('https://api.tfl.gov.uk/Line/Mode/tube,elizabeth-line,overground,dlr/status');

	if (
		!response.ok
	)
	{
		log('Failed to load status of tube lines. Received %s status code.', response.status);

		return null;
	}

	const lines = await response.json();

	return lines.reduce((status, {
		id,
		name,
		lineStatuses
	}) =>
	{
		const issue = lineStatuses.find(s =>
		{
			return s.statusSeverity !== 10 && s.validityPeriods?.some(v => v.isNow);
		});

		return issue ? [...status, { id, name, status : issue.statusSeverityDescription }] : status;

	}, []);
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default class TubeStatus extends Panel
{
	static Schema = z.object({
		// Nothing to configure.
	});

	async init ()
	{
		// Nothing to initialize.
	}

	async render ()
	{
		const lines = await getLinesWithDisruption();

		if (lines === null)
		{
			const html = problem({
				message : 'Could not load tube status from TFL!'
			});

			return {
				html, error : true
			};
		}

		// Sort alphabetically.
		lines.sort((a, b) => a.name.localeCompare(b.name));

		const html = `<div class="layout layout--col tube-status-panel">
			<style>
				.tube-status-panel__disrupted-lines {
					display: block;
					margin-bottom: 10px;
					outline: 1px solid #000;
					border: 1px solid #fff;
				}
				.tube-status-panel__disrupted-line {
					display: grid;
					grid-template-columns: 170px 1fr;
					border: 1px solid #fff;
				}
				.tube-status-panel__disrupted-line-name,
				.tube-status-panel__disrupted-line-status
				{
					overflow: hidden;
					padding: 10px;
					text-overflow: ellipsis;
					white-space: nowrap;
				}
				.tube-status-pabel__disrupted-line-name--bakerloo         { background: #b26300; color: #fff }
				.tube-status-pabel__disrupted-line-name--central          { background: #dc241f; color: #fff }
				.tube-status-pabel__disrupted-line-name--circle           { background: #ffc80a; color: #000 }
				.tube-status-pabel__disrupted-line-name--district         { background: #007d32; color: #fff }
				.tube-status-pabel__disrupted-line-name--hammersmith-city { background: #f589a6; color: #000 }
				.tube-status-pabel__disrupted-line-name--jubilee          { background: #838d93; color: #000 }
				.tube-status-pabel__disrupted-line-name--metropolitan     { background: #9b005b; color: #fff }
				.tube-status-pabel__disrupted-line-name--northern         { background: #000000; color: #fff }
				.tube-status-pabel__disrupted-line-name--piccadilly       { background: #0019a8; color: #fff }
				.tube-status-pabel__disrupted-line-name--victoria         { background: #039be5; color: #000 }
				.tube-status-pabel__disrupted-line-name--waterloo-city    { background: #76d0bd; color: #000 }
				.tube-status-pabel__disrupted-line-name--liberty          { background: #5d6061; color: #fff }
				.tube-status-pabel__disrupted-line-name--lioness          { background: #faa61a; color: #000 }
				.tube-status-pabel__disrupted-line-name--mildmay          { background: #0077ad; color: #fff }
				.tube-status-pabel__disrupted-line-name--suffragette      { background: #5bbd72; color: #000 }
				.tube-status-pabel__disrupted-line-name--weaver           { background: #823a62; color: #fff }
				.tube-status-pabel__disrupted-line-name--windrush         { background: #ed1b00; color: #000 }
				.tube-status-pabel__disrupted-line-name--elizabeth        { background: #60399e; color: #fff }
				.tube-status-pabel__disrupted-line-name--dlr              { background: #00afad; color: #000 }
			</style>
			{{ content }}
		</div>`;

		let content;

		if (lines.length)
		{
			content = `
				<dl class="tube-status-panel__disrupted-lines">
					${ lines.reduce((acc, line) => acc + `<div class="tube-status-panel__disrupted-line">
						<dt class="value value--xxsmall tube-status-panel__disrupted-line-name tube-status-pabel__disrupted-line-name--${ line.id }">
							${ line.name }
						</dt>
						<dd class="value value--xxsmall tube-status-panel__disrupted-line-status">
							${ line.status }
						</dd>
					</div>`, '') }
				</dl>
				<span class="label text--black tube-status-panel__all-other-lines">
					Good service on all other lines!
				</span>
			`;
		}
		else
		{
			content = `<span class="label text--black tube-status-panel__all-lines">
				Good service on all lines!
			</span>`;
		}

		return {
			html : html.replace('{{ content }}', content), error : false
		};
	}
}
