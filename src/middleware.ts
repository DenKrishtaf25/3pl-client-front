import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Функция для проверки подозрительных заголовков
function isSuspiciousRequest(req: NextRequest): boolean {
  const userAgent = req.headers.get('user-agent') || ''
  const referer = req.headers.get('referer') || ''
  
  // Проверяем на подозрительные паттерны (IRC клиенты, сканеры и т.д.)
  const suspiciousPatterns = [
    /PowerBot/i,
    /IRC/i,
    /bot|crawler|spider|scanner/i,
    /64\.226\.98\.175/i, // Подозрительный IP из логов
  ]
  
  return suspiciousPatterns.some(pattern => 
    pattern.test(userAgent) || pattern.test(referer)
  )
}

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

  // Блокируем подозрительные запросы
  if (isSuspiciousRequest(req)) {
    // Возвращаем 403 для подозрительных запросов вместо редиректа
    return new NextResponse('Forbidden', { status: 403 })
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
