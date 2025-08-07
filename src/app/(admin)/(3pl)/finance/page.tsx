"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BasicTableOne3 from "@/components/tables/BasicTableOne3";
import BasicTableOne4 from "@/components/tables/BasicTableOne4";
import { useModal } from "../../../../hooks/useModal";
import { Modal } from "../../../../components/ui/modal";
import Input from "../../../../components/form/input/InputField";
import Label from "../../../../components/form/Label";
import Button from "../../../../components/ui/button/Button";
import TextAreaInput from "@/components/form/form-elements/TextAreaInput";
// import { Metadata } from "next";
import React from "react";

// export const metadata: Metadata = {
//   title: "ПЭК:3PL",
//   description:
//     "ПЭК:3PL",
//   // other metadata
// };

export default function BasicTables() {
  const { isOpen, openModal, closeModal } = useModal();
  const handleSave = () => {
    // Handle save logic here
    console.log("Saving changes...");
    closeModal();
  };
  return (
    <div>
      <PageBreadcrumb pageTitle="Финансовые притенции" />
      <div className="space-y-6">
        <ComponentCard title="Статусы финансовых претензий">
          <BasicTableOne3 />
        </ComponentCard>
        <ComponentCard title="Все притензии">
          <BasicTableOne4 />
        </ComponentCard>

         <ComponentCard title="Подача притензии">
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
          Написать притензию
        </button>
        </ComponentCard>

        <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
          <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
            <div className="px-2 pr-14">
              <h4 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white/90">
                Подача притензии
              </h4>
            </div>
            <form className="flex flex-col">
              <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
                <div className="mt-7">
                  <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                    Данные отправителя
                  </h5>

                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                    <div className="col-span-2 lg:col-span-1">
                      <Label>Имя</Label>
                      <Input type="text" defaultValue="Марина" />
                    </div>

                    <div className="col-span-2 lg:col-span-1">
                      <Label>Фамилия</Label>
                      <Input type="text" defaultValue="Медведь" />
                    </div>

                    <div className="col-span-2 lg:col-span-1">
                      <Label>Почта</Label>
                      <Input type="text" defaultValue="randomuser@pimjo.com" />
                    </div>

                    <div className="col-span-2 lg:col-span-1">
                      <Label>Телефон</Label>
                      <Input type="text" defaultValue="+7 363 398 46 23" />
                    </div>

                    <div className="col-span-2">
                      <Label>Должность</Label>
                      <Input type="text" defaultValue="Team Manager" />
                    </div>
                    <div className="col-span-2">
                      <TextAreaInput />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                <Button size="sm" variant="outline" onClick={closeModal}>
                  Закрыть
                </Button>
                <Button size="sm" onClick={handleSave}>
                  Отпраить
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      </div>
    </div>
  );
}
