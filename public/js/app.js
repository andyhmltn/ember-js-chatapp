$(function() {
	Chat = Ember.Application.create({
		rootElement: '#wrapper',
		socket: new io.connect(window.location.hostname),
		currentUser: null
	});

	Chat.scroll_to_bottom = function() { 
		setTimeout(function(){
		  $(".chatlist").scrollTop($(".chatlist")[0].scrollHeight);
		}, 500);
	}

	Chat.Message = Ember.Object.extend({
		message: null,
		name: null
	});

	Chat.MessageController = Ember.Controller.extend({
		messages: Ember.A(),

		init: function()
		{
			messages = this.get('messages');

			// items.addObject(Todos.Todo.create({title: 'Another Item'}));
		},
		
		createMessage: function(message, user)
		{
			this.get('messages').addObject(Chat.Message.create({message:message, name:user}));
		}	
	});

	Chat.messageContoller = Chat.MessageController.create();

	Chat.EnterNameView = Ember.TextArea.extend({
		insertNewline: function(e) {
			var value = this.get('value');

			if(value != null) {
				this.set('value', null);

				Chat.socket.emit('join', value);

				$('#message').show();

				this.remove();
			}
		}
	});

	Chat.CreateMessageView = Ember.TextArea.extend({
		insertNewline: function() {
			var value = this.get('value');

			if (value != null) {
				this.set('value', null);

				var user = Chat.currentuser;

				if(user != null) Chat.messageContoller.createMessage(value, user);
				Chat.socket.emit('messages', value);
			}
		}
	});

	Chat.socket.on('messages', function(data) {
		data = JSON.parse(data);

		Chat.messageContoller.createMessage(data.message.replace("<br />","\n"), data.name);

		Chat.scroll_to_bottom();
	});

	Chat.scroll_to_bottom();
});