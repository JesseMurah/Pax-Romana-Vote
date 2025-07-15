// import { type NextRequest, NextResponse } from "next/server"
// import { decrypt } from "@/lib/auth"
//
// const protectedRoutes = ["/voting"]
// const publicRoutes = ["/", "/about", "/contact", "/register"]
//
// export async function middleware(request: NextRequest) {
//   const path = request.nextUrl.pathname
//   const isProtectedRoute = protectedRoutes.includes(path)
//   const isPublicRoute = publicRoutes.includes(path)
//
//   // Get session from cookie or localStorage (handled client-side)
//   const cookie = request.cookies.get("session")?.value
//   const session = await decrypt(cookie)
//
//   // Redirect to home if trying to access protected route without session
//   if (isProtectedRoute && !session) {
//     return NextResponse.redirect(new URL("/", request.nextUrl))
//   }
//
//   // Redirect to voting if authenticated user tries to access login page
//   if (isPublicRoute && session && path === "/") {
//     return NextResponse.redirect(new URL("/voting", request.nextUrl))
//   }
//
//   return NextResponse.next()
// }
//
// export const config = {
//   matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
// }
