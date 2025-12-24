import React, { useState, useEffect, useRef, useMemo } from "react";
import CoupangAd from "./common/CoupangAd";

interface Emoji {
  id: number;
  emoji: string;
  title: string;
  symbol: string;
  description: string;
}

interface TypingEffectProps {
  data: Emoji[];
  onComplete?: () => void;
}

const TypingEffectAd: React.FC<TypingEffectProps> = ({ data, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isAdOpen, setIsAdOpen] = useState<boolean>(false);
  const [isShowAllResult, setIsShowAllResult] = useState<boolean>(false);

  // 화면에 "active"로 표시될 개수(애니메이션 타이밍용)
  const [activeIndex, setActiveIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  const isMobile = () => {
    return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
      navigator.userAgent
    );
  };

  const isInAppBrowser = (): boolean => {
    const userAgent = navigator.userAgent || navigator.vendor;

    const inAppBrowserPatterns = [
      /FBAN|FBAV/i, // Facebook
      /Instagram/i, // Instagram
      /KAKAOTALK/i, // KakaoTalk
      /Twitter(Android|for iPhone)/i, // Twitter
      /NAVER/i, // Naver
      /Line/i, // Line
      /WebView|InAppBrowser/i, // 일반적인 WebView 패턴
    ];

    const isUserAgentMatch = inAppBrowserPatterns.some((pattern) =>
      pattern.test(userAgent)
    );

    const isReferrerMatch = document.referrer.includes("kakao");

    return isUserAgentMatch || isReferrerMatch;
  };

  // ✅ typedText를 state로 누적하지 않고, currentIndex로부터 파생
  const visibleTexts = useMemo(() => {
    if (!data?.length) return [];
    // currentIndex가 0이면 1개, 1이면 2개 ... 이런 식으로 보여주게
    const end = Math.min(currentIndex + 1, data.length);
    return data.slice(0, end).map((d) => d.description);
  }, [data, currentIndex]);

  const handleShowResult = () => {
    // stale 방지 (함수형 업데이트)
    setActiveIndex((prev) => prev + 1);
    setCurrentIndex((prev) => prev + 1);

    if (isInAppBrowser()) {
      const currentUrl = window.location.href;

      if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
        // 여기 iOS 인앱브라우저 처리 로직은 기존 주석 유지
      } else {
        window.location.href = currentUrl;
      }
    }

    setIsAdOpen(false);
    setIsShowAllResult(true);
  };

  // ✅ currentIndex를 "타이핑처럼" 증가시키는 효과
  useEffect(() => {
    if (!data?.length) return;
    if (currentIndex >= data.length) return;

    // 광고 열려있고 전체 결과 보기 전이면 멈춤
    if (isAdOpen && !isShowAllResult) return;

    const timer = setTimeout(() => {
      if (currentIndex === 1 && !isShowAllResult) {
        setIsAdOpen(true);
      } else if (currentIndex < data.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [currentIndex, data?.length, isAdOpen, isShowAllResult]);

  // ✅ onComplete: 원래 코드는 activeIndex 의존성인데 currentIndex를 봐야 맞음
  useEffect(() => {
    if (!onComplete) return;

    // 네 원래 의도(4 또는 5에서 호출)를 그대로 반영
    if (currentIndex === 4 || currentIndex === 5) {
      onComplete();
    }
  }, [onComplete, currentIndex]);

  // ✅ activeIndex를 천천히 늘려서 fade-in 순서를 제어
  useEffect(() => {
    if (activeIndex < visibleTexts.length) {
      const timer = setTimeout(() => {
        setActiveIndex((prev) => prev + 1);
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [activeIndex, visibleTexts.length]);

  return (
    <div ref={containerRef} className="">
      {visibleTexts.map((text, index) => (
        <div
          key={index}
          className={`lh ${isMobile() ? "pb24" : "pb36"}  fade-in-slide-down ${
            index < activeIndex ? "active" : ""
          }`}
        >
          {text}
        </div>
      ))}

      {isAdOpen && !isShowAllResult && (
        // <div>
        <div>
          <div
            style={{
              marginBottom: "24px", // 기존 80px → 과함
              marginTop: "16px",
              fontSize: "40px",
              letterSpacing: "8px",
              opacity: 0.85,
            }}
          >
            [ {data[2]?.emoji} {data[3]?.emoji} {data[4]?.emoji} ]
          </div>

          <a
            href="https://link.coupang.com/a/b6k87x"
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none" }}
          >
            <button
              onClick={handleShowResult}
              style={{
                width: "88%",
                maxWidth: "340px",
                padding: "14px 18px",
                borderRadius: "18px",

                fontSize: "15px",
                fontWeight: 800,
                letterSpacing: "0.01em",

                color: "#111",
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.95), rgba(245,245,245,0.9))",

                border: "1px solid rgba(0,0,0,0.12)",
                boxShadow:
                  "0 10px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)",

                cursor: "pointer",
                transition: "transform 0.18s ease, box-shadow 0.18s ease",
              }}
              onMouseDown={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform =
                  "scale(0.99)";
              }}
              onMouseUp={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform =
                  "scale(1)";
              }}
            >
              👀 광고 보고 이어서 확인하기
            </button>
          </a>
        </div>

        //   <div
        //     style={{
        //       marginBottom: "80px",
        //       marginTop: "16px",
        //       fontSize: "30px",
        //       letterSpacing: "10px",
        //     }}
        //   >
        //     {/* data length 방어 */}[ {data[2]?.emoji} {data[3]?.emoji}{" "}
        //     {data[4]?.emoji} ]
        //   </div>

        //   <a
        //     href="https://link.coupang.com/a/b6k87x"
        //     target="_blank"
        //     rel="noopener noreferrer"
        //   >
        //     <button
        //       style={{ fontSize: "16px" }}
        //       className="cute-button"
        //       onClick={handleShowResult}
        //     >
        //       광고 보고 이어서 확인하기 👀
        //     </button>
        //   </a>
        // </div>
      )}
    </div>
  );
};

export default TypingEffectAd;
