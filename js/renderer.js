/* exported renderEvents, renderSkeleton, renderEmpty, renderError */

'use strict';

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildTagsHtml(categories) {
  if (!categories || categories.length === 0) return '';
  return categories.map((cat) => `<span class="event-tag">${escapeHtml(cat)}</span>`).join('');
}

function buildCostHtml(cost) {
  if (!cost) return '';
  return `<span class="event-cost">${escapeHtml(cost)}</span>`;
}

function buildEventCard(event) {
  const article = document.createElement('article');
  article.className = 'event-card';

  const venueLine = [event.venue, event.neighborhood].filter(Boolean).join(' · ');

  const metaDateHtml =
    event.date || event.time
      ? `<span class="event-card__meta-row">
          <i aria-hidden="true" data-lucide="calendar"></i>
          ${escapeHtml([event.date, event.time].filter(Boolean).join(' · '))}
        </span>`
      : '';

  const metaVenueHtml = venueLine
    ? `<span class="event-card__meta-row">
        <i aria-hidden="true" data-lucide="map-pin"></i>
        ${escapeHtml(venueLine)}
      </span>`
    : '';

  const whyHtml = event.why_this_pick
    ? `<details class="event-why">
        <summary>
          <i aria-hidden="true" data-lucide="chevron-down"></i>
          Why this pick
        </summary>
        <p class="event-why__body">${escapeHtml(event.why_this_pick)}</p>
      </details>`
    : '';

  const sourceName = event.source_name || 'View event';
  const linkHtml =
    event.source_url && event.source_url.startsWith('http')
      ? `<a
          class="event-card__link"
          href="${escapeHtml(event.source_url)}"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="${escapeHtml(event.name)} on ${escapeHtml(sourceName)}"
        >
          <i aria-hidden="true" data-lucide="external-link"></i>
          ${escapeHtml(sourceName)}
        </a>`
      : '';

  article.innerHTML = `
    <div class="event-card__header">
      <h2 class="event-card__title">${escapeHtml(event.name)}</h2>
      <div class="event-card__meta">
        ${metaDateHtml}
        ${metaVenueHtml}
      </div>
    </div>
    <p class="event-card__description">${escapeHtml(event.description)}</p>
    ${whyHtml}
    <div class="event-card__footer">
      <div class="event-card__tags">
        ${buildTagsHtml(event.categories)}
        ${buildCostHtml(event.cost)}
      </div>
      ${linkHtml ? `<div>${linkHtml}</div>` : ''}
    </div>
  `;

  return article;
}

function renderEvents(data) {
  const grid = document.getElementById('events-grid');
  const summaryEl = document.getElementById('results-summary');

  grid.innerHTML = '';

  if (summaryEl && data.summary) {
    summaryEl.textContent = data.summary;
  }

  data.events.forEach((event) => {
    grid.appendChild(buildEventCard(event));
  });

  if (window.lucide?.createIcons) {
    window.lucide.createIcons();
  }
}

function renderSkeleton(location) {
  const announce = document.getElementById('loading-announce');
  if (announce) {
    announce.textContent = `Searching for events${location ? ` near ${location}` : ''}…`;
  }
}

function renderEmpty() {
  // State visibility is toggled by app.js; nothing extra needed here.
}

function renderError(message) {
  const el = document.getElementById('error-message');
  if (el) {
    el.textContent = message || 'An unexpected error occurred. Please try again.';
  }
}
