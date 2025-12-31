import React, { useEffect, useRef, useState } from "react";
import { sunrise_result } from "../assets/sunrise_coords";
import ReactGA from "react-ga4";

const NCLOUD_CLIENT_ID = "4he4o3zf4v"; // provided by user
// const NCLOUD_CLIENT_SECRET = "EwP64krczmUPTdvp8rgvT3drQ5mF03ABrI7Hmiby";

const loadNaverMaps = (clientId: string) => {
  return new Promise<void>((resolve, reject) => {
    // @ts-ignore
    if (window.naver && window.naver.maps) {
      resolve();
      return;
    }

    // ✅ 이미 maps.js가 있으면(누가 넣었든) 새로 append 하지 말고 load만 기다림
    const existing = Array.from(document.getElementsByTagName("script")).find(
      (s) => s.src.includes("oapi.map.naver.com/openapi/v3/maps.js")
    ) as HTMLScriptElement | undefined;

    if (existing) {
      // 이미 로딩 끝난 상태면 바로 resolve
      // @ts-ignore
      if (window.naver && window.naver.maps) {
        resolve();
        return;
      }

      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", (e) => reject(e as any), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(
      clientId
    )}`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = (e) => reject(e);
    document.head.appendChild(script);
  });
};

// const loadNaverMaps = (clientId: string) => {
//   return new Promise<void>((resolve, reject) => {
//     // @ts-ignore
//     if (window.naver && window.naver.maps) {
//       resolve();
//       return;
//     }

//     // ✅ 이미 maps.js가 있으면(누가 넣었든) 새로 넣지 말고 load만 기다림
//     const existing = Array.from(document.getElementsByTagName("script")).find(
//       (s) => s.src.includes("openapi.map.naver.com/openapi/v3/maps.js")
//     ) as HTMLScriptElement | undefined;

//     if (existing) {
//       // 이미 로드 완료된 경우
//       // @ts-ignore
//       if (window.naver && window.naver.maps) {
//         resolve();
//         return;
//       }

//       existing.addEventListener("load", () => resolve(), { once: true });
//       existing.addEventListener("error", (e) => reject(e as any), {
//         once: true,
//       });
//       return;
//     }

//     const script = document.createElement("script");
//     script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${encodeURIComponent(
//       clientId
//     )}`;
//     script.async = true;
//     script.onload = () => resolve();
//     script.onerror = (e) => reject(e);
//     document.head.appendChild(script);
//   });
// };

const SunrisePage: React.FC = () => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [locDate, setLocDate] = useState<string>(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}${mm}${dd}`;
  });

  const [debugOrigin, setDebugOrigin] = useState<string>("");
  const [debugHref, setDebugHref] = useState<string>("");
  const [debugReferrer, setDebugReferrer] = useState<string>("");
  const [naverLoadedFlag, setNaverLoadedFlag] = useState<boolean>(false);
  // keep a ref of the selected date so closures (marker handlers) always read latest value
  const locDateRef = React.useRef<string>(locDate);
  const mapInstanceRef = React.useRef<any>(null);
  const infoWindowRef = React.useRef<any>(null);
  const activeMarkerRef = React.useRef<any>(null);
  const activeLocationRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    locDateRef.current = locDate;
  }, [locDate]);

  // Refined Apple-like InfoWindow HTML template using Naver InfoWindow options
  const appleTemplate = (
    title: string,
    subtitle: string,
    innerHtml: string
  ) => {
    const titleStyle =
      "font-weight:600; font-size:14px; margin-bottom:4px; color:#1c1c1e; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto; text-align:center;";
    const subtitleStyle =
      "font-size:12px; color:#6e6e73; margin-bottom:8px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto; text-align:center;";
    const bodyStyle =
      "font-size:13px; line-height:1.5; color:#1c1c1e; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto; overflow-wrap:break-word; text-align:center;";

    return `
        <div style="padding:12px 14px; min-width:180px; max-width:300px; display:flex; flex-direction:column; align-items:center;">
          <div style="${titleStyle}">${title}</div>
          ${subtitle ? `<div style="${subtitleStyle}">${subtitle}</div>` : ""}
          <div style="${bodyStyle}">${innerHtml}</div>
        </div>
      `;
  };

  // format time strings like "0530" or "5:30" or "053012" -> "05:30"
  const formatTime = (raw?: string) => {
    if (!raw) return "-";
    const s = String(raw).trim();
    // if already contains colon, normalize to HH:MM
    if (/:/.test(s)) {
      const parts = s.split(":").map((p) => p.padStart(2, "0"));
      return `${parts[0].slice(-2)}:${parts[1].slice(0, 2)}`;
    }
    // extract digits
    const digits = s.replace(/\D/g, "");
    if (!digits) return s;
    const hhmm =
      digits.length >= 4 ? digits.slice(-4) : digits.padStart(4, "0");
    return `${hhmm.slice(0, 2)}:${hhmm.slice(2)}`;
  };

  // calculate time difference: returns formatted string like "-02:30" or "+01:45" with light gray style
  const getTimeDifference = (timeStr: string) => {
    if (!timeStr) return "";
    try {
      const now = new Date();
      const [hours, mins] = formatTime(timeStr).split(":").map(Number);

      const nowHours = now.getHours();
      const nowMins = now.getMinutes();

      // convert to minutes for easier calculation
      const targetTotalMins = hours * 60 + mins;
      const nowTotalMins = nowHours * 60 + nowMins;
      const diffMins = targetTotalMins - nowTotalMins;

      const sign = diffMins >= 0 ? "-" : "+";
      const absDiff = Math.abs(diffMins);
      const diffHours = Math.floor(absDiff / 60);
      const diffMinsRemainder = absDiff % 60;

      const timeStr_ = `${sign}${String(diffHours).padStart(2, "0")}:${String(
        diffMinsRemainder
      ).padStart(2, "0")}`;
      return `<span style="color:#a0a0a6; font-size:12px; margin-left:8px;">${timeStr_}</span>`;
    } catch (e) {
      return "";
    }
  };

  // 날짜 선택 함수: getDateOffsetRelative는 기준 날짜 문자열(YYYYMMDD)으로부터 offset일을 계산합니다.
  const getDateOffset = (days: number, base?: string): string => {
    const d =
      base && base.length === 8
        ? new Date(
            Number(base.slice(0, 4)),
            Number(base.slice(4, 6)) - 1,
            Number(base.slice(6, 8))
          )
        : new Date();
    d.setDate(d.getDate() + days);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}${mm}${dd}`;
  };

  // offset은 현재 선택된 날짜(locDate)를 기준으로 적용됩니다.
  const handleDateChange = (offset: number) => {
    const newDate = getDateOffset(offset, locDate);

    console.log("handleDateChange_newDate", newDate);

    setLocDate(newDate);
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr || dateStr.length !== 8) return dateStr;

    const y = Number(dateStr.slice(0, 4));
    const m = Number(dateStr.slice(4, 6));
    const d = Number(dateStr.slice(6, 8));

    const date = new Date(y, m - 1, d);

    // 일/월/화/수/목/금/토
    const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
    const weekday = weekdays[date.getDay()];

    // 01월 02일 (수)
    const mm = String(m).padStart(2, "0");
    const dd = String(d).padStart(2, "0");

    return `${mm}월 ${dd}일 (${weekday})`;
  };

  const canGoNext = () => {
    const currentDateNum = parseInt(locDate);
    const maxDate = parseInt(getDateOffset(7));
    return currentDateNum < maxDate;
  };

  /** 송탁 버튼 클릭 */
  const handleClickSongtak = () => {
    ReactGA.event("송탁_버튼_클릭", {
      category: "songtak_button_click",
      action: "송탁 버튼 클릭",
    });

    window.location.href = "https://instagram.com/sn9tk";
  };
  useEffect(() => {
    let mapInstance: any = null;
    let infoWindow: any = null;
    let mapClickListener: any = null;

    // populate debug info early
    try {
      setDebugOrigin(window.location.origin || "");
      setDebugHref(window.location.href || "");
      setDebugReferrer(document.referrer || "");
    } catch (e) {
      /* ignore */
    }

    loadNaverMaps(NCLOUD_CLIENT_ID)
      .then(() => {
        setNaverLoadedFlag(true);
        // @ts-ignore
        const naver = window.naver;
        if (!naver || !naver.maps) {
          setError("Naver Maps SDK 로드에 실패했습니다.");
          return;
        }

        // default center: Seoul City Hall
        const defaultCenter = new naver.maps.LatLng(37.5665, 126.978);

        const initMap = (centerLatLng: any, isUser = false) => {
          // Prefer the ref DOM node, fall back to the element id
          const mapDiv =
            mapRef.current && mapRef.current instanceof HTMLElement
              ? (mapRef.current as HTMLElement)
              : document.getElementById("naver-map");

          if (!mapDiv) {
            setError(
              "지도 요소가 준비되지 않았습니다. 페이지를 새로고침해 주세요."
            );
            return;
          }

          try {
            mapInstance = new naver.maps.Map(mapDiv as any, {
              center: centerLatLng,
              zoom: 12,
              mapTypeControl: true,
            });
            mapInstanceRef.current = mapInstance;
            // close tooltip when clicking blank map area
            mapClickListener = naver.maps.Event.addListener(
              mapInstance,
              "click",
              () => {
                if (infoWindowRef.current) {
                  infoWindowRef.current.close();
                }
                activeMarkerRef.current = null;
                activeLocationRef.current = null;
              }
            );
          } catch (e) {
            console.error("naver.maps.Map 생성 실패", e);
            setError(
              "지도 초기화에 실패했습니다. (인증 실패 또는 SDK 로드 문제). 네이버 클라우드의 허용 출처(Referer)를 확인하세요."
            );
            return;
          }

          // add a marker for the center (user or default)
          try {
            new naver.maps.Marker({
              position: centerLatLng,
              map: mapInstance,
              title: isUser ? "내 위치" : "기본 위치 (서울)",
              icon: new naver.maps.MarkerImage(
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23e74c3c'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z'/%3E%3C/svg%3E",
                new naver.maps.Size(24, 24),
                { anchor: new naver.maps.Point(12, 12) }
              ),
            });
          } catch (e) {
            console.warn("Failed to add center marker", e);
          }

          // add markers from sunrise_result
          try {
            // shared InfoWindow instance with Naver InfoWindow native options (like official example)
            infoWindow = new naver.maps.InfoWindow({
              content: appleTemplate(
                "정보",
                "",
                '<div style="color:#6e6e73">정보를 불러오는 중...</div>'
              ),
              backgroundColor: "#ffffff",
              borderColor: "#e0e0e0",
              borderWidth: 1,
              borderRadius: 12,
              anchorSize: new naver.maps.Size(25, 25),
              anchorSkew: true,
              anchorColor: "#ffffff",
              pixelOffset: new naver.maps.Point(0, -10),
              radius: 8,
            });
            infoWindowRef.current = infoWindow;

            sunrise_result.forEach((item) => {
              if (item.lat == null || item.lng == null) return;
              try {
                const marker = new naver.maps.Marker({
                  position: new naver.maps.LatLng(item.lat, item.lng),
                  map: mapInstance,
                  title: item.location,
                });

                // attach click handler to fetch rise/set info for the currently selected date and show in infoWindow
                naver.maps.Event.addListener(marker, "click", async () => {
                  try {
                    activeMarkerRef.current = marker;
                    activeLocationRef.current = item.location;
                    // show temporary loading content
                    const infoWindowLocal = infoWindowRef.current;
                    if (infoWindowLocal) {
                      infoWindowLocal.setContent(
                        appleTemplate(
                          "정보",
                          "",
                          '<div style="color:#6e6e73">정보를 불러오는 중...</div>'
                        )
                      );
                      infoWindowLocal.open(mapInstanceRef.current, marker);
                    }

                    await openInfoWindowForMarker(marker, item.location);
                  } catch (err) {
                    console.error("Marker click 처리 중 오류", err);
                    if (infoWindowRef.current) {
                      infoWindowRef.current.setContent(
                        appleTemplate(
                          "오류",
                          "",
                          '<div style="color:#6e6e73">정보를 불러오지 못했습니다.</div>'
                        )
                      );
                      infoWindowRef.current.open(
                        mapInstanceRef.current,
                        marker
                      );
                    }
                  }
                });
              } catch (inner) {
                // continue adding other markers even if one fails
                console.warn("Marker 추가 실패", item.location, inner);
              }
            });
          } catch (e) {
            console.warn("Failed to add sunrise_result markers", e);
          }
        };

        // Try to use browser geolocation to set the map center
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const userCenter = new naver.maps.LatLng(
                pos.coords.latitude,
                pos.coords.longitude
              );
              initMap(userCenter, true);
            },
            (err) => {
              console.warn(
                "Geolocation error, falling back to default center",
                err
              );
              initMap(defaultCenter, false);
            },
            { enableHighAccuracy: true, timeout: 5000 }
          );
        } else {
          initMap(defaultCenter, false);
        }

        // Handle window resize to prevent map misalignment on mobile
        const handleResize = () => {
          try {
            if (mapInstance && mapInstance.updateSize) {
              mapInstance.updateSize();
            }
          } catch (e) {
            console.warn("Map resize failed", e);
          }
        };

        window.addEventListener("resize", handleResize);

        return () => {
          window.removeEventListener("resize", handleResize);
        };
      })
      .catch((e) => {
        console.error(e);
        setError("지도 로드 중 오류가 발생했습니다.");
      });

    return () => {
      // clean up if needed
      // @ts-ignore
      try {
        if (
          infoWindowRef.current &&
          typeof infoWindowRef.current.close === "function"
        )
          infoWindowRef.current.close();
        // remove map click listener if attached
        // @ts-ignore
        if (
          mapClickListener &&
          window.naver &&
          window.naver.maps &&
          window.naver.maps.Event
        ) {
          // @ts-ignore
          window.naver.maps.Event.removeListener(mapClickListener);
        }
      } catch (e) {
        /* ignore */
      }
      // @ts-ignore
      if (mapInstance && mapInstance.destroy) mapInstance.destroy();
    };
  }, []);

  // --- Public Data.go.kr Sunrise/Sunset API 호출 ---
  const SERVICE_KEY_ENCODED =
    "uE2Fljsvf2rPBpiUGBrvnx9BD8hRYKp18YS3GeagdnuhTgCE3DggKvsj46Wtk4D6dOXlsZzcKpCtrzojcFwEnQ==";

  // Parameterized fetch helper: returns parsed items for a given location and date
  const fetchRiseSetForLocation = async (
    location: string,
    locdate: string
  ): Promise<Array<Record<string, string>> | null> => {
    console.log("locdate=-=-=-", locdate);

    try {
      const base =
        "https://apis.data.go.kr/B090041/openapi/service/RiseSetInfoService/getAreaRiseSetInfo";
      const params = new URLSearchParams({
        location,
        locdate,
        ServiceKey: SERVICE_KEY_ENCODED,
      });

      const url = `${base}?${params.toString()}`;
      // debug: show which locdate is used for the API call
      // eslint-disable-next-line no-console
      console.debug("fetchRiseSetForLocation ->", url);

      const res = await fetch(url);
      const text = await res.text();

      const parser = new DOMParser();
      const xml = parser.parseFromString(text, "application/xml");
      const parsererror = xml.querySelector("parsererror");
      if (parsererror) {
        console.warn("응답 XML 파싱 실패", text.slice(0, 200));
        return null;
      }

      const items = Array.from(xml.querySelectorAll("item")).map((item) => {
        const obj: Record<string, string> = {};
        Array.from(item.children).forEach((c) => {
          obj[c.tagName] = c.textContent ?? "";
        });
        return obj;
      });

      if (items.length) return items;

      // fallback: if no <item>, return top-level children
      const rootObj: Record<string, string> = {};
      Array.from(xml.documentElement.children).forEach((c) => {
        rootObj[c.tagName] = c.textContent ?? "";
      });
      return [rootObj];
    } catch (e) {
      console.error("fetchRiseSetForLocation error", e);
      return null;
    }
  };

  const openInfoWindowForMarker = async (marker: any, location: string) => {
    try {
      // read latest selected date from ref (updated by a small effect)
      const selectedLocDate = locDateRef.current || locDate;
      const mapInstance = mapInstanceRef.current;
      // @ts-ignore
      const naver = window.naver;
      if (!mapInstance || !naver || !naver.maps) return;

      // ensure infoWindow exists
      if (!infoWindowRef.current) {
        infoWindowRef.current = new naver.maps.InfoWindow({
          content: appleTemplate(
            "정보",
            "",
            '<div style="color:#6e6e73">정보를 불러오는 중...</div>'
          ),
          backgroundColor: "#ffffff",
          borderColor: "#e0e0e0",
          borderWidth: 1,
          borderRadius: 12,
          anchorSize: new naver.maps.Size(25, 25),
          anchorSkew: true,
          anchorColor: "#ffffff",
          pixelOffset: new naver.maps.Point(0, -10),
          radius: 8,
        });
      } else {
        infoWindowRef.current.setContent(
          appleTemplate(
            "정보",
            "",
            '<div style="color:#6e6e73">정보를 불러오는 중...</div>'
          )
        );
      }
      infoWindowRef.current.open(mapInstance, marker);

      // fetch rise/set for this location + selected date
      const items = await fetchRiseSetForLocation(location, selectedLocDate);

      // build Apple-like content from returned items (use first item if exists)
      let bodyHtml = "";
      if (items && items.length) {
        const first = items[0];
        const sr =
          first["sunrise"] ||
          first["sunriseTime"] ||
          first["srTime"] ||
          first["sunR"] ||
          first["suntime"] ||
          "";
        const ss =
          first["sunset"] ||
          first["sunsetTime"] ||
          first["ssTime"] ||
          first["sunS"] ||
          "";
        if (sr || ss) {
          const fmtSr = formatTime(sr);
          const fmtSs = formatTime(ss);
          const diffSr = getTimeDifference(sr);
          const diffSs = getTimeDifference(ss);
          bodyHtml += `<div style="color:#1c1c1e; margin-bottom:4px; display:flex; align-items:center;">일출 🌞  ${fmtSr}${diffSr}</div>`;
          bodyHtml += `<div style="color:#1c1c1e; display:flex; align-items:center;">일몰 🌚  ${fmtSs}${diffSs}</div>`;
        } else {
          const keys = Object.keys(first).slice(0, 6);
          keys.forEach((k) => {
            bodyHtml += `<div style="color:#1c1c1e; margin-bottom:3px"><strong style="font-weight:500; color:#1c1c1e">${k}</strong>: ${
              first[k] ?? ""
            }</div>`;
          });
        }
      } else {
        bodyHtml = `<div style="color:#6e6e73">데이터가 없습니다.</div>`;
      }

      // Remove date from tooltip: use only location + bodyHtml
      const content = appleTemplate(location, "", bodyHtml);
      infoWindowRef.current.setContent(content);
      infoWindowRef.current.open(mapInstance, marker);
    } catch (err) {
      console.error("openInfoWindowForMarker error", err);
    }
  };

  // re-fetch tooltip data when date changes while a tooltip is open
  useEffect(() => {
    if (
      !mapInstanceRef.current ||
      !infoWindowRef.current ||
      !activeMarkerRef.current ||
      !activeLocationRef.current
    ) {
      return;
    }
    openInfoWindowForMarker(activeMarkerRef.current, activeLocationRef.current);
  }, [locDate]);

  const d = locDate || "";
  const formattedDate =
    d.length === 8
      ? `${d.slice(0, 4)}년 ${d.slice(4, 6)}월 ${d.slice(6, 8)}일`
      : d;

  return (
    <div className="result_main_content_sunrise">
      <div className="page_wrapper"></div>
      <h2>🌞 전국 일출/일몰 지도 🌝</h2>

      <div
        style={{
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "1px",
          fontSize: "18px",
        }}
      >
        <button
          onClick={() => handleDateChange(-1)}
          disabled={locDate === getDateOffset(0)}
          style={{
            background: "none",
            border: "none",
            cursor: locDate === getDateOffset(0) ? "default" : "pointer",
            opacity: locDate === getDateOffset(0) ? 0.3 : 1,
            padding: 0,
            fontSize: "24px", // 👈 이모지 크기
            lineHeight: 1,
          }}
          aria-label="이전 날짜"
        >
          ⬅️
        </button>

        <span style={{ minWidth: "140px", textAlign: "center" }}>
          {formatDateDisplay(locDate)}
        </span>

        <button
          onClick={() => handleDateChange(1)}
          disabled={!canGoNext()}
          style={{
            background: "none",
            border: "none",
            cursor: !canGoNext() ? "default" : "pointer",
            opacity: !canGoNext() ? 0.3 : 1,
            padding: 0,
            fontSize: "24px", // 👈 이모지 크기
            lineHeight: 1,
          }}
          aria-label="다음 날짜"
        >
          ➡️
        </button>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
          boxSizing: "border-box",
          paddingLeft: 0,
          paddingRight: 0,
          marginLeft: 0,
          marginRight: 0,
        }}
      >
        <div
          ref={mapRef}
          id="naver-map"
          style={{
            width: "min(90vw, 100%)",
            height: "70vh",
            borderRadius: 8,
            overflow: "hidden",
          }}
        />
      </div>

      <div
        className="songtak"
        style={{ paddingBottom: "24px", paddingTop: "24px" }}
      >
        <span
          style={{ cursor: "pointer" }}
          onClick={() => {
            handleClickSongtak();
          }}
        >
          made by songtak
        </span>
      </div>
    </div>
  );
};

export default SunrisePage;
