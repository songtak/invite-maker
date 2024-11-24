import { useState, useEffect } from "react";
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

import koLocale from "date-fns/locale/ko";

import { getResponseFromGPT } from "../services/api";
import { emojiList1 } from "../assets/emojis/emojiList1";
import { emojiList2 } from "../assets/emojis/emojiList2";
import { emojiList3 } from "../assets/emojis/emojiList3";
import { emojiList4 } from "../assets/emojis/emojiList4";
import { emojiList5 } from "../assets/emojis/emojiList5";
import { emojiList6 } from "../assets/emojis/emojiList6";
import { width } from "@mui/system";

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
    ReactGA.event({
      category: "start_button",
      action: "click",
      label: name,
      value: 1,
    });
    navigate("/result");
    await setIsClicked(true);
    const emoji = getRandomEmojis(5);
    setEmojis(emoji);
    await getResponseFromGPT(
      `친구 ${name}의 이모지가 이렇게 ${emoji} 5개가 나왔는데 이걸 토대로 2025년 운세를 해석해줘 무조건 긍정적인 방향으로 부탁해! 내용은 이모지(이모지 이름) 내용서술 줄바꿈 다음 이모지... 그리고 마지막엔 정리! 그리고 친구에게 말하듯 다정한 말투로 부탁하고 친구의 이름도 불러줘!`,
      // `${emojis} 이 이모지 5개가 나왔는데 이걸 토대로 2025년 운세를 해석해줘 무조건 긍정적인 방향으로 부탁해! 그리고 친구한테 말하듯 서술적으로!`
      (chunk: any) => {
        setChatData((prev) => prev + chunk); // 스트리밍 데이터 추가
      }
    );

    // setChatData(ddd);
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

  return (
    <div className="main_content">
      <div className="page_wrapper">
        <div className="title-wrapper">
          <div className="title" style={{ paddingBottom: "14px" }}>
            2025년
          </div>
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
            <></>
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
                    },
                  }}
                />
              </DemoContainer>
            </LocalizationProvider>
            <div style={{ paddingTop: "40px" }}>
              <button
                className="cute-button"
                disabled={name.length < 1}
                onClick={() => {
                  navigate(`/result?${name}_${selectedDate}`);

                  // handleButtonClick();
                }}
              >
                알아보자✨
              </button>
            </div>
          </div>
        )}
      </div>
      {!isClicked ? (
        !isJw ? (
          <div className="child">
            <p
              className="child_p"
              style={{ cursor: "pointer" }}
              onClick={() => {
                setIsJw(true);
                ReactGA.event({
                  category: "is_jw_button",
                  action: "click",
                  label: "쨰웅",
                  value: 1,
                });
              }}
            >
              혹시? 김재웅이신가요?
            </p>
          </div>
        ) : (
          <div className="jw">
            <div className="pb16 lh" style={{ fontWeight: 700, fontSize: 18 }}>
              🥰 2025년 째웅이 운세 해석
            </div>
            <div className="pb16 lh">
              💘 (하트, 사랑과 깊이) 사랑이 2025년엔 더 깊어지고, 너와 상대방이
              서로에게 더 든든한 존재가 될 거야. 작은 일상에서도 서로를 배려하고
              웃게 만들어주는 순간들이 많아질 거야. 네가 주는 따뜻함이 더
              커져서, 사랑이 너의 하루하루를 진짜 특별하게 채울 거야. 💖
            </div>
            <div className="pb16 lh">
              💵 (돈, 풍요와 기회) 올해는 네가 했던 노력들이 하나둘 결실을 맺고,
              재물적인 부분에서도 안정과 풍요를 가져다줄 해야. 새로운 기회가
              찾아오거나, 너도 몰랐던 숨은 행운이 돈이 되어 나타날 거야. 💰
              "내가 이걸 잘했다!" 싶을 만큼 뿌듯한 결과들을 보게 될 거야.
              계획했던 걸 차근차근 실행해봐. 너 진짜 멋진 해를 만들 거야!
            </div>
            <div className="pb16 lh">
              🌳 (나무, 성장과 안정) 나무는 네 삶의 뿌리를 의미해. 2025년은 네가
              그 뿌리를 더 깊이 내리고, 삶을 안정적으로 만들어가는 해가 될 거야.
              너의 노력과 끈기가 차곡차곡 쌓이면서, 네가 정말 "이건 나다!" 하고
              자랑할 수 있는 걸 만들어낼 거야. 그리고, 자연 속에서 쉼과 힐링도
              누릴 수 있는 순간들이 많아질 거야. 🌱
            </div>
            <div className="pb16 lh">
              🌊 (물결, 평화와 여유) 바다의 물결처럼, 네 삶은 2025년에 정말
              평화롭고 여유로운 흐름을 타게 될 거야. 고민하고 불안했던 것들이 다
              해결되고, 네가 원하는 대로 흘러가는 해가 될 거야. 그리고 물처럼
              자유로운 시간을 보내면서, 여행이든 새로운 도전이든 마음껏 즐길 수
              있을 거야. 🌊
            </div>
            <div className="pb16 lh">
              🐶 (강아지, 우정과 믿음) 네 주변에는 너를 진심으로 아끼고 믿어주는
              사람들이 더 많아질 거야. 기존의 소중한 친구들과는 더 끈끈해지고,
              새로운 좋은 사람들도 네 삶에 들어올 거야. 강아지처럼 순수하고 의리
              넘치는 사람들과 함께하면, 어떤 순간도 행복하고 든든할 거야. 🐾
              네가 주는 따뜻함이 너한테 더 큰 행복으로 돌아올 거야.
            </div>
            <div className="pb16 lh" style={{ fontWeight: 700, fontSize: 18 }}>
              2025년 째웅이의 키워드
            </div>

            <div className="pb16 lh">
              💖 깊어진 사랑 | 💰 풍요로운 결실 | 🌱 꾸준한 성장 | 🌊 평화로운
              흐름 | 🐾 믿음의 연결
            </div>
            <div className="pb16 lh">
              너는 2025년에 진짜 잘될 수밖에 없어.
              <div>
                지금처럼만 해도 네가 상상하지 못한 행복들이 너한테 찾아올 거야
                💕
              </div>
              네가 누릴 모든 순간이 기대돼! 😊
            </div>
          </div>
        )
      ) : (
        <></>
      )}
    </div>
  );
};

export default MainPage;
