import { IncomingForm } from "formidable";
import { v4 as uuidv4 } from "uuid";

export const config = { api: { bodyParser: false } };
const uploadDir = "./public/uploads";

export default async function handler(req: any, res: any) {
  const form: any = new IncomingForm({
    uploadDir: uploadDir,
    keepExtensions: true,
    filename(name, ext, part, form) {
      return uuidv4() + ext;
    },
  });
  try {
    const fileData: any = await new Promise((resolve, reject) => {
      form.parse(req, (err: any, fields: any, files: any) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });
    const fileName = fileData.files.file[0].newFilename;
    return res.status(200).json({ status: "ok", fileName });
  } catch (error: any) {
    return res.status(400).json({ message: `${error.message}` });
  }
}
