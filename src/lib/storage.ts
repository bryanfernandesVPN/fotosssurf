import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { get as getBlob, put as putBlob } from "@vercel/blob";
import { createReadStream, existsSync, mkdirSync, writeFileSync } from "fs";
import { readFile } from "fs/promises";
import path from "path";
import { Readable } from "stream";

const LOCAL_ROOT = path.join(process.cwd(), "storage");

function r2Configured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET_NAME,
  );
}

function blobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function isHttpUrl(key: string): boolean {
  return key.startsWith("http://") || key.startsWith("https://");
}

function getR2Client(): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

function ensureLocalDir(key: string) {
  const full = path.join(LOCAL_ROOT, key);
  mkdirSync(path.dirname(full), { recursive: true });
  return full;
}

/** Returns the stored key (path or absolute URL for Blob). */
export async function putObject(
  key: string,
  body: Buffer,
  contentType: string,
): Promise<string> {
  if (r2Configured()) {
    await getR2Client().send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
    return key;
  }

  if (blobConfigured()) {
    const access = key.startsWith("originals/") ? "private" : "public";
    const result = await putBlob(key, body, {
      access,
      contentType,
      addRandomSuffix: false,
      allowOverwrite: true,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return result.url;
  }

  const full = ensureLocalDir(key);
  writeFileSync(full, body);
  return key;
}

export async function getObjectBuffer(key: string): Promise<Buffer> {
  if (isHttpUrl(key)) {
    if (blobConfigured() && key.includes("blob.vercel-storage.com")) {
      const access = key.includes("/originals/") ? "private" : "public";
      const result = await getBlob(key, {
        access,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      if (!result?.stream) throw new Error(`Blob não encontrado: ${key}`);
      const chunks: Buffer[] = [];
      const reader = result.stream.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(Buffer.from(value));
      }
      return Buffer.concat(chunks);
    }
    const res = await fetch(key);
    if (!res.ok) throw new Error(`Falha ao baixar: ${key}`);
    return Buffer.from(await res.arrayBuffer());
  }

  if (r2Configured()) {
    const res = await getR2Client().send(
      new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: key,
      }),
    );
    const stream = res.Body as Readable;
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }

  const full = path.join(LOCAL_ROOT, key);
  if (!existsSync(full)) throw new Error(`Arquivo não encontrado: ${key}`);
  return readFile(full);
}

export async function getSignedDownloadUrl(
  key: string,
  expiresIn = 3600,
  filename?: string,
): Promise<string> {
  if (isHttpUrl(key)) {
    if (blobConfigured()) {
      const { getDownloadUrl } = await import("@vercel/blob");
      return getDownloadUrl(key);
    }
    return key;
  }

  if (r2Configured()) {
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      ResponseContentDisposition: filename
        ? `attachment; filename="${filename}"`
        : undefined,
    });
    return getSignedUrl(getR2Client(), command, { expiresIn });
  }

  return `/api/media/file?key=${encodeURIComponent(key)}`;
}

export function publicMediaUrl(key: string): string {
  if (isHttpUrl(key)) return key;
  if (r2Configured() && process.env.R2_PUBLIC_URL) {
    return `${process.env.R2_PUBLIC_URL.replace(/\/$/, "")}/${key}`;
  }
  return `/api/media/file?key=${encodeURIComponent(key)}`;
}

export function createReadStreamLocal(key: string) {
  return createReadStream(path.join(LOCAL_ROOT, key));
}

export function localFileExists(key: string): boolean {
  if (isHttpUrl(key)) return true;
  return existsSync(path.join(LOCAL_ROOT, key));
}

export { r2Configured, blobConfigured };
