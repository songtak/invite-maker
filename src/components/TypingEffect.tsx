import React, { useState, useEffect, useRef } from "react";
import CoupangAd from "../components/common/CoupangAd";

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

const TypingEffect: React.FC<TypingEffectProps> = ({ data, onComplete }) => {
  const [typedText, setTypedText] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isAdOpen, setIsAdOpen] = useState<boolean>(false);
  const [isShowAllResult, setIsShowAllResult] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleShowResult = () => {
    setIsShowAllResult(true);
    window.open(
      "https://link.coupang.com/a/b6k87x",
      "_blank",
      "noopener, noreferrer"
    );
  };

  useEffect(() => {
    if (currentIndex < data.length) {
      if (isAdOpen && !isShowAllResult) {
        return;
      }

      const description = data[currentIndex].description;
      setTypedText((prev) => [...prev, description]);

      const timer = setTimeout(() => {
        if (currentIndex === 1) {
          setIsAdOpen(true);
        } else {
          setCurrentIndex((prev) => prev + 1);
        }
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [currentIndex, data, isAdOpen, isShowAllResult]);

  useEffect(() => {
    if (isShowAllResult && currentIndex === 1) {
      const timer = setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setIsAdOpen(false);
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [isShowAllResult, currentIndex]);

  useEffect(() => {
    if (onComplete) {
      activeIndex === 4 && onComplete();
      activeIndex === 5 && onComplete();
    }
  }, [onComplete, activeIndex]);

  const isMobile = () => {
    return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
      navigator.userAgent
    );
  };

  useEffect(() => {
    if (activeIndex < typedText.length) {
      const timer = setTimeout(() => {
        setActiveIndex(activeIndex + 1);
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [activeIndex, typedText.length]);

  // https://link.coupang.com/a/b6k87x

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
          <button
            style={{ fontSize: "16px" }}
            className="cute-button"
            onClick={() => {
              handleShowResult();
            }}
          >
            광고 보고 이어서 확인하기 👀
          </button>
        </div>
      )}
    </div>
  );
};

export default TypingEffect;
