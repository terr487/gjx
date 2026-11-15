/* 高甲戏 H5 interactions */
(() => {
  'use strict';
  const body = document.body;
  const root = document.documentElement;
  const curtainButton = document.getElementById('openCurtain');
  const curtainOverlay = document.getElementById('curtainOverlay');
  const progressBar = document.querySelector('.reading-progress__bar');
  const toast = document.getElementById('toast');
  const sceneLinks = Array.from(document.querySelectorAll('.scene-dots a'));
  const scenes = Array.from(document.querySelectorAll('[data-scene]'));
  let toastTimer;

  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2200);
  };

  const openCurtain = () => {
    body.classList.remove('curtain-closed');
    body.classList.add('curtain-opened');
    if (curtainButton) curtainButton.setAttribute('aria-expanded', 'true');
    setTimeout(() => {
      if (curtainOverlay) curtainOverlay.setAttribute('aria-hidden', 'true');
      const firstScene = document.getElementById('prologue');
      if (firstScene) firstScene.focus({ preventScroll: true });
    }, 1350);
  };

  if (curtainButton) {
    curtainButton.addEventListener('click', openCurtain);
    window.setTimeout(() => curtainButton.focus({ preventScroll: true }), 300);
  }

  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    if (progressBar) progressBar.style.width = `${ratio * 100}%`;
  };
  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);

  const revealItems = Array.from(document.querySelectorAll('.reveal, .reveal-left, .image-reveal'));
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px' });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }
  window.setTimeout(() => revealItems.forEach((item) => item.classList.add('is-visible')), 1800);

  if ('IntersectionObserver' in window && scenes.length && sceneLinks.length) {
    const sceneObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        sceneLinks.forEach((link) => {
          const active = link.getAttribute('href') === `#${id}`;
          link.classList.toggle('is-active', active);
          if (active) link.setAttribute('aria-current', 'true');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-38% 0px -52% 0px', threshold: 0 });
    scenes.forEach((scene) => sceneObserver.observe(scene));
  }

  const parallaxItems = Array.from(document.querySelectorAll('.parallax'));
  let ticking = false;
  const updateParallax = () => {
    parallaxItems.forEach((item) => {
      const rect = item.getBoundingClientRect();
      if (rect.bottom < -80 || rect.top > window.innerHeight + 80) return;
      const speed = Number(item.dataset.speed || 0.08);
      const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * speed;
      item.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0) scale(1.035)`;
    });
    ticking = false;
  };
  const requestParallax = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateParallax);
  };
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    updateParallax();
    window.addEventListener('scroll', requestParallax, { passive: true });
  }

  const dustLayers = Array.from(document.querySelectorAll('.dust-layer'));
  dustLayers.forEach((layer) => {
    for (let i = 0; i < 18; i += 1) {
      const dust = document.createElement('span');
      dust.className = 'dust';
      dust.style.left = `${Math.round(Math.random() * 100)}%`;
      dust.style.top = `${Math.round(Math.random() * 100)}%`;
      dust.style.setProperty('--dx', `${Math.round((Math.random() - 0.5) * 80)}px`);
      dust.style.animationDuration = `${7 + Math.random() * 9}s`;
      dust.style.animationDelay = `${-Math.random() * 12}s`;
      dust.style.opacity = `${0.25 + Math.random() * 0.6}`;
      if (Math.random() > 0.72) dust.style.width = dust.style.height = '3px';
      layer.appendChild(dust);
    }
  });

  const shareModal = document.getElementById('shareModal');
  const shareLink = document.getElementById('shareLink');
  const copyButton = document.getElementById('copyLink');
  const shareButtons = Array.from(document.querySelectorAll('[data-open-share]'));
  const shareClose = document.querySelector('.share-close');

  const openShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: '戏台空寂，旧腔新生', text: '一段关于高甲戏与少年伶人的闽南叙事', url: window.location.href });
        return;
      } catch (error) { /* fallback to modal */ }
    }
    if (shareLink) shareLink.textContent = window.location.href;
    if (shareModal) {
      shareModal.classList.add('is-open');
      shareModal.setAttribute('aria-hidden', 'false');
      if (shareClose) shareClose.focus();
    }
  };
  const closeShare = () => {
    if (!shareModal) return;
    shareModal.classList.remove('is-open');
    shareModal.setAttribute('aria-hidden', 'true');
  };
  shareButtons.forEach((button) => button.addEventListener('click', openShare));
  if (shareClose) shareClose.addEventListener('click', closeShare);
  if (shareModal) {
    shareModal.addEventListener('click', (event) => {
      if (event.target === shareModal) closeShare();
    });
  }
  if (copyButton) {
    copyButton.addEventListener('click', async () => {
      const text = window.location.href;
      try {
        await navigator.clipboard.writeText(text);
      } catch (error) {
        const temp = document.createElement('textarea');
        temp.value = text;
        temp.style.position = 'fixed';
        temp.style.opacity = '0';
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        temp.remove();
      }
      copyButton.textContent = '已复制';
      showToast('链接已复制，可以分享给朋友啦');
      setTimeout(() => { copyButton.textContent = '复制'; }, 1800);
    });
  }

  const notesToggle = document.getElementById('notesToggle');
  const notesContent = document.getElementById('notesContent');
  if (notesToggle && notesContent) {
    notesToggle.addEventListener('click', () => {
      const expanded = notesToggle.getAttribute('aria-expanded') === 'true';
      notesToggle.setAttribute('aria-expanded', String(!expanded));
      notesContent.hidden = expanded;
    });
  }

  const scrollTopButton = document.getElementById('scrollTop');
  if (scrollTopButton) {
    scrollTopButton.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeShare();
  });

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    root.classList.add('reduced-motion');
    document.querySelectorAll('.parallax').forEach((item) => { item.style.transform = 'none'; });
  }
})();


