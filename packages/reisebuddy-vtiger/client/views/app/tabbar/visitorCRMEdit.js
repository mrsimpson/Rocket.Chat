Template.visitorCRMEdit.helpers({
	contact() {
		return Template.instance().contact.get();
	}
});

Template.visitorCRMEdit.onCreated(function () {
	this.contact = new ReactiveVar(Template.currentData().contact);
});

Template.visitorCRMEdit.events({
	'submit form'(event, instance) {
		event.preventDefault();

		let contact = instance.contact.get();

		contact.firstname = event.currentTarget.elements['firstname'].value;
		contact.lastname = event.currentTarget.elements['lastname'].value;
		contact.email = event.currentTarget.elements['email'].value;
		contact.phone = event.currentTarget.elements['phone'].value;
		contact.mobile = event.currentTarget.elements['mobile'].value;
		contact.mailingstreet = event.currentTarget.elements['street'].value;
		contact.mailingzip = event.currentTarget.elements['zipcode'].value;
		contact.mailingcity = event.currentTarget.elements['city'].value;
		contact.description = event.currentTarget.elements['description'].value;

		instance.contact.set(contact);

		this.save(this.contact);
	},

	'click .save'() {
		// .save is of type submit - thus, nothin special handling is required here
		// this.save(this.contact);
	},

	'click .cancel'() {
		this.cancel();
	}
});
