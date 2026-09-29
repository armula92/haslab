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

// Language links: 현재 페이지를 원문(한국어) 또는 Google 번역(중국어)으로 연결
(function () {
  const ko = document.querySelector('.lang-ko');
  const zh = document.querySelector('.lang-zh');
  if (!ko || !zh) return;
  const path = location.protocol.startsWith('http') ? location.pathname : '/';
  const translated = /translate\.goog$/.test(location.hostname);
  ko.href = 'https://www.haslab.kr' + path;
  zh.href = 'https://www-haslab-kr.translate.goog' + path + '?_x_tr_sl=ko&_x_tr_tl=zh-CN&_x_tr_hl=zh-CN&_x_tr_pto=wapp';
  (translated ? zh : ko).setAttribute('aria-current', 'true');
})();
