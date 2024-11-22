import { useState } from "react";
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

  const [isClicked, setIsClicked] = useState<boolean>(false);
  const [name, setName] = useState<string>("");

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

  const handleButtonClick = () => {
    setIsClicked(true);
  };

  const onChange = (e: any) => {
    setName(e.target.value);
  };

  return (
    <div className="main_content">
      <div className="title-wrapper">
        <div className="title" style={{ paddingBottom: "14px" }}>
          2025년
        </div>
        {isClicked ? (
          <div className="title_sub">{name}에게 일어날 5가지</div>
        ) : (
          <div className="title_sub">내게 일어날 좋은 일들!</div>
        )}
      </div>
      {/* <div className="title_sub">5가지!</div> */}
      {/* <img src="/assets/images/emo1.jpeg" /> */}
      {isClicked ? (
        <>
          <div className="emoji">{getRandomEmojis(5)}</div>
        </>
      ) : (
        <div style={{ paddingTop: "40px" }}>
          <div>
            <input
              className="simple-input"
              type="text"
              placeholder="이름"
              onChange={onChange}
            />
          </div>
          <div style={{ paddingTop: "40px" }}>
            <button
              className="cute-button"
              disabled={name.length < 1}
              onClick={() => {
                handleButtonClick();
              }}
            >
              알아보자✨
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainPage;
