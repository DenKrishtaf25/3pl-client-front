"use client";
import React, { useState } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { userService } from "@/services/user.service";
import { useUser } from "@/hooks/useUser";

export default function UserInfoCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const { refetchUser } = useUser();
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [passwordFieldErrors, setPasswordFieldErrors] = useState<{
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const validatePassword = () => {
    const errors: typeof passwordFieldErrors = {};
    let isValid = true;

    if (!passwordData.newPassword) {
      errors.newPassword = "Введите новый пароль";
      isValid = false;
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = "Пароль должен содержать минимум 6 символов";
      isValid = false;
    }

    if (!passwordData.confirmPassword) {
      errors.confirmPassword = "Подтвердите новый пароль";
      isValid = false;
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Пароли не совпадают";
      isValid = false;
    }

    setPasswordFieldErrors(errors);
    return isValid;
  };

  const handlePasswordInputChange = (field: keyof typeof passwordData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPasswordData((prev) => ({ ...prev, [field]: e.target.value }));
    if (passwordFieldErrors[field]) {
      setPasswordFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    setError(null);
    setSuccess(false);
  };

  const handlePasswordChange = async (): Promise<boolean> => {
    setError(null);
    setSuccess(false);

    if (!validatePassword()) {
      return false;
    }

    setLoading(true);

    try {
      await userService.updateProfile({
        password: passwordData.newPassword,
      });

      setSuccess(true);
      setPasswordData({
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordFieldErrors({});

      await refetchUser();
      return true;
    } catch (err: unknown) {
      let errorMessage = "Ошибка при изменении пароля";

      if (err && typeof err === "object" && "response" in err) {
        const apiError = err as {
          response?: {
            data?: {
              message?: string;
              error?: string;
              errors?: unknown;
            };
          };
          message?: string;
        };

        if (apiError.response?.data?.message) {
          const message = apiError.response.data.message;
          errorMessage = message;
        } else if (apiError.response?.data?.error) {
          errorMessage = apiError.response.data.error;
        } else if (apiError.message) {
          errorMessage = apiError.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Если указан пароль, сохраняем его
    if (passwordData.newPassword || passwordData.confirmPassword) {
      const passwordChanged = await handlePasswordChange();
      // Если пароль успешно изменен, закрываем модальное окно через 1.5 секунды
      if (passwordChanged) {
        setTimeout(() => {
          handleClose();
        }, 1500);
        return;
      }
      // Если была ошибка, не закрываем модальное окно
      return;
    }
    
    // Handle save logic for personal data here
    closeModal();
  };

  const handleClose = () => {
    setPasswordData({
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordFieldErrors({});
    setError(null);
    setSuccess(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    closeModal();
  };
  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Данные
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Имя
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                Вася
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Фамилия
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                Иванов
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Почта
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                randomuser@pimjo.com
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Телефон
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                +7 009 363 39 46
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Должность
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                Team Manager
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openModal}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
        >
          <svg
            className="fill-current"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
              fill=""
            />
          </svg>
          Редактировать
        </button>
      </div>

      <Modal isOpen={isOpen} onClose={handleClose} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Редактировать персональные данные
            </h4>
          </div>
          <form className="flex flex-col">
            <div className="custom-scrollbar max-h-[600px] overflow-y-auto px-2 pb-3">
              <div>
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Социальные сети
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div>
                    <Label>Facebook</Label>
                    <Input
                      type="text"
                      defaultValue="https://www.facebook.com/PimjoHQ"
                    />
                  </div>

                  <div>
                    <Label>X.com</Label>
                    <Input type="text" defaultValue="https://x.com/PimjoHQ" />
                  </div>

                  <div>
                    <Label>Linkedin</Label>
                    <Input
                      type="text"
                      defaultValue="https://www.linkedin.com/company/pimjo"
                    />
                  </div>

                  <div>
                    <Label>Instagram</Label>
                    <Input
                      type="text"
                      defaultValue="https://instagram.com/PimjoHQ"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Персональные данные
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Имя</Label>
                    <Input type="text" defaultValue="Вася" />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Фамилия</Label>
                    <Input type="text" defaultValue="Chowdhury" />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Почта</Label>
                    <Input type="text" defaultValue="randomuser@pimjo.com" />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Телефон</Label>
                    <Input type="text" defaultValue="+09 363 398 46" />
                  </div>

                  <div className="col-span-2">
                    <Label>Должность</Label>
                    <Input type="text" defaultValue="Team Manager" />
                  </div>

                  <div className="col-span-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h6 className="mb-4 text-base font-medium text-gray-800 dark:text-white/90">
                      Смена пароля
                    </h6>

                    {error && (
                      <div className="mb-4 rounded-lg bg-error-50 border border-error-200 p-3 text-sm text-error-600 dark:bg-error-900/20 dark:border-error-800 dark:text-error-400">
                        {error}
                      </div>
                    )}

                    {success && (
                      <div className="mb-4 rounded-lg bg-success-50 border border-success-200 p-3 text-sm text-success-600 dark:bg-success-900/20 dark:border-success-800 dark:text-success-400">
                        Пароль успешно изменен!
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                      <div>
                        <Label>Новый пароль</Label>
                        <div className="relative">
                          <div className="relative">
                            <Input
                              type={showNewPassword ? "text" : "password"}
                              value={passwordData.newPassword}
                              onChange={handlePasswordInputChange("newPassword")}
                              error={!!passwordFieldErrors.newPassword}
                              hint={passwordFieldErrors.newPassword}
                              placeholder="Введите новый пароль"
                              className="pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
                            >
                            {showNewPassword ? (
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                />
                              </svg>
                            ) : (
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                            )}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label>Подтвердите новый пароль</Label>
                        <div className="relative">
                          <div className="relative">
                            <Input
                              type={showConfirmPassword ? "text" : "password"}
                              value={passwordData.confirmPassword}
                              onChange={handlePasswordInputChange("confirmPassword")}
                              error={!!passwordFieldErrors.confirmPassword}
                              hint={passwordFieldErrors.confirmPassword}
                              placeholder="Повторите новый пароль"
                              className="pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
                            >
                            {showConfirmPassword ? (
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                />
                              </svg>
                            ) : (
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                            )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={handleClose} disabled={loading}>
                Закрыть
              </Button>
              <Button size="sm" onClick={handleSave} disabled={loading}>
                {loading ? "Сохранение..." : "Сохранить"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
