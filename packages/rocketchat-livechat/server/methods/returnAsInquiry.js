Meteor.methods({
	'livechat:returnAsInquiry': function(rid) {
		if (!Meteor.userId() || !RocketChat.authz.hasPermission(Meteor.userId(), 'view-l-room')) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', { method: 'livechat:returnAsInquiry' });
		}
		return RocketChat.Livechat.returnInquiry(rid, Meteor.userId());
	}
});
