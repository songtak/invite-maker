import { useState, useEffect, useRef } from "react";
import CryptoJS from "crypto-js";
import { useNavigate, useLocation } from "react-router-dom";
import ReactGA from "react-ga4";

import { TextField, Button } from "@mui/material";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import "dayjs/locale/ko";
import dayjs from "dayjs";

import { getResponseFromGPT } from "../services/api";
import { emojiList1 } from "../assets/emojis/emojiList1";
import { emojiList2 } from "../assets/emojis/emojiList2";
import { emojiList3 } from "../assets/emojis/emojiList3";
import { emojiList4 } from "../assets/emojis/emojiList4";
import { emojiList5 } from "../assets/emojis/emojiList5";
import { emojiList6 } from "../assets/emojis/emojiList6";
import { jwList } from "../assets/jw";
import { width } from "@mui/system";
import TypingEffect from "../components/TypingEffect";

type Emoji = { id: number; emoji: string };

const MainPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [isClicked, setIsClicked] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [emojis, setEmojis] = useState<string[]>([""]);
  const [chatData, setChatData] = useState<string>("");
  const [isJw, setIsJw] = useState<boolean>(false);
  const [isShowEmojis, setIsShowEmojis] = useState<boolean>(false);

  // 사랑 돈 나무 바다 강아지
  // 💘, 💵, 🌳, 🌊, 🐶

  const emojiList = [
    ...emojiList1,
    ...emojiList2,
    ...emojiList3,
    ...emojiList4,
    ...emojiList5,
    ...emojiList6,
  ];

  ReactGA.send({
    hitType: "pageview",
    page: location.pathname, // useRouter를 사용하여, pathname값을 가져옵니다.
  });

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

  // http://localhost:5173/
  const handleButtonClick = async () => {
    ReactGA.event("알아보자_버튼_클릭", {
      category: "result_button_click",
      action: "알아보자 버튼 클릭",
      label: `${selectedDate}_${name}`,
    });
    navigate(`/result?name=${name}&date=${selectedDate}`);
  };

  const onChange = (e: any) => {
    setName(e.target.value);
  };

  const onCheckEnter = (e: any) => {
    if (e.key === "Enter") {
      if (!isClicked) {
        handleButtonClick();
      }
    }
  };

  const handleClickJw = () => {
    setIsJw(true);
    ReactGA.event("째웅_버튼_클릭", {
      category: "is_jw_button_click",
      action: "째웅 버튼 클릭",
      label: name,
    });
  };

  const handleClickSongtak = async () => {
    await ReactGA.event("송탁_버튼_클릭", {
      category: "songtak_button_click",
      action: "송탁 버튼 클릭",
      label: "메인 페이지",
    });

    window.location.href = "https://instagram.com/sn9tk";
  };

  const handleTypingComplete = () => {
    setIsShowEmojis(true);
  };

  // function encodeAppKey(appKey: string, secretKey: string): string {
  //   // appKey와 secretKey를 조합하여 인코딩
  //   const key = CryptoJS.enc.Utf8.parse(secretKey);
  //   const message = CryptoJS.enc.Utf8.parse(appKey);

  //   // AES 암호화를 사용한 암호화
  //   const encrypted = CryptoJS.AES.encrypt(message, key, {
  //     mode: CryptoJS.mode.ECB,
  //     padding: CryptoJS.pad.Pkcs7,
  //   });

  //   // 결과를 Base64로 인코딩하여 반환
  //   return encrypted.toString();
  // }

  // // // 테스트 예시
  // const secretKey = "minji-project-25";
  // const appKey =
  //   "";
  // const encodedKey = encodeAppKey(appKey, secretKey);

  // console.log("encodedKey", encodedKey);

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
    <>
      <div className="main_content">
        <div className="page_wrapper">
          <div className="title-wrapper">
            {!isJw ? (
              <div
                className="title"
                style={{ paddingBottom: "14px", paddingTop: "80px" }}
              >
                🫧 2025 🐍
              </div>
            ) : (
              <div className="title" style={{ paddingBottom: "14px" }}>
                🫧 2025 🐍
              </div>
            )}
            {!isJw ? (
              isClicked ? (
                <div style={{ marginBottom: 16 }}>
                  <div className="title_sub">{name}에게</div>
                  <div className="title_sub">일어날 좋은 일들!</div>
                </div>
              ) : (
                <div className="title_sub">내게 일어날 좋은 일들!</div>
              )
            ) : (
              <div>
                <div className="title_sub">🥰째웅에게</div>
                <div className="title_sub">일어날 좋은 일들!</div>
              </div>
            )}
          </div>
          {/* <div className="title_sub">5가지!</div> */}
          {/* <img src="/assets/images/emo1.jpeg" /> */}
          {isClicked && !isJw && (
            <>
              <div className="emoji">{emojis}</div>
              <p className="chat lh">{chatData}</p>
            </>
          )}
          {!isClicked && !isJw && (
            <div
              style={{
                paddingTop: "40px",
                display: "grid",
                placeItems: "center",
              }}
            >
              <TextField
                className="simple-input pb16"
                type="text"
                onKeyUp={(e) => {
                  onCheckEnter(e);
                }}
                placeholder="이름"
                onChange={onChange}
                size="small"

                // maxLength={15}
              />
              <LocalizationProvider
                dateAdapter={AdapterDayjs}
                adapterLocale="ko"

                // adapterLocale={koLocale}
              >
                <DemoContainer components={["DatePicker"]}>
                  <DatePicker
                    label="생년월일"
                    value={selectedDate === null ? null : dayjs(selectedDate)}
                    onChange={(newValue: any) => {
                      setSelectedDate(dayjs(newValue).format("YYYY-MM-DD"));
                    }}
                    openTo="year"
                    views={["year", "month", "day"]}
                    // disabled={props.disabled}
                    // renderInput={(params: any) => (
                    //   <TextField {...params} size="small" />
                    // )}
                    slotProps={{
                      textField: {
                        placeholder: "생년월일",
                        label: "",
                        style: { width: "240px" },
                        size: "small",
                      },
                    }}
                  />
                </DemoContainer>
              </LocalizationProvider>
              <div style={{ paddingTop: "40px" }}>
                <button
                  className="cute-button"
                  disabled={name.length < 1 || selectedDate === null}
                  onClick={() => {
                    handleButtonClick();
                  }}
                >
                  ✨ 알아보자 ✨
                </button>
              </div>
              <div
                className="jw-button"
                onClick={() => {
                  handleClickJw();
                }}
              >
                혹시? 김재웅이신가요?
              </div>
            </div>
          )}
          {!isClicked ? (
            isJw && (
              <div className="jw ">
                {/* <div className="pb16 lh" style={{ fontWeight: 700, fontSize: 18 }}>
              🥰 2025년 째웅이 운세 해석
            </div> */}
                <div className=" emoji" style={{ marginBottom: "32px" }}>
                  💘💵🌳🌊🐶
                </div>
                <TypingEffect data={jwList} onComplete={handleTypingComplete} />
                {isShowEmojis && (
                  <>
                    <div
                      className="pb16 lh"
                      style={{ fontWeight: 700, fontSize: 18, marginTop: 32 }}
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
                        지금처럼만 해도 네가 상상하지 못한 행복들이 너한테
                        찾아올 거야 💕
                      </div>
                      네가 누릴 모든 순간이 기대돼! 😊
                    </div>
                  </>
                )}
              </div>
            )
          ) : (
            <></>
          )}
        </div>
        <div className="songtak" style={{ paddingTop: "24px" }}>
          <span
            style={{ cursor: "pointer", paddingBottom: "24px" }}
            onClick={() => {
              handleClickSongtak();
            }}
          >
            made by songtak
          </span>
        </div>
        {!isJw && (
          <>
            <div ref={scriptElement}>
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
          </>
        )}
      </div>
    </>
  );
};

export default MainPage;
