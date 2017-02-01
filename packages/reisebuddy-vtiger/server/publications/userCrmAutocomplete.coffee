###
  Publication containing visitors with username containing selector.username and the results from the crm-search
  @see \server\publications\userAutocomplete.coffee
###
Meteor.publish 'userCrmAutocomplete', (selector) ->
	unless this.userId
		return this.ready()

	pub = this

	if selector.username
		_vtiger.getAdapter().findContactsFulltextPromise('%'+selector.username+'%').then((records) =>
			for rec in records
				do (rec) ->
					try
						pub.changed("autocompleteRecords", rec.id, {
								name: rec.lastname + ', ' + rec.firstname
								username: rec.email
								crmContactId: rec.id
								status: 'offline'
						});
					catch noUpdate
						pub.added("autocompleteRecords", rec.id, {
								name: rec.lastname + ', ' + rec.firstname
								username: rec.email
								crmContactId: rec.id
								status: 'offline'
						});
		).catch (resp) ->
			SystemLogger.error "unable to query crm for user autocomplete: " + resp

	exceptions = selector.exceptions or []
	options =
		fields:
			name: 1
			username: 1
			status: 1
			crmContactId: 1
		limit: 10
		sort:
			name: 1

	#using the crmId as publicationId allows updating the RC-userproxies
	cursorHandle = RocketChat.models.Users.findVisitorsByUsername(selector.username, exceptions, options).observeChanges
		added: (_id, record) ->
			id = if record.crmContactId then record.crmContactId else _id
			pub.added("autocompleteRecords", id, record)
		changed: (_id, record) ->
			id = if record.crmContactId then record.crmContactId else _id
			pub.changed("autocompleteRecords", id, record)
		removed: (_id, record) ->
			id = id = if record.crmContactId then record.crmContactId else _id
			pub.removed("autocompleteRecords", id, record)
	@ready()
	@onStop ->
		cursorHandle.stop()
	return
