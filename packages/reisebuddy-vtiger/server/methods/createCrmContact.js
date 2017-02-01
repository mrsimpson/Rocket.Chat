Meteor.methods({
	'livechat:createCrmContact': function (userId, roomId) {

		const SEND_IMMEDIATELY = 0;
		const DOMAIN_SMS = "@sms.db.de";
		let updateData = {};

		const user = RocketChat.models.Users.findOneById(userId);

		let mobileNumber = user.phone ? user.phone[0].phoneNumber : "";
		let emailAddress = user.emails ? user.emails[0].address : "";

		//
		if (!mobileNumber && emailAddress && ( emailAddress.search('@') === -1)) { //email most probably contains a phone number
			mobileNumber = emailAddress;
		}

		// finally, create a mail-address out of the mobile number if no mail-address was specified
		if (!emailAddress && mobileNumber) {
			emailAddress = mobileNumber + DOMAIN_SMS;
		}

		//check whether a CRM contact with either the same mobile number or email-address already exists
		const contactSkeleton = {
			mobile: mobileNumber,
			email: emailAddress
		};

		let existingCrmContacts = [];
		try {
			existingCrmContacts = Promise.await(_vtiger.getAdapter().findContactsBySkeletonPromise(contactSkeleton, 'OR', 2));
		}
		catch (err) {
			console.error("Couldn't check existing contact in crm system", err);
			throw new Meteor.Error(err);
		}

		if (existingCrmContacts && existingCrmContacts.length > 0) {
			updateData.crmContactId = existingCrmContacts[0].id;

			RocketChat.models.Users.saveUserById(user._id, updateData);

			return existingCrmContacts.length;
		} else {

			//create a new contact
			const contact = {
				lastname: (mobileNumber.length > 0 ? mobileNumber : (emailAddress.length > 0 ? emailAddress : "Neuer Kunde")),
				mobile: mobileNumber,
				email: emailAddress
			};

			const firstMessage = RocketChat.models.Messages.findFirstMessageFromUser(user._id);

			try {
				const createContactResult = Promise.await(_vtiger.getAdapter().createContactWithMessagePromise(contact, firstMessage.msg));

				updateData.crmContactId = createContactResult.createdContact.id;

				RocketChat.models.Users.saveUserById(user._id, updateData);

				if (createContactResult.messages) {
					SystemLogger.debug("we shall send welcome messages from crm to user: " + userId);
					const immediatedMessagesString = createContactResult.messages.reduce(function (reduced, current) {
						if (current.processingInstruction === SEND_IMMEDIATELY) {
							return reduced ? reduced + current.message : current.message;
						} else {
							return reduced;
						}
					}, "");
					if (immediatedMessagesString) {
						const room = RocketChat.models.Rooms.findOne(roomId);
						if(!room){
							throw new Meteor.Error("Room created could not be found in order to send a message to the visitor");
						}
						try {
							const servedBy = RocketChat.models.Users.findOneById('rocket.cat');
                            RocketChat.sendMessage(servedBy, {msg: immediatedMessagesString}, room);
						} catch (err) {
							console.error('Could not send registration messages', err);
							throw new Meteor.Error(err);
						}
					}
				} else {
					SystemLogger.debug("no welcome messages from crm to send to user: " + userId);
				}

				return 0;
			}
			catch (err) {
				console.error("Couldn't create contact in crm system", err);
				throw new Meteor.Error(err);
			}
		}
	}
});
