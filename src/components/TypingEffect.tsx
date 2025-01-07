import React, { useState, useEffect, useRef } from "react";

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
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const isMobile = () => {
    return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
      navigator.userAgent
    );
  };

  useEffect(() => {
    const description = data[currentIndex].description;
    setTypedText((prev) => [...prev, description]);

    const timer = setTimeout(() => {
      if (currentIndex === 1) {
        setIsAdOpen(true);
      } else if (currentIndex < data.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [currentIndex, data, isAdOpen]);

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
    </div>
  );
};

export default TypingEffect;
