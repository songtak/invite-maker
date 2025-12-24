import { useEffect, useRef } from "react";
import { RouterProvider, HashRouter } from "react-router-dom";
import ReactGA from "react-ga4";

import useDynamicRoutes from "@libs/hooks/useDynamicRoutes";
import ScrollToTop from "@libs/ScrollToTop";
import RouteChangeTracker from "./RouteChangeTracker";
import "../assets/web.css";
import "../assets/mobile.css";
import "../assets/common.css";

/** 기본 라우터 */
const MainRouter = () => {
  const router = useDynamicRoutes();
  const PUBLIC_GA_ID = `${import.meta.env.VITE_PUBLIC_GA_ID}`;
  useEffect(() => {
    ReactGA.initialize(`${PUBLIC_GA_ID}`);
  }, []);

  return (
    <div className="wrapper common main_root ">
      <div className="common_bg_glow" />
      <div className="common_bg_blob3" />
      <div className="common_bg_blob4" />

      <div className="main_wrapper ">
        {/* @ts-ignore */}
        <RouterProvider router={router}>
          <ScrollToTop />
        </RouterProvider>
      </div>
    </div>
  );
};

export default MainRouter;
