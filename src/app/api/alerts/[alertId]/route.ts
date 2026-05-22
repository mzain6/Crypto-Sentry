import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { deleteAlert, pauseAlert, resumeAlert } from "@/lib/alerts";

type RouteContext = {
  params: {
    alertId: string;
  };
};

export async function PATCH(request: Request, context: RouteContext) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    action?: "pause" | "resume";
  };

  if (body.action === "pause") {
    await pauseAlert(session.user.id, context.params.alertId);
    return NextResponse.json({ ok: true });
  }

  if (body.action === "resume") {
    await resumeAlert(session.user.id, context.params.alertId);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ message: "Invalid action." }, { status: 400 });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await deleteAlert(session.user.id, context.params.alertId);

  return NextResponse.json({ ok: true });
}
