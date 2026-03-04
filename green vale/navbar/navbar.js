// navbar.js - tries multiple relative paths to load navbar.html and inject CSS
document.addEventListener('DOMContentLoaded', function () {
  const candidates = [
    'navbar/navbar.html',
    './navbar/navbar.html',
    '../navbar/navbar.html',
    '../../navbar/navbar.html'
  ];

  // try fetch each candidate until success
  function tryFetch(list) {
    if (!list.length) return Promise.reject('navbar not found');
    const path = list[0];
    return fetch(path)
      .then(res => {
        if (!res.ok) throw new Error('not ok');
        return res.text().then(html => ({html, path}));
      })
      .catch(() => tryFetch(list.slice(1)));
  }

  tryFetch(candidates).then(({html, path}) => {
    // inject navbar html into container
    let container = document.getElementById('navbar-container');
    if (!container) {
      // create at top of body if missing
      container = document.createElement('div');
      container.id = 'navbar-container';
      document.body.insertBefore(container, document.body.firstChild);
    }
    container.innerHTML = html;

    // derive css path from html path
    const base = path.replace(/navbar\.html$/,'');
    const cssHref = base + 'navbar.css';

    // inject CSS only once
    if (!document.querySelector('link[data-gg-navbar]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = cssHref;
      link.setAttribute('data-gg-navbar','1');
      document.head.appendChild(link);
    }

    // Now load behavior script (for mobile click toggles)
    bindMoreToggle();
  }).catch(err => {
    console.warn('Navbar not loaded:', err);
  });

  function bindMoreToggle(){
    // delegate because navbar may be injected later
    const checkAndBind = () => {
      const moreBtn = document.querySelector('.gg-more-btn');
      const moreItem = document.querySelector('.gg-item.gg-more');
      if (!moreBtn || !moreItem) return;
      // toggle on click (mobile)
      moreBtn.addEventListener('click', function(e){
        e.preventDefault();
        const expanded = moreBtn.getAttribute('aria-expanded') === 'true';
        moreBtn.setAttribute('aria-expanded', String(!expanded));
        moreItem.classList.toggle('active');
      });
      // close when clicking outside
      document.addEventListener('click', function(e){
        if (!moreItem.contains(e.target)) {
          moreItem.classList.remove('active');
          moreBtn.setAttribute('aria-expanded','false');
        }
      });
      // esc key closes
      document.addEventListener('keydown', function(e){
        if (e.key === 'Escape'){
          moreItem.classList.remove('active');
          moreBtn.setAttribute('aria-expanded','false');
        }
      });
    };

    // if not yet injected, retry shortly
    if (!document.querySelector('.gg-more-btn')) {
      setTimeout(checkAndBind, 100);
    } else checkAndBind();
  }
});
