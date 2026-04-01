import { Audio, useCurrentFrame, useVideoConfig, interpolate, staticFile } from "remotion";

interface Props {
  file: string;
  baseVolume?: number;
  fadeOutFrames?: number;
}

/**
 * Background music with automatic fade out at the end.
 */
export function MusicFadeOut({ file, baseVolume = 0.25, fadeOutFrames = 60 }: Props) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const volume = interpolate(
    frame,
    [durationInFrames - fadeOutFrames, durationInFrames],
    [baseVolume, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return <Audio src={staticFile(`audio/${file}`)} volume={volume} />;
}
