$ ->
  "use strict"

  socket = io.connect window.location.hostname

  App = Ember.Application.create
    rootElement: '#wrapper'
    socket: socket
    currentUser: null
    nameEntered: false

  App.scrollToBottom = ->
    setTimeout -> 
      $('.chatlist').scrollTop($('.chatlist')[0].scrollHeight)
    , 500

  App.message = Ember.Object.extend
    message: null
    name: null

  App.User = Ember.Object.extend
    name: null

  App.MessageController = Ember.Controller.extend
    messages: Ember.A()

    init: -> 

    createMessage: (message, user) ->
      @get('messages').addObject App.MessageController.create
          message: message
          name:user

  App.UserController = Ember.Controller.extend
    users: Ember.A()

    init: ->
      storedName = localStorage.getItem 'chatapp:username'

      if storedName?
        App.set 'currentUser', storedName
        App.set 'nameEntered', true

        App.socket.emit 'join', storedName


    createUser: (name) ->
      @get('users').addObject App.User.create
        name: name

    removeUser: (property, value) ->
      object = @findProperty property, value

      @removeObject object


  App.messageController = App.MessageController.create()
  App.userController    = App.UserController.create()


  App.EnterNameView = Ember.TextArea.extend
    insertNewline: ->
      value = @get 'value'

      if value?
        @set 'value', null

        App.socket.emit 'join', value
        App.set 'nameEntered', true

        localStorage.setItem 'chatapp:username', value

  App.CreateMessageView = Ember.TextArea.extend
    insertNewline: ->
      value = @get 'value'

      if value?
        @set 'value', null

        user = App.currentuser

        App.socket.emit 'messages', value

  App.socket.on 'messages', (data) ->
    data = JSON.parse data

    App.messageController.createMessage data.message.replace("<br />", "\n"), data.name

    do App.scrollToBottom


  App.socket.on 'chatters', (data) ->
    data = JSON.parse data

    $.each data, (key, value) ->
      App.userController.createUser value

  App.socket.on 'remove chatter', (name) ->
    App.userController.removeUser 'name', name

  App.socket.on 'add chatter', (name) ->
    App.userController.createUser name

  do App.scrollToBottom

  $(window).unload -> do App.socket.disconnect


  window.Chat = App