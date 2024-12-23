import { useEffect, useRef } from "react";

interface CoupangAdProps {
  id: number;
  trackingCode: string;
  width: string | number;
  height: string | number;
  // adRef: React.RefObject<HTMLDivElement>;
}

const CoupangAd = ({ id, trackingCode, width, height }: CoupangAdProps) => {
  const adContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // 동적으로 스크립트 추가
    const script = document.createElement("script");
    script.src = "https://ads-partners.coupang.com/g.js";
    script.async = true;

    if (adContainerRef.current) {
      adContainerRef.current.appendChild(script);
    }

    // 스크립트 로드 완료 후 광고 초기화
    script.onload = () => {
      /** @ts-ignore */
      if (window?.PartnersCoupang?.G) {
        /** @ts-ignore */
        new window.PartnersCoupang.G({
          id: id,
          template: "carousel",
          trackingCode: trackingCode,
          width: width.toString(),
          height: height.toString(),
          tsource: "",
          container: adContainerRef.current, // 특정 컨테이너에 삽입
        });
      } else {
        console.error("PartnersCoupang is not defined.");
      }
    };

    // 컴포넌트 언마운트 시 cleanup
    return () => {
      if (adContainerRef.current) {
        adContainerRef.current.innerHTML = ""; // 컨테이너 초기화
      }
    };
  }, [id, trackingCode, width, height]);

  return (
    <div
      id="coupang_ad"
      ref={adContainerRef}
      data-id={`coupang-ad-${id}`}
      style={{ width, height }}
    ></div>
  );
};

export default CoupangAd;
