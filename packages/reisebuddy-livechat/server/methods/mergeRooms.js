/**
 * Returns the livechat room to the given room-id if the current user has the permission.
 * @throws error-not-authorized
 */
function getLiveRoomFromId(rid, errorMethod) {
	if (!Meteor.userId() || !RocketChat.authz.hasPermission(Meteor.userId(), 'view-l-room')) {
		throw new Meteor.Error('error-not-authorized', 'Not authorized', {method: errorMethod});
	}
	const room = RocketChat.models.Rooms.findOneById(rid);
	if (!room) {
		throw new Meteor.Error('error-not-found', 'Not found', {method: errorMethod});
	}
	return room;
}

Meteor.methods({
	/**
	 * @param roomId id of the current livechat room
	 * @return {Room} the livechat room from the previous conversation
	 * @throws Meteor.Error if no room is found
	 */
	'livechat:getPreviousRoom': function (roomId) {
		const room = getLiveRoomFromId(roomId, 'livechat:getPreviousRoom');
		const targetRoom = RocketChat.models.Rooms.findOne({
			"v._id": room.v._id,
			open: {$ne: true}
		}, {sort: {ts: -1}});
		if (!targetRoom) {
			throw new Meteor.Error('error-not-found', 'Not found', {method: 'livechat:getPreviousRoom'});
		}
		return targetRoom;
	},
	/**
	 * Moves all messages from roomToClose (current) to newRoom (prev), increments msg counter on newRoom, removes subscriptions
	 * on roomToClose, deletes roomToClose, reopens newRoom, attaches subscriptions to newRoom
	 * @throws Meteor.Error if rooms cannot be accessed
	 */
	'livechat:mergeRooms': function (currentRoomId, prevRoomId) {
		const currentRoom = getLiveRoomFromId(currentRoomId, 'livechat:mergeRooms');
		const prevRoom = getLiveRoomFromId(prevRoomId, 'livechat:mergeRooms');

		if (!currentRoom || !prevRoom) {
			throw new Meteor.Error('error-not-found', 'Not found', {method: 'livechat:mergeRooms'});
		}

		let currentSubscrip = RocketChat.models.Subscriptions.findOneByRoomIdAndUserId(currentRoomId, Meteor.userId());
		let prevSubscriptionUpdate = {
			answered: false,
			u: currentSubscrip.u
		};
		if (currentSubscrip) {
			if (currentSubscrip.answered) {
				prevSubscriptionUpdate.answered = currentSubscrip.answered;
			}
			if (currentSubscrip.lastActivity) {
				prevSubscriptionUpdate.lastActivity = currentSubscrip.lastActivity;
			}
			if (currentSubscrip.lastCustomerActivity) {
				prevSubscriptionUpdate.lastCustomerActivity = currentSubscrip.lastCustomerActivity;
			}
		}

		const numOfMsgsToMove = RocketChat.models.Messages.findVisibleByRoomId(currentRoomId).count();
		RocketChat.models.Messages.updateAllRoomIds(currentRoomId, prevRoomId);
		RocketChat.models.Rooms.incMsgCountAndSetLastMessageTimestampById(prevRoomId, numOfMsgsToMove, new Date());

		RocketChat.models.Subscriptions.removeByRoomId(currentRoomId);
		RocketChat.models.Subscriptions.update({rid: prevRoomId}, {$set: prevSubscriptionUpdate});

		RocketChat.models.Rooms.removeById(currentRoomId);
		RocketChat.models.Rooms.update(prevRoomId, {
			$set: {
				open: true,
				servedBy: currentRoom.servedBy,
				usernames: currentRoom.usernames,
				rbInfo: currentRoom.rbInfo
			},
			$unset: {
				comment: '',
				duration: '',
				closedBy: '',
				closedAt: '',
				chatDuration: ''
			}
		});

		//trigger update for knowledgeAdapter
		RocketChat.models.LivechatExternalMessage.remove({rid: currentRoomId});
		Meteor.defer(() => {
			try {
				const lastMsgByVisitorForNewRoom = RocketChat.models.Messages.findLastOneByVisitorForRoom(prevRoomId);
				if (_dbs.getKnowledgeAdapter() && lastMsgByVisitorForNewRoom) {
					_dbs.getKnowledgeAdapter().onMessage(lastMsgByVisitorForNewRoom);
				}
			} catch (e) {
				SystemLogger.error('Error using knowledge provider ->', e);
			}
		});

		RocketChat.models.LivechatInquiry.remove({rid: prevRoomId}); // we keep the most recent for potential queuing
		RocketChat.models.LivechatInquiry.update({rid: currentRoomId}, {$set: {rid: prevRoomId, code: prevRoom.code}});

		RocketChat.models.Subscriptions.openByRoomIdAndUserId(prevRoomId, Meteor.userId());
	}
});
