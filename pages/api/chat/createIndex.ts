// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { stat } from "fs/promises";
import { join } from "path";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
const uploadDir =
  process.env.NODE_ENV !== "production"
    ? "./public/uploads"
    : join(__dirname, "../../../../", "public", "uploads");

const indexDir =
  process.env.NODE_ENV !== "production"
    ? "./indexes"
    : join(__dirname, "../../../../", "indexes");

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
});
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    const { fileName } = await req.body;
    const indexFile = `${indexDir}/${fileName.split(".pdf")[0]}`;
    try {
      const stats = await stat(indexFile);
      if (stats.isDirectory()) {
        return res.status(200).json({
          status: "ok",
          indexId: fileName.split(".pdf")[0],
        });
      }
    } catch (error: any) {
      if (error.code === "ENOENT") {
        console.error("Creating index for " + fileName);
        const loader = new PDFLoader(`${uploadDir}/${fileName}`, {
          splitPages: false,
        });

        const rawDocs = await loader.load();
        const docs = await textSplitter.splitDocuments(rawDocs);
        const vectorStore = await HNSWLib.fromDocuments(docs, embeddings);
        await vectorStore.save(indexFile);
        return res.status(200).json({
          status: "ok",
          indexId: fileName.split(".pdf")[0],
        });
      } else {
        throw error;
      }
    }
  } catch (error: any) {
    console.error(error);
    res.status(400).json({
      status: "failed",
      error: error.message,
    });
  }
}
