Meteor.methods
  openRoom: (rid, markAsOpen = true) ->
    if not Meteor.userId()
      throw new Meteor.Error 'error-invalid-user', 'Invalid user', { method: 'openRoom' }

    RocketChat.models.Subscriptions.openByRoomIdAndUserId rid, Meteor.userId(), markAsOpen
