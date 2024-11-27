import React, { useState, useEffect } from "react";

interface Emoji {
  id: number;
  emoji: string;
  title: string;
  symbol: string;
  description: string;
}

interface TypingEffectProps {
  data: Emoji[];
  onComplete?: () => void; // 모든 타이핑이 끝났음을 알리는 콜백
}

const TypingEffect: React.FC<TypingEffectProps> = ({ data, onComplete }) => {
  const [typedText, setTypedText] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < data.length) {
      const description = data[currentIndex].description;

      // 현재 항목의 description을 전체적으로 출력
      setTypedText((prev) => [...prev, description]);

      // 다음 항목으로 넘어가기 전 2초 대기
      const timer = setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, 800); // 각 description 간 대기 시간 (밀리초)

      return () => clearTimeout(timer);
    } else if (onComplete) {
      // 모든 타이핑이 끝났을 때 onComplete 호출
      onComplete();
    }
  }, [currentIndex, data, onComplete]);

  const isMobile = () => {
    return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
      navigator.userAgent
    );
  };

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (activeIndex < typedText.length) {
      const timer = setTimeout(() => {
        setActiveIndex(activeIndex + 1);
      }, 400); // 각 텍스트의 애니메이션 간격

      return () => clearTimeout(timer);
    }
  }, [activeIndex, typedText.length]);

  return (
    <div className="">
      {typedText.map((text, index) => (
        <div
          key={index}
          className={`lh ${isMobile() ? "pb24" : "pb36"} fade-in-slide-down ${
            index < activeIndex ? "active" : ""
          }`}

          // className={`lh ${isMobile() ? "pb24" : "pb36"}`}
        >
          {text}
        </div>
      ))}
    </div>
  );
};

export default TypingEffect;

// import React, { useState, useEffect } from "react";

// interface Emoji {
//   id: number;
//   emoji: string;
//   title: string;
//   symbol: string;
//   description: string;
// }

// interface TypingEffectProps {
//   data: Emoji[];
//   onComplete?: () => void; // 모든 타이핑이 끝났음을 알리는 콜백
// }

// const TypingEffect: React.FC<TypingEffectProps> = ({ data, onComplete }) => {
//   const [typedText, setTypedText] = useState<string[]>([]);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [charIndex, setCharIndex] = useState(0);

//   useEffect(() => {
//     if (currentIndex < data.length) {
//       const description = data[currentIndex]?.description || "";
//       if (charIndex < description.length) {
//         // 타이핑 효과
//         const timer = setTimeout(() => {
//           setTypedText((prev) => {
//             const updatedText = [...prev];
//             updatedText[currentIndex] =
//               (updatedText[currentIndex] || "") + description[charIndex];
//             return updatedText;
//           });
//           setCharIndex((prev) => prev + 1);
//         }, 50); // 타이핑 속도 (밀리초)
//         return () => clearTimeout(timer);
//       } else {
//         // 다음 항목으로 넘어가기 전에 상태 초기화
//         const nextTimer = setTimeout(() => {
//           setCurrentIndex((prev) => prev + 1);
//           setCharIndex(0);
//         }, 200); // 항목 간 대기 시간 (밀리초)
//         return () => clearTimeout(nextTimer);
//       }
//     } else if (onComplete) {
//       // 모든 타이핑이 끝났을 때 onComplete 호출
//       onComplete();
//     }
//   }, [charIndex, currentIndex, data, onComplete]);

//   const isMobile = () => {
//     return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
//       navigator.userAgent
//     );
//   };

//   return (
//     <div>
//       {typedText.map((text, index) => (
//         <div key={index} className={`lh ${isMobile() ? "pb24" : "pb36"}`}>
//           {text}
//         </div>
//       ))}
//     </div>
//   );
// };

// export default TypingEffect;
