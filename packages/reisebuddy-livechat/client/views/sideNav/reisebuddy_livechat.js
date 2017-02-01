Template.reisebuddy_livechat.helpers({
	isActive() {
		if (ChatSubscription.findOne({
			t: 'l',
			f: {
				$ne: true
			},
			open: true,
			rid: Session.get('openedRoom')
		}, {
			fields: {
				_id: 1
			}
		}) != null) {
			return 'active';
		}
	},
	rooms() {
		var query = {
			t: 'l',
			open: true
		};

		const user = RocketChat.models.Users.findOne(Meteor.userId(), { fields: { 'settings.preferences.unreadRoomsMode': 1 } });

		if (user && user.settings && user.settings.preferences && user.settings.preferences.unreadRoomsMode) {
			query.alert = {
				$ne: true
			};
		}

		return ChatSubscription.find(query, {
			sort: {
				't': 1,
				'name': 1
			}
		});
	},
	inquiries() {
		// get all inquiries of the department
		var inqs = LivechatInquiry.find({
			status: 'open'
		}, {
			sort: {
				'ts' : 1
			}
		});

		// for notification sound
		inqs.forEach(function(inq) {
			KonchatNotification.newRoom(inq.rid);
		});

		return inqs;
	},
	roomsAnswered() {
		return ChatSubscription.find({
			t: 'l',
			open: true,
			answered: {$ne: false}
		}, {
			sort: {lastActivity: -1}
		});
	},
	roomsUnanswered() {
		return ChatSubscription.find({
			t: 'l',
			open: true,
			answered: false
		}, {
			sort: {lastCustomerActivity: 1}
		});
	},
	guestPool() {
		return RocketChat.settings.get('Livechat_Routing_Method') === 'Guest_Pool';
	},
	available() {
		const statusLivechat = Template.instance().statusLivechat.get();

		return {
			status: statusLivechat,
			icon: statusLivechat === 'available' ? 'icon-toggle-on' : 'icon-toggle-off',
			hint: statusLivechat === 'available' ? t('Available') : t('Not_Available')
		};
	},
	livechatAvailable() {
		return Template.instance().statusLivechat.get();
	},

	isLivechatAvailable() {
		return Template.instance().statusLivechat.get() === 'available';
	}

});

Template.reisebuddy_livechat.events({
	'click .livechat-status': function() {
		Meteor.call('livechat:changeLivechatStatus', (err /*, results*/) => {
			if (err) {
				return handleError(err);
			}
		});
	},

	'click .inquiries .open-room': function (event) {
		event.preventDefault();
		event.stopPropagation();

		swal({
			title: t('Livechat_Take_Confirm'),
			text: t('Message') + ': ' + this.message,
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: t('Take_it')
		}, (isConfirm) => {
			if (isConfirm) {
				Meteor.call('livechat:takeInquiry', this._id, (error, result) => {
					if (!error) {
						FlowRouter.go(RocketChat.roomTypes.getRouteLink(result.t, result));
					}
				});
			}
		});
	},
	'click .livechat-section.available h3 .icon-plus': function () {
		SideNav.setFlex("directLivechatMessagesFlex");
		SideNav.openFlex();
	}
});

Template.reisebuddy_livechat.onCreated(function() {
	this.statusLivechat = new ReactiveVar();

	this.autorun(() => {
		const user = RocketChat.models.Users.findOne(Meteor.userId(), { fields: { statusLivechat: 1 } });
		this.statusLivechat.set(user.statusLivechat);
	});

	this.subscribe('livechat:inquiry');
});
