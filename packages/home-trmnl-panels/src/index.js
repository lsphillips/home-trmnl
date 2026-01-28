import JoinWifi   from './panels/join-wifi.js';
import TubeStatus from './panels/tube-status.js';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export async function getPanels ()
{
	return {
		'join-wifi'   : JoinWifi,
		'tube-status' : TubeStatus
	};
}

export async function getPanel (name)
{
	try
	{
		const {
			default : Panel
		} = await import(`./panels/${name}.js?v=${ Date.now() }`);

		return Panel;
	}
	catch
	{
		return null;
	}
}
