Meteor.methods({
	/**
	 * Extension to livechat:closeRoom to set some properties to the room on close.
	 * Do not delete the inquiries as they might be used after mergeRooms
	 */
	'reisebuddy:closeRoom': function (roomId, closeProps) {
		const originalResult = Meteor.call('livechat:closeRoom', roomId, closeProps.comment);
		if (!originalResult) {
			return false;
		}

		const room = RocketChat.models.Rooms.findOneById(roomId);

		return originalResult && RocketChat.Livechat.extendClosedRoomWithReisebuddyInfos({
			room: room,
			closeProps: closeProps
		});
	}
});
