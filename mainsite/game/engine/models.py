class Spaceship():
    def __init__(self, uid, x, y):
        self.uid = uid
        self.x = x
        self.y = y

class Bullet():
    def __init__(self, uid, x, y, delta_x, delta_y):
        self.uid = uid
        self.x = x
        self.y = y
        self.delta_x = delta_x
        self.delta_y = delta_y


class Rock():
    def __init__(self, x, y, delta_x, delta_y, radius):
        self.x = x
        self.y = y
        self.delta_x = delta_x
        self.delta_y = delta_y
        self.radius = radius

class Points():
    def __init__(self, x, y, point):
        self.x = x
        self.y = y
        self.point = point