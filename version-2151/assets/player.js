(() => {
  const configNode = document.getElementById('player-config');
  const video = document.querySelector('[data-player-video]');
  const overlay = document.querySelector('[data-player-overlay]');
  const startButton = document.querySelector('[data-player-start]');

  if (!configNode || !video || !overlay) {
    return;
  }

  let config;
  let mediaReady = false;
  let hlsInstance = null;

  try {
    config = JSON.parse(configNode.textContent || '{}');
  } catch (error) {
    config = {};
  }

  function prepareMedia() {
    if (mediaReady || !config.src) {
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(config.src);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.ERROR, (_, data) => {
        if (!data || !data.fatal || !hlsInstance) {
          return;
        }
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hlsInstance.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hlsInstance.recoverMediaError();
        } else {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = config.src;
    }

    mediaReady = true;
  }

  function start() {
    prepareMedia();
    overlay.classList.add('is-hidden');
    const action = video.play();
    if (action && typeof action.catch === 'function') {
      action.catch(() => {
        overlay.classList.remove('is-hidden');
      });
    }
  }

  overlay.addEventListener('click', start);
  startButton && startButton.addEventListener('click', start);
  video.addEventListener('play', () => overlay.classList.add('is-hidden'));
  video.addEventListener('pause', () => {
    if (!video.ended) {
      overlay.classList.remove('is-hidden');
    }
  });
  video.addEventListener('ended', () => overlay.classList.remove('is-hidden'));
  window.addEventListener('beforeunload', () => {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
