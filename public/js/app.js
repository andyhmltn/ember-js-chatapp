$(function() {
  "use strict";
  var Chat;
  var socket = io.connect(window.location.hostname);
  Chat = Ember.Application.create({
    rootElement: '#wrapper',
    socket: socket,
    currentUser: null,
    nameEntered: false
  });

  Chat.scrollToBottom = function() { 
    setTimeout(function(){
      $(".chatlist").scrollTop($(".chatlist")[0].scrollHeight);
    }, 500);
  };

  Chat.Message = Ember.Object.extend({
    message: null,
    name: null
  });

  Chat.User = Ember.Object.extend({
    name: null
  });

  Chat.MessageController = Ember.Controller.extend({
    messages: Ember.A(),

    init: function() {},

    createMessage: function(message, user) {
      this.get('messages').addObject(Chat.Message.create({message:message, name:user}));
    }	
  });

  Chat.UserController = Ember.Controller.extend({
    users: Ember.A(),

    init: function() {
      var storedName = localStorage.getItem('chatapp:username');
      if(storedName !== null) {
        Chat.set('currentUser', storedName);
        Chat.set('nameEntered', true);

        Chat.socket.emit('join', storedName);
      }
    },

    createUser: function(name) {
      this.get('users').addObject(Chat.User.create({name:name}));
    },

    removeUser: function(property, value) {
      var object = this.findProperty(property, value);
      this.removeObject(object);
    }
  });

  Chat.messageController = Chat.MessageController.create();
  Chat.userController = Chat.UserController.create();

  Chat.EnterNameView = Ember.TextArea.extend({
    insertNewline: function(e) {
      e.preventDefault();
      var value = this.get('value');

      if (value !== null) {
        this.set('value', null);

        Chat.socket.emit('join', value);
        Chat.set('nameEntered', true);

        localStorage.setItem('chatapp:username', value);
      }
    }
  });

  Chat.CreateMessageView = Ember.TextArea.extend({
    insertNewline: function() {
      var value = this.get('value');

      if (value !== null) {
        this.set('value', null);

        var user = Chat.currentuser;

        if (user !== null) {
          Chat.messageController.createMessage(value, user);
        }
        Chat.socket.emit('messages', value);
      }
    }
  });

  Chat.socket.on('messages', function(data) {
    data = JSON.parse(data);

    Chat.messageController.createMessage(data.message.replace("<br />","\n"), data.name);

    Chat.scrollToBottom();
  });

  Chat.socket.on('chatters', function(data) {
    data = JSON.parse(data);

    $.each(data, function(key, value) {
      Chat.userController.createUser(value);
    });
  });

  Chat.socket.on('remove chatter', function(name) {
    Chat.userController.removeUser('name', name);
  });

  Chat.socket.on('add chatter', function(name) {
    Chat.userController.createUser(name);
  });

  Chat.scrollToBottom();

  $(window).unload(function() {
    Chat.socket.disconnect();
  });
<<<<<<< HEAD
});
=======
  
  return window.Chat = Chat;
});
>>>>>>> e1c8a52... return  Chat as a global
