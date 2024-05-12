import random
import math

from . import consts
from .models import Spaceship, Bullet, Rock, Point


class Engine:
    def __init__(self, room_name):
        self.room_name = room_name
        self.game_state = {
            'users': {},
            'bullets': [],
            'rocks': [],
            'points': [],
        }

    def add_user(self, uid):
        self.game_state['users'][uid] = Spaceship(
            uid,
            x=random.randint(0, consts.AREA_WIDTH),
            y=random.randint(0, consts.AREA_HEIGHT),
            theta=2 * random.random() * math.pi
        )

    def rm_user(self, uid):
        if uid not in self.game_state['users']:
            return
        self.game_state['users'].pop(uid)

    def set_action(self, uid, act):
        if uid not in self.game_state['users']:
            return
        self.game_state['users'][uid].set_action(act)

    def cal_frame(self):
        pass

    def get_game_state(self):
        return {
            'users': {k: vars(v) for k, v in self.game_state['users'].items()},
        }
