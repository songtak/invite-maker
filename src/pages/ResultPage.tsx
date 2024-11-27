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

const ResultPage = () => {
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
    const randomIntroduction = Math.floor(Math.random() * 20) + 1;
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

  const handleClickShare = async () => {
    ReactGA.event("공유하기_버튼_클릭", {
      category: "share_button_click",
      action: "공유하기 버튼 클릭",
      label: `${dateParam}_${nameParam}`,
    });
    if (isMobile()) {
      handleShare(); // 모바일: 공유하기
    } else {
      copyToClipboard(); // 웹: URL 복사
    }
  };
  const handleClickSave = () => {
    ReactGA.event("저장하기_버튼_클릭", {
      category: "save_button_click",
      action: "저장하기 버튼 클릭",
      label: `${dateParam}_${nameParam}`,
    });
    createSignatureImage();
  };

  const handleClickSongtak = () => {
    ReactGA.event("송탁_버튼_클릭", {
      category: "songtak_button_click",
      action: "송탁 버튼 클릭",
      label: `${dateParam}_${nameParam}`,
    });

    window.location.href = "https://instagram.com/sn9tk";
  };

  const handleTypingComplete = () => {
    setIsShowEmojis(true);
  };
  /** =============================================================================== */
  const signatureImageRef = useRef<HTMLDivElement>(null);

  /**
   * @function
   * @description 다운로드 이미지 생성
   */
  const createSignatureImage = useCallback(async () => {
    if (signatureImageRef.current === null) {
      return;
    }

    await domtoimage
      .toJpeg(signatureImageRef.current, { cacheBust: true, quality: 1 })
      .then((dataUrl: string) => {
        const isIOS = /iP(ad|hone|od)/i.test(navigator.userAgent);

        if (isIOS) {
          // iOS에서는 Base64 데이터를 직접 새로운 페이지에서 표시
          const newTab = window.open();
          if (newTab) {
            newTab.document.body.style.margin = "0";
            newTab.document.body.style.display = "flex";
            newTab.document.body.style.justifyContent = "center";
            newTab.document.body.style.alignItems = "center";

            const img = newTab.document.createElement("img");
            img.src = dataUrl;
            img.style.maxWidth = "100%";
            img.style.height = "auto";

            newTab.document.body.appendChild(img);
          } else {
            alert("새 창을 열 수 없습니다. 팝업 차단을 해제해주세요.");
          }
        } else {
          // 일반 브라우저 다운로드 처리
          const [header, base64Data] = dataUrl.split(",");
          /** @ts-ignore */
          const mimeType = header?.match(/:(.*?);/)[1];
          const binary = atob(base64Data);
          const array = [];
          for (let i = 0; i < binary.length; i++) {
            array.push(binary.charCodeAt(i));
          }
          const blob = new Blob([new Uint8Array(array)], { type: mimeType });
          const blobUrl = URL.createObjectURL(blob);

          const link = document.createElement("a");
          link.href = blobUrl;
          link.download = `이모지로 보는 ${nameParam}의 2025년 긍정 파워!`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          URL.revokeObjectURL(blobUrl); // 메모리 정리
        }
      })
      .catch((e: any) => {
        console.log("createSignatureImage / ERROR", e);
      });
  }, [signatureImageRef]);

  /** 저장용 이미지 html */
  const signatureImageHtml = () => {
    return (
      <div className="save_image_wrapper" ref={signatureImageRef}>
        <div className="save_image_title" style={{ paddingBottom: "14px" }}>
          🫧 2025 🐍
        </div>
        <div style={{ marginBottom: 16 }}>
          <div className="save_image_title_sub">{name}에게</div>
          <div className="save_image_title_sub">일어날 좋은 일들!</div>
        </div>
        <div className="save_image_emoji">{emojis}</div>
        <div>
          <div></div>
          <div
            style={{ color: "#ff8800", fontSize: "18px" }}
          >{`✨ https://www.emoji2025.site/result?name=${nameParam}&date=${dateParam} ✨`}</div>
          {/* <p className="save_image_chat">{saveChatData}</p> */}
        </div>
        <div
          className="songtak"
          style={{ paddingBottom: "24px", paddingTop: "24px" }}
        >
          <span style={{ color: "#555555", fontSize: "12px", fontWeight: 500 }}>
            @sn9tk
          </span>
        </div>
      </div>
    );
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
  const [introCount1, setIntroCount1] = useState(0);
  const [introCount2, setIntroCount2] = useState(0);
  const [intro1Done, setIntro1Done] = useState(false);

  useEffect(() => {
    if (isDone && !intro1Done) {
      const typingInterval1 = setInterval(() => {
        setShowEmojiFiveIntro1((prev) => prev + emojiFiveIntro1[introCount1]);
        if (introCount1 + 1 === emojiFiveIntro1.length) {
          setIntro1Done(true);
          clearInterval(typingInterval1);
        } else {
          setIntroCount1((prev) => prev + 1);
        }
      }, 60);

      return () => clearInterval(typingInterval1);
    }
  }, [isDone, introCount1, intro1Done]);

  useEffect(() => {
    if (isDone && intro1Done) {
      const typingInterval2 = setInterval(() => {
        setShowEmojiFiveIntro2((prev) => prev + emojiFiveIntro2[introCount2]);
        if (introCount2 + 1 === emojiFiveIntro2.length) {
          clearInterval(typingInterval2);
          setIsIntroDone(true);
        } else {
          setIntroCount2((prev) => prev + 1);
        }
      }, 60);

      return () => clearInterval(typingInterval2);
    }
  }, [isDone, intro1Done, introCount2]);

  /** =============================================================================== */

  useEffect(() => {
    _.isString(nameParam) && setName(nameParam);
    _.isString(dateParam) && setDate(dateParam);
  }, []);

  useEffect(() => {
    /** 해당 유저 정보가 없을때만 api 호출 */
    if (_.isString(nameParam) && _.isString(dateParam)) {
      const isExistResult = findDocumentByName();
      isExistResult.then((isExist: boolean) => {
        !isExist && getEmojiResult();
      });
    }
  }, []);

  useEffect(() => {
    return () => {
      setChatData("");
    };
  }, []);

  useEffect(() => {
    if (!_.isNull(emojiIds)) {
      const filterList = emojiList.filter((emoji) => {
        // emojiIds.find((id) => id === emoji.id);
        return emojiIds.find((id) => id === emoji.id);
      });

      setRandomData(filterList);
    }
  }, [emojiIds]);

  /** =============================================================================== */
  /** 카카오 애드핏 광고 */
  const scriptElement = useRef(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.setAttribute("src", "https://t1.daumcdn.net/kas/static/ba.min.js");
    script.setAttribute("charset", "utf-8");

    script.setAttribute("async", "true");
    /** @ts-ignore */
    scriptElement.current?.appendChild(script);
  }, []);

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
            <div className="title_sub">{name}에게</div>
            <div className="title_sub">일어날 좋은 일들!</div>
            {/* <div className="title_sub" style={{ paddingTop: 16 }}>
              🫧🐍
            </div> */}
          </div>
        </div>

        {!_.isNull(randomData) && (
          <div className="chat ">
            <div className="intro_wrapper">
              <div className="lh">{chatData}</div>
              <div className="intro">
                <div style={{ paddingBottom: "4px", letterSpacing: "0.4px" }}>
                  {showEmojiFiveIntro1}
                </div>
                <div style={{ letterSpacing: "0.4px" }}>
                  {showEmojiFiveIntro2}
                </div>
              </div>
            </div>
            {isIntroDone && (
              <div
                className="description_wrapper"
                style={{ marginBottom: "40px" }}
              >
                <div className="emoji">[{emojis}]</div>
                <TypingEffect
                  data={randomData}
                  onComplete={handleTypingComplete}
                />
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
                      2025년 {nameParam}의 키워드
                    </div>
                    {randomData.map((item: Emoji, i: number) => (
                      <span className="description_emoji pb16 lh" key={item.id}>
                        {`  ${item.emoji}  ${item.symbol} `}

                        <span style={{ fontWeight: 500 }}>
                          {i < 4 && `   | `}
                        </span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      {isDone && isShowEmojis && (
        <div className="tooltip_wrapper">
          <span style={{ marginRight: "100px" }} className="tooltip">
            <IosShareIcon onClick={handleClickShare} />
            <span className="tooltip-text">공유하기</span>
          </span>
          <span className="tooltip">
            <SaveAltIcon onClick={handleClickSave} />
            <span className="tooltip-text">저장하기</span>
          </span>
        </div>
      )}

      <div
        className="songtak"
        style={{ paddingBottom: "24px", paddingTop: "24px" }}
      >
        <span
          style={{ cursor: "pointer" }}
          onClick={() => {
            handleClickSongtak();
          }}
        >
          made by songtak
        </span>
      </div>
      {isMobile() ? (
        <div ref={scriptElement} style={{ width: "-webkit-fill-available" }}>
          <ins
            className="kakao_ad_area"
            style={{ display: "none" }}
            data-ad-unit="DAN-jBHD2oE0XAGRAFIb"
            data-ad-width="320"
            data-ad-height="50"
          />
        </div>
      ) : (
        <div ref={scriptElement} style={{ width: "-webkit-fill-available" }}>
          <ins
            className="kakao_ad_area"
            style={{ display: "none" }}
            data-ad-unit="DAN-rHPZwIFTmiWfIt6i"
            data-ad-width="728"
            data-ad-height="90"
          />
        </div>
      )}
      {/* 다운로드용 이미지가 화면에 안보이도록 설정 */}
      <div className="save_image_hide">{signatureImageHtml()}</div>
      {/* <div className="">{signatureImageHtml()}</div> */}
    </div>
  );
};

export default ResultPage;
