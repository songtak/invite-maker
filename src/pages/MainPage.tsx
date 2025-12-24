import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ReactGA from "react-ga4";

import dayjs from "dayjs";
import "dayjs/locale/ko";
import _ from "lodash";

import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
} from "@mui/material";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import CoupangAd from "../components/common/CoupangAd";

const MainPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [name, setName] = useState<string>("");

  const scriptElement = useRef<HTMLDivElement | null>(null);
  const today = useMemo(() => dayjs(), []);
  const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;

  const isMobile = () =>
    /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
      navigator.userAgent
    );

  const isValid = useMemo(() => {
    const trimmed = name.trim();
    if (trimmed.length < 1) return false;
    if (_.isNull(selectedDate)) return false;
    return dateRegex.test(selectedDate);
  }, [name, selectedDate]);

  const handleButtonClick = async () => {
    if (!isValid) return;

    ReactGA.event("알아보자_버튼_클릭", {
      category: "result_button_click",
      action: "알아보자 버튼 클릭",
      label: `${selectedDate}_${name}`,
    });

    navigate(
      `/result?name=${encodeURIComponent(name.trim())}&date=${selectedDate}`
    );
  };

  const onChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 10자 제한 유지 + 공백 트림은 입력 중엔 UX 안 좋아서 "앞뒤 공백만" 정리 정도로만
    const v = e.target.value;
    if (v.length <= 10) setName(v);
  };

  const onCheckEnter = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleButtonClick();
  };

  const handleClickSongtak = async () => {
    await ReactGA.event("송탁_버튼_클릭", {
      category: "songtak_button_click",
      action: "송탁 버튼 클릭",
      label: "메인 페이지",
    });

    window.location.href = "https://instagram.com/sn9tk";
  };

  /** 카카오 애드핏 광고 스크립트 */
  useEffect(() => {
    const script = document.createElement("script");
    script.setAttribute("src", "https://t1.daumcdn.net/kas/static/ba.min.js");
    script.setAttribute("charset", "utf-8");
    script.setAttribute("async", "true");
    scriptElement.current?.appendChild(script);
  }, []);

  /** pageview는 렌더마다 보내지 말고 effect로 */
  useEffect(() => {
    ReactGA.send({
      hitType: "pageview",
      page: location.pathname,
    });
  }, [location.pathname]);

  return (
    <Box className="">
      {/* 배경 글로우 */}
      <Box className="bg_glow" aria-hidden />

      <Box className="main_content">
        <Paper
          elevation={0}
          className="hero_card"
          sx={{
            width: "min(560px, 80vw)",
            borderRadius: "28px",
            p: { xs: 3, sm: 4 },
            backdropFilter: "blur(14px)",
            background:
              "linear-gradient(180deg, rgba(255,255,255, 0.8), rgba(255,255,255, 0.6))",
            border: "1px solid rgba(0,0,0,0.06)",
            boxShadow:
              "0 20px 60px rgba(0,0,0,0.08), 0 1px 0 rgba(255,255,255,0.5) inset",
          }}
        >
          <Stack spacing={2} alignItems="center">
            {/* 작은 캡션 */}
            <Typography
              sx={{
                fontSize: 14,
                letterSpacing: "0.06em",
                color: "rgba(0,0,0,0.55)",
                fontWeight: 600,
              }}
            >
              이모지로 알아보는
            </Typography>

            {/* 타이틀 */}
            <Typography
              sx={{
                fontSize: { xs: 40, sm: 46 },
                fontWeight: 800,
                letterSpacing: "-0.02em",
                lineHeight: 1.05,
              }}
            >
              🐴 2026 🫧
            </Typography>

            <Typography
              sx={{
                fontSize: { xs: 18, sm: 20 },
                color: "rgba(0,0,0,0.72)",
                fontWeight: 600,
                letterSpacing: "-0.01em",
              }}
            >
              나에게 일어날 일들!
            </Typography>

            {/* 입력 영역 */}
            <Stack spacing={1.5} sx={{ pt: 2, width: "80%" }}>
              <TextField
                value={name}
                onChange={onChangeName}
                onKeyUp={onCheckEnter as any}
                placeholder="이름"
                size="medium"
                fullWidth
                inputProps={{ maxLength: 10 }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                    backgroundColor: "rgba(255,255,255,0.9)",
                    boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
                    "& fieldset": { borderColor: "rgba(0,0,0,0.10)" },
                    "&:hover fieldset": { borderColor: "rgba(0,0,0,0.18)" },
                    "&.Mui-focused fieldset": {
                      borderColor: "rgba(0,0,0,0.35)",
                      borderWidth: 1,
                    },
                  },
                }}
              />

              <LocalizationProvider
                dateAdapter={AdapterDayjs}
                adapterLocale="ko"
              >
                <DatePicker
                  value={selectedDate ? dayjs(selectedDate) : null}
                  onChange={(newValue: any) => {
                    if (!newValue) return setSelectedDate(null);
                    setSelectedDate(dayjs(newValue).format("YYYY-MM-DD"));
                  }}
                  openTo="year"
                  views={["year", "month", "day"]}
                  slotProps={{
                    textField: {
                      placeholder: "생년월일",
                      size: "medium",
                      fullWidth: true,
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "16px",
                          backgroundColor: "rgba(255,255,255,0.9)",
                          boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
                          "& fieldset": { borderColor: "rgba(0,0,0,0.10)" },
                          "&:hover fieldset": {
                            borderColor: "rgba(0,0,0,0.18)",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "rgba(0,0,0,0.35)",
                            borderWidth: 1,
                          },
                        },
                      },
                    },
                  }}
                />
              </LocalizationProvider>

              <Button
                onClick={handleButtonClick}
                disabled={!isValid}
                fullWidth
                size="large"
                sx={{
                  mt: 2.5,
                  py: 1.4,
                  borderRadius: "16px",
                  fontWeight: 800,
                  letterSpacing: "0.02em",
                  textTransform: "none",
                  boxShadow: !isValid ? "none" : "0 14px 30px rgba(0,0,0,0.18)",
                  background: !isValid
                    ? "rgba(0,0,0,0.12)"
                    : "linear-gradient(135deg, #111 0%, #2b2b2b 55%, #111 100%)",
                  color: !isValid ? "rgba(0,0,0,0.35)" : "#fff",
                  transition: "transform .18s ease, box-shadow .18s ease",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #0b0b0b 0%, #2b2b2b 55%, #0b0b0b 100%)",
                    transform: isValid ? "translateY(-1px)" : "none",
                    boxShadow: isValid
                      ? "0 18px 38px rgba(0,0,0,0.22)"
                      : "none",
                  },
                  "&:active": {
                    transform: isValid ? "translateY(0px) scale(0.99)" : "none",
                  },
                }}
              >
                알아보기 ✨
              </Button>

              {/* <Typography
                sx={{
                  pt: 0.5,
                  fontSize: 12,
                  color: "rgba(0,0,0,0.45)",
                  textAlign: "center",
                }}
              >
                * 입력한 정보는 저장하지 않아요
              </Typography> */}
            </Stack>

            {/* 푸터 */}
            <Box sx={{ pt: 2 }}>
              <Typography
                onClick={handleClickSongtak}
                sx={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "rgba(0,0,0,0.55)",
                  cursor: "pointer",
                  userSelect: "none",
                  transition: "opacity .15s ease",
                  "&:hover": { opacity: 0.75 },
                }}
              >
                made by songtak
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* 광고 영역(하단에 안정적으로) */}
        <Box className="ad_bar">
          <CoupangAd
            id={826966}
            trackingCode="AF3245048"
            width="300"
            height="60"
          />
        </Box>

        {/* 카카오 광고 자리 필요하면 유지 */}
        <div ref={scriptElement} />
      </Box>
    </Box>
  );
};

export default MainPage;

// import { useState, useEffect, useRef } from "react";
// import CryptoJS from "crypto-js";
// import { useNavigate, useLocation } from "react-router-dom";
// import ReactGA from "react-ga4";

// import { TextField, Button } from "@mui/material";
// import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import { DatePicker } from "@mui/x-date-pickers/DatePicker";
// import "dayjs/locale/ko";
// import dayjs from "dayjs";
// import _ from "lodash";

// import CoupangAd from "../components/common/CoupangAd";

// const MainPage = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [selectedDate, setSelectedDate] = useState<string | null>(null);
//   const [name, setName] = useState<string>("");

//   const isMobile = () => {
//     return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
//       navigator.userAgent
//     );
//   };
//   const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;

//   const today = dayjs();

//   const handleButtonClick = async () => {
//     ReactGA.event("알아보자_버튼_클릭", {
//       category: "result_button_click",
//       action: "알아보자 버튼 클릭",
//       label: `${selectedDate}_${name}`,
//     });
//     navigate(`/result?name=${name}&date=${selectedDate}`);
//   };

//   const onChange = (e: any) => {
//     e.target.value.length < 10 && setName(e.target.value.trim());
//   };

//   const onCheckEnter = (e: any) => {
//     if (e.key === "Enter") {
//       handleButtonClick();
//     }
//   };

//   const handleClickSongtak = async () => {
//     await ReactGA.event("송탁_버튼_클릭", {
//       category: "songtak_button_click",
//       action: "송탁 버튼 클릭",
//       label: "메인 페이지",
//     });

//     window.location.href = "https://instagram.com/sn9tk";
//   };

//   // function encodeAppKey(appKey: string, secretKey: string): string {
//   //   // appKey와 secretKey를 조합하여 인코딩
//   //   const key = CryptoJS.enc.Utf8.parse(secretKey);
//   //   const message = CryptoJS.enc.Utf8.parse(appKey);

//   //   // AES 암호화를 사용한 암호화
//   //   const encrypted = CryptoJS.AES.encrypt(message, key, {
//   //     mode: CryptoJS.mode.ECB,
//   //     padding: CryptoJS.pad.Pkcs7,
//   //   });

//   //   // 결과를 Base64로 인코딩하여 반환
//   //   return encrypted.toString();
//   // }

//   // // // 테스트 예시
//   // const secretKey = "minji-project-25";
//   // const appKey =
//   //   "";
//   // const encodedKey = encodeAppKey(appKey, secretKey);

//   // console.log("encodedKey", encodedKey);

//   /** 카카오 애드핏 광고 */
//   const scriptElement = useRef(null);

//   useEffect(() => {
//     const script = document.createElement("script");
//     script.setAttribute("src", "https://t1.daumcdn.net/kas/static/ba.min.js");
//     script.setAttribute("charset", "utf-8");

//     script.setAttribute("async", "true");
//     /** @ts-ignore */
//     scriptElement.current?.appendChild(script);
//   }, []);

//   ReactGA.send({
//     hitType: "pageview",
//     page: location.pathname, // useRouter를 사용하여, pathname값을 가져옵니다.
//   });

//   return (
//     <>
//       <div className="main_content">
//         <div className="page_wrapper">
//           <div className="title-wrapper">
//             <div>
//               <div
//                 className="title_sub"
//                 style={{ fontSize: "1.2rem", fontWeight: "400" }}
//               >
//                 이모지로 알아보는
//               </div>
//               <div
//                 className="title"
//                 style={{ paddingBottom: "14px", paddingTop: "1px" }}
//               >
//                 🫧 2026 🐴
//               </div>
//               <div className="title_sub">나에게 일어날 일들!</div>
//             </div>
//           </div>

//           <div
//             style={{
//               paddingTop: "40px",
//               display: "grid",
//               placeItems: "center",
//             }}
//           >
//             <TextField
//               className="simple-input pb16"
//               type="text"
//               onKeyUp={(e) => {
//                 onCheckEnter(e);
//               }}
//               placeholder="이름"
//               value={name}
//               onChange={onChange}
//               size="small"

//               // maxLength={15}
//             />
//             <LocalizationProvider
//               dateAdapter={AdapterDayjs}
//               adapterLocale="ko"

//               // adapterLocale={koLocale}
//             >
//               <DemoContainer components={["DatePicker"]}>
//                 <DatePicker
//                   label="생년월일"
//                   defaultValue={today.subtract(32, "year")}
//                   value={selectedDate === null ? null : dayjs(selectedDate)}
//                   onChange={(newValue: any) => {
//                     setSelectedDate(dayjs(newValue).format("YYYY-MM-DD"));
//                   }}
//                   openTo="year"
//                   views={["year", "month", "day"]}
//                   slotProps={{
//                     textField: {
//                       // onChange: () => {},
//                       value: selectedDate === null ? null : dayjs(selectedDate),
//                       placeholder: "생년월일",
//                       label: "",
//                       style: { width: "240px", backgroundColor: "#fff" },
//                       size: "small",
//                     },
//                   }}
//                 />
//               </DemoContainer>
//             </LocalizationProvider>
//             <div style={{ paddingTop: "40px" }}>
//               <button
//                 className="cute-button"
//                 disabled={
//                   name.length < 1 ||
//                   (_.isNull(selectedDate)
//                     ? true
//                     : !dateRegex.test(selectedDate))
//                 }
//                 onClick={() => {
//                   handleButtonClick();
//                 }}
//               >
//                 알아보기
//               </button>
//             </div>
//           </div>
//         </div>
//         <div className="songtak" style={{ paddingTop: "24px" }}>
//           <span
//             style={{ cursor: "pointer", paddingBottom: "24px" }}
//             onClick={() => {
//               handleClickSongtak();
//             }}
//           >
//             made by songtak
//           </span>
//         </div>
//         <CoupangAd
//           id={826966}
//           trackingCode="AF3245048"
//           width="300"
//           height="60"
//         />
//         {/* {isMobile() ? (
//           <div ref={scriptElement}>
//             <ins
//               className="kakao_ad_area"
//               style={{ display: "none" }}
//               data-ad-unit="DAN-jBHD2oE0XAGRAFIb"
//               data-ad-width="320"
//               data-ad-height="50"
//             />
//           </div>
//         ) : (
//           <div ref={scriptElement} style={{ width: "-webkit-fill-available" }}>
//             <ins
//               className="kakao_ad_area"
//               style={{ display: "none" }}
//               data-ad-unit="DAN-rHPZwIFTmiWfIt6i"
//               data-ad-width="728"
//               data-ad-height="90"
//             />
//           </div>
//         )} */}
//       </div>
//     </>
//   );
// };

// export default MainPage;
