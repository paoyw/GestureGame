document.querySelector("#username-input").focus();

document.querySelector("#username-input").onkeyup = function (e) {
  if (e.keyCode === 13) {
    document.querySelector("#room-name-input").focus();
  }
};

document.querySelector("#room-name-input").onkeyup = function (e) {
  if (e.keyCode === 13) {
    // enter, return
    document.querySelector("#submit").click();
  }
};
