Template.visitorCRM.helpers({
	crmInfo() {
		return {
			contact: Template.instance().crmContact.get(),
			error: Template.instance().crmError.get()
		}
	},
	isLoading(){
		return Template.instance().isLoading.get();
	},
	isEditing(){
		return Template.instance().isEditing.get();
	},
	hasAddress(){
		const contact = Template.instance().crmContact.get();
		return (contact.mailingcity || contact.mailingzip || contact.mailingstreet);
	},
	editDetails(){
		//Helper object propagated to editing-template in order to operate on the same instance with respect to "isEditing"
		const instance = Template.instance();
		const contact = instance.crmContact.get();
		return {
			contact,
			save(contact) {
				instance.isEditing.set(false);
				Meteor.call('livechat:updateCrmContact', contact);
			},
			cancel() {
				instance.isEditing.set(false);
			}
		};
	}
});

Template.visitorCRM.events({
	'click .edit-contact': function (event, instance) {
		instance.isEditing.set(true);
	},

	'click .create-contact': function (event, instance) {
		Meteor.call('livechat:createCrmContact', instance.visitorId.get(), instance.data.rid, (err, data)=> {
			if (err) {
				console.error(err);
				toastr.error(t('crm_communication_error'));
			}
		});
	}
});

Template.visitorCRM.onCreated(function () {
	this.visitorId = new ReactiveVar(null);
	this.crmContact = new ReactiveVar({});
	this.crmError = new ReactiveVar({});
	this.user = new ReactiveVar({});
	this.isLoading = new ReactiveVar(true);
	this.isEditing = new ReactiveVar(false);
	this.room = new ReactiveVar();

	const currentData = Template.currentData();

	if (currentData && currentData.rid) {
		this.autorun(() => {
			const room = ChatRoom.findOne(currentData.rid);
			if (room && room.v && room.v._id) {
				this.visitorId.set(room.v._id);
			} else {
				this.crmContact.set({});
				this.visitorId.set();
			}
		});

		this.subscribe('livechat:visitorInfo', {rid: currentData.rid});
		this.subscribe('livechat:visitorCrm', {rid: currentData.rid});
	}

	this.autorun(()=> {
		if (this.visitorId) {
			this.user.set(Meteor.users.findOne({'_id': this.visitorId.get()}));

			if (this.user.get()) {
				if (this.user.get().crmContactId) {
					Meteor.call('livechat:getCrmContact', this.user.get().crmContactId, (err, contact) => {
						this.isLoading.set(false);
						if (err) {
							this.crmContact.set({});
							this.crmError.set(err);
						}
						else {
							this.crmError.set(false);
							if (contact) {
								this.crmContact.set(contact);
							}
						}
					});
				}
				else {
					this.isLoading.set(false);
					this.crmContact.set(undefined);
					this.crmError.set(false);
				}
			}
		}
	})
});
