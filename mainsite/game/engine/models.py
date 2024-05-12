from . import consts


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

    def set_action(self, act):
        self.theta = act['theta']
        self.delta_x = act['delta_x']
        self.delta_y = act['delta_y']
        if act['fire'] and self.fire_timer == 0:
            self.fire = True

    def cal_frame(self, game_state):

        if self.fire:
            self.fire_timer = consts.SPACESHIP_FIRE_TIME
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

    def cal_frame(self, game_state):
        return


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
