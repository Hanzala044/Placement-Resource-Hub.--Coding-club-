import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();
    const userName = user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "Anonymous Student";

    const { topic, score, total } = await req.json();
    if (!topic || score === undefined || !total) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("quiz_scores")
      .insert({ user_id: userId, user_name: userName, topic, score, total });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save score" },
      { status: 500 }
    );
  }
}
