import { useCallback } from "react";

interface Word {
  text: string;
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export function useConverter() {
  const xmlToHtml = useCallback((xmlContent: string) => {
    const parser = new DOMParser();
    const xmlDOC = parser.parseFromString(xmlContent, "text/html");

    const containerDiv = document.getElementById("document_container");
    if (containerDiv) {
      containerDiv.innerHTML = "";
    }
    const pages = xmlDOC.querySelectorAll("page");
    for (let i = 0; i < pages.length; i++) {
      const pageContainer = document.createElement("div");
      const pageDiv = document.createElement("div");
      const textboxes = pages[i].querySelectorAll("textbox");

      pageContainer.setAttribute(
        "class",
        "flex justify-center items-center border shadow w-[595px] h-[842px]"
      );
      const bbox =
        pages[i].getAttribute("bbox")?.split(",").map(parseFloat) || null;

      if (bbox) {
        const width = bbox[2];
        const height = bbox[3];

        pageDiv.style.position = "relative";
        pageDiv.style.width = `${width}px`;
        pageDiv.style.height = `${height}px`;
      }

      for (let j = 0; j < textboxes.length; j++) {
        const textboxDiv = document.createElement("div");
        const textlines = textboxes[j].querySelectorAll("textline");

        for (let k = 0; k < textlines.length; k++) {
          const textlineP = document.createElement("p");
          const texts = textlines[k].querySelectorAll("text");
          for (let m = 0; m < texts.length; m++) {
            const textSpan = document.createElement("span");
            textSpan.innerText = texts[m].innerHTML;
            const bbox =
              texts[m].getAttribute("bbox")?.split(",").map(parseFloat) || null;
            const font = texts[m].getAttribute("font") || null;

            if (font) {
              textSpan.style.fontFamily = font;
            }

            if (bbox) {
              const left = bbox[0];
              const bottom = bbox[1];
              textSpan.style.position = "absolute";
              textSpan.style.left = `${left}px`;
              textSpan.style.bottom = `${bottom}px`;
            }

            const size = texts[m].getAttribute("size");
            textSpan.style.fontSize = `${size}px`;
            textlineP.appendChild(textSpan);
          }
          textboxDiv.appendChild(textlineP);
        }

        pageDiv.appendChild(textboxDiv);
      }
      if (containerDiv) {
        pageContainer.appendChild(pageDiv);
        containerDiv.appendChild(pageContainer);
      }
    }
  }, []);

  const hocrToHtml = useCallback((hocrContent: string) => {
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

  const jsonToHtml = useCallback((jsonContent: string) => {
    const jsContent = JSON.parse(jsonContent);
    const containerDiv = document.getElementById("document_container");
    if (containerDiv) {
      containerDiv.innerHTML = "";
    }
    for (let i = 0; i < jsContent.length; i++) {
      const page = jsContent[i].content;
      const size = jsContent[i].size;
      const pageContainer = document.createElement("div");
      const pageDiv = document.createElement("div");
      pageDiv.style.position = "relative";
      pageDiv.style.width = `${size.page_width}px`;
      pageDiv.style.height = `${size.page_height}px`;

      pageContainer.setAttribute(
        "class",
        "flex justify-center items-center mx-auto border shadow w-[595px] h-[842px]"
      );
      for (let j = 0; j < page.length; j++) {
        const chars = page[j].chars;
        const textPar = document.createElement("p");

        for (let k = 0; k < chars.length; k++) {
          const textSpan = document.createElement("span");
          textSpan.innerText = chars[k].text;

          textSpan.style.fontSize = `${chars[k].size}px`;
          textSpan.style.fontFamily = chars[k].fontname;
          textSpan.style.position = "absolute";
          textSpan.style.top = `${chars[k].top}px`;
          textSpan.style.left = `${chars[k].x0}px`;

          textPar.appendChild(textSpan);
        }

        pageDiv.appendChild(textPar);
      }
      if (containerDiv) {
        pageContainer.appendChild(pageDiv);
        containerDiv.appendChild(pageContainer);
      }
    }
  }, []);

  return { hocrToHtml, xmlToHtml, jsonToHtml };
}
