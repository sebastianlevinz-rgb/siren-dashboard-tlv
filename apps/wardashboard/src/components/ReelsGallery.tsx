import { type Lang } from "../i18n";

interface Props { lang: Lang; }

const REELS = [
  { id: "wd-concept", title: { en: "What is War Dashboard?", es: "Que es War Dashboard?", he: "?מה זה War Dashboard" }, color: "#4A90D9" },
  { id: "wd-how", title: { en: "How it Works", es: "Como Funciona", he: "איך זה עובד" }, color: "#4A90D9" },
  { id: "wd-why", title: { en: "Why It Exists", es: "Por Que Existe", he: "למה זה קיים" }, color: "#4A90D9" },
  { id: "mp-concept", title: { en: "What is Missile Probability?", es: "Que es Missile Probability?", he: "?מה זה Missile Probability" }, color: "#d4822a" },
  { id: "mp-heatmap", title: { en: "The Heatmap Explained", es: "El Heatmap Explicado", he: "מפת החום" }, color: "#d4822a" },
  { id: "mp-shelter", title: { en: "Built During the War", es: "Construido en Guerra", he: "נבנה במהלך המלחמה" }, color: "#d4822a" },
  { id: "combo", title: { en: "Two Tools, One Mission", es: "Dos Herramientas, Una Mision", he: "שני כלים, משימה אחת" }, color: "#7b7f9e" },
];

const TEXT = {
  title: { en: "Video Reels", es: "Video Reels", he: "סרטונים" },
  sub: { en: "Explainer videos — coming soon to TikTok & Instagram", es: "Videos explicativos — pronto en TikTok e Instagram", he: "סרטוני הסבר — בקרוב בטיקטוק ואינסטגרם" },
  coming: { en: "Coming soon", es: "Pronto", he: "בקרוב" },
};

export default function ReelsGallery({ lang }: Props) {
  return (
    <section className="wd-section">
      <div className="wd-section-header">
        <span className="wd-section-line" />
        <span className="wd-section-tag">REELS</span>
        <span className="wd-section-title">{TEXT.title[lang]}</span>
        <span className="wd-section-line" />
      </div>
      <p className="wd-subtitle">{TEXT.sub[lang]}</p>

      <div className="wd-reels-grid">
        {REELS.map(r => (
          <div key={r.id} className="wd-reel-card">
            <div className="wd-reel-placeholder" style={{ borderColor: r.color }}>
              <span className="wd-reel-play" style={{ color: r.color }}>▶</span>
              <span className="wd-reel-soon">{TEXT.coming[lang]}</span>
            </div>
            <span className="wd-reel-title">{r.title[lang]}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
