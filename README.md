# Life OS

Personal productivity and knowledge system: plan the year, live the day, keep what you learn.

## Stack

- Backend: NestJS + MongoDB + JWT
- Mobile: Expo / React Native
- Google Docs: server-side OAuth only (refresh tokens never leave the API)

## Local setup

1. Start MongoDB:

```bash
docker compose up -d mongo
```

2. Copy backend env and fill secrets:

```bash
cp backend/.env.example backend/.env
```

Required:

- `MONGODB_URI`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `TOKEN_ENCRYPTION_KEY` (32-byte hex)

Google (optional until you connect Docs):

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI` (default `http://localhost:4000/api/google/oauth/callback`)
- Enable Google Drive API and Google Docs API
- Authorized redirect URI must match `GOOGLE_REDIRECT_URI`

3. Run the API:

```bash
cd backend
npm install
NODE_OPTIONS=--max-old-space-size=4096 npm run start
```

Watch mode (`npm run start:dev`) can OOM on smaller machines. Prefer `npm run start` locally.

API: `http://localhost:4000/api`

4. Mobile — **local development build** (same as Selamnew Collaboration, not Expo Go):

```bash
cd mobile
npm install
```

One-time native APK (when native modules/`app.json` plugins change):

```bash
npx expo prebuild --platform android
npm run android:build
```

Copy `mobile/android/app/build/outputs/apk/debug/app-debug.apk` to the phone and install it (or `npm run android:install` with USB debugging).

Day-to-day JS changes — start Metro, then open **Life OS** and scan the QR:

```bash
npm run start:lan
```

USB instead of Wi‑Fi:

```bash
npm run android:reverse
npm start
```

Set `EXPO_PUBLIC_API_URL` in `mobile/.env` to your PC LAN IP (e.g. `http://192.168.1.10:4000/api`). Restart Metro after changing it. Android emulator: `http://10.0.2.2:4000/api`.

## First use

1. Register
2. Life areas and default habits are seeded automatically
3. Set a personal year start date (not hard-coded)
4. Record today from **Today** or the center **+**

## Tests

```bash
cd backend
npm test
```
