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
      const pageDiv = document.createElement("div");
      const textboxes = pages[i].querySelectorAll("textbox");
      const bbox =
        pages[i].getAttribute("bbox")?.split(",").map(parseFloat) || null;

      if (bbox) {
        const width = bbox[2];
        const height = bbox[3];
        pageDiv.setAttribute("class", "border shadow");
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
        containerDiv.appendChild(pageDiv);
      }
    }
    console.log(containerDiv);

    return containerDiv;
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

  return { hocrToHtml, xmlToHtml };
}
