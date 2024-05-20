import { registeredNotifiers } from "./handlandmarker.js";
import * as const_values from "./const_values.js";

const roomName = JSON.parse(document.getElementById("room-name").textContent);

const webSocket = new WebSocket(
  "ws://" + window.location.host + "/ws/game/" + roomName + "/"
);

const canvas = document.getElementById("game-area-canvas");
const ctx = canvas.getContext("2d");

var uid = undefined;
var masterInterval = undefined;

function setuid(new_uid) {
  uid = new_uid;
}

function setmasteruid() {
  masterInterval = setInterval(cal_frame, 50);
}

function cal_frame() {
  webSocket.send(JSON.stringify({ uid: uid, "procedure-code": "cal_frame" }));
}

function render(game_state) {
  document.getElementById("game-state-text").innerText =
    JSON.stringify(game_state);
  // TODO: Renders the game state.
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Computes the center position.
  let origin_x = game_state["users"][uid].x - const_values.VIEW_WIDTH / 2;
  let origin_y = game_state["users"][uid].y - const_values.VIEW_HEIGHT / 2;

  // Draws points.
  for (var i in game_state["points"]) {
    let point = game_state["points"][i];
    ctx.beginPath();
    ctx.fillStyle = const_values.POINT_COLOR;
    ctx.lineWidth = 1e-15;
    ctx.arc(
      point.x - origin_x,
      point.y - origin_y,
      point.radius,
      0,
      2 * Math.PI
    );
    ctx.stroke();
    ctx.fill();
  }

  // Draws rocks.
  for (var i in game_state["rocks"]) {
    let rock = game_state["rocks"][i];
    ctx.beginPath();
    ctx.fillStyle = const_values.ROCK_COLOR;
    ctx.lineWidth = 1e-15;
    ctx.arc(
      rock.x - origin_x,
      rock.y - origin_y,
      rock.radius,
      0,
      2 * Math.PI
    );
    ctx.stroke();
    ctx.fill();
  }

  //Draws bullets.
  for (var i in game_state["bullets"]) {
    let bullet = game_state["bullets"][i];
    ctx.beginPath();
    ctx.fillStyle = const_values.BULLET_COLOR;
    ctx.lineWidth = 1e-15;
    ctx.arc(
      bullet.x - origin_x,
      bullet.y - origin_y,
      bullet.radius,
      0,
      2 * Math.PI
    );
    ctx.stroke();
    ctx.fill();
  }

  // Draws spaceships.
  for (var i in game_state["users"]) {
    let spaceShip = game_state["users"][i];
    ctx.beginPath();
    ctx.fillStyle = const_values.SPACESHIP_COLOR;
    ctx.lineWidth = 1e-15;
    ctx.arc(
      spaceShip.x - origin_x,
      spaceShip.y - origin_y,
      spaceShip.radius,
      0,
      2 * Math.PI
    );
    ctx.fill();
  }
}

function setact(act) {
  webSocket.send(
    JSON.stringify({ uid: uid, "procedure-code": "setact", action: act })
  );
}

class SetActNotifier {
  constructor() {
    this.notify = (act) => {
      setact(act);
    };
  }
}

registeredNotifiers.push(new SetActNotifier());

webSocket.onmessage = function (e) {
  const data = JSON.parse(e.data);
  switch (data["procedure-code"]) {
    case "setuid":
      setuid(data["uid"]);
      break;
    case "setmasteruid":
      setmasteruid();
      break;
    case "render":
      render(data["game_state"]);
      break;
  }
};

webSocket.onclose = function (e) {
  console.error("Chat socket closed unexpectedly");
};
