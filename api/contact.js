import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const ONTVANGER = 'info@astro-beata.nl';
const AFZENDER = 'Astro-Beata <noreply@astro-beata.nl>';

const DIENST_LABELS = {
  geboortehoroscoop: 'Geboortehoroscoop sessie',
  relatiehoroscoop: 'Relatiehoroscoop sessie',
  ontwikkelingsfasen: 'Horoscoop ontwikkelingsfasen & levenscyclus',
  spiritueel: 'Spirituele horoscoop sessie',
  jaarhoroscoop: 'Jaarhoroscoop sessie',
  workshop: 'Workshop',
  anders: 'Anders / algemene vraag',
};

const GEVONDEN_LABELS = {
  google: 'Google',
  kennis: 'Kennis of vriend',
  socialmedia: 'Sociale media',
};

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body ?? {};
  const voornaam = (body.voornaam || '').trim();
  const achternaam = (body.achternaam || '').trim();
  const email = (body.email || '').trim();
  const telefoon = (body.telefoon || '').trim();
  const dienst = (body.dienst || '').trim();
  const voorkeur = (body.voorkeur || '').trim();
  const bericht = (body.bericht || '').trim();
  const gevonden = (body.gevonden || '').trim();
  const akkoord = body.akkoord === true || body.akkoord === 'on' || body.akkoord === 'true';

  if (!voornaam || !achternaam || !email || !dienst || !bericht || !gevonden || !akkoord) {
    return res.status(400).json({ error: 'Vul alle verplichte velden in.' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Ongeldig e-mailadres.' });
  }

  const dienstLabel = DIENST_LABELS[dienst] || dienst;
  const gevondenLabel = GEVONDEN_LABELS[gevonden] || gevonden;
  const naam = `${voornaam} ${achternaam}`.trim();

  const html = `
    <h2 style="font-family:Georgia,serif;color:#1a3a5c;">Nieuw bericht via astro-beata.nl</h2>
    <table cellpadding="6" style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse;">
      <tr><td><strong>Naam:</strong></td><td>${escapeHtml(naam)}</td></tr>
      <tr><td><strong>E-mail:</strong></td><td>${escapeHtml(email)}</td></tr>
      <tr><td><strong>Telefoon:</strong></td><td>${escapeHtml(telefoon || '-')}</td></tr>
      <tr><td><strong>Dienst:</strong></td><td>${escapeHtml(dienstLabel)}</td></tr>
      <tr><td><strong>Voorkeur datum/tijd:</strong></td><td>${escapeHtml(voorkeur || '-')}</td></tr>
      <tr><td><strong>Hoe gevonden:</strong></td><td>${escapeHtml(gevondenLabel)}</td></tr>
    </table>
    <h3 style="font-family:Georgia,serif;color:#1a3a5c;margin-top:24px;">Bericht</h3>
    <p style="font-family:Arial,sans-serif;font-size:14px;white-space:pre-wrap;">${escapeHtml(bericht)}</p>
  `;

  const text = [
    `Nieuw bericht via astro-beata.nl`,
    ``,
    `Naam: ${naam}`,
    `E-mail: ${email}`,
    `Telefoon: ${telefoon || '-'}`,
    `Dienst: ${dienstLabel}`,
    `Voorkeur datum/tijd: ${voorkeur || '-'}`,
    `Hoe gevonden: ${gevondenLabel}`,
    ``,
    `Bericht:`,
    bericht,
  ].join('\n');

  try {
    const { error } = await resend.emails.send({
      from: AFZENDER,
      to: [ONTVANGER],
      replyTo: email,
      subject: `Contactformulier: ${dienstLabel} — ${naam}`,
      html,
      text,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(502).json({ error: 'Verzenden mislukt. Probeer het later opnieuw.' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Contact handler error:', err);
    return res.status(500).json({ error: 'Onverwachte fout. Probeer het later opnieuw.' });
  }
}
