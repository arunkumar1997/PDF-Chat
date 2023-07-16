import { Box, Avatar, Stack, Divider } from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SiOpenai } from "react-icons/si";
import { AiOutlineUser } from "react-icons/ai";
import ChatIntro from "./intro";
interface ChatHistoryProps {
  chats: object[];
}

export default function ChatHistory({ chats }: ChatHistoryProps) {
  return (
    <Box>
      {chats && chats.length > 0 ? (
        chats.map((chat: any, index: number) => (
          <Box key={chat.id} mb={10}>
            {index > 0 && <Divider my={9} />}
            <Stack direction={"row"}>
              <Avatar
                rounded={5}
                mr={"1rem"}
                size={"sm"}
                icon={chat.user == "ai" ? <SiOpenai /> : <AiOutlineUser />}
              />
              <Box>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {chat.text}
                </ReactMarkdown>
              </Box>
            </Stack>
          </Box>
        ))
      ) : (
        <ChatIntro />
      )}
    </Box>
  );
}
