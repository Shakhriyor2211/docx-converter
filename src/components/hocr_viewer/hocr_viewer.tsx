"use client";
import React, { useEffect, useState } from "react";
import useHocrToHtml from "./useConverter";
import UploadFile from "../upload";

interface Word {
  text: string;
  left: number;
  top: number;
  right: number;
  bottom: number;
}

interface HocrViewerProps {
  hocrContent: string;
}

const HocrViewer: React.FC<HocrViewerProps> = () => {
  const [words, setWords] = useState<Word[]>([]);
  const [hocrContent, setHocrContent] = useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setHocrContent(content);
      };
      reader.readAsText(file, "UTF-8");
    }
  };

  return (
    <>
      <UploadFile />

      {words.length && (
        <div className="container w-full h-full relative">
          {words.map((word, index) => {
            const { text, left, top, right, bottom } = word;
            const width = right - left;
            const height = bottom - top;

            return (
              <span
                key={index}
                className="word absolute whitespace-nowrap"
                style={{
                  left: `${left}px`,
                  top: `${top}px`,
                  width: `${width}px`,
                  height: `${height}px`,
                }}
              >
                {text}
              </span>
            );
          })}
        </div>
      )}
    </>
  );
};

export default HocrViewer;
