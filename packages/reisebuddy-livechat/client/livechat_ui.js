RocketChat.roomTypes.updateTemplate('l', 'reisebuddy_livechat');

RocketChat.TabBar.removeButton('visitor-info');

RocketChat.TabBar.addButton({
	groups: ['livechat'],
	id: 'visitor-info',
	i18nTitle: 'Visitor_Info',
	icon: 'icon-user',
	template: 'reisebuddy_visitorInfo',
	order: 1
});
