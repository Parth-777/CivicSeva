import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Complaint from "@/models/complaint";
import cloudinary from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const phoneNumber = formData.get("phoneNumber") as string;
    const issueType = formData.get("issueType") as string;
    const image = formData.get("image") as File | null;

    if (!phoneNumber || !issueType || !image) {
      return NextResponse.json(
        {
          message: "Phone number, issue type and image are required",
        },
        { status: 400 }
      );
    }

    if (!image.type.startsWith("image/")) {
      return NextResponse.json(
        {
          message: "Only image files are allowed",
        },
        { status: 400 }
      );
    }

    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

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

    await connectDB();

    const complaint = await Complaint.create({
      phoneNumber,
      issueType,
      imageUrl,
      status: "pending",
    });

    return NextResponse.json(
      {
        message: "Complaint registered successfully",
        complaint: {
          id: complaint._id,
          phoneNumber: complaint.phoneNumber,
          issueType: complaint.issueType,
          imageUrl: complaint.imageUrl,
          severity: complaint.severity,
          status: complaint.status,
        },
      },
      { status: 201 }
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