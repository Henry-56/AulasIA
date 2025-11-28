"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Video } from "lucide-react";
import { toast } from "sonner";

export function VideoAnalyzer() {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.size > 20 * 1024 * 1024) {
                toast.error("El video es demasiado grande. Máximo 20MB.");
                return;
            }
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
            setResult(null);
        }
    };

    const handleAnalyze = async () => {
        if (!file) return;

        setIsAnalyzing(true);
        setResult(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            console.log("Sending request to /api/analyze-video...");
            const response = await fetch("/api/analyze-video", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            console.log("Response from API:", data);

            if (!response.ok) {
                console.error("API Error Response:", data);
                const errorMsg = data.error || data.details || "Error en el análisis";
                toast.error(`Error: ${errorMsg}`);
                setResult(`ERROR: ${errorMsg}\n\nDetalles: ${JSON.stringify(data, null, 2)}`);
                return;
            }

            setResult(JSON.stringify(data.analysis, null, 2));
            toast.success("Análisis completado");
        } catch (error) {
            console.error("Fetch error:", error);
            const errorMsg = error instanceof Error ? error.message : "Error desconocido";
            toast.error(`Error: ${errorMsg}`);
            setResult(`ERROR: ${errorMsg}`);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Análisis de Distracción</CardTitle>
                <CardDescription>Sube un video de 5 segundos de la clase para detectar distracciones.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="video">Video de la clase</Label>
                    <Input id="video" type="file" accept="video/*" onChange={handleFileChange} />
                </div>

                {previewUrl && (
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-black">
                        <video src={previewUrl} controls className="h-full w-full object-contain" />
                    </div>
                )}

                {result && (
                    <div className="rounded-lg border p-4 bg-muted/50">
                        <h4 className="font-semibold mb-2">Resultado del Análisis:</h4>
                        <p className="text-sm whitespace-pre-wrap">{result}</p>
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <Button
                    onClick={handleAnalyze}
                    disabled={!file || isAnalyzing}
                    className="w-full"
                >
                    {isAnalyzing ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analizando...
                        </>
                    ) : (
                        <>
                            <Video className="mr-2 h-4 w-4" />
                            Analizar Video
                        </>
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}
