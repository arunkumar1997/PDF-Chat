import Head from "next/head";
import AppHeader from "@/components/AppHeader";
import SelectFile from "@/components/SelectFile";
export default function Home() {
  return (
    <>
      <Head>
        <title>AI Assistant</title>
        <meta name="description" content="Your personal AI assitant" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <SelectFile />
      </main>
    </>
  );
}
