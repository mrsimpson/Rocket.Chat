function updateAnswerStatus(message) {
	// skips this callback if the message was edited
	if (message.editedAt) {
		return message;
	}
	// if the message has a token, it was sent from a visitor
	if (message.token) {
		RocketChat.models.Subscriptions.update({rid: message.rid}, {$set: {answered: false}});
	} else {
		RocketChat.models.Subscriptions.update({rid: message.rid}, {$set: {answered: true}});
	}
	return message;
}

/**
 * set the answered status of a subscription aka. liveChat room
 */
RocketChat.callbacks.add('afterSaveMessage', updateAnswerStatus, RocketChat.callbacks.priority.HIGH);

/**
 * Set answered to false if inquiry was taken
 */
RocketChat.callbacks.add('afterTakeInquiry', function (inquiry) {
	const lastMsg = _.first(RocketChat.models.Messages.findVisibleByRoomId(inquiry.rid,
		{
			sort: {ts: -1},
			limit: 1
		}).fetch());
	if (lastMsg) {
		updateAnswerStatus(lastMsg);
	}
	return inquiry;
}, RocketChat.callbacks.priority.HIGH);
