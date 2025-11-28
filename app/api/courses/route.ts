import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/courses - List all courses
export async function GET() {
    try {
        const courses = await prisma.course.findMany({
            include: {
                teacher: true,
                students: true,
                _count: {
                    select: { sessions: true }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json({ courses });
    } catch (error) {
        console.error("Error fetching courses:", error);
        return NextResponse.json(
            { error: "Failed to fetch courses" },
            { status: 500 }
        );
    }
}

// POST /api/courses - Create a new course
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, code, description, teacherEmail, studentCount } = body;

        // Find or create teacher
        let teacher = await prisma.teacher.findUnique({
            where: { email: teacherEmail }
        });

        if (!teacher) {
            teacher = await prisma.teacher.create({
                data: {
                    name: teacherEmail.split('@')[0],
                    email: teacherEmail
                }
            });
        }

        // Create course
        const course = await prisma.course.create({
            data: {
                name,
                code,
                description,
                teacherId: teacher.id
            }
        });

        // Create students
        const students = [];
        for (let i = 1; i <= studentCount; i++) {
            const student = await prisma.student.create({
                data: {
                    name: `Estudiante ${i}`,
                    courseId: course.id,
                    avatarType: 'default'
                }
            });
            students.push(student);
        }

        return NextResponse.json({ course, students });
    } catch (error: any) {
        console.error("Error creating course:", error);

        // Handle unique constraint violation (e.g. duplicate course code)
        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: "A course with this code already exists." },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: error.message || "Failed to create course" },
            { status: 500 }
        );
    }
}
