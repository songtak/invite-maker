import React, { useEffect, useState, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  runTransaction,
  addDoc,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import _ from "lodash";
import IosShareIcon from "@mui/icons-material/IosShare";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import domtoimage from "dom-to-image";
import ReactGA from "react-ga4";
import dayjs from "dayjs";
import { getResponseFromGPT } from "../services/api";
import { emojiList1 } from "../assets/emojis/emojiList1";
import { emojiList2 } from "../assets/emojis/emojiList2";
import { emojiList3 } from "../assets/emojis/emojiList3";
import { emojiList4 } from "../assets/emojis/emojiList4";
import { emojiList5 } from "../assets/emojis/emojiList5";
import { emojiList6 } from "../assets/emojis/emojiList6";
import { stringLength } from "@firebase/util";
import { introduction } from "../assets/introduction";
import { jwList } from "../assets/jw";

import TypingEffect from "../components/TypingEffect";

type Emoji = {
  id: number;
  emoji: string;
  title: string;
  symbol: string;
  description: string;
};

const emojiList: Emoji[] = [
  ...emojiList1,
  ...emojiList2,
  ...emojiList3,
  ...emojiList4,
  ...emojiList5,
  ...emojiList6,
];

type Result = {
  name: string;
  date: string;
  resultContent: string;
  emojis: string;
  check_date: string;
  emojiIds: string;
};

const JwPage = () => {
  const location = useLocation();

  const now = dayjs();
  const [name, setName] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [emojis, setEmojis] = useState<string[] | string>([""]);
  const [chatData, setChatData] = useState<string>("");
  const [emojiIds, setEmojiIds] = useState<number[] | null>(null);
  const [randomData, setRandomData] = useState<Emoji[] | null>(null);
  const [isDone, setIsDone] = useState<boolean>(false);
  const [isIntroDone, setIsIntroDone] = useState<boolean>(false);
  const [isShowEmojis, setIsShowEmojis] = useState<boolean>(false);
  const [showEmojiFiveIntro1, setShowEmojiFiveIntro1] = useState<string>("");
  const [showEmojiFiveIntro2, setShowEmojiFiveIntro2] = useState<string>("");

  const [saveChatData, setSaveChatData] = useState<string>("");

  const searchParams = new URLSearchParams(location.search.slice(1));
  const nameParam = searchParams.get("name");
  const dateParam = searchParams.get("date");

  const emojiFiveIntro1 = `이제 ${nameParam}의 2025년을 나타내는` as string;
  const emojiFiveIntro2 = ` 특별한 이모지 다섯 개를 소개할게!` as string;

  const getRandomEmojis = (count: number): Emoji[] => {
    // 유효한 ID만 추출
    const availableIds = emojiList.map((e) => e.id);

    // 랜덤 ID 생성 함수 (주어진 범위에서 랜덤 값 생성)
    const getRandomInRange = (start: number, end: number): number => {
      return Math.floor(Math.random() * (end - start + 1)) + start;
    };

    // 각 구간에서 랜덤 ID를 선택
    const selectedEmojis: Emoji[] = [];
    for (let i = 0; i < count; i++) {
      const rangeStart = i * 235 + 1; // 시작 ID
      const rangeEnd = rangeStart + 235 - 1; // 끝 ID

      // 유효한 ID만 필터링
      const validIdsInRange = availableIds.filter(
        (id) => id >= rangeStart && id <= rangeEnd
      );

      if (validIdsInRange.length > 0) {
        // 랜덤하게 하나 선택
        const randomId =
          validIdsInRange[getRandomInRange(0, validIdsInRange.length - 1)];
        const emoji = emojiList.find((e) => e.id === randomId);

        // 중복 방지 및 추가
        if (emoji && !selectedEmojis.includes(emoji)) {
          selectedEmojis.push(emoji);
        }
      }
    }

    // ID 기준으로 오름차순 정렬
    return selectedEmojis.sort((a, b) => a.id - b.id);
  };

  const getEmojiResult = async () => {
    let chat: any;
    const randomEmojis = getRandomEmojis(5);
    const randomIntroduction = Math.floor(Math.random() * 10) + 1;
    const emoji = randomEmojis.map((item) => item.emoji);
    const emojiIds = randomEmojis.map((item) => item.id);

    setEmojis(emoji);
    setEmojiIds(emojiIds);
    setSaveChatData(
      introduction[randomIntroduction - 1].description.replace(
        /{nameParam}/g,
        nameParam as string
      )
    );
    addResultWithCustomDocName({
      name: nameParam as string,
      date: dateParam as string,
      resultContent: introduction[randomIntroduction - 1].description.replace(
        /{nameParam}/g,
        nameParam as string
      ),
      emojis: emoji.join(""),
      check_date: now.format("YYYY-MM-DD hh:mm"),
      emojiIds: emojiIds.toString(),
    });
  };

  /** 파이어베이스에 저장된 값 가져오기 */
  const findDocumentByName = async () => {
    try {
      // 특정 문서의 참조를 생성
      const docRef = doc(db, "result-list", `${dateParam}_${nameParam}`);

      // 문서 가져오기
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const saveData = docSnap.data();

        setEmojis(saveData.emojis);
        setEmojiIds(saveData.emojiIds.split(",").map(Number));
        setSaveChatData(saveData.resultContent);

        return true;
      } else {
        return false;
      }
    } catch (e) {
      console.error("Error fetching document:", e);
      return false;
    }
  };

  /** 파이어스토어에 결과 저장 */
  const addResultWithCustomDocName = async (resultData: Result) => {
    try {
      const resultListRef = collection(db, "result-list");

      // 현재 컬렉션의 문서 개수를 가져옴
      const snapshot = await getDocs(resultListRef);
      const currentLength = snapshot.size; // 문서 개수

      // 새로운 ID 계산
      const newID = currentLength + 1;

      // 새로운 문서 데이터
      const newResult = {
        ...resultData,
        id: newID, // ID 필드에 새로 계산된 값 추가
      };

      // 문서 이름 지정하여 저장
      const docRef = doc(db, "result-list", `${dateParam}_${nameParam}`); // customDocName은 지정할 문서 이름
      await setDoc(docRef, newResult);

      console.log("Document successfully added with custom name:", name);
    } catch (e) {
      console.error("Error adding document with custom name:", e);
    }
  };

  /** =============================================================================== */

  const isMobile = () => {
    return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
      navigator.userAgent
    );
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("주소가 복사되었습니다!");
    } catch (error) {
      console.error("URL 복사 실패:", error);
      alert("URL 복사에 실패했습니다.");
    }
  };
  // 모바일 공유 함수
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `이모지로 보는 ${nameParam}의 2025년 긍정 파워!`,
          text: "🫧🫧🐍🐍",
          url: window.location.href,
        });
      } catch (error) {
        console.error("공유 실패:", error);
      }
    } else {
      alert("공유하기 기능을 지원하지 않는 브라우저입니다. 링크를 복사합니다.");
      copyToClipboard();
    }
  };

  const handleClickNoah = () => {
    ReactGA.event("째웅_인스타_버튼_클릭", {
      category: "jw_insta_button_click",
      action: "쨰웅 인스타",
      label: `${dateParam}_${nameParam}`,
    });

    window.location.href = "https://instagram.com/noahsfilmo";
  };

  const handleTypingComplete = () => {
    setIsShowEmojis(true);
  };

  /** =============================================================================== */

  const [count, setCount] = useState(0);

  useEffect(() => {
    if (saveChatData.length > 0) {
      const typingInterval = setInterval(() => {
        setChatData((prevTitleValue) => prevTitleValue + saveChatData[count]);
        setCount((prevCount) => prevCount + 1);
      }, 60);

      if (count > 0 && count === saveChatData.length) {
        setIsDone(true);
        clearInterval(typingInterval);
      }
      return () => {
        clearInterval(typingInterval);
      };
    }
  }, [saveChatData, count]);
  /** =============================================================================== */

  useEffect(() => {
    ReactGA.set({ page: location.pathname });
    ReactGA.send("pageview");
  }, [location]);
  /** =============================================================================== */

  return (
    <div className="main_content">
      <div className="page_wrapper">
        <div className="title-wrapper">
          <div className="title">🫧 2025 🐍</div>
          <div>
            <div className="title_sub">🥰째웅에게</div>
            <div className="title_sub">일어날 좋은 일들!</div>
          </div>
        </div>

        <div className="chat ">
          <div className="intro_wrapper">
            <div className="lh">{chatData}</div>
            <div className="">
              <div className="emoji">💘💵🌳🌊🐶</div>
            </div>
          </div>
          <div className="description_wrapper" style={{ marginBottom: "40px" }}>
            <TypingEffect data={jwList} onComplete={handleTypingComplete} />
            {isShowEmojis && (
              <div className="description_emoji_wrapper">
                <div
                  className="pb16 lh"
                  style={{
                    fontWeight: 700,
                    fontSize: 18,
                    marginTop: 32,
                  }}
                >
                  2025년 째웅이의 키워드
                </div>
                <div className="pb16 lh">
                  💖 깊어진 사랑 | 💰 풍요로운 결실 | 🌱 꾸준한 성장 | 🌊
                  평화로운 흐름 | 🐾 믿음의 연결
                </div>
                <div className="pb16 lh" style={{ marginTop: 32 }}>
                  너는 2025년에 진짜 잘될 수밖에 없어.
                  <div>
                    지금처럼만 해도 네가 상상하지 못한 행복들이 너한테 찾아올
                    거야 💕
                  </div>
                  네가 누릴 모든 순간이 기대돼! 😊
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className="songtak"
        style={{ paddingBottom: "24px", paddingTop: "24px" }}
      >
        <span
          style={{ cursor: "pointer" }}
          onClick={() => {
            handleClickNoah();
          }}
        >
          @noahsfilmo 💫
        </span>
      </div>
    </div>
  );
};

export default JwPage;
