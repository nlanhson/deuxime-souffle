# Sharing the UI with the client

Two apps, two delivery methods (decided 2026-06-12):

| App | What the client gets |
|---|---|
| **Web — `apps/ehpad`** | A **live clickable link** + a short walkthrough |
| **Mobile — `apps/coach`** | A **recorded walkthrough** (native Expo app — can't run in a plain browser) |

---

## A. Web app → live Vercel link

The build is verified and `vercel.json` (SPA rewrites) is in place. Deploy from the app folder:

```bash
cd apps/ehpad
vercel --prod        # first run: press Enter through the prompts (scope, name, link)
```

Vercel prints a production URL like `https://ehpad-xxxx.vercel.app`. That's the link you share.

**Demo entry points** (append to the URL so the client lands logged-in):

- `…/?role=admin` → Sophie, *contact principal* — sees every write action
- `…/?role=user` → Thomas, *autre contact* — same data, restricted actions disabled
  (a great "permissions" beat to show the client)

**Optional — hide it from the public:** Vercel → Project → Settings → Deployment Protection →
*Password Protection* (Pro feature), or just don't publish the URL anywhere.

> A page reload resets to seed data — that's expected (mock backend, no server).

### Web walkthrough — shot list (record with QuickTime: File → New Screen Recording)

Start at `…/?role=admin`, then move through:

1. **Tableau de bord** (`/`) — the landing dashboard
2. **Séances** (`/sessions`) → open one **session detail**
3. **Évaluations** (`/evaluations`) → evaluate a coach
4. **Contrats** (`/contrats`) → a **contract detail**, then **Nouveau contrat** (the wizard)
5. **Factures** (`/factures`) → an **invoice detail**
6. **Établissement** (`/etablissement`) — the facility profile
7. *(Optional)* reload at `…/?role=user` to show the **restricted-contact** state (disabled actions)

---

## B. Mobile app → recorded walkthrough

The coach app uses a **native** tab bar + segmented control, so it must be shown running on a real
device or simulator — not a browser. Easiest path is the iOS Simulator.

### 1. Run it in the iOS Simulator

```bash
cd apps/coach
npx expo run:ios      # first build: a few minutes (CocoaPods + native build), then boots the sim
```

(Theme note: the app currently renders **dark** — confirm the live theme looks right before recording.)

### 2. Record the simulator

Either:
- **Simulator menu** → File → Record Screen…  (stop to save a `.mov`), or
- From a terminal: `xcrun simctl io booted recordVideo coach-walkthrough.mp4`
  (press `Ctrl-C` to stop). No device bezel — clean and client-ready.

### Mobile walkthrough — shot list

1. **Splash → Welcome** — first launch
2. **Sign up** (coach self-registers) → **Pending approval** screen (account awaiting validation)
3. **Home** — "report to complete" card, availability prompt
4. **Sessions** → a **session detail** → the **check-in** flow
5. **Available** — browse open sessions, **filters**, apply to one
6. **Earnings** — the earnings overview
7. **Profile**
8. **Complete a report** → the **"Report sent"** confirmation

---

## Quick reference

| Task | Command |
|---|---|
| Deploy web (live link) | `cd apps/ehpad && vercel --prod` |
| Run mobile in simulator | `cd apps/coach && npx expo run:ios` |
| Record simulator to file | `xcrun simctl io booted recordVideo out.mp4` |
