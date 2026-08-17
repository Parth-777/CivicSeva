import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import WhatsAppSession from "@/models/WhatsAppSession";
import Complaint from "@/models/complaint";
import cloudinary from "@/lib/cloudinary";

const ML_URL = "http://127.0.0.1:8000/analyze";

function getPhoneNumber(from: string) {
  // Twilio sends:
  // whatsapp:+919168800356

  return from
    .replace("whatsapp:", "")
    .replace("+", "");
}

async function sendWhatsAppMessage(to: string, body: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioWhatsAppNumber =
    process.env.TWILIO_WHATSAPP_NUMBER;

  if (!accountSid || !authToken || !twilioWhatsAppNumber) {
    throw new Error(
      "Twilio WhatsApp environment variables are missing"
    );
  }

  const params = new URLSearchParams();

  params.append(
    "From",
    twilioWhatsAppNumber.startsWith("whatsapp:")
      ? twilioWhatsAppNumber
      : `whatsapp:${twilioWhatsAppNumber}`
  );

  params.append("To", `whatsapp:+${to}`);
  params.append("Body", body);

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(
            `${accountSid}:${authToken}`
          ).toString("base64"),
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    console.error(
      "Twilio WhatsApp send error:",
      errorText
    );

    throw new Error(
      "Failed to send WhatsApp message"
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // --------------------------------------------------
    // 1. Twilio sends webhook data as form-urlencoded
    // --------------------------------------------------

    const formData = await request.formData();

    const from = String(
      formData.get("From") || ""
    );

    const body = String(
      formData.get("Body") || ""
    ).trim();

    const numMedia = Number(
      formData.get("NumMedia") || "0"
    );

    const mediaUrl =
      numMedia > 0
        ? String(
            formData.get("MediaUrl0") || ""
          )
        : "";

    const mediaContentType =
      numMedia > 0
        ? String(
            formData.get(
              "MediaContentType0"
            ) || ""
          )
        : "";

    // --------------------------------------------------
    // WhatsApp LOCATION fields
    //
    // Twilio can send:
    // Latitude
    // Longitude
    // Address
    // Label
    // --------------------------------------------------

    const latitude = String(
      formData.get("Latitude") || ""
    ).trim();

    const longitude = String(
      formData.get("Longitude") || ""
    ).trim();

    const locationAddress = String(
      formData.get("Address") || ""
    ).trim();

    const locationLabel = String(
      formData.get("Label") || ""
    ).trim();

    // --------------------------------------------------
    // 2. Validate sender
    // --------------------------------------------------

    if (!from.startsWith("whatsapp:")) {
      return new NextResponse(
        "Invalid WhatsApp sender",
        {
          status: 400,
        }
      );
    }

    const phoneNumber =
      getPhoneNumber(from);

    console.log(
      "WhatsApp message received"
    );
    console.log(
      "Phone:",
      phoneNumber
    );
    console.log(
      "Body:",
      body
    );
    console.log(
      "Media:",
      mediaUrl
    );
    console.log(
      "Media type:",
      mediaContentType
    );
    console.log(
      "Latitude:",
      latitude
    );
    console.log(
      "Longitude:",
      longitude
    );
    console.log(
      "Location address:",
      locationAddress
    );
    console.log(
      "Location label:",
      locationLabel
    );

    // --------------------------------------------------
    // 3. Connect to MongoDB
    // --------------------------------------------------

    await connectDB();

    // --------------------------------------------------
    // 4. Find user's WhatsApp session
    // --------------------------------------------------

    const session =
      await WhatsAppSession.findOne({
        phoneNumber,
      });

    // --------------------------------------------------
    // No session exists
    // --------------------------------------------------

    if (!session) {
      await sendWhatsAppMessage(
        phoneNumber,
        "Please start your complaint from the CivicSeva website by selecting the complaint category and then choosing Report via WhatsApp."
      );

      return new NextResponse(
        "No WhatsApp session",
        {
          status: 200,
        }
      );
    }

    // --------------------------------------------------
    // 5. DESCRIPTION STEP
    // --------------------------------------------------

    if (
      session.step === "DESCRIPTION"
    ) {
      if (!body) {
        await sendWhatsAppMessage(
          phoneNumber,
          "Please describe the issue first.\n\nFor example:\nBroken railway track near platform 2."
        );

        return new NextResponse(
          "Description required",
          {
            status: 200,
          }
        );
      }

      session.description = body;
      session.step = "IMAGE";

      await session.save();

      await sendWhatsAppMessage(
        phoneNumber,
        `Got it. Your complaint category is "${session.issueType}".\n\nNow please send a photo of the issue.`
      );

      return new NextResponse(
        "Description saved",
        {
          status: 200,
        }
      );
    }

    // --------------------------------------------------
    // 6. IMAGE STEP
    // --------------------------------------------------

    if (session.step === "IMAGE") {
      if (!mediaUrl) {
        await sendWhatsAppMessage(
          phoneNumber,
          "Please send a photo of the issue so that we can verify your complaint."
        );

        return new NextResponse(
          "Image required",
          {
            status: 200,
          }
        );
      }

      if (
        !mediaContentType.startsWith(
          "image/"
        )
      ) {
        await sendWhatsAppMessage(
          phoneNumber,
          "Please send an image/photo only."
        );

        return new NextResponse(
          "Invalid media type",
          {
            status: 200,
          }
        );
      }

      // --------------------------------------------------
      // IMPORTANT:
      // Do NOT run ML yet.
      //
      // We need the user's location first.
      //
      // Temporarily store the Twilio media URL
      // inside imageUrl.
      // It will later be replaced by the
      // Cloudinary URL.
      // --------------------------------------------------

      session.imageUrl = mediaUrl;
      session.step = "LOCATION";

      await session.save();

      await sendWhatsAppMessage(
        phoneNumber,
        "📸 Photo received.\n\nNow please send the location where this issue occurred.\n\nYou can either:\n• Share your WhatsApp location 📍\n• Or type the address/location manually."
      );

      return new NextResponse(
        "Image saved, location required",
        {
          status: 200,
        }
      );
    }

    // --------------------------------------------------
    // 7. LOCATION STEP
    // --------------------------------------------------

    if (
      session.step === "LOCATION"
    ) {
      let address = "";

      // -----------------------------------------------
      // CASE 1:
      // User shared WhatsApp location
      // -----------------------------------------------

      if (
        latitude &&
        longitude
      ) {
        if (locationAddress) {
          address =
            locationAddress;
        } else if (
          locationLabel
        ) {
          address =
            locationLabel;
        } else {
          address =
            `Latitude: ${latitude}, Longitude: ${longitude}`;
        }
      }

      // -----------------------------------------------
      // CASE 2:
      // User typed the address manually
      // -----------------------------------------------

      else if (body) {
        address = body;
      }

      // -----------------------------------------------
      // No location provided
      // -----------------------------------------------

      else {
        await sendWhatsAppMessage(
          phoneNumber,
          "📍 I need the location of the issue.\n\nPlease either share your WhatsApp location or type the address/location."
        );

        return new NextResponse(
          "Location required",
          {
            status: 200,
          }
        );
      }

      // -----------------------------------------------
      // Save address
      // -----------------------------------------------

      session.address = address;
      session.step = "PROCESSING";

      await session.save();

      console.log(
        "WhatsApp address saved:",
        address
      );

      await sendWhatsAppMessage(
        phoneNumber,
        "📍 Location received.\n\nPlease wait while we verify your complaint..."
      );

      // --------------------------------------------------
      // 8. Retrieve stored Twilio image URL
      // --------------------------------------------------

      const storedMediaUrl =
        session.imageUrl;

      if (!storedMediaUrl) {
        throw new Error(
          "WhatsApp image URL is missing from session"
        );
      }

      // --------------------------------------------------
      // 9. Download image from Twilio
      // --------------------------------------------------

      const accountSid =
        process.env.TWILIO_ACCOUNT_SID;

      const authToken =
        process.env.TWILIO_AUTH_TOKEN;

      if (
        !accountSid ||
        !authToken
      ) {
        throw new Error(
          "TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN is missing"
        );
      }

      const imageResponse =
        await fetch(
          storedMediaUrl,
          {
            headers: {
              Authorization:
                "Basic " +
                Buffer.from(
                  `${accountSid}:${authToken}`
                ).toString(
                  "base64"
                ),
            },
          }
        );

      if (
        !imageResponse.ok
      ) {
        throw new Error(
          "Failed to download image from Twilio"
        );
      }

      const imageArrayBuffer =
        await imageResponse.arrayBuffer();

      const imageBuffer =
        Buffer.from(
          imageArrayBuffer
        );

      // Get actual content type from Twilio response
      const imageContentType =
        imageResponse.headers.get(
          "content-type"
        ) ||
        mediaContentType ||
        "image/jpeg";

      // --------------------------------------------------
      // 10. Send image + description to ML service
      // --------------------------------------------------

      const mlFormData =
        new FormData();

      const imageBlob =
        new Blob(
          [imageBuffer],
          {
            type: imageContentType,
          }
        );

      mlFormData.append(
        "image",
        imageBlob,
        `whatsapp-${Date.now()}.jpg`
      );

      mlFormData.append(
        "text",
        session.description || ""
      );

      console.log(
        "Sending WhatsApp complaint to ML service..."
      );

      const mlResponse =
        await fetch(
          ML_URL,
          {
            method: "POST",
            body: mlFormData,
          }
        );

      // --------------------------------------------------
      // ML request failed
      // --------------------------------------------------

      if (
        !mlResponse.ok
      ) {
        const mlError =
          await mlResponse.text();

        console.error(
          "WhatsApp ML service error:",
          mlError
        );

        session.step =
          "IMAGE";

        await session.save();

        await sendWhatsAppMessage(
          phoneNumber,
          "We could not verify the photo right now. Please try sending the photo again."
        );

        return new NextResponse(
          "ML verification failed",
          {
            status: 200,
          }
        );
      }

      const mlResult =
        await mlResponse.json();

      console.log(
        "WhatsApp ML result:",
        mlResult
      );

      // --------------------------------------------------
      // 11. ML verification
      // --------------------------------------------------

      if (
        mlResult.status !==
        "VALID"
      ) {
        session.step =
          "IMAGE";

        await session.save();

        await sendWhatsAppMessage(
          phoneNumber,
          "The submitted image could not be verified as a valid complaint.\n\nPlease send another clear photo of the issue."
        );

        return new NextResponse(
          "Complaint could not be verified",
          {
            status: 200,
          }
        );
      }

      // --------------------------------------------------
      // 12. Get severity from ML
      // --------------------------------------------------

      const severity =
        String(
          mlResult.severity
        ).toLowerCase();

      if (
        ![
          "low",
          "medium",
          "high",
          "critical",
        ].includes(severity)
      ) {
        console.error(
          "Invalid severity returned by ML:",
          mlResult.severity
        );

        session.step =
          "IMAGE";

        await session.save();

        await sendWhatsAppMessage(
          phoneNumber,
          "We could not determine the severity of your complaint. Please try again later."
        );

        return new NextResponse(
          "Invalid ML severity",
          {
            status: 200,
          }
        );
      }

      // --------------------------------------------------
      // 13. Upload image to Cloudinary
      // --------------------------------------------------

      console.log(
        "ML validation successful. Uploading WhatsApp image to Cloudinary..."
      );

      const imageUrl =
        await new Promise<string>(
          (
            resolve,
            reject
          ) => {
            const uploadStream =
              cloudinary.uploader.upload_stream(
                {
                  folder:
                    "civicseva/complaints",
                  resource_type:
                    "image",
                },
                (
                  error,
                  result
                ) => {
                  if (
                    error
                  ) {
                    reject(
                      error
                    );
                  } else if (
                    result
                  ) {
                    resolve(
                      result.secure_url
                    );
                  } else {
                    reject(
                      new Error(
                        "Cloudinary upload failed"
                      )
                    );
                  }
                }
              );

            uploadStream.end(
              imageBuffer
            );
          }
        );

      console.log(
        "WhatsApp image uploaded:",
        imageUrl
      );

      // --------------------------------------------------
      // 14. Create complaint in MongoDB
      // --------------------------------------------------

      const complaint =
        await Complaint.create({
          phoneNumber,
          issueType:
            session.issueType,
          description:
            session.description,
          imageUrl,
          severity,
          status: "pending",

          // REAL ADDRESS / LOCATION
          address:
            session.address,
        });

      console.log(
        "WhatsApp complaint created:",
        complaint._id.toString()
      );

      // --------------------------------------------------
      // 15. Mark WhatsApp session completed
      // --------------------------------------------------

      session.imageUrl =
        imageUrl;

      session.step =
        "COMPLETED";

      await session.save();

      // --------------------------------------------------
      // 16. Send complaint ID to user
      // --------------------------------------------------

      await sendWhatsAppMessage(
        phoneNumber,
        `✅ Your complaint has been successfully registered.\n\nComplaint ID: ${complaint._id}\n\nIssue: ${session.issueType}\nSeverity: ${severity}\nStatus: Pending\nLocation: ${session.address}\n\nPlease keep this Complaint ID for tracking your complaint.`
      );

      return new NextResponse(
        "Complaint registered successfully",
        {
          status: 200,
        }
      );
    }

    // --------------------------------------------------
    // 17. PROCESSING STEP
    // --------------------------------------------------

    if (
      session.step ===
      "PROCESSING"
    ) {
      await sendWhatsAppMessage(
        phoneNumber,
        "Your complaint is currently being processed. Please wait."
      );

      return new NextResponse(
        "Complaint processing",
        {
          status: 200,
        }
      );
    }

    // --------------------------------------------------
    // 18. COMPLETED SESSION
    // --------------------------------------------------

    if (
      session.step ===
      "COMPLETED"
    ) {
      await sendWhatsAppMessage(
        phoneNumber,
        "Your previous complaint has already been registered. Please start a new complaint from the CivicSeva website."
      );

      return new NextResponse(
        "Session already completed",
        {
          status: 200,
        }
      );
    }

    // --------------------------------------------------
    // 19. Unexpected state
    // --------------------------------------------------

    return new NextResponse(
      "Webhook processed",
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "WhatsApp webhook error:",
      error
    );

    return new NextResponse(
      "WhatsApp webhook error",
      {
        status: 500,
      }
    );
  }
}