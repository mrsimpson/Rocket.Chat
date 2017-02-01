Meteor.startup(function () {
	RocketChat.settings.addGroup('Reisebuddy');

	RocketChat.settings.add('Reisebuddy_active', true, {
		type: 'boolean',
		group: 'Reisebuddy',
		section: 'General',
		'public': true,
		i18nLabel: 'Reisebuddy_active'
	});

	RocketChat.settings.add('Reisebuddy_Livechat_Favorite', true, {
		type : 'boolean',
		group: 'Reisebuddy',
		section: 'General',
		'public': true,
		i18nLabel: 'Chatroom favorisieren'
	});

	RocketChat.settings.add('Reisebuddy_Livechat_Functions', true, {
		type : 'boolean',
		group : 'Reisebuddy',
		section: 'General',
		'public': true,
		i18nLabel: 'Funktionen im Livechat erweitern'
	});

	RocketChat.settings.add('Reisebuddy_Edit_Message', true, {
		type : 'boolean',
		group: 'Reisebuddy',
		section: 'General',
		'public': true,
		i18nLabel: 'Nachrichten bearbeiten reduzieren'
	});


	/*RocketChat.settings.add('Reisebuddy_Livechat_Icons', true, {
	 type : 'boolean',
	 group: 'Reisebuddy',
	 section: 'General',
	 'public': true,
	 i18nLabel: 'Icons in Livechat erweitern'
	 });*/

});
