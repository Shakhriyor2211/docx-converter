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
    const parser = new DOMParser();

    for (let i = 0; i < jsContent.length; i++) {
      const page = jsContent[i].content;
      const picture = jsContent[i].picture;
      const table = jsContent[i].table;
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

      for (let p = 0; p < picture.length; p++) {
        const image = document.createElement("img");
        image.setAttribute("src", `/images/${picture[p].source}`);
        image.setAttribute("alt", "picture");

        const [x0, y0, x1, y1] = picture[p].coords.map(Number);
        const top = Math.round(y0);
        const left = x0;
        const width = x1 - x0;
        const height = y1 - y0;

        image.style.position = "absolute";
        image.style.top = `${top}px`;
        image.style.left = `${left}px`;
        image.style.width = `${width}px`;
        image.style.height = `${height}px`;
        image.style.zIndex = "10";

        pageDiv.appendChild(image);
      }
      for (let t = 0; t < table.length; t++) {
        const tb = parser.parseFromString(table[t].source, "text/html").body
          .firstChild as HTMLElement;

        const table_icon = parser.parseFromString(
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M64 256V160H224v96H64zm0 64H224v96H64V320zm224 96V320H448v96H288zM448 256H288V160H448v96zM64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64z"/></svg>`,
          "text/html"
        ).body.firstChild as HTMLElement;

        const text_icon = parser.parseFromString(
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M32 32C14.3 32 0 46.3 0 64S14.3 96 32 96H160V448c0 17.7 14.3 32 32 32s32-14.3 32-32V96H352c17.7 0 32-14.3 32-32s-14.3-32-32-32H192 32z"/></svg>`,
          "text/html"
        ).body.firstChild as HTMLElement;
        const remove_icon = parser.parseFromString(
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M290.7 57.4L57.4 290.7c-25 25-25 65.5 0 90.5l80 80c12 12 28.3 18.7 45.3 18.7H288h9.4H512c17.7 0 32-14.3 32-32s-14.3-32-32-32H387.9L518.6 285.3c25-25 25-65.5 0-90.5L381.3 57.4c-25-25-65.5-25-90.5 0zM297.4 416H288l-105.4 0-80-80L227.3 211.3 364.7 348.7 297.4 416z"/></svg>`,
          "text/html"
        ).body.firstChild as HTMLElement;

        table_icon.classList.add("hidden");
        const btn_container = document.createElement("div");
        const show_btn = document.createElement("button");
        const remove_bg = document.createElement("button");

        show_btn.appendChild(text_icon);
        show_btn.appendChild(table_icon);
        remove_bg.appendChild(remove_icon);

        btn_container.appendChild(show_btn);
        btn_container.appendChild(remove_bg);

        const [x0, y0, x1, y1] = table[t].coords.map(Number);
        const top = Math.round(y0);
        const left = x0;
        const width = x1 - x0;
        const height = y1 - y0;

        tb.setAttribute("class", "border_tables bg-white");

        tb.style.position = "absolute";
        tb.style.fontSize = `${7}px`;
        tb.style.top = `${top}px`;
        tb.style.left = `${left}px`;
        tb.style.width = `${width}px`;
        tb.style.height = `${height}px`;
        tb.style.zIndex = "10";

        btn_container.style.display = "flex";
        btn_container.style.flexDirection = "column";
        btn_container.style.alignItems = "center";
        btn_container.style.gap = "12px";
        btn_container.style.position = "absolute";
        btn_container.style.top = `${top + 4}px`;
        btn_container.style.left = `${left + width + 4}px`;
        btn_container.style.zIndex = "10";

        show_btn.style.fill = "#4a64ba";
        show_btn.style.width = "12px";
        show_btn.style.height = "12px";

        remove_bg.style.fill = "gray";
        remove_bg.style.width = "16px";
        remove_bg.style.height = "16px";

        show_btn.addEventListener("click", (event) => {
          event.preventDefault();
          tb.classList.toggle("hidden");
          table_icon.classList.toggle("hidden");
          text_icon.classList.toggle("hidden");
        });

        remove_bg.addEventListener("click", (event) => {
          event.preventDefault();
          tb.classList.toggle("bg-white");
        });

        pageDiv.appendChild(btn_container);
        pageDiv.appendChild(tb);
      }

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
