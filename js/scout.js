/* exported scout */

'use strict';

const SYSTEM_PROMPT =
  'You are a local events curator with deep knowledge of what makes an outing worth the effort. ' +
  "Search for real, upcoming events near the user's location matching their interests and the specified date range. " +
  'Return only valid JSON matching the defined schema. ' +
  'Only include events with confirmed dates and real venues — do not fabricate or hallucinate events. ' +
  "If an event's details are unclear from search results, omit it. " +
  'Prioritize specificity over volume: 5 genuinely great picks beats 10 generic ones. ' +
  "For each event, include a single sentence explaining why it matches the user's stated interests.";

function getDateRangeLabel(value) {
  const now = new Date();
  const dayOfWeek = now.getDay();

  if (value === 'this-weekend') {
    const daysUntilSat = (6 - dayOfWeek + 7) % 7 || 7;
    const sat = new Date(now);
    sat.setDate(now.getDate() + daysUntilSat);
    const sun = new Date(sat);
    sun.setDate(sat.getDate() + 1);
    const fmt = (d) => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    return `this weekend (${fmt(sat)}–${sun.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })})`;
  }

  if (value === 'this-week') {
    const weekEnd = new Date(now);
    weekEnd.setDate(now.getDate() + (7 - dayOfWeek));
    const fmt = (d) => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    return `this week (${fmt(now)}–${weekEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })})`;
  }

  const twoWeeks = new Date(now);
  twoWeeks.setDate(now.getDate() + 14);
  const fmt = (d) => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  return `the next two weeks (${fmt(now)}–${twoWeeks.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })})`;
}

function buildUserMessage(location, dateRangeValue, tags) {
  const dateLabel = getDateRangeLabel(dateRangeValue);
  const tagList = tags.length > 0 ? tags.join(', ') : 'anything interesting';
  const today = new Date().toISOString().split('T')[0];

  return (
    `Find events near ${location} happening ${dateLabel}.\n` +
    `I'm interested in: ${tagList}.\n` +
    `Today's date is ${today}.\n` +
    `Return results as JSON only, no other text, matching this exact schema:\n` +
    `{\n` +
    `  "events": [\n` +
    `    {\n` +
    `      "name": "...",\n` +
    `      "date": "...",\n` +
    `      "time": "...",\n` +
    `      "venue": "...",\n` +
    `      "neighborhood": "...",\n` +
    `      "description": "...",\n` +
    `      "categories": ["..."],\n` +
    `      "cost": "Free | $12 | $20–$35",\n` +
    `      "why_this_pick": "...",\n` +
    `      "source_url": "https://...",\n` +
    `      "source_name": "..."\n` +
    `    }\n` +
    `  ],\n` +
    `  "summary": "One-sentence curation note for this set of results.",\n` +
    `  "search_date": "${today}"\n` +
    `}`
  );
}

async function scout(location, dateRangeValue, tags) {
  const apiKey = window.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error(
      'No API key found. Set window.ANTHROPIC_API_KEY before searching. See README for setup instructions.'
    );
  }

  const userMessage = buildUserMessage(location, dateRangeValue, tags);

  const requestBody = {
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    tools: [{ type: 'web_search_20250305', name: 'web_search' }],
    messages: [{ role: 'user', content: userMessage }],
  };

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (_e) {
      throw new Error(`API request failed with status ${response.status}.`);
    }
    const apiMsg = errorData?.error?.message ?? '';
    throw new Error(`API error (${response.status})${apiMsg ? `: ${apiMsg}` : '.'}`);
  }

  const data = await response.json();

  // Multi-turn: Claude may return tool_use blocks before the final text block.
  // Collect all text blocks and join them.
  const fullText = (data.content || [])
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('');

  if (!fullText.trim()) {
    throw new Error(
      'No event data was returned. Claude may have had trouble finding events for that location.'
    );
  }

  // Strip markdown code fences if Claude wrapped the JSON
  let jsonText = fullText.trim();
  const fenceMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    jsonText = fenceMatch[1].trim();
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonText);
  } catch (_e) {
    throw new Error('The response could not be parsed as event data. Please try again.');
  }

  if (!parsed.events || !Array.isArray(parsed.events)) {
    throw new Error('Unexpected response format. Please try again.');
  }

  return parsed;
}
