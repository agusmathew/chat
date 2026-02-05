import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "../../../../lib/s3";
import { getCurrentUser } from "../../../../lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bucket = process.env.S3_BUCKET ?? "";
const publicBaseUrl =
  process.env.S3_PUBLIC_BASE_URL ??
  (bucket && process.env.AWS_REGION
    ? `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com`
    : "");

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return new Response("Unauthorized", { status: 401 });
  }
  if (!bucket || !publicBaseUrl) {
    return new Response("Missing S3_BUCKET or S3_PUBLIC_BASE_URL", { status: 500 });
  }

  const body = await request.json();
  const fileName = String(body.fileName ?? "").trim();
  const fileType = String(body.fileType ?? "").trim();

  if (!fileName || !fileType) {
    return new Response("Missing fileName or fileType", { status: 400 });
  }

  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const objectKey = `avatars/${currentUser.id}/${Date.now()}-${safeName}`;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: objectKey,
    ContentType: fileType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });
  const publicUrl = `${publicBaseUrl}/${objectKey}`;

  return Response.json({ uploadUrl, publicUrl });
}
