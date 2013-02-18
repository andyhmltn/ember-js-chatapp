$(function() {
  "use strict";
  var App;
  var socket = io.connect(window.location.hostname);
  App = Ember.Application.create({
    rootElement: '#wrapper',
    socket: socket,
    currentUser: null,
    nameEntered: false
  });

  App.scrollToBottom = function() { 
    setTimeout(function(){
      $('.chatlist').scrollTop($('.chatlist')[0].scrollHeight);
    }, 500);
  };

  App.Message = Ember.Object.extend({
    message: null,
    name: null
  });

  App.User = Ember.Object.extend({
    name: null
  });

  App.MessageController = Ember.Controller.extend({
    messages: Ember.A(),

    init: function() {},

    createMessage: function(message, user) {
      this.get('messages').addObject(App.Message.create({message:message, name:user}));
    }	
  });

  App.UserController = Ember.Controller.extend({
    users: Ember.A(),

    init: function() {
      var storedName = localStorage.getItem('chatapp:username');
      if(storedName !== null) {
        App.set('currentUser', storedName);
        App.set('nameEntered', true);

        App.socket.emit('join', storedName);
      }
    },

    createUser: function(name) {
      this.get('users').addObject(App.User.create({name:name}));
    },

    removeUser: function(property, value) {
      var object = this.findProperty(property, value);
      this.removeObject(object);
    }
  });

  App.messageController = App.MessageController.create();
  App.userController = App.UserController.create();

  App.EnterNameView = Ember.TextArea.extend({
    insertNewline: function() {
      var value = this.get('value');

      if (value !== null) {
        this.set('value', null);

        App.socket.emit('join', value);
        App.set('nameEntered', true);

        localStorage.setItem('chatapp:username', value);
      }
    }
  });

  App.CreateMessageView = Ember.TextArea.extend({
    insertNewline: function() {
      var value = this.get('value');

      if (value !== null) {
        this.set('value', null);

        var user = App.currentuser;

        App.socket.emit('messages', value);
      }
    }
  });

  App.socket.on('messages', function(data) {
    data = JSON.parse(data);

    App.messageController.createMessage(data.message.replace("<br />","\n"), data.name);

    App.scrollToBottom();
  });

  App.socket.on('chatters', function(data) {
    data = JSON.parse(data);

    $.each(data, function(key, value) {
      App.userController.createUser(value);
    });
  });

  App.socket.on('remove chatter', function(name) {
    App.userController.removeUser('name', name);
  });

  App.socket.on('add chatter', function(name) {
    App.userController.createUser(name);
  });

  App.scrollToBottom();

  $(window).unload(function() {
    App.socket.disconnect();
  });

  return window.Chat = App;
});
