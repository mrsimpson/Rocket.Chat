Template.reisebuddy_visitorInfo.helpers({
	user() {
		const user = Template.instance().user.get();
		if (user && user.userAgent) {
			var ua = new UAParser();
			ua.setUA(user.userAgent);

			user.os = ua.getOS().name + ' ' + ua.getOS().version;
			if (['Mac OS', 'iOS'].indexOf(ua.getOS().name) !== -1) {
				user.osIcon = 'icon-apple';
			} else {
				user.osIcon = 'icon-' + ua.getOS().name.toLowerCase();
			}
			user.browser = ua.getBrowser().name + ' ' + ua.getBrowser().version;
			user.browserIcon = 'icon-' + ua.getBrowser().name.toLowerCase();
		}

		return user;
	},

	room() {
		return ChatRoom.findOne({ _id: this.rid });
	},

	joinTags() {
		return this.tags && this.tags.join(', ');
	},

	customFields() {
		let fields = [];
		let livechatData = {};
		const user = Template.instance().user.get();
		if (user) {
			livechatData = _.extend(livechatData, user.livechatData);
		}

		let data = Template.currentData();
		if (data && data.rid) {
			let room = RocketChat.models.Rooms.findOne(data.rid);
			if (room) {
				livechatData = _.extend(livechatData, room.livechatData);
			}
		}

		if (!_.isEmpty(livechatData)) {
			for (let _id in livechatData) {
				if (livechatData.hasOwnProperty(_id)) {
					let customFields = Template.instance().customFields.get();
					if (customFields) {
						let field = _.findWhere(customFields, { _id: _id });
						if (field && field.visibility !== 'hidden') {
							fields.push({ label: field.label, value: livechatData[_id] });
						}
					}
				}
			}
			return fields;
		}
	},

	createdAt() {
		if (!this.createdAt) {
			return '';
		}
		return moment(this.createdAt).format('L LTS');
	},

	lastLogin() {
		if (!this.lastLogin) {
			return '';
		}
		return moment(this.lastLogin).format('L LTS');
	},

	editing() {
		return Template.instance().action.get() === 'edit';
	},

	forwarding() {
		return Template.instance().action.get() === 'forward';
	},

	editDetails() {
		const instance = Template.instance();
		const user = instance.user.get();
		return {
			visitorId: user ? user._id : null,
			roomId: this.rid,
			save() {
				instance.action.set();
			},
			cancel() {
				instance.action.set();
			}
		};
	},

	forwardDetails() {
		const instance = Template.instance();
		const user = instance.user.get();
		return {
			visitorId: user ? user._id : null,
			roomId: this.rid,
			save() {
				instance.action.set();
			},
			cancel() {
				instance.action.set();
			}
		};
	},

	roomOpen() {
		const room = ChatRoom.findOne({ _id: this.rid });

		return room && room.open;
	},

	guestPool() {
		return RocketChat.settings.get('Livechat_Routing_Method') === 'Guest_Pool';
	},

	showDetail() {
		if (Template.instance().action.get()) {
			return 'hidden';
		}
	},

	canSeeButtons() {
		if (RocketChat.authz.hasRole(Meteor.userId(), 'livechat-manager')) {
			return true;
		}

		const data = Template.currentData();
		if (data && data.rid) {
			const room = RocketChat.models.Rooms.findOne(data.rid);
			const user = Meteor.user();
			return room.usernames.indexOf(user && user.username) !== -1;
		}
		return false;
	}
});

Template.reisebuddy_visitorInfo.events({
	'click .edit-livechat': function (event, instance) {
		event.preventDefault();
		instance.action.set('edit');
	},
	'click .close-livechat': function (event) {
		event.preventDefault();

		var room = RocketChat.models.Rooms.findOne({_id: this.rid});
		new _dbs.ClosingDialog(room).display().then(function (form) {
			let closingProps = form;
			closingProps.tags = form.tags.split(',');

			Meteor.call('reisebuddy:closeRoom', room._id, closingProps, function (error) {
				if (error) {
					return handleError(error);
				}
				swal({
					title: t('Chat_closed'),
					text: t('Chat_closed_successfully'),
					type: 'success',
					timer: 1000,
					showConfirmButton: false
				});
			});
		}).catch(() => {});
	},

	'click .return-inquiry': function (event) {
		event.preventDefault();
		swal({
			title: t('Would_you_like_to_return_the_inquiry'),
			type: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: t('Yes')
		}, () => {
			Meteor.call('livechat:returnAsInquiry', this.rid, function (error/*, result*/) {
				if (error) {
					console.log(error);
				} else {
					Session.set('openedRoom');
					FlowRouter.go('/home');
				}
			});
		});
	},

    'click .forward-livechat': function(event, instance) {
	    event.preventDefault();

	    instance.action.set('forward');
    },

	'click .merge-livechat': function (event) {
		event.preventDefault();
		const self = this;
		Meteor.call('livechat:getPreviousRoom', self.rid, (error, newRoom) => {
			if (error) {
				swal({
					title: t('Merging_Chat'),
					text: t('nothing_to_merge'),
					type: "warning",
					timer: 2000,
					showConfirmButton: false
				})
			} else {
				new _dbs.ClosingDialog(newRoom, {
					title: t('Merging_Chat'),
					text: t('title_and_tags_discarded_old_infos'),
					closeOnConfirm: true
				}).display().then(() => {
					Meteor.call('livechat:mergeRooms', self.rid, newRoom._id, (error) => {
						if (!error) {
							FlowRouter.go('live', {code: newRoom.code});
						}
					});
				}).catch(() => {
				});
			}
		});
	}
});

Template.reisebuddy_visitorInfo.onCreated(function () {
	this.visitorId = new ReactiveVar(null);
	this.customFields = new ReactiveVar([]);
	this.action = new ReactiveVar();
	this.user = new ReactiveVar();

	Meteor.call('livechat:getCustomFields', (err, customFields) => {
		if (customFields) {
			this.customFields.set(customFields);
		}
	});

	const currentData = Template.currentData();

	if (currentData && currentData.rid) {
		this.autorun(() => {
			let room = ChatRoom.findOne(currentData.rid);
			if (room && room.v && room.v._id) {
				this.visitorId.set(room.v._id);
			} else {
				this.visitorId.set();
			}
		});

		this.subscribe('livechat:visitorInfo', { rid: currentData.rid });
	}

	this.autorun(() => {
		this.user.set(Meteor.users.findOne({ '_id': this.visitorId.get() }));
	});
});
