
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { translateTextToSign } from "@/lib/api";
import { MessageSquareText, Send, RefreshCcw, Loader2, AlertCircle } from "lucide-react";

interface SignImage {
  sign: string;
  image_path: string;
  match_type?: "exact" | "stemmed" | "partial";
  original?: string;
}

const TextToSign = () => {
  const [inputText, setInputText] = useState("");
  const [signImages, setSignImages] = useState<SignImage[]>([]);
  const [unmatchedWords, setUnmatchedWords] = useState<string[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [recentTranslations, setRecentTranslations] = useState<string[]>([]);
  const { toast } = useToast();

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Empty Text",
        description: "Please enter some text to translate",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsTranslating(true);
      
      const result = await translateTextToSign(inputText);
      
      if (result.error) {
        toast({
          title: "Translation Error",
          description: result.error,
          variant: "destructive",
        });
        return;
      }
      
      setSignImages(result.signs);
      setUnmatchedWords(result.unmatched_words || []);
      
      // Add to recent translations if not already there
      if (!recentTranslations.includes(inputText)) {
        setRecentTranslations((prev) => [inputText, ...prev.slice(0, 4)]);
      }

    } catch (error) {
      console.error("Translation error:", error);
      toast({
        title: "Translation Failed",
        description: "Failed to translate text to sign language",
        variant: "destructive",
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleTranslate();
    }
  };

  const clearTranslation = () => {
    setInputText("");
    setSignImages([]);
    setUnmatchedWords([]);
  };

  const useRecentTranslation = (text: string) => {
    setInputText(text);
    // Optionally, translate it immediately
    // handleTranslate();
  };

  // Function to render sign image with match information
  const renderSignImage = (sign: SignImage) => {
    const imageUrl = `http://localhost:5000${sign.image_path}`;
    
    return (
      <div className="flex flex-col items-center">
        <div className="w-32 h-32 border rounded-md flex items-center justify-center bg-white">
          <img
            src={imageUrl}
            alt={sign.sign}
            className="max-w-full max-h-full object-contain"
            onError={(e) => {
              // If image fails to load, show a placeholder
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
          />
        </div>
        <div className="mt-2 text-center">
          <p className="font-medium">{sign.sign}</p>
          {sign.match_type && sign.match_type !== "exact" && sign.original && (
            <p className="text-xs text-muted-foreground">
              {sign.match_type === "stemmed" ? "Stem of" : "Similar to"}: {sign.original}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Text to Sign Translation</h1>
          <p className="text-muted-foreground mt-2">
            Convert text to Indian Sign Language visual representations
          </p>
        </div>

        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquareText className="mr-2 h-5 w-5" />
              Enter Text
            </CardTitle>
            <CardDescription>
              Type the text you want to translate to Indian Sign Language
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Type your text here..."
              className="min-h-[100px]"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={clearTranslation}>
              Clear
            </Button>
            <Button onClick={handleTranslate} disabled={isTranslating || !inputText.trim()}>
              {isTranslating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Translating...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Translate
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Recent Translations */}
        {recentTranslations.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-medium mb-2">Recent Translations</h2>
            <div className="flex flex-wrap gap-2">
              {recentTranslations.map((text, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-sm"
                  onClick={() => useRecentTranslation(text)}
                >
                  {text.length > 30 ? `${text.substring(0, 30)}...` : text}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Translation Results */}
        {(signImages.length > 0 || unmatchedWords.length > 0) && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Sign Language Translation</CardTitle>
              <CardDescription>
                Visual representation of the text in Indian Sign Language
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Matched signs */}
              {signImages.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-4">Matched Signs</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {signImages.map((sign, index) => (
                      <div key={index}>{renderSignImage(sign)}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Unmatched words */}
              {unmatchedWords.length > 0 && (
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-md">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-amber-800">
                        Words without matching signs ({unmatchedWords.length}):
                      </h3>
                      <p className="text-sm text-amber-700 mt-1">
                        {unmatchedWords.join(", ")}
                      </p>
                      <p className="text-xs text-amber-600 mt-2">
                        These words don't have matching signs in our dictionary. In a complete implementation, 
                        these would be finger-spelled using the manual alphabet.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                Note: Signs may be approximated when an exact match is unavailable.
              </p>
            </CardFooter>
          </Card>
        )}

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How to Use</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2">
              <li>Type or paste your text in the input box above</li>
              <li>Click "Translate" to convert the text to ISL signs</li>
              <li>View the sequence of signs representing your text</li>
              <li>
                Use "Clear" to start over or click on a recent translation to reuse it
              </li>
            </ol>
            <div className="mt-4 p-4 bg-translator-light/50 rounded-md">
              <p className="text-sm font-medium">About Text to Sign Translation:</p>
              <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                <li>
                  ISL grammar differs from English - signs show the concept, not word-for-word
                </li>
                <li>
                  Common words and phrases have specific signs, while uncommon terms may be finger-spelled
                </li>
                <li>
                  For best results, use simple, clear sentences and common vocabulary
                </li>
                <li>
                  Words may be matched exactly, by their stem (removing endings like -ing, -ed), 
                  or by finding similar words in our dictionary
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TextToSign;
