// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
import { RetrievalQAChain } from "langchain/chains";
import { BufferMemory } from "langchain/memory";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
const indexDir = "./indexes";

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
});
const store = new Map();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");

  const { prompt, fileName } = await req.body;
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
  let chatData = store.get(fileName);
  if (!chatData) {
    chatData = {};
    const indexFile = `${indexDir}/${fileName.split(".pdf")[0]}`;
    chatData.memory = new BufferMemory({
      memoryKey: "chat_history", // Must be set to "chat_history"
    });
    chatData.vectorStore = await HNSWLib.load(indexFile, embeddings);
  }
  const chain = RetrievalQAChain.fromLLM(
    model,
    chatData.vectorStore.asRetriever()
  );
  // const chain = ConversationalRetrievalQAChain.fromLLM(
  //   model,
  //   chatData.vectorStore.asRetriever(),
  //   { memory: chatData.memory }
  // );
  const inputPrompt = `
  You are an helpfull Assitant. Always give Your response in markdown.
  Human: ${prompt}`;
  await chain.call({ query: inputPrompt }, { callbacks });
  store.set(fileName, chatData);
  res.end();
}
