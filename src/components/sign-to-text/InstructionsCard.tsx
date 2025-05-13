
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const InstructionsCard = () => {
  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>How to Use</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="list-decimal list-inside space-y-2">
          <li>Position yourself in front of the camera with good lighting</li>
          <li>Click "Start Recognition" to begin detecting sign language</li>
          <li>Choose between Static Sign mode (for individual gestures) or Dynamic Gesture mode (for movement patterns)</li>
          <li>Perform Indian Sign Language gestures clearly</li>
          <li>The system will translate recognized signs into text</li>
          <li>Use "Clear" to start over or "Copy" to copy the text</li>
        </ol>
        <div className="mt-4 p-4 bg-translator-light/50 rounded-md">
          <p className="text-sm font-medium">Tips for better recognition:</p>
          <ul className="list-disc list-inside text-sm mt-2 space-y-1">
            <li>Ensure your hands are clearly visible in the frame</li>
            <li>Use clear, deliberate movements</li>
            <li>Maintain consistent lighting</li>
            <li>Avoid busy or cluttered backgrounds</li>
            <li>In dynamic mode, make complete gestures with clear start and end positions</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default InstructionsCard;
