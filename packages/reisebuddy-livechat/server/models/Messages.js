/**
 * Updates all messages with rid = oldRid to newRid
 */
RocketChat.models.Messages.updateAllRoomIds = function (oldRid, newRid) {
	return this.update({rid: oldRid}, {$set: {rid: newRid}}, {multi: true})
};

RocketChat.models.Messages.findLastOneByVisitorForRoom = function (rid) {
	return this.findOne({rid: rid, token: {$exists:true}}, {sort: {ts: -1}})
};
