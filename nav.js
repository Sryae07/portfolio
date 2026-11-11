/* One nav, injected into every page.
   The only reason this file exists: the four pages must never disagree about
   what the menu says. Edit this file and every page changes. */

(function () {
  'use strict';

  var NAV_ITEMS = [
    { href: 'index.html', label: 'Home' },
    { href: 'work.html', label: 'Work' },
    { href: 'notes.html', label: 'Notes' },
    { href: 'about.html', label: 'About' }
  ];

  /* Which page are we on? Compare the last path segment so it works both on
     file:// and on https://<user>.github.io/portfolio/. */
  function currentFile() {
    var parts = window.location.pathname.split('/');
    var last = parts[parts.length - 1];
    return last === '' ? 'index.html' : last;
  }

  function buildList() {
    var list = document.createElement('ul');
    list.className = 'nav-list';
    list.id = 'nav-list';
    NAV_ITEMS.forEach(function (item) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = item.href;
      a.textContent = item.label;
      li.appendChild(a);
      list.appendChild(li);
    });
    return list;
  }

  /* If fetch fails (opened from disk, or a 404), still render a working menu
     instead of an empty header. A navigation that silently disappears is worse
     than one that is a few lines longer. */
  function fallbackNav(host) {
    var nav = document.createElement('nav');
    nav.className = 'nav';
    nav.setAttribute('aria-label', 'Main');

    var brand = document.createElement('a');
    brand.className = 'brand';
    brand.href = 'index.html';
    brand.textContent = 'Jiang Sirui';

    nav.appendChild(brand);
    nav.appendChild(buildList());
    host.textContent = '';
    host.appendChild(nav);
  }

  function markCurrentPage(root) {
    var here = currentFile();
    var links = root.querySelectorAll('.nav-list a');
    Array.prototype.forEach.call(links, function (a) {
      var target = a.getAttribute('href');
      if (target === here) {
        a.setAttribute('aria-current', 'page');
      }
    });
  }

  function wireMobileToggle(root) {
    var toggle = root.querySelector('.nav-toggle');
    var list = root.querySelector('.nav-list');
    if (!toggle || !list) {
      return;
    }

    toggle.addEventListener('click', function () {
      var open = list.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    /* Tabbing out of the menu should close it again — otherwise on a phone the
       menu can cover the page with no obvious way back. */
    list.addEventListener('focusout', function (event) {
      if (event.relatedTarget && !list.contains(event.relatedTarget)) {
        list.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function enhance(host) {
    var root = host.querySelector('.nav') || host;
    markCurrentPage(root);
    wireMobileToggle(root);
  }

  function init() {
    var host = document.querySelector('[data-nav]');
    if (!host) {
      return;
    }

    fetch('nav.html', { cache: 'no-cache' })
      .then(function (response) {
        if (!response.ok) {
          throw new Error('nav.html returned ' + response.status);
        }
        return response.text();
      })
      .then(function (html) {
        host.innerHTML = html;
        enhance(host);
      })
      .catch(function () {
        fallbackNav(host);
        enhance(host);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
