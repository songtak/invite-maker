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
import _ from "lodash";

import { jwList } from "../assets/jw";
import TypingEffect from "../components/TypingEffect";

const MainPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [name, setName] = useState<string>("");

  ReactGA.send({
    hitType: "pageview",
    page: location.pathname, // useRouter를 사용하여, pathname값을 가져옵니다.
  });

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
      handleButtonClick();
    }
  };

  const handleClickJw = () => {
    // setIsJw(true);
    navigate("/jw");
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

  const isMobile = () => {
    return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
      navigator.userAgent
    );
  };
  const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;

  return (
    <>
      <div className="main_content">
        <div className="page_wrapper">
          <div className="title-wrapper">
            <div
              className="title"
              style={{ paddingBottom: "14px", paddingTop: "20px" }}
            >
              🫧 2025 🐍
            </div>
          </div>

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
                  slotProps={{
                    textField: {
                      // onChange: () => {},
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
                disabled={
                  name.length < 1 ||
                  (!_.isNull(selectedDate) && dateRegex.test(selectedDate))
                }
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

        {isMobile() ? (
          <div ref={scriptElement}>
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
      </div>
    </>
  );
};

export default MainPage;
