import { NextRequest, NextResponse } from "next/server";
import { createGovSession } from "@/lib/govSession";

const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:5173",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Credentials": "true",
};

// Handle CORS preflight request
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Username and password are required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const validUsername = process.env.GOV_USERNAME;
    const validPassword = process.env.GOV_PASSWORD;

    if (!validUsername || !validPassword) {
      console.error("GOV_USERNAME or GOV_PASSWORD missing in .env.local");

      return NextResponse.json(
        { success: false, message: "Server not configured" },
        { status: 500, headers: corsHeaders }
      );
    }

    if (
      username.trim().toUpperCase() !== validUsername.toUpperCase() ||
      password !== validPassword
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid ID or password" },
        { status: 401, headers: corsHeaders }
      );
    }

    await createGovSession(validUsername.toUpperCase());

    return NextResponse.json(
      { success: true, message: "Login successful" },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Gov login error:", error);

    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500, headers: corsHeaders }
    );
  }
}