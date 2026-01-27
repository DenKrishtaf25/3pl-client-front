"use client";
import React, { useState, useRef } from "react";
// import ComponentCard from "../../common/ComponentCard";
import TextArea from "../input/TextArea";
import Label from "../Label";
import Button from "../../ui/button/Button";
import { Paperclip, X } from "lucide-react";

interface TextAreaInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onFileChange?: (file: File | null) => void;
  file?: File | null;
}

export default function SmartTextArea({ 
  value: externalValue, 
  onChange: externalOnChange,
  onFileChange,
  file: externalFile
}: TextAreaInputProps = {}) {
  const [internalValue, setInternalValue] = useState("");
  const [internalFile, setInternalFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDisabled, setIsDisabled] = useState(false);
  const [hasError, setHasError] = useState(false);

  const value = externalValue !== undefined ? externalValue : internalValue;
  const file = externalFile !== undefined ? externalFile : internalFile;

  // Логика: если введено более 100 символов — блокируем;
  // если пусто — ошибка;
  // иначе — нормальное состояние
  const handleChange = (val: string) => {
    if (externalOnChange) {
      externalOnChange(val);
    } else {
      setInternalValue(val);
    }

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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    if (onFileChange) {
      onFileChange(selectedFile);
    } else {
      setInternalFile(selectedFile);
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (onFileChange) {
      onFileChange(null);
    } else {
      setInternalFile(null);
    }
  };

  return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Опишите вашу претензию</Label>
          <Button
            size="sm"
            variant="outline"
            onClick={handleFileButtonClick}
            startIcon={<Paperclip size={16} />}
            type="button"
          >
            Прикрепить файл
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept="*/*"
          />
        </div>
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
        {file && (
          <div className="flex items-center gap-2 mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Paperclip size={16} className="text-gray-500 dark:text-gray-400" />
            <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 truncate">
              {file.name}
            </span>
            <button
              type="button"
              onClick={handleRemoveFile}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>
  );
}
