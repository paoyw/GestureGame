import json

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer

from .engine import engine

game_sessions = {}


class GameConsumer(WebsocketConsumer):
    def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'group_{self.room_name}'

        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name, self.channel_name
        )

        self.accept()

        if self.room_name in game_sessions:
            self.game_session = game_sessions[self.room_name]
            self.uid = self.game_session['users'][-1] + 1
            self.game_session['users'].append(self.uid)
            self.game_session['consumers'][self.uid] = self
            self.game_session['engine'].add_user(self.uid)
        else:
            self.uid = 0
            self.game_session = {'masteruid': 0,
                                 'users': [0],
                                 'consumers': {0: self},
                                 'engine': engine.Engine(self.room_name)}
            game_sessions[self.room_name] = self.game_session
            self.game_session['engine'].add_user(self.uid)
            self.send(text_data=json.dumps(
                {'procedure-code': 'setmasteruid', 'uid': self.uid}))

        self.send(text_data=json.dumps(
            {'procedure-code': 'setuid', 'uid': self.uid}))

    def disconnect(self, code):
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name, self.channel_name
        )
        self.game_session['engine'].rm_user(self.uid)
        self.game_session['users'].remove(self.uid)
        self.game_session['consumers'].pop(self.uid)

        if not self.game_session['users']:
            game_sessions.pop(self.room_name)
        elif self.uid == self.game_session['masteruid']:
            self.game_session['masteruid'] = self.game_session['users'][0]
            self.game_session['consumers'][self.game_session['masteruid']].send(
                text_data=json.dumps({'procedure-code': 'setmasteruid', 'uid':  self.game_session['masteruid']}))

    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        match text_data_json['procedure-code']:
            case 'cal_frame':
                self.game_session['engine'].cal_frame()
                game_state = self.game_session['engine'].get_game_state()
                async_to_sync(self.channel_layer.group_send)(
                    self.room_group_name,
                    {"type": "game.message",
                     "game_state": game_state}
                )
            case 'setact':
                print(text_data_json['action'])
                self.game_session['engine'].set_action(self.uid,
                                                       text_data_json['action'])
            case _:
                print('Unsupport action.')

    def game_message(self, event):
        self.send(text_data=json.dumps({"procedure-code": "render", "game_state": event["game_state"]}))
