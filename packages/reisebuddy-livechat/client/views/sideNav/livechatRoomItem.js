/**
 * @see packages\rocketchat-ui-sidenav\side-nav\chatRoomItem.coffee
 */
Template.livechatRoomItem.helpers({
	alert() {
		if (FlowRouter.getParam('_id') !== this.rid || !document.hasFocus()) {
			return this.alert;
		}
	},
	sinceLastActivity() {
		return Template.instance().lastActivityTimer.get();
	},
	userStatus() {
		const stat = Session.get('user_' + this.name + '_status');
		return 'status-' + stat ? stat : 'offline';
	},
	name() {
		return Template.instance().visitorName.get();
	},
	isLoading() {
		return Template.instance().isLoadingCrmName.get();
	}
	,
	roomIcon() {
		return RocketChat.roomTypes.getIcon(this.t);
	},
	active() {
		if (Session.get('openedRoom') === this.rid) {
			return 'active';
		}
	},
	route() {
		return RocketChat.roomTypes.getRouteLink(this.t, this);
	}
});

Template.livechatRoomItem.onRendered(function () {
	const param = FlowRouter.getParam('_id');
	if (!(param && param === this.data.id) && !(this.data.ls && this.data.alert === true)) {
		KonchatNotification.newRoom(this.data.rid);
	}

	const self = this;
	actualizeTimer(self);
	this.timerId = Meteor.setInterval(() => {
		actualizeTimer(self);
	}, 10000);
});

Template.livechatRoomItem.onCreated(function () {
	this.lastActivityTimer = new ReactiveVar(0);
	this.isLoadingCrmName = new ReactiveVar(true);

	const self = this;
	this.visitorName = new ReactiveVar(self.data.name);

	if (self.data && self.data.rid) {
		this.subscribe('livechat:visitorInfo', {rid: self.data.rid});
		this.subscribe('livechat:rooms', {rid: self.data.rid});

		this.autorun(() => {
			const room = ChatRoom.findOne(self.data.rid);
			if (room && room.v && room.v._id) {
				const user = Meteor.users.findOne({'_id': room.v._id});
				if(user) {
					gatherAndDisplayAdditionalUserData(user);
				}
			}
		});

		function gatherAndDisplayAdditionalUserData(user) {
			if (user.emails && user.emails[0] && user.emails[0].address) {
				self.visitorName.set(user.emails[0].address);
			}

			if (user.crmContactId) {
				Meteor.call('livechat:getCrmContact', user.crmContactId, (err, contact) => {
					self.isLoadingCrmName.set(false);

					if (!err && contact) {
						let crmName = extractFirstAndLastname(contact);

						if (crmName && crmName.length > 0) {
							self.visitorName.set(crmName);
						}
					}
				});
			} else {
				self.isLoadingCrmName.set(false);
			}
		}
	}
});

Template.livechatRoomItem.onDestroyed(function () {
	Meteor.clearInterval(this.timerId);
});

Template.livechatRoomItem.events({
	'click .open-room': function (e) {
		menu.close();
	},
	'click .hide-room': function (e) {
		e.stopPropagation();
		e.preventDefault();

		const rid = this.rid;
		swal({
			title: t('Are_you_sure'),
			text: t('Hide_Private_Warning', this.name),
			type: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#DD6B55',
			confirmButtonText: t('Yes_hide_it'),
			cancelButtonText: t('Cancel'),
			closeOnConfirm: true,
			html: false
		}, () => {
			if (Session.get('openedRoom') === rid) {
				FlowRouter.go('home');
			}
			Meteor.call('hideRoom', rid, (err) => {
				if (err) {
					handleError(err);
				}
			});
		});
	}
});

function actualizeTimer(instance) {
	let lastDate = instance.data.answered ? instance.data.lastActivity : instance.data.lastCustomerActivity;
	if (!_.isDate(lastDate)) {
		lastDate = instance.data._updatedAt;
		if (!_.isDate(lastDate)) {
			lastDate = new Date();
		}
	}
	instance.lastActivityTimer.set(new _dbs.Duration(new Date() - lastDate).toMM());
}

function extractFirstAndLastname(crmContact) {
	return (crmContact.lastname ? crmContact.lastname : '') +
		(crmContact.lastname && crmContact.firstname ? ', ' : '') +
		(crmContact.firstname ? crmContact.firstname : '');
}
