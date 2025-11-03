import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 인증이 필요한 라우트 정의
const isProtectedRoute = createRouteMatcher([
  "/api/sync-user(.*)", // sync-user API는 인증 필요
]);

// Clerk 미들웨어 설정
export default clerkMiddleware(async (auth, req) => {
  // 보호된 라우트인 경우 인증 확인
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
