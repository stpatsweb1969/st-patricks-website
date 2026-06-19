/**
 * Footer — St. Patrick in Armonk
 *
 * Ported from the Legacy Hoopers "ultra footer" pattern (operator reference),
 * adapted to the parish palette (green + gold) and parish content.
 *
 * Structure: 3px green→gold accent top border → wordmark + motto → liturgical
 * season badge + icon-button row → three quick-link tool cards → slim legal bar
 * with a clearly-visible Aster Sports credit.
 *
 * All identity values should come from `useParishInfo()` (the single source);
 * the literals below are fallbacks only. The liturgical season comes from
 * `useLiturgicalSeason()` so the badge auto-updates with the Church calendar.
 *
 * Self-contained scoped styles (prefix `spf-`) keep it pixel-faithful and out of
 * Tailwind's way — same approach as the reference markup.
 */
import { Link } from "wouter";
import { Mail, Phone, Youtube, Bell, Calendar, Heart, MapPin, Shield } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useParishInfo } from "@/hooks/useParishSchedule";
import { useLiturgicalSeason } from "@/contexts/LiturgicalSeasonContext";

// Parish palette (matches the locked design tokens — green primary, gold accent)
const GREEN = "#2E7D4F"; // var(--color-primary) equivalent
const GREEN_DARK = "#0F2A1C"; // wordmark ink
const GOLD = "#B8860B"; // var(--color-accent) equivalent

export default function Footer({ variant = "compact" }: { variant?: "full" | "compact" }) {
  const { info } = useParishInfo();
  const { season } = useLiturgicalSeason();
  const { user, isAuthenticated } = useAuth();
  const isAdmin = isAuthenticated && user?.role === "admin";

  const phone = info?.phone ?? "(914) 273-9724";
  const tel = (info?.phone ?? "9142739724").replace(/\D/g, "");
  const email = info?.officeEmail ?? "office@stpatrickinarmonk.org";
  const flocknote = info?.flocknoteUrl ?? "https://stpatarmonk.flocknote.com/home";
  const youtube = info?.youtubeUrl ?? "https://www.youtube.com/@StPatricksArmonk";
  const city = info?.city ?? "Armonk";
  const state = info?.state ?? "NY";
  const seasonLabel = season
    ? season.charAt(0).toUpperCase() + season.slice(1).replace(/_/g, " ")
    : "Ordinary Time";

  return (
    <footer className="spf-root">
      <style>{`
        .spf-root{background:#f8f9fc;color:#555;border-top:3px solid transparent;
          border-image:linear-gradient(90deg, ${GREEN} 0%, ${GOLD} 100%) 1;
          -webkit-font-smoothing:antialiased;}
        .spf-root *{box-sizing:border-box;}
        .spf-main{padding:22px 20px 20px;}
        .spf-inner{max-width:1100px;margin:0 auto;}
        .spf-head{padding-bottom:16px;border-bottom:1px solid #e1e4e8;margin-bottom:16px;}
        .spf-brand{color:${GREEN_DARK};font-size:20px;font-weight:800;text-transform:uppercase;
          letter-spacing:.5px;line-height:1;display:block;margin-bottom:3px;
          font-family:'Fraunces',Georgia,serif;}
        .spf-tagline{color:${GOLD};font-size:11px;font-weight:700;text-transform:uppercase;
          letter-spacing:1.5px;line-height:1.3;display:block;margin-bottom:14px;}
        .spf-meta{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
        .spf-season{display:inline-flex;align-items:center;gap:6px;background:#eef6f1;
          border:1px solid #cfe6da;border-radius:50px;padding:5px 11px;flex-shrink:0;
          transition:all .2s ease;cursor:pointer;}
        .spf-season:hover{background:#e3f0e9;border-color:${GREEN};}
        .spf-dot{width:6px;height:6px;border-radius:50%;background:#22c55e;flex-shrink:0;
          animation:spf-pulse 2s infinite;}
        @keyframes spf-pulse{0%,100%{opacity:1}50%{opacity:.4}}
        .spf-season-txt{font-size:12px;font-weight:700;color:${GREEN};text-transform:uppercase;
          letter-spacing:.8px;line-height:1;}
        .spf-season-cta{font-size:12px;font-weight:700;color:${GOLD};letter-spacing:.3px;line-height:1;}
        .spf-vdot{width:3px;height:3px;border-radius:50%;background:#cfe6da;flex-shrink:0;}
        .spf-ico{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;
          border:1px solid #e1e4e8;border-radius:8px;background:#fff;transition:all .2s ease;flex-shrink:0;}
        .spf-ico:hover{border-color:${GREEN};background:#eef6f1;}
        .spf-ico.yt:hover{border-color:#e0301e;background:#fdecea;}
        .spf-tools{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;}
        .spf-card{background:#fff;border:1.5px solid #e1e4e8;border-radius:12px;padding:16px 14px 14px;
          display:flex;flex-direction:column;gap:5px;position:relative;overflow:hidden;transition:all .2s ease;}
        .spf-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;}
        .spf-card.green::before{background:${GREEN};}
        .spf-card.gold::before{background:${GOLD};}
        .spf-card.navy::before{background:${GREEN_DARK};}
        .spf-card:hover{border-color:${GREEN};box-shadow:0 6px 20px rgba(46,125,79,.14);transform:translateY(-2px);}
        .spf-tico{width:28px;height:28px;border-radius:7px;display:flex;align-items:center;justify-content:center;
          flex-shrink:0;margin-bottom:6px;}
        .spf-tico.green{background:#f0fdf4;color:${GREEN};}
        .spf-tico.gold{background:#fbf3dc;color:${GOLD};}
        .spf-tico.navy{background:#e8efe9;color:${GREEN_DARK};}
        .spf-label{font-size:10px;font-weight:800;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;line-height:1;}
        .spf-name{font-size:15px;font-weight:800;color:${GREEN_DARK};line-height:1.2;}
        .spf-desc{font-size:12.5px;color:#6b7280;line-height:1.4;margin-top:2px;}
        .spf-arrow{font-size:13px;color:#c0cad6;margin-top:auto;padding-top:10px;font-weight:700;}
        .spf-legal{background:#edf3ef;border-top:2px solid #cfe6da;padding:9px 20px;margin-top:20px;}
        .spf-legal-in{max-width:1100px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;}
        .spf-legal p{margin:0;font-size:12px;color:#6b7280;line-height:1.4;}
        .spf-power{display:inline-flex;align-items:center;gap:5px;}
        .spf-power span{font-size:12px;color:#6b7280;}
        .spf-power b{font-size:12px;font-weight:700;color:${GOLD};}
        .spf-staff{font-size:12px;color:#9ca3af;display:inline-flex;align-items:center;gap:4px;}
        .spf-staff:hover{color:${GREEN};}
        @media(max-width:520px){
          .spf-main{padding:18px 14px 16px;}
          .spf-tools{gap:8px;}
          .spf-card{padding:12px 10px 10px;border-radius:10px;}
          .spf-desc,.spf-arrow{display:none;}
          .spf-name{font-size:12px;}
          .spf-legal{padding:9px 14px;margin-top:16px;}
          .spf-legal-in{flex-direction:column;align-items:flex-start;gap:6px;}
          .spf-legal p{font-size:11px;}
        }
      `}</style>

      <div className="spf-main">
        <div className="spf-inner">
          <div className="spf-head">
            <span className="spf-brand">St. Patrick in Armonk</span>
            <span className="spf-tagline">God Bless the Whole World, No Exceptions</span>
            <div className="spf-meta">
              {/* Liturgical season is the DOOR to Today's Readings, Saint & Catholic News */}
              <Link
                href="/worship/today"
                className="spf-season"
                aria-label={`${seasonLabel} — open Today's Readings, Saint & Catholic News`}
              >
                <span className="spf-dot" />
                <span className="spf-season-txt">{seasonLabel}</span>
                <span className="spf-season-cta">· Readings &amp; News &#8594;</span>
              </Link>
              <span className="spf-vdot" />
              <a className="spf-ico" href={`mailto:${email}`} aria-label="Email the parish office">
                <Mail size={15} color={GREEN} />
              </a>
              <a className="spf-ico" href={`tel:${tel}`} aria-label={`Call ${phone}`}>
                <Phone size={15} color={GREEN} />
              </a>
              <a className="spf-ico" href={flocknote} target="_blank" rel="noopener noreferrer" aria-label="Join Flocknote for updates">
                <Bell size={15} color={GOLD} />
              </a>
              <a className="spf-ico yt" href="/watch" aria-label="Watch Mass">
                <Youtube size={16} color="#e0301e" />
              </a>
            </div>
          </div>

          {variant === "full" && (
          <div className="spf-tools">
            <Link href="/mass-times" className="spf-card green">
              <div className="spf-tico green"><Calendar size={14} /></div>
              <span className="spf-label">Mass Times</span>
              <span className="spf-name">This Week's Schedule</span>
              <span className="spf-desc">Mass, Confession &amp; Adoration</span>
              <span className="spf-arrow">View &#8594;</span>
            </Link>
            <Link href="/giving" className="spf-card gold">
              <div className="spf-tico gold"><Heart size={14} /></div>
              <span className="spf-label">Giving</span>
              <span className="spf-name">Support the Parish</span>
              <span className="spf-desc">Give online or by text</span>
              <span className="spf-arrow">View &#8594;</span>
            </Link>
            <Link href="/contact" className="spf-card navy">
              <div className="spf-tico navy"><MapPin size={14} /></div>
              <span className="spf-label">Contact</span>
              <span className="spf-name">Visit &amp; Directions</span>
              <span className="spf-desc">29 Cox Ave, {city} {state}</span>
              <span className="spf-arrow">View &#8594;</span>
            </Link>
          </div>
          )}
        </div>
      </div>

      <div className="spf-legal">
        <div className="spf-legal-in">
          <p>
            &copy; {new Date().getFullYear()} St. Patrick in {city} ·{" "}
            <a href="https://archny.org" target="_blank" rel="noopener noreferrer" style={{ color: "#6b7280" }}>
              Archdiocese of New York
            </a>{" "}
            · {city}, {state}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            {isAdmin ? (
              <Link href="/admin" className="spf-staff"><Shield size={11} /> Admin Dashboard</Link>
            ) : (
              <a href={getLoginUrl()} className="spf-staff"><Shield size={11} /> Staff Login</a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
