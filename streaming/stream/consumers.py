import json
from channels.generic.websocket import WebsocketConsumer # The class we're using
from asgiref.sync import sync_to_async, async_to_sync

stream_session = {}

class ChatConsumer(WebsocketConsumer):
    def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'chat_%s' % self.room_name
        
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name, self.channel_name
        )
        
        self.accept()
        
        if self.room_name in stream_session:
            self.stream_session = stream_session[self.room_name]
            self.uid = str(int(self.stream_session['users'][-1])+1)
            self.stream_session['users'].append(self.uid)
        else:
            self.uid = '0'
            self.stream_session = {
                'Owner_id' : '0',
                'users' : ['0'],
            }
            stream_session[self.room_name] = self.stream_session
            
        self.send(text_data=json.dumps(
            {'code': 'getusername', 'uid':self.uid}
        ))
            
    
    def disconnect(self, close_code):
    # Leave room group
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name, self.channel_name
        )
        if (self.uid == self.stream_session['Owner_id']):
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,{
                    'type' : 'Exit_signal',
                }
            )
            stream_session.pop(self.room_name)
            # raise NotImplementedError("Kick out all users to login.html")
        else:
            self.stream_session['users'].remove(self.uid)
        return 
    

# Receive message from WebSocket
    def receive(self, text_data):
        data = json.loads(text_data)
        if (data['code'] == "setusername"):
            self.username = data['username']
        elif (data['code'] == 'text'):
            message = data['message']
            username = data['username']
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,{
                    'type': 'chat_message',
                    'message': message,
                    'username': username
                }
            )
        else:
            print("Undefined behavior")   
# Receive message from room group

    def chat_message(self, event):
        message = event['message']
        username = event['username']
        self.send(text_data=json.dumps({
            'code':"printtext",
            'msg': message,
            'username': username,
        }))
    
    def Exit_signal(self, event):
        self.send(text_data=json.dumps({
            'code':"exit",
        }))