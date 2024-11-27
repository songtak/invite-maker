import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import _ from "lodash";

import ReactGA from "react-ga4";
import dayjs from "dayjs";

import { jwList } from "../assets/jw";

import TypingEffect from "../components/JwTypingEffect";

const JwPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const now = dayjs();
  const [isShowEmojis, setIsShowEmojis] = useState<boolean>(false);

  /** =============================================================================== */

  const handleClickNoah = () => {
    ReactGA.event("째웅_인스타_버튼_클릭", {
      category: "jw_insta_button_click",
      action: "쨰웅 인스타",
      label: ``,
    });

    window.location.href = "https://instagram.com/noahsfilmo";
  };

  const handleTypingComplete = () => {
    setIsShowEmojis(true);
  };

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
            <div className="emoji">💘💵🌳🌊🐶</div>
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
                <div style={{ marginTop: "48px" }}>
                  <button
                    className="cute-button"
                    onClick={() => {
                      navigate("/");
                    }}
                  >
                    ✨ 메인으로 ✨
                  </button>
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
