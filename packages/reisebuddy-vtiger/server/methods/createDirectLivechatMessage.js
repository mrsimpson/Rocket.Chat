Meteor.methods({
	/**
	 * Creates a livechat message room and subscription to a contact.
	 * If no user with the given name or crmId is found, but the crmId exists in the CRM, a new guest will be created.
	 * @param username
	 * @param crmContactId [Optional]
	 * @see server/methods/createDirectMessage.coffee
	 * @return the newly created room, or existing room if already served by the requesting agent
	 * @throws Error if user couldn't be found or there is an already open conversation with another agent
	 */
	createDirectLivechatMessage: function ({username, crmContactId}) {
		if (!Meteor.userId()) {
			throw new Meteor.Error('error-invalid-user', "Invalid user", {method: 'createDirectLivechatMessage'});
		}
		const me = Meteor.user();
		if (!me.username || me.username === username) {
			throw new Meteor.Error('error-invalid-user', "Invalid user", {method: 'createDirectLivechatMessage'});
		}

		let to = RocketChat.models.Users.findOne({username: username, type: 'visitor'});
		if (!to && crmContactId) {
			SystemLogger.debug("lookup user by crmID " + crmContactId);
			to = RocketChat.models.Users.findOneVisitorByCrmContactId(crmContactId);
			if (!to) {
				SystemLogger.debug("try to create new guest for crmId " + crmContactId);
				try {
					const contact = Promise.await(_vtiger.getAdapter().retrievePromise(crmContactId));
                    to =  RocketChat.Livechat.registerGuest({
						username: contact.email,
						email: contact.email,
						token: Random.id(),
						other: {crmContactId: contact.id}
					});
				} catch (err) {
					SystemLogger.warn("unable to register new guest: " + err);
				}
			}
		}
		if (!to) {
			throw new Meteor.Error('error-invalid-user', "Invalid user", {method: 'createDirectLivechatMessage'})
		}
		to = RocketChat.models.Users.findOneById(to);

		const existingRoom = RocketChat.models.Rooms.findOne({
			t: 'l',
			open: true,
			'v._id': to._id
		});

		if (existingRoom) {
			if (RocketChat.settings.get('Livechat_Routing_Method') === 'Guest_Pool' &&
				RocketChat.models.LivechatInquiry.findeOpenByRoomId(existingRoom._id)) {
				throw new Meteor.Error('error-is-in-pool',
					"Room is waiting in GuestPool",
					{method: 'createDirectLivechatMessage'});
			}
			if (existingRoom.servedBy && existingRoom.servedBy._id === Meteor.userId()) {
				return existingRoom;
			}
			throw new Meteor.Error('error-served-by-other',
				"Served by other agent",
				{
					method: 'createDirectLivechatMessage',
					agent: existingRoom.servedBy.username
				});
		}

		const rid = Random.id();
		const now = new Date();
		const roomCode = RocketChat.models.Rooms.getNextLivechatRoomCode();
        const $setOnInsert = {
            t: 'l',
            msgs: 0,
            ts: now,
            lm: now,
            open: true,
            label: to.name || to.username,
            code: roomCode,
            v: {_id: to._id, token: to.profile.token},
            servedBy: {
                _id: me._id,
                username: me.username
            }
        };

		//todo this should be a switch for multiple inbound channels, maybe user field defaultCommunication
		const toMailAddr = to.emails ? to.emails[0].address : '';
		if(toMailAddr && toMailAddr !== '') {
			const communicationService = _dbs.getCommunicationService('lotusMail');
			$setOnInsert.rbInfo = {
				source: communicationService.getRoomType(toMailAddr),
				visitorSendInfo: toMailAddr,
				serviceName: communicationService.getServiceName()
			};
		}

		// Make sure we have a room
		RocketChat.models.Rooms.upsert({
			_id: rid
		}, {
			$set: {
				usernames: [me.username, to.username]
			},
			$setOnInsert: $setOnInsert
		});
		//Make agent have a subscription to this room
		RocketChat.models.Subscriptions.upsert({
			rid: rid,
			$and: [{'u._id': me._id}] // work around to solve problems with upsert and dot
		}, {
			$set: {
				ts: now,
				ls: now,
				open: true
			},
			$setOnInsert: {
				name: to.name || to.username,
				t: 'l',
				code: roomCode,
				alert: false,
				unread: false,
				u: {
					_id: me._id,
					username: me.username
				}
			}
		});

		if(RocketChat.settings.get('Livechat_Routing_Method') === 'Guest_Pool') {
			RocketChat.models.LivechatInquiry.insert({
				rid: rid,
				message: '',
				name: to.name || to.username,
				ts: new Date(),
				code: roomCode,
				status: 'taken',
				t: 'l'
			});
		}

		return {
			rid: rid,
			code: roomCode
		};
	}
});
