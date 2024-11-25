import { useEffect } from "react";
import { RouterProvider, HashRouter } from "react-router-dom";
import ReactGA from "react-ga4";

import useDynamicRoutes from "@libs/hooks/useDynamicRoutes";
import ScrollToTop from "@libs/ScrollToTop";
import "../assets/web.css";
import "../assets/mobile.css";

/** 기본 라우터 */
const MainRouter = () => {
  const router = useDynamicRoutes();
  const PUBLIC_GA_ID = `${import.meta.env.VITE_PUBLIC_GA_ID}`;

  useEffect(() => {
    ReactGA.initialize(`${PUBLIC_GA_ID}`);
  }, []);

  return (
    <div className="wrapper">
      <div className="main_wrapper">
        {/* @ts-ignore */}
        <RouterProvider router={router}>
          <ScrollToTop />
        </RouterProvider>
      </div>
      {/* <div className="songtak" style={{ marginTop: "24px" }}>
        <span
          style={{ cursor: "pointer" }}
          onClick={() => {
            window.location.href = "https://instagram.com/sn9tk";
          }}
        >
          made by songtak
        </span>
      </div> */}
    </div>
  );
};

export default MainRouter;
