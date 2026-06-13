document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("[data-player]").forEach(function (shell) {
    var video = shell.querySelector("video");
    var trigger = shell.querySelector(".player-trigger");
    var stream = video ? video.getAttribute("data-stream") : "";
    var ready = false;
    var hlsInstance = null;

    function attach() {
      if (!video || !stream || ready) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new Hls({
          maxBufferLength: 30,
          backBufferLength: 30,
          enableWorker: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }

      ready = true;
    }

    function start() {
      attach();
      shell.classList.add("is-playing");
      var result = video.play();
      if (result && result.catch) {
        result.catch(function () {});
      }
    }

    if (trigger) {
      trigger.addEventListener("click", start);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (!ready) {
          start();
        }
      });
      video.addEventListener("ended", function () {
        if (hlsInstance) {
          hlsInstance.stopLoad();
        }
      });
    }
  });
});
