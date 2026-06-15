/* exported getFormState */

'use strict';

// ─── DOM References ───────────────────────────────────────────────────────────
const locationInput = document.getElementById('location');
const locationNote = document.getElementById('location-note');
const geoBtn = document.getElementById('geo-btn');
const dateBtns = document.querySelectorAll('.segmented-btn');
const tagCheckboxes = document.querySelectorAll('.tag-chip__input');
const scoutBtn = document.getElementById('scout-btn');
const scoutAgainBtn = document.getElementById('scout-again-btn');
const refineBtn = document.getElementById('refine-btn');
const emptyRefineBtn = document.getElementById('empty-refine-btn');
const retryBtn = document.getElementById('retry-btn');

const stateIdle = document.getElementById('state-idle');
const stateLoading = document.getElementById('state-loading');
const stateSuccess = document.getElementById('state-success');
const stateEmpty = document.getElementById('state-empty');
const stateError = document.getElementById('state-error');
const inputPanel = document.querySelector('.input-panel');

// ─── State ────────────────────────────────────────────────────────────────────
let currentDateRange = 'this-weekend';
let lastFormState = null;

// ─── Utility ──────────────────────────────────────────────────────────────────
function setUIState(state) {
  stateIdle.hidden = state !== 'idle';
  stateLoading.hidden = state !== 'loading';
  stateSuccess.hidden = state !== 'success';
  stateEmpty.hidden = state !== 'empty';
  stateError.hidden = state !== 'error';
  scoutBtn.disabled = state === 'loading';
}

function getFormState() {
  const selectedTags = Array.from(tagCheckboxes)
    .filter((cb) => cb.checked)
    .map((cb) => cb.value);

  return {
    location: locationInput.value.trim(),
    dateRange: currentDateRange,
    tags: selectedTags,
  };
}

function restoreFormState(state) {
  if (!state) return;
  locationInput.value = state.location;
  currentDateRange = state.dateRange;

  dateBtns.forEach((btn) => {
    const active = btn.dataset.value === state.dateRange;
    btn.setAttribute('aria-pressed', String(active));
    btn.classList.toggle('segmented-btn--active', active);
  });

  tagCheckboxes.forEach((cb) => {
    cb.checked = state.tags.includes(cb.value);
  });
}

function showInputPanel() {
  inputPanel.hidden = false;
  locationInput.focus();
}

function setLocationNote(text) {
  locationNote.textContent = text;
}

// ─── Segmented Control ────────────────────────────────────────────────────────
dateBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    dateBtns.forEach((b) => {
      b.setAttribute('aria-pressed', 'false');
      b.classList.remove('segmented-btn--active');
    });
    btn.setAttribute('aria-pressed', 'true');
    btn.classList.add('segmented-btn--active');
    currentDateRange = btn.dataset.value;
  });
});

// ─── Geolocation ─────────────────────────────────────────────────────────────
geoBtn.addEventListener('click', () => {
  if (!navigator.geolocation) {
    setLocationNote('Geolocation is not supported by your browser. Please type your city.');
    return;
  }

  const originalLabel = geoBtn.getAttribute('aria-label');
  geoBtn.setAttribute('aria-label', 'Detecting your location…');
  geoBtn.disabled = true;

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude: lat, longitude: lon } = position.coords;

      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`, {
        headers: {
          'User-Agent': 'EventScout/1.0 (https://github.com/tomd0627/event-scout)',
          'Accept-Language': 'en',
        },
      })
        .then((res) => res.json())
        .then((data) => {
          const addr = data.address || {};
          const city = addr.city || addr.town || addr.village || addr.county || '';
          const region = addr.state_code || addr.state || addr.country || '';
          const locationLabel = city && region ? `${city}, ${region}` : city;
          if (locationLabel) {
            locationInput.value = locationLabel;
            setLocationNote(`Location set to ${locationLabel}. Your coordinates are not stored.`);
          } else {
            setLocationNote('Could not determine city name. Please type your location.');
          }
        })
        .catch(() => {
          setLocationNote('Could not resolve your location. Please type your city.');
        })
        .finally(() => {
          geoBtn.setAttribute('aria-label', originalLabel);
          geoBtn.disabled = false;
        });
    },
    () => {
      setLocationNote('Location access was denied — please type your city.');
      geoBtn.setAttribute('aria-label', originalLabel);
      geoBtn.disabled = false;
    },
    { timeout: 8000 }
  );
});

// ─── Main Search ──────────────────────────────────────────────────────────────
function runSearch(formState) {
  if (!formState.location) {
    locationInput.focus();
    locationInput.setAttribute('aria-invalid', 'true');
    setLocationNote('Please enter a location to search.');
    return;
  }

  if (/^\d+$/.test(formState.location) && formState.location.length !== 5) {
    locationInput.focus();
    locationInput.setAttribute('aria-invalid', 'true');
    setLocationNote('Please enter a full 5-digit zip code.');
    return;
  }

  if (formState.location.length < 2) {
    locationInput.focus();
    locationInput.setAttribute('aria-invalid', 'true');
    setLocationNote('Please enter a city name or zip code.');
    return;
  }

  locationInput.removeAttribute('aria-invalid');

  lastFormState = formState;

  setUIState('loading');
  renderSkeleton(formState.location);

  scout(formState.location, formState.dateRange, formState.tags)
    .then((data) => {
      if (!data.events || data.events.length === 0) {
        setUIState('empty');
        renderEmpty();
      } else {
        renderEvents(data);
        setUIState('success');
      }
    })
    .catch((err) => {
      renderError(err.message);
      setUIState('error');
    });
}

scoutBtn.addEventListener('click', () => runSearch(getFormState()));

locationInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') runSearch(getFormState());
});

// ─── Scout Again / Refine ────────────────────────────────────────────────────
scoutAgainBtn.addEventListener('click', () => runSearch(lastFormState || getFormState()));

refineBtn.addEventListener('click', () => {
  restoreFormState(lastFormState);
  showInputPanel();
  setUIState('idle');
});

emptyRefineBtn.addEventListener('click', () => {
  restoreFormState(lastFormState);
  showInputPanel();
  setUIState('idle');
});

retryBtn.addEventListener('click', () => {
  if (lastFormState) runSearch(lastFormState);
});

// ─── Init ─────────────────────────────────────────────────────────────────────
setUIState('idle');

if (window.lucide?.createIcons) {
  window.lucide.createIcons();
}
