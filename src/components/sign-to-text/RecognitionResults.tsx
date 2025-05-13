
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, Delete, Copy } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

type RecognitionResultsProps = {
  recognizedText: string;
  captionHistory: string[];
  isProcessing: boolean;
  isCapturing: boolean;
  detectionMode: "static" | "dynamic";
  clearText: () => void;
  copyToClipboard: () => void;
  restoreFromHistory: (text: string) => void;
};

const RecognitionResults = ({
  recognizedText,
  captionHistory,
  isProcessing,
  isCapturing,
  detectionMode,
  clearText,
  copyToClipboard,
  restoreFromHistory,
}: RecognitionResultsProps) => {
  const { toast } = useToast();

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Recognized Text</span>
          {isProcessing && (
            <span className="ml-2 inline-block h-2 w-2 animate-pulse rounded-full bg-translator-primary"></span>
          )}
        </CardTitle>
        <CardDescription>
          {detectionMode === "static" ? "Signs detected from your gestures" : "Dynamic gestures recognized from movement"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        <div className="min-h-[150px] p-3 border rounded-md bg-background">
          {recognizedText ? (
            <p>{recognizedText}</p>
          ) : (
            <p className="text-muted-foreground">
              {isCapturing
                ? "Waiting for signs to be detected..."
                : "Start recognition to see translated text here"}
            </p>
          )}
        </div>
        
        {detectionMode === "dynamic" && (
          <Alert className="mt-3">
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Dynamic Gesture Mode</AlertTitle>
            <AlertDescription>
              Move your hands continuously to capture dynamic gestures. 
              The system will analyze movement patterns over time.
            </AlertDescription>
          </Alert>
        )}

        {captionHistory.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Recent History:</p>
            <div className="space-y-2 max-h-[150px] overflow-y-auto">
              {captionHistory.map((text, index) => (
                <div
                  key={index}
                  className="p-2 border rounded-md text-sm flex justify-between items-center hover:bg-accent cursor-pointer"
                  onClick={() => restoreFromHistory(text)}
                >
                  <p className="truncate">{text}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      restoreFromHistory(text);
                    }}
                  >
                    ↑
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="flex gap-2 w-full">
          <Button
            onClick={clearText}
            variant="outline"
            className="flex-1"
            disabled={!recognizedText}
          >
            <Delete className="mr-2 h-4 w-4" /> Clear
          </Button>
          <Button
            onClick={copyToClipboard}
            variant="outline"
            className="flex-1"
            disabled={!recognizedText}
          >
            <Copy className="mr-2 h-4 w-4" /> Copy
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default RecognitionResults;
