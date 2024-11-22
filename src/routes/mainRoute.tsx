// import { DOMRouterOpts } from "react-router-dom";
import { RouteObject } from "react-router";
import ErrorPage from "@pages/common/ErrorPage";
import MainPage from "@pages/MainPage";
import LoginPage from "@pages/LoginPage";
import AuthTestPage from "@pages/AuthTestPage";
import AuthLayout from "@/components/layouts/AuthLayout";

/** 기본 라우터 */
const defaultRoutes: RouteObject[] = [
  {
    path: "/login",
    element: <LoginPage />,
    errorElement: <ErrorPage />,
  },
];

/** token 값이 유효할 때 라우트 */
const authRoutes: RouteObject[] = [
  {
    path: "/",
    element: <MainPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/auth",
    element: <AuthTestPage />,
    errorElement: <ErrorPage />,
  },
];

/** 어드민 라우트 */
const adminRoutes: RouteObject[] = [
  {
    path: "/",
    element: <AuthLayout />, // AuthLayout 내에서 <Outlet />을 통해 자식 라우트 렌더링
    children: [
      { index: true, element: <MainPage /> },
      { path: "test", element: <AuthTestPage /> },
      // 추가 자식 라우트...
    ],
    errorElement: <ErrorPage />,
  },
  // 기타 라우트...
];

export { defaultRoutes, authRoutes, adminRoutes };
