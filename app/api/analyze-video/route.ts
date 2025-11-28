import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import os from "os";

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);
const fileManager = new GoogleAIFileManager(apiKey);


export async function POST(req: NextRequest) {
    console.log("API Route /api/analyze-video called");
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            console.error("No file uploaded");
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        // Save file temporarily
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const tempFilePath = path.join(os.tmpdir(), `upload-${Date.now()}-${file.name}`);
        await writeFile(tempFilePath, buffer);

        console.log(`File saved to ${tempFilePath}, uploading to Gemini...`);

        // Upload to Gemini
        const uploadResult = await fileManager.uploadFile(tempFilePath, {
            mimeType: file.type || "video/mp4",
            displayName: "Class Session Analysis",
        });

        console.log(`File uploaded: ${uploadResult.file.uri}`);

        // Wait for processing
        let geminiFile = await fileManager.getFile(uploadResult.file.name);
        while (geminiFile.state === "PROCESSING") {
            console.log("Processing video...");
            await new Promise((resolve) => setTimeout(resolve, 1000));
            geminiFile = await fileManager.getFile(uploadResult.file.name);
        }

        if (geminiFile.state === "FAILED") {
            console.error("Gemini processing failed");
            await unlink(tempFilePath);
            return NextResponse.json({ error: "Video processing failed" }, { status: 500 });
        }

        console.log("Video processed, generating content...");

        // Analyze with gemini-1.5-flash-002 (specific stable version)
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
        const result = await model.generateContent([
            `Analiza este video de una clase. Detecta TODOS los estudiantes visibles y para cada uno identifica:
            1. Su nivel de atención (0-100)
            2. Si está participando (levantando la mano, tomando notas, etc.)
            3. Cualquier distracción (usando celular, distraído, cansado)
            
            Responde SOLO en formato JSON con esta estructura:
            {
              "overallAttentionScore": número (promedio 0-100),
              "participationRate": número (porcentaje),
              "distractionCount": número,
              "distractionTypes": ["tipo1", "tipo2"],
              "students": [
                {
                  "studentIndex": número,
                  "attentionState": "focused|distracted|tired|using_phone|raising_hand|taking_notes",
                  "participationType": "raising_hand|taking_notes|answering|null",
                  "confidenceScore": número (0-1)
                }
              ]
            }`,
            {
                fileData: {
                    fileUri: uploadResult.file.uri,
                    mimeType: uploadResult.file.mimeType,
                },
            },
        ]);



        const responseText = result.response.text();
        console.log("Gemini raw response:", responseText);

        // Parse JSON response
        let analysis;
        try {
            // Remove markdown code blocks if present
            const cleanText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            analysis = JSON.parse(cleanText);
        } catch (parseError) {
            console.error("JSON parse error:", parseError);
            // Fallback to text response
            analysis = { rawText: responseText, error: "Failed to parse JSON" };
        }

        console.log("Analysis complete:", analysis);


        // Cleanup
        await unlink(tempFilePath);

        return NextResponse.json({ analysis });
    } catch (error) {
        console.error("Error processing video:", error);
        if (error instanceof Error) {
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
        }
        return NextResponse.json({ error: "Internal server error", details: String(error) }, { status: 500 });
    }
}
