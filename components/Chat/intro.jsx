import { Box, Container, Heading, Stack, Text } from "@chakra-ui/react";
import { BsFillSendFill, BsSend } from "react-icons/bs";
export default function ChatIntro() {
  return (
    <>
      <Container>
        <Box mt={"10rem"} w={"100%"} h={"100%"}>
          <Stack>
            <Box
              justifyContent={"center"}
              alignItems={"center"}
              textAlign={"center"}
            >
              <Heading>PDF Chat</Heading>
              <Box pt={8}>
                <Text>
                  Welcome to PDF Chat. You have not started conversation yet.
                </Text>
                <Text>
                  You can start asking questions by entering it in below input
                  area.
                </Text>
                <Stack direction={"row"} justifyContent={"center"}>
                  <Text>To send your prompt click on </Text>
                  <Box pt={"0.3rem"}>
                    <BsFillSendFill />
                  </Box>
                </Stack>
              </Box>
            </Box>
          </Stack>
        </Box>
      </Container>
    </>
  );
}
