// Scroll reveal
(function () {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('in')); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => io.observe(el));
})();

// Mobile nav
(function () {
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('navToggle');
  if (!nav || !toggle) return;
  toggle.addEventListener('click', () => nav.classList.toggle('open'));
  nav.querySelectorAll('.nav-links a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
})();

// Language: Google 웹사이트 번역기로 한국어(원문) / 중국어 전환
(function () {
  const ko = document.querySelector('.lang-ko');
  const zh = document.querySelector('.lang-zh');
  if (!ko || !zh) return;

  const host = location.hostname;
  const domains = ['', host, host.replace(/^www\./, '.')];
  function setCookie(v) {
    domains.forEach(d => {
      document.cookie = 'googtrans=' + v + '; path=/' + (d ? '; domain=' + d : '') + (v ? '' : '; expires=Thu, 01 Jan 1970 00:00:00 GMT');
    });
  }
  function current() {
    const m = document.cookie.match(/(?:^|;\s*)googtrans=([^;]+)/);
    return m && /\/zh/.test(decodeURIComponent(m[1])) ? 'zh' : 'ko';
  }
  function go(lang) {
    setCookie('');
    if (lang === 'zh') setCookie('/ko/zh-CN');
    const url = new URL(location.href);
    url.searchParams.delete('lang');
    location.replace(url.toString());
  }

  // ?lang=zh / ?lang=ko 로 공유 가능한 링크
  const q = new URLSearchParams(location.search).get('lang');
  if (q === 'zh' || q === 'ko') { go(q); return; }

  ko.addEventListener('click', e => { e.preventDefault(); if (current() !== 'ko') go('ko'); });
  zh.addEventListener('click', e => { e.preventDefault(); if (current() !== 'zh') go('zh'); });

  const lang = current();
  (lang === 'zh' ? zh : ko).setAttribute('aria-current', 'true');
  if (lang !== 'zh') return;

  const holder = document.createElement('div');
  holder.id = 'google_translate_element';
  holder.hidden = true;
  document.body.appendChild(holder);
  window.gtInit = function () {
    new google.translate.TranslateElement({ pageLanguage: 'ko', includedLanguages: 'zh-CN', autoDisplay: false }, 'google_translate_element');
  };
  const s = document.createElement('script');
  s.src = 'https://translate.google.com/translate_a/element.js?cb=gtInit';
  document.body.appendChild(s);
})();
