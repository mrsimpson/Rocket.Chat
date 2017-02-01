Meteor.methods({
	'livechat:updateCrmContact': function (contact) {
		return _vtiger.getAdapter().updatePromise(contact)
			.catch((err)=> {
				throw new Meteor.Error(err)
			});
	}
});
