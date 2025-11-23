function P1Full (panels)
{
	if (panels.length !== 1)
	{
		throw new Error('The P1Full layout only supports rendering 1 panel.');
	}

	return `<div class="layout">
		${ panels[0] }
	</div>`;
}

function P2L1xR1 (panels)
{
	if (panels.length !== 2)
	{
		throw new Error('The P2L1xR1 layout only supports rendering 2 panels.');
	}

	return `<div class="mashup mashup--1Lx1R">
		${ panels.reduce((html, panel) => html + `<div class="view view--half_vertical">
			<div class="layout">
				${ panel }
			</div>
		</div>`, '') }
	</div>`;
}

function P2T1xB1 (panels)
{
	if (panels.length !== 2)
	{
		throw new Error('The P2T1xB1 layout only supports rendering 2 panels.');
	}

	return `<div class="mashup mashup--1Tx1B">
		${ panels.reduce((html, panel) => html + `<div class="view view--half_horizontal">
			<div class="layout">
				${ panel }
			</div>
		</div>`, '') }
	</div>`;
}

function P3L1xR2 (panels)
{
	if (panels.length !== 3)
	{
		throw new Error('The P3L1xR2 layout only supports rendering 3 panels.');
	}

	const [first, ...rest] = panels;

	return `<div class="mashup mashup--1Lx2R">
		<div class="view view--half_vertical">
			<div class="layout">
				${ first }
			</div>
		</div>
		${ rest.reduce((html, panel) => html + `<div class="view view--quadrant">
			<div class="layout">
				${ panel }
			</div>
		</div>`, '') }
	</div>`;
}

function P3L2xR1 (panels)
{
	if (panels.length !== 3)
	{
		throw new Error('The P3L2xR1 layout only supports rendering 3 panels.');
	}

	const [, , last] = panels;

	return `<div class="mashup mashup--2Lx1R">
		${ panels.slice(0, 1).reduce((html, panel) => html + `<div class="view view--quadrant">
			<div class="layout">
				${ panel }
			</div>
		</div>`, '') }
		<div class="view view--half_vertical">
			<div class="layout">
				${ last }
			</div>
		</div>
	</div>`;
}

function P4Grid (panels)
{
	if (panels.length !== 4)
	{
		throw new Error('The P4Grid layout only supports rendering 4 panels.');
	}

	return `<div class="mashup mashup--2x2">
		${ panels.reduce((html, panel) => html + `<div class="view view--quadrant">
			<div class="layout">
				${ panel }
			</div>
		</div>`, '') }
	</div>`;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const Layouts = {
	P1Full,
	P2L1xR1,
	P2T1xB1,
	P3L1xR2,
	P3L2xR1,
	P4Grid
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export class LayoutFactory
{
	getLayout (name)
	{
		const layout = Layouts[name];

		if (!layout)
		{
			throw new Error(`Layout "${name}" is not recognized.`);
		}

		return panels => `<!DOCTYPE>
			<html>
				<head>
					<meta charset="utf-8" />
					<meta name="viewport" content="width=device-width, initial-scale=1" />
					<link rel="preconnect" href="https://fonts.googleapis.com" />
    				<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
					<link rel="stylesheet "href="https://fonts.googleapis.com/css2?family=Inter:wght@300;350;375;400;450;600;700&display=swap" />
					<link rel="stylesheet" href="https://usetrmnl.com/css/latest/plugins.css" />
					<script src="https://usetrmnl.com/js/latest/plugins.js"></script>
				</head>
				<body class="environment trmnl">
					<div class="screen">
						<div class="view view--full">
							${ layout(panels) }
						</div>
					</div>
				</body>
			</html>`;
	}
}
