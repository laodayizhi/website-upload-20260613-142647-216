(function () {
    var body = document.body;
    var navToggle = document.querySelector('[data-nav-toggle]');

    if (navToggle) {
        navToggle.addEventListener('click', function () {
            body.classList.toggle('nav-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function startAuto() {
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5000);
        }

        function restartAuto() {
            if (timer) {
                window.clearInterval(timer);
            }
            startAuto();
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                restartAuto();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                restartAuto();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                restartAuto();
            });
        }

        startAuto();
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var activeFilter = 'all';

    function cardText(card) {
        return [
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-tags'),
            card.getAttribute('data-category')
        ].join(' ').toLowerCase();
    }

    function applyFilters() {
        var keyword = '';
        searchInputs.forEach(function (input) {
            if (input.value.trim()) {
                keyword = input.value.trim().toLowerCase();
            }
        });

        cards.forEach(function (card) {
            var text = cardText(card);
            var keywordMatch = !keyword || text.indexOf(keyword) !== -1;
            var filterMatch = activeFilter === 'all' || text.indexOf(activeFilter.toLowerCase()) !== -1;
            card.classList.toggle('is-hidden', !(keywordMatch && filterMatch));
        });
    }

    searchInputs.forEach(function (input) {
        input.addEventListener('input', applyFilters);
    });

    filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            activeFilter = button.getAttribute('data-filter') || 'all';
            filterButtons.forEach(function (item) {
                item.classList.toggle('active', item === button);
            });
            applyFilters();
        });
    });

    var video = document.querySelector('[data-stream]');

    if (video) {
        var stream = video.getAttribute('data-stream');
        var overlay = document.querySelector('[data-play-button]');
        var wrap = document.querySelector('[data-player-wrap]');
        var prepared = false;
        var hls = null;

        function prepareVideo() {
            if (prepared || !stream) {
                return;
            }
            prepared = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
            }
        }

        function startVideo() {
            prepareVideo();
            if (overlay) {
                overlay.classList.add('hidden');
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                startVideo();
            });
        }

        if (wrap) {
            wrap.addEventListener('click', function (event) {
                if (event.target === video && !video.paused) {
                    return;
                }
                startVideo();
            });
        }

        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('hidden');
            }
        });

        video.addEventListener('pause', function () {
            if (overlay && video.currentTime === 0) {
                overlay.classList.remove('hidden');
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }
})();
