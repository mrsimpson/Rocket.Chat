RocketChat.models.Messages.findFirstMessageFromUser = function (userId) {
	return this.findOne({'u._id': userId}, {sort: {ts: 1}, limit: 1})
}
