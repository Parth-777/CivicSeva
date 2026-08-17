import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import complaintModel from "@/models/complaint";

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

export async function GET(request: NextRequest) {
  try {
    // Get complaint ID from URL
    const { searchParams } = new URL(request.url);
    const complaintId = searchParams.get("id");

    // Validate ID
    if (!complaintId) {
      return NextResponse.json(
        {
          message: "Complaint ID is required",
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(complaintId)) {
      return NextResponse.json(
        {
          message: "Invalid complaint ID",
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Connect to MongoDB
    await connectDB();

    // Find complaint
    const complaint = await complaintModel
      .findById(complaintId)
      .lean();

    // Complaint not found
    if (!complaint) {
      return NextResponse.json(
        {
          message: "Complaint not found",
        },
        {
          status: 404,
          headers: corsHeaders,
        }
      );
    }

    // Return complaint details
    return NextResponse.json(
      {
        message: "Complaint found successfully",
        complaint: {
          _id: complaint._id,
          phoneNumber: complaint.phoneNumber,
          issueType: complaint.issueType,
          description: complaint.description,
          location: complaint.address,
          imageUrl: complaint.imageUrl,
          severity: complaint.severity,
          status: complaint.status,
          createdAt: complaint.createdAt,
          updatedAt: complaint.updatedAt,
        },
      },
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("Track complaint error:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch complaint",
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}