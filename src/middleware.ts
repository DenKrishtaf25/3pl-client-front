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

  // Пропускаем статические файлы и служебные пути (изображения, шрифты и т.д.)
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/fonts/') ||
    pathname.startsWith('/api/') ||
    pathname === '/favicon.ico' ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)$/i)
  ) {
    return NextResponse.next()
  }

  // Блокируем подозрительные запросы (возвращаем 403 без редиректа)
  if (isSuspiciousRequest(req)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  // Предотвращаем бесконечные редиректы - проверяем, не находимся ли мы уже на целевой странице
  const isAuthPage = pathname.startsWith('/auth')
  const isNotFoundPage = pathname === '/not-found'

  // Если пользователь не авторизован и не на странице авторизации
  if (!accessToken && !isAuthPage && !isNotFoundPage) {
    return NextResponse.redirect(new URL('/auth', req.url))
  }

  // Если уже авторизован и пытается попасть на /auth, редиректим на главную
  if (accessToken && isAuthPage) {
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
