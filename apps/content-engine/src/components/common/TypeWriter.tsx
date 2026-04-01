import { useCurrentFrame } from "remotion";

interface Props {
  text: string;
  fontSize?: number;
  color?: string;
  delay?: number;
  speed?: number; // chars per frame
}

/**
 * Typing effect — text appears character by character.
 */
export function TypeWriter({ text, fontSize = 48, color = "#d8dae5", delay = 0, speed = 1.5 }: Props) {
  const frame = useCurrentFrame();
  const charsVisible = Math.min(Math.floor((frame - delay) * speed), text.length);
  if (charsVisible <= 0) return null;

  return (
    <div style={{
      fontSize,
      fontWeight: 700,
      color,
      fontFamily: "'JetBrains Mono', monospace",
      lineHeight: 1.3,
      textAlign: "center",
    }}>
      {text.slice(0, charsVisible)}
      <span style={{ opacity: frame % 20 < 10 ? 1 : 0, color: "#4A90D9" }}>|</span>
    </div>
  );
}
