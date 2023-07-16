import { useState, useRef, useEffect, KeyboardEvent } from "react";
import {
  Box,
  Button,
  Container,
  InputGroup,
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
  const inputRef = useRef<any>(null);
  const [rows, setRows] = useState(1);

  const addHumanMessage = (message: string) => {
    chatMessages.push({
      id: randomUUID(),
      user: "human",
      text: message,
    });
    setChatMessages(chatMessages);
    window.sessionStorage.setItem(fileName, JSON.stringify(chatMessages));
  };
  const addAiMessage = (message: string) => {
    chatMessages.push({
      id: randomUUID(),
      user: "ai",
      text: message,
    });
    setChatMessages(chatMessages);
    window.sessionStorage.setItem(fileName, JSON.stringify(chatMessages));
  };

  const handlePromptInput = (e: any) => {
    const { value } = e.target;
    setPrompt(value);
    const textareaRows = value.split("\n").length;
    setRows(textareaRows);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && event.shiftKey) {
      console.log("Adding New Like");
      setPrompt((prevVal: any) => prevVal + "\n");
    }
    if (
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
    if (chatMessages.length === 0 && fileName) {
      const messages = window.sessionStorage.getItem(fileName);
      if (messages) {
        setChatMessages(JSON.parse(messages));
      }
    }
    boxRef.current.scrollTop = boxRef.current.scrollHeight;
    if (!isStreamingResponse) {
      inputRef.current.focus();
    }
  }, [aiResponse, chatMessages.length, fileName, isStreamingResponse]);

  const shouldAddScrollbar =
    boxRef.current?.scrollHeight > boxRef.current?.clientHeight;
  return (
    <Container maxWidth="100%">
      <Box w={"100%"} h={"100vh"}>
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
            <Container
              maxWidth={{
                sm: "100%",
                md: "75%",
                lg: "55%",
                xl: "55%",
                "2xl": "55%",
              }}
              mt={10}
            >
              <ChatHistory chats={chatMessages} />
              {isStreamingResponse && <StreamingResponse text={aiResponse} />}
            </Container>
          </Box>
          <Box width={"100%"} pb={6} pt={2}>
            <Stack direction={"row"} justify={"center"}>
              <Box
                width={{
                  sm: "100%",
                  md: "75%",
                  xl: "50%",
                  lg: "50%",
                  "2xl": "50%",
                }}
                bg={useColorModeValue("gray.100", "gray.900")}
                p={1}
                rounded={6}
                boxShadow={"xl"}
              >
                <InputGroup h={"100%"} border={"none"}>
                  <Textarea
                    ref={inputRef}
                    onKeyDown={handleKeyDown}
                    border={"none"}
                    value={prompt}
                    style={{
                      resize: "none",
                    }}
                    rows={rows}
                    disabled={isStreamingResponse}
                    pr={9}
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
