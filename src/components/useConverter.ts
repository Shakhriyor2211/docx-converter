import { useCallback } from "react";

interface Word {
  text: string;
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export function useHocrToHtml() {
  const converter = useCallback((hocrContent: string) => {
    const parser = new DOMParser();
    const hocrDoc = parser.parseFromString(hocrContent, "text/html");
    const wordsArray: Word[] = [];

    const wordElements = hocrDoc.querySelectorAll(".ocrx_word");
    wordElements.forEach((word) => {
      const bbox = word
        .getAttribute("title")
        ?.match(/bbox (\d+) (\d+) (\d+) (\d+)/);
      if (bbox) {
        const [_, left, top, right, bottom] = bbox.map(Number);
        const text = word.textContent?.trim() || "";
        wordsArray.push({ text, left, top, right, bottom });
      }
    });
    return wordsArray;
  }, []);

  return converter;
}
