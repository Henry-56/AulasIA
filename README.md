# Sistema de Monitoreo de Participación Estudiantil 🎓

Sistema web para docentes que monitorea la participación y atención estudiantil en tiempo real usando simulaciones de video y análisis con IA de Google Gemini.

## 🚀 Características

- **Simulación de Aula en Tiempo Real**: Genera videos de 15 segundos simulando estudiantes con diferentes niveles de atención
- **Análisis con IA**: Procesa automáticamente los videos con Gemini 2.0 Flash para detectar:
  - Niveles de atención de cada estudiante
  - Tasas de participación
  - Tipos de distracciones (celular, cansancio, distracción)
  - Comportamientos de participación (levantando la mano, tomando notas)
- **Panel del Docente**: Dashboard completo con métricas agregadas y sesiones históricas
- **Base de Datos Supabase**: Almacenamiento persistente de cursos, estudiantes, sesiones y métricas

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 16 + React 19 + TypeScript
- **Estilos**: Tailwind CSS v4
- **Base de Datos**: Supabase (PostgreSQL)
- **ORM**: Prisma 5.22
- **IA**: Google Gemini 2.0 Flash (API)
- **Generación de Video**: Canvas API + MediaRecorder
- **Gráficos**: Recharts

## 📋 Requisitos Previos

- Node.js 18+
- Cuenta de Supabase (capa gratuita funciona)
- API Key de Google Gemini ([obtener aquí](https://aistudio.google.com/))

## ⚙️ Configuración

### 1. Instalar Dependencias

\`\`\`bash
npm install
\`\`\`

### 2. Configurar Variables de Entorno

Edita el archivo `.env.local` y reemplaza `[YOUR-PASSWORD]` con tu contraseña de Supabase:

\`\`\`env
DATABASE_URL="postgresql://postgres.oseyvtzkpfogdstqntlp:[TU-PASSWORD]@aws-0-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
GEMINI_API_KEY="AIzaSyCMWhjiWFdBZxEb-m_BBQ03xDJy_x-7ZJI"
\`\`\`

**Nota**: La API key de Gemini ya está incluida, pero puedes usar la tuya propia si prefieres.

### 3. Inicializar Base de Datos

Ejecuta las migraciones de Prisma para crear las tablas:

\`\`\`bash
npx prisma db push
\`\`\`

Esto creará las siguientes tablas en Supabase:
- `teachers` - Información de docentes
- `courses` - Cursos con estudiantes
- `students` - Estudiantes por curso
- `class_sessions` - Sesiones de clase simuladas
- `session_metrics` - Métricas agregadas por sesión
- `student_metrics` - Métricas individuales por estudiante

### 4. Verificar Conexión (Opcional)

\`\`\`bash
npx prisma studio
\`\`\`

Esto abre una interfaz web en `http://localhost:5555` para ver tus datos.

## 🏃‍♂️ Ejecutar la Aplicación

### Modo Desarrollo

\`\`\`bash
npm run dev
\`\`\`

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Modo Producción

\`\`\`bash
npm run build
npm start
\`\`\`

## 📖 Guía de Uso

### Paso 1: Crear un Curso

1. Ve a **Panel Docente** en la navegación
2. Click en "Nuevo Curso"
3. Completa la información:
   - Nombre del curso (ej: "Matemáticas 101")
   - Código (ej: "MAT-101")
   - Email del docente
   - Número de estudiantes (1-30)

### Paso 2: Iniciar Simulación

1. Selecciona un curso de la lista
2. Click en "Iniciar Simulación"
3. El sistema:
   - Genera un video de 15s con avatares de estudiantes
   - Sube el video a Gemini AI
   - Analiza atención y participación
   - Guarda métricas en la base de datos

### Paso 3: Ver Resultados

- **Métricas en Tiempo Real**: Se muestran después del análisis
  - Atención promedio (%)
  - Tasa de participación (%)
  - Número de distracciones
  - Tipos de distracciones detectadas

- **Historial de Sesiones**: Tabla con todas las sesiones previas

## 🎨 Características del Sistema

### Generación de Video

El simulador genera videos usando Canvas API con:
- Avatars emoji representando estudiantes
- Estados de atención: 👨‍🎓 (enfocado), 📱 (celular), 😴 (cansado), ✋ (participando), 📝 (tomando notas)
- Animaciones suaves y cambios de estado dinámicos
- Diseño de cuadrícula adaptable según el número de estudiantes

### Análisis con Gemini

Gemini 2.0 Flash analiza el video y retorna JSON estructurado con:
- `overallAttentionScore` - Atención promedio 0-100
- `participationRate` - Porcentaje de participación
- `distractionCount` - Número de distracciones
- `distractionTypes` - Array de tipos detectados
- `students` - Array con métricas individuales por estudiante

### Panel del Docente

- **Métricas Agregadas**: Cards con promedios históricos
- **Simulador Integrado**: Generación y análisis en un solo flujo
- **Tabla de Sesiones**: Historial completo con filtrado por curso
- **Responsive**: Funciona en desktop, tablet y móvil

## 🗄️ Esquema de Base de Datos

\`\`\`
Teacher 1---* Course 1---* Student
Course 1---* ClassSession
ClassSession 1---1 SessionMetrics
ClassSession 1---* StudentMetric *---1 Student
\`\`\`

## 🔧 Solución de Problemas

### Error: "Module '@prisma/client' not found"

\`\`\`bash
npx prisma generate
\`\`\`

### Error: "Database connection failed"

- Verifica que la contraseña en `.env.local` sea correcta
- Asegúrate de que tu IP esté en la whitelist de Supabase
- Revisa que el proyecto de Supabase esté activo

### Error: "Gemini API failed"

- Verifica que `GEMINI_API_KEY` esté configurada
- Revisa los límites de la capa gratuita (15 req/min)
- Asegúrate de que el video no exceda 20MB

### Video no se genera

- Verifica que el navegador soporte MediaRecorder
- Usa Chrome/Edge (mejor compatibilidad con WebM)
- Revisa la consola del navegador por errores de Canvas

## 📊 Límites de la Capa Gratuita

| Servicio | Límite | Recomendación |
|----------|--------|---------------|
| Supabase | 500MB DB, 2GB bandwidth | Suficiente para ~1000 sesiones |
| Gemini API | 15 req/min, 1500 req/día | Espera 4s entre simulaciones |
| Next.js/Vercel | Ilimitado en desarrollo | - |

## 🚀 Próximos Pasos

- [ ] Autenticación de docentes (NextAuth)
- [ ] Exportar reportes a PDF
- [ ] Integración con Google Classroom
- [ ] Grafos de tendencias temporales
- [ ] Alertas por email para bajo rendimiento
- [ ] Soporte para videos reales (no solo simulación)

## 📝 Licencia

MIT License - Uso libre para proyectos educativos

## 👨‍💻 Soporte

Para problemas o preguntas:
1. Revisa esta guía
2. Verifica la consola del navegador
3. Revisa logs de Prisma: `npx prisma studio`

---

**Hecho con ❤️ para mejorar la educación con IA**
