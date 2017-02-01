Package.describe({
	name: 'reisebuddy:communication',
	version: '0.0.1', // Brief, one-line summary of the package.
	summary: 'Package to bundle in- and outbound extensions', // URL to the Git repository containing the source code for this package.
	git: ''
});

Package.onUse(function (api) {
	api.versionsFrom('1.2.1');
	api.use(['ecmascript', 'underscore', 'peerlibrary:punycode@1.3.2_1']);
	api.use(['nimble:restivus', 'rocketchat:lib', 'rocketchat:authorization'], 'server');
	api.use('reisebuddy:common');

	api.addFiles('server/services/lotusMailConfig.js', 'server');
	api.addFiles('server/services/lotusMailCommunicationService.js', 'server');

	api.addFiles('server/reisebuddyIncomingApi.js', 'server');
	api.addFiles('server/sendMessageByService.js', 'server');


	//i18n
	var _ = Npm.require('underscore');
	var fs = Npm.require('fs');
	var tapi18nFiles = _.compact(_.map(fs.readdirSync('packages/reisebuddy-communication/i18n'), function(filename) {
		return 'i18n/' + filename;
	}));
	api.addFiles(tapi18nFiles);

	api.use('tap:i18n');
});
