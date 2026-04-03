/**
 * app.js — Obsidian Global Events
 * UI interactions: navigation, GSAP animations,
 * counter, portfolio drag scroll, form validation.
 */

(function () {
  'use strict';

  /* ── GSAP setup ──────────────────────────────────────── */
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    initAnimations();
  }

  /* ── Navigation ──────────────────────────────────────── */
  const navbar  = document.getElementById('navbar');
  const toggle  = document.querySelector('.nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Scroll → add .scrolled class
  const navObserver = new IntersectionObserver(
    ([entry]) => {
      navbar.classList.toggle('scrolled', !entry.isIntersecting);
    },
    { threshold: 0.1 }
  );
  const heroSection = document.getElementById('hero');
  if (heroSection) navObserver.observe(heroSection);

  // Mobile menu toggle
  if (toggle && navMenu) {
    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!isOpen));
      navMenu.classList.toggle('open', !isOpen);
    });

    // Close menu on link click
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        toggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('open');
      });
    });

    // Close on outside click
    document.addEventListener('click', e => {
      if (!navbar.contains(e.target)) {
        toggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('open');
      }
    });
  }

  // Active link highlight on scroll
  const sections = document.querySelectorAll('section[id]');
  const sectionObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => {
            const href = link.getAttribute('href');
            link.classList.toggle('active', href === '#' + entry.target.id);
          });
        }
      });
    },
    { threshold: 0.4 }
  );
  sections.forEach(s => sectionObserver.observe(s));

  /* ── GSAP scroll animations ──────────────────────────── */
  function initAnimations() {
    // Hero content
    const heroItems = document.querySelectorAll('.hero-content [data-gsap]');
    gsap.to(heroItems, {
      opacity: 1,
      y: 0,
      duration: 1.1,
      ease: 'power3.out',
      stagger: 0.15,
      delay: 0.4,
    });
    gsap.set(heroItems, { y: 30 });

    // Generic fade-up elements
    document.querySelectorAll('[data-gsap="fade-up"]').forEach(el => {
      const delay = parseFloat(el.dataset.delay || '0');
      gsap.fromTo(
        el,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          delay,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );
    });

    // Fade right (about text)
    document.querySelectorAll('[data-gsap="fade-right"]').forEach(el => {
      gsap.fromTo(
        el,
        { opacity: 0, x: -50 },
        {
          opacity: 1,
          x: 0,
          duration: 1.0,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );
    });

    // Fade left (about image)
    document.querySelectorAll('[data-gsap="fade-left"]').forEach(el => {
      gsap.fromTo(
        el,
        { opacity: 0, x: 50 },
        {
          opacity: 1,
          x: 0,
          duration: 1.0,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );
    });

    // Expertise cards stagger
    const expertiseCards = document.querySelectorAll('.expertise-card');
    if (expertiseCards.length) {
      gsap.fromTo(
        expertiseCards,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.expertise-grid',
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );
    }

    // Cert cards stagger
    const certCards = document.querySelectorAll('.cert-card');
    if (certCards.length) {
      gsap.fromTo(
        certCards,
        { opacity: 0, scale: 0.95, y: 20 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'back.out(1.3)',
          scrollTrigger: {
            trigger: '.cert-grid',
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );
    }

    // Portfolio horizontal scroll hint animation
    const portfolioWrap = document.querySelector('.portfolio-track-wrap');
    if (portfolioWrap) {
      gsap.fromTo(
        portfolioWrap,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 1,
          scrollTrigger: {
            trigger: portfolioWrap,
            start: 'top 85%',
          },
        }
      );
    }

    // Scroll indicator fade-out
    const scrollInd = document.querySelector('.scroll-indicator');
    if (scrollInd) {
      gsap.to(scrollInd, {
        opacity: 0,
        y: 10,
        ease: 'power1.in',
        scrollTrigger: {
          trigger: '#hero',
          start: 'center top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }
  }

  /* ── Animated counters ───────────────────────────────── */
  const counters = document.querySelectorAll('.stat-number[data-count]');
  if (counters.length) {
    const countObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          countObserver.unobserve(entry.target);
          const el       = entry.target;
          const target   = parseInt(el.dataset.count, 10);
          const duration = 2000; // ms
          const start    = performance.now();

          function step(now) {
            const elapsed  = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased    = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(eased * target).toLocaleString();
            if (progress < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach(c => countObserver.observe(c));
  }

  /* ── Portfolio drag-scroll ───────────────────────────── */
  const track = document.getElementById('portfolioTrack');
  const wrap  = document.querySelector('.portfolio-track-wrap');

  if (track && wrap) {
    let isDown   = false;
    let startX   = 0;
    let scrollL  = 0;
    let velocity = 0;
    let lastX    = 0;
    let rafId    = null;

    wrap.addEventListener('mousedown', e => {
      isDown  = true;
      startX  = e.pageX - wrap.offsetLeft;
      scrollL = wrap.scrollLeft;
      lastX   = e.pageX;
      cancelAnimationFrame(rafId);
    });

    wrap.addEventListener('mouseleave', () => { isDown = false; });
    wrap.addEventListener('mouseup',    () => { isDown = false; startMomentum(); });

    wrap.addEventListener('mousemove', e => {
      if (!isDown) return;
      e.preventDefault();
      velocity  = e.pageX - lastX;
      lastX     = e.pageX;
      const x   = e.pageX - wrap.offsetLeft;
      const walk = (x - startX) * 1.4;
      wrap.scrollLeft = scrollL - walk;
    });

    function startMomentum() {
      function step() {
        if (Math.abs(velocity) < 0.5) return;
        wrap.scrollLeft -= velocity;
        velocity        *= 0.94;
        rafId = requestAnimationFrame(step);
      }
      rafId = requestAnimationFrame(step);
    }

    // Touch support
    let touchStartX  = 0;
    let touchScrollL = 0;
    wrap.addEventListener('touchstart', e => {
      touchStartX  = e.touches[0].pageX;
      touchScrollL = wrap.scrollLeft;
    }, { passive: true });
    wrap.addEventListener('touchmove', e => {
      const dx = touchStartX - e.touches[0].pageX;
      wrap.scrollLeft = touchScrollL + dx;
    }, { passive: true });
  }

  /* ── Contact form ────────────────────────────────────── */
  const form       = document.getElementById('contactForm');
  const submitBtn  = document.getElementById('submitBtn');
  const successMsg = document.getElementById('form-success');
  const errorMsg   = document.getElementById('form-error-msg');

  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!validateForm()) return;

      // Show loading state
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;
      if (successMsg) successMsg.hidden = true;
      if (errorMsg)   errorMsg.hidden   = true;

      try {
        const data = new FormData(form);
        const res  = await fetch('contact.php', {
          method: 'POST',
          body: data,
        });

        if (res.ok) {
          form.reset();
          if (successMsg) successMsg.hidden = false;
          // Smooth scroll to message
          successMsg?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
          throw new Error('Server error');
        }
      } catch {
        if (errorMsg) errorMsg.hidden = false;
      } finally {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
      }
    });

    // Live validation on blur
    form.querySelectorAll('input, textarea, select').forEach(field => {
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', () => clearError(field));
    });
  }

  function validateForm() {
    let valid = true;
    const required = form.querySelectorAll('[required]');
    required.forEach(field => {
      if (!validateField(field)) valid = false;
    });
    if (!valid) {
      // Focus first errored field
      const firstError = form.querySelector('.field-error:not(:empty)');
      firstError?.previousElementSibling?.focus();
    }
    return valid;
  }

  function validateField(field) {
    const errorEl = document.getElementById(field.id + '-error');
    if (!errorEl) return true;

    let message = '';
    if (field.type === 'checkbox' && field.required && !field.checked) {
      message = 'Please accept to proceed.';
    } else if (field.required && !field.value.trim()) {
      message = 'This field is required.';
    } else if (field.type === 'email' && field.value && !isValidEmail(field.value)) {
      message = 'Please enter a valid email address.';
    }

    errorEl.textContent = message;
    field.setAttribute('aria-invalid', String(Boolean(message)));
    return !message;
  }

  function clearError(field) {
    const errorEl = document.getElementById(field.id + '-error');
    if (errorEl) errorEl.textContent = '';
    field.removeAttribute('aria-invalid');
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /* ── Footer year ─────────────────────────────────────── */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ── Smooth scroll for anchor links ──────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ── 3D tilt on cards (pointer move) ────────────────── */
  document.querySelectorAll('.portfolio-card, .expertise-card').forEach(card => {
    card.addEventListener('pointermove', e => {
      const rect  = card.getBoundingClientRect();
      const cx    = rect.left + rect.width  / 2;
      const cy    = rect.top  + rect.height / 2;
      const dx    = (e.clientX - cx) / (rect.width  / 2);
      const dy    = (e.clientY - cy) / (rect.height / 2);
      const rotX  = dy * -5;
      const rotY  = dx *  5;
      card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`;
    });
    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
    });
  });

}());
