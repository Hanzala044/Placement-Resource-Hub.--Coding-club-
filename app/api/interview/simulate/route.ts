import { NextResponse } from "next/server";
import { simulateInterview } from "@/lib/gemini";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages, context } = await req.json();
    if (!messages || !context) {
      return NextResponse.json({ error: "Missing messages or context" }, { status: 400 });
    }

    const reply = await simulateInterview(messages, context);
    return NextResponse.json({ text: reply });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Simulation failed" },
      { status: 500 }
    );
  }
}
