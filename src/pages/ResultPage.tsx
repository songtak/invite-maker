import React, { useEffect, useState, useRef, useCallback } from "react";
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

type Result = {
  name: string;
  date: string;
  resultContent: string;
  emojis: string;
};

const ResultPage = () => {
  const [name, setName] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [emojis, setEmojis] = useState<string[]>([""]);
  const [chatData, setChatData] = useState<string>("");
  const [isDone, setIsDone] = useState<boolean>(false);

  const searchParams = new URLSearchParams(location.search.slice(1));
  const nameParam = searchParams.get("name");
  const dateParam = searchParams.get("date");

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

  const getEmojiResult = async () => {
    let chat: any;
    const emoji = getRandomEmojis(5);
    setEmojis(emoji);
    const response = await getResponseFromGPT(
      //   "너가 지금 흥미로워 하는거 이야기해봐",
      // `다음 이모지 5개를 기반으로 2025년 운세를 무조건! 긍정적으로 해석해줘. 결과는 아래 형식에 맞게 작성해줘: 1. 각 이모지 옆에 이모지(이모지 이름, 이모지의 상징하는 내용) 그리고 무조건 긍정적으로 해석한 내용 2. 마지막에 운세에서 파생되는 주요 키워드 5개를 제시 및 간략 설명 3. 친구에게 말하듯 다정한 말투 4. 입력받은 이름도 불러줘 이름: ${name} 이모지: ${emoji}`,
      `친구 ${nameParam}의 이모지가 이렇게 ${emoji} 5개가 나왔는데 이걸 토대로 2025년 운세를 해석해줘
        1. 무조건 긍정적인 방향으로 해석
        2. 답변은 이모지(이모지 이름) 내용서술
        3. 친구에게 말하듯 다정한 말투
        5. 친구의 이름을 말할것`,
      // `${nameParam}의 이모지 ${emoji} 를 보고 2025년 운세를 긍정적으로 해석해줘. 이모지마다 의미를 해석하고, 다정한 말투로 친구처럼 설명해줘. 간단하고 이해하기 쉽게 작성해줘.`,
      (chunk: any) => {
        setChatData((prev) => {
          const updatedChat = prev.toString() + chunk.toString(); // 기존 데이터에 chunk 추가
          chat = updatedChat; // chat 변수 업데이트

          return updatedChat; // setChatData에 반영
        });
      }
    );

    if (response) {
      addResultWithCustomDocName({
        name: name as string,
        date: date as string,
        resultContent: chat as string,
        emojis: emoji.join(""),
      });
      setIsDone(true);
    }
  };

  const resultListCollectionRef = collection(db, `result-list`);

  const findDocumentByName = async () => {
    try {
      // 특정 문서의 참조를 생성
      const docRef = doc(db, "result-list", `${dateParam}_${nameParam}`);

      // 문서 가져오기
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const saveData = docSnap.data();
        setEmojis(saveData.emojis);
        setChatData(saveData.resultContent);
        setIsDone(true);

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
      alert("공유하기 기능을 지원하지 않는 브라우저입니다.");
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
      .toJpeg(signatureImageRef.current, { cacheBust: true, quality: 0.95 })
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
          2025년
        </div>
        <div style={{ marginBottom: 16 }}>
          <div className="save_image_title_sub">{name}에게</div>
          <div className="save_image_title_sub">일어날 좋은 일들!</div>
        </div>
        <div className="save_image_emoji">{emojis}</div>
        <div>
          <p className="save_image_chat">{chatData}</p>
        </div>
        <div
          className="songtak"
          style={{ paddingBottom: "24px", paddingTop: "24px" }}
        >
          <span style={{ fontSize: "12px" }}>@sn9tk</span>
        </div>
      </div>
    );
  };

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

  useEffect(() => {
    ReactGA.set({ page: location.pathname });
    ReactGA.send("pageview");
  }, [location]);

  return (
    <div className="main_content">
      <div className="page_wrapper">
        <div className="title-wrapper">
          <div className="title" style={{ paddingBottom: "14px" }}>
            2025
          </div>
          <div style={{ marginBottom: 16 }}>
            <div className="title_sub">{name}에게</div>
            <div className="title_sub">일어날 좋은 일들!</div>
          </div>
          <div className="emoji">{emojis}</div>
          <div>
            <p className="chat lh">{chatData}</p>
          </div>
        </div>
      </div>
      {isDone && (
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
      <div ref={scriptElement} style={{ width: "-webkit-fill-available" }}>
        <ins
          className="kakao_ad_area"
          style={{ display: "none" }}
          data-ad-unit="DAN-jBHD2oE0XAGRAFIb"
          data-ad-width="320"
          data-ad-height="50"
        />
      </div>
      {/* <div ref={scriptElement} style={{ width: "-webkit-fill-available" }}>
        <ins
          className="kakao_ad_area"
          style={{ display: "none" }}
          data-ad-unit="DAN-rHPZwIFTmiWfIt6i"
          data-ad-width="728"
          data-ad-height="90"
        />
      </div> */}
      {/* 다운로드용 이미지가 화면에 안보이도록 설정 */}
      <div className="save_image_hide">{signatureImageHtml()}</div>
      {/* <div className="">{signatureImageHtml()}</div> */}
    </div>
  );
};

export default ResultPage;
