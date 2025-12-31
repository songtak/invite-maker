import React, { useEffect, useRef, useState } from "react";
import { sunrise_result } from "../assets/sunrise_coords";

const NCLOUD_CLIENT_ID = "4he4o3zf4v"; // provided by user
// Client Secret should NOT be embedded in client-side code. Use server-side only.
// const NCLOUD_CLIENT_SECRET = "EwP64krczmUPTdvp8rgvT3drQ5mF03ABrI7Hmiby";

const loadNaverMaps = (clientId: string) => {
  return new Promise<void>((resolve, reject) => {
    // If already loaded, resolve
    // @ts-ignore
    if (window.naver && window.naver.maps) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${clientId}`;
    script.async = true;
    script.onload = () => {
      resolve();
    };
    script.onerror = (e) => reject(e);
    document.head.appendChild(script);
  });
};

const SunrisePage: React.FC = () => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [locName, setLocName] = useState<string>("서울");
  const [locDate, setLocDate] = useState<string>(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}${mm}${dd}`;
  });
  const [loadingApi, setLoadingApi] = useState(false);
  const [rawXml, setRawXml] = useState<string | null>(null);
  const [apiItems, setApiItems] = useState<Array<
    Record<string, string>
  > | null>(null);

  useEffect(() => {
    let mapInstance: any = null;
    let infoWindow: any = null;

    // Apple-like InfoWindow HTML template
    const appleTemplate = (
      title: string,
      subtitle: string,
      innerHtml: string
    ) => {
      return `
        <div style="font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color:#1c1c1e; background:#ffffff; padding:10px 12px; border-radius:12px; box-shadow:0 8px 24px rgba(0,0,0,0.12); min-width:180px; max-width:320px;">
          <div style="font-weight:600; font-size:14px; margin-bottom:4px;">${title}</div>
          ${
            subtitle
              ? `<div style="font-size:12px; color:#6e6e73; margin-bottom:8px;">${subtitle}</div>`
              : ""
          }
          <div style="border-top:1px solid rgba(0,0,0,0.06); margin:6px 0;"></div>
          <div style="font-size:14px; line-height:1.4;">${innerHtml}</div>
        </div>
      `;
    };

    loadNaverMaps(NCLOUD_CLIENT_ID)
      .then(() => {
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
            });
          } catch (e) {
            console.warn("Failed to add center marker", e);
          }

          // add markers from sunrise_result
          try {
            // shared InfoWindow instance with Apple-like styling
            infoWindow = new naver.maps.InfoWindow({
              content: appleTemplate(
                "정보",
                "",
                '<div style="color:#6e6e73">정보를 불러오는 중...</div>'
              ),
            });

            sunrise_result.forEach((item) => {
              if (item.lat == null || item.lng == null) return;
              try {
                const marker = new naver.maps.Marker({
                  position: new naver.maps.LatLng(item.lat, item.lng),
                  map: mapInstance,
                  title: item.location,
                });

                // attach click handler to fetch today's rise/set info and show in infoWindow
                naver.maps.Event.addListener(marker, "click", async () => {
                  try {
                    const today = new Date();
                    const yyyy = today.getFullYear();
                    const mm = String(today.getMonth() + 1).padStart(2, "0");
                    const dd = String(today.getDate()).padStart(2, "0");
                    const locdate = `${yyyy}${mm}${dd}`;

                    // show temporary loading content (Apple-like)
                    if (!infoWindow) {
                      infoWindow = new naver.maps.InfoWindow({
                        content: appleTemplate(
                          "정보",
                          "",
                          '<div style="color:#6e6e73">정보를 불러오는 중...</div>'
                        ),
                      });
                    } else {
                      infoWindow.setContent(
                        appleTemplate(
                          "정보",
                          "",
                          '<div style="color:#6e6e73">정보를 불러오는 중...</div>'
                        )
                      );
                    }
                    infoWindow.open(mapInstance, marker);

                    // fetch rise/set for this location + date
                    const items = await fetchRiseSetForLocation(
                      item.location,
                      locdate
                    );

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
                        bodyHtml += `<div style="color:#1c1c1e; margin-bottom:4px">일출 🌞: ${
                          sr || "-"
                        }</div>`;
                        bodyHtml += `<div style="color:#1c1c1e">일몰 🌝: ${
                          ss || "-"
                        }</div>`;
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
                    const content = appleTemplate(item.location, "", bodyHtml);
                    infoWindow.setContent(content);
                    infoWindow.open(mapInstance, marker);
                  } catch (err) {
                    console.error("Marker click 처리 중 오류", err);
                    if (infoWindow) {
                      infoWindow.setContent(
                        appleTemplate(
                          "오류",
                          "",
                          '<div style="color:#6e6e73">정보를 불러오지 못했습니다.</div>'
                        )
                      );
                      infoWindow.open(mapInstance, marker);
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
      })
      .catch((e) => {
        console.error(e);
        setError("지도 로드 중 오류가 발생했습니다.");
      });

    return () => {
      // clean up if needed
      // @ts-ignore
      try {
        if (infoWindow && typeof infoWindow.close === "function")
          infoWindow.close();
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

  const fetchRiseSet = async () => {
    setError(null);
    setLoadingApi(true);
    setRawXml(null);
    setApiItems(null);

    try {
      const base =
        "http://apis.data.go.kr/B090041/openapi/service/RiseSetInfoService/getAreaRiseSetInfo";
      const params = new URLSearchParams({
        location: locName,
        locdate: locDate,
        ServiceKey: SERVICE_KEY_ENCODED,
      });

      const url = `${base}?${params.toString()}`;

      const res = await fetch(url);
      const text = await res.text();
      setRawXml(text);

      // Parse XML
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, "application/xml");

      const parsererror = xml.querySelector("parsererror");
      if (parsererror) {
        throw new Error("응답 XML 파싱 실패");
      }

      const items = Array.from(xml.querySelectorAll("item")).map((item) => {
        const obj: Record<string, string> = {};
        Array.from(item.children).forEach((c) => {
          obj[c.tagName] = c.textContent ?? "";
        });
        return obj;
      });

      setApiItems(items.length ? items : null);
      if (!items.length) {
        // If no <item>, try to read top-level elements
        const rootObj: Record<string, string> = {};
        Array.from(xml.documentElement.children).forEach((c) => {
          rootObj[c.tagName] = c.textContent ?? "";
        });
        setApiItems([rootObj]);
      }
    } catch (e: any) {
      console.error(e);
      // Common failures: CORS or mixed-content when app is served over HTTPS but API is HTTP
      setError(
        e.message ||
          "API 호출 중 오류가 발생했습니다. (CORS/mixed-content 여부를 확인하세요)"
      );
    } finally {
      setLoadingApi(false);
    }
  };

  // Parameterized fetch helper: returns parsed items for a given location and date
  const fetchRiseSetForLocation = async (
    location: string,
    locdate: string
  ): Promise<Array<Record<string, string>> | null> => {
    try {
      const base =
        "http://apis.data.go.kr/B090041/openapi/service/RiseSetInfoService/getAreaRiseSetInfo";
      const params = new URLSearchParams({
        location,
        locdate,
        ServiceKey: SERVICE_KEY_ENCODED,
      });

      const url = `${base}?${params.toString()}`;

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

  const d = locDate || "";
  const formattedDate =
    d.length === 8
      ? `${d.slice(0, 4)}년 ${d.slice(4, 6)}월 ${d.slice(6, 8)}일`
      : d;

  return (
    <div className="result_main_content_sunrise">
      <div className="page_wrapper"></div>
      <h2>🌞 일출/일몰 🌝</h2>
      <div style={{ marginBottom: "24px" }}>{formattedDate}</div>

      <div
        ref={mapRef}
        id="naver-map"
        style={{
          width: "80vw",
          height: "70vh",
          borderRadius: 8,
          overflow: "hidden",
        }}
      />
    </div>
  );
};

export default SunrisePage;
