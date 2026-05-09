# Todo — Contactformulier live krijgen via Resend

Volg deze stappen in volgorde. Pas na stap 3 (domein geverifieerd) gaat de mail
daadwerkelijk verzonden worden.

## 1. Domein toevoegen in Resend
- Ga naar https://resend.com/domains
- Klik op **Add Domain** en vul `astro-beata.nl` in
- Resend toont nu een lijst DNS-records (SPF, DKIM, eventueel MX voor return-path)

## 2. DNS-records toevoegen bij domein-provider
- Log in bij de provider waar `astro-beata.nl` gehost is (TransIP / Hostnet / Cloudflare / etc.)
- Voeg alle records exact zoals Resend ze toont toe:
  - 1× TXT-record voor SPF
  - 1× TXT-record voor DKIM (lange waarde — let op dat de hele string wordt overgenomen)
  - 1× MX-record voor de return-path (optioneel maar aanbevolen)
- Sla op

## 3. Wachten op verificatie
- Terug naar Resend → Domains → klik op `astro-beata.nl`
- Status moet veranderen naar **Verified** (meestal 5–30 minuten, soms langer)
- Pas hierna kan vanaf `noreply@astro-beata.nl` gemaild worden

## 4. API key in Vercel zetten
In de project-map (`/Users/hansleemans/projects/astrologie`) draaien:

```bash
vercel env add RESEND_API_KEY
```

- Plak de Resend API key (te vinden in Resend → API Keys)
- Selecteer **Production**, **Preview** én **Development**

## 5. Deployen naar productie

```bash
vercel --prod
```

## 6. Testen
- Open https://www.astro-beata.nl/contact.html
- Vul het formulier in met een testbericht en verzend
- Controleer of de mail aankomt op **info@astro-beata.nl**
- Check ook spam/ongewenst — eerste mails belanden daar soms

## Probleemoplossing
- **"Verzenden mislukt"-melding op het scherm** → check Vercel logs:
  `vercel logs --prod` of via het dashboard onder Functions → contact
- **Mail komt niet aan** → check in Resend dashboard → Logs of de mail verstuurd is
- **DKIM/SPF blijft "Pending"** → DNS kan tot 24 uur duren bij sommige providers
