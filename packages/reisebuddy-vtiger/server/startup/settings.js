Meteor.startup(function() {
	RocketChat.settings.addGroup('CRM');

	RocketChat.settings.add('CRM_vtiger_url', true, {
		type: 'string',
		group: 'CRM',
		public: true,
		i18nLabel: 'DBRB_vtiger_url'
	});

	RocketChat.settings.add('CRM_vtiger_username', true, {
		type: 'string',
		group: 'CRM',
		public: true,
		i18nLabel: 'DBRB_vtiger_username'
	});

	RocketChat.settings.add('CRM_vtiger_user_id', true, {
		type: 'string',
		group: 'CRM',
		public: true,
		i18nLabel: 'DBRB_vtiger_user_id'
	});

	RocketChat.settings.add('CRM_vtiger_userAccessKey', true, {
		type: 'string',
		group: 'CRM',
		public: true,
		i18nLabel: 'DBRB_vtiger_userAccessKey'
	});
});
