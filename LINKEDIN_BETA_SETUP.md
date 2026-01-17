# LinkedIn OAuth & Beta Access Setup

Dit document beschrijft de stappen om de nieuwe LinkedIn OAuth en Beta Access Control features te configureren.

## 1. Database Migraties Uitvoeren

Voer de volgende SQL migraties uit in de Supabase SQL Editor (in deze volgorde):

### Stap 1: Beta Tester Kolom Toevoegen
```bash
# Bestand: supabase/migrations/add_beta_tester_column.sql
```

Deze migratie voegt een `is_beta_tester` boolean kolom toe aan de `profiles` table.

### Stap 2: Waitlist Table Creëren
```bash
# Bestand: supabase/migrations/create_waitlist_table.sql
```

Deze migratie creëert de `waitlist` table voor email signups.

## 2. Environment Variabelen Configureren

Voeg de volgende variabelen toe aan je `.env.local` bestand:

```bash
# LinkedIn OAuth Credentials
NEXT_PUBLIC_LINKEDIN_CLIENT_ID=your_linkedin_client_id_here
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret_here

# Brevo Email Marketing Integration
BREVO_API_KEY=your_brevo_api_key_here
BREVO_WAITLIST_LIST_ID=your_brevo_list_id_here
```

### LinkedIn OAuth Setup

1. Ga naar [LinkedIn Developer Portal](https://www.linkedin.com/developers/)
2. Maak een nieuwe app aan (of gebruik bestaande)
3. Voeg **Redirect URI** toe: `http://localhost:3000/auth/callback` (dev) en `https://jouw-domein.com/auth/callback` (prod)
4. Vraag toegang aan voor **Sign In with LinkedIn using OpenID Connect**
5. Kopieer Client ID en Client Secret

### Brevo Setup

1. Log in op je [Brevo account](https://app.brevo.com)
2. Ga naar **Settings** → **API Keys**
3. Maak een nieuwe API key aan
4. Ga naar **Contacts** → **Lists** en maak een nieuwe lijst aan voor de waitlist
5. Kopieer de List ID (te vinden in de URL of list settings)

## 3. Supabase Auth Provider Configureren

In je Supabase Dashboard:

1. Ga naar **Authentication** → **Providers**
2. Zoek **LinkedIn** en klik op **Enable**
3. Vul in:
   - **Client ID**: Je LinkedIn Client ID
   - **Client Secret**: Je LinkedIn Client Secret
   - **Redirect URL**: Wordt automatisch gegenereerd door Supabase
4. Klik op **Save**

## 4. Beta Testers Toevoegen

Om gebruikers toegang te geven tijdens de beta fase:

```sql
-- Voer uit in Supabase SQL Editor
UPDATE public.profiles 
SET is_beta_tester = true 
WHERE email = 'gebruiker@email.com';
```

Of via de Supabase Dashboard:
1. Ga naar **Table Editor** → **profiles**
2. Zoek de gebruiker
3. Zet `is_beta_tester` op `true`

## 5. Testen

### Test LinkedIn Login
1. Start dev server: `npm run dev`
2. Navigate naar `http://localhost:3000/login`
3. Klik op "Doorgaan met LinkedIn"
4. Verifieer dat OAuth flow werkt
5. Check of redirect correct werkt (beta → dashboard, non-beta → waitlist)

### Test Waitlist Signup
1. Navigate naar `http://localhost:3000/waitlist`
2. Vul een email adres in
3. Submit het formulier
4. Check Supabase `waitlist` table voor de entry
5. Check Brevo dashboard of email is toegevoegd

### Test Access Control
1. **Non-beta user**: Log in → wordt doorverwezen naar `/waitlist`
2. **Beta tester**: Log in → wordt doorverwezen naar `/dashboard`
3. **Non-authenticated**: Probeer protected route → wordt doorverwezen naar `/under-construction`

## 6. Launch Checklist (Over 2 Weken)

Wanneer je klaar bent om te lanceren:

```sql
-- Geef ALLE bestaande users beta toegang
UPDATE public.profiles 
SET is_beta_tester = true;

-- Of: verwijder de beta check volledig door middleware te updaten
```

Alternativement kun je ook:
1. De middleware logica verwijderen/uitcommentariëren
2. Alle users automatisch beta tester maken via een migratie
3. De `is_beta_tester` kolom later gebruiken voor andere features

## Troubleshooting

### LinkedIn login werkt niet
- Check of Redirect URI exact overeenkomt in LinkedIn app en Supabase
- Verifieer dat `linkedin_oidc` provider enabled is in Supabase
- Check browser console voor errors

### Emails komen niet aan in Brevo
- Verifieer API key in `.env.local`
- Check of List ID correct is
- Kijk in Supabase logs voor sync errors
- Test Brevo API direct met Postman/curl

### Users worden verkeerd doorverwezen
- Check `is_beta_tester` status in database
- Verifieer middleware logic
- Check browser console/network tab
- Clear cookies en probeer opnieuw

## Support

Bij problemen, check de implementatie bestanden:
- `middleware.ts` - Access control logic
- `app/auth/callback/route.ts` - OAuth callback
- `app/api/waitlist/route.ts` - Waitlist API
- `components/auth/LinkedInSignInButton.tsx` - LinkedIn button
