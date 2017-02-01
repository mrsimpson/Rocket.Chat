var moment_tz = Npm.require('moment-timezone');

Meteor.publish('livechat:room_statistics', function () {
	if (!this.userId) {
		return this.error(new Meteor.Error('error-not-authorized', 'Not authorized', {publish: 'livechat:messages'}));
	}

	if (!RocketChat.authz.hasPermission(this.userId, 'view-livechat-rooms')) {
		return this.error(new Meteor.Error('error-not-authorized', 'Not authorized', {publish: 'livechat:messages'}));
	}

	var self = this;

	RocketChat.models.Rooms.find().observeChanges({
		added(id, fields) {
			self.added('livechatRoomStatistics', id, extendRoomData(id, fields, self));
		},
		changed(id, fields) {
			self.changed('livechatRoomStatistics', id, extendRoomData(id, fields, self));
		},
		removed(id) {
			self.removed('livechatRoomStatistics', id);
		}
	});

	self.ready();
});

function extendRoomData(roomId, roomObject, context) {
	roomObject = formatDates(roomObject);
	roomObject = addAgentsToRoom(roomId, roomObject);

	if (roomObject.v && roomObject.v._id) {
		addCrmDataToRoom(roomId, roomObject.v._id, roomObject, context);
	}

	return roomObject;
}

function formatDates(roomObject) { //todo aslagle:reactive-table doesn't support filters on formatted values. So we set the values on the server without i18n
	if (roomObject) {
		if (roomObject.lm) {
			roomObject.lm = moment_tz(roomObject.lm).tz("Europe/Berlin").format('DD.MM.YYYY HH:mm');
		}

		if (roomObject.ts) {
			roomObject.ts = moment_tz(roomObject.ts).tz("Europe/Berlin").format('DD.MM.YYYY HH:mm');
		}
	}

	return roomObject;
}

function addAgentsToRoom(roomId, room) {
	let involvedAgents = [];
	let roomsMessages = RocketChat.models.Messages.find({rid: roomId, "u._id": {$ne: "rocket.cat"}});

	roomsMessages.forEach(
		message => {
			let sender = message.u;

			if (sender.username && involvedAgents.indexOf(sender.username) === -1
				&& (!room.v || !room.v._id || room.v._id !== sender._id)) {
				involvedAgents.push(sender.username);
			}
		}
	);
	room.involvedAgents = involvedAgents;

	return room;
}

function addCrmDataToRoom(roomId, userId, room, context) {
	let userData = RocketChat.models.Users.findOneById(userId);

	if (userData.crmContactId) {
		_vtiger.getAdapter().retrievePromise(userData.crmContactId).then((crmContact) => {
			const crmName = (crmContact.lastname ? crmContact.lastname : '') +
						  (crmContact.lastname && crmContact.firstname ? ', ' : '') +
						  (crmContact.firstname ? crmContact.firstname : '');
			if (crmName && crmName.length > 0) {
				room.label = crmName;
				context.changed('livechatRoomStatistics', roomId, room);
			}
		}).catch((err) => {
			SystemLogger.warn("unable to resolve crm-User for id " + userData.crmContactId + " -- " + err);
		});
	}
}
