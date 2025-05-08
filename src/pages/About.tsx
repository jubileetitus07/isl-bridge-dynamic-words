
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Info, Users, Globe, Heart, Code, Lightbulb } from "lucide-react";

const About = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">About ISL Bridge</h1>
          <p className="text-muted-foreground mt-2">
            Our mission, vision, and the technology behind the translator
          </p>
        </div>

        {/* Mission & Vision */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="mr-2 h-5 w-5 text-translator-primary" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              ISL Bridge aims to break the communication barriers between the
              hearing and deaf communities in India by leveraging technology to
              provide real-time, accessible, and accurate sign language
              translation.
            </p>
            <p>
              In India, over 6 million people are hearing impaired and use
              Indian Sign Language (ISL) as their primary mode of communication.
              However, most people don't understand ISL, creating a significant
              communication barrier that affects education, employment
              opportunities, and social inclusion.
            </p>
            <p>
              Our vision is a world where language is never a barrier to
              communication, education, or opportunity - where technology bridges
              the gap between different modes of communication seamlessly.
            </p>
          </CardContent>
        </Card>

        {/* Technology Behind */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Code className="mr-2 h-5 w-5 text-translator-primary" />
              The Technology
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Computer Vision</h3>
                <p className="text-muted-foreground">
                  We use advanced computer vision techniques through MediaPipe to
                  detect and track hand movements and gestures in real-time,
                  capturing the nuances of sign language communication.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-2">Deep Learning</h3>
                <p className="text-muted-foreground">
                  Our custom-trained deep learning models recognize the patterns
                  of Indian Sign Language. Unlike traditional approaches that
                  rely on static image recognition, our system can interpret
                  dynamic signs and continuous signing.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-2">Accessibility First</h3>
                <p className="text-muted-foreground">
                  ISL Bridge is designed to be accessible to everyone, everywhere
                  - without requiring special hardware or equipment. Our
                  browser-based solution works on any device with a camera, making
                  it widely available to those who need it most.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Why ISL Bridge */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lightbulb className="mr-2 h-5 w-5 text-translator-primary" />
              Why ISL Bridge?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border rounded-md p-4">
                <h3 className="font-medium flex items-center mb-2">
                  <Users className="mr-2 h-4 w-4" />
                  Inclusive Communication
                </h3>
                <p className="text-sm">
                  Our platform facilitates two-way communication between sign
                  language users and non-signers, promoting inclusivity in
                  educational settings, workplaces, and public services.
                </p>
              </div>

              <div className="border rounded-md p-4">
                <h3 className="font-medium flex items-center mb-2">
                  <Globe className="mr-2 h-4 w-4" />
                  Accessibility
                </h3>
                <p className="text-sm">
                  Available via web browsers without special hardware, making
                  sign language translation accessible to anyone with a basic
                  internet connection and camera.
                </p>
              </div>

              <div className="border rounded-md p-4">
                <h3 className="font-medium flex items-center mb-2">
                  <Code className="mr-2 h-4 w-4" />
                  Advanced Technology
                </h3>
                <p className="text-sm">
                  Using cutting-edge deep learning and computer vision to provide
                  more accurate translations than traditional static image-based
                  systems.
                </p>
              </div>

              <div className="border rounded-md p-4">
                <h3 className="font-medium flex items-center mb-2">
                  <Info className="mr-2 h-4 w-4" />
                  Educational Resource
                </h3>
                <p className="text-sm">
                  Beyond translation, ISL Bridge serves as a learning tool for
                  those interested in learning Indian Sign Language through our
                  comprehensive dictionary.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Future Plans */}
        <Card>
          <CardHeader>
            <CardTitle>Future Development</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              ISL Bridge is continuously evolving to better serve the community.
              Some of our planned enhancements include:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-4">
              <li>
                Expanding the sign vocabulary to cover more specialized domains
                like medical terminology, technical fields, and regional
                variations of ISL
              </li>
              <li>
                Developing mobile applications for Android and iOS to improve
                accessibility on mobile devices
              </li>
              <li>
                Adding support for continuous sign language sentences and
                improving grammatical accuracy in translations
              </li>
              <li>
                Creating an offline mode that can function without an internet
                connection
              </li>
              <li>
                Building community features to allow users to contribute to
                improving the system
              </li>
            </ul>
            <p className="mt-4 pt-4 border-t">
              We believe that technology should serve everyone, regardless of
              ability. With ISL Bridge, we're taking one step closer to a more
              inclusive world where everyone can communicate freely and
              effectively.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default About;
