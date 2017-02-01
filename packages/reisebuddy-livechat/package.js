/* globals Package */
Package.describe({
	name: 'reisebuddy:livechat',
	version: '0.0.2',
	summary: 'Extension to rocketchat-livechat',
	git: '',
	documentation: null
});

Npm.depends({
	"moment-timezone": "0.5.6"
});

Package.onUse(function(api) {
	api.use(['ecmascript', 'underscore', 'mongo']);
	api.use('templating', 'client');
	api.use('less@2.5.1');
	api.use('aslagle:reactive-table');
	api.use('momentjs:moment');
	api.use(['reisebuddy:common', 'reisebuddy:communication']);
	api.use(['rocketchat:lib', 'rocketchat:livechat']);

	api.addAssets('assets/stylesheets/rb_livechat.less', 'server');
	api.addFiles('assets/jquery.datetimepicker.full.min.js', 'client');
	api.addFiles('assets/jquery.datetimepicker.css', 'client');
	api.addAssets('assets/icons/bahnDe.png', 'client');
	api.addAssets('assets/icons/bahn_de.png', 'client');
	api.addAssets('assets/icons/expedia.png', 'client');
	api.addAssets('assets/icons/google.png', 'client');
	api.addAssets('assets/icons/quixxit.png', 'client');
	api.addAssets('assets/icons/fallback_logo.png', 'client');
	api.addAssets('assets/icons/buld-grey.png', 'client');
	api.addAssets('assets/icons/bahnDeSearchbox.png', 'client');
	api.addAssets('assets/icons/community_bahn_de.png', 'client');
	api.addAssets('assets/icons/VKL.png', 'client');
	api.addAssets('assets/icons/yelp.png', 'client');
	api.addAssets('assets/icons/maps_google-FoodAndBeverages.png', 'client');

	api.addFiles('server/config.js', 'server');

	api.addFiles('server/models/Messages.js', 'server');
	api.addFiles('server/models/Subscriptions.js', 'server');

	api.addFiles('server/hooks/answerSubscriptionUpdateHooks.js', 'server');
	api.addFiles('server/hooks/lastActivitySubscriptionUpdateHook.js', 'server');

	api.addFiles('server/lib/LivechatCustomizations.js', 'server');

	api.addFiles('server/methods/closeRoom.js', 'server');
	api.addFiles('server/methods/mergeRooms.js', 'server');

	api.addFiles('server/publications/livechatRoomStatistics.js', 'server');

	api.addFiles('client/livechat_ui.js', 'client');
	api.addFiles('client/collections/LivechatRoomStatistics.js', 'client');
	api.addFiles('client/lib/ClosingDialog.js', 'client');
	api.addFiles('client/views/app/livechatCurrentChats.html', 'client');
	api.addFiles('client/views/app/livechatCurrentChats.js', 'client');
	api.addFiles('client/views/app/tabbar/visitorInfo.html', 'client');
	api.addFiles('client/views/app/tabbar/visitorInfo.js', 'client');
	api.addFiles('client/views/sideNav/reisebuddy_livechat.html', 'client');
	api.addFiles('client/views/sideNav/reisebuddy_livechat.js', 'client');
	api.addFiles('client/views/sideNav/livechatRoomItem.html', 'client');
	api.addFiles('client/views/sideNav/livechatRoomItem.js', 'client');

	//i18n
	var _ = Npm.require('underscore');
	var fs = Npm.require('fs');
	var tapi18nFiles = _.compact(_.map(fs.readdirSync('packages/reisebuddy-livechat/i18n'), function(filename) {
		return 'i18n/' + filename;
	}));
	api.addFiles(tapi18nFiles);

	api.use('tap:i18n');
});
