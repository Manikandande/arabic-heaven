# Arabic Heaven — Full Product Plan & Requirements

**Project:** Multi-restaurant web application for Arabic Heaven Mandi  
**Restaurants:** 2 locations, both in Villianur, Puducherry, India  
**Address:** 1, By-Pass Road, Ariyapalayam, Villianur, Puducherry – 605110  
**Phone / WhatsApp:** +91 79426 96368  
**Instagram:** https://www.instagram.com/arabicheavenmandi/  
**Facebook:** https://www.facebook.com/people/Arabic-Heaven-Mandi/61571577514906/

---

## Vision

One codebase, one database, one admin portal — two independent public-facing restaurant websites. Customers get a seamless ordering, reservation, and loyalty experience. Staff manage everything from a single unified admin portal.

---

## Architecture

```
arabicheaven-r1.com  ─┐
arabicheaven-r2.com  ─┤──► Single Next.js app
admin.arabicheaven.com ─┘   Middleware: hostname → restaurantId context
```

- **Multi-tenant:** Next.js middleware reads the hostname and injects `restaurantId` into every request. All DB queries are scoped to that restaurant.
- **Single PostgreSQL database:** every restaurant-specific table carries a `restaurantId` column.
- **Admin portal:** one login, staff sees only their assigned restaurant; Owner sees both and can switch mid-session.
- **Customer accounts:** global — one account works on both restaurant websites.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | NextAuth.js (email + Google OAuth) |
| Payments | Razorpay (India) |
| Email | Nodemailer / Resend |
| WhatsApp | WhatsApp Business API (Twilio or Meta Cloud API) |
| Push Notifications | Web Push (PWA) |
| Real-time / WebSocket | Socket.io |
| Maps | Leaflet + OpenStreetMap |
| File Storage | MinIO (self-hosted, S3-compatible) |
| Hosting | Oracle Cloud Mumbai (free tier VM) |
| CI/CD | GitHub Actions |

**Monthly fixed cost: ₹0** (Oracle Cloud free tier + open-source stack)

---

## Current Build Status

> This section tracks what has been built so far on the GitHub Pages static prototype.

### Phase 3 — Public Website (Static Prototype) ✅

| Feature | Status | Notes |
|---|---|---|
| Home page — Hero, Featured Dishes, Offers & Deals, Why Choose Us, Testimonials, Platform Links | ✅ Done | |
| Menu page — categories, search/filter, dietary tags, add to cart | ✅ Done | |
| About page | ✅ Done | |
| Gallery page | ⚡ Partial | No real photos yet |
| Contact page — form, map (Villianur), address | ✅ Done | Form not wired to email yet |
| Reservations page | ✅ Done | Form not wired to backend yet |
| Catering page | ✅ Done | Form not wired to backend yet |
| WhatsApp floating button | ✅ Done | Real number set |
| Real address + social links | ✅ Done | |
| Sign In / Register pages | ⚡ Partial | Firebase pages built; needs Firebase project setup |
| Navbar responsive (all pages) | ✅ Done | |
| Cart (UI only) | ✅ Done | No real checkout |
| Offers section (home page) | ✅ Done | |

### Pending Before Static Prototype is Complete

- [ ] Set up Firebase project → add GitHub Secrets → auth goes live
- [ ] Wire contact / reservation / catering forms to send real emails (Formspree or EmailJS)
- [ ] Add real food/restaurant photos to Gallery page
- [ ] Fix Offers section image display on deployed site

---

## Full Feature Requirements

---

### Module 1 — Public Website (Per Restaurant)

#### 1.1 Home Page
- Hero: full-screen banner, tagline (EN / AR / FR), CTA buttons (Order Now / Reserve a Table)
- Featured dishes carousel (this restaurant's items only)
- Live promotions / Offer of the Day banner
- "Why Choose Us" section
- Customer Testimonials carousel (approved reviews for this restaurant)
- Order via platforms section (Swiggy, Zomato, Uber Eats links per restaurant)
- Language switcher (EN / AR / FR) — persistent via cookie
- Footer: contact, social links, opening hours, PWA install prompt

#### 1.2 Menu Page
- Browse by category
- Item cards: photo, name/description in active language, price, dietary tags (Halal, Vegan, Spicy, Gluten-Free)
- Search and filter
- Add to cart

#### 1.3 About Us
- Restaurant story (multilingual), chef spotlight, halal certification

#### 1.4 Gallery
- Photo grid: food, interior, events (this restaurant's media only)
- Lightbox viewer

#### 1.5 Contact & Location
- Embedded map (this restaurant's location)
- Address, phone, email, opening hours
- Contact form → sends email to restaurant
- WhatsApp floating button (this restaurant's number, sticky on all pages)

---

### Module 2 — Customer Accounts (Global)

One account works across both restaurant websites.

#### 2.1 Registration & Login
- Sign up: email + password + name
- Email verification on registration
- Login / logout
- "Continue as Guest" for ordering (no account required)
- Forgot password / reset via email link
- Google OAuth sign-in

#### 2.2 Customer Profile
- Edit name, phone, profile photo
- Manage saved delivery addresses
- Language preference (EN / AR / FR)
- Change password
- View loyalty points balance + tier

---

### Module 3 — Online Ordering

#### 3.1 Cart
- Slide-out cart drawer, scoped to the current restaurant
- Cannot mix items from two restaurants in one cart
- Qty controls, remove items, clear cart
- Discount pipeline preview (promo offer → offer code → loyalty points)

#### 3.2 Checkout

**Step 1 — Fulfillment Method**

| Delivery | Pickup |
|---|---|
| Delivery address (Google Maps autocomplete) | Pickup location shown (restaurant address) |
| Auto-fill from saved addresses (logged-in) | Estimated pickup time |
| Delivery fee calculated by zone | Pickup person name (required) |
| | Pickup person phone (required) |
| | ID document photo upload (optional) |

**Step 2 — Discounts**

Applied in this order:
1. **Promotional Offer** — auto-applied (e.g. "20% off orders above ₹500"), no code needed
2. **Offer Code** — customer enters code; validated live (expiry, usage limit, min order, restaurant scope)
3. **Loyalty Points** — slider to choose points to redeem; 100 pts = ₹1; cannot exceed order total

Savings breakdown: Subtotal / Promo Offer / Offer Code / Points Used / Delivery Fee / **Total Payable**

**Step 3 — Payment**
- Razorpay: card, UPI, netbanking, wallets
- Cash on Delivery (delivery orders, toggleable per restaurant)
- Cash on Pickup (pickup orders, toggleable per restaurant)
- Payment webhook confirms before order is created; failed payment creates no order

**Post-Checkout**
- Order confirmation page: order number, items, breakdown, estimated time
- Confirmation email: itemised receipt + tracking link
- Loyalty points earned credited after order is delivered/collected

#### 3.3 Order Notifications

Triggered at every status change:

| Channel | How | Notes |
|---|---|---|
| Email | Nodemailer / Resend | Full summary + tracking link |
| WhatsApp | WhatsApp Business API | Status message in customer's language + tracking link |
| Push | Web Push (PWA) | Instant notification, opt-in only |

- Guest customers receive Email + WhatsApp only (no push)
- Pickup "Ready" message includes restaurant address + pickup person name

#### 3.4 Order Status Flows

- **Delivery:** Placed → Confirmed → Preparing → Out for Delivery → Delivered
- **Pickup:** Placed → Confirmed → Preparing → Ready for Pickup → Collected

#### 3.5 Live Delivery Tracking (Customer Page)

When status = "Out for Delivery":
- Embedded map shows delivery man's live GPS marker (updates every 5–10s via WebSocket)
- Delivery man's name, photo, and phone number shown
- Destination pin + restaurant origin pin + route line
- Map hides once order is "Delivered"
- Works for guests via tracking link (no login required)

#### 3.6 Post-Delivery Actions (optional, presented after "Delivered")

**A — Tip the Delivery Man**
- Preset amounts + custom input
- Charged via Razorpay; cash tip also recordable

**B — Rate the Delivery**
- 1–5 stars for delivery experience
- Linked to delivery man's profile

**C — Review the Food**
- 1–5 stars + written feedback + optional photo
- Goes to admin approval queue; approved reviews appear in Testimonials

#### 3.7 Order History
- All past orders across both restaurants (restaurant name shown per order)
- Reorder in one click
- Download invoice (PDF)

---

### Module 4 — Table Reservations

Per restaurant — a reservation at R1 does not appear in R2.

- Date/time picker with live availability
- Party size selector
- Special requests / dietary notes
- Auto-fill from account if logged in
- Email + WhatsApp confirmation
- Modify or cancel (before configurable cutoff)
- 24-hour reminder via Email + WhatsApp
- View upcoming reservations from account dashboard

---

### Module 5 — Loyalty Points (Global)

Points earned and redeemed across both restaurants.

#### Earn
- Points per paid order at either restaurant (earn rate configurable)
- Bonus: first order, birthday, referral
- Logged-in customers only

#### Redeem
- At checkout (either restaurant)
- Balance and history shows source restaurant per entry

#### Tiers (based on lifetime spend across both restaurants)
| Tier | Threshold |
|---|---|
| Bronze | Default |
| Silver | ₹10,000 lifetime spend |
| Gold | ₹30,000 lifetime spend |

#### Customer Loyalty Dashboard
- Points balance + tier badge
- Full transaction history (date, restaurant, order, +/- points)
- Tier perks per level

---

### Module 6 — Catering & Events

Per restaurant.

- Catering inquiry form: event type, date, guest count, location, budget, dietary needs, menu package selection, file upload
- Admin receives inquiry → sends quote via email
- Customer accepts/declines via email link
- Confirmed bookings appear on admin Unified Bookings Calendar

---

### Module 7 — Third-Party Delivery Platforms

Per restaurant.

- Phase 1: Deep-link buttons to Swiggy, Zomato, Uber Eats listings
- Phase 2 (optional): Menu sync via platform APIs

---

### Module 8 — Push Notifications (PWA)

- Web Push opt-in
- Scoped per restaurant
- Triggers: order status changes, reservation reminders, promotional broadcasts
- Admin can send manual broadcasts per restaurant or both combined
- Scheduled future notifications

---

### Module 9 — Multilingual (EN / AR / FR)

- Full UI in all 3 languages
- Arabic = RTL layout
- Language switcher persistent via cookie
- Menu item names/descriptions stored in all 3 languages
- Admin enters content in all 3 languages

---

### Module 10 — PWA (Mobile App)

- Installable on iPhone and Android (one per restaurant — separate manifests)
- Offline menu browsing (cached)
- Push notifications
- Bottom nav bar on mobile
- Per-restaurant splash screen and app icon

---

### Module 11 — Admin Portal

Accessed at a separate subdomain (e.g. `admin.arabicheaven.com`).

#### 11.0 Login & Restaurant Selection

1. Admin logs in with email + password
2. **Owner** → sees both restaurant cards → selects one to enter dashboard
3. **Manager / Kitchen / Delivery** → auto-redirected to their assigned restaurant (no selection screen)
4. **"Switch Restaurant"** button in sidebar (Owner only)
5. Active restaurant name + logo always visible in sidebar

#### 11.1 Dashboard (Per Restaurant)
- Today's summary: orders, revenue, reservations, new reviews, loyalty points issued
- Live order feed (updates in real-time)
- Out-of-stock alerts
- Upcoming reservations for today

#### 11.2 Order Management (Online Orders)
- Orders list: filter by status, date, type (delivery/pickup)
- Order detail: items, customer, delivery address OR pickup person (name, phone, ID doc preview)
- **Assign Delivery Man** → customer notified immediately via Email + WhatsApp
- Update order status (delivery flow vs pickup flow)
- Print kitchen ticket
- Razorpay refund
- Resend notification manually

#### 11.D — Delivery Man Management

**Profiles**
- Name, photo, phone, vehicle type, vehicle registration, active/inactive

**Delivery Man Mobile Dashboard**
- Their list of assigned orders for today
- Tap "Start Delivery" → begin GPS location sharing
- Tap "Mark as Delivered" → order status updated; customer notified
- No native app — mobile browser PWA

**Performance (Admin View)**
- Deliveries per day/week/month
- Average delivery rating
- Total tips received
- On-time rate

#### 11.E — Live Fleet Tracking Map (Admin)

- Full-screen map: all active delivery men simultaneously
- Marker colours: 🟢 On delivery (live GPS) / 🟡 Available / 🔴 Offline
- **Hover over marker:** popup listing all orders assigned to that delivery man:
  ```
  Order #1042  →  Out for Delivery
  Order #1038  →  Preparing
  ```
  Each order is clickable → opens order detail in a side drawer
- Destination pins for each active delivery
- Route line for the active "Out for Delivery" order
- Fleet summary sidebar: total on shift, on delivery, available, avg delivery time today
- Updates every 5–10 seconds via WebSocket

#### 11.A — Table Orders (Dine-In)

Tablet-optimised for use by staff at the restaurant.

- **Table Map:** visual grid showing all tables with status (Available / Occupied / Reserved / Awaiting Bill)
- Staff taps a table → opens or resumes a dine-in order
- Browse menu → add items with qty and special instructions
- Items sent to kitchen immediately (kitchen ticket auto-printed or shown on kitchen display)
- Add more items / rounds at any time; remove items before bill is generated
- Table order status: Open → Served → Bill Requested → Closed

#### 11.B — Billing

**Dine-In Bill**
- Generate bill for a table order
- Itemised: name, qty, unit price, line total
- Subtotal / Discount / VAT / Service Charge / **Grand Total**
- Payment: Cash / Card / QR Pay (Razorpay payment link, customer scans and pays on phone)
- Split bill: equally by N guests, or by selected items per guest
- Actions: Print (thermal-friendly) / Email / WhatsApp / Download PDF

**Online Order Invoices**
- Auto-generated for every completed order
- Customer downloads from order history
- Admin can resend via email or WhatsApp

**Daily Cash Reconciliation**
- End-of-day: total bills by payment method (cash / card / QR / online)
- Exportable per shift or per day

**Tax Configuration (per restaurant)**
- VAT %
- Service charge % (toggleable)
- Tax-inclusive vs tax-exclusive display

#### 11.C — Inventory Management

**Setup**
- Enable/disable tracking per menu item
- Set stock quantity (e.g. 50 portions of Lamb Kabsa)
- Set low-stock alert threshold (e.g. alert at ≤ 5)

**Automatic Behaviour**
| Module | Behaviour |
|---|---|
| Public website | Item shows "Sold Out" at qty = 0; cannot be added to cart |
| Table Orders | Out-of-stock items greyed out; staff cannot add them |
| Billing | Cannot include 0-stock items |
| Online checkout | Validated again at payment; blocked if stock hit 0 after page was opened |

**Deduction Rules**
- Online order: stock deducted on payment confirmation; restored on cancellation
- Table order: stock deducted when item added to order; restored on removal

**Dashboard**
- All items with current qty and status (In Stock / Low / Sold Out)
- Filter: all / low stock / sold out
- Bulk restock: reset all quantities at start of day
- Individual restock

**Alerts**
- Low-stock WhatsApp alert to admin + in-portal notification
- Out-of-stock dashboard badge with one-click restock

#### 11.3 Menu Management
- Add / edit / delete items (multilingual fields: EN / AR / FR)
- Image upload (stored in MinIO)
- Toggle item availability (instant — reflects on public site, table orders, billing)
- Category management and display order
- Dietary flags
- Scoped to selected restaurant only

#### 11.4 Unified Bookings Calendar

Single calendar for the selected restaurant showing all bookings.

**Calendar Views:** Month / Week / Day

**Colour Coding**
| Booking Type | Colour |
|---|---|
| Online table reservation | Blue |
| Walk-in | Green |
| Catering (confirmed) | Purple |
| Catering (pending) | Orange dashed |
| Blocked slot / private event | Red |

**Actions**
- Click any booking → opens detail panel
- Create reservation directly by clicking a time slot
- Create blocked slot (prevents new online bookings for that window)
- Drag and drop to reschedule → auto-notification to customer

#### 11.5 Catering Management
- View all inquiries
- Send quote, confirm/reject
- Follow-up notes
- Confirmed bookings appear on the Unified Bookings Calendar (purple)

#### 11.6 Reviews & Testimonials
- Approve / reject / respond to food reviews
- Approved reviews appear publicly in the Testimonials section (this restaurant only)

#### 11.7 Loyalty Management (Global)
- View all customer points balances
- Manually award or deduct points (with restaurant attribution)
- Configure: earn rate, redemption rate, expiry days, tier thresholds, per-restaurant overrides

#### 11.8 Customer Management (Global)
- Customer list with order history across both restaurants
- Loyalty balance and tier
- Notes per customer

#### 11.9 Promotions & Offers (Per Restaurant)
- **Offer Codes:** % off, flat discount, free item — with usage limits, expiry, min order value
- **Promotional Offers:** rule-based auto-applied (by time of day, day of week, category, order value)

#### 11.10 Reports & Analytics

**Visual Dashboard**
- Revenue chart: daily / weekly / monthly
- Best-selling items (top 10)
- Peak hours heatmap
- Order type split: delivery / pickup / platform
- Average customer rating trend
- Loyalty points issued vs redeemed

**Exportable Reports**

| Report | Filters | Export |
|---|---|---|
| Sales Report | Date range, restaurant, order type | PDF, CSV |
| Item Performance | Date range, category | PDF, CSV |
| Customer Report | Date range, tier, restaurant | CSV |
| Loyalty Points | Date range, transaction type | CSV |
| Reservation Report | Date range, status | CSV |
| Catering Report | Date range, status | CSV |
| Reviews & Ratings | Date range, rating | CSV |
| Inventory Report | Date range | CSV |
| Combined Report (both restaurants) | Date range | PDF, CSV |

- Date range presets: Today / This Week / This Month / Custom
- Combined report available to Owner role only
- Scheduled auto-email: admin configures weekly/monthly delivery of chosen reports

#### 11.11 Staff Management
- Roles: Owner / Manager / Kitchen / Delivery Man
- Assign staff to one or both restaurants
- Deactivate accounts

#### 11.12 Settings (Per Restaurant)
- Restaurant profile: name, logo, brand colours, address, phone, email, WhatsApp number, opening hours
- Delivery zones and fees
- Pickup settings: enable/disable, notice window, accepted ID document types
- Cash on Delivery / Cash on Pickup toggles
- Third-party platform URLs (Swiggy, Zomato, Uber Eats)
- Tax/VAT/service charge configuration
- Notification preferences (which channels, which events)

---

## Database Schema

### Core Tables (29 total)

```
Restaurant       id, name, slug, domain, logo, brandColors, address, phone, email,
                 whatsappNumber, openingHours (JSON), active

User             id, name, email, passwordHash, phone, avatar, language,
                 loyaltyPoints, tier, createdAt

StaffAssignment  id, userId, restaurantId, role

Address          id, userId, label, street, city, postcode

MenuItem         id, restaurantId, nameEN/AR/FR, descriptionEN/AR/FR, price,
                 categoryId, image, available, dietary[]

Category         id, restaurantId, nameEN/AR/FR, displayOrder

DeliveryMan      id, restaurantId, name, photo, phone, vehicleType, vehicleReg,
                 active, avgRating, totalDeliveries, totalTipsReceived

DeliveryLocation id, deliveryManId, orderId, lat, lng, updatedAt

Order            id, restaurantId, userId, status, fulfillmentType (delivery/pickup),
                 deliveryAddressId, deliveryManId,
                 pickupPersonName, pickupPersonPhone, pickupPersonIdDocUrl,
                 total, discountBreakdown (JSON), promoCodeId, pointsUsed,
                 paymentMethod, razorpayPaymentId, createdAt

OrderItem        id, orderId, menuItemId, qty, unitPrice

DeliveryRating   id, orderId, userId, deliveryManId, rating, comment, createdAt

Tip              id, orderId, userId, deliveryManId, amount, paymentMethod,
                 razorpayPaymentId, createdAt

Reservation      id, restaurantId, userId, date, time, partySize,
                 status, specialRequests, createdAt

CateringInquiry  id, restaurantId, userId, eventType, date, guestCount,
                 location, budget, packages, status, quoteAmount, createdAt

Review           id, restaurantId, userId, orderId, rating, body, photo,
                 approved, adminResponse, createdAt

PromoCode        id, restaurantId, code, discountType, value, minOrderValue,
                 expiresAt, usageLimit, usagePerCustomer, usedCount

PromotionalOffer id, restaurantId, name, discountType, value, minOrderValue,
                 conditions (JSON), startDate, endDate, active

LoyaltyTx        id, userId, restaurantId, orderId, points,
                 type (earned/redeemed/manual/bonus/expired), createdAt

LoyaltyConfig    id, earnRate, redemptionRate, pointsExpireDays,
                 tierThresholds (JSON)

PushSubscription id, userId, restaurantId, endpoint, keys

Table            id, restaurantId, tableNumber, capacity,
                 status (available/occupied/reserved/awaitingBill)

TableOrder       id, restaurantId, tableId, staffUserId, covers,
                 status (open/served/billRequested/closed), createdAt

TableOrderItem   id, tableOrderId, menuItemId, qty, unitPrice,
                 specialInstructions, sentToKitchen

Bill             id, restaurantId, orderId, tableOrderId, subtotal,
                 discountAmount, taxAmount, serviceCharge, grandTotal,
                 paymentMethod, paid, createdAt

BillItem         id, billId, description, qty, unitPrice, lineTotal

Inventory        id, restaurantId, menuItemId, stockQty,
                 lowStockThreshold, trackingEnabled, lastRestockedAt

InventoryLog     id, inventoryId, changeQty, reason (sale/restock/cancel/manual),
                 orderId, staffUserId, createdAt

NotificationLog  id, userId, orderId, channel (email/whatsapp/push),
                 status (sent/failed), message, sentAt

BlockedSlot      id, restaurantId, startDatetime, endDatetime, label, notes

GalleryImage     id, restaurantId, url, caption, displayOrder
```

---

## Implementation Phases

| Phase | Scope | Est. Duration |
|---|---|---|
| **3** *(in progress)* | Static prototype: all public pages, UI-only cart, auth pages | ✅ Done |
| **3b** | Complete static prototype: Firebase auth live, forms send emails, gallery photos | 1 week |
| **1** | Backend setup: Oracle Cloud VM, PostgreSQL, Prisma schema, Next.js app (non-static) | 1 week |
| **2** | Multi-tenant middleware + NextAuth.js (email + Google) + admin login + restaurant selection | 1 week |
| **4** | Customer profile, saved addresses, language preference | 1 week |
| **5** | Cart, checkout (delivery + pickup), Razorpay | 1 week |
| **6** | Order notifications: Email + WhatsApp + Push; tracking page; delivery man assignment | 1 week |
| **6b** | Live delivery map: customer tracking page + admin fleet map (Socket.io + GPS) | 1 week |
| **7** | Post-delivery: tip, delivery rating, food review | 1 week |
| **8** | Table reservations + catering inquiry | 1 week |
| **9** | Loyalty points (global earn/redeem, tiers, dashboard) | 1 week |
| **10** | PWA: installable, offline menu, push broadcasts | 1 week |
| **11** | Multilingual: EN / AR (RTL) / FR | 1 week |
| **12** | Admin: order management, menu management, customer management, reviews | 2 weeks |
| **13** | Admin: table orders (dine-in, kitchen tickets) | 1 week |
| **14** | Admin: billing (dine-in + online invoices, split bill, QR pay, reconciliation) | 1 week |
| **15** | Admin: inventory management | 1 week |
| **16** | Admin: unified bookings calendar | 1 week |
| **17** | Admin: promotions, loyalty config, staff management, settings | 1 week |
| **18** | Admin: fleet map, delivery man management, performance | 1 week |
| **19** | Reports & analytics (dashboards + exportable PDF/CSV + scheduled emails) | 1 week |
| **20** | QA, performance, SEO, launch | 1 week |

**Total estimated: ~20 weeks**

---

## Infrastructure Setup (When Moving Off GitHub Pages)

1. **Oracle Cloud (free tier)** — 2 AMD Micro VMs (1 OCPU, 1 GB RAM each) or 1 Ampere ARM VM (4 OCPU, 24 GB RAM)
2. **PostgreSQL** — self-hosted on Oracle Cloud
3. **MinIO** — self-hosted object storage for images/docs (S3-compatible)
4. **Nginx** — reverse proxy for Next.js
5. **PM2** — process manager for Next.js
6. **GitHub Actions** — CI/CD: test → build → deploy to Oracle Cloud on push to `main`
7. **Domains** — point restaurant domains + admin subdomain to Oracle Cloud IP

---

## Immediate Next Steps (in order)

1. **[ ]** Set up Firebase project → add GitHub Secrets → Sign In / Register goes live
2. **[ ]** Wire forms (contact, reservation, catering) to send real emails
3. **[ ]** Add real photos to Gallery page
4. **[ ]** Set up Oracle Cloud VM + PostgreSQL + Prisma schema
5. **[ ]** Migrate from static export to full Next.js (remove `output: 'export'`)
6. **[ ]** Implement NextAuth.js replacing Firebase
7. **[ ]** Build real cart → checkout → Razorpay payment flow
