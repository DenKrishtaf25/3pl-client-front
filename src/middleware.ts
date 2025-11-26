import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const accessToken = req.cookies.get('accessToken')?.value

  // Пропускаем статические файлы (изображения, шрифты и т.д.)
  if (
    pathname.startsWith('/images/') ||
    pathname.startsWith('/fonts/') ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)$/i)
  ) {
    return NextResponse.next()
  }

  // Если пользователь не авторизован
  if (!accessToken && !pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/auth', req.url))
  }

  // Если уже авторизован и пытается попасть на /auth
  if (accessToken && pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

// Настройки — на какие пути срабатывает middleware
export const config = {
  matcher: [
    '/((?!_next|api|favicon.ico).*)', // исключаем служебные пути
  ],
}
