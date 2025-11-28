const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");
const fs = require("fs");
const path = require("path");

// API Key provided by user
const apiKey = "AIzaSyCMWhjiWFdBZxEb-m_BBQ03xDJy_x-7ZJI";
const genAI = new GoogleGenerativeAI(apiKey);
const fileManager = new GoogleAIFileManager(apiKey);

async function run() {
    const videoPath = path.join(__dirname, "distraction_test.mp4");

    if (!fs.existsSync(videoPath)) {
        console.error("Error: distraction_test.mp4 not found in the current directory.");
        console.error("Please place a video file named 'distraction_test.mp4' in: " + __dirname);
        return;
    }

    console.log("Found video file. Uploading to Gemini...");

    try {
        const uploadResult = await fileManager.uploadFile(videoPath, {
            mimeType: "video/mp4",
            displayName: "Class Session Video Test",
        });

        console.log(`Uploaded file ${uploadResult.file.name} as: ${uploadResult.file.uri}`);

        // Wait for processing
        let file = await fileManager.getFile(uploadResult.file.name);
        process.stdout.write("Processing");
        while (file.state === "PROCESSING") {
            process.stdout.write(".");
            await new Promise((resolve) => setTimeout(resolve, 2000));
            file = await fileManager.getFile(uploadResult.file.name);
        }
        console.log(""); // Newline

        if (file.state === "FAILED") {
            console.error("Video processing failed.");
            return;
        }

        console.log("Video processed. Generating analysis...");

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent([
            "Analyze this 5-second video of a class. Identify if there is any distraction and the reason. Respond in Spanish.",
            {
                fileData: {
                    fileUri: uploadResult.file.uri,
                    mimeType: uploadResult.file.mimeType,
                },
            },
        ]);

        console.log("\n--- Analysis Result ---");
        console.log(result.response.text());
    } catch (error) {
        console.error("Error during execution:", error);
    }
}

run();
