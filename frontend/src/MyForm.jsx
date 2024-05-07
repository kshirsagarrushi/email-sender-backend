import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Button,
  Heading,
  useColorModeValue,
} from "@chakra-ui/react";
import * as XLSX from "xlsx";
import { useState } from "react";

export default function MyForm() {
  const [subject, setSubject] = useState("");
  const [file, setFile] = useState(null);
  const [emails, setEmails] = useState([]);
  const baseUrl = "https://email-sender-server-dusky.vercel.app";

  const handleUpload = () => {
    if (!file) {
      toast.info("Please select a file");
      return;
    }
    toast.success("Emails are being extracted");
    readAndExtractEmails(file);
  };

  const readAndExtractEmails = (uploadedFile) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const column = "A";
        const emailColumn = Object.keys(sheet).filter((key) =>
          key.startsWith(column)
        );
        const extractedEmails = emailColumn.map((key) => sheet[key].v);
        setEmails(extractedEmails);
      } catch (error) {
        console.error("Error reading file:", error);
        toast.error("Error reading file. Please try again.");
      }
    };

    reader.readAsArrayBuffer(uploadedFile);
  };

  const sendEmail = async () => {
    if (emails.length === 0) {
      toast.error("No emails found. Please upload a file first.");
      return;
    }

    toast.success("Emails are being sent...");

    const baseTemplate = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Invitation to Wolf Den Investors Summit 2024</title>
      </head>
      <body>
        <h1>Welcome to the Wolf Den Investors Summit 2024</h1>
        <p>Hi,</p>
        <p>
          Post our success last year, we are excited to invite you to the Wolf Den Investors Summit being organized on 22 June 2024 at <a href="https://maps.app.goo.gl/YHDrurdFMzR7FzvS6"> Mukesh Patel Auditorium </a> - Vile Parle, Mumbai and would like to invite you in summit.
        </p>
        <img src={baseUrl+'/assets/wolfden1.jpg'} />
        <p>Catch a glimpse of our Mumbai 23 event at <a href="https://www.venturewolf.in">our website</a> and read about the investors and speakers that attended on <a href="https://www.businessupside.com">Business Upside</a>.</p>
        <p>Check out the event highlights video on <a href="https://www.youtube.com">YouTube</a>.</p>
        <p>Don't miss the Mumbai 24 Edition; it will be bigger and better this year!</p>
        <p>Book your tickets now at: <a href="https://allevents.in/mumbai/wolf-den-investors-summit-2024/80002910972804?ref=smdl">Buy Tickets</a></p>
        <p>We look forward to hosting you at the event.</p>
        <img src={baseUrl+'/assets/wolfden2.jpg'}  alt="Wolf Den Event Image" width="500" />
        <p>Thanks & Regards,<br/>Wolf Den Team</p>
        <p>
          [<a href="https://www.venturewolf.in">Website</a>]<br/>
          [Stay in touch with us on <a href="https://www.linkedin.com/company/venturewolf/">LinkedIn</a>]
        </p>
      </body>
      </html>
    `;

    try {
      for (const email of emails) {
        const personalizedTemplate = baseTemplate.replace("XXXXX", email.split("@")[0]);
        const dataSend = {
          subject: subject,
          emails: [email],
          html: personalizedTemplate,
        };

        const res = await fetch(`${baseUrl}/email/sendEmail`, {
          method: "POST",
          body: JSON.stringify(dataSend),
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        if (res.status >= 200 && res.status < 300) {
          console.log(`Email sent to ${email}`);
        } else {
          console.error(`Failed to send email to ${email}. Status code: ${res.status}`);
        }
      }

      toast.success("All emails have been sent successfully!");
    } catch (error) {
      console.error("Error sending emails:", error);
      toast.error("Error sending emails. Please try again.");
    }
  };

  return (
    <Flex
      minH={"100vh"}
      align={"center"}
      justify={"center"}
      bg={useColorModeValue("gray.50", "gray.800")}
    >
      <ToastContainer />
      <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
        <Stack align={"center"}>
          <Heading fontSize={"4xl"}>Send bulk emails with ease!</Heading>
        </Stack>
        <Box
          rounded={"lg"}
          bg={useColorModeValue("white", "gray.700")}
          boxShadow={"lg"}
          p={8}
        >
          <Stack spacing={4}>

            <FormControl id="subject">
              <FormLabel>Subject</FormLabel>
              <Input
                type="text"
                placeholder="Enter the subject here..."
                onChange={(e) => setSubject(e.target.value)}
              />
            </FormControl>

            <FormControl id="file">
              <FormLabel>Choose Excel File</FormLabel>
              <Input
                type="file"
                  accept=".xlsx, .xls"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </FormControl>

            <Stack spacing={10}>
              <Button
                bg={"blue.400"}
                color={"white"}
                _hover={{
                  bg: "blue.500",
                }}
                onClick={handleUpload}
              >
                Upload
              </Button>
            </Stack>

            <Stack spacing={10}>
              <Button
                bg={"blue.400"}
                color={"white"}
                _hover={{
                  bg: "blue.500",
                }}
                onClick={sendEmail}
              >
                Send Email
              </Button>
            </Stack>

          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
}
