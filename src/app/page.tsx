import ConvertFiles from "@/components/convert_files";

export default function Home() {
  return (
    <main>
      <ConvertFiles />
      {/* <iframe
        src="https://docs.google.com/viewer?url=https://calibre-ebook.com/downloads/demos/demo.docx&embedded=true"
        width="100%"
        height="600px"
      ></iframe> */}
      <iframe
        className="mx-auto"
        src="https://docs.google.com/viewer?url=https://calibre-ebook.com/downloads/demos/demo.docx&embedded=true"
        height="1000"
        width="800"
      ></iframe>
    </main>
  );
}
