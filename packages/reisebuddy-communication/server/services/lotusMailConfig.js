Meteor.startup(function() {
	RocketChat.settings.add('SMS_Out_Reisebuddy_lotusEndpoint', 'http://grendo001/Develop/Mail/Forward/JSON/groupJsonForward.nsf/sendMail.xsp', {
		type: 'string',
		group: 'Reisebuddy',
		section: 'Reisebuddy_MailConf',
		i18nLabel: 'SmsOut_Reisebuddy_lotusEndpoint'
	});

	RocketChat.settings.add('SMS_Out_Reisebuddy_enabled', true, {
		type: 'boolean',
		group: 'Reisebuddy',
		section: 'Reisebuddy_MailConf',
		i18nLabel: 'SMS_Out_Reisebuddy_enabled'
	});

	RocketChat.settings.add('SMS_Out_Reisebuddy_baseAddress', '@iat-vfsms@DEUTSCHE BAHN AG@DBKOM', {
		type: 'string',
		group: 'Reisebuddy',
		section: 'Reisebuddy_MailConf',
		i18nLabel: 'SmsOut_Reisebuddy_baseAddress'
	});
	RocketChat.settings.add('SMS_Out_Reisebuddy_defaultSubject', '', {
		type: 'string',
		group: 'Reisebuddy',
		section: 'Reisebuddy_MailConf',
		i18nLabel: 'SmsOut_Reisebuddy_defaultSubject'
	});
	RocketChat.settings.add('SMS_Out_Reisebuddy_username', '', {
		type: 'string',
		group: 'Reisebuddy',
		section: 'Reisebuddy_MailConf',
		i18nLabel: 'SmsOut_Reisebuddy_username'
	});
	RocketChat.settings.add('SMS_Out_Reisebuddy_password', '', {
		type: 'string',
		group: 'Reisebuddy',
		section: 'Reisebuddy_MailConf',
		i18nLabel: 'SmsOut_Reisebuddy_password'
	});
	RocketChat.settings.add('Mail_In_Reisebuddy_username', '', {
		type: 'string',
		group: 'Reisebuddy',
		section: 'Reisebuddy_MailConf',
		i18nLabel: 'MailIn_Reisebuddy_username'
	});
	RocketChat.settings.add('Mail_In_Reisebuddy_password', '', {
		type: 'string',
		group: 'Reisebuddy',
		section: 'Reisebuddy_MailConf',
		i18nLabel: 'MailIn_Reisebuddy_password'
	});
});
