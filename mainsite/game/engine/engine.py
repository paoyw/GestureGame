class Engine:
    def __init__(self, room_name):
        self.room_name = room_name
        self.game_state = {
            'users': [],
            'bullets': [],
            'rocks': [],
            'points': [],
        }

    def add_user(self, uid):
        pass

    def rm_user(self, uid):
        pass

    def set_action(self, uid, act):
        pass

    def cal_frame(self):
        pass

    def get_game_state(self):
        return self.game_state
