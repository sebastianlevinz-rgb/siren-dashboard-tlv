import { type Lang } from "../i18n";

interface Props { lang: Lang; }

const VIDEOS = [
  { id: "final-mp", title: { en: "What is Missile Probability?", es: "Que es Missile Probability?", he: "?מה זה Missile Probability" }, duration: "63s" },
  { id: "final-wd", title: { en: "What is War Dashboard?", es: "Que es War Dashboard?", he: "?מה זה War Dashboard" }, duration: "66s" },
  { id: "final-situation", title: { en: "Current Military Situation", es: "Situacion Militar Actual", he: "המצב הצבאי הנוכחי" }, duration: "85s" },
  { id: "final-weekly", title: { en: "5 Weeks of War — Recap", es: "5 Semanas de Guerra — Resumen", he: "5 שבועות מלחמה — סיכום" }, duration: "92s" },
];

const TEXT = {
  title: { en: "VIDEO BRIEFINGS", es: "INFORMES EN VIDEO", he: "תדריכים בוידאו" },
  sub: { en: "AI-narrated video briefings with real data from 957 alerts", es: "Informes narrados por IA con datos reales de 957 alertas", he: "תדריכי וידאו מקריינים ע\"י AI עם נתונים אמיתיים מ-957 התרעות" },
};

export default function ReelsGallery({ lang }: Props) {
  return (
    <section className="wd-section">
      <div className="wd-section-header">
        <span className="wd-section-line" />
        <span className="wd-section-tag">MEDIA</span>
        <span className="wd-section-title">{TEXT.title[lang]}</span>
        <span className="wd-section-line" />
      </div>
      <p className="wd-subtitle">{TEXT.sub[lang]}</p>

      <div className="wd-videos-list">
        {VIDEOS.map(v => (
          <div key={v.id} className="wd-video-card">
            <video
              src={`/videos/${v.id}.mp4`}
              controls
              preload="metadata"
              playsInline
              className="wd-video-player"
            />
            <div className="wd-video-info">
              <span className="wd-video-title">{v.title[lang]}</span>
              <span className="wd-video-duration">{v.duration}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
