import { useEffect, useState } from "react";

import { getResponseFromGPT } from "../services/api";
import { emojiList1 } from "../assets/emojis/emojiList1";
import { emojiList2 } from "../assets/emojis/emojiList2";
import { emojiList3 } from "../assets/emojis/emojiList3";
import { emojiList4 } from "../assets/emojis/emojiList4";
import { emojiList5 } from "../assets/emojis/emojiList5";
import { emojiList6 } from "../assets/emojis/emojiList6";

const emojiList = [
  ...emojiList1,
  ...emojiList2,
  ...emojiList3,
  ...emojiList4,
  ...emojiList5,
  ...emojiList6,
];

const ResultPage = () => {
  const [name, setName] = useState<string>("");
  const [emojis, setEmojis] = useState<string[]>([""]);
  const [chatData, setChatData] = useState<string>("");

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

  const getResult = async () => {
    const emoji = getRandomEmojis(5);
    setEmojis(emoji);
    await getResponseFromGPT(
      `친구 ${name}의 이모지가 이렇게 ${emoji} 5개가 나왔는데 이걸 토대로 2025년 운세를 해석해줘 무조건 긍정적인 방향으로 부탁해! 내용은 이모지(이모지 이름) 내용서술 줄바꿈 다음 이모지... 그리고 마지막엔 정리! 그리고 친구에게 말하듯 다정한 말투로 부탁하고 친구의 이름도 불러줘!`,
      // `${emojis} 이 이모지 5개가 나왔는데 이걸 토대로 2025년 운세를 해석해줘 무조건 긍정적인 방향으로 부탁해! 그리고 친구한테 말하듯 서술적으로!`
      (chunk: any) => {
        setChatData((prev) => prev + chunk); // 스트리밍 데이터 추가
      }
    );
  };
  useEffect(() => {
    // getResult();
  }, []);

  return (
    <div>
      <div>Login</div>
    </div>
  );
};

export default ResultPage;
