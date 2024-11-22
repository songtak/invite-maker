import { RouterProvider } from "react-router-dom";

import useDynamicRoutes from "@libs/hooks/useDynamicRoutes";
import ScrollToTop from "@libs/ScrollToTop";

/** 기본 라우터 */
const MainRouter = () => {
  const router = useDynamicRoutes();

  return (
    <RouterProvider router={router}>
      <ScrollToTop />
    </RouterProvider>
  );
};

export default MainRouter;
