import protectMeFromMyStupidity             from 'eslint-config-protect-me-from-my-stupidity';
import andFromWritingStupidNodeApplications from 'eslint-config-protect-me-from-my-stupidity/and/from-writing-stupid-node-applications';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default [
	...protectMeFromMyStupidity(),
	...andFromWritingStupidNodeApplications(),

	// There are two extraneous dependency checks, we only
	// need one.
	//
	// We chose to stick with the `import/no-extraneous-dependencies`
	// rule because we can configure it to also take into account the
	// root package.json file which is where common dependencies
	// are defined.
	...[
		'home-trmnl-api',
		'home-trmnl-core',
		'home-trmnl-panels'
	].map(pkg => ({
		files : [`packages/${pkg}/**/*.js`],
		rules : {
			'import/no-extraneous-dependencies' : ['error', {
				packageDir : [`./packages/${pkg}/`, './']
			}],
			'n/no-extraneous-import' : 'off'
		}
	}))
];
