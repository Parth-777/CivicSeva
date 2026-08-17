import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Complaint from "@/models/complaint";
import cloudinary from "@/lib/cloudinary";
import twilio from "twilio";



const twilioClient = twilio(
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
    // --------------------------------------------------
    // 1. Read multipart/form-data from frontend
    // --------------------------------------------------
    const formData = await request.formData();

   const phoneNumber = formData.get("phoneNumber") as string;
const issueType = formData.get("issueType") as string;
const description = formData.get("description") as string;
const address = formData.get("address") as string;
const image = formData.get("image") as File | null;
    if (!phoneNumber || !issueType || !description || !address || !image) {
  return NextResponse.json(
    {
      message:
        "Phone number, issue type, description, address and image are required",
    },
    { status: 400 }
  );
}

    // --------------------------------------------------
    // 2. Validate image
    // --------------------------------------------------
    if (!image.type.startsWith("image/")) {
      return NextResponse.json(
        {
          message: "Only image files are allowed",
        },
        { status: 400 }
      );
    }

    // Convert uploaded image to Buffer
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // --------------------------------------------------
    // 3. Send image + description to ML service
    // --------------------------------------------------
    const mlFormData = new FormData();

    const imageBlob = new Blob([buffer], {
      type: image.type,
    });

    mlFormData.append("image", imageBlob, image.name);
    mlFormData.append("text", description);

    console.log("Sending complaint to ML service...");

    const mlResponse = await fetch("http://127.0.0.1:8000/analyze", {
      method: "POST",
      body: mlFormData,
    });

    if (!mlResponse.ok) {
      const mlError = await mlResponse.text();

      console.error("ML service error:", mlError);

      return NextResponse.json(
        {
          message: "ML verification failed",
        },
        { status: 502 }
      );
    }

    const mlResult = await mlResponse.json();

    console.log("ML result:", mlResult);

    // --------------------------------------------------
    // 4. Check ML verification
    // --------------------------------------------------
    if (mlResult.status !== "VALID") {
      return NextResponse.json(
        {
          message: "Complaint could not be verified",
          mlResult,
        },
        { status: 422 }
      );
    }

    // --------------------------------------------------
    // 5. Get severity directly from ML
    // --------------------------------------------------
    const severity = String(mlResult.severity).toLowerCase();

    if (!["low", "medium", "high", "critical"].includes(severity)) {
      console.error("Invalid severity returned by ML:", mlResult.severity);

      return NextResponse.json(
        {
          message: "ML returned an invalid severity",
          mlResult,
        },
        { status: 502 }
      );
    }

    // --------------------------------------------------
    // 6. Upload image to Cloudinary
    //    ONLY after ML says VALID
    // --------------------------------------------------
    console.log("ML validation successful. Uploading image to Cloudinary...");

    const imageUrl = await new Promise<string>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "civicseva/complaints",
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve(result.secure_url);
          } else {
            reject(new Error("Cloudinary upload failed"));
          }
        }
      );

      uploadStream.end(buffer);
    });

    console.log("Image uploaded to Cloudinary:", imageUrl);

    // --------------------------------------------------
    // 7. Connect to MongoDB
    // --------------------------------------------------
    await connectDB();

    // --------------------------------------------------
    // 8. Create complaint in MongoDB
    // --------------------------------------------------
    const complaint = await Complaint.create({
  phoneNumber,
  issueType,
  description,
  address,
  imageUrl,
  severity,
  department: mlResult.department,
  problem: mlResult.problem,
  status: "pending",
});


// Send confirmation SMS
try {
  const recipientNumber = `+91${phoneNumber}`;

  await twilioClient.messages.create({
    body: `Civicseva: Your complaint has been successfully registered. Your Complaint ID is ${complaint._id}. You can track this complaint using this complaint id`,
    from: process.env.TWILIO_PHONE_NUMBER!,
    to: recipientNumber,
  });

  console.log(
    `Complaint confirmation SMS sent successfully to ${recipientNumber}`
  );
} catch (smsError) {
  // Do NOT fail the complaint registration if SMS fails
  console.error(
    "Complaint registered successfully, but SMS sending failed:",
    smsError
  );
}

    // --------------------------------------------------
    // 9. Return successful complaint registration
    // --------------------------------------------------
    return NextResponse.json(
      {
        message: "Complaint registered successfully",
        complaint: {
  id: complaint._id,
  phoneNumber: complaint.phoneNumber,
  issueType: complaint.issueType,
  description: complaint.description,
  address: complaint.address,
  imageUrl: complaint.imageUrl,
  severity: complaint.severity,
  status: complaint.status,
},
        mlResult: {
          status: mlResult.status,
          problem: mlResult.problem,
          department: mlResult.department,
          confidence: mlResult.confidence,
          severity: mlResult.severity,
          severity_score: mlResult.severity_score,
          reasoning: mlResult.reasoning,
        },
      },
      { status: 201 ,headers: corsHeaders}
    );
  } catch (error) {
    console.error("Complaint registration error:", error);

    return NextResponse.json(
      {
        message: "Failed to register complaint",
      },
      { status: 500 }
    );
  }
}