import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Session from "@/models/Session";
import WhatsAppSession from "@/models/WhatsAppSession";

const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:5173",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Credentials": "true",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(request: NextRequest) {
  try {
    const { issueType } = await request.json();

    if (!issueType) {
      return NextResponse.json(
        {
          message: "Issue type is required",
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // --------------------------------------------------
    // Get logged-in user's session cookie
    // --------------------------------------------------

    const sessionToken = request.cookies.get(
      "civicseva_session"
    )?.value;

    if (!sessionToken) {
      return NextResponse.json(
        {
          message:
            "You must be logged in to report via WhatsApp",
        },
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }

    await connectDB();

    // --------------------------------------------------
    // Verify login session
    // --------------------------------------------------

    const loginSession = await Session.findOne({
      token: sessionToken,
    });

    if (!loginSession) {
      return NextResponse.json(
        {
          message:
            "Login session expired. Please login again.",
        },
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }

    // --------------------------------------------------
    // Check session expiry
    // --------------------------------------------------

    if (
      new Date() >
      new Date(loginSession.expiresAt)
    ) {
      await Session.deleteOne({
        _id: loginSession._id,
      });

      return NextResponse.json(
        {
          message:
            "Login session expired. Please login again.",
        },
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }

    // --------------------------------------------------
    // Get logged-in user
    // --------------------------------------------------

    const user = await User.findById(
      loginSession.userId
    ).select("_id name mobileNumber");

    if (!user) {
      await Session.deleteOne({
        _id: loginSession._id,
      });

      return NextResponse.json(
        {
          message: "User account not found",
        },
        {
          status: 404,
          headers: corsHeaders,
        }
      );
    }

    // --------------------------------------------------
    // Normalize phone number
    // --------------------------------------------------

    const rawPhoneNumber = String(
      user.mobileNumber
    ).replace(/\D/g, "");

    let phoneNumber = rawPhoneNumber;

    // Indian number stored as 10 digits
    if (phoneNumber.length === 10) {
      phoneNumber = `91${phoneNumber}`;
    }

    // Number already stored with Indian country code
    else if (
      phoneNumber.length === 12 &&
      phoneNumber.startsWith("91")
    ) {
      phoneNumber = phoneNumber;
    }

    // Anything else is invalid
    else {
      return NextResponse.json(
        {
          message: "Invalid mobile number format",
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    if (!phoneNumber) {
      return NextResponse.json(
        {
          message:
            "No valid mobile number found for this account",
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // --------------------------------------------------
    // IMPORTANT:
    // Start a completely NEW WhatsApp complaint session.
    //
    // Delete ALL previous temporary WhatsApp sessions
    // for this phone number, including COMPLETED ones.
    //
    // This does NOT delete complaints from the Complaint
    // collection. It only removes WhatsApp conversation state.
    // --------------------------------------------------

    await WhatsAppSession.deleteMany({
      phoneNumber,
    });

    // --------------------------------------------------
    // Create new WhatsApp reporting session
    // --------------------------------------------------

    const whatsappSession =
      await WhatsAppSession.create({
        phoneNumber,
        issueType,
        step: "DESCRIPTION",
      });

    console.log(
      "WhatsApp reporting session created:",
      whatsappSession._id.toString()
    );

    console.log(
      "WhatsApp phone:",
      phoneNumber
    );

    console.log(
      "WhatsApp issue type:",
      issueType
    );

    // --------------------------------------------------
    // Return success
    // --------------------------------------------------

    return NextResponse.json(
      {
        message:
          "WhatsApp reporting session created",
        sessionId: whatsappSession._id,
        issueType,
      },
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error(
      "WhatsApp session creation error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to start WhatsApp reporting session",
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}