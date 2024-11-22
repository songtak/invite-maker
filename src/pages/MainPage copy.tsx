import { useNavigate } from "react-router-dom";

const MainPage = () => {
  // const navigate = useNavigate();

  const generateRandomEmojis = (count: number): string[] => {
    const emojiRanges = [
      [0x1f300, 0x1f5ff], // 다양한 상징 및 피토그래프
      [0x1f680, 0x1f6ff], // 교통 및 지도 기호
      [0x2600, 0x26ff], // 다양한 기호 (☀️, ☔, ⚡ 등)
      [0x2700, 0x27bf], // 딩뱃 기호
      [0x1f900, 0x1f9ff], // 확장 기호
      [0x1fa70, 0x1faff], // 손 모양 및 확장 기호
    ];

    const generateEmoji = (): string => {
      const range = emojiRanges[Math.floor(Math.random() * emojiRanges.length)];
      const randomCode =
        Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
      return String.fromCodePoint(randomCode);
    };

    const emojis: Set<string> = new Set();

    // 초기 랜덤 이모지 생성
    while (emojis.size < count) {
      emojis.add(generateEmoji());
    }

    // "🖘"가 있는지 확인하고 교체
    while (emojis.has("🖘")) {
      emojis.delete("🖘"); // 제거
      let newEmoji;
      do {
        newEmoji = generateEmoji();
      } while (emojis.has(newEmoji)); // 중복 방지
      emojis.add(newEmoji);
    }

    return Array.from(emojis);
  };

  return (
    <>
      <div style={{ color: "black" }}>Main Page</div>
      {generateRandomEmojis(5)}
    </>
  );
};

export default MainPage;
