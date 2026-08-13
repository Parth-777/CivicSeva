import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:5173",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
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

    if (!mobileNumber || !otp) {
      return NextResponse.json(
        { message: "Mobile number and OTP are required" },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    const phoneNumber = `+91${mobileNumber}`;

    const verificationCheck = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
      .verificationChecks.create({
        to: phoneNumber,
        code: otp,
      });

    if (verificationCheck.status !== "approved") {
      return NextResponse.json(
        { message: "Invalid or expired OTP" },
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }

    await connectDB();

    const user = await User.findOne({ mobileNumber });

    if (!user) {
      return NextResponse.json(
        { message: "Mobile number is not registered" },
        {
          status: 404,
          headers: corsHeaders,
        }
      );
    }

    return NextResponse.json(
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
  } catch (error) {
    console.error("Verify OTP error:", error);

    return NextResponse.json(
      { message: "Failed to verify OTP" },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}