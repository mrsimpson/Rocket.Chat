Meteor.methods({
	'livechat:getCrmContact': function (crmContactId) {
		return _vtiger.getAdapter().retrievePromise(crmContactId)
			.catch((err)=> {
				throw new Meteor.Error(err)
			});
	}
});
