import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Админка",
  description: "Админка",
};

export default function Ecommerce() {
  return (
    <>
     <h1 className="text-center text-lg mt-15">Админка</h1>
     <div>
        <input placeholder="email" />
        <input placeholder="password" />
        <input placeholder="name" />
      </div>
      <button>Создать</button>
    </>
  );
}
