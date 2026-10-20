
/*
=========================================================
Project      : UPI QR Studio
Website      : https://rsbusinesses0.github.io/UPI_QR_Studio/
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
    }

    document.querySelectorAll('[data-current-year]').forEach((el) => {
      el.textContent = String(new Date().getFullYear());
    });

    // Mark current navigation destination while keeping relative GitHub Pages links intact.
    const current = new URL(window.location.href);
    const normalizedPath = current.pathname.replace(/index\.html$/i, '').replace(/\/$/, '');
    document.querySelectorAll('#primaryNavigation a[href]').forEach((link) => {
      const target = new URL(link.href, window.location.href);
      const targetPath = target.pathname.replace(/index\.html$/i, '').replace(/\/$/, '');
      if (targetPath === normalizedPath && !target.hash) {
        link.setAttribute('aria-current', 'page');
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
          target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
        }
      });
    });
  });
})();
