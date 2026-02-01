"use client";
import React, { useRef } from 'react';
import { Download } from 'lucide-react';
import DocumentationContent from '@/components/admin/DocumentationContent';
import './documentation.css';

export default function DocumentationPage() {
  const contentRef = useRef<HTMLDivElement>(null);

  const exportToHTML = () => {
    if (!contentRef.current) return;

    // Клонируем содержимое, чтобы не изменять оригинал
    const clonedContent = contentRef.current.cloneNode(true) as HTMLElement;
    
    // Удаляем кнопки и другие интерактивные элементы, если есть
    const buttons = clonedContent.querySelectorAll('button, .export-button');
    buttons.forEach(btn => btn.remove());
    
    const content = clonedContent.innerHTML;
    
    // Создаем самодостаточный HTML документ с inline стилями
    const htmlContent = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Документация ПЭК 3PL Account</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1d2939;
      background-color: #ffffff;
      padding: 0;
      margin: 0;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    
    h1 {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
      color: #101828;
      border-bottom: 3px solid #465fff;
      padding-bottom: 1rem;
    }
    
    h2 {
      font-size: 2rem;
      font-weight: 600;
      margin-top: 3rem;
      margin-bottom: 1.5rem;
      color: #101828;
      padding-top: 1rem;
      border-top: 1px solid #e4e7ec;
    }
    
    h3 {
      font-size: 1.5rem;
      font-weight: 600;
      margin-top: 2rem;
      margin-bottom: 1rem;
      color: #344054;
    }
    
    h4 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-top: 1.5rem;
      margin-bottom: 0.75rem;
      color: #475467;
    }
    
    p {
      margin-bottom: 1rem;
      color: #475467;
    }
    
    ul, ol {
      margin-bottom: 1rem;
      padding-left: 2rem;
    }
    
    li {
      margin-bottom: 0.5rem;
      color: #475467;
    }
    
    code {
      background-color: #f2f4f7;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
      color: #c4320a;
    }
    
    pre {
      background-color: #1d2939;
      color: #f9fafb;
      padding: 1.5rem;
      border-radius: 8px;
      overflow-x: auto;
      margin-bottom: 1.5rem;
      font-size: 0.9rem;
      line-height: 1.5;
    }
    
    pre code {
      background-color: transparent;
      color: inherit;
      padding: 0;
    }
    
    .api-endpoint {
      background-color: #f9fafb;
      border-left: 4px solid #465fff;
      padding: 1rem;
      margin-bottom: 1.5rem;
      border-radius: 4px;
    }
    
    .method {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 4px;
      font-weight: 600;
      font-size: 0.875rem;
      margin-right: 0.5rem;
    }
    
    .method.get {
      background-color: #12b76a;
      color: white;
    }
    
    .method.post {
      background-color: #0ba5ec;
      color: white;
    }
    
    .method.put {
      background-color: #fb6514;
      color: white;
    }
    
    .method.delete {
      background-color: #f04438;
      color: white;
    }
    
    .endpoint-path {
      font-family: 'Courier New', monospace;
      font-size: 1.1rem;
      font-weight: 600;
      color: #101828;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 1.5rem;
    }
    
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e4e7ec;
    }
    
    th {
      background-color: #f9fafb;
      font-weight: 600;
      color: #344054;
    }
    
    tr:hover {
      background-color: #f9fafb;
    }
    
    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    
    .badge.required {
      background-color: #fee4e2;
      color: #c4320a;
    }
    
    .badge.optional {
      background-color: #ecfdf3;
      color: #12b76a;
    }
    
    .toc {
      background-color: #f9fafb;
      border: 1px solid #e4e7ec;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }
    
    .toc h3 {
      margin-top: 0;
      margin-bottom: 1rem;
    }
    
    .toc ul {
      list-style: none;
      padding-left: 0;
    }
    
    .toc li {
      margin-bottom: 0.5rem;
    }
    
    .toc a {
      color: #465fff;
      text-decoration: none;
    }
    
    .toc a:hover {
      text-decoration: underline;
    }
    
    .info-box {
      background-color: #ecf3ff;
      border-left: 4px solid #465fff;
      padding: 1rem;
      margin-bottom: 1.5rem;
      border-radius: 4px;
    }
    
    .warning-box {
      background-color: #fff6ed;
      border-left: 4px solid #fb6514;
      padding: 1rem;
      margin-bottom: 1.5rem;
      border-radius: 4px;
    }
    
    .success-box {
      background-color: #ecfdf3;
      border-left: 4px solid #12b76a;
      padding: 1rem;
      margin-bottom: 1.5rem;
      border-radius: 4px;
    }
    
    .documentation-content {
      color: #1d2939;
    }
    
    .documentation-content a {
      color: #465fff;
      text-decoration: none;
    }
    
    .documentation-content a:hover {
      text-decoration: underline;
    }
    
    h2, h3 {
      scroll-margin-top: 20px;
    }
    
    /* Smooth scroll */
    html {
      scroll-behavior: smooth;
    }
  </style>
</head>
<body>
  <div class="container">
    ${content}
  </div>
</body>
</html>`;

    // Создаем blob и скачиваем файл
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pec3pl-account-doc.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
          Документация
        </h1>
        <button
          onClick={exportToHTML}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          Экспортировать HTML
        </button>
      </div>

      <div ref={contentRef} className="prose prose-lg max-w-none dark:prose-invert">
        <DocumentationContent />
      </div>
    </div>
  );
}

