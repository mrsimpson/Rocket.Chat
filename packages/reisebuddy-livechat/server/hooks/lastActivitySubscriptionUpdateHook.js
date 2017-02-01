/*
 * - persist the lastActivity timestamp
 * - persist the lastCustomerActivity timestamp (timestamp from the initial contact or the first message after agent activity)
 */
RocketChat.callbacks.add('afterSaveMessage', function (message) {
	// RocketChat.models.Subscriptions.update({rid: message.rid}, {$set: {lastActivity: new Date()}});
	const room = RocketChat.models.Rooms.findOneById(message.rid); //we need the room in order to determine who is the customer
	const roomMessages = RocketChat.models.Messages.findVisibleByRoomId(message.rid, {sort: {ts: -1}}).fetch();

	let lastCustomerActivity = 0;
	let agentAnsweredAfterwards = false;
	if (!room.v) {
		return message;
	}
	for (let i = 0; i < roomMessages.length; i++) {
		if (room.v._id === roomMessages[i].u._id) { // Customer wrote the message
			lastCustomerActivity = roomMessages[i].ts;
			if (agentAnsweredAfterwards) {  //don't look no further, agent replied to this one
				break;
			}
		} else {
			if (lastCustomerActivity) { // the timestamp buffered is the one were looking for
				break;
			}
			else { // look for the next customer-message
				agentAnsweredAfterwards = true;
			}
		}
	}
	RocketChat.models.Subscriptions.update({rid: message.rid}, {
		$set: {
			lastCustomerActivity: lastCustomerActivity,
			lastActivity: new Date()
		}
	});

	return message;
}, RocketChat.callbacks.priority.HIGH);
