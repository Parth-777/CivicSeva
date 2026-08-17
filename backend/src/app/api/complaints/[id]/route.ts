import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifyGovSession();

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid complaint ID" },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    await connectDB();

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return NextResponse.json(
        { message: "Complaint not found" },
        {
          status: 404,
          headers: corsHeaders,
        }
      );
    }

    return NextResponse.json(
      { complaint },
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("Fetch complaint error:", error);

    return NextResponse.json(
      { message: "Failed to fetch complaint" },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}