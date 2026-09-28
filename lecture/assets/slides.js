/* ============================================================
   환경심리 기반 공간디자인 · 슬라이드 엔진
   가로형 16:9 · 키보드/스와이프/오버뷰/진행바
   로컬 file:// 에서 바로 동작 (일반 스크립트)
   ============================================================ */
(function () {
  "use strict";
  function ready(fn){ if(document.readyState!=="loading") fn();
    else document.addEventListener("DOMContentLoaded",fn); }

  ready(function () {
    var deck = document.querySelector(".deck");
    if (!deck) return;
    var slides = Array.prototype.slice.call(deck.querySelectorAll(".slide"));
    var total = slides.length;
    if (!total) return;

    var idx = 0, overview = false;

    /* ---- Build HUD ---- */
    var hud = document.createElement("div");
    hud.className = "hud";
    hud.innerHTML =
      '<button data-act="prev" aria-label="이전 슬라이드">‹</button>' +
      '<div class="counter"><b id="cur">01</b> / <span id="tot">' + pad(total) + '</span></div>' +
      '<button data-act="overview" aria-label="전체 보기">▦</button>' +
      '<button data-act="next" aria-label="다음 슬라이드">›</button>';
    deck.appendChild(hud);

    var progress = document.createElement("div");
    progress.className = "progress";
    deck.appendChild(progress);

    var hint = document.createElement("div");
    hint.className = "kbhint";
    hint.innerHTML = '<kbd>←</kbd><kbd>→</kbd> 이동 · <kbd>F</kbd> 전체화면 · <kbd>O</kbd> 한눈에 보기';
    deck.appendChild(hint);
    setTimeout(function(){ hint.style.opacity = "0"; }, 4200);

    var curEl = hud.querySelector("#cur");

    /* ---- Auto footer + overview tag ---- */
    var course = deck.getAttribute("data-course") || "";
    var weekLabel = deck.getAttribute("data-week") || "";
    slides.forEach(function (s, i) {
      var tag = document.createElement("span");
      tag.className = "ov-tag";
      tag.textContent = pad(i + 1);
      s.appendChild(tag);

      var dark = s.classList.contains("slide--cover") ||
                 s.classList.contains("slide--section") ||
                 s.classList.contains("slide--closing");
      if (!dark && !s.classList.contains("no-foot") && (course || weekLabel)) {
        var foot = document.createElement("div");
        foot.className = "slide-foot";
        foot.innerHTML = '<span class="k"><span class="dot"></span>' + course + '</span>' +
                         '<span>' + weekLabel + '</span>';
        s.appendChild(foot);
      }
      s.addEventListener("click", function () {
        if (overview) { setOverview(false); go(i); }
      });
    });

    function pad(n){ return (n < 10 ? "0" : "") + n; }

    function render() {
      slides.forEach(function (s, i) {
        s.classList.toggle("is-active", i === idx);
        s.classList.toggle("is-prev", i < idx);
      });
      progress.style.width = (total <= 1 ? 100 : (idx / (total - 1)) * 100) + "%";
      curEl.textContent = pad(idx + 1);
      if (history.replaceState) history.replaceState(null, "", "#" + (idx + 1));
    }

    function go(n) {
      idx = Math.max(0, Math.min(total - 1, n));
      render();
    }
    function next(){ if(idx < total-1) go(idx+1); }
    function prev(){ if(idx > 0) go(idx-1); }

    function setOverview(on) {
      overview = on;
      document.body.classList.toggle("overview", on);
      if (!on) render();
    }
    function toggleFull() {
      var el = document.documentElement;
      if (!document.fullscreenElement) {
        (el.requestFullscreen || el.webkitRequestFullscreen || function(){}).call(el);
      } else {
        (document.exitFullscreen || document.webkitExitFullscreen || function(){}).call(document);
      }
    }

    /* ---- HUD clicks ---- */
    hud.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      var a = b.getAttribute("data-act");
      if (a === "next") next();
      else if (a === "prev") prev();
      else if (a === "overview") setOverview(!overview);
    });

    /* ---- Keyboard ---- */
    document.addEventListener("keydown", function (e) {
      var k = e.key;
      if (k === "ArrowRight" || k === "PageDown" || k === " ") { e.preventDefault(); overview ? null : next(); }
      else if (k === "ArrowLeft" || k === "PageUp") { e.preventDefault(); overview ? null : prev(); }
      else if (k === "Home") { go(0); }
      else if (k === "End") { go(total - 1); }
      else if (k === "f" || k === "F") { toggleFull(); }
      else if (k === "o" || k === "O") { setOverview(!overview); }
      else if (k === "Escape") { if (overview) setOverview(false); }
      else if (/^[0-9]$/.test(k)) { /* number jump buffer */ jump(k); }
    });

    /* number jump: type digits then Enter, or single digit auto after pause */
    var buf = "", bufTimer = null;
    function jump(d){
      buf += d;
      clearTimeout(bufTimer);
      bufTimer = setTimeout(function(){
        var n = parseInt(buf,10); buf="";
        if(!isNaN(n)) go(n-1);
      }, 600);
    }

    /* ---- Touch swipe ---- */
    var x0 = null, y0 = null;
    deck.addEventListener("touchstart", function (e) {
      x0 = e.touches[0].clientX; y0 = e.touches[0].clientY;
    }, { passive: true });
    deck.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      var dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 46 && Math.abs(dx) > Math.abs(dy)) { dx < 0 ? next() : prev(); }
      x0 = y0 = null;
    }, { passive: true });

    /* ---- Wheel (trackpad) — throttled ---- */
    var wheelLock = false;
    deck.addEventListener("wheel", function (e) {
      if (overview) return;
      if (Math.abs(e.deltaY) < 24 && Math.abs(e.deltaX) < 24) return;
      if (wheelLock) return;
      wheelLock = true;
      setTimeout(function(){ wheelLock = false; }, 620);
      var d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      d > 0 ? next() : prev();
    }, { passive: true });

    /* ---- Init from hash ---- */
    var h = parseInt((location.hash || "").replace("#", ""), 10);
    if (!isNaN(h) && h >= 1 && h <= total) idx = h - 1;
    render();

    /* expose minimal API */
    window.Deck = { go: go, next: next, prev: prev, overview: setOverview };
  });
})();
