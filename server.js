import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

dotenv.config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

/* 🔹 R2 Client */
const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY,
    secretAccessKey: process.env.R2_SECRET_KEY,
  },
});

/* 🔹 Read index.json */
async function readIndex(bucket, key) {
  try {
    const data = await s3.send(
      new GetObjectCommand({ Bucket: bucket, Key: key })
    );
    return JSON.parse(await data.Body.transformToString());
  } catch {
    return [];
  }
}

/* 🔥 Upload PDFs + update index.json (YEAR IN JSON ONLY) */
app.post("/upload", upload.array("files"), async (req, res) => {
  const { semester, subject, subjectName, year } = req.body;
  const bucket = process.env.R2_BUCKET;

  if (!semester || !subject || !subjectName || !year) {
    return res.status(400).json({ success: false });
  }

  const indexKey = `${semester}/${subject}/index.json`;
  let indexData = await readIndex(bucket, indexKey);

  try {
    for (const file of req.files) {
      const pdfKey = `${semester}/${subject}/${file.originalname}`;

      // upload pdf (folder auto create)
      await s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: pdfKey,
          Body: file.buffer,
          ContentType: "application/pdf",
        })
      );

      // push JSON entry (year ONLY in json)
      if (!indexData.find(p => p.file === file.originalname && p.year === year)) {
        indexData.push({
          name: subjectName,
          year: year,
          file: file.originalname,
        });
      }
    }

    // save index.json
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: indexKey,
        Body: JSON.stringify(indexData, null, 2),
        ContentType: "application/json",
      })
    );

    res.json({ success: true });
  } catch (err) {
    console.error("UPLOAD ERROR 👉", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/", (_, res) => {
  res.send("PYQ Admin Backend Running ✅");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
