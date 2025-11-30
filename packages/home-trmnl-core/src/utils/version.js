export function versionToNumber (version)
{
	const [
		major,
		minor,
		patch
	] = version.split('.');

	return (parseInt(major, 10) * 10000000) + (parseInt(minor, 10) * 100000) + parseInt(patch, 10);
}
