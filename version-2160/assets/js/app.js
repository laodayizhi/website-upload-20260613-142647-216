(function () {
  function $(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function $all(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function safeText(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function initMenu() {
    var toggle = $("[data-menu-toggle]");
    var menu = $("[data-nav-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = $("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = $all("[data-hero-slide]", hero);
    var tabs = $all("[data-hero-tab]", hero);
    if (!slides.length || !tabs.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      tabs.forEach(function (tab, tabIndex) {
        tab.classList.toggle("is-active", tabIndex === current);
      });
    }

    function schedule() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    tabs.forEach(function (tab, index) {
      tab.addEventListener("click", function () {
        show(index);
        schedule();
      });
    });

    show(0);
    schedule();
  }

  function initLocalFilter() {
    var input = $("[data-local-filter]");
    var select = $("[data-local-select]");
    var cards = $all("[data-card]");
    if (!input || !cards.length) {
      return;
    }

    function apply() {
      var keyword = input.value.trim().toLowerCase();
      var typeValue = select ? select.value : "";
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-filter-text") || "").toLowerCase();
        var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchedType = !typeValue || text.indexOf(typeValue.toLowerCase()) !== -1;
        card.style.display = matchedKeyword && matchedType ? "" : "none";
      });
    }

    input.addEventListener("input", apply);
    if (select) {
      select.addEventListener("change", apply);
    }
  }

  function initPlayer() {
    $all("[data-player]").forEach(function (panel) {
      var video = $("video", panel);
      var button = $("[data-play-trigger]", panel);
      var streamUrl = panel.getAttribute("data-stream");
      var attached = false;

      function attachStream() {
        if (!video || !streamUrl || attached) {
          return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
          panel._hls = hls;
          return;
        }
        video.src = streamUrl;
      }

      function startPlayback() {
        attachStream();
        if (button) {
          button.classList.add("is-hidden");
        }
        if (video) {
          video.controls = true;
          var promise = video.play();
          if (promise && typeof promise.catch === "function") {
            promise.catch(function () {});
          }
        }
      }

      if (button) {
        button.addEventListener("click", startPlayback);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (!attached) {
            startPlayback();
          }
        });
      }
    });
  }

  function createSearchCard(item) {
    var href = "movie/" + safeText(item.id) + ".html";
    var image = "./" + safeText(item.cover) + ".jpg";
    return "" +
      "<a class=\"movie-card\" href=\"" + href + "\">" +
        "<span class=\"poster-wrap\">" +
          "<img src=\"" + image + "\" alt=\"" + safeText(item.title) + "\" loading=\"lazy\">" +
          "<span class=\"card-type\">" + safeText(item.type) + "</span>" +
        "</span>" +
        "<span class=\"movie-card-body\">" +
          "<strong>" + safeText(item.title) + "</strong>" +
          "<span class=\"movie-meta\">" + safeText(item.region) + " · " + safeText(item.year) + " · " + safeText(item.genre) + "</span>" +
          "<span class=\"movie-desc\">" + safeText(item.oneLine) + "</span>" +
        "</span>" +
      "</a>";
  }

  function initSearchPage() {
    var panel = $("[data-search-page]");
    if (!panel || !window.SiteIndex) {
      return;
    }
    var input = $("[data-search-input]", panel);
    var region = $("[data-search-region]", panel);
    var type = $("[data-search-type]", panel);
    var results = $("[data-search-results]");
    var empty = $("[data-search-empty]");
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    if (input && query) {
      input.value = query;
    }

    function render() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var regionValue = region ? region.value : "";
      var typeValue = type ? type.value : "";
      var matched = window.SiteIndex.filter(function (item) {
        var text = [item.title, item.region, item.type, item.year, item.genre, item.tags, item.oneLine].join(" ").toLowerCase();
        var okKeyword = !keyword || text.indexOf(keyword) !== -1;
        var okRegion = !regionValue || item.region.indexOf(regionValue) !== -1;
        var okType = !typeValue || item.type.indexOf(typeValue) !== -1;
        return okKeyword && okRegion && okType;
      }).slice(0, 96);

      if (results) {
        results.innerHTML = matched.map(createSearchCard).join("");
      }
      if (empty) {
        empty.classList.toggle("is-visible", matched.length === 0);
      }
    }

    [input, region, type].forEach(function (control) {
      if (control) {
        control.addEventListener("input", render);
        control.addEventListener("change", render);
      }
    });

    render();
  }

  function initIndexSearch() {
    var form = $("[data-index-search]");
    if (!form) {
      return;
    }
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = $("input", form);
      var query = input ? input.value.trim() : "";
      var url = "search.html" + (query ? "?q=" + encodeURIComponent(query) : "");
      window.location.href = url;
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initHero();
    initLocalFilter();
    initPlayer();
    initSearchPage();
    initIndexSearch();
  });
})();
