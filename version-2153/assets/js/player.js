(function () {
  var video = document.getElementById("movie-player");
  var button = document.getElementById("play-button");
  var cover = document.getElementById("player-cover");
  var sourceUrl = typeof sitePlayerSource === "string" ? sitePlayerSource : "";
  var hlsReady = false;

  if (!video || !button || !cover || !sourceUrl) {
    return;
  }

  function hideCover() {
    cover.classList.add("is-hidden");
  }

  function playVideo() {
    hideCover();

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      if (video.src !== sourceUrl) {
        video.src = sourceUrl;
      }
      video.play();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (!hlsReady) {
        var hls = new Hls();
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        hlsReady = true;
      }
      video.play();
      return;
    }

    if (video.src !== sourceUrl) {
      video.src = sourceUrl;
    }
    video.play();
  }

  button.addEventListener("click", playVideo);
  cover.addEventListener("click", playVideo);
  video.addEventListener("click", function () {
    if (video.paused) {
      playVideo();
    }
  });
})();
