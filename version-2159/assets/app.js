document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobileMenu = document.querySelector("[data-mobile-menu]");

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function () {
      mobileMenu.classList.toggle("open");
    });
  }

  document.querySelectorAll(".hero-carousel").forEach(function (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dots button"));
    var prev = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
    var index = 0;
    var timer;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function play() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        play();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        play();
      });
    });

    show(0);
    play();
  });

  document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
    var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-card]"));
    var search = scope.querySelector("[data-card-search]");
    var year = scope.querySelector("[data-card-year]");
    var region = scope.querySelector("[data-card-region]");
    var type = scope.querySelector("[data-card-type]");
    var category = scope.querySelector("[data-card-category]");
    var empty = scope.querySelector("[data-empty]");
    var queryFromUrl = new URLSearchParams(window.location.search).get("q");

    if (search && queryFromUrl) {
      search.value = queryFromUrl;
    }

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function match(card, key, value) {
      if (!value) {
        return true;
      }
      return normalize(card.getAttribute(key)).indexOf(normalize(value)) !== -1;
    }

    function apply() {
      var q = search ? normalize(search.value) : "";
      var y = year ? year.value : "";
      var r = region ? region.value : "";
      var t = type ? type.value : "";
      var c = category ? category.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var text = [
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-category"),
          card.getAttribute("data-genre")
        ].join(" ").toLowerCase();
        var ok = (!q || text.indexOf(q) !== -1) &&
          match(card, "data-year", y) &&
          match(card, "data-region", r) &&
          match(card, "data-type", t) &&
          match(card, "data-category", c);

        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("visible", visible === 0);
      }
    }

    [search, year, region, type, category].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    apply();
  });
});
