from . import consts
import math
import random


class Spaceship():
    def __init__(self, uid, x=0, y=0, theta=0, delta_x=0, delta_y=0):
        self.uid = uid
        self.x = x
        self.y = y
        self.theta = theta
        self.delta_x = delta_x
        self.delta_y = delta_y
        self.fire = False
        self.fire_timer = 0

        self.radius = consts.SPACESHIP_RADIUS
        self.max_health = consts.USER_HEALTH
        self.health = consts.USER_HEALTH

    def reset(self):
        self.x = random.randint(0, consts.AREA_WIDTH)
        self.y = random.randint(0, consts.AREA_HEIGHT)
        self.theta = 2 * random.random() * math.pi
        self.fire = False
        self.fire_timer = 0
        self.delta_x = 0
        self.delta_y = 0
        self.health = consts.USER_HEALTH

    def set_action(self, act):
        self.theta = act['theta']
        self.delta_x = act['delta_x']
        self.delta_y = act['delta_y']
        if act['fire'] and self.fire_timer == 0:
            self.fire = True
        else:
            self.fire = False

    def cal_frame(self, game_state):
        self.x = min(max(0, self.x + self.delta_x * consts.USER_SPEED), consts.AREA_WIDTH)
        self.y = min(max(0, self.y + self.delta_y * consts.USER_SPEED), consts.AREA_HEIGHT)
        self.delta_x = 0
        self.delta_y = 0

        if self.fire:
            self.fire_timer = consts.SPACESHIP_FIRE_TIME
            bullet = Bullet(
                uid=self.uid, 
                x=self.x, 
                y=self.y, 
                delta_x=math.cos(self.theta) * consts.BULLET_SPEED,
                delta_y=math.sin(self.theta) * consts.BULLET_SPEED,
            )
            game_state["bullets"].append(bullet)
            self.fire = False
        else:
            self.fire_timer = max(0, self.fire_timer - 1)


class Bullet():
    def __init__(self, uid, x, y, delta_x, delta_y):
        self.uid = uid
        self.x = x
        self.y = y
        self.delta_x = delta_x
        self.delta_y = delta_y

        self.radius = consts.BULLET_RADIUS
        self.timer = consts.BULLET_TIMER
        self.expired = False

    def cal_frame(self, game_state):
        self.x = min(max(0, self.x + self.delta_x), consts.AREA_WIDTH)
        self.y = min(max(0, self.y + self.delta_y), consts.AREA_HEIGHT)
        if self.x == 0 or self.x == consts.AREA_WIDTH:
            self.delta_x *= -1
        if self.y == 0 or self.y == consts.AREA_HEIGHT:
            self.delta_y *= -1
        if self.timer <= 0:
            self.expired = True
        self.timer -= 1


class Rock():
    def __init__(self, x, y, delta_x, delta_y, radius):
        self.x = x
        self.y = y
        self.delta_x = delta_x
        self.delta_y = delta_y
        self.radius = radius

        self.radius = consts.ROCK_RADIUS

    def cal_frame(self, game_state):
        return


class Point():
    def __init__(self, x, y, point):
        self.x = x
        self.y = y
        self.point = point

        self.radius = consts.POINT_RADIUS

    def cal_frame(self, game_state):
        return
