import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { updateProfileImage } from "@/lib/profile";

const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = new Set(["image/jpeg", "image/png"]);

function getExtension(file: File) {
  if (file.type === "image/png") {
    return "png";
  }

  return "jpg";
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("avatar");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { message: "Profile picture is required." },
      { status: 400 },
    );
  }

  if (!ALLOWED_AVATAR_TYPES.has(file.type)) {
    return NextResponse.json(
      { message: "Only JPEG and PNG profile pictures are allowed." },
      { status: 400 },
    );
  }

  if (file.size > MAX_AVATAR_SIZE_BYTES) {
    return NextResponse.json(
      { message: "Profile picture must be 2MB or smaller." },
      { status: 400 },
    );
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "profiles");
  await mkdir(uploadDir, { recursive: true });

  const extension = getExtension(file);
  const filename = `${session.user.id}-${Date.now()}.${extension}`;
  const filepath = path.join(uploadDir, filename);
  const arrayBuffer = await file.arrayBuffer();

  await writeFile(filepath, Buffer.from(arrayBuffer));

  const imageUrl = `/uploads/profiles/${filename}`;
  const user = await updateProfileImage(session.user.id, imageUrl);

  return NextResponse.json({ imageUrl, user });
}
