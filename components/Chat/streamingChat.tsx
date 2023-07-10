import { Stack, Avatar, Box, Text, Divider } from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";
import { SiOpenai } from "react-icons/si";

interface StreamingResponseProps {
  text?: string;
}

export default function StreamingResponse({ text }: StreamingResponseProps) {
  return (
    <>
      {text && (
        <Box mb={10}>
          <Divider my={9} />
          <Stack direction={"row"}>
            <Avatar mr={"1rem"} rounded={5} size={"sm"} icon={<SiOpenai />} />
            <ReactMarkdown>{text}</ReactMarkdown>
          </Stack>
        </Box>
      )}
    </>
  );
}
