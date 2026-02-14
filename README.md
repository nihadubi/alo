# Alo

Realtime mesajlaşma və səsli otaqlar üçün full-stack tətbiq.

## Quraşdırma

```bash
npm install
```

## Mühit dəyişənləri

`.env.local` faylı yaradın və aşağıdakıları əlavə edin:

```
VITE_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
DATABASE_URL=...
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...
NEXT_PUBLIC_LIVEKIT_URL=...
```

## İşə salma

```bash
npm run server
```

Başqa terminalda:

```bash
npm run dev
```

## Əsas endpoint-lər

- `POST /api/profile/sync`
- `GET /api/communities`
- `POST /api/communities`
- `GET /api/messages?communityId=...`
- `POST /api/messages`
- `POST /api/livekit/token`

## Realtime

- Socket.io server: `http://localhost:4000`
- Frontend proxy: `http://localhost:5173`
