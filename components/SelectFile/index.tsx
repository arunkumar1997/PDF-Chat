import { useState } from "react";
import { useRouter } from "next/router";
import {
  Heading,
  Box,
  Center,
  Text,
  Stack,
  useColorModeValue,
  Card,
  CardBody,
  CardHeader,
  Input,
  Progress,
} from "@chakra-ui/react";

export default function SelectFile() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event: any) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsUploading(true);
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const jsonResponse = await response.json();
      if (jsonResponse && jsonResponse.status == "ok") {
        router.push(`/chat/${jsonResponse.fileName}`);
      }
    } catch (error) {
      console.error(error);
      setIsUploading(false);
    }
  };
  return (
    <Box height={"100%"} marginTop={"10%"}>
      <Center py={6}>
        <Box
          maxW={{
            lg: "50%",
            md: "75%",
            base: "100%",
          }}
          w={"full"}
          maxH={"100%"}
          textAlign={"center"}
        >
          <Card bg={useColorModeValue("gray.100", "gray.900")}>
            <CardHeader>
              <Heading size="md">Chat With Any PDF</Heading>
            </CardHeader>

            <CardBody>
              {isUploading ? (
                <>
                  <Text>Uploading...</Text>
                  <Progress size="xs" isIndeterminate />
                </>
              ) : (
                <Box
                  borderColor="gray.300"
                  borderStyle="dashed"
                  borderWidth="2px"
                  rounded="md"
                  shadow="sm"
                  role="group"
                  transition="all 150ms ease-in-out"
                  _hover={{
                    shadow: "md",
                  }}
                  height="100%"
                  width="100%"
                >
                  <Box position="relative" height="100%" width="100%">
                    <Box height="100%" width="100%">
                      <Stack
                        height="100%"
                        width="100%"
                        display="flex"
                        alignItems="center"
                        justify="center"
                        spacing="4"
                      >
                        <Stack p="8" textAlign="center" spacing="1">
                          <Heading fontSize="lg" fontWeight="bold">
                            Drop PDF file here
                          </Heading>
                          <Text fontWeight="light">or click to upload</Text>
                        </Stack>
                      </Stack>
                    </Box>
                    <Input
                      type="file"
                      height="100%"
                      width="100%"
                      position="absolute"
                      top="0"
                      left="0"
                      opacity="0"
                      aria-hidden="true"
                      onChange={handleFileUpload}
                      accept="application/pdf"
                    />
                  </Box>
                </Box>
              )}
            </CardBody>
          </Card>
        </Box>
      </Center>
    </Box>
  );
}
