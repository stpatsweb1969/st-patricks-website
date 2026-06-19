# St. Patrick in Armonk — Connections & Next-Level Recommendations

## Currently Active Connections

| Connection | Status | Current Use |
|---|---|---|
| **Google Drive** | Active | File access, document management |
| **Google Calendar** | Active | Read/write parish calendar events |
| **Gmail** | Active | Send emails, search inbox |
| **Resend** (MCP) | Active | Transactional email (subscriber notifications, form confirmations) |
| **Lumin PDF** (MCP) | Active | PDF generation, e-signatures, document management |
| **Stripe** (MCP) | Active | Payment processing (not yet integrated into site) |
| **PostHog** (MCP) | Active | Product analytics, feature flags |
| **Supabase** (MCP) | Active | Database management |
| **Anthropic** | Active | AI/LLM for chat features |
| **My Browser** | Active | Web automation |

---

## Bulletin Workflow — Recommended Process

The current system requires an admin to upload a pre-made PDF. Here's how to bring the entire bulletin lifecycle into the platform:

### Option A: Full In-Platform Bulletin Creation (Recommended)

**Workflow:**
1. Admin opens the Bulletin Manager in the admin dashboard
2. Uses a rich-text editor (TipTap/Markdown) to compose the weekly bulletin — pastor's letter, announcements, Mass intentions, calendar highlights, ministry updates
3. System auto-generates a branded PDF via **Lumin PDF** (`lumin_markdown2pdf`) with parish header/footer
4. Admin previews, edits, and publishes
5. On publish: PDF stored in S3, subscribers notified via **Resend**, bulletin appears on website

**What we'd build:**
- Rich text bulletin editor in admin dashboard (TipTap or Markdown with live preview)
- Bulletin template with parish branding (header, footer, colors, logo)
- One-click "Generate PDF & Publish" that chains Lumin PDF → S3 storage → Resend broadcast
- Optional: auto-pull this week's calendar events and Mass intentions into a draft

**Connections used:** Lumin PDF (PDF generation), Resend (email broadcast), Google Calendar (auto-pull events)

### Option B: Google Drive Integration (Simpler)

**Workflow:**
1. Staff creates bulletin in Google Docs (familiar tool)
2. System watches a designated Google Drive folder for new PDFs
3. When a new bulletin PDF appears, it auto-imports into the website
4. Admin clicks "Publish" in dashboard → subscribers notified

**Connections used:** Google Drive (file sync), Resend (notifications)

---

## Connections to Activate for Next-Level Experience

### 1. Stripe Integration (Already Active — Not Yet Wired)

**What it enables:**
- Online giving with recurring donations (replace WeShare/Venmo links)
- Event registration with payment (retreats, dinners, CYO fees)
- Building fund campaigns with progress tracking
- Tax-receipt generation

**Impact:** Parishioners can give directly on the site instead of being redirected to WeShare. Recurring giving becomes frictionless.

### 2. Canva (Currently Disabled)

**What it enables:**
- Auto-generate social media graphics for events
- Create bulletin cover art
- Design event flyers from within the admin dashboard
- Pull parish branding assets

**Impact:** Staff can create professional graphics without leaving the platform.

### 3. Zapier (Currently Disabled)

**What it enables:**
- Connect to Flocknote (push new announcements automatically)
- Sync form submissions to Google Sheets for record-keeping
- Auto-post events to parish Facebook page
- Trigger SMS reminders for CCD parents via Twilio

**Impact:** Eliminates manual double-entry. One action in the admin dashboard cascades everywhere.

### 4. Mailchimp or MailerLite (Currently Disabled)

**What it enables:**
- Professional newsletter templates with open/click tracking
- Audience segmentation (CCD parents, volunteers, general)
- Automated welcome series for new parishioners
- A/B testing subject lines for better engagement

**Impact:** Upgrades from basic notifications to a full parish communications platform. However, **Resend** (already active) can handle most of this — it has broadcasts, contacts, segments, and automations built in.

### 5. Notion (Currently Disabled)

**What it enables:**
- Staff collaboration space for bulletin drafts
- Ministry leader task boards
- Meeting notes and agendas
- Volunteer coordination

**Impact:** Internal staff productivity tool that feeds content into the public website.

---

## Features That Bring This to the Ultimate Experience

### Tier 1: High Impact, Buildable Now (Active Connections)

| Feature | Connection | Description |
|---|---|---|
| **In-Platform Bulletin Editor** | Lumin PDF + Resend | Compose, generate PDF, publish, and email — all in one flow |
| **Stripe Giving Page** | Stripe | Replace external giving links with native donation forms, recurring gifts |
| **Email Broadcasts** | Resend | Weekly digest email to subscribers with this week's highlights |
| **Analytics Dashboard** | PostHog | See which pages parishioners visit most, track form completion rates |
| **Calendar Sync** | Google Calendar | Two-way sync: events created in admin auto-appear on Google Calendar and vice versa |

### Tier 2: Automation & Simplification

| Feature | Connection Needed | Description |
|---|---|---|
| **Auto-Generated Weekly Digest** | Resend + AI | AI summarizes this week's events + readings into a beautiful email every Thursday |
| **Smart Notifications** | Resend | "Mass is in 1 hour" push for opted-in parishioners |
| **Form → Google Sheets** | Google Drive | All form submissions auto-export to a shared Google Sheet for office staff |
| **Event Reminders** | Gmail/Resend | Automated reminder emails 24h before registered events |

### Tier 3: Delight & Differentiation

| Feature | What It Does |
|---|---|
| **AI Parish Assistant** | Chatbot that answers "What time is Mass?" "How do I register for CCD?" using site content |
| **Digital Bulletin Archive** | Searchable archive of all past bulletins with full-text search |
| **Parishioner Portal** | Login for families to see their registrations, giving history, volunteer hours |
| **Live Mass Indicator** | Real-time "Mass is happening now" with link to YouTube stream |
| **Seasonal Themes** | Auto-switch site accent colors for Advent (purple), Lent (purple), Easter (gold), Ordinary Time (green) |

---

## My Recommendation: Priority Order

1. **Build the Bulletin Editor** — biggest pain point, uses active connections (Lumin + Resend)
2. **Wire up Stripe** — already active, just needs the giving page integration
3. **Add Resend Broadcasts** — weekly email digest to subscribers (already active)
4. **Enable Zapier** — connect everything together (Flocknote, social, sheets)
5. **PostHog Analytics** — understand what parishioners actually use

Would you like me to start building any of these?
