import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Complaint from "@/models/complaint";
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
        {
          message: "Unauthorized",
        },
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }

    await connectDB();

    const complaints = await Complaint.find()
      .sort({ createdAt: -1 });

    return NextResponse.json(
      {
        complaints,
      },
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error(
      "Fetch complaints list error:",
      error
    );

    return NextResponse.json(
      {
        message: "Failed to fetch complaints",
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}