# 📖 Money Meva — User Guide

> Your complete guide to using Money Meva — offline-first personal finance app for Marathi, Hindi, and English users.

---

## 1. Getting Started

### 1.1 First Launch

1. Open Money Meva (web app, installed PWA, or Android app).
2. **Onboarding** asks you to choose your profession — this pre-fills sensible default categories (e.g., salary income, groceries, transport).
3. **Create your profile**: enter a name and set a **4-digit PIN** (10 one-time PINs are generated; each is used once, then rotates).
4. You land on the **Dashboard**.

> All data is stored **on your device first** (IndexedDB). You can use the app fully offline, with no account, no internet, forever.

### 1.2 The PIN system

- PINs protect the app from casual access (e.g., someone picking up your phone).
- After 10 uses, a fresh set of PINs is generated.
- You can change/disable auto-lock under **Settings → PIN Security**.

### 1.3 Language

- Languages: **मराठी (default) · हिन्दी · English**.
- Switch anytime: **Settings → Language**, or the footer of the landing page.

---

## 2. Dashboard Tour

| Section | What it shows |
|---|---|
| Balance card | Current balance carried forward month-to-month |
| Cash flow chart | 6-month income vs expenses trend |
| Spending chart | Where money goes (by category) |
| Goals | Savings goals (e.g., emergency fund) |
| Recurring | Upcoming recurring transactions |
| Reminders | Due reminders |
| Cloud Sync card | Shows sync status + "Sync Now" when connected |

Quick-add works from the dashboard for income, expense, and investment entries.

---

## 3. Transactions

Three transaction types: **Income · Expense · Investment**.

- **Add**: tap the + button (or Quick Add). Date, category, amount, description, partner optional.
- **Future dates are blocked** — you cannot record entries dated after today (recurring schedules and investment maturity dates are exempt).
- **Edit/Delete**: tap an entry (mobile) or row action (desktop).
- **Delete is soft** — items move to **Archive**, and are permanently removed only after 30 days.
- **Search & filter** by category, date, or amount; **group** by day/week/month.

### Investments

- Tracks FD, SIP, RD, PPF and more with a built-in **calculator** (`/dashboard/investments`).
- Goal **contribute** = expense transaction; **withdraw** = income transaction.

### Partners

- Groups: **Personal / Services / Financial / Business / Government / Agriculture / Office** (each with its own types).
- Per-partner profit & loss, mini-ledger, and transaction history.
- **Credit (उधार) tracking** — a credit purchase counts as an expense and a credit sale as income **at the moment you record it**. Every credit entry automatically adds a **payment-pending entry in Adjustments** (look for "Credit purchase/sale · Party" with a **Pending** badge).
- When the party settles the payment (or you receive it), that adjustment updates automatically — **FIFO**: a partial payment keeps it Pending (with the amount paid so far), a full payment flips it to **Settled**. You'll always see "who still owes what" in Adjustments.
- **Settlement rows never double-count** — the real cash/bank/UPI payment appears in your lists, and the opposite section shows it as a visible row with an amber **"Credit settled"** badge; totals always exclude settlement rows (use the **Credit only** filter to see just credit entries).
- Optional per-party **credit limit** (default ₹10,000) and **settle-within days** (default 30) — the card shows a **Near Limit** / **Limit Reached** badge when you're getting close.
- **Partnership (भागीदारी) tab** — a Partnership is shared work split between members with % shares (they must total 100%). When you create one, you're added as a member automatically. For farm partnerships keep the **Farm** type and set crop + season + year; for a business, startup, shop, transport or any other kind, pick that type from the chips instead — crop/season hide and you describe the venture in Notes. Cards show the type as a badge. Entries carry "who paid" info and the settlement table tells you who gets/owes what; optionally mirror entries into your main ledger.

### Recurring

- Daily, weekly, monthly, yearly, or custom frequencies.
- **Advance** creates the transaction and rolls the next date.
- The **category field follows the type**: choose Income and you'll get income categories (Salary, Business, Freelance…); choose Expense and you get expense categories (Bills, Subscription, Credit Card…). Switching type swaps the list and clears the field.

---

## 4. Categories

- **Three separate lists**: Income / Expense / Investment categories.
- Add, edit, or delete categories under **Settings → Categories**.
- Changes are saved in a batch, protected by your PIN.
- New categories appear in every transaction dropdown.

---

## 5. Cloud Sync (Optional, Recommended)

> Sync backs up your data to a shared cloud database and keeps all your devices in sync. Requires internet. Works independently of local usage — the app always works offline.

### 5.0 No account needed — how it works

There is **no cloud account and no cloud password**. Sync uses a **link-only** shared database (the classic CouchDB-style model): any device that connects with the same project **URL + anon key** reads and writes the same rows.

| Secret | Where you get it | Used for |
|---|---|---|
| **Supabase URL** | Settings → Multi-Device Sync (or your app provider) | Finding the cloud database |
| **Anon key** | Settings → Multi-Device Sync (or your app provider) | Unlocking the cloud database |
| **Google password** | Your Google account | Only the optional Google sign-in on the login screen — the app never sees it |

Don't mix these up with:

- Your **app unlock PIN** — opens the app on this device only.
- Your **local profile password** — signs you into the app on this device.
- Your **Google password** — Google sign-in only creates a *local* profile; the app never sees the password.

> **Signed in with Google?** That just creates a local profile (and restores your previous local session) — it is **not** cloud sync. Connect in Settings → Multi-Device Sync with the URL + anon key to actually sync.

### 5.1 First device — connect

1. Open **Settings → Multi-Device Sync**.
2. Paste your **Supabase URL** (e.g. `https://xxxxxxxxxxxx.supabase.co`) and the **anon key** (they may already be filled in if your app provider pre-configured the app).
3. Tap **Connect** — your local data is pushed to the cloud.

### 5.2 Add another device

1. On the second device, open **Settings → Multi-Device Sync**.
2. Paste the **same URL + anon key**.
3. Tap **Connect** — your cloud data appears on this device. From now on, changes sync live between devices.

> Both devices now share the same rows. Edits on one appear on the other within seconds (realtime) or when you tap **Sync Now**.

### 5.3 Everyday sync behavior

- Sync runs **automatically in the background** (live sync) while connected.
- **Sync Now** forces an instant push + pull (useful after offline edits).
- **Disconnect** stops syncing this device — your local data stays on the device.
- To move to a new browser/device, just connect again with the same URL + anon key.

### 5.4 Privacy of cloud data

- **Anyone with the project URL + anon key can read and write all the data in that database.** This is the same model as the original CouchDB sync — **don't share them publicly.**
- The anon key is public by design (it's safe to ship in app bundles); the real protection is keeping the **URL private**.
- Your email address is **not** used for sync — nothing to reuse or leak.

### 5.5 Advanced: bring your own server

- In **Settings → Multi-Device Sync** you can paste your **own Supabase URL + anon key** to use a completely different database (e.g., your own Supabase project). See `CLOUD-SYNC-GUIDE.md` for the full setup guide.

---

## 6. Export & Import

Export anytime from **Settings → Export/Import**:

| Format | What you get |
|---|---|
| **JSON** | Full backup — use for restore/migration |
| **PDF** | Printable report |
| **Excel** | Spreadsheet for analysis |

Import a JSON backup to restore data on a new device (alternative to cloud sync).

---

## 7. Security & Privacy

- **Local-first**: all data lives in your browser/device storage by default.
- **PINs** guard app access; auto-lock after inactivity (configurable 1h–24h or off).
- **Soft delete + Archive** (30-day retention) protects against accidental deletion.
- **No ads, no trackers, no analytics** — your data is not sold or shared.
- Only when **you** enable cloud sync does an encrypted-in-transit copy live on the shared cloud database — the data is shared by design with anyone holding the URL + key, so keep them private.
- The app has **no server of its own** — nothing to track you even when you use cloud sync.

Full policy: see **Terms** and **Privacy** pages in the app (`/terms`, `/privacy`).

---

## 8. Troubleshooting

| Problem | Fix |
|---|---|
| Forgot my PIN | Data is protected by your local profile; restore from your last **JSON backup** (Settings → Export/Import). |
| App asks me to log in but I only used a PIN before | Create/log into your local profile again — PIN unlocks the app, the profile holds the data. |
| Sync says "Connect" but I synced before | Enter the **same URL + anon key** and tap **Connect**. |
| Data missing on another device | Confirm both devices use the **same URL + anon key**, and tap **Sync Now** on the device that has the data. |
| Syncing but nothing changes | Check internet; tap **Sync Now**; wait a few seconds for real-time events. |
| Want to stop syncing | **Disconnect** in Settings — local data is untouched. |
| URL/key changed and sync broke | Reconnect with the current URL + anon key from Settings → Multi-Device Sync. |

---

## 9. FAQ

**Q: Is an account required?**
No. The app works fully offline without any account. Cloud sync is optional.

**Q: Is my cloud data private?**
It lives in a **shared link-only database** — anyone with the URL + anon key can read and write the rows (the classic CouchDB sync model). The protection is keeping the URL + key private; the anon key alone is useless without the URL.

**Q: Can I use my own database?**
Yes — paste your own Supabase URL + anon key in Settings (advanced). See `CLOUD-SYNC-GUIDE.md`.

**Q: What happens if I delete the app/clear browser data?**
Local data is removed. If cloud sync was on, reinstall → Connect with the same URL + key → your data comes back.

**Q: Which devices are supported?**
Any modern browser (mobile/desktop), installable PWA, and the Android APK (Capacitor). iOS via browser/PWA.

**Q: Is the app free?**
Yes. Money Meva is free, no ads, no subscription.

---

## 10. Getting Help

- **Support page** in the app: Settings → Support
- Email: **support@moneymeva.com**
- Telegram: **@marathimeva**
- Owner/developer docs: `README.md`, `CLOUD-SYNC-GUIDE.md`, and the `docs/` vault.

---

#money-meva #guide #user