import { v4 as uuidv4 } from "uuid";
import { IncomingForm } from "formidable";
import { Document } from "langchain/document";
import { PineconeClient } from "@pinecone-database/pinecone";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export const config = { api: { bodyParser: false } };

const client = new PineconeClient();

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
});
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
});

export default async function handler(req: any, res: any) {
  const form: any = new IncomingForm({
    keepExtensions: true,
    filename(name, ext, part, form) {
      return uuidv4() + ext;
    },
  });
  try {
    const fileData: any = await new Promise(async (resolve, reject) => {
      form.parse(req, (err: any, fields: any, files: any) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });
    const fileName = fileData.files.file[0].newFilename;
    const filePath = fileData.files.file[0].filepath;
    const loader = new PDFLoader(filePath);
    const rawDocs = await loader.load();
    const docs = await textSplitter.splitDocuments(rawDocs);
    const newDocs = docs.map(
      (doc) =>
        new Document({
          metadata: {
            fileName,
          },
          pageContent: doc.pageContent,
        })
    );
    await client.init({
      apiKey: process.env.PINECONE_API_KEY || "",
      environment: process.env.PINECONE_ENVIRONMENT || "",
    });
    const pineconeIndex = client.Index(process.env.PINECONE_INDEX || "");
    await PineconeStore.fromDocuments(newDocs, embeddings, {
      pineconeIndex,
    });
    return res.status(200).json({ status: "ok", fileName });
  } catch (error: any) {
    return res.status(400).json({ message: `${error.message}` });
  }
}
