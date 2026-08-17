import { NextRequest, NextResponse } from "next/server";
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

// Schema stores lowercase severity; ChaosMap expects "Critical" / "High" / "Medium" / "Low"
function normalizeSeverity(severity?: string) {
  const map: Record<string, string> = {
    critical: "Critical",
    high: "High",
    medium: "Medium",
    low: "Low",
  };
  return map[(severity || "").toLowerCase()] || "Medium";
}

// Schema stores "pending" / "complete"; ChaosMap checks for exactly "Resolved"
function normalizeStatus(status?: string) {
  return status === "complete" ? "Resolved" : "Pending";
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    // optional: ?status=pending to only show unresolved issues on the map
    const statusFilter = searchParams.get("status");

    await connectDB();

    const query: Record<string, unknown> = {};
    if (statusFilter === "pending" || statusFilter === "complete") {
      query.status = statusFilter;
    }

    const complaints = await complaintModel
      .find(query)
      .select(
        "issueType description address latitude longitude severity status createdAt"
      )
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();

    const reports = complaints.map((c: any) => ({
      id: String(c._id),
      title: c.issueType,
      category: c.issueType,
      location: c.address,
      latitude: c.latitude ?? null,
      longitude: c.longitude ?? null,
      severity: normalizeSeverity(c.severity),
      status: normalizeStatus(c.status),
      createdAt: c.createdAt,
    }));

    return NextResponse.json(
      {
        message: "Complaints fetched successfully",
        reports,
      },
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("Map complaints error:", error);

    return NextResponse.json(
      { message: "Failed to fetch complaints" },
      { status: 500, headers: corsHeaders }
    );
  }
}
