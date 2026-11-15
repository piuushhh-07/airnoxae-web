'use strict';

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const requests = new Map();

function reply(res, status, body) {
  res.setHeader('Cache-Control', 'no-store');
  res.status(status).json(body);
}

function clean(value, max) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return reply(res, 405, { error: 'Method not allowed.' });
  }

  const origin = req.headers.origin;
  const host = req.headers.host;
  if (origin) {
    try {
      if (new URL(origin).host !== host) return reply(res, 403, { error: 'Invalid origin.' });
    } catch {
      return reply(res, 403, { error: 'Invalid origin.' });
    }
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  if (clean(body.website, 200)) return reply(res, 200, { ok: true });

  const name = clean(body.Name, 100);
  const email = clean(body.Email, 254);
  const projectType = clean(body['Project type'], 100);
  const description = clean(body.Description, 3000);
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  if (name.length < 2 || !emailPattern.test(email) || !projectType || description.length < 10) {
    return reply(res, 400, { error: 'Please check the required enquiry fields.' });
  }

  const now = Date.now();
  const forwarded = req.headers['x-forwarded-for'];
  const ip = (typeof forwarded === 'string' ? forwarded.split(',')[0] : 'unknown').trim();
  const recent = (requests.get(ip) || []).filter((time) => now - time < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS) {
    return reply(res, 429, { error: 'Too many enquiries. Please try again later.' });
  }
  recent.push(now);
  requests.set(ip, recent);

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const to = process.env.CONTACT_TO_EMAIL || 'info@airnoxaetechnologies.com';
  if (!apiKey || !from) {
    return reply(res, 503, { error: 'Contact email delivery is not configured yet.' });
  }

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeType = escapeHtml(projectType);
  const safeDescription = escapeHtml(description).replace(/\r?\n/g, '<br>');
  const text = [
    'New website enquiry for AIRNOXAE TECHNOLOGIES',
    '',
    'Name: ' + name,
    'Email: ' + email,
    'Project type: ' + projectType,
    '',
    'Project details:',
    description
  ].join('\n');

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: 'Website enquiry: ' + name,
        text,
        html: '<h2>New website enquiry</h2><p><strong>Name:</strong> ' + safeName +
          '</p><p><strong>Email:</strong> ' + safeEmail + '</p><p><strong>Project type:</strong> ' +
          safeType + '</p><p><strong>Project details:</strong><br>' + safeDescription + '</p>'
      })
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error('Resend delivery failed:', response.status, detail.slice(0, 500));
      return reply(res, 502, { error: 'Email delivery failed. Please use the email draft instead.' });
    }
    return reply(res, 200, { ok: true });
  } catch (error) {
    console.error('Contact endpoint error:', error);
    return reply(res, 502, { error: 'Email delivery failed. Please use the email draft instead.' });
  }
};
