
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "react-router-dom";
import { AlertCircle, BookOpen, Server, Code } from "lucide-react";

const Setup = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Setup Guide</h1>
          <p className="text-muted-foreground mt-2">
            Getting your ISL Translator up and running
          </p>
        </div>

        {/* Connection Status */}
        <Card className="mb-8 border-destructive">
          <CardHeader className="bg-destructive/10">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-destructive" />
              <CardTitle>Backend Connection Issue</CardTitle>
            </div>
            <CardDescription>
              The application is unable to connect to the backend server
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="mb-4">
              This application requires a running backend server to function properly. 
              Currently, the app is trying to connect to <code className="bg-muted px-1 py-0.5 rounded">http://localhost:5000</code> but 
              can't establish a connection.
            </p>
            <div className="bg-muted p-4 rounded-md">
              <p className="font-medium">Error Details:</p>
              <ul className="list-disc list-inside text-sm mt-2 space-y-1 text-muted-foreground">
                <li>Failed to fetch from <code>http://localhost:5000/api/text-to-sign</code></li>
                <li>Failed to fetch from <code>http://localhost:5000/api/isl-dictionary</code></li>
                <li>Unable to process sign language images or text translations</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Backend Setup */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center">
              <Server className="h-5 w-5 mr-2" />
              <CardTitle>Backend Setup Instructions</CardTitle>
            </div>
            <CardDescription>
              Follow these steps to set up the Flask backend server
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-4">
              <li>
                <span className="font-medium">Clone the backend repository:</span>
                <div className="bg-muted p-3 rounded-md mt-2 overflow-x-auto">
                  <code>git clone [your-backend-repo-url]</code>
                </div>
              </li>
              
              <li>
                <span className="font-medium">Install required dependencies:</span>
                <div className="bg-muted p-3 rounded-md mt-2 overflow-x-auto">
                  <code>pip install flask opencv-python mediapipe numpy</code>
                </div>
              </li>
              
              <li>
                <span className="font-medium">Set up the ML model directory:</span>
                <div className="mt-2">
                  <p>Create a directory for your trained models:</p>
                  <div className="bg-muted p-3 rounded-md mt-2 overflow-x-auto">
                    <code>mkdir -p static/models</code>
                  </div>
                </div>
              </li>
              
              <li>
                <span className="font-medium">Train your ISL recognition model:</span>
                <div className="mt-2">
                  <p>Use an ISL dataset to train your model. Recommended datasets:</p>
                  <ul className="list-disc list-inside ml-4 text-sm">
                    <li>Indian Sign Language Dataset (ISLD)</li>
                    <li>ISL Gesture Dataset by IIT Bombay</li>
                    <li>Custom dataset with MediaPipe hand landmarks</li>
                  </ul>
                </div>
              </li>
              
              <li>
                <span className="font-medium">Set up sign language images:</span>
                <div className="mt-2">
                  <p>Add SVG images for signs in the following directory:</p>
                  <div className="bg-muted p-3 rounded-md mt-2 overflow-x-auto">
                    <code>static/images/signs/</code>
                  </div>
                </div>
              </li>
              
              <li>
                <span className="font-medium">Start the Flask server:</span>
                <div className="bg-muted p-3 rounded-md mt-2 overflow-x-auto">
                  <code>python app.py</code>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  This will start the server at <code>http://localhost:5000</code>
                </p>
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* Model Training */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center">
              <Code className="h-5 w-5 mr-2" />
              <CardTitle>Training the ISL Recognition Model</CardTitle>
            </div>
            <CardDescription>
              Guidelines for training an effective ISL recognition model
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>
                Training an effective sign language recognition model requires a comprehensive
                dataset and appropriate preprocessing techniques:
              </p>
              
              <div>
                <h3 className="font-medium mb-2">Data Collection</h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Collect diverse samples of ISL signs with multiple signers</li>
                  <li>Include variations in lighting, background, and hand positions</li>
                  <li>Record at least 50-100 samples per sign for good accuracy</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Feature Extraction</h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Extract hand landmarks using MediaPipe Hands</li>
                  <li>Normalize coordinates relative to hand size and position</li>
                  <li>Consider using distances between landmarks as features</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Model Architecture</h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>LSTM or GRU networks for dynamic gesture recognition</li>
                  <li>CNN for static sign recognition from images</li>
                  <li>Consider using transfer learning from pre-trained models</li>
                </ul>
              </div>
              
              <div className="bg-translator-light/50 p-4 rounded-md">
                <p className="font-medium">Preprocessing Requirements:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Hand detection and segmentation</li>
                  <li>Landmark normalization (scale, rotation, translation)</li>
                  <li>Time sequence handling for dynamic gestures</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resources */}
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              <CardTitle>Additional Resources</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li>
                <a href="https://mediapipe.dev/solutions/hands" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center">
                  MediaPipe Hands Documentation
                  <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
              <li>
                <a href="https://iitb.ac.in/en/research-highlight/indian-sign-language-recognition" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center">
                  IIT Bombay ISL Research
                  <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
              <li>
                <a href="https://docs.opencv.org/master/d9/df8/tutorial_root.html" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center">
                  OpenCV Tutorials
                  <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
              <li>
                <a href="https://flask.palletsprojects.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center">
                  Flask Documentation
                  <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link to="/">Return to Homepage</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Setup;
