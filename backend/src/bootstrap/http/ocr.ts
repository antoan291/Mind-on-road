import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { appConfig } from "../../config/app.config";

export async function listDocumentOcrExtractions() {
  try {
    const directoryEntries = await readdir(appConfig.documentOcrOutputDir, {
      withFileTypes: true,
    });

    const ocrFiles = directoryEntries
      .filter(
        (entry) =>
          entry.isFile() &&
          entry.name.endsWith(".json") &&
          !entry.name.startsWith("."),
      )
      .sort((left, right) => left.name.localeCompare(right.name));

    const baseDir = resolve(appConfig.documentOcrOutputDir);
    const parsedFiles = await Promise.all(
      ocrFiles.map(async (entry) => {
        const filePath = resolve(baseDir, entry.name);
        if (!filePath.startsWith(baseDir + "/") && filePath !== baseDir) {
          throw new Error("Invalid file path detected.");
        }
        const rawContent = await readFile(filePath, "utf8");
        return {
          fileName: entry.name,
          data: JSON.parse(rawContent) as unknown,
        };
      }),
    );

    return parsedFiles;
  } catch (error) {
    if (
      typeof error === "object" &&
      error &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return [];
    }
    throw error;
  }
}

export async function listDocumentOcrSourceFiles() {
  try {
    const directoryEntries = await readdir(appConfig.documentOcrSourceDir, {
      withFileTypes: true,
    });

    return directoryEntries
      .filter(
        (entry) =>
          entry.isFile() &&
          entry.name.toLowerCase().endsWith(".pdf") &&
          !entry.name.startsWith("."),
      )
      .map((entry) => entry.name)
      .sort((left, right) => left.localeCompare(right));
  } catch (error) {
    if (
      typeof error === "object" &&
      error &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return [];
    }
    throw error;
  }
}

export async function runDocumentOcrExtraction(sourceFileName: string) {
  const workerResponse = await fetch(
    `${appConfig.documentOcrWorkerUrl.replace(/\/$/, "")}/ocr/extract`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sourceFileName }),
    },
  );

  const responseBody = (await workerResponse.json().catch(() => null)) as {
    fileName?: string;
    outputFileName?: string;
    data?: Record<string, unknown>;
    detail?: string;
  } | null;

  if (!workerResponse.ok) {
    const message =
      typeof responseBody?.detail === "string"
        ? responseBody.detail
        : `OCR worker failed with status ${workerResponse.status}.`;

    const error = new Error(message);
    error.name = `OcrWorkerHttp${workerResponse.status}`;
    throw error;
  }

  return {
    fileName: responseBody?.fileName ?? sourceFileName,
    outputFileName: responseBody?.outputFileName ?? `${sourceFileName}.json`,
    data: responseBody?.data ?? {},
  };
}

export async function runDocumentOcrUploadExtraction(params: {
  fileName: string;
  fileBuffer: Buffer;
}) {
  const formData = new FormData();
  formData.set("file", new Blob([params.fileBuffer]), params.fileName);

  const workerResponse = await fetch(
    `${appConfig.documentOcrWorkerUrl.replace(/\/$/, "")}/ocr/extract-upload`,
    {
      method: "POST",
      headers: { Accept: "application/json" },
      body: formData,
    },
  );

  const responseBody = (await workerResponse.json().catch(() => null)) as {
    fileName?: string;
    outputFileName?: string;
    data?: Record<string, unknown>;
    detail?: string;
  } | null;

  if (!workerResponse.ok) {
    const message =
      typeof responseBody?.detail === "string"
        ? responseBody.detail
        : `OCR worker failed with status ${workerResponse.status}.`;

    const error = new Error(message);
    error.name = `OcrWorkerHttp${workerResponse.status}`;
    throw error;
  }

  return {
    fileName: responseBody?.fileName ?? params.fileName,
    outputFileName: responseBody?.outputFileName ?? `${params.fileName}.json`,
    data: responseBody?.data ?? {},
  };
}

export function extractOcrField(
  data: Record<string, unknown>,
  key: string,
): string | null {
  const value = data[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function mapOcrWorkerErrorStatusCode(error: unknown) {
  if (!(error instanceof Error)) {
    return 502;
  }
  if (error.name === "OcrWorkerHttp400") return 400;
  if (error.name === "OcrWorkerHttp404") return 404;
  if (error.name === "OcrWorkerHttp422") return 422;
  return 502;
}
