(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
    }

    function setupFrame(frame) {
        var video = frame.querySelector("video");
        var button = frame.querySelector(".video-play-button");
        var source = frame.getAttribute("data-source");
        var fallback = frame.getAttribute("data-fallback");
        var hls = null;
        var loadedUrl = "";
        if (!video || !source) {
            return;
        }
        function destroyHls() {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
            hls = null;
        }
        function load(url) {
            if (!url || loadedUrl === url) {
                return;
            }
            loadedUrl = url;
            destroyHls();
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(url);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal && fallback && loadedUrl !== fallback) {
                        load(fallback);
                        video.play().catch(function () {});
                    }
                });
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
                return;
            }
            video.src = fallback || url;
        }
        function play() {
            load(source);
            frame.classList.add("is-playing");
            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {
                    frame.classList.remove("is-playing");
                });
            }
        }
        if (button) {
            button.addEventListener("click", function (event) {
                event.preventDefault();
                play();
            });
        }
        frame.addEventListener("click", function (event) {
            if (event.target === video || event.target === frame) {
                play();
            }
        });
        video.addEventListener("play", function () {
            frame.classList.add("is-playing");
        });
        video.addEventListener("pause", function () {
            if (video.currentTime === 0 || video.ended) {
                frame.classList.remove("is-playing");
            }
        });
        video.addEventListener("error", function () {
            if (fallback && loadedUrl !== fallback) {
                load(fallback);
            }
        });
    }

    ready(function () {
        document.querySelectorAll("[data-player]").forEach(setupFrame);
    });
}());
