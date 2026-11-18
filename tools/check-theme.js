'use strict';

/* Run with: node tools/check-theme.js (no browser or third-party dependencies). */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const script = fs.readFileSync(path.join(__dirname, '..', 'js', 'main.js'), 'utf8');

function createPage({ systemDark = false, preferences = {}, storageBlocked = false } = {}) {
  const rootAttrs = {};
  const root = {
    setAttribute(name, value) { rootAttrs[name] = value; },
    getAttribute(name) { return rootAttrs[name]; }
  };
  const metaAttrs = {};
  const themeMeta = { setAttribute(name, value) { metaAttrs[name] = value; } };
  const buttons = [];
  const header = { appendChild(element) { buttons.push(element); } };
  const listeners = {};
  const media = {
    matches: systemDark,
    addEventListener(name, handler) { if (name === 'change') this.onChange = handler; }
  };
  const window = {
    location: { href: 'https://upiqrstudio.com/index.html' },
    matchMedia() { return media; },
    addEventListener(name, callback) { listeners[name] = callback; },
    localStorage: {
      getItem(key) {
        if (storageBlocked) throw new Error('Storage disabled');
        return preferences[key] ?? null;
      },
      setItem(key, value) {
        if (storageBlocked) throw new Error('Storage disabled');
        preferences[key] = value;
      }
    }
  };
  const document = {
    readyState: 'complete',
    documentElement: root,
    getElementById() { return null; },
    querySelector(selector) {
      if (selector === '.header-container') return header;
      if (selector === 'meta[name="theme-color"]') return themeMeta;
      return null;
    },
    querySelectorAll() { return []; },
    createElement(tagName) {
      return {
        tagName,
        attributes: {},
        setAttribute(name, value) { this.attributes[name] = value; },
        addEventListener(name, handler) { this[name] = handler; }
      };
    }
  };

  vm.runInNewContext(script, {
    document, window, URL,
    matchMedia: window.matchMedia,
    requestAnimationFrame() {}
  }, { filename: 'js/main.js' });
  assert.equal(buttons.length, 1, 'One theme toggle must appear in the header');
  assert.equal(buttons[0].tagName, 'button');
  assert.equal(buttons[0].attributes['aria-label'], 'Dark mode');
  assert.match(buttons[0].innerHTML, /theme-icon-sun/);
  assert.match(buttons[0].innerHTML, /theme-icon-moon/);
  return { rootAttrs, metaAttrs, button: buttons[0], preferences, media, listeners };
}

const first = createPage({ systemDark: true });
assert.equal(first.rootAttrs['data-theme'], 'dark', 'First visit follows system dark mode');
assert.equal(first.button.attributes['aria-pressed'], 'true');
assert.equal(first.metaAttrs.content, '#0b1612');
first.button.click();
assert.equal(first.rootAttrs['data-theme'], 'light', 'Click switches to light');
assert.equal(first.button.attributes['aria-pressed'], 'false');
assert.equal(first.button.title, 'Switch to dark mode');
assert.equal(first.preferences['upiqr-theme'], 'light', 'Manual preference is saved');
first.button.click();
assert.equal(first.rootAttrs['data-theme'], 'dark', 'Second click switches back');
assert.equal(first.metaAttrs.content, '#0b1612');

const reopened = createPage({ systemDark: false, preferences: first.preferences });
assert.equal(reopened.rootAttrs['data-theme'], 'dark', 'Saved preference survives navigation');
reopened.media.matches = true;
reopened.media.onChange();
assert.equal(reopened.rootAttrs['data-theme'], 'dark', 'System changes do not override saved choice');

const followSystem = createPage();
followSystem.media.matches = true;
followSystem.media.onChange();
assert.equal(followSystem.rootAttrs['data-theme'], 'dark', 'System updates work without saved choice');

const syncAcrossTabs = createPage();
syncAcrossTabs.preferences['upiqr-theme'] = 'dark';
syncAcrossTabs.listeners.storage({ key: 'upiqr-theme' });
assert.equal(syncAcrossTabs.rootAttrs['data-theme'], 'dark', 'Preference syncs across tabs');

const restricted = createPage({ storageBlocked: true });
restricted.button.click();
assert.equal(restricted.rootAttrs['data-theme'], 'dark', 'Toggle works when storage is denied');

console.log('Theme toggle checks passed (system choice, manual switch, persistence, browser color, accessibility, tab sync and restricted storage).');
