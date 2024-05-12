import {
  HandLandmarker,
  FilesetResolver,
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";

let handLandmarker = undefined;
let runningMode = "Video";
let enableWebcamButton;
let webcamRunning = false;
export var registeredNotifiers = new Array();

const createHandLandmarker = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
  );
  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
      delegate: "GPU",
    },
    runningMode: runningMode,
    numHands: 2,
  });
  document.getElementById("webcamButton").style.display = "block";
};
createHandLandmarker();

const video = document.getElementById("webcam");
const canvasElement = document.getElementById("webcamCanvas");
const canvasCtx = canvasElement.getContext("2d");
// Check if webcam access is supported.
const hasGetUserMedia = () => {
  var _a;
  return !!((_a = navigator.mediaDevices) === null || _a === void 0
    ? void 0
    : _a.getUserMedia);
};
// If webcam supported, add event listener to button for when user
// wants to activate it.
if (hasGetUserMedia()) {
  enableWebcamButton = document.getElementById("webcamButton");
  enableWebcamButton.addEventListener("click", enableCam);
} else {
  console.warn("getUserMedia() is not supported by your browser");
}
// Enable the live webcam view and start detection.
function enableCam(event) {
  if (!handLandmarker) {
    console.log("Wait! objectDetector not loaded yet.");
    return;
  }
  if (webcamRunning === true) {
    webcamRunning = false;
    enableWebcamButton.innerText = "ENABLE PREDICTIONS";
  } else {
    webcamRunning = true;
    enableWebcamButton.innerText = "DISABLE PREDICTIONS";
  }
  // getUsermedia parameters.
  const constraints = {
    video: true,
  };
  // Activate the webcam stream.
  navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
    video.srcObject = stream;
    video.addEventListener("loadeddata", predictWebcam);
  });
  document.getElementById("webcamButton").style.display = "none";
}
let lastVideoTime = -1;
let results = undefined;

async function predictWebcam() {
  canvasElement.style.width = video.videoWidth;
  canvasElement.style.height = video.videoHeight;
  canvasElement.width = video.videoWidth;
  canvasElement.height = video.videoHeight;
  // Now let's start detecting the stream.
  if (runningMode === "IMAGE") {
    runningMode = "VIDEO";
    await handLandmarker.setOptions({ runningMode: "VIDEO" });
  }
  let startTimeMs = performance.now();
  if (lastVideoTime !== video.currentTime) {
    lastVideoTime = video.currentTime;
    results = handLandmarker.detectForVideo(video, startTimeMs);
  }
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  if (results.landmarks) {
    for (const landmarks of results.landmarks) {
      drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
        color: "#00FF00",
        lineWidth: 5,
      });
      drawLandmarks(canvasCtx, landmarks, { color: "#FF0000", lineWidth: 2 });
    }
    if (results.landmarks.length == 1) {
      // console.log(results);
      controllOneHandMode(
        new Hand(
          results.handednesses[0][0].categoryName == "Right" ? "Left" : "Right",
          results.landmarks[0]
        )
      );
    } else if (results.landmarks.length >= 2) {
      if (results.handednesses[0][0].categoryName == "Right") {
        controllTwoHandMode(
          new Hand("Left", results.landmarks[0]),
          new Hand("Right", results.landmarks[1])
        );
      } else {
        controllTwoHandMode(
          new Hand("Left", results.landmarks[1]),
          new Hand("Right", results.landmarks[0])
        );
      }
    }
    canvasCtx.restore();
    // Call this function again to keep predicting when the browser is ready.
    if (webcamRunning === true) {
      window.requestAnimationFrame(predictWebcam);
    }
  }
}

class Hand {
  constructor(handness, landmarks) {
    this.handness = handness;
    this.landmarks = landmarks;

    this.centroid = () => {
      let result = { x: 0, y: 0, z: 0 };
      this.landmarks.forEach((e) => {
        result.x += e.x / this.landmarks.length;
        result.y += e.y / this.landmarks.length;
        result.z += e.z / this.landmarks.length;
      });
      return result;
    };

    this.threeCentroid = () => {
      let result = { x: 0, y: 0, z: 0 };
      for (var i in [4, 8, 12]) {
        result.x += this.landmarks[i].x / 3;
        result.y += this.landmarks[i].y / 3;
        result.z += this.landmarks[i].z / 3;
      }
      return result;
    };

    this.pointDist = (point0, point1) => {
      return Math.sqrt((point0.x - point1.x) ** 2 + (point0.y - point1.y) ** 2);
    };

    this.threeClose = () => {
      let totalDist =
        this.pointDist(this.landmarks[4], this.landmarks[8]) +
        this.pointDist(this.landmarks[8], this.landmarks[12]) +
        this.pointDist(this.landmarks[12], this.landmarks[4]);
      return totalDist < 0.2;
    };
  }
}

function controllOneHandMode(hand) {
  let result = { delta_x: 0, delta_y: 0, theta: 0, fire: false };
  let centroid = hand.threeCentroid();
  result.theta = Math.atan2(centroid.y - 0.5, 0.5 - centroid.x);
  result.fire = hand.threeClose();
  registeredNotifiers.forEach((e) => {
    e.notify(result);
  });
}

function controllTwoHandMode(leftHand, rightHand) {
  let result = { delta_x: 0, delta_y: 0, theta: 0, fire: false };
  let leftCentroid = leftHand.threeCentroid();
  let rightCentroid = rightHand.threeCentroid();
  leftCentroid.x = 1 - leftCentroid.x;
  rightCentroid.x = 1 - rightCentroid.x;
  result.delta_x = (leftCentroid.x + rightCentroid.x) / 2 - 0.5;
  result.delta_y = (leftCentroid.y + rightCentroid.y) / 2 - 0.5;
  result.theta = Math.atan2(
    rightCentroid.y - leftCentroid.y,
    rightCentroid.x - leftCentroid.x
  ) - Math.PI / 2;
  result.fire = leftHand.threeClose() || rightHand.threeClose();
  registeredNotifiers.forEach((e) => {
    e.notify(result);
  });
}
