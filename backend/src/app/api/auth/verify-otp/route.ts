import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Session from "@/models/Session";
import crypto from "crypto";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

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
    const { mobileNumber, otp } = await request.json();

    // -----------------------------------------
    // VALIDATE INPUT
    // -----------------------------------------

    if (!mobileNumber || !otp) {
      return NextResponse.json(
        {
          message: "Mobile number and OTP are required",
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    if (!/^\d{10}$/.test(mobileNumber)) {
      return NextResponse.json(
        {
          message: "Please enter a valid 10-digit mobile number",
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // -----------------------------------------
    // VERIFY OTP USING TWILIO
    // -----------------------------------------

    const phoneNumber = `+91${mobileNumber}`;

    const verificationCheck = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
      .verificationChecks.create({
        to: phoneNumber,
        code: otp,
      });

    // -----------------------------------------
    // OTP FAILED
    // -----------------------------------------

    if (verificationCheck.status !== "approved") {
      return NextResponse.json(
        {
          message: "Invalid or expired OTP",
        },
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }

    // -----------------------------------------
    // CONNECT TO DATABASE
    // -----------------------------------------

    await connectDB();

    // -----------------------------------------
    // FIND EXISTING USER
    // -----------------------------------------

    let user = await User.findOne({ mobileNumber });

    // -----------------------------------------
    // NEW CITIZEN
    // -----------------------------------------
    //
    // If the mobile number does not exist,
    // automatically create a citizen account.
    //
    // There is NO registration step anymore.
    //

    if (!user) {
      user = await User.create({
        mobileNumber,
        name: "Citizen",
      });
    }

    // -----------------------------------------
    // CREATE SESSION
    // -----------------------------------------

    const sessionToken = crypto.randomBytes(32).toString("hex");

    const expiresAt = new Date(
      Date.now() + 30 * 60 * 60 * 1000
    );

    await Session.create({
      userId: user._id,
      token: sessionToken,
      expiresAt,
    });

    // -----------------------------------------
    // CREATE RESPONSE
    // -----------------------------------------

    const response = NextResponse.json(
      {
        message: "Login successful",

        user: {
          id: user._id,
          name: user.name,
          mobileNumber: user.mobileNumber,
          address: user.address,
        },
      },
      {
        status: 200,
        headers: corsHeaders,
      }
    );

    // -----------------------------------------
    // SET HTTP-ONLY SESSION COOKIE
    // -----------------------------------------

    response.cookies.set("civicseva_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    });

    return response;

  } catch (error) {
    console.error("Verify OTP error:", error);

    return NextResponse.json(
      {
        message: "Failed to verify OTP",
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}