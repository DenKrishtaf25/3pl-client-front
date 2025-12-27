"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import GridShape from "@/components/common/GridShape";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { authService } from "@/services/auth.service";
import Image from "next/image";
import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";

export default function Auth() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [minLoadTimePassed, setMinLoadTimePassed] = useState(false);
  const [snowflakes, setSnowflakes] = useState<Array<{
    id: number;
    left: string;
    animationDuration: string;
    animationDelay: string;
    fontSize: string;
    drift: string;
    angle: number;
  }>>([]);

  useEffect(() => {
    // Минимальное время показа прелоадера для плавности (300ms)
    const minTimer = setTimeout(() => {
      setMinLoadTimePassed(true);
    }, 300);

    // Fallback: если логотип не загрузился за 2 секунды, все равно скрываем прелоадер
    const fallbackTimer = setTimeout(() => {
      setLogoLoaded(true);
    }, 2000);

    return () => {
      clearTimeout(minTimer);
      clearTimeout(fallbackTimer);
    };
  }, []);

  useEffect(() => {
    // Скрываем прелоадер когда и логотип загружен, и прошло минимальное время
    if (logoLoaded && minLoadTimePassed) {
      const timer = setTimeout(() => {
        setIsPageLoading(false);
      }, 200); // Небольшая дополнительная задержка для плавного перехода
      return () => clearTimeout(timer);
    }
  }, [logoLoaded, minLoadTimePassed]);

  // Generate snowflakes only on client side to avoid hydration mismatch
  useEffect(() => {
    const generatedSnowflakes = Array.from({ length: 100 }, (_, i) => {
      const duration = Math.random() * 50 + 35; // 35-85 seconds
      // Distribute delays more evenly for continuous flow
      // Use negative delays for some snowflakes to start immediately
      const baseDelay = (i * (duration / 100)) % duration;
      const randomOffset = Math.random() * 2; // Small random offset
      // Use negative delays for first 30% of snowflakes to start immediately
      const delay = i < 30 ? -(Math.random() * duration * 0.3) : baseDelay + randomOffset;
      return {
        id: i,
        left: `${Math.random() * 100}%`,
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
        fontSize: `${Math.random() * 10 + 10}px`, // 10-20px
        drift: `${(Math.random() - 0.5) * 100}px`, // Horizontal drift
        angle: Math.random() < 0.5 ? -25 : 25, // -25 or +25 degrees
      };
    });
    setSnowflakes(generatedSnowflakes);
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data } = await authService.login({ email, password });
      
      // Очищаем флаг истечения сессии при успешном входе
      sessionStorage.removeItem('sessionExpiredShown');
      
      const role = data?.user?.role;
      
      // Используем полную перезагрузку страницы (как в админке) для гарантированного
      // размонтирования компонента Auth и исчезновения прелоадера
      if (role === "ADMIN") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/";
      }
    } catch (error) {
      console.error('Login error:', error);
      setError("Неверная почта или пароль");
      setLoading(false);
    }
  };
  // Компонент прелоадера
  const Preloader = ({ message }: { message?: string }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-gray-900 transition-opacity duration-300">
      <div className="flex flex-col items-center">
          <div className="relative mb-6" style={{ width: 231, height: 48 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo/logo.svg"
              alt="ПЭК"
              className="dark:hidden"
              style={{ width: 231, height: 48 }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo/logo-dark.svg"
              alt="ПЭК"
              className="hidden dark:block"
              style={{ width: 231, height: 48 }}
            />
          </div>
        {message && (
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            {message}
          </p>
        )}
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );

  // Прелоадер при загрузке страницы
  if (isPageLoading) {
    return <Preloader />;
  }

  // Прелоадер при входе в учетную запись
  if (loading) {
    return <Preloader message="Входим в систему..." />;
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes snowfall-movement {
            0% {
              transform: translateY(-100vh) translateX(0) rotate(0deg);
            }
            100% {
              transform: translateY(100vh) translateX(calc(var(--snow-drift, 0px) + var(--snow-angle-offset, 0px))) rotate(360deg);
            }
          }
          @keyframes snowfall-opacity {
            0% {
              opacity: 0;
            }
            1% {
              opacity: 0;
            }
            2% {
              opacity: 1;
            }
            12% {
              opacity: 0.8;
            }
            16% {
              opacity: 0.5;
            }
            20% {
              opacity: 0.2;
            }
            22% {
              opacity: 0;
            }
            24% {
              opacity: 0;
            }
            25% {
              opacity: 1;
            }
            31% {
              opacity: 0.8;
            }
            35% {
              opacity: 0.5;
            }
            39% {
              opacity: 0.2;
            }
            41% {
              opacity: 0;
            }
            43% {
              opacity: 0;
            }
            44% {
              opacity: 1;
            }
            50% {
              opacity: 0.8;
            }
            54% {
              opacity: 0.5;
            }
            58% {
              opacity: 0.2;
            }
            60% {
              opacity: 0;
            }
            62% {
              opacity: 0;
            }
            63% {
              opacity: 1;
            }
            69% {
              opacity: 0.8;
            }
            73% {
              opacity: 0.5;
            }
            77% {
              opacity: 0.2;
            }
            79% {
              opacity: 0;
            }
            81% {
              opacity: 0;
            }
            82% {
              opacity: 1;
            }
            88% {
              opacity: 0.7;
            }
            92% {
              opacity: 0.3;
            }
            96% {
              opacity: 0;
            }
            100% {
              opacity: 0;
            }
          }
          .snowflake {
            position: absolute;
            top: -10px;
            color: white;
            font-family: Arial, sans-serif;
            text-shadow: 0 0 5px rgba(221, 221, 221, 0.89);
            animation: snowfall-movement linear infinite, snowfall-opacity ease-in-out infinite;
            pointer-events: none;
            user-select: none;
            z-index: 1;
            opacity: 0;
          }
          .snowflake::before {
            content: "❄";
          }
        `
      }} />
    <div className="min-h-screen flex">
      {/* Левая часть - форма */}
      <div className="flex flex-col flex-1 lg:w-1/2 w-full">
        {/* <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <ChevronLeftIcon />
            Back to dashboard
          </Link>
        </div> */}
        <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
          <div>
            <div className="mb-5 sm:mb-8">
              <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                Вход
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Введите логин и пароль для входа
              </p>
            </div>
            <div>
              <form onSubmit={onSubmit}>
                <div className="space-y-6">
                  <div>
                    <Label>
                      Почта <span className="text-error-500">*</span>{" "}
                    </Label>
                    <Input
                      placeholder="info@gmail.com"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label>
                      Пароль <span className="text-error-500">*</span>{" "}
                    </Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Введите пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <span
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                      >
                        {showPassword ? (
                          <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                        ) : (
                          <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                        )}
                      </span>
                    </div>
                  </div>
                  {/* <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox checked={isChecked} onChange={setIsChecked} />
                      <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                        Запомнить меня
                      </span>
                    </div>
                    <Link
                      href="/reset-password"
                      className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                    >
                      Забыли пароль?
                    </Link>
                  </div> */}
                  {error && (
                    <p className="text-error-500 text-sm">{error}</p>
                  )}
                  <div>
                    <Button className="w-full" size="sm" type="submit" disabled={loading}>
                      {loading ? "Входим..." : "Войти"}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:w-1/2 relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
        {/* <ThemeProvider> */}
          <div className="relative flex lg:flex-row w-full h-screen justify-center flex-col  dark:bg-gray-900 sm:p-0">
            {/* Snowflakes container with overflow-hidden */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
              {snowflakes.map((snowflake) => {
                // Calculate horizontal offset based on angle (tan(25°) ≈ 0.466)
                // For 100vh drop, offset = 100vh * tan(angle)
                const angleOffset = `${100 * Math.tan((snowflake.angle * Math.PI) / 180)}vh`;
                return (
                  <span
                    key={snowflake.id}
                    className="snowflake"
                    style={{
                      left: snowflake.left,
                      animationDuration: snowflake.animationDuration,
                      animationDelay: snowflake.animationDelay,
                      fontSize: snowflake.fontSize,
                      '--snow-drift': snowflake.drift,
                      '--snow-angle-offset': angleOffset,
                    } as React.CSSProperties & { '--snow-drift': string; '--snow-angle-offset': string }}
                  />
                );
              })}
            </div>
            {/* {children} */}
            <div className="w-full h-full bg-brand-950 dark:bg-white/5 lg:grid items-center hidden relative z-10">
              <div className="relative items-center justify-center  flex z-1">
                {/* <!-- ===== Common Grid Shape Start ===== --> */}
                <GridShape />
                <div className="flex flex-col items-center max-w-xs">
                  <Link href="/" className="block mb-4">
                    {/* <Image
                      width={231}
                      height={48}
                      src="/images/logo/logo.svg"
                      alt="Logo"
                      className="dark:hidden"
                      priority
                      unoptimized
                    /> */}
                    <Image
                      width={231}
                      height={48}
                      src="/images/logo/logo-dark.svg"
                      alt="Logo"
                      priority
                      unoptimized
                    />
                  </Link>
                  <p className="text-center text-gray-400 dark:text-white/60">
                    Полный логистический сервис от склада до доставки
                  </p>
                </div>
              </div>
            </div>
            <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
              <ThemeTogglerTwo />
            </div>
          </div>
        {/* </ThemeProvider> */}
      </div>
    </div>
    </>
  );
}
