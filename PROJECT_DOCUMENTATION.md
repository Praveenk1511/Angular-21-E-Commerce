# Lumen Store — Enterprise Angular 21 E-Commerce Platform

Comprehensive documentation for **Lumen Store**, a full-featured, enterprise-grade e-commerce web application built using **Angular 21** (Standalone Components, Signals, Zoneless Change Detection, Reactive Forms, Vanilla CSS with custom design system, and full SEO/Accessibility compliance).

---

## 1. Architecture Overview

Lumen Store is structured following clean architectural boundaries:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           UI LAYOUT SHELL                               │
│     (MainLayout / AuthShell / AdminShell / PageContainer / Header)     │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│                           FEATURE COMPONENTS                            │
│   (Home, Products, Cart, Wishlist, Checkout, Orders, Profile, Admin)    │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│                          SIGNAL STATE STORES                            │
│  (AuthStore, CartStore, WishlistStore, CheckoutStore, AdminStores...)   │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│                         SERVICES & MOCK API LAYER                       │
│  (ProductService, AuthService, OrderService, MockApiInterceptor)        │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Directory Structure

```
d:/Angular/Project/
├── src/
│   ├── app/
│   │   ├── core/                      # Core infrastructure & singleton logic
│   │   │   ├── config/                # Route paths & application constants
│   │   │   ├── guards/                # AuthGuard, AdminGuard, RoleGuard
│   │   │   ├── interceptors/          # AuthInterceptor, ErrorNormalisation, Loading, Retry
│   │   │   ├── layout/                # MainLayout, Header, Navigation, Footer
│   │   │   ├── models/                # TypeScript interfaces (Product, Cart, Order, User, Coupon)
│   │   │   └── services/              # ProductService, AuthService, SeoService, ToastService
│   │   ├── shared/                    # Reusable UI component library & pipes
│   │   │   ├── components/            # Badge, Button, Icon, Modal, AdminChart, Rating, QuantitySelector
│   │   │   └── pipes/                 # PricePipe (minor unit monetary formatting)
│   │   ├── state/                     # Signal State Stores
│   │   │   ├── auth.store.ts          # Session, user claims & role signals
│   │   │   ├── cart.store.ts          # Line items, subtotal, shipping, VAT, grand total
│   │   │   ├── wishlist.store.ts      # Saved items & wishlistedProductIds O(1) set
│   │   │   ├── checkout.store.ts      # Active step navigation & delivery selection
│   │   │   ├── orders.store.ts        # Customer order history & placement
│   │   │   ├── coupon.store.ts        # Promo code validation engine & admin CRUD
│   │   │   ├── admin-product.store.ts # Admin catalog CRUD & specs FormArray
│   │   │   ├── admin-category.store.ts# Admin category hierarchy trees
│   │   │   ├── admin-order.store.ts   # Order status workflow state machine
│   │   │   ├── admin-user.store.ts    # User role assignment & activation
│   │   │   ├── admin-inventory.store.ts# Stock level tracking & movement history audit log
│   │   │   └── admin-reports.store.ts # Multi-timeframe analytics datasets
│   │   ├── features/                  # Lazy-loaded feature modules
│   │   │   ├── auth/                  # Login, Register, Forgot Password, Reset
│   │   │   ├── home/                  # Storefront Landing experience
│   │   │   ├── products/              # Catalog listing, search, filter, product details
│   │   │   ├── category/              # Category overview & category product list
│   │   │   ├── cart/                  # Shopping cart page & promo code application
│   │   │   ├── wishlist/              # Wishlist page & move-to-cart
│   │   │   ├── checkout/              # Multi-step checkout (Address, Delivery, Payment, Review)
│   │   │   ├── orders/                # Customer order list & details drawer
│   │   │   ├── profile/               # User profile view/edit, addresses, security
│   │   │   ├── notifications/         # Notification bell dropdown & filter page
│   │   │   ├── admin/                 # Dashboard metrics, products, categories, orders, users, inventory, coupons, reports
│   │   │   └── unauthorized/          # 403 Forbidden Access Denied page
│   │   ├── mock-api/                  # Mock interceptor & realistic initial seed data
│   │   └── mock-data/                 # Seed fixtures (products, categories, users, orders, coupons)
│   └── environments/                  # Production & Development environment configs
├── PROJECT_DOCUMENTATION.md           # Master project documentation
├── package.json                       # Dependencies & build scripts
└── tsconfig.json                      # Strict TypeScript compiler options
```

---

## 3. Features Summary

### Customer Storefront
- **Catalog Browsing & Search**: Search bar, Category filters, Brand selection, Price Range bounds, Sort by Price/Rating/Newest, Pagination.
- **Product Details & Gallery**: Multi-image thumbnail gallery, SKU, stock level indicators, specifications grid, quantity selector, rating distribution, deferred `@defer (on viewport)` reviews.
- **Shopping Cart**: Line items, quantity adjustments, stock clamping, £50 free shipping progress bar, tax (20% VAT), promo code application, grand total breakdown.
- **Wishlist**: $O(1)$ reactive set lookup, item toggling, move-to-cart action.
- **Multi-Step Checkout**: Step 1 Shipping Address form, Step 2 Delivery Options (Standard, Express, Same Day), Step 3 Payment Method selection, Step 4 Order Summary review & placement.
- **Order History & Tracking**: List of past orders with status badges (`pending`, `confirmed`, `processing`, `shipped`, `out-for-delivery`, `delivered`), order details drawer, item lines, shipping breakdown, and interactive timeline stepper.
- **User Profile & Notifications**: View/edit profile, manage delivery addresses, change password security, notification bell badge counter, dropdown overlay, mark-as-read filter tabs.

### Admin Dashboard & Management (`/admin/*`)
- **Dashboard Metrics & Analytics**: KPI summary cards for Revenue, Orders, Customers, Products, Low Stock SKUs, Sales trend line chart.
- **Product Management**: Data table with thumbnail previews, search filtering, Add/Edit Reactive Form modal with image preview & specifications `FormArray`, View Product details modal.
- **Category Management**: Category hierarchy table with subcategory branch indicators (`└─`), hero banner image previews, Add/Edit modal, status toggles, deletion confirmation dialog.
- **Order Fulfillment**: Order list with Order Status Workflow State Machine validation (`pending` -> `confirmed` -> `processing` -> `shipped` -> `out-for-delivery` -> `delivered`), quick status transition dropdowns, order details drawer.
- **User Management**: User table, avatar initials, role filter pills (`CUSTOMER`, `MANAGER`, `ADMIN`), search, role assignment dropdown, account activation toggle, confirmation dialogs.
- **Inventory Management**: KPI summary cards (Total SKUs, Low Stock alerts, Out of Stock SKUs), stock adjustment Reactive Form modal with reorder threshold configuration and audit reason notes, stock movement history audit log drawer.
- **Coupon System**: Promo code table, discount type (`percentage` with max cap, `fixed`, `free-shipping`), minimum order spend rules, validity dates, usage limit tracking (`usageCount / usageLimit`), Add/Edit Reactive Form modal, toggle status, deletion confirmation modal.
- **Analytics & Reports**: Timeframe granularity selection (`Daily`, `Weekly`, `Monthly`, `Yearly`), report category tabs (`Overview`, `Revenue`, `Orders`, `Customers`, `Products`, `Categories`, `Inventory`), KPI growth delta cards, and modular SVG Line, Bar, and Donut charts (`AdminChartComponent`).

---

## 4. State Management Architecture

State is managed using **Angular Signals** (`signal()`, `computed()`) in injectable root store classes:

1. `AuthStore`: Session token, current user, role helpers (`isAuthenticated`, `isAdmin`, `isManager`, `isStaff`, `hasRole`, `hasPermission`).
2. `CartStore`: Line items, subtotal, total compare-at savings, free shipping calculations, tax, grand total.
3. `WishlistStore`: Wishlist items & `wishlistedProductIds` computed set for instant $O(1)$ product card heart status.
4. `CheckoutStore`: Active step signal (`1 | 2 | 3`), delivery method selection, delivery option price calculations.
5. `OrdersStore`: Customer orders list, order placement, order status audit updates.
6. `CouponStore`: Customer promo code validation engine & admin coupon management.
7. Admin Stores (`AdminProductStore`, `AdminCategoryStore`, `AdminOrderStore`, `AdminUserStore`, `AdminInventoryStore`, `AdminReportsStore`): Data tables, search filtering, pagination, modal states, audit history.

All state updates are **immutable** and state is persisted to `localStorage` (`lumen_cart_items`, `lumen_wishlist_items`, `lumen_session`, `lumen_applied_coupon`, `lumen_admin_*`).

---

## 5. Security & Authorization Architecture

- **`authGuard`**: Protects routes requiring authentication. Preserves `returnUrl` query parameter when redirecting to `/auth/login`.
- **`adminGuard`**: Enforces manager/admin privilege requirement. Redirects unauthorized users (e.g. `CUSTOMER` role) to `/unauthorized`.
- **`roleGuard`**: Functional guard checking route `data['requiredRoles']` (e.g. `['admin']` or `['manager', 'admin']`).
- **`authInterceptor`**: Automatically injects `Authorization: Bearer <token>` header on outgoing HTTP requests. Intercepts HTTP 401 (clears session & redirects to login) and HTTP 403 (redirects to `/unauthorized`).
- **`/unauthorized` Page**: User-friendly 403 Access Denied interface displaying active user role and CTAs to return to storefront or sign in with a different account.

> [!IMPORTANT]
> **Backend Security Requirement**: Client-side route guards and interceptors manage UI navigation for optimal UX. In production with a real backend, all API endpoints MUST enforce server-side JWT verification and database permission checks.

---

## 6. How to Run the Application

### Prerequisites
- Node.js `^18.0.0` or `^20.0.0` or `^21.0.0`
- npm `^9.0.0` or `^10.0.0`

### Installation
```bash
npm install
```

### Development Server
```bash
npm start
# or
npx ng serve
```
Open your browser at `http://localhost:4200`.

---

## 7. How to Run Tests

### Unit Test Suite
```bash
npm test
```
Executes the Vitest test runner across services, stores, guards, interceptors, components, and pipes (`.spec.ts` files).

### Type Check & Build Verification
```bash
npm run typecheck
npm run build
```

---

## 8. How to Replace Mock API with Real Backend

1. Open [`src/environments/environment.ts`](file:///d:/Angular/Project/src/environments/environment.ts) (or [`environment.prod.ts`](file:///d:/Angular/Project/src/environments/environment.prod.ts)) and set `apiBaseUrl` to your production API server endpoint:
   ```ts
   export const environment: AppEnvironment = {
     production: true,
     appName: 'Lumen Store',
     apiBaseUrl: 'https://api.yourdomain.com/v1',
   };
   ```
2. Open [`angular.json`](file:///d:/Angular/Project/angular.json) or [`src/app/app.config.ts`](file:///d:/Angular/Project/src/app/app.config.ts) and set `ngUseMockApi` to `false` (or remove `mockApiInterceptor` from `withInterceptors([...])`).
3. Outgoing requests will be routed to your production API with `Authorization: Bearer <token>` headers attached.

---

## 9. Production Build

To build the production bundle for deployment:
```bash
npm run build
```
The compiled, minified, static distribution files will be generated in `dist/ecommerce/`.

---

## 10. Summary

Lumen Store is fully built, optimized, tested, and ready for production deployment or real backend integration.
