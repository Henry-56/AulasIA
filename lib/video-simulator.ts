// Video Simulation Engine using Canvas API
// Generates 15-second classroom simulation videos

export interface StudentState {
    id: string
    name: string
    x: number
    y: number
    attentionState: 'focused' | 'distracted' | 'tired' | 'using_phone' | 'raising_hand' | 'taking_notes'
    participationType?: 'raising_hand' | 'taking_notes' | 'answering' | null
    color: string
}

export interface SimulationConfig {
    studentCount: number
    duration: number // seconds
    width: number
    height: number
    attentionDistribution?: {
        focused: number
        distracted: number
        tired: number
        using_phone: number
    }
}

export class ClassroomSimulator {
    private canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D
    private students: StudentState[] = []
    private config: SimulationConfig
    private animationFrame: number = 0

    constructor(canvas: HTMLCanvasElement, config: SimulationConfig) {
        this.canvas = canvas
        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error('Canvas context not available')
        this.ctx = ctx
        this.config = config
        this.canvas.width = config.width
        this.canvas.height = config.height
    }

    // Initialize students with random positions and states
    initializeStudents() {
        const cols = Math.ceil(Math.sqrt(this.config.studentCount))
        const rows = Math.ceil(this.config.studentCount / cols)
        const cellWidth = this.config.width / cols
        const cellHeight = this.config.height / rows

        const states: StudentState['attentionState'][] = [
            'focused',
            'distracted',
            'tired',
            'using_phone',
            'raising_hand',
            'taking_notes',
        ]

        const colors = [
            '#8B5CF6',
            '#EC4899',
            '#F59E0B',
            '#10B981',
            '#3B82F6',
            '#6366F1',
        ]

        for (let i = 0; i < this.config.studentCount; i++) {
            const col = i % cols
            const row = Math.floor(i / cols)

            this.students.push({
                id: `student-${i}`,
                name: `Student ${i + 1}`,
                x: col * cellWidth + cellWidth / 2,
                y: row * cellHeight + cellHeight / 2,
                attentionState: states[Math.floor(Math.random() * states.length)],
                participationType: Math.random() > 0.7 ? 'raising_hand' : null,
                color: colors[i % colors.length],
            })
        }
    }

    // Draw a single student avatar
    private drawStudent(student: StudentState, frame: number) {
        const ctx = this.ctx
        const size = 60

        // Avatar circle
        ctx.beginPath()
        ctx.arc(student.x, student.y, size / 2, 0, Math.PI * 2)
        ctx.fillStyle = student.color
        ctx.fill()
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 3
        ctx.stroke()

        // Draw emoji based on state
        ctx.font = '32px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        let emoji = '👨‍🎓'
        switch (student.attentionState) {
            case 'focused':
                emoji = '👨‍🎓'
                break
            case 'distracted':
                emoji = '😐'
                break
            case 'tired':
                emoji = '😴'
                break
            case 'using_phone':
                emoji = '📱'
                break
            case 'raising_hand':
                emoji = '✋'
                break
            case 'taking_notes':
                emoji = '📝'
                break
        }

        ctx.fillText(emoji, student.x, student.y)

        // Add animation for raising hand (slight up-down motion)
        if (student.attentionState === 'raising_hand') {
            const offset = Math.sin(frame * 0.1) * 5
            ctx.save()
            ctx.translate(0, offset)
            ctx.fillText('✋', student.x, student.y - 40)
            ctx.restore()
        }

        // Name label
        ctx.font = '12px Arial'
        ctx.fillStyle = '#fff'
        ctx.fillText(student.name, student.x, student.y + size / 2 + 15)
    }

    // Render a single frame
    renderFrame(frameNumber: number) {
        // Clear canvas
        this.ctx.fillStyle = '#1a1a2e'
        this.ctx.fillRect(0, 0, this.config.width, this.config.height)

        // Draw title
        this.ctx.font = 'bold 24px Arial'
        this.ctx.fillStyle = '#8B5CF6'
        this.ctx.textAlign = 'center'
        this.ctx.fillText('Classroom Simulation', this.config.width / 2, 30)

        // Draw timer
        const currentTime = Math.floor((frameNumber / 30) * 100) / 100
        this.ctx.font = '18px Arial'
        this.ctx.fillStyle = '#fff'
        this.ctx.fillText(`Time: ${currentTime.toFixed(1)}s`, this.config.width / 2, 60)

        // Draw all students
        this.students.forEach((student) => {
            // Randomly change state during animation (10% chance per frame)
            if (Math.random() < 0.01) {
                const states: StudentState['attentionState'][] = [
                    'focused',
                    'distracted',
                    'tired',
                    'using_phone',
                    'raising_hand',
                    'taking_notes',
                ]
                student.attentionState = states[Math.floor(Math.random() * states.length)]
            }

            this.drawStudent(student, frameNumber)
        })
    }

    // Generate video blob
    async generateVideo(): Promise<Blob> {
        return new Promise((resolve, reject) => {
            this.initializeStudents()

            const stream = this.canvas.captureStream(30) // 30 FPS
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'video/webm;codecs=vp9',
            })

            const chunks: Blob[] = []
            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.push(e.data)
                }
            }

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' })
                resolve(blob)
            }

            mediaRecorder.onerror = (e) => {
                reject(e)
            }

            mediaRecorder.start()

            // Render frames at 30 FPS
            const fps = 30
            const totalFrames = this.config.duration * fps
            let currentFrame = 0

            const renderLoop = () => {
                if (currentFrame >= totalFrames) {
                    mediaRecorder.stop()
                    return
                }

                this.renderFrame(currentFrame)
                currentFrame++
                setTimeout(renderLoop, 1000 / fps)
            }

            renderLoop()
        })
    }

    // Get current student states (for saving to database)
    getStudentStates(): StudentState[] {
        return this.students
    }
}

// Helper function to create simulation
export async function createSimulation(
    config: SimulationConfig
): Promise<{ videoBlob: Blob; students: StudentState[] }> {
    const canvas = document.createElement('canvas')
    const simulator = new ClassroomSimulator(canvas, config)

    const videoBlob = await simulator.generateVideo()
    const students = simulator.getStudentStates()

    return { videoBlob, students }
}
