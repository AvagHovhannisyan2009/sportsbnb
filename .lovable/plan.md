

# Top 10 Improvements for Sportsbnb

## 1. Booking Cancellation by Players
**Current gap**: Players can book venues but there's no way to cancel from their dashboard. The `bookings` table has no DELETE policy for users, and there's no cancel button in the PlayerDashboard.
**What to build**: Add a "Cancel Booking" button on the player dashboard with confirmation dialog. Implement a cancellation flow that respects the venue's cancellation policy (stored in `venue_policies`), processes refunds via Stripe when applicable, and updates booking status to "cancelled".

---

## 2. Email Notifications for Bookings
**Current gap**: The `send-booking-confirmation` edge function exists but bookings created via the demo flow or checkout don't consistently trigger email notifications.
**What to build**: Integrate transactional emails for booking confirmations, cancellations, reminders (24h before), and review prompts. Use a database trigger or edge function to automatically send emails on booking status changes.

---

## 3. Favorite / Save Venues
**Current gap**: No way for players to save or bookmark venues they like for quick access later.
**What to build**: Add a `favorite_venues` table, a heart icon on venue cards, and a "Saved Venues" tab in the player dashboard. This increases engagement and return visits.

---

## 4. Social Login (Google Sign-In)
**Current gap**: Only email/password authentication exists. No social login options.
**What to build**: Add Google OAuth sign-in button on login and signup pages. This reduces friction for new users significantly -- most sports booking platforms support Google login.

---

## 5. Multi-Hour and Multi-Court Booking
**Current gap**: The booking flow only supports 1-hour, single-court bookings. The `venue_courts` table exists but isn't used in the booking flow. The `duration_hours` field defaults to 1.
**What to build**: Allow players to select multiple consecutive hours and choose a specific court. Show court-level availability and pricing. Update the booking dialog with duration and court selectors.

---

## 6. Push/In-App Notification Center
**Current gap**: The `notifications` table exists and `NotificationDropdown` component is present, but there's no way to view notification history or manage notification preferences effectively.
**What to build**: Create a full notifications page (`/notifications`) showing all past notifications, mark-as-read functionality, and filtering by type (booking, game, team, system). Add real-time notifications using the database's realtime capabilities.

---

## 7. Venue Search by Location (GPS "Near Me")
**Current gap**: The DiscoverPage has distance calculation logic and a "Near me" button, but geolocation-based sorting and filtering isn't prominently featured.
**What to build**: Auto-detect user location on first visit, prominently show nearby venues sorted by distance, and add a distance badge on each venue card. Show a "Allow location" prompt to improve discovery.

---

## 8. Booking History Export (Receipt/Invoice PDF)
**Current gap**: Players have no way to download receipts or invoices for their bookings. Important for players who expense sports activities.
**What to build**: Add a "Download Receipt" button next to each past booking in the player dashboard. Generate a simple PDF/printable receipt with booking details, venue info, and payment amount.

---

## 9. Venue Owner Payout Dashboard
**Current gap**: Owners have Stripe Connect integration but no visibility into their earnings, pending payouts, or transaction history within the app.
**What to build**: Add an "Earnings" section to the owner dashboard showing total revenue, pending payouts, completed payouts, and per-booking transaction breakdown. Pull data from the bookings table and display it with charts using Recharts (already installed).

---

## 10. Dark Mode Support
**Current gap**: The app uses `next-themes` (installed) but dark mode isn't implemented. All styling uses light theme only.
**What to build**: Add a theme toggle in the header/profile settings. Ensure all pages and components render correctly in dark mode using the existing Tailwind dark mode classes and CSS variables already partially set up in `index.css`.

---

## Technical Summary

| # | Feature | New Tables | Edge Functions | Complexity |
|---|---------|-----------|---------------|------------|
| 1 | Booking Cancellation | No | Modify refund-booking | Medium |
| 2 | Email Notifications | No | Modify existing | Medium |
| 3 | Favorite Venues | Yes (favorite_venues) | No | Low |
| 4 | Google Sign-In | No | No (auth config) | Low |
| 5 | Multi-Hour/Court Booking | No (use existing) | Modify checkout | High |
| 6 | Notification Center | No (use existing) | No | Medium |
| 7 | GPS "Near Me" | No | No | Low |
| 8 | Booking Receipts | No | New (generate-receipt) | Medium |
| 9 | Owner Payout Dashboard | No | New (get-payouts) | Medium |
| 10 | Dark Mode | No | No | Low |

I recommend tackling them in this priority order: **4 (Google login) -> 1 (Cancellation) -> 3 (Favorites) -> 10 (Dark mode) -> 7 (GPS) -> 5 (Multi-hour) -> 6 (Notifications) -> 9 (Payouts) -> 2 (Emails) -> 8 (Receipts)**

