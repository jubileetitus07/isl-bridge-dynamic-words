
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HandMetal, MessageSquareText, Book } from "lucide-react";

const Index = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Hero Section */}
      <section className="mb-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-translator-primary to-translator-secondary bg-clip-text text-transparent">
            Indian Sign Language Bridge
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-muted-foreground">
            Breaking communication barriers between the hearing impaired and the hearing world through real-time sign language translation
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-translator-primary hover:bg-translator-primary/90">
              <Link to="/sign-to-text">
                <HandMetal className="mr-2 h-5 w-5" />
                Try Sign to Text
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/text-to-sign">
                <MessageSquareText className="mr-2 h-5 w-5" />
                Try Text to Sign
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mb-16 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="transition-all hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <HandMetal className="mr-2 h-5 w-5 text-translator-primary" />
                Sign to Text
              </CardTitle>
              <CardDescription>Translate sign language to written text in real-time</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Use your webcam to perform Indian Sign Language gestures, and our AI will translate them into text instantly.</p>
              <div className="mt-4">
                <Button asChild variant="outline" size="sm">
                  <Link to="/sign-to-text">Try Now</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquareText className="mr-2 h-5 w-5 text-translator-primary" />
                Text to Sign
              </CardTitle>
              <CardDescription>Convert written text into sign language visuals</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Type any text, and our system will show you the corresponding Indian Sign Language signs to communicate effectively.</p>
              <div className="mt-4">
                <Button asChild variant="outline" size="sm">
                  <Link to="/text-to-sign">Try Now</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Book className="mr-2 h-5 w-5 text-translator-primary" />
                ISL Dictionary
              </CardTitle>
              <CardDescription>Learn Indian Sign Language with our comprehensive dictionary</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Explore our dictionary of Indian Sign Language signs to learn and practice at your own pace.</p>
              <div className="mt-4">
                <Button asChild variant="outline" size="sm">
                  <Link to="/dictionary">Explore</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* About Section */}
      <section className="mb-16 max-w-4xl mx-auto">
        <div className="bg-translator-light rounded-xl p-8">
          <h2 className="text-3xl font-bold mb-4 text-translator-dark">Why ISL Bridge?</h2>
          <div className="space-y-4">
            <p>
              In India, over 6 million people are hearing impaired and use Indian Sign Language (ISL) as their primary mode of communication. However, most people don't understand ISL, creating a significant communication barrier.
            </p>
            <p>
              ISL Bridge uses deep learning and computer vision to provide real-time translation between Indian Sign Language and text, making communication accessible to everyone without requiring expensive specialized hardware.
            </p>
            <div className="mt-6">
              <Button asChild variant="default" className="bg-translator-dark hover:bg-translator-dark/90">
                <Link to="/about">Learn More About ISL Bridge</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
