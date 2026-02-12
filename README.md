# PrivateByRight VPN - Signup Flow

A polished, responsive 4-step signup flow for a VPN brand, built as a performance/affiliate marketing landing page.

## Setup

```bash
# Install dependencies
composer install
npm install

# Environment
cp .env.example .env
php artisan key:generate

# Database (SQLite by default)
php artisan migrate
php artisan db:seed --class=PlanSeeder

# Build assets
npm run build
```

> **Note:** If the database gets out of sync or you need a clean slate, run:
> ```bash
> php artisan migrate:fresh && php artisan db:seed --class=PlanSeeder
> ```

## Running

```bash
php artisan serve   # Terminal 1
npm run dev         # Terminal 2
```

Visit `http://localhost:8000/signup` to see the flow.

Test with affiliate params: `http://localhost:8000/signup?utm_source=google&aff_id=abc123&sub_id=456`

## Tests

```bash
./vendor/bin/pest    # Backend (60 tests)
npm run test         # Frontend (68 tests)
```

## Stack & Why

| Layer | Choice | Reason |
|-------|--------|--------|
| Backend | Laravel 11 + Jetstream (Inertia) | Full-stack PHP with built-in auth, form requests, session handling. Inertia bridges to Vue without building a separate API. |
| Frontend | Vue 3 + TypeScript + Tailwind CSS | Composition API for clean composables, TypeScript for type safety across stores/forms/API responses, Tailwind for rapid UI matching Figma. |
| State | Pinia | Official Vue state management. Setup store pattern keeps logic collocated. |
| Testing | Pest + Vitest | Pest for expressive PHP tests, Vitest for fast frontend unit tests with Vue Test Utils. |

**A note on the backend:** I chose to include a full Laravel backend to demonstrate how I'd approach this in a real production environment — with proper models, migrations, form request validation, middleware, and services. For a signup flow that only needs to match a Figma design, a frontend-only approach (Vite + Vue) would have been sufficient and faster to ship. I'm aware this may look like overengineering for the scope of the assignment, but I wanted to show how I'd structure a project that's meant to scale: server-side validation as the source of truth, affiliate data persisted in the database, and a payment service that can be swapped for a real gateway without touching the frontend.

## Affiliate Tracking

Affiliate tracking was a key requirement. Here's exactly how it works:

**1. Reading URL params on entry:**
- Server-side: `CaptureAffiliateParams` middleware (`app/Http/Middleware/CaptureAffiliateParams.php`) intercepts every request to `/signup` and extracts `utm_source`, `utm_campaign`, `aff_id`, and `sub_id` from the query string. These are stored in the Laravel session.
- Client-side: The `useAffiliateParams` composable (`resources/js/composables/useAffiliateParams.ts`) reads the same params from `window.location.search` using `URLSearchParams`.

**2. Preserving params through the flow:**
- Server: Params live in the Laravel session, which persists across all requests in the same browser session.
- Client: Params are persisted to `sessionStorage` (key: `pbr_affiliate_params`) and merged on every page load. The merge priority is: URL params > server-provided params > previously persisted params. This ensures that if a user arrives with `?aff_id=abc` and later the URL changes (step navigation via `history.replaceState`), the affiliate data is not lost.
- The params are also passed as Inertia props from the controller, so they're available on the first server-rendered page without waiting for JavaScript.

**3. Including params in the final payload:**
- On account creation: affiliate params from the session are stored in the `affiliate_trackings` database table, linked to the new user.
- On payment: the `usePayment` composable sends `affiliate_params` as part of the POST body to `/signup/payment`.
- In analytics: the `analyticsStore` automatically enriches every tracked event with affiliate params from sessionStorage, so all events (`flow_viewed`, `plan_selected`, `signup_success`, etc.) carry the affiliate context.

## Analytics Instrumentation

A lightweight `track(eventName, payload)` function is implemented via the `analyticsStore` (`resources/js/stores/analyticsStore.ts`) and the `useAnalytics` composable (`resources/js/composables/useAnalytics.ts`).

**Where each event is fired:**

| Event | File | When |
|-------|------|------|
| `flow_viewed` | `Pages/Signup/Index.vue` (onMounted) | Page loads for the first time |
| `plan_selected` | `Steps/PlanSelection.vue` (handleGetStarted) | User clicks "Get Started" |
| `step_completed` | `Steps/PlanSelection.vue`, `Steps/CreateAccount.vue`, `composables/usePayment.ts` | Each step advances successfully |
| `signup_submitted` | `composables/usePayment.ts` (processPayment) | Payment form is submitted |
| `signup_success` | `composables/usePayment.ts` (processPayment) | Payment succeeds, order created |
| `signup_error` | `Steps/CreateAccount.vue`, `composables/usePayment.ts` | Account creation or payment fails |

**Every event payload automatically includes:**
- `timestamp` — ISO 8601 string, added by the store on every `track()` call
- `affiliateParams` — `utm_source`, `utm_campaign`, `aff_id`, `sub_id` (auto-enriched from sessionStorage)
- Event-specific data: `planId`, `planName`, `step`, `orderId`, `error`, `paymentMethod` depending on the event

In development, all events are logged to the browser console as `[Analytics] event_name {payload} timestamp`.


## Step State & Param Persistence

**Step state:** Managed by a single Pinia store (`signupStore`). The entire flow lives on one Inertia page — steps are switched client-side via a `currentStep` ref. URL updates via `history.replaceState` (`/signup/1`, `/signup/2`, etc.) so the browser back/forward buttons work. A `popstate` listener syncs the store with browser navigation.

**Form persistence:** State is persisted to `sessionStorage` on every mutation. On page refresh, the store restores from sessionStorage before the first render. Sensitive card data (number, expiry, CVC) is never persisted — only payment method, country, and zip code survive a refresh.

## Tradeoffs

- **Single Inertia page** rather than separate routes per step. Simpler state management and smoother transitions, but means steps don't have fully independent server-rendered pages.
- **sessionStorage** over localStorage. Scoped to the browser tab, auto-clears on close — appropriate for a signup flow. Trade-off: state is lost if user opens a new tab.
- **Inline SVGs** for all icons rather than external image files. Eliminates network requests and simplifies deployment at the cost of slightly larger component files.
- **Full Laravel backend** for what could be a frontend-only project (see note above in Stack & Why).

## What I'd Improve With More Time

- **Server-side rendering** (SSR) for faster initial load and better SEO
- **E2E tests** with Playwright covering the full flow end-to-end
- **Rate limiting** on signup/payment POST routes to prevent abuse


## Project Structure

```
app/
  Http/Controllers/SignupController.php
  Http/Middleware/CaptureAffiliateParams.php
  Http/Requests/StoreAccountRequest.php, StorePaymentRequest.php
  Models/Plan.php, Order.php, AffiliateTracking.php
  Services/PaymentService.php

resources/js/
  stores/signupStore.ts, analyticsStore.ts
  composables/useValidation.ts, usePayment.ts, useAnalytics.ts, useAffiliateParams.ts
  Pages/Signup/Index.vue, Steps/{PlanSelection,CreateAccount,PaymentInformation,Confirmation}.vue
  Components/UI/{GoldButton,TextInput,Badge,Divider,LoadingSpinner}.vue
  Components/Signup/{PlanCard,FeatureList,ExpressCheckout,CreditCardForm,TrustpilotWidget,...}.vue
  types/signup.ts

tests/Feature/SignupFlowTest.php, AffiliateTrackingTest.php, PaymentServiceTest.php
tests/Unit/SignupValidationTest.php
resources/js/tests/stores/, composables/
```
