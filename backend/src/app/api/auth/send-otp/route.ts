import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

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
    const { mobileNumber } = await request.json();

    if (!mobileNumber) {
      return NextResponse.json(
        { message: "Mobile number is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate Indian 10-digit mobile number
    if (!/^\d{10}$/.test(mobileNumber)) {
      return NextResponse.json(
        { message: "Please enter a valid 10-digit mobile number" },
        { status: 400, headers: corsHeaders }
      );
    }

    /*
     * IMPORTANT:
     * We intentionally DO NOT check MongoDB here.
     *
     * Any citizen can request an OTP, even if they have
     * never used CivicSewa before.
     *
     * The citizen will be created/logged in after successful
     * OTP verification.
     */

    const phoneNumber = `+91${mobileNumber}`;

    const verification = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
      .verifications.create({
        to: phoneNumber,
        channel: "sms",
      });

    return NextResponse.json(
      {
        message: "OTP sent successfully",
        status: verification.status,
      },
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("Send OTP error:", error);

    return NextResponse.json(
      { message: "Failed to send OTP" },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}