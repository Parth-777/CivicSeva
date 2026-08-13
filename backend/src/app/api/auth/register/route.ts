import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

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
    const { name, mobileNumber, address } = await request.json();

    if (!name || !mobileNumber || !address) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400, headers: corsHeaders }
      );
    }

    await connectDB();

    const existingUser = await User.findOne({ mobileNumber });

    if (existingUser) {
      return NextResponse.json(
        { message: "Mobile number already registered" },
        { status: 409, headers: corsHeaders }
      );
    }

    const user = await User.create({
      name: name.trim(),
      mobileNumber: mobileNumber.trim(),
      address: address.trim(),
    });

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: user._id,
          name: user.name,
          mobileNumber: user.mobileNumber,
          address: user.address,
        },
      },
      {
        status: 201,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("Registration error:", error);

    return NextResponse.json(
      { message: "Registration failed" },
      { status: 500, headers: corsHeaders }
    );
  }
}