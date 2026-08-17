import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Session from "@/models/Session";
import User from "@/models/User";

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
    // Get session token from browser cookie
    const sessionToken =
      request.cookies.get("civicseva_session")?.value;

    // No cookie = not authenticated
    if (!sessionToken) {
      return NextResponse.json(
        {
          authenticated: false,
        },
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }

    await connectDB();

    // Find session in MongoDB
    const session = await Session.findOne({
      token: sessionToken,
    });

    // Session doesn't exist
    if (!session) {
      return NextResponse.json(
        {
          authenticated: false,
        },
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }

    // Check expiration
    if (new Date() > new Date(session.expiresAt)) {
      await Session.deleteOne({
        _id: session._id,
      });

      return NextResponse.json(
        {
          authenticated: false,
        },
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }

    // Get associated user
    const user = await User.findById(session.userId).select(
      "_id name mobileNumber address"
    );

    // User no longer exists
    if (!user) {
      await Session.deleteOne({
        _id: session._id,
      });

      return NextResponse.json(
        {
          authenticated: false,
        },
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }

    // Session is valid
    return NextResponse.json(
      {
        authenticated: true,

        user: {
          id: user._id,
          name: user.name,
          mobileNumber: user.mobileNumber,
          address: user.address,
        },

        expiresAt: session.expiresAt,
      },
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("Session check error:", error);

    return NextResponse.json(
      {
        authenticated: false,
        message: "Failed to check session",
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}