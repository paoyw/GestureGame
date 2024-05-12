import { registeredNotifiers } from "./handlandmarker.js";

const roomName = JSON.parse(document.getElementById("room-name").textContent);

const webSocket = new WebSocket(
  "ws://" + window.location.host + "/ws/game/" + roomName + "/"
);

var uid = undefined;
var masterInterval = undefined;

function setuid(new_uid) {
  uid = new_uid;
}

function setmasteruid() {
  masterInterval = setInterval(cal_frame, 100);
}

function cal_frame() {
  webSocket.send(JSON.stringify({ uid: uid, "procedure-code": "cal_frame" }));
}

function render(game_state) {
  document.getElementById("game-state-text").innerText = JSON.stringify(game_state);
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