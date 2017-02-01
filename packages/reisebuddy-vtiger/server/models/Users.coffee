###
  Finds users where with the given username and user.type = visitor
  @return Cursor
###
RocketChat.models.Users.findVisitorsByUsername = (username, exceptions = [], options = {}) ->
	usernameRegex = new RegExp username, "i"
	if not _.isArray exceptions
		exceptions = [ exceptions ]

	query =
		$and: [
			{username: {$nin: exceptions}}
			{username: usernameRegex}
		]
		type: 'visitor'

	return @find query, options

# Retrieves single user by CRM-ID
RocketChat.models.Users.findOneVisitorByCrmContactId = (crmId) ->
	query =
		crmContactId: crmId
		type: 'visitor'
	return @findOne query

#RocketChat.models.Users.attachCrmContactId = (uid, crmId) ->
