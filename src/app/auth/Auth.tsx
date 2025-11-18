"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import GridShape from "@/components/common/GridShape";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import Image from "next/image";
import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";

export default function Auth() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data } = await authService.login({ email, password });
      
      // Очищаем флаг истечения сессии при успешном входе
      sessionStorage.removeItem('sessionExpiredShown');
      
      const role = data?.user?.role;
      if (role === "ADMIN") router.replace("/admin");
      else router.replace("/");
    } catch (error) {
      console.error('Login error:', error);
      setError("Неверная почта или пароль");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex">
      {/* Левая часть - форма */}
      <div className="flex flex-col flex-1 lg:w-1/2 w-full">
        <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <ChevronLeftIcon />
            Back to dashboard
          </Link>
        </div>
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
                  <div className="flex items-center justify-between">
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
                  </div>
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
            {/* {children} */}
            <div className="w-full h-full bg-brand-950 dark:bg-white/5 lg:grid items-center hidden">
              <div className="relative items-center justify-center  flex z-1">
                {/* <!-- ===== Common Grid Shape Start ===== --> */}
                <GridShape />
                <div className="flex flex-col items-center max-w-xs">
                  <Link href="/" className="block mb-4">
                    <Image
                      width={231}
                      height={48}
                      src="/images/logo/logo-dark.svg"
                      alt="Logo"
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
  );
}
