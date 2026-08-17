import { NextResponse } from "next/server";
import { destroyGovSession } from "@/lib/govSession";

export async function POST() {
  await destroyGovSession();
  return NextResponse.json({ success: true });
}