// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
import { BufferMemory } from "langchain/memory";
import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanMessage, SystemMessage } from "langchain/schema";

// export const config = {
//   runtime: "edge",
// };
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
});

const chat = new ChatOpenAI({
  temperature: 0,
  streaming: true,
  openAIApiKey: process.env.OPENAI_API_KEY,
});

const client = new PineconeClient();
let pineconeIndex: any;

const store = new Map();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Content-Encoding", "none");

  const { prompt, fileName } = await req.body;

  if (!pineconeIndex) {
    await client.init({
      apiKey: process.env.PINECONE_API_KEY || "",
      environment: process.env.PINECONE_ENVIRONMENT || "",
    });
    pineconeIndex = client.Index(process.env.PINECONE_INDEX || "");
  }
  const callbacks = [
    {
      async handleLLMNewToken(token: string) {
        res.write(token);
      },
    },
  ];
  const model = new OpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    streaming: true,
  });
  let chatData = store.get(fileName) as {
    memory: any;
    vectorStore: PineconeStore;
  };
  if (!chatData) {
    chatData = {} as { memory: BufferMemory; vectorStore: any };
    chatData.vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex,
    });
  }
  const query = prompt;
  const topK = 5;
  const filter = {
    fileName,
  };
  const similaritySearchData = await chatData.vectorStore.similaritySearch(
    query,
    topK,
    filter
  );

  const context = similaritySearchData.map(
    (doc: { metadata: any; pageContent: string }) => doc.pageContent
  ) as string[];
  const systemMessage = new SystemMessage(
    `You are an helpfull Assitant. Always give Your response in markdown.
    You always refer the below context before answering. If you dont know you will say so, dont give random response.
    Context: ${context.join(" ").replace("\n", "")}`
  );
  const humanMessage = new HumanMessage(prompt);

  const resp = await chat.call([systemMessage, humanMessage], {
    callbacks,
  });
  store.set(fileName, chatData);
  res.end();
}
