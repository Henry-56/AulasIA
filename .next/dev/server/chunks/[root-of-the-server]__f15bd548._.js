module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/app/api/analyze-frame/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@google/generative-ai/dist/index.mjs [app-route] (ecmascript)");
;
;
async function POST(req) {
    try {
        const { frameData } = await req.json();
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'GEMINI_API_KEY not configured in environment'
            }, {
                status: 500
            });
        }
        const genAI = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GoogleGenerativeAI"](apiKey);
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash-lite'
        });
        const prompt = `Analiza este fotograma de video de clase para detectar distracciones académicas.

IMPORTANTE: Responde TODO en español.

Identifica:
1. Presencia de teléfono o movimientos que indiquen uso del teléfono
2. Posición de la cabeza y dirección de la mirada
3. Expresiones faciales que muestren fatiga o bostezos
4. Calidad de la postura
5. Distracciones ambientales

Proporciona una respuesta JSON con:
- overallDistractionLevel (0-100, donde 0 es completamente concentrado y 100 es muy distraído)
- detectedBehaviors como un array de objetos con:
  * type: tipo de distracción EN ESPAÑOL (ejemplos: "uso_telefono", "mirada_desviada", "postura_inadecuada", "fatiga", "distraccion_ambiental")
  * confidence: nivel de confianza (0.0-1.0)
  * recommendation: UNA SOLA FRASE corta explicando el motivo de la distracción EN ESPAÑOL (máximo 100 caracteres)

Ejemplos de tipos válidos EN ESPAÑOL:
- "uso_telefono"
- "mirada_desviada"
- "mirada_hacia_abajo"
- "postura_inadecuada"
- "fatiga"
- "bostezo"
- "distraccion_ambiental"

REGLAS ESTRICTAS:
1. TODO debe estar en ESPAÑOL
2. Las recomendaciones deben ser MUY BREVES (máximo 100 caracteres)
3. Solo el MOTIVO de la distracción, sin consejos adicionales
4. Devuelve SOLO JSON válido, sin formato markdown

Ejemplo de respuesta:
{
  "overallDistractionLevel": 65,
  "detectedBehaviors": [
    {
      "type": "mirada_desviada",
      "confidence": 0.85,
      "recommendation": "La mirada está dirigida fuera del área de estudio"
    },
    {
      "type": "postura_inadecuada",
      "confidence": 0.72,
      "recommendation": "La postura muestra encorvamiento y falta de ergonomía"
    }
  ]
}`;
        const base64Data = frameData.replace(/^data:image\/[^;]+;base64,/, '');
        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: base64Data
                }
            }
        ]);
        const response = await result.response;
        const text = response.text();
        try {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const analysis = JSON.parse(jsonMatch[0]);
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    analysis
                });
            } else {
                console.warn('No JSON found in Gemini response:', text);
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    analysis: {
                        overallDistractionLevel: 0,
                        detectedBehaviors: []
                    }
                });
            }
        } catch (parseError) {
            console.error('Error parsing Gemini response:', text);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                analysis: {
                    overallDistractionLevel: 0,
                    detectedBehaviors: []
                }
            });
        }
    } catch (error) {
        console.error('Error analyzing frame:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: error.message || 'Analysis failed'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__f15bd548._.js.map