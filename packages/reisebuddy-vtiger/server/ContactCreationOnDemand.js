function getCallbackId(roomId){
	return 'InitialContact_' + roomId;
}

RocketChat.callbacks.add('afterCreateLivechat', function(guest, room){
	if (!guest.crmContactId) {
		//after the room was created, the messages are not yet available.
		// Thus, register on the event after the message was saved
		const observedRoomId = room._id;

		RocketChat.callbacks.add('afterSaveMessage', function(message, room){
			if (room._id === observedRoomId) {
				Meteor.call('livechat:createCrmContact', room.v._id, room._id, (err, data)=> {
					if (err) {
						console.error(err);
					}
				});

				const myCallbackId = getCallbackId(room._id);
				RocketChat.callbacks.remove('afterSaveMessage', myCallbackId);
			}
		},RocketChat.callbacks.priority.LOW, getCallbackId(room._id));
	}
});
