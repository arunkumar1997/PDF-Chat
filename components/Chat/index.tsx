import { useState, useRef, useEffect, KeyboardEvent } from "react";
import {
  Box,
  Button,
  Container,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  useColorMode,
  useColorModeValue,
  Textarea,
} from "@chakra-ui/react";
import { BsFillSendFill, BsSend } from "react-icons/bs";
import StreamingResponse from "./streamingChat";
import ChatHistory from "@/components/Chat/chatHistory";
import { v4 as randomUUID } from "uuid";

interface ChatComponentProps {
  fileName: string;
}

export default function ChatComponent({ fileName }: ChatComponentProps) {
  const { colorMode } = useColorMode();
  const [chatMessages, setChatMessages] = useState<object[]>([]);
  const [isStreamingResponse, setIsStreamingResponse] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [prompt, setPrompt] = useState("");
  const boxRef = useRef<any>(null);
  const [rows, setRows] = useState(1);

  const addHumanMessage = (message: string) => {
    chatMessages.push({
      id: randomUUID(),
      user: "human",
      text: message,
    });
    setChatMessages(chatMessages);
    console.log("Setting Human resp=>", chatMessages);
  };
  const addAiMessage = (message: string) => {
    chatMessages.push({
      id: randomUUID(),
      user: "ai",
      text: message,
    });
    setChatMessages(chatMessages);
  };

  const handlePromptInput = (e: any) => {
    const { value } = e.target;
    setPrompt(value);
    const textareaRows = value.split("\n").length;
    setRows(textareaRows);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && event.shiftKey) {
      setPrompt((prevVal: any) => prevVal + "\n");
    } else if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.altKey &&
      !event.ctrlKey
    ) {
      handleSendPrompt();
    }
  };

  const handleSendPrompt = async () => {
    try {
      if (!prompt) {
        alert("please enter prompt");
        return;
      }
      addHumanMessage(prompt);
      setIsStreamingResponse(true);
      const response: any = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({
          fileName,
          prompt,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const reader = response.body.getReader();
      let resp = "";
      if (!response.ok) {
        throw new Error("Something went Wrong!");
      }
      const decoder = new TextDecoder("utf-8");
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log("Done");
          addAiMessage(resp);
          setIsStreamingResponse(false);
          break;
        }
        const chunk = decoder.decode(value);
        resp += chunk;
        setAiResponse(resp);
      }
    } catch (error) {
      console.error(error);
      setIsStreamingResponse(false);
    } finally {
      setPrompt("");
      setAiResponse("");
      setRows(1);
    }
  };

  useEffect(() => {
    boxRef.current.scrollTop = boxRef.current.scrollHeight;
  }, [aiResponse, chatMessages.length]);

  const shouldAddScrollbar =
    boxRef.current?.scrollHeight > boxRef.current?.clientHeight;
  return (
    <Container maxWidth="100%">
      <Box w={"100%"} h={"calc(100vh - 4rem)"}>
        <Stack
          direction={"column"}
          justify={"space-between"}
          height={"100%"}
          width={"100%"}
        >
          <Box
            ref={boxRef}
            overflowY={shouldAddScrollbar ? "scroll" : "auto"}
            style={{
              ...(shouldAddScrollbar ? { scrollbarWidth: "thin" } : {}),
            }}
          >
            <Container maxWidth={"55%"} mt={10}>
              <ChatHistory chats={chatMessages} />
              {isStreamingResponse && <StreamingResponse text={aiResponse} />}
              <div></div>
            </Container>
          </Box>
          <Box width={"100%"} pb={8}>
            <Stack direction={"row"} justify={"center"}>
              <Box
                width={"50%"}
                bg={useColorModeValue("gray.100", "gray.900")}
                p={1}
                rounded={6}
                boxShadow={"xl"}
              >
                <InputGroup h={"100%"} border={"none"}>
                  <Textarea
                    onKeyDown={handleKeyDown}
                    border={"none"}
                    value={prompt}
                    style={{
                      resize: "none",
                    }}
                    rows={rows}
                    pr={9}
                    disabled={isStreamingResponse}
                    onChange={handlePromptInput}
                    placeholder="Enter Prompt"
                    _focus={{
                      boxShadow: "none",
                    }}
                  />
                  <Stack
                    direction={"column"}
                    h={"100%"}
                    justifyContent={"flex-end"}
                  >
                    <Button
                      onClick={handleSendPrompt}
                      isLoading={isStreamingResponse == true}
                      background={"none"}
                      _hover={{
                        background: "none",
                      }}
                      p={0}
                      m={0}
                      leftIcon={
                        colorMode == "dark" ? <BsSend /> : <BsFillSendFill />
                      }
                    ></Button>
                  </Stack>
                </InputGroup>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Container>
  );
}
