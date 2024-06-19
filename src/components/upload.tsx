"use client";

import React, { useCallback, useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

interface ExtractedFile {
  relativePath: string;
  data: number[];
}

function UploadFile() {
  const [extractedFiles, setExtractedFiles] = useState<ExtractedFile[]>([]);
  const [files, setFiles] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");

  const unZipFiles = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();
    const reader = new FileReader();

    reader.onload = async function (e) {
      const zip = await JSZip.loadAsync(e.target!.result as ArrayBuffer);
      const new_files: ExtractedFile[] = [];

      const filePromises: Promise<void>[] = [];

      zip.forEach((relativePath, file) => {
        if (!file.dir) {
          // Extract file
          filePromises.push(
            file.async("uint8array").then((data) => {
              new_files.push({ relativePath, data: Array.from(data) });
            })
          );
        }
      });

      await Promise.all(filePromises);

      setExtractedFiles(new_files);
      // uploadFilesToServer(new_files);
    };

    reader.readAsArrayBuffer(files!);
  };

  const uploadFilesToServer = useCallback(async (files: ExtractedFile[]) => {
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ files }),
      });
      const result = await response.json();
      setUploadStatus(result.message);
    } catch (error) {
      console.error("Error uploading files:", error);
      setUploadStatus("Failed to upload files");
    }
  }, []);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files && files[0]) {
        setFiles(files[0]);
      }
    },
    []
  );

  const downloadAllFilesAsZip = useCallback(() => {
    const zip = new JSZip();
    extractedFiles.forEach((file) => {
      zip.file(file.relativePath, new Uint8Array(file.data));
    });
    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, "extracted_files.zip");
    });
  }, [extractedFiles]);
  const downloadAllFilesAsDocx = useCallback(() => {
    const zip = new JSZip();
    extractedFiles.forEach((file) => {
      zip.file(file.relativePath, new Uint8Array(file.data));
    });
    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, "new_document.docx");
    });
  }, [extractedFiles]);

  return (
    <div className="flex flex-col">
      <form className="flex flex-col max-w-xl m-12 items-start">
        <label
          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          htmlFor="multiple_files"
        >
          Upload files
        </label>
        <input
          className="block w-full text-sm p-4 text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
          id="multiple_files"
          onChange={handleChange}
          type="file"
          multiple
        />
        {files && extractedFiles.length === 0 ? (
          <button
            className="mt-4 bg-indigo-500 px-4 py-2 text-white rounded"
            onClick={unZipFiles}
          >
            Convert to zip
          </button>
        ) : null}
        {extractedFiles.length > 0 ? (
          <button
            className="mt-4 bg-indigo-500 px-4 py-2 text-white rounded"
            onClick={downloadAllFilesAsZip}
          >
            Download ZIP
          </button>
        ) : null}
      </form>
    </div>
  );
}

export default UploadFile;
