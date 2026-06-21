/* ============================================================
   moros — shared behaviour
   scroll reveal · nav · mobile menu · price converter · form
   ============================================================ */

(function () {
  "use strict";

  // Always land at the top on every load/reload — prevent browser scroll restoration
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);

  function initBackground() {
    // No background — plain black from CSS.
  }

  /* ---- Loader / page transitions ---- */
  function initLoader() {
    var loader = document.getElementById("loader");
    if (!loader) return;

    // Coming from an internal page link: use loader as a dark fade-in overlay
    if (sessionStorage.getItem("moros_nav")) {
      sessionStorage.removeItem("moros_nav");
      loader.classList.add("pg-enter");
      setTimeout(function () {
        loader.classList.add("done");
        setTimeout(function () { loader.style.display = "none"; }, 750);
      }, 260);
      return;
    }

    // Same-session direct visit: skip loader entirely
    if (sessionStorage.getItem("moros_loaded")) {
      loader.style.display = "none";
      return;
    }

    // First-ever visit: full branded animation
    var bar = loader.querySelector(".loader-bar");
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        if (bar) bar.classList.add("go");
      });
    });
    setTimeout(function () {
      loader.classList.add("done");
      setTimeout(function () {
        loader.style.display = "none";
        sessionStorage.setItem("moros_loaded", "1");
      }, 750);
    }, 1350);
  }

  /* ---- Page transitions ---- */
  function initPageTransitions() {
    document.addEventListener("click", function (e) {
      var link = e.target.closest("a[href]");
      if (!link) return;
      var href = link.getAttribute("href");
      if (!href || href.charAt(0) === "#") return;
      if (href.indexOf("mailto:") === 0 || href.indexOf("tel:") === 0) return;
      if (link.target === "_blank") return;
      try {
        var url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return;
      } catch (err) { return; }
      sessionStorage.setItem("moros_nav", "1");
    });
  }

  /* ---- Scroll reveal ---- */
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---- Nav background on scroll ---- */
  function initNav() {
    var nav = document.getElementById("nav");
    if (!nav) return;
    var onScroll = function () {
      if (window.scrollY > 40) nav.classList.add("scrolled");
      else nav.classList.remove("scrolled");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---- Mobile menu ---- */
  function initMenu() {
    var toggle = document.querySelector(".nav-toggle");
    var links = document.querySelector(".nav-links");
    if (!toggle || !links) return;
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.classList.toggle("open", open);
      document.body.style.overflow = open ? "hidden" : "";
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("open");
        toggle.classList.remove("open");
        document.body.style.overflow = "";
      });
    });
  }

  /* ---- Price converter ---- */
  // Indicative fixed rates relative to EUR base. Swap for live FX if wired to a backend.
  var RATES = {
    EUR: { symbol: "€", rate: 1,    label: "EUR" },
    USD: { symbol: "$",      rate: 1.08, label: "USD" },
    GBP: { symbol: "£", rate: 0.85, label: "GBP" }
  };
  var BASE_EUR = 2499;

  function formatPrice(cur) {
    var r = RATES[cur];
    var value = Math.round(BASE_EUR * r.rate);
    return r.symbol + value.toLocaleString("en-US");
  }

  function initConverter() {
    var amount = document.getElementById("price-amount");
    var sw = document.querySelector(".price-switch");
    if (!amount || !sw) return;
    sw.querySelectorAll("button").forEach(function (b) {
      b.addEventListener("click", function () {
        sw.querySelectorAll("button").forEach(function (x) { x.classList.remove("active"); });
        b.classList.add("active");
        amount.textContent = formatPrice(b.dataset.cur);
      });
    });
  }

  /* ---- Contact form ---- */
  function initForm() {
    var form = document.getElementById("apply-form");
    if (!form) return;
    var formView = document.getElementById("form-view");
    var successView = document.getElementById("success-view");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      // No backend wired — replace with your endpoint (Formspree, API, etc.)
      if (formView && successView) {
        formView.style.display = "none";
        successView.style.display = "block";
        successView.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initBackground();
    initLoader();
    initPageTransitions();
    initReveal();
    initNav();
    initMenu();
    initConverter();
    initForm();
  });
})();
