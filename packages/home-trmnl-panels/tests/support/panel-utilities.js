export async function renderPanel (Panel, Settings, PanelObject)
{
	// Create.
	const panel = new Panel();

	// Initialize.
	await panel.init(Settings);

	// Render.
	const html = await panel.render();

	// Parse.
	return new PanelObject(html);
}

export function checkPanelConfig (Panel, Configuration)
{
	return Panel.Schema.parse(Configuration);
}
