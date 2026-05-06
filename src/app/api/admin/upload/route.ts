import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/rbac";
import { uploadDataUri, validateImage } from "@/lib/cloudinary";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    await requirePermission("MANAGE_PRODUCTS");
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
    validateImage({ type: file.type, size: file.size });
    const buf = Buffer.from(await file.arrayBuffer());
    const dataUri = `data:${file.type};base64,${buf.toString("base64")}`;
    const { url, publicId } = await uploadDataUri(dataUri, "valerio/products");
    return NextResponse.json({ url, publicId });
  } catch (e: any) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: e.message ?? "Upload failed" }, { status: 500 });
  }
}
