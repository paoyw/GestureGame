import { registeredNotifiers } from "./handlandmarker.js";
import * as const_values from "./const_values.js";

const roomName = JSON.parse(document.getElementById("room-name").textContent);

const webSocket = new WebSocket(
  "ws://" + window.location.host + "/ws/game/" + roomName + "/"
);

const canvas = document.getElementById("game-area-canvas");
const ctx = canvas.getContext("2d");

const map_canvas = document.getElementById("game-map-canvas");
const map_ctx = map_canvas.getContext("2d");

var uid = undefined;
var masterInterval = undefined;

var socket_pool = [];

setInterval(function () {
  while (socket_pool.length > 0) {
    const message = socket_pool.shift();
    webSocket.send(message);
  }
}, 50);

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

// Chat room region
document.addEventListener("DOMContentLoaded", (event) => {
  document.querySelector("#draft").focus();

  document.querySelector("#draft").onkeyup = function (e) {
    if (e.keyCode === 13) {
      // Enter key is pressed
      document.querySelector("#textsubmit").click();
    }
  };

  document.querySelector("#textsubmit").onclick = function (e) {
    var messageInput = document.querySelector("#draft").value;
    socket_pool.push(
      JSON.stringify({
        message: messageInput,
        uid: uid,
        "procedure-code": "textprocessing",
      })
    );
  };
});

//

function setuid(new_uid) {
  uid = new_uid;
  socket_pool.push(
    JSON.stringify({
      message: "I am a new player!",
      uid: uid,
      "procedure-code": "textprocessing",
    })
  );
}

function setmasteruid() {
  masterInterval = setInterval(cal_frame, 50);
}

function getusername(username) {
  webSocket.send(
    JSON.stringify({
      uid: uid,
      "procedure-code": "setusername",
      username: username,
    })
  );
}

function cal_frame() {
  socket_pool.push(JSON.stringify({ uid: uid, "procedure-code": "cal_frame" }));
  // webSocket.send(JSON.stringify({ uid: uid, "procedure-code": "cal_frame"}));
}

function render(game_state) {
  document.getElementById("game-state-text").innerText =
    JSON.stringify(game_state);
  // TODO: Renders the game state.
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  map_ctx.clearRect(0, 0, map_canvas.width, map_canvas.height);

  // Computes the center position.
  let origin_x = game_state["users"][uid].x - const_values.VIEW_WIDTH / 2;
  let origin_y = game_state["users"][uid].y - const_values.VIEW_HEIGHT / 2;

  ctx.beginPath();
  ctx.fillStyle = const_values.BACKGROUND_COLOR;
  ctx.rect(
    0 - origin_x,
    0 - origin_y,
    const_values.AREA_WIDTH,
    const_values.AREA_HEIGHT
  );
  ctx.fill();

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
    if (spaceShip["uid"] == uid) {
      ctx.fillStyle = const_values.SPACESHIP_SELF_COLOR;
      map_ctx.fillStyle = const_values.SPACESHIP_SELF_COLOR;
    } else {
      ctx.fillStyle = const_values.SPACESHIP_OPPO_COLOR;
      map_ctx.fillStyle = const_values.SPACESHIP_OPPO_COLOR;
    }

    ctx.lineWidth = 1e-15;
    ctx.arc(
      spaceShip.x - origin_x,
      spaceShip.y - origin_y,
      spaceShip.radius,
      0,
      2 * Math.PI
    );
    ctx.fill();

    map_ctx.beginPath();
    map_ctx.lineWidth = 1e-15;
    map_ctx.arc(
      (spaceShip.x * const_values.MAP_WIDTH) / const_values.AREA_WIDTH,
      (spaceShip.y * const_values.MAP_HEIGHT) / const_values.AREA_HEIGHT,
      const_values.MAP_SPACESHIP_RADIUS,
      0,
      2 * Math.PI
    );
    map_ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = const_values.HEALTH_COLOR;
    ctx.lineWidth = 1e-15;
    ctx.rect(
      spaceShip.x - origin_x + const_values.HEALTH_X_SHIFT,
      spaceShip.y - origin_y + const_values.HEALTH_Y_SHIFT,
      (spaceShip.health / spaceShip.max_health) * spaceShip.radius * 2,
      const_values.HEALTH_HEIGHT
    );
    ctx.fill();

    ctx.fillStyle = const_values.USERNAME_COLOR;
    ctx.font = const_values.USERNAME_FONT;
    ctx.fillText(
      spaceShip.username,
      spaceShip.x - origin_x + const_values.USERNAME_X_SHIFT,
      spaceShip.y - origin_y + const_values.USERNAME_Y_SHIFT
    );
  }
}

function setact(act) {
  webSocket.send(
    JSON.stringify({ uid: uid, "procedure-code": "setact", action: act })
  );
}

function show_text(username, message) {
  var node = document.createElement("div");
  const textnode = document.createTextNode(username + " : " + message);
  node.appendChild(textnode);
  document.querySelector("#draft").value = "";
  document.getElementById("chatroom").appendChild(node);
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
    case "getusername":
      getusername(getCookie("username"));
      break;
    case "textprint":
      show_text(data["username"], data["message"]);
      break;
    default:
      alert("this should not happen");
  }
};

webSocket.onclose = function (e) {
  console.error("Web socket closed unexpectedly");
};
