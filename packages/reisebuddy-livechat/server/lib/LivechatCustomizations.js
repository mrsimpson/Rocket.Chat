/* globals SystemLogger */

/**
 * @return {number} duration between the first and last message for the given room.
 */
function calculateDuration(rid) {
	const lastMessage = RocketChat.models.Messages.findVisibleByRoomId(rid,
		{
			sort: {ts: -1},
			limit: 1
		}).fetch()[0];
	const firstMessage = RocketChat.models.Messages.findVisibleByRoomId(rid,
		{
			sort: {ts: 1},
			limit: 1
		}).fetch()[0];
	return (lastMessage && lastMessage.ts && firstMessage && firstMessage.ts) ? lastMessage.ts - firstMessage.ts : 0;
}

RocketChat.Livechat.extendClosedRoomWithReisebuddyInfos = function ({room, closeProps}) {
	RocketChat.models.Rooms.update(room._id, {
		$set: {
			comment: closeProps.comment,
			topic: closeProps.topic,
			tags: closeProps.tags,
			duration: calculateDuration(room._id)
		}
	});
	RocketChat.models.Subscriptions.handleCloseRoom(room._id);

	Meteor.defer(() => {
		RocketChat.callbacks.run('closeReisebuddyLivechat', room, closeProps);
	});

	return true;
};
