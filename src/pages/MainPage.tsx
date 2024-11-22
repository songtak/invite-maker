import { useNavigate } from "react-router-dom";
import { emojiList1 } from "../assets/emojis/emojiList1";
import { emojiList2 } from "../assets/emojis/emojiList2";
import { emojiList3 } from "../assets/emojis/emojiList3";
import { emojiList4 } from "../assets/emojis/emojiList4";
import { emojiList5 } from "../assets/emojis/emojiList5";
import { emojiList6 } from "../assets/emojis/emojiList6";

type Emoji = { id: number; emoji: string };

const MainPage = () => {
  // const navigate = useNavigate();

  const emojiList = [
    ...emojiList1,
    ...emojiList2,
    ...emojiList3,
    ...emojiList4,
    ...emojiList5,
    ...emojiList6,
  ];

  const getRandomEmojis = (count: number): string[] => {
    // 1. 모든 ID를 배열로 추출
    const availableIds = emojiList.map((e) => e.id);

    // 2. 랜덤 ID 생성 함수
    const getRandomId = (): number => {
      return Math.floor(Math.random() * 500) + 1; // 1부터 500까지
    };

    // 3. 랜덤 이모지 가져오기
    const selectedEmojis: string[] = [];

    while (selectedEmojis.length < count) {
      // 랜덤 ID 생성
      const randomIds = Array.from(
        { length: count - selectedEmojis.length },
        getRandomId
      );

      // 유효한 ID만 필터링
      const validIds = randomIds.filter((id) => availableIds.includes(id));

      // ID를 기반으로 이모지를 추가
      validIds.forEach((id) => {
        const emoji = emojiList.find((e) => e.id === id)?.emoji;
        if (emoji) selectedEmojis.push(emoji);
      });
    }

    return selectedEmojis;
  };
  return (
    <>
      <div style={{ color: "black" }}>Main Page</div>
      {getRandomEmojis(5)}
    </>
  );
};

export default MainPage;
