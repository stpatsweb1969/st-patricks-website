# Claude AI Architectural Review: St. Patrick in Armonk

*Comprehensive platform audit — 220 source files reviewed across 8 categories*

---

## UX & Design

1. **Implement a Persistent Mobile Bottom Navigation Bar**
   - **Priority:** P0 (critical)
   - **Why it matters:** The current `PageLayout` reserves 24px bottom space for a mobile tab bar, but no actual bottom navigation is implemented. For elderly users, reaching the top hamburger menu is physically difficult on modern large phones.
   - **How to implement it:** Create a fixed `MobileBottomNav` component that anchors to the bottom of the screen on mobile devices (`lg:hidden`). Include 4-5 high-frequency destinations (e.g., Home, Mass Times, Bulletins, Calendar, Give) using large, clear icons and legible text labels. Ensure it respects the `env(safe-area-inset-bottom)` for modern iOS/Android devices.

2. **Increase Tap Target Sizes and Spacing**
   - **Priority:** P0 (critical)
   - **Why it matters:** Many interactive elements, such as the weather popover trigger, small icon-only buttons (e.g., 'Add to Calendar', 'Share'), and day tabs in the `ThisWeekAccordion`, are too small or tightly packed. Elderly users often have reduced motor control and need larger targets to avoid accidental taps.
   - **How to implement it:** Enforce a minimum tap target size of 44x44px (WCAG standard) for all interactive elements. Increase padding on buttons, expand the hit area of icon-only buttons using invisible padding or larger containers, and add more margin between adjacent interactive elements.

3. **Improve Contrast and Legibility of Text over Images**
   - **Priority:** P1 (high)
   - **Why it matters:** The Hero section uses a dark gradient overlay to ensure text readability over the background image, but some text elements (like the time greeting and motto) rely heavily on drop shadows and opacity. This can be hard to read for users with vision impairments.
   - **How to implement it:** Increase the opacity of the gradient overlay or add a subtle, semi-transparent dark background directly behind the text block. Ensure all text meets the WCAG AA contrast ratio of 4.5:1 against its background. Avoid using thin font weights for text over images.

4. **Simplify the Bulletin Reader Mobile Experience**
   - **Priority:** P1 (high)
   - **Why it matters:** The `BulletinBookReader` relies on swipe gestures and keyboard navigation, which might not be intuitive for all users. The "Open Full Screen Reader" CTA is helpful, but the inline reader can still be confusing or accidentally scrolled past on mobile.
   - **How to implement it:** On mobile, default to opening the bulletin in a full-screen modal or a new tab rather than an inline reader. If keeping the inline reader, add explicit, large "Next Page" and "Previous Page" buttons instead of relying solely on swipe gestures. Ensure the zoom controls are easily accessible and clearly labeled.

5. **Enhance Empty and Loading States**
   - **Priority:** P2 (medium)
   - **Why it matters:** While some empty states exist (e.g., "Bulletin Coming Soon"), others might be abrupt or confusing. Good empty states guide the user on what to do next, reducing frustration.
   - **How to implement it:** Standardize empty states across the site (e.g., events, news, gallery) using a consistent layout: a soft, relevant icon, a clear heading, a brief explanation, and a primary CTA (e.g., "View Past Events" or "Contact Office"). Use skeleton loaders that mimic the shape of the content being loaded to reduce perceived wait times.

6. **Make the Weather and Rain Alert More Accessible**
   - **Priority:** P2 (medium)
   - **Why it matters:** The weather popover and rain alert banner are great features, but the popover relies on a small trigger, and the rain alert might be missed if it's too subtle.
   - **How to implement it:** Make the weather trigger larger and ensure it has an `aria-label` or visible text indicating it's interactive. For the rain alert banner, use a distinct background color (e.g., a soft amber or blue) and an icon to draw attention. Ensure it can be easily dismissed with a large 'X' button.

7. **Clarify the "This Week" Accordion Navigation**
   - **Priority:** P2 (medium)
   - **Why it matters:** The `ThisWeekAccordion` uses a horizontal list of days that users can tap or swipe through. The auto-advance feature is smart, but users might not realize they can swipe to see other days, especially if the scrollbar is hidden.
   - **How to implement it:** Add subtle visual cues, such as a partial fade on the edges of the day list or small arrow icons, to indicate horizontal scrollability. Ensure the currently selected day is highly distinct from the others, perhaps using a stronger border or a more contrasting background color.

8. **Optimize Form Inputs for Mobile Keyboards**
   - **Priority:** P3 (nice-to-have)
   - **Why it matters:** The site has many digital forms (baptism, marriage, etc.). Filling out long forms on a mobile device is tedious, especially if the keyboard doesn't match the input type.
   - **How to implement it:** Ensure all form inputs use the correct `type` attribute (e.g., `type="email"`, `type="tel"`, `type="number"`) to trigger the appropriate mobile keyboard. Use `autocomplete` attributes to help users fill in common information (name, address, phone) quickly. Break long forms into multi-step wizards with clear progress indicators.

---

## Performance & Optimization

1. **Implement Aggressive Caching for ICS Calendar Feeds**
   - **Priority:** P0 (Critical)
   - **Why it matters:** The `calendarRouter` currently parses ICS feeds from Google Calendar on every request, which is extremely slow and blocks the serverless function, leading to high latency and potential timeouts.
   - **How to implement it:** Implement a caching layer (e.g., Redis or in-memory cache with a TTL of 15-30 minutes) for the parsed ICS data. Use a background cron job or stale-while-revalidate pattern to refresh the cache asynchronously, ensuring the API responds instantly with cached data.

2. **Optimize Bundle Size with Route-Based Lazy Loading**
   - **Priority:** P1 (High)
   - **Why it matters:** The React frontend currently imports all pages and heavy components (like `BulletinBookReader` and `TurndownService`) synchronously, resulting in a massive initial JavaScript bundle that delays time-to-interactive on slow connections.
   - **How to implement it:** Use `React.lazy()` and `Suspense` to code-split routes in `App.tsx` and `AdminRouter.tsx`. Dynamically import heavy components like the PDF reader or rich text editor only when they are rendered.

3. **Implement Image Optimization and Responsive Formats**
   - **Priority:** P1 (High)
   - **Why it matters:** Serving unoptimized, full-resolution images (e.g., in the photo gallery or hero section) consumes excessive bandwidth and severely impacts page load times, especially on mobile devices.
   - **How to implement it:** Integrate an image optimization service or use a Vite plugin to automatically convert images to modern formats like WebP or AVIF. Implement `srcset` and `sizes` attributes on `<img>` tags to serve appropriately sized images based on the user's device viewport.

4. **Optimize Database Queries and Add Indexes**
   - **Priority:** P1 (High)
   - **Why it matters:** As the database grows, queries without proper indexes (e.g., filtering by `published` or sorting by `createdAt`) will become slow, degrading API performance and increasing serverless execution time.
   - **How to implement it:** Review the Drizzle ORM schema and add appropriate indexes to frequently queried columns, such as `published`, `weekDate` in `bulletins`, and `startDate` in `events`. Ensure queries use pagination or limits where appropriate to avoid fetching excessive data.

5. **Implement Stale-While-Revalidate (SWR) for tRPC Queries**
   - **Priority:** P2 (Medium)
   - **Why it matters:** Relying solely on network requests for data fetching causes noticeable loading states on every page navigation, degrading the perceived performance.
   - **How to implement it:** Configure the tRPC React Query client to use a stale-while-revalidate caching strategy. Set appropriate `staleTime` and `cacheTime` values for relatively static data like news, bulletins, and mass times, allowing the UI to render instantly from the cache while updating in the background.

6. **Optimize Font Loading Strategy**
   - **Priority:** P2 (Medium)
   - **Why it matters:** Custom fonts can cause Flash of Unstyled Text (FOUT) or Flash of Invisible Text (FOIT), disrupting the visual experience and delaying the First Contentful Paint (FCP).
   - **How to implement it:** Preload critical fonts using `<link rel="preload">` in the HTML head. Use `font-display: swap` in the CSS `@font-face` declarations to ensure text remains visible while the custom fonts are loading.

7. **Reduce Serverless Cold Starts**
   - **Priority:** P2 (Medium)
   - **Why it matters:** Serverless functions can experience significant cold start latency, especially when initializing heavy dependencies or establishing database connections, leading to slow initial API responses.
   - **How to implement it:** Minimize the deployment package size by excluding unnecessary dependencies. Optimize database connection pooling (e.g., using a connection proxy or serverless-friendly driver) to reduce connection overhead during cold starts.

8. **Optimize CSS Delivery and Tailwind Configuration**
   - **Priority:** P3 (Nice-to-have)
   - **Why it matters:** A large CSS file can block rendering. While Tailwind is generally efficient, unused styles or overly complex configurations can bloat the final CSS bundle.
   - **How to implement it:** Ensure Tailwind's purge configuration is correctly set up to remove unused styles in production. Consider extracting critical CSS for the above-the-fold content and deferring the loading of non-critical CSS.

9. **Implement Pagination or Virtualization for Large Lists**
   - **Priority:** P2 (Medium)
   - **Why it matters:** Rendering large lists of items (e.g., photo gallery, bulletin archive, or admin tables) can cause performance bottlenecks and excessive memory usage in the browser.
   - **How to implement it:** Implement pagination or infinite scrolling for lists that can grow large. For extremely long lists, use a virtualization library like `react-window` or `@tanstack/react-virtual` to only render the items currently visible in the viewport.

10. **Optimize Third-Party Scripts and Analytics**
    - **Priority:** P3 (Nice-to-have)
    - **Why it matters:** Third-party scripts (e.g., analytics, external widgets) can block the main thread and delay the loading of the primary content.
    - **How to implement it:** Load non-critical third-party scripts asynchronously using the `async` or `defer` attributes. Consider using a tag manager or a web worker (e.g., Partytown) to offload script execution from the main thread.

---

## NEW FEATURES & INNOVATION

1. **Personalized "My Parish" Dashboard**
   - **Priority:** P1 (High)
   - **Why it matters:** Parishioners want a tailored experience rather than sifting through general information. A personalized dashboard increases engagement by showing relevant content based on their ministries, family status, and interests.
   - **How to implement:** Create a `/dashboard` route for authenticated users. Aggregate data from `ccdRegistrations`, `cyoTeams`, and `events` to show upcoming family-specific events, ministry schedules, and personalized announcements. Use tRPC to fetch this tailored data efficiently.

2. **Interactive Liturgical Calendar Integration**
   - **Priority:** P1 (High)
   - **Why it matters:** The liturgical calendar is central to Catholic life, but often hard to follow. An interactive, visual calendar helps parishioners live the liturgical seasons at home.
   - **How to implement:** Enhance the existing `liturgicalSeason.ts` to power a dynamic calendar component. Integrate with the Google Calendar ICS feeds to overlay parish events onto liturgical seasons, feast days, and holy days of obligation, using visual cues (colors) for each season.

3. **Sacramental Preparation Progress Tracker**
   - **Priority:** P2 (Medium)
   - **Why it matters:** Parents and candidates often lose track of requirements for Baptism, First Communion, Confirmation, and Marriage. A digital tracker reduces administrative overhead and keeps families informed.
   - **How to implement:** Extend the `ccdRegistrations` and forms schemas to include progress milestones. Build a UI component in the user dashboard that visually displays completed and pending requirements (e.g., classes attended, paperwork submitted, sponsor certificates).

4. **Multilingual Support (Spanish/English)**
   - **Priority:** P0 (Critical)
   - **Why it matters:** To truly serve the entire community and be a reference implementation, the website must be accessible to non-English speakers, particularly in diverse areas.
   - **How to implement:** Integrate a localization library like `react-i18next`. Store translations for static content in JSON files and add a language toggle in the `PageHeader`. For dynamic content (news, events), add language columns or a translation table in Drizzle ORM.

5. **Volunteer Matching & Micro-Volunteering**
   - **Priority:** P2 (Medium)
   - **Why it matters:** People are busy and often hesitate to commit to long-term roles. Micro-volunteering allows parishioners to sign up for small, one-off tasks, increasing overall participation.
   - **How to implement:** Expand the `volunteer` schema to include task duration and skills required. Create a "Volunteer Opportunities" board where users can filter by time commitment and sign up with one click using their authenticated profile.

6. **Digital Prayer Network & Intentions**
   - **Priority:** P1 (High)
   - **Why it matters:** While the "Prayer Wall" exists, making it a true network where parishioners can get notified when someone prays for them fosters a deeper sense of community support.
   - **How to implement:** Enhance the `PrayerWall` component and schema to allow users to click "I prayed for this." Use the existing push notification system (`usePushNotifications.ts`) to send a gentle alert to the original poster when their intention receives prayers.

7. **Audio/Podcast Integration for Homilies**
   - **Priority:** P2 (Medium)
   - **Why it matters:** Parishioners who miss Mass or want to reflect on the homily during the week need an easy way to listen on the go.
   - **How to implement:** Add a `homilies` table in Drizzle to store audio file URLs (hosted on S3/R2). Create a built-in audio player component and generate an RSS feed endpoint in Express so users can subscribe via Apple Podcasts or Spotify.

8. **AI-Powered "Next Step" Recommendations**
   - **Priority:** P3 (Nice-to-have)
   - **Why it matters:** To drive deeper engagement, the website should proactively suggest ministries, events, or resources based on a user's current involvement.
   - **How to implement:** Leverage the existing LLM integration used for the Parish Assistant. Feed the user's profile data (anonymized/securely) to the LLM to generate personalized suggestions (e.g., "Since your child is in 2nd grade CCD, you might be interested in the Family Mass volunteer team"). Display these in the user dashboard.

---

## CODE ARCHITECTURE & QUALITY

1. **Extract Domain Services from tRPC Routers**
   - **Priority:** P0 (critical)
   - **Why it matters:** The current tRPC routers (e.g., `bulletinsRouter`) mix request validation, database orchestration, and side effects (like sending notifications). This violates the Single Responsibility Principle, makes testing difficult, and leads to duplicated business logic across endpoints.
   - **How to implement it:** Create a dedicated `services/` directory. Move business logic (e.g., `publishBulletin(id)`) into these services. The tRPC routers should only handle input validation (via Zod) and call the appropriate service method, returning the result.

2. **Implement a Centralized Error Handling Middleware**
   - **Priority:** P0 (critical)
   - **Why it matters:** Error handling is currently inconsistent, with some routers throwing `TRPCError` directly and others lacking proper try-catch blocks around database or external API calls. This can lead to unhandled promise rejections and inconsistent error responses to the client.
   - **How to implement it:** Create a custom tRPC middleware that wraps all procedure executions. Catch standard errors (e.g., database constraints, not found) and map them to appropriate `TRPCError` instances. Log unexpected errors to a centralized logging service before returning a generic 500 error to the client.

3. **Eliminate `any` and `Record<string, unknown>` in Database Updates**
   - **Priority:** P1 (high)
   - **Why it matters:** Using `as any` or `Record<string, unknown>` for update payloads (seen in `bulletinsRouter.update`) defeats the purpose of using TypeScript and Drizzle ORM, leading to potential runtime errors if schema changes occur.
   - **How to implement it:** Use Drizzle's `$inferInsert` or partial types for update payloads. Define strict Zod schemas for update inputs and map them directly to the typed Drizzle update objects, ensuring type safety from the API boundary down to the database query.

4. **Refactor Admin Manager Pages to Use Shared CRUD Components**
   - **Priority:** P1 (high)
   - **Why it matters:** The admin pages (e.g., `EventManager`, `SacramentsManager`) duplicate significant amounts of UI code for lists, forms, and dialogs. This makes UI updates tedious and increases the risk of inconsistent behavior across different admin sections.
   - **How to implement it:** Create generic, reusable components like `AdminDataTable`, `AdminFormDialog`, and `StatusBadge`. Use a configuration-driven approach or render props to pass specific fields and mutation hooks to these shared components, drastically reducing boilerplate in individual manager pages.

5. **Standardize Status Enums Across Frontend and Backend**
   - **Priority:** P1 (high)
   - **Why it matters:** There is a mismatch between the statuses used in the admin UI (e.g., "contacted") and the enums defined in the database schema (e.g., "pending", "approved"). This causes type errors and logical bugs when updating records.
   - **How to implement it:** Define a single source of truth for status enums in a shared `types.ts` or `constants.ts` file accessible by both the client and server. Use these shared enums in Drizzle schema definitions, Zod validation schemas, and frontend UI components.

6. **Decouple Complex Frontend Components (e.g., `ThisWeekAccordion`)**
   - **Priority:** P2 (medium)
   - **Why it matters:** Components like `ThisWeekAccordion` mix UI rendering with complex business logic (timezone math, scheduling rules, weather querying). This makes the components massive, hard to read, and impossible to unit test in isolation.
   - **How to implement it:** Extract the scheduling logic and timezone math into custom React hooks (e.g., `useWeeklySchedule`) or pure utility functions. The component should only be responsible for receiving the processed data and rendering the UI.

7. **Implement a Generic Repository Pattern for Database Access**
   - **Priority:** P2 (medium)
   - **Why it matters:** The database layer (`server/db/`) repeats near-identical CRUD functions for every entity. This violates DRY principles and makes it harder to implement cross-cutting concerns like soft deletes or audit logging.
   - **How to implement it:** Create a generic repository class or set of functions that take a Drizzle table as an argument and provide standard `findById`, `create`, `update`, and `delete` methods. Extend this generic repository for entity-specific queries.

8. **Extract Async Jobs and Side Effects to a Background Worker**
   - **Priority:** P2 (medium)
   - **Why it matters:** Performing sequential side effects (like sending emails in a loop in `sendNewsNotifications`) directly within the API request lifecycle can lead to timeouts and poor user experience if the list of subscribers grows.
   - **How to implement it:** Implement a background job queue (e.g., using Redis and BullMQ, or a serverless queue service). When a bulletin is published, enqueue a "send notifications" job and return the API response immediately. The worker processes the queue asynchronously.

9. **Centralize and Template Email/HTML Composition**
   - **Priority:** P3 (nice-to-have)
   - **Why it matters:** Hardcoding HTML strings inside notification functions (e.g., `sendBulletinNotifications`) makes it difficult to maintain consistent branding and update email designs.
   - **How to implement it:** Use a templating engine (like Handlebars or React Email) to define email layouts in separate files. Create a centralized email service that takes a template name and data payload, renders the HTML, and sends the email.

10. **Improve Null Safety and Avoid Non-Null Assertions (`!`)**
    - **Priority:** P3 (nice-to-have)
    - **Why it matters:** The codebase uses many non-null assertions (`db!`) which can cause runtime crashes if the database connection fails or an expected value is missing.
    - **How to implement it:** Implement proper null checking and error throwing. If `getDb()` returns null, throw a specific `DatabaseConnectionError` that the centralized error handler can catch and log, rather than relying on TypeScript assertions that bypass runtime checks.

---

## SECURITY & RELIABILITY

1. **Implement Rate Limiting and Bot Protection on Public Forms**
   - **Priority:** P0 (Critical)
   - **Why it matters:** Public forms (Baptism, Marriage, CCD, Subscriptions) currently accept unauthenticated submissions via `publicProcedure` without rate limiting or CAPTCHA, making the site highly vulnerable to automated spam, resource exhaustion, and potential database flooding.
   - **How to implement it:** Integrate a rate-limiting middleware in the tRPC `publicProcedure` using a sliding window approach (e.g., max 5 submissions per IP per hour). Additionally, add a privacy-preserving CAPTCHA (like Cloudflare Turnstile or hCaptcha) to the frontend forms and validate the token in the backend routers before processing the submission.

2. **Sanitize and Restrict File Uploads**
   - **Priority:** P0 (Critical)
   - **Why it matters:** The `documentsRouter` and `bulletinsRouter` accept base64 file data and caller-supplied `contentType` directly, uploading them to S3. This allows attackers to upload malicious payloads (e.g., HTML with embedded scripts) disguised as PDFs or images, leading to Stored XSS or malware distribution.
   - **How to implement it:** Enforce strict server-side validation of file types using magic numbers (file signatures) rather than relying on the client-provided `contentType`. Restrict allowed MIME types to safe formats (e.g., `application/pdf`, `image/jpeg`, `image/png`) and enforce a maximum file size limit (e.g., 10MB) before uploading to S3.

3. **Implement Least Privilege and Data Masking in Admin Dashboards**
   - **Priority:** P1 (High)
   - **Why it matters:** The admin UI (e.g., `SacramentsManager`, `CcdPermissionsManager`) displays raw, highly sensitive PII (medical notes, emergency contacts, signatures) to all staff members with access, violating the principle of least privilege and increasing the risk of data exposure.
   - **How to implement it:** Implement field-level data masking in the UI, requiring an explicit "click to reveal" action for sensitive fields like medical conditions or phone numbers. Ensure the backend only returns sensitive fields if the requesting user's role explicitly requires it (e.g., only `religious_ed` can see CCD medical notes).

4. **Secure the Form Export Functionality**
   - **Priority:** P1 (High)
   - **Why it matters:** The `FormExport` component allows admins to download full CSVs of sensitive parishioner data with a single click. If an admin account is compromised or left unattended, an attacker can easily exfiltrate the entire parish database.
   - **How to implement it:** Require step-up authentication (e.g., re-entering a password or a 2FA prompt) before allowing bulk data exports. Log all export actions in a secure audit trail, including the user ID, timestamp, and the type of data exported, to ensure accountability.

5. **Harden Unsubscribe Token Handling**
   - **Priority:** P1 (High)
   - **Why it matters:** The `subscriptionsRouter` uses a static, non-expiring `unsubscribeToken` for email and CCD reminders. If these tokens are leaked or intercepted, malicious actors could arbitrarily unsubscribe parishioners, disrupting critical parish communications.
   - **How to implement it:** Implement time-bound, cryptographically signed tokens (e.g., JWTs) for unsubscribe links instead of static database tokens. Alternatively, require a simple email confirmation step (e.g., entering the email address) on the unsubscribe page to verify intent.

6. **Strengthen Admin Role Management**
   - **Priority:** P1 (High)
   - **Why it matters:** The `UserManager` allows any admin to change user roles instantly via a simple dropdown, with no secondary confirmation or audit logging. This makes accidental privilege escalation easy and malicious privilege escalation untraceable.
   - **How to implement it:** Add a confirmation dialog for any role changes, especially when granting `admin` privileges. Implement an audit logging table to record who changed whose role, from what to what, and when, displaying this history in the admin dashboard.

7. **Enhance XSS Protection for Composed Bulletins**
   - **Priority:** P2 (Medium)
   - **Why it matters:** The `BulletinBookReader` renders HTML bulletins inside an iframe with `sandbox="allow-same-origin"`. While this provides some isolation, if the composed HTML contains malicious scripts, it could still execute within the iframe's context, potentially accessing local storage or making unauthorized API calls.
   - **How to implement it:** Sanitize the `sourceHtml` on the server side using a robust library like DOMPurify before saving it to the database. Additionally, tighten the iframe sandbox attributes by removing `allow-same-origin` if the bulletin only requires static rendering, or use a strict Content Security Policy (CSP) header.

8. **Implement Graceful Degradation for External Integrations**
   - **Priority:** P2 (Medium)
   - **Why it matters:** The AI Parish Assistant relies heavily on external ICS feeds and LLM APIs. If these services experience downtime or latency, the chatbot could fail entirely, leading to a poor user experience.
   - **How to implement it:** Implement a caching layer (e.g., Redis or in-memory cache) for the ICS feeds with a stale-while-revalidate strategy, ensuring the chatbot always has access to recent calendar data even if the external feed is down. Add circuit breakers to the LLM API calls to return a polite, static fallback message immediately if the service is degraded.

---

## SEO & DISCOVERABILITY

1. **Implement Dynamic React Helmet for Page-Level SEO**
   - **Priority:** P0 (critical)
   - **Why it matters:** Currently, the React frontend has hardcoded titles and descriptions in components, but search engine crawlers need these in the `<head>` of the document to index pages properly. Without dynamic meta tags, all pages might appear with the same title in search results, severely hurting discoverability.
   - **How to implement it:** Install `react-helmet-async` and create a reusable `<SEO>` component. Wrap the main App with `HelmetProvider` and insert the `<SEO>` component in every page route (e.g., `Home`, `MassTimes`, `Bulletins`) to dynamically inject `title`, `meta name="description"`, and canonical URLs based on the current route.

2. **Add Schema.org Structured Data for Local Business and Events**
   - **Priority:** P0 (critical)
   - **Why it matters:** Structured data allows Google to display rich snippets, such as upcoming Mass times, parish events, and the church's location directly in search results. This is the most effective way to help new parishioners find the church and its schedule instantly.
   - **How to implement it:** Inject JSON-LD scripts into the `<head>` using the new `<SEO>` component. Use the `CatholicChurch` (a subtype of `Place` and `LocalBusiness`) schema for the homepage, including address, phone, and opening hours. For the events and Mass times pages, dynamically generate `Event` schema from the database records.

3. **Generate a Dynamic XML Sitemap and robots.txt**
   - **Priority:** P1 (high)
   - **Why it matters:** A sitemap tells search engines exactly which pages exist and how often they change, ensuring that dynamic content like new bulletins, news posts, and event pages are crawled and indexed promptly.
   - **How to implement it:** Create an Express route (e.g., `/sitemap.xml`) on the server that queries the database for all public routes, active news posts, and bulletins. Generate the XML dynamically and serve it. Add a static `/robots.txt` file that points to this sitemap URL and allows crawling of all public paths while disallowing `/admin`.

4. **Implement Open Graph (OG) and Twitter Cards for Social Sharing**
   - **Priority:** P1 (high)
   - **Why it matters:** When parishioners share news posts, events, or the homepage on Facebook, Twitter, or in text messages, rich previews with images and descriptions increase click-through rates and community engagement.
   - **How to implement it:** Extend the `<SEO>` component to include `og:title`, `og:description`, `og:image`, and `twitter:card` meta tags. For dynamic content like news posts, pass the specific `imageUrl` and `excerpt` from the database to the SEO component to generate unique social cards for each post.

5. **Optimize PDF Bulletins for Search Engine Indexing**
   - **Priority:** P2 (medium)
   - **Why it matters:** Weekly bulletins contain a wealth of parish information, but raw PDFs are often poorly indexed or provide a bad user experience when clicked from search results.
   - **How to implement it:** Since the architecture already generates `sourceHtml` and `sourceMarkdown` for bulletins, expose this HTML content on a dedicated bulletin detail page (e.g., `/bulletins/:id`) rather than just linking to the PDF. Wrap the HTML in semantic tags and ensure the page has a canonical URL, allowing search engines to index the text content effectively.

6. **Enhance Semantic HTML and Accessibility (A11y) Landmarks**
   - **Priority:** P2 (medium)
   - **Why it matters:** Search engines use semantic HTML to understand the structure and importance of content on a page. Proper use of headings and landmarks also improves accessibility, which is a ranking factor for Core Web Vitals.
   - **How to implement it:** Review the React components to ensure a logical heading hierarchy (only one `<h1>` per page, followed by `<h2>`, `<h3>`, etc.). Replace generic `<div>` wrappers with semantic HTML5 elements like `<main>`, `<article>`, `<section>`, `<nav>`, and `<aside>` where appropriate, especially in the `PageLayout` and news feed components.

7. **Optimize Image Alt Text and Delivery**
   - **Priority:** P2 (medium)
   - **Why it matters:** Descriptive alt text helps visually impaired users and provides context to search engines, improving image search rankings. Fast-loading images are crucial for passing Core Web Vitals.
   - **How to implement it:** Enforce a requirement for `alt` text in the admin gallery upload form (currently it falls back to "Parish photo" or the title). Implement lazy loading for images below the fold using the native `loading="lazy"` attribute, and ensure all images are served in modern formats (like WebP) with explicit `width` and `height` attributes to prevent layout shifts.

8. **Integrate and Optimize Google Business Profile**
   - **Priority:** P1 (high)
   - **Why it matters:** For a local parish, the Google Business Profile (formerly Google My Business) is often the first thing people see when searching for "Catholic church near me." Keeping it synced with the website ensures accurate Mass times and contact info.
   - **How to implement it:** While primarily an off-page task, add a clear, consistent NAP (Name, Address, Phone number) in the website footer that exactly matches the Google Business Profile. Consider adding a link in the footer asking parishioners to "Review us on Google" to build local authority and visibility.

---

## ADMIN EXPERIENCE & WORKFLOW

1. **Implement Bulk Actions for Form Submissions**
   - **Priority:** P1 (High)
   - **Why it matters:** The parish secretary currently has to click into and update the status of every single form submission (e.g., CCD registrations, parish registrations) one by one. For a parish of 1500 families, this is incredibly tedious during peak registration seasons.
   - **How to implement it:** Add a checkbox column to the data tables in `CcdManager`, `ParishRegistrationsManager`, and other form managers. Introduce a "Bulk Actions" dropdown (e.g., "Approve Selected", "Mark as Contacted") that triggers a new tRPC mutation (e.g., `updateManyStatus`) taking an array of IDs.

2. **Add Search, Filter, and Pagination to Admin Tables**
   - **Priority:** P0 (Critical)
   - **Why it matters:** As the database grows, loading all submissions at once (e.g., `trpc.parishRegistration.list.useQuery()`) will cause performance issues and make it impossible to find specific families or past records.
   - **How to implement it:** Update the tRPC list endpoints to accept `cursor`, `limit`, `search`, and `status` parameters. Implement React Query's `useInfiniteQuery` or standard pagination controls in the UI, along with a search bar and status filter dropdowns on all manager pages.

3. **Introduce a Unified "Needs Attention" Inbox**
   - **Priority:** P1 (High)
   - **Why it matters:** While the dashboard shows counts of pending items, the secretary still has to navigate to 5 different pages to process them. A unified inbox would streamline their daily triage workflow.
   - **How to implement it:** Create a new `UnifiedInbox` component that aggregates all "pending" status items from `getRecentFormSubmissions` (baptisms, marriages, CCD, etc.) into a single list. Allow quick inline status updates directly from this inbox view.

4. **Enable Internal Admin Notes on All Submissions**
   - **Priority:** P1 (High)
   - **Why it matters:** The backend schema supports `adminNotes` for status updates, but the frontend UI (e.g., `SacramentsManager`) lacks a text area to input or view these notes. Secretaries need a place to record things like "Left voicemail on Tuesday" or "Waiting on sponsor cert."
   - **How to implement it:** Add an "Add Note" button or an inline text area to the submission cards in the UI. When updating a status, include the note content in the tRPC mutation payload and display existing notes prominently on the card.

5. **Automate Google Sheets Export via Webhooks/Cron**
   - **Priority:** P2 (Medium)
   - **Why it matters:** The current `formExportRouter` requires the admin to manually trigger CSV exports. Automating this ensures the parish staff always has an up-to-date spreadsheet without manual intervention.
   - **How to implement it:** Set up a scheduled cron job (e.g., using Manus scheduled tasks or a background worker) that calls the export logic nightly and pushes the data directly to the configured Google Sheets API using the stored `form_export_spreadsheet_id`.

6. **Implement Automated Follow-up Email Triggers**
   - **Priority:** P2 (Medium)
   - **Why it matters:** When a secretary marks a baptism as "approved" or a marriage inquiry as "meeting_scheduled", they likely have to manually draft an email to the family. Automating this saves time and ensures consistent communication.
   - **How to implement it:** Hook into the `updateStatus` mutations in the backend. When a status changes to a specific state (e.g., "approved"), use the existing notification system to send a templated email to the submitter's email address with next steps.

7. **Add a "Print View" for Form Submissions**
   - **Priority:** P3 (Nice-to-have)
   - **Why it matters:** Parish offices still rely heavily on paper files for sacramental records and physical folders. The current UI cards are not optimized for printing.
   - **How to implement it:** Add a "Print" button to individual submission cards that opens a clean, printer-friendly layout (using `@media print` CSS or generating a simple PDF) containing all the submitted details and admin notes.

8. **Enhance the Activity Feed with Audit Logging**
   - **Priority:** P2 (Medium)
   - **Why it matters:** The current activity feed only shows recent form submissions. It doesn't track who made changes (e.g., "Secretary Jane approved John Doe's baptism"). An audit log is crucial for accountability in a multi-admin environment.
   - **How to implement it:** Create an `audit_logs` table in Drizzle. Update all admin mutations (create, update, delete, status changes) to insert a record into this table with the `userId`, action, and timestamp. Display this log in the dashboard's Activity Feed.

9. **Streamline Bulletin Composition with Templates**
   - **Priority:** P2 (Medium)
   - **Why it matters:** The `BulletinEditor` provides a blank rich text editor. Secretaries often copy-paste the same structure every week (Mass intentions, weekly letter, collection totals).
   - **How to implement it:** Add a "Load Template" dropdown in the `BulletinEditor` that populates the rich text editor with a predefined HTML structure. Allow admins to save their current composition as a reusable template in the database.

10. **Integrate Calendar Sync for Sacraments and Meetings**
    - **Priority:** P1 (High)
    - **Why it matters:** When a funeral or marriage meeting is scheduled, the secretary has to manually add it to the parish Google Calendar.
    - **How to implement it:** When updating a sacrament status to "scheduled" (and providing a date/time), add an option to automatically push an event to the parish's Google Calendar using the Google Calendar API, linking the event back to the submission.

---

## ENGAGEMENT & RETENTION

1. **Personalized "My Parish" Dashboard**
   - **Priority:** P1 (High)
   - **Why it matters:** Parishioners currently see a generic homepage. A personalized dashboard increases daily utility by showing relevant information based on their ministries, family status, and interests.
   - **How to implement:** Create a `/my-parish` route requiring authentication. Use the `users` table to store preferences and ministry affiliations. Aggregate data from `ccdRegistrations`, `cyoTeams`, and `events` to display a personalized feed of upcoming family commitments, ministry schedules, and tailored news.

2. **Interactive Digital Prayer Wall Enhancements**
   - **Priority:** P1 (High)
   - **Why it matters:** The prayer wall is a core spiritual engagement tool. Enhancing it with notifications and community interaction builds a stronger sense of shared spiritual support.
   - **How to implement:** Extend the `PrayerWall` component and database schema to allow users to click "I prayed for this" on specific intentions. Implement push notifications (using the existing `pushNotifications` router) to alert the original poster when someone prays for their intention, creating a positive spiritual feedback loop.

3. **Gamified "Saint of the Day" Streaks**
   - **Priority:** P2 (Medium)
   - **Why it matters:** Daily engagement is hard to maintain. A tasteful, spiritually-aligned streak system encourages parishioners to visit the site daily to learn about the saints and read daily scriptures.
   - **How to implement:** Add a `daily_streaks` table linked to the `users` table. When an authenticated user views the `SaintOfDayCard` or `DailyReadings`, increment their streak. Display a subtle, tasteful streak counter (e.g., a small flame or cross icon) on their profile or dashboard.

4. **Ministry-Specific Discussion Boards or Feeds**
   - **Priority:** P2 (Medium)
   - **Why it matters:** Ministries often rely on fragmented communication (email chains, WhatsApp). Centralizing ministry communication on the parish site increases retention and makes the site the hub of parish life.
   - **How to implement:** Create a `ministry_posts` table. Build a new `MinistryFeed` component where ministry leaders can post updates, prayer requests, or event reminders. Use tRPC to fetch and display these feeds on specific ministry pages, restricted by user roles.

5. **Automated "Sacrament Anniversary" Reminders**
   - **Priority:** P3 (Nice-to-have)
   - **Why it matters:** Remembering important spiritual milestones (Baptism, Confirmation, Marriage) shows deep pastoral care and brings families back to the parish for reflection or celebration.
   - **How to implement:** Add sacrament dates to the `users` or a new `user_sacraments` table. Create a scheduled cron job (similar to `scheduledDigest.ts`) that checks for upcoming anniversaries and sends an automated, personalized email or push notification with a blessing from the pastor.

6. **Interactive Homily Archive & Discussion**
   - **Priority:** P2 (Medium)
   - **Why it matters:** Homilies are the primary teaching tool of the parish. Allowing parishioners to re-listen, read transcripts, and discuss them extends the Sunday experience throughout the week.
   - **How to implement:** Create a `homilies` table storing audio links and text transcripts. Build a `HomilyArchive` page with an audio player. Add a moderated comment section or reflection prompt area where authenticated users can share their thoughts on the week's message.

7. **Volunteer "Needs Board" with One-Click Signup**
   - **Priority:** P1 (High)
   - **Why it matters:** Friction in volunteering reduces participation. A dynamic, easy-to-use needs board turns passive visitors into active community contributors.
   - **How to implement:** Enhance the `volunteer` router and database to support specific, time-bound tasks (e.g., "Need 2 ushers for 10 AM Mass"). Display these on the homepage or dashboard. Allow authenticated users to claim a task with a single click, automatically updating the database and sending a confirmation email.

8. **"Ask the Pastor" / AI Assistant Deep Integration**
   - **Priority:** P2 (Medium)
   - **Why it matters:** The existing AI assistant is a great feature, but integrating it more deeply with pastoral care can provide immediate spiritual guidance and route complex questions to human staff.
   - **How to implement:** Enhance the `ParishAssistant` component to recognize when a user is asking a sensitive pastoral question. Implement a handoff mechanism where the AI offers to forward the question (anonymously or identified) to the pastor or staff via the `admin` dashboard, creating a bridge between digital and personal engagement.

---

