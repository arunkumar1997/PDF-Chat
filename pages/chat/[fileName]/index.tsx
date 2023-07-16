import { useState, useEffect } from "react";
import Head from "next/head";
import AppHeader from "@/components/AppHeader";
import ChatComponent from "@/components/Chat";
export default function Chat({ fileName }: any) {
  const [isDocumentLoaded, setIsDocumentLoaded] = useState(false);
  const indexDoc = async () => {
    try {
      const res = await fetch("/api/chat/createIndex", {
        method: "POST",
        body: JSON.stringify({
          fileName,
        }),
        headers: {
          "content-type": "Application/json",
        },
      });
      if (res.ok) {
        const data = await res.json();
        console.log("Data =>", data);
        if (data.status == "ok") setIsDocumentLoaded(true);
      }
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    // indexDoc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Head>
        <title>Chat</title>
        <meta name="description" content="Your personal AI assitant" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <ChatComponent fileName={fileName} />
      </main>
    </>
  );
}
export async function getServerSideProps({ params }: any) {
  // Fetch data from external API
  const { fileName } = params;
  // Pass data to the page via props
  return { props: { fileName } };
}
