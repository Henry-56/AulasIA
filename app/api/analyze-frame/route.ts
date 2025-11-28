import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
    try {
        const { frameData } = await req.json();

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: 'GEMINI_API_KEY not configured in environment' },
                { status: 500 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

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
            { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
        ]);

        const response = await result.response;
        const text = response.text();

        try {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const analysis = JSON.parse(jsonMatch[0]);
                return NextResponse.json({ analysis });
            } else {
                console.warn('No JSON found in Gemini response:', text);
                return NextResponse.json({
                    analysis: { overallDistractionLevel: 0, detectedBehaviors: [] },
                });
            }
        } catch (parseError) {
            console.error('Error parsing Gemini response:', text);
            return NextResponse.json({
                analysis: { overallDistractionLevel: 0, detectedBehaviors: [] },
            });
        }
    } catch (error: any) {
        console.error('Error analyzing frame:', error);
        return NextResponse.json(
            { error: error.message || 'Analysis failed' },
            { status: 500 }
        );
    }
}
