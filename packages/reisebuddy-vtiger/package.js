Package.describe({
	name: 'reisebuddy:vtiger',
	version: '0.8.7', // Brief, one-line summary of the package.
	summary: 'Integration for vtiger crm', // URL to the Git repository containing the source code for this package.
	git: '', // By default, Meteor will default to using README.md for documentation.
	// To avoid submitting documentation, set this field to null.
	documentation: 'README.md'
});

/**
 * This package depends on the non-meteoric adapter for vtiger-CRM.
 * CAUTION: The tarball referenced has to point to the customized "compactCRM"-branch!
 */
Npm.depends({
	"vtiger-client": "https://github.com/mrsimpson/vtiger-client/archive/813fe731db78758a16e92d545f8ce838f7c34d02.tar.gz"
});

Package.onUse(function (api) {
	api.use(['ecmascript', 'underscore', 'coffeescript']);
	api.use('templating', 'client');
	api.use('rocketchat:lib');
	api.use('reisebuddy:common');

	api.addFiles('server/startup/settings.js', 'server');
	api.addFiles('reisebuddy-vtiger.js', 'server');
	api.export('_vtiger', 'server');

	api.addFiles('client/views/sideNav/directLivechatMessagesFlex.html', 'client');
	api.addFiles('client/views/sideNav/directLivechatMessagesFlex.js', 'client');
	api.addFiles('client/views/app/tabbar/visitorCRM.html', 'client');
	api.addFiles('client/views/app/tabbar/visitorCRM.js', 'client');
	api.addFiles('client/views/app/tabbar/visitorCRMEdit.html', 'client');
	api.addFiles('client/views/app/tabbar/visitorCRMEdit.js', 'client');
	api.addFiles('client/views/app/tabbar/visitorEdit.html', 'client');
	api.addFiles('client/views/app/tabbar/visitorEdit.js', 'client');

	api.addFiles('server/models/CustomLivechatInquiry.js', 'server');
	api.addFiles('server/models/Messages.js', 'server');
	api.addFiles('server/models/Users.coffee', 'server');

	api.addFiles('server/methods/createCrmContact.js', 'server');
	api.addFiles('server/methods/createDirectLivechatMessage.js', 'server');
	api.addFiles('server/methods/crmIntegrationStatus.js', 'server');
	api.addFiles('server/methods/getCrmContact.js', 'server');
	api.addFiles('server/methods/updateCrmContact.js', 'server');

	api.addFiles('server/ContactCreationOnDemand.js', 'server');

	api.addFiles('server/publications/userCrmAutocomplete.coffee', 'server');
	api.addFiles('server/publications/visitorCrm.js', 'server');

	//i18n
	var _ = Npm.require('underscore');
	var fs = Npm.require('fs');
	var tapi18nFiles = _.compact(_.map(fs.readdirSync('packages/reisebuddy-vtiger/i18n'), function(filename) {
		return 'i18n/' + filename;
	}));
	api.addFiles(tapi18nFiles);

	api.use('tap:i18n');
});

