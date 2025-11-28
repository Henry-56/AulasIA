import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/simulation/analyze - Generate video, analyze with Gemini, and save to DB
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { courseId, videoFile } = body;

        console.log("Starting simulation analysis for course:", courseId);

        // Validate course exists
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: { students: true }
        });

        if (!course) {
            return NextResponse.json(
                { error: "Course not found" },
                { status: 404 }
            );
        }

        console.log(`Found course: ${course.name} with ${course.students.length} students`);

        // Create session record
        const session = await prisma.classSession.create({
            data: {
                courseId,
                duration: 15,
                videoGenerated: true,
                analyzed: false
            }
        });

        console.log("Created session:", session.id);

        // If video file is provided, analyze it
        if (videoFile) {
            // Here you would upload the video to Gemini
            // For now, we'll return the session ID for the client to handle
            return NextResponse.json({
                success: true,
                sessionId: session.id,
                message: "Session created. Upload video to /api/analyze-video for analysis."
            });
        }

        return NextResponse.json({
            success: true,
            sessionId: session.id,
            course: {
                name: course.name,
                studentCount: course.students.length
            }
        });

    } catch (error) {
        console.error("Error in simulation analysis:", error);
        return NextResponse.json(
            { error: "Failed to process simulation", details: String(error) },
            { status: 500 }
        );
    }
}

// Helper function to save Gemini analysis to database
export async function saveAnalysisToDatabase(
    sessionId: string,
    analysisData: any
) {
    try {
        // Update session as analyzed
        await prisma.classSession.update({
            where: { id: sessionId },
            data: { analyzed: true }
        });

        // Create session metrics
        const metrics = await prisma.sessionMetrics.create({
            data: {
                sessionId,
                overallAttentionScore: analysisData.overallAttentionScore || 75,
                participationRate: analysisData.participationRate || 60,
                distractionCount: analysisData.distractionCount || 0,
                distractionTypes: analysisData.distractionTypes || [],
                geminiAnalysis: JSON.stringify(analysisData)
            }
        });

        // Create student metrics if provided
        if (analysisData.students && Array.isArray(analysisData.students)) {
            const session = await prisma.classSession.findUnique({
                where: { id: sessionId },
                include: {
                    course: {
                        include: { students: true }
                    }
                }
            });

            if (session?.course.students) {
                for (const studentData of analysisData.students) {
                    const student = session.course.students[studentData.studentIndex] || session.course.students[0];

                    if (student) {
                        await prisma.studentMetric.create({
                            data: {
                                sessionId,
                                studentId: student.id,
                                attentionState: studentData.attentionState || 'focused',
                                participationType: studentData.participationType === 'null' ? null : studentData.participationType,
                                confidenceScore: studentData.confidenceScore || 0.8,
                                timestamp: 0
                            }
                        });
                    }
                }
            }
        }

        return { success: true, metrics };
    } catch (error) {
        console.error("Error saving analysis to database:", error);
        throw error;
    }
}
