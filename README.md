# Z

Kleine Twitter/X-clone als mobiele app (React Native + Expo Router).

## Installeren en starten

```bash
npm install
npm run dev
```

## Wat is geïmplementeerd

- Navigatie met tabs: `app/dashboard/_layout.tsx`
- Feed met tweets + “compose” knop: `app/dashboard/index.tsx`
- Tweet maken met ImagePicker, Camera en Notifications: `app/dashboard/create.tsx`
- Zoeken/sorteren/paginatie: `app/dashboard/search.tsx`
- Profiel bekijken en aanpassen (naam/handle/bio/avatar/banner) via Supabase: `app/dashboard/profile.tsx`
- Andere profielen bekijken via handle: `app/dashboard/user/[handle].tsx`
- Login/registratie met Supabase + Google login: `app/login.tsx`, `app/register.tsx`

## Wat (nog) niet geïmplementeerd is

- Likes/dislikes opslaan in de backend (knoppen zijn enkel UI): `components/tweet-card.tsx`
- Tweets opslaan in Supabase (tweets komen nu van de Sample APIs)

## Belangrijke files (kort uitgelegd)

- `context/SupabaseContext.tsx`: Supabase auth (session, login/register, Google OAuth).
- `context/TwitterContext.tsx`: Sample APIs token opslaan + tweets/profiles ophalen + tweet posten.
- `lib/twitter.ts`: fetch calls naar `https://sampleapis.assimilate.be/twitter/...`.
- `lib/supabase.ts`: Supabase client (AsyncStorage session).
- `app/auth/callback.tsx`: redirect scherm na OAuth/email redirect (nodig voor login flow).

## Configuratie

In `.env`:

```
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```
