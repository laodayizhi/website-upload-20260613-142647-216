(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function initializeMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-nav]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function initializeHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length <= 1) {
            return;
        }
        var activeIndex = 0;
        var timer = null;
        function showSlide(index) {
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === activeIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === activeIndex);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5600);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var index = parseInt(dot.getAttribute("data-hero-dot"), 10);
                showSlide(index);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        start();
    }

    function initializeImageFallback() {
        document.querySelectorAll("img").forEach(function (image) {
            image.addEventListener("error", function () {
                image.classList.add("image-missing");
            });
        });
    }

    function initializeFilters() {
        var panels = document.querySelectorAll("[data-filter-page]");
        panels.forEach(function (panel) {
            var section = panel.closest("section") || document;
            var cards = Array.prototype.slice.call(section.querySelectorAll("[data-movie-card], .ranking-list .horizontal-card"));
            var empty = section.querySelector("[data-empty-state]");
            var inputs = Array.prototype.slice.call(panel.querySelectorAll("input, select"));
            function read(selector) {
                var element = panel.querySelector(selector);
                return element ? normalize(element.value) : "";
            }
            function cardText(card) {
                return normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-tags"),
                    card.textContent
                ].join(" "));
            }
            function apply() {
                var keyword = read("[data-filter-keyword]");
                var year = read("[data-filter-year]");
                var region = read("[data-filter-region]");
                var type = read("[data-filter-type]");
                var category = read("[data-filter-category]");
                var visible = 0;
                cards.forEach(function (card) {
                    var text = cardText(card);
                    var matches = true;
                    if (keyword && text.indexOf(keyword) === -1) {
                        matches = false;
                    }
                    if (year && text.indexOf(year) === -1) {
                        matches = false;
                    }
                    if (region && text.indexOf(region) === -1) {
                        matches = false;
                    }
                    if (type && text.indexOf(type) === -1) {
                        matches = false;
                    }
                    if (category && text.indexOf(category) === -1) {
                        matches = false;
                    }
                    card.style.display = matches ? "" : "none";
                    if (matches) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }
            inputs.forEach(function (input) {
                input.addEventListener("input", apply);
                input.addEventListener("change", apply);
            });
            apply();
        });
    }

    function createResultCard(movie) {
        var article = document.createElement("article");
        article.className = "movie-card";
        article.innerHTML = [
            '<a class="poster-link" href="' + movie.file + '" aria-label="观看' + escapeHtml(movie.title) + '">',
            '<span class="poster-shell">',
            '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" class="poster-img">',
            '<span class="play-chip" aria-hidden="true">▶</span>',
            '</span>',
            '</a>',
            '<div class="movie-card-body">',
            '<div class="meta-row"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
            '<h3><a href="' + movie.file + '">' + escapeHtml(movie.title) + '</a></h3>',
            '<p>' + escapeHtml(movie.oneLine) + '</p>',
            '<div class="tag-row"><span>' + escapeHtml(movie.category) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>',
            '</div>'
        ].join("");
        var image = article.querySelector("img");
        image.addEventListener("error", function () {
            image.classList.add("image-missing");
        });
        return article;
    }

    function escapeHtml(value) {
        return (value || "").toString()
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function initializeSearchPage() {
        var results = document.querySelector("[data-search-results]");
        var empty = document.querySelector("[data-search-empty]");
        var input = document.querySelector("[data-search-input]");
        if (!results || !empty || !input || !window.MOVIE_SEARCH_DATA && typeof MOVIE_SEARCH_DATA === "undefined") {
            return;
        }
        var data = window.MOVIE_SEARCH_DATA || MOVIE_SEARCH_DATA;
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        input.value = initial;
        function render() {
            var query = normalize(input.value);
            results.innerHTML = "";
            if (!query) {
                empty.textContent = "请输入关键词开始搜索";
                empty.classList.add("is-visible");
                return;
            }
            var matched = data.filter(function (movie) {
                var haystack = normalize([
                    movie.title,
                    movie.year,
                    movie.region,
                    movie.type,
                    movie.genre,
                    movie.tags,
                    movie.oneLine,
                    movie.category
                ].join(" "));
                return haystack.indexOf(query) !== -1;
            }).slice(0, 80);
            matched.forEach(function (movie) {
                results.appendChild(createResultCard(movie));
            });
            empty.textContent = "没有找到匹配影片";
            empty.classList.toggle("is-visible", matched.length === 0);
        }
        input.addEventListener("input", render);
        render();
    }

    ready(function () {
        initializeMenu();
        initializeHero();
        initializeImageFallback();
        initializeFilters();
        initializeSearchPage();
    });
}());
