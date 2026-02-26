

# DIL Global Trade Platform — Phase 1 MVP (Functional Prototype)

## Design System
- **Theme**: Institutional/premium — dark navy (#1a2332), gold (#c5a55a), white, light grays
- **Typography**: Clean, authoritative — Inter or similar professional font
- **Layout**: Desktop-first, responsive, strong grid, generous whitespace
- **Style**: World Bank / UN aesthetic — not startup SaaS

## Pages & Modules

### 1. Public Pages
- **Landing Page**: Hero with tagline, platform stats, how-it-works section, featured businesses, upcoming events, membership tiers CTA, footer with DIL branding
- **Login / Register**: Email/password auth with role selection (Business Member / Admin), OTP placeholder

### 2. Business Directory (Public + Member)
- Searchable/filterable grid of business cards
- Filters: sector, country, verification level
- Business profile page with: company info, products, certifications, export capacity, Trade Readiness Score (mock 0-100), verification badge, profile completeness bar
- "Request Introduction" button (triggers mock notification)

### 3. TradeMatch Engine (Member)
- Onboarding: select what you offer, what you seek, target countries
- Match results page showing scored matches with breakdown (sector 40%, country 30%, capacity 20%, verification 10%)
- Match card with score %, company preview, "Request Introduction" button
- Free tier: 3 match views/month limit UI

### 4. Events & Delegations Hub (Public + Member)
- Events listing page with cards (upcoming/past)
- Event detail page: description, agenda, speakers, sponsors, countdown timer
- Registration form with ticket tier selection (Free / Paid tiers)
- Payment placeholder (shows "Pay Now" but displays "coming soon" or mock confirmation)

### 5. Membership & Subscriptions (Member)
- Pricing page with 4 tiers: Free, Starter ($49), Growth ($149), Enterprise ($499)
- Feature comparison table
- Subscription management page: current plan, upgrade/downgrade buttons, mock billing history
- Placeholder payment flow

### 6. Admin Dashboard (Admin role)
- KPI cards: total businesses, verified businesses, active matches, pending deal requests, event revenue (mock), subscription revenue (mock)
- Charts: business growth over time, matches by sector, revenue breakdown
- Business management: approve/reject/edit businesses, change verification level
- Event management: create/edit events, view registrations, export attendee CSV
- Match requests: view and manage introduction requests
- Activity log (recent actions)

### 7. Member Dashboard
- Profile overview with completeness %
- My matches summary
- My events (registered)
- Current subscription tier
- Quick actions

## Data Architecture (Mock/Local State)
All data will be stored in React state with realistic seed data:
- ~15 sample businesses across Nigeria, Italy, Ghana
- 3-4 upcoming events
- Pre-computed match scores
- Mock admin activity log

## Navigation
- Public: Top navbar with logo, Directory, Events, Membership, Login
- Member: Sidebar with Dashboard, Directory, My Matches, Events, Subscription, Profile
- Admin: Sidebar with Dashboard, Businesses, Matches, Events, Subscriptions, Activity Log

## Key Interactions
- Role-based routing (member vs admin dashboards)
- Directory search & filter with instant results
- Match score calculation displayed transparently
- Event registration flow with ticket selection
- CSV export button for admin (generates file from mock data)
- Responsive design across all pages

