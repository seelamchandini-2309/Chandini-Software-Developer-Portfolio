(function () {
  'use strict';
  var GH_USER = 'seelamchandini-2309';
  var EMAIL = 'seelamchandini20@gmail.com';

  /* Footer year */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* Mobile menu */
  var btn = document.getElementById('menu-btn');
  var nav = document.getElementById('site-nav');
  function setMenu(open) {
    nav.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.textContent = open ? 'Close' : 'Menu';
  }
  if (btn && nav) {
    btn.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
    nav.addEventListener('click', function (e) { if (e.target.tagName === 'A') setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  }

  /* Highlight the nav link of the section in view */
  var links = {};
  document.querySelectorAll('#site-nav a[href^="#"]').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        Object.keys(links).forEach(function (k) { links[k].removeAttribute('aria-current'); });
        var a = links[en.target.id]; if (a) a.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['home', 'about', 'skills', 'projects', 'contact'].forEach(function (id) {
      var s = document.getElementById(id); if (s) io.observe(s);
    });
  }

  /* Profile photo: use assets/photo.jpg when present, otherwise the placeholder */
  var photo = document.getElementById('profile-photo');
  function fallback() { photo.removeEventListener('error', fallback); photo.src = 'assets/profile.svg'; }
  if (photo) {
    photo.addEventListener('error', fallback);
    if (photo.complete && photo.naturalWidth === 0) fallback();
  }

  /* Skill logos that fail to load fall back to their text label */
  document.querySelectorAll('.logos img').forEach(function (img) {
    img.addEventListener('error', function () { img.style.display = 'none'; });
  });

  /* GitHub stats from the public API (no key needed) */
  function setStat(key, val) {
    var el = document.querySelector('[data-gh="' + key + '"]');
    if (el) el.textContent = val;
  }
  if (window.fetch) {
    fetch('https://api.github.com/users/' + GH_USER)
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (u) {
        setStat('public_repos', u.public_repos);
        setStat('followers', u.followers);
        setStat('following', u.following);
        return fetch('https://api.github.com/users/' + GH_USER + '/repos?per_page=100');
      })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (repos) {
        setStat('stars', repos.reduce(function (n, r) { return n + (r.stargazers_count || 0); }, 0));
      })
      .catch(function () { /* keep the dashes if the API is unavailable */ });
  }

  /* Contact form: Netlify Forms when hosted on Netlify, otherwise opens an email draft */
  var form = document.getElementById('contact-form');
  var status = document.getElementById('form-status');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(form);
      if (data.get('bot-field')) return;
      status.textContent = 'Sending…';

      function viaEmail() {
        var body = data.get('message') + '\n\nFrom: ' + data.get('name') + ' (' + data.get('email') + ')';
        window.location.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('Portfolio message from ' + data.get('name')) + '&body=' + encodeURIComponent(body);
        status.textContent = 'Opening your email app so you can send the message.';
      }

      if (!/^https?:$/.test(location.protocol)) { viaEmail(); return; }
      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(data).toString()
      }).then(function (r) {
        if (!r.ok) throw new Error(r.status);
        form.reset();
        status.textContent = 'Thanks. Your message was sent.';
      }).catch(viaEmail);
    });
  }
})();
