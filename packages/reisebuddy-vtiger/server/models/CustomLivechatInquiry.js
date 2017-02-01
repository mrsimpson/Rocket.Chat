RocketChat.models.LivechatInquiry.findeOpenByRoomId = function (rid) {
	return this.findOne({rid: rid, status: 'open'});
};

