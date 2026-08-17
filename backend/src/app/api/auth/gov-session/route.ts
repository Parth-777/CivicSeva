import { NextResponse } from "next/server";
import { verifyGovSession } from "@/lib/govSession";

const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:5173",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Credentials": "true",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET() {
  try {
    const session = await verifyGovSession();

    if (!session) {
      return NextResponse.json(
        { authenticated: false },
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }

    return NextResponse.json(
      {
        authenticated: true,
        username: session.username,
      },
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("Gov session error:", error);

    return NextResponse.json(
      {
        authenticated: false,
        message: "Unable to verify government session",
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}