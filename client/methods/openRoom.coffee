Meteor.methods
  openRoom: (rid, markAsOpen = true) ->
    if not Meteor.userId()
      return false

    ChatSubscription.update
      rid: rid
      'u._id': Meteor.userId()
    ,
      $set:
        open: markAsOpen
