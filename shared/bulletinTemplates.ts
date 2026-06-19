/**
 * Bulletin Composition Templates — pre-built content structures
 * that admins can select when composing a new bulletin.
 */

export interface BulletinTemplate {
  id: string;
  name: string;
  description: string;
  html: string;
}

export const bulletinTemplates: BulletinTemplate[] = [
  {
    id: "standard-weekly",
    name: "Standard Weekly",
    description: "The classic weekly bulletin format with Mass intentions, announcements, and upcoming events.",
    html: `<h2>Mass Intentions This Week</h2>
<table>
<thead><tr><th>Day</th><th>Time</th><th>Intention</th></tr></thead>
<tbody>
<tr><td>Saturday</td><td>5:30 PM</td><td></td></tr>
<tr><td>Sunday</td><td>8:30 AM</td><td></td></tr>
<tr><td>Sunday</td><td>10:30 AM</td><td></td></tr>
<tr><td>Sunday</td><td>12:30 PM</td><td></td></tr>
</tbody>
</table>

<h2>From the Pastor's Desk</h2>
<p>Dear Parishioners,</p>
<p>[Pastor's message here]</p>
<p>God bless,<br>Fr. [Name]</p>

<h2>Parish Announcements</h2>
<ul>
<li><strong>[Announcement 1]</strong> — Details here</li>
<li><strong>[Announcement 2]</strong> — Details here</li>
</ul>

<h2>Upcoming Events</h2>
<ul>
<li><strong>[Date]</strong> — [Event name and details]</li>
<li><strong>[Date]</strong> — [Event name and details]</li>
</ul>

<h2>Stewardship Report</h2>
<p>Last week's collection: $[amount]</p>
<p>Thank you for your generous support of our parish.</p>`,
  },
  {
    id: "holiday-special",
    name: "Holiday / Holy Day",
    description: "For major holidays (Christmas, Easter, Holy Days of Obligation) with special Mass schedule.",
    html: `<h2>🎄 Special Holiday Schedule</h2>
<p><em>Please note the adjusted Mass times for this holy season.</em></p>

<h3>Vigil / Eve</h3>
<ul>
<li><strong>4:00 PM</strong> — Family Mass</li>
<li><strong>7:00 PM</strong> — Solemn Mass</li>
<li><strong>12:00 AM</strong> — Midnight Mass</li>
</ul>

<h3>Day Of</h3>
<ul>
<li><strong>8:00 AM</strong> — Morning Mass</li>
<li><strong>10:00 AM</strong> — Solemn Mass</li>
<li><strong>12:00 PM</strong> — Noon Mass</li>
</ul>

<h2>Pastor's Holiday Message</h2>
<p>Dear Parishioners,</p>
<p>[Holiday message here]</p>

<h2>Holiday Events</h2>
<ul>
<li><strong>[Event]</strong> — [Details]</li>
</ul>

<h2>Office Hours</h2>
<p>The parish office will be closed [dates]. We will reopen on [date].</p>`,
  },
  {
    id: "sacrament-focus",
    name: "Sacrament Preparation",
    description: "For weeks with sacramental celebrations (Baptisms, First Communion, Confirmation).",
    html: `<h2>Sacramental Celebration This Week</h2>
<p>We joyfully celebrate the Sacrament of <strong>[Sacrament Name]</strong> this week.</p>
<p>Please keep the following in your prayers:</p>
<ul>
<li>[Name 1]</li>
<li>[Name 2]</li>
<li>[Name 3]</li>
</ul>

<h2>Mass Intentions</h2>
<table>
<thead><tr><th>Day</th><th>Time</th><th>Intention</th></tr></thead>
<tbody>
<tr><td>Saturday</td><td>5:30 PM</td><td></td></tr>
<tr><td>Sunday</td><td>8:30 AM</td><td></td></tr>
<tr><td>Sunday</td><td>10:30 AM</td><td></td></tr>
<tr><td>Sunday</td><td>12:30 PM</td><td></td></tr>
</tbody>
</table>

<h2>Announcements</h2>
<ul>
<li><strong>[Announcement]</strong> — Details</li>
</ul>

<h2>Upcoming Sacramental Preparation</h2>
<p>If you or your family are preparing for a sacrament, please contact the parish office at (914) 273-9724.</p>`,
  },
  {
    id: "community-event",
    name: "Community Event Focus",
    description: "When the parish has a major community event (fundraiser, picnic, mission trip).",
    html: `<h2>🎉 [Event Name]</h2>
<p><strong>Date:</strong> [Date]</p>
<p><strong>Time:</strong> [Time]</p>
<p><strong>Location:</strong> [Location]</p>

<h3>About This Event</h3>
<p>[Description of the event, its purpose, and what to expect.]</p>

<h3>How to Participate</h3>
<ul>
<li><strong>Volunteer:</strong> [Sign up details]</li>
<li><strong>Donate:</strong> [Donation details]</li>
<li><strong>Attend:</strong> [RSVP or ticket info]</li>
</ul>

<h2>Regular Mass Schedule</h2>
<p>All regular Masses will continue as scheduled this week.</p>

<h2>Other Announcements</h2>
<ul>
<li>[Announcement]</li>
</ul>`,
  },
  {
    id: "lent-advent",
    name: "Lent / Advent Season",
    description: "For the penitential seasons with Confession schedule, Stations of the Cross, etc.",
    html: `<h2>🕯️ [Lent/Advent] — Week [Number]</h2>
<p><em>"[Scripture quote for the week]"</em></p>

<h3>Special [Season] Schedule</h3>
<ul>
<li><strong>Stations of the Cross:</strong> Fridays at 7:00 PM</li>
<li><strong>Confessions:</strong> Saturdays 3:30–4:30 PM</li>
<li><strong>Adoration:</strong> Thursdays 6:00–7:00 PM</li>
</ul>

<h2>Mass Intentions</h2>
<table>
<thead><tr><th>Day</th><th>Time</th><th>Intention</th></tr></thead>
<tbody>
<tr><td>Saturday</td><td>5:30 PM</td><td></td></tr>
<tr><td>Sunday</td><td>8:30 AM</td><td></td></tr>
<tr><td>Sunday</td><td>10:30 AM</td><td></td></tr>
<tr><td>Sunday</td><td>12:30 PM</td><td></td></tr>
</tbody>
</table>

<h2>Reflection for the Week</h2>
<p>[Brief spiritual reflection or quote from the pastor]</p>

<h2>Parish Announcements</h2>
<ul>
<li>[Announcement]</li>
</ul>`,
  },
];
