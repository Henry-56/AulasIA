"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { PlayIcon, Users, BookOpen, PlusCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Course {
    id: string
    name: string
    code: string
    students: any[]
    _count?: { sessions: number }
}

interface CourseFilterProps {
    onCourseSelect: (courseId: string) => void
    selectedCourseId?: string
}

export default function CourseSelector({ onCourseSelect, selectedCourseId }: CourseFilterProps) {
    const { toast } = useToast()
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)
    const [showCreateForm, setShowCreateForm] = useState(false)

    useEffect(() => {
        fetchCourses()
    }, [])

    const fetchCourses = async () => {
        try {
            const res = await fetch("/api/courses")
            const data = await res.json()
            setCourses(data.courses || [])
        } catch (error) {
            console.error("Error fetching courses:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateCourse = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)

        try {
            const res = await fetch("/api/courses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.get("name"),
                    code: formData.get("code"),
                    description: formData.get("description"),
                    teacherEmail: formData.get("teacherEmail") || "teacher@example.com",
                    studentCount: parseInt(formData.get("studentCount") as string) || 12,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                console.error("API Error:", data)
                toast({
                    title: "Error al crear curso",
                    description: data.error || 'Error desconocido',
                    variant: "destructive",
                })
                return
            }

            setShowCreateForm(false)
            await fetchCourses() // Refresh the course list
            onCourseSelect(data.course.id)
            toast({
                title: "Curso Creado",
                description: `El curso "${data.course.name}" ha sido creado exitosamente.`,
            })
        } catch (error) {
            console.error("Error creating course:", error)
            toast({
                title: "Error de conexión",
                description: "No se pudo conectar con el servidor.",
                variant: "destructive",
            })
        }
    }

    if (loading) {
        return (
            <Card className="p-6 bg-card border-border">
                <p className="text-muted-foreground">Cargando cursos...</p>
            </Card>
        )
    }

    const selectedCourse = courses.find((c) => c.id === selectedCourseId)

    return (
        <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <BookOpen className="text-primary" size={24} />
                    Seleccionar Curso
                </h2>
                <Button
                    size="sm"
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                    <PlusCircle size={16} className="mr-2" />
                    Nuevo Curso
                </Button>
            </div>

            {showCreateForm && (
                <form onSubmit={handleCreateCourse} className="mb-4 p-4 bg-secondary/30 rounded-lg border border-border">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-muted-foreground">Nombre del Curso</label>
                            <input
                                type="text"
                                name="name"
                                required
                                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-md text-foreground"
                                placeholder="Matemáticas 101"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-muted-foreground">Código</label>
                            <input
                                type="text"
                                name="code"
                                required
                                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-md text-foreground"
                                placeholder="MAT-101"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-muted-foreground">Email del Docente</label>
                            <input
                                type="email"
                                name="teacherEmail"
                                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-md text-foreground"
                                placeholder="profesor@universidad.edu"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-muted-foreground">Número de Estudiantes</label>
                            <input
                                type="number"
                                name="studentCount"
                                defaultValue={12}
                                min={1}
                                max={30}
                                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-md text-foreground"
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                        <Button type="submit" size="sm" className="bg-success hover:bg-success/90 text-white">
                            Crear Curso
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setShowCreateForm(false)}
                            className="border-border"
                        >
                            Cancelar
                        </Button>
                    </div>
                </form>
            )}

            {courses.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                    No se encontraron cursos. Crea uno para comenzar.
                </p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {courses.map((course) => (
                        <div
                            key={course.id}
                            onClick={() => onCourseSelect(course.id)}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedCourseId === course.id
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-primary/50 bg-secondary/20"
                                }`}
                        >
                            <h3 className="font-semibold text-foreground mb-1">{course.name}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{course.code}</p>
                            <div className="flex items-center gap-4 text-sm">
                                <span className="flex items-center gap-1 text-accent">
                                    <Users size={14} />
                                    {course.students?.length || 0} Estudiantes
                                </span>
                                <span className="text-muted-foreground">
                                    {course._count?.sessions || 0} Sesiones
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedCourse && (
                <div className="mt-4 p-4 bg-primary/10 border border-primary/30 rounded-lg">
                    <p className="text-sm font-medium text-primary">
                        Curso seleccionado: {selectedCourse.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        {selectedCourse.students?.length} estudiantes registrados
                    </p>
                </div>
            )}
        </Card>
    )
}
