Meteor.methods({
	isCrmEnabled: function () {
		return _vtiger.isEnabled();
	}
});
