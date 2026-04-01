import { ReelLayoutV2 } from "../../ReelLayoutV2";
import { TypeWriter } from "../../common/TypeWriter";

interface Props { text: string; accentColor?: string; }

export function TypingHookScene({ text, accentColor = "#4A90D9" }: Props) {
  return (
    <ReelLayoutV2 accentColor={accentColor}>
      <TypeWriter text={text} fontSize={56} color={accentColor} speed={1.2} />
    </ReelLayoutV2>
  );
}
