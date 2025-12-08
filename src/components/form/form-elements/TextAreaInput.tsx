"use client";
import React, { useState } from "react";
// import ComponentCard from "../../common/ComponentCard";
import TextArea from "../input/TextArea";
import Label from "../Label";

export default function SmartTextArea() {
  const [value, setValue] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Логика: если введено более 100 символов — блокируем;
  // если пусто — ошибка;
  // иначе — нормальное состояние
  const handleChange = (val: string) => {
    setValue(val);

    if (val.length > 100) {
      setIsDisabled(true);
      setHasError(false);
    } else if (val.trim() === "") {
      setHasError(true);
      setIsDisabled(false);
    } else {
      setIsDisabled(false);
      setHasError(false);
    }
  };

  return (
      <div className="space-y-2">
        <Label>Опишите вашу претензию</Label>
        <TextArea
          value={value}
          onChange={handleChange}
          rows={6}
          disabled={isDisabled}
          error={hasError}
          hint={
            hasError
              ? "Please enter a description."
              : isDisabled
              ? "Input is disabled after 100 characters."
              : undefined
          }
        />
      </div>
  );
}
