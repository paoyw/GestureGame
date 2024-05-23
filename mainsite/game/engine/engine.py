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
        """
        TODO:
        1. Calculate the next state for each user by Spaceship.cal_frame.
            1. Translation
            2. Rotation
            3. Fire
        2. Calculate the next state for each bullet/rock/point by object.cal_frame.
            1. Translation
        3. Collision detection between each user and the bullets/rocks/points.
            1. Collision detection by self.is_collided
            2. Object remove from self.game_state
        """

        for uid in self.game_state["users"]:
            user = self.game_state["users"][uid]
            user.cal_frame(self.game_state)

        bullet_live = []
        for i, bullet in enumerate(self.game_state["bullets"]):
            bullet.cal_frame(self.game_state)
            if not bullet.expired:
                bullet_live.append(i)
        self.game_state["bullets"] = [self.game_state["bullets"][l] for l in bullet_live]

        

    def distance(self, object0, object1):
        return ((object0.x - object1.x) ** 2 +
                (object0.x - object1.x) ** 2) ** 0.5

    def is_collided(self, object0, object1):
        return self.distance(object0, object1) \
            < (object0.radius + object1.radius)

    def get_game_state(self):
        return {
            'users': {k: vars(v) for k, v in self.game_state['users'].items()},
            'bullets': [vars(b) for b in self.game_state['bullets']],
        }
