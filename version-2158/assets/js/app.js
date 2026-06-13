function setupVideoPlayer(playerId, sourceUrl) {
    var player = document.getElementById(playerId);
    if (!player) {
        return;
    }

    var video = player.querySelector("video");
    var overlay = player.querySelector(".player-overlay");
    var button = player.querySelector(".player-play-button");
    var loaded = false;
    var hlsInstance = null;

    function attachSource() {
        if (loaded || !video || !sourceUrl) {
            return;
        }

        loaded = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = sourceUrl;
        } else if (window.Hls && Hls.isSupported()) {
            hlsInstance = new Hls();
            hlsInstance.loadSource(sourceUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = sourceUrl;
        }
    }

    function startPlayback(event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        attachSource();
        player.classList.add("is-playing");
        video.controls = true;

        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {});
        }
    }

    if (overlay) {
        overlay.addEventListener("click", startPlayback);
    }

    if (button) {
        button.addEventListener("click", startPlayback);
    }

    if (video) {
        video.addEventListener("click", function () {
            if (!loaded) {
                startPlayback();
            }
        });
    }

    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
}

(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
        } else {
            document.addEventListener("DOMContentLoaded", callback);
        }
    }

    function initMobileMenu() {
        var button = document.querySelector(".mobile-menu-button");
        var panel = document.querySelector(".mobile-panel");
        if (!button || !panel) {
            return;
        }

        button.addEventListener("click", function () {
            var open = panel.classList.toggle("is-open");
            button.setAttribute("aria-expanded", open ? "true" : "false");
            button.textContent = open ? "×" : "☰";
        });
    }

    function initHero() {
        document.querySelectorAll(".hero-carousel").forEach(function (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
            var prev = carousel.querySelector(".hero-button.prev");
            var next = carousel.querySelector(".hero-button.next");
            var index = 0;
            var timer = null;

            if (!slides.length) {
                return;
            }

            function show(nextIndex) {
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === index);
                });
            }

            function restart() {
                if (timer) {
                    window.clearInterval(timer);
                }
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 5800);
            }

            if (prev) {
                prev.addEventListener("click", function () {
                    show(index - 1);
                    restart();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    show(index + 1);
                    restart();
                });
            }

            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener("click", function () {
                    show(dotIndex);
                    restart();
                });
            });

            show(0);
            restart();
        });
    }

    function initCatalogFilters() {
        document.querySelectorAll("[data-catalog]").forEach(function (catalog) {
            var input = catalog.querySelector("[data-filter-input]");
            var year = catalog.querySelector("[data-filter-year]");
            var type = catalog.querySelector("[data-filter-type]");
            var cards = Array.prototype.slice.call(catalog.querySelectorAll(".movie-card"));

            function filter() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var yearValue = year ? year.value : "";
                var typeValue = type ? type.value : "";

                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-year")
                    ].join(" ").toLowerCase();
                    var matchedQuery = !query || haystack.indexOf(query) !== -1;
                    var matchedYear = !yearValue || card.getAttribute("data-year") === yearValue;
                    var matchedType = !typeValue || card.getAttribute("data-type") === typeValue;
                    card.style.display = matchedQuery && matchedYear && matchedType ? "" : "none";
                });
            }

            [input, year, type].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", filter);
                    control.addEventListener("change", filter);
                }
            });
        });
    }

    function cardMarkup(item) {
        return [
            '<article class="movie-card card hover-lift">',
            '<a class="poster-link" href="' + item.url + '">',
            '<img src="' + item.cover + '" alt="' + item.title + '" loading="lazy">',
            '<span class="play-chip">播放</span>',
            '</a>',
            '<div class="movie-card-body">',
            '<div class="movie-meta-line"><span>' + item.year + '</span><span>' + item.region + '</span><span>' + item.type + '</span></div>',
            '<h3><a href="' + item.url + '">' + item.title + '</a></h3>',
            '<p>' + item.oneLine + '</p>',
            '<div class="movie-stats"><span>★ ' + item.rating + '</span><span>' + item.category + '</span><span>' + item.genre + '</span></div>',
            '</div>',
            '</article>'
        ].join("");
    }

    function initSearchPage() {
        var root = document.querySelector("[data-search-page]");
        if (!root || !window.MOVIE_SEARCH_INDEX) {
            return;
        }

        var input = root.querySelector("[name='q']");
        var results = root.querySelector("[data-search-results]");
        var count = root.querySelector("[data-search-count]");
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q") || "";

        if (input) {
            input.value = initialQuery;
        }

        function render(query) {
            var q = query.trim().toLowerCase();
            var items = window.MOVIE_SEARCH_INDEX.filter(function (item) {
                if (!q) {
                    return true;
                }
                return [item.title, item.year, item.region, item.type, item.genre, item.category, item.oneLine].join(" ").toLowerCase().indexOf(q) !== -1;
            }).slice(0, 120);

            if (count) {
                count.textContent = q ? "搜索结果" : "推荐片库";
            }

            if (!items.length) {
                results.innerHTML = '<div class="empty-state">未找到匹配内容，请尝试其他关键词。</div>';
                return;
            }

            results.innerHTML = items.map(cardMarkup).join("");
        }

        if (input) {
            input.addEventListener("input", function () {
                render(input.value);
            });
        }

        render(initialQuery);
    }

    ready(function () {
        initMobileMenu();
        initHero();
        initCatalogFilters();
        initSearchPage();
    });
})();
