(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  ready(function () {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".site-nav");

    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        nav.classList.toggle("is-open");
      });
    }

    document.querySelectorAll(".site-search-form").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
          return;
        }
      });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var currentSlide = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      currentSlide = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === currentSlide);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === currentSlide);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      showSlide(0);
      window.setInterval(function () {
        showSlide(currentSlide + 1);
      }, 5200);
    }

    var pageInput = document.querySelector(".page-filter-input");
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll(".filter-btn"));
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-title]"));
    var activeType = "all";

    function applyPageFilter() {
      var keyword = normalize(pageInput ? pageInput.value : "");
      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.type,
          card.dataset.year,
          card.dataset.region,
          card.dataset.genre
        ].join(" "));
        var typeMatch = activeType === "all" || normalize(card.dataset.type).indexOf(activeType) !== -1;
        var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
        card.style.display = typeMatch && keywordMatch ? "" : "none";
      });
    }

    if (pageInput) {
      pageInput.addEventListener("input", applyPageFilter);
    }

    filterButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        activeType = normalize(button.getAttribute("data-filter") || "all");
        filterButtons.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        applyPageFilter();
      });
    });

    var searchInput = document.querySelector(".search-page-input");
    var resultArea = document.getElementById("search-results");

    function renderSearchResults() {
      if (!resultArea || !Array.isArray(window.SEARCH_INDEX)) {
        return;
      }
      var query = normalize(searchInput ? searchInput.value : "");
      var items = window.SEARCH_INDEX.filter(function (item) {
        var haystack = normalize([
          item.title,
          item.region,
          item.type,
          item.year,
          item.genre,
          item.tags
        ].join(" "));
        return !query || haystack.indexOf(query) !== -1;
      }).slice(0, 120);

      if (!items.length) {
        resultArea.innerHTML = "<p class=\"empty-text\">暂未找到匹配内容。</p>";
        return;
      }

      resultArea.innerHTML = items.map(function (item) {
        return "<article class=\"movie-card\" data-title=\"" + item.title.replace(/\"/g, "&quot;") + "\">" +
          "<a class=\"movie-poster\" href=\"" + item.url + "\"><img src=\"" + item.cover + "\" alt=\"" + item.title.replace(/\"/g, "&quot;") + "\" loading=\"lazy\"></a>" +
          "<div class=\"movie-card-body\">" +
          "<div class=\"movie-meta-line\"><span>" + item.year + "</span><span>" + item.region + "</span><span>" + item.type + "</span></div>" +
          "<h2><a href=\"" + item.url + "\">" + item.title + "</a></h2>" +
          "<p>" + item.oneLine + "</p>" +
          "<div class=\"tag-row\"><span>" + item.genre + "</span></div>" +
          "</div></article>";
      }).join("");
    }

    if (searchInput && resultArea) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q") || "";
      searchInput.value = q;
      searchInput.addEventListener("input", renderSearchResults);
      renderSearchResults();
    }
  });
})();
