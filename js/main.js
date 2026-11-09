
/*
=========================================================
Project      : UPI QR Studio
Website      : https://upiqrstudio.com/
Created By   : Sumit Kumar Shakya
Developer    : Solo Creator & Developer
Developed For: RS Businesses
GitHub       : https://github.com/sksumitkumarshakya
Contact      : sksumitkumarshakya@gmail.com

Description  : JavaScript functionality for UPI QR Studio,
               including QR generation, user interactions,
               and other client-side website features.

Year         : 2026
=========================================================
*/

/* Shared site behaviour for all pages. Keep global interactions here. */
(() => {
  'use strict';
  const ready = (fn) => document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', fn, { once: true })
    : fn();

  function initScrollEffects() {
    const progress = document.querySelector('.scroll-progress');
    if (progress) {
      let framePending = false;
      const update = () => {
        framePending = false;
        const scroller = document.scrollingElement;
        const distance = scroller.scrollHeight - scroller.clientHeight;
        const fraction = distance > 0 ? scroller.scrollTop / distance : 0;
        progress.style.setProperty('--reading-progress', Math.min(1, Math.max(0, fraction)));
      };
      const schedule = () => {
        if (framePending) return;
        framePending = true;
        requestAnimationFrame(update);
      };
      window.addEventListener('scroll', schedule, { passive: true });
      window.addEventListener('resize', schedule, { passive: true });
      if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(document.body);
      update();
    }

    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-revealing');
        observer.unobserve(entry.target);
      }
    }, { rootMargin: '0px 0px -40px 0px' });
    // Reveal selected sections when they enter view. Content remains visible
    // when JavaScript is unavailable, motion is reduced, or focus enters it.
    document.querySelectorAll([
      '.home-main > section:not(.hero-section)',
      '.guide-practical-panel',
      '.provider-directory',
      '.safety-core-rules',
      '.safety-scam-library',
      '.about-offerings',
      '.faq-content',
      '.upi-topic-accordion'
    ].join(', ')).forEach((section) => observer.observe(section));
  }

  ready(() => {
    const toggle = document.getElementById('menuToggle');
    const nav = document.getElementById('primaryNavigation');
    const closeMenu = (returnFocus = false) => {
      if (!toggle || !nav) return;
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open navigation menu');
      nav.classList.remove('is-open');
      document.body.classList.remove('menu-is-open');
      if (returnFocus) toggle.focus();
    };

    if (toggle && nav) {
      const header = toggle.closest('.site-header');
      header.classList.add('is-enhanced');
      toggle.addEventListener('click', () => {
        const opening = toggle.getAttribute('aria-expanded') !== 'true';
        toggle.setAttribute('aria-expanded', String(opening));
        toggle.setAttribute('aria-label', opening ? 'Close navigation menu' : 'Open navigation menu');
        nav.classList.toggle('is-open', opening);
        document.body.classList.toggle('menu-is-open', opening);
      });
      nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => closeMenu(false)));
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && nav.classList.contains('is-open')) closeMenu(true);
      });
      document.addEventListener('click', (event) => {
        if (nav.classList.contains('is-open') && !nav.contains(event.target) && !toggle.contains(event.target)) closeMenu(false);
      });
      header.addEventListener('focusout', (event) => {
        if (event.relatedTarget && !header.contains(event.relatedTarget)) closeMenu(false);
      });
      matchMedia('(max-width: 58rem)').addEventListener('change', (event) => {
        if (!event.matches) closeMenu(false);
      });
    }

    document.querySelectorAll('[data-current-year]').forEach((el) => {
      el.textContent = String(new Date().getFullYear());
    });

    // Mark current navigation destination while keeping relative GitHub Pages links intact.
    const current = new URL(window.location.href);
    const normalizedPath = current.pathname.replace(/index\.html$/i, '').replace(/\/$/, '');
    const inGuideLibrary = /\/pages\/(?:upi-guides\/|upi-guides\.html$|upi-guide-topics\.html$)/.test(normalizedPath);
    document.querySelectorAll('#primaryNavigation a[href]').forEach((link) => {
      const target = new URL(link.href, window.location.href);
      const targetPath = target.pathname.replace(/index\.html$/i, '').replace(/\/$/, '');
      if (targetPath === normalizedPath && !target.hash) {
        link.setAttribute('aria-current', 'page');
      } else if (inGuideLibrary && targetPath.endsWith('/pages/upi-guide.html')) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    });

    // Accessible disclosure/accordion controls: use data-accordion-trigger and aria-controls.
    document.querySelectorAll('[data-accordion-trigger]').forEach((button) => {
      button.addEventListener('click', () => {
        const open = button.getAttribute('aria-expanded') === 'true';
        button.setAttribute('aria-expanded', String(!open));
        const panel = document.getElementById(button.getAttribute('aria-controls'));
        if (panel) panel.hidden = open;
      });
    });

    // Static contact page: prepare an email locally; no message is sent by this site.
    const contactForm = document.querySelector('[data-contact-form]');
    if (contactForm) {
      contactForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const emailLink = document.getElementById('contactEmailDisplay');
        const recipient = emailLink?.textContent.trim() || '';
        const status = document.getElementById('contactStatus');
        if (!recipient || recipient.includes('YOUR-CONTACT-EMAIL') || recipient.includes('example.com')) {
          if (status) status.textContent = 'The site owner must add a real contact email in site-config.json, then rebuild the site before this form can prepare an email.';
          return;
        }
        const data = new FormData(contactForm);
        const subject = `[UPI QR Studio] ${String(data.get('topic') || 'Website enquiry')}`;
        const body = [
          `Name: ${data.get('name') || ''}`,
          `Reply email: ${data.get('email') || ''}`,
          `Topic: ${data.get('topic') || ''}`,
          '',
          String(data.get('message') || '')
        ].join('\n');
        const mailto = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        if (status) status.textContent = 'Your email application should open with the message prepared. Review it before sending.';
        window.location.href = mailto;
      });
    }

    // Keep in-page links keyboard accessible without interfering with normal navigation.
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', () => {
        const rawId = link.getAttribute('href').slice(1);
        let target;
        try { target = document.getElementById(decodeURIComponent(rawId)); } catch { target = null; }
        if (target) {
          if (target.classList.contains('main-content-anchor')) target = target.closest('main');
          target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
        }
      });
    });
    initScrollEffects();
  });
})();
