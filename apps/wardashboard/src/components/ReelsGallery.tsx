import { type Lang } from "../i18n";

interface Props { lang: Lang; }

const REELS = [
  { id: "wd-concept", title: { en: "What is War Dashboard?", es: "Que es War Dashboard?", he: "?מה זה War Dashboard" }, category: "wd" },
  { id: "wd-how", title: { en: "How it Works", es: "Como Funciona", he: "איך זה עובד" }, category: "wd" },
  { id: "wd-why", title: { en: "Why It Exists", es: "Por Que Existe", he: "למה זה קיים" }, category: "wd" },
  { id: "mp-concept", title: { en: "What is Missile Probability?", es: "Que es Missile Probability?", he: "?מה זה Missile Probability" }, category: "mp" },
  { id: "mp-heatmap", title: { en: "The Heatmap Explained", es: "El Heatmap Explicado", he: "מפת החום" }, category: "mp" },
  { id: "mp-shelter", title: { en: "Built During the War", es: "Construido en Guerra", he: "נבנה במהלך המלחמה" }, category: "mp" },
  { id: "combo", title: { en: "Two Tools, One Mission", es: "Dos Herramientas, Una Mision", he: "שני כלים, משימה אחת" }, category: "combo" },
];

const TEXT = {
  title: { en: "Video Reels", es: "Video Reels", he: "סרטונים" },
  sub: { en: "Share these explainer videos on social media", es: "Compartí estos videos explicativos en redes", he: "שתפו את הסרטונים ברשתות" },
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
            <video
              src={`/reels/${r.id}.mp4`}
              controls
              preload="metadata"
              playsInline
              className="wd-reel-video"
            />
            <span className="wd-reel-title">{r.title[lang]}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
