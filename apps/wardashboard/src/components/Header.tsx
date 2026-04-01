import { type Lang, t } from "../i18n";

const LANGS: Lang[] = ["en", "es", "he"];

interface Props { lang: Lang; onLangChange: (l: Lang) => void; }

export default function Header({ lang, onLangChange }: Props) {
  const now = new Date();
  const locale = lang === "he" ? "he-IL" : lang === "es" ? "es-AR" : "en-GB";
  const dateStr = now.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <header className="wd-header">
      <div className="wd-header-left">
        <div className="wd-brand">⚔️ WAR DASHBOARD</div>
        <div className="wd-tagline">{t("tagline", lang)}</div>
      </div>
      <div className="wd-header-right">
        <div className="wd-lang-row">
          {LANGS.map(l => (
            <button key={l} className={`wd-lang-btn ${lang === l ? "active" : ""}`} onClick={() => onLangChange(l)}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
        <a href="https://missileprobability.com" target="_blank" rel="noopener noreferrer" className="wd-crosslink">
          🚀 {t("missile_data", lang)} ↗
        </a>
        <time className="wd-date">{dateStr}</time>
        <span className="wd-status">
          <span className="wd-status-dot" />
          {t("active_conflict", lang)}
        </span>
      </div>
    </header>
  );
}
