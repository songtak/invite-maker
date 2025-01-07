import React, { useState, useEffect, useRef } from "react";
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
  const [typedText, setTypedText] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isAdOpen, setIsAdOpen] = useState<boolean>(false);
  const [isShowAllResult, setIsShowAllResult] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const isMobile = () => {
    return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
      navigator.userAgent
    );
  };

  const isInAppBrowser = (): boolean => {
    const userAgent = navigator.userAgent || navigator.vendor;

    // 주요 인앱 브라우저 User-Agent 패턴 (지속적인 업데이트 필요)
    const inAppBrowserPatterns = [
      /FBAN|FBAV/i, // Facebook
      /Instagram/i, // Instagram
      /KAKAOTALK/i, // KakaoTalk
      /Twitter(Android|for iPhone)/i, // Twitter
      /NAVER/i, // Naver
      /Line/i, // Line
      /WebView|InAppBrowser/i, // 일반적인 WebView 패턴
    ];

    // User-Agent 검사
    const isUserAgentMatch = inAppBrowserPatterns.some((pattern) =>
      pattern.test(userAgent)
    );

    // 추가적인 검사 (예: document.referrer, 필요하다면 더 추가)
    const isReferrerMatch = document.referrer.includes("kakao"); // 예시: Kakao

    return isUserAgentMatch || isReferrerMatch; // 더 정교한 로직이 필요할 수 있습니다.
  };

  const handleShowResult = () => {
    setActiveIndex(activeIndex + 1);
    setCurrentIndex(currentIndex + 1);
    // window.open(
    //   "https://link.coupang.com/a/b6k87x",
    //   "_blank",
    //   `${isMobile() ? "popup=yes" : "noopener, noreferrer"}`
    // );

    if (isInAppBrowser()) {
      const currentUrl = window.location.href;
      // iOS Safari: window.location.assign()을 사용하여 특정 scheme을 열려고 시도하면 Safari가 중단될 수 있습니다.
      // window.location.assign(currentUrl);

      // 예시: 스킴을 사용하여 열도록 유도 (사용자 경험을 고려하여 적절한 방법 선택)
      // 주의: 모든 브라우저나 OS에서 지원하는 것은 아닙니다.
      if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
        // iOS Safari: safari-open://<url> 사용, 안될 경우 우회 방법 적용 필요
        // window.location.href =
        //   "safari-open://" + "https://link.coupang.com/a/b6k87x";
        // // 우회 방법: 사용자에게 링크를 클릭하도록 안내
        // const link = document.createElement("a");
        // link.href = "https://link.coupang.com/a/b6k87x";
        // link.target = "_blank";
        // link.rel = "noopener noreferrer";
        // link.innerText = "Open in Browser";
        // // 스타일 적용 (필요에 따라 수정)
        // link.style.position = "fixed";
        // link.style.top = "50%";
        // link.style.left = "50%";
        // link.style.transform = "translate(-50%, -50%)";
        // link.style.padding = "20px";
        // link.style.backgroundColor = "white";
        // link.style.border = "1px solid black";
        // link.style.zIndex = "9999";
        // link.click();
        // document.body.appendChild(link);
        // setIsAdOpen(false);
        // setIsShowAllResult(true);
      } else {
        window.location.href = currentUrl;
        // setIsAdOpen(false);
        // setIsShowAllResult(true);
      }
    }
    setIsAdOpen(false);
    setIsShowAllResult(true);

    // "noopener, noreferrer"
  };

  useEffect(() => {
    if (currentIndex < data.length) {
      if (isAdOpen && !isShowAllResult) {
        return;
      }

      const description = data[currentIndex].description;
      setTypedText((prev) => [...prev, description]);

      const timer = setTimeout(() => {
        if (currentIndex === 1 && !isShowAllResult) {
          setIsAdOpen(true);
        } else if (currentIndex < data.length - 1) {
          setCurrentIndex((prev) => prev + 1);
        }
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [currentIndex, data, isAdOpen, isShowAllResult]);

  useEffect(() => {
    if (onComplete) {
      currentIndex === 4 && onComplete();
      currentIndex === 5 && onComplete();
    }
  }, [onComplete, activeIndex]);

  useEffect(() => {
    if (activeIndex < typedText.length) {
      const timer = setTimeout(() => {
        setActiveIndex(activeIndex + 1);
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [activeIndex, typedText.length, currentIndex]);

  return (
    <div ref={containerRef} className="">
      {typedText.map((text, index) => (
        <div
          key={index}
          className={`lh ${isMobile() ? "pb24" : "pb36"} fade-in-slide-down ${
            index < activeIndex ? "active" : ""
          }`}
        >
          {text}
        </div>
      ))}

      {isAdOpen && !isShowAllResult && (
        <div>
          <div
            style={{
              marginBottom: "30px",
              marginTop: "16px",
              fontSize: "30px",
              letterSpacing: "10px",
            }}
          >
            [ {data[2].emoji} {data[3].emoji} {data[4].emoji} ]
          </div>
          <a
            href="https://link.coupang.com/a/b6k87x"
            target="_blank"
            rel="noopener noreferrer"
          >
            <button
              style={{ fontSize: "16px" }}
              className="cute-button"
              onClick={() => {
                handleShowResult();
              }}
            >
              광고 보고 이어서 확인하기 👀
            </button>
          </a>
        </div>
      )}
    </div>
  );
};

export default TypingEffectAd;
