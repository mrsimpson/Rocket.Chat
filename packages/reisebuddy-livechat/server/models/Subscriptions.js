/**
 * Hide closed rooms from livechat-list
 */
RocketChat.models.Subscriptions.handleCloseRoom = function (roomId) {
	return this.update({rid: roomId}, {$unset: {open: false}});
};

Meteor.startup(function() {
	RocketChat.models.Subscriptions.tryEnsureIndex({ answered: 1 });
});
