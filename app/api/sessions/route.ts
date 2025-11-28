import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/sessions - List sessions for a course
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const courseId = searchParams.get("courseId");

        const where = courseId ? { courseId } : {};

        const sessions = await prisma.classSession.findMany({
            where,
            include: {
                course: true,
                metrics: true,
                studentMetrics: {
                    include: {
                        student: true
                    }
                }
            },
            orderBy: {
                date: 'desc'
            },
            take: 20
        });

        return NextResponse.json({ sessions });
    } catch (error) {
        console.error("Error fetching sessions:", error);
        return NextResponse.json(
            { error: "Failed to fetch sessions" },
            { status: 500 }
        );
    }
}

// POST /api/sessions - Create a new session (triggered after video generation)
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { courseId, duration, analyzed, metricsData } = body;

        // Create session
        const session = await prisma.classSession.create({
            data: {
                courseId,
                duration: duration || 15,
                videoGenerated: true,
                analyzed: analyzed || false
            }
        });

        // If we have metrics data, create metrics
        if (metricsData) {
            const metrics = await prisma.sessionMetrics.create({
                data: {
                    sessionId: session.id,
                    overallAttentionScore: metricsData.overallAttentionScore,
                    participationRate: metricsData.participationRate,
                    distractionCount: metricsData.distractionCount,
                    distractionTypes: metricsData.distractionTypes || [],
                    geminiAnalysis: metricsData.geminiAnalysis || ""
                }
            });

            // Create student metrics if provided
            if (metricsData.students && Array.isArray(metricsData.students)) {
                const course = await prisma.course.findUnique({
                    where: { id: courseId },
                    include: { students: true }
                });

                for (const studentData of metricsData.students) {
                    const student = course?.students[studentData.studentIndex] || course?.students[0];
                    if (student) {
                        await prisma.studentMetric.create({
                            data: {
                                sessionId: session.id,
                                studentId: student.id,
                                attentionState: studentData.attentionState,
                                participationType: studentData.participationType === 'null' ? null : studentData.participationType,
                                confidenceScore: studentData.confidenceScore,
                                timestamp: 0
                            }
                        });
                    }
                }
            }

            return NextResponse.json({ session, metrics });
        }

        return NextResponse.json({ session });
    } catch (error) {
        console.error("Error creating session:", error);
        return NextResponse.json(
            { error: "Failed to create session", details: String(error) },
            { status: 500 }
        );
    }
}
