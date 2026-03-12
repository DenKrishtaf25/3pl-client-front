import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

const documents = {
  blank: {
    fileName: "blank.RTF",
    contentType: "application/rtf",
  },
  example: {
    fileName: "example.xls",
    contentType: "application/vnd.ms-excel",
  },
} as const;

type DocType = keyof typeof documents;

const isDocType = (value: string): value is DocType => value in documents;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ docType: string }> }
) {
  const { docType } = await params;

  if (!isDocType(docType)) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const document = documents[docType];
  const filePath = path.join(process.cwd(), "src", "docs", document.fileName);

  try {
    const fileBuffer = await readFile(filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": document.contentType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(document.fileName)}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Document is unavailable" }, { status: 404 });
  }
}
