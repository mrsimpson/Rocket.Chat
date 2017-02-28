Package.describe({
	name: 'reisebuddy:common',
	version: '0.0.1', // Brief, one-line summary of the package.
	summary: 'Basic customizing for db reisebuddy', // URL to the Git repository containing the source code for this package.
	git: '',
	documentation: ''
});


Package.onUse(function (api) {
	api.use(['ecmascript', 'underscore']);
	api.use('templating', 'client'); //needed in order to be able to register global helpers on the Template-object

	api.addFiles('lib/core.js');
	api.addFiles('lib/duration.js', 'client');
	api.addFiles('lib/testing.js', 'server');
	api.addFiles('client/lib/globalTemplateHelpers.js', 'client');

	api.export('_dbs');
});
