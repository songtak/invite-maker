import { RouterProvider } from "react-router-dom";

import useDynamicRoutes from "@libs/hooks/useDynamicRoutes";
import ScrollToTop from "@libs/ScrollToTop";
import "../assets/web.css";
import "../assets/mobile.css";

/** 기본 라우터 */
const MainRouter = () => {
  const router = useDynamicRoutes();

  return (
    <div className="wrapper">
      <div className="main_wrapper">
        <RouterProvider router={router}>
          <ScrollToTop />
        </RouterProvider>
      </div>
    </div>
  );
};

export default MainRouter;
