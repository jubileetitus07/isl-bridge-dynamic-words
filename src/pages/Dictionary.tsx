
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { getISLDictionary } from "@/lib/api";
import { Book, Search, Filter, Loader2 } from "lucide-react";

interface DictionarySign {
  name: string;
  image_path: string;
}

const Dictionary = () => {
  const [signs, setSigns] = useState<DictionarySign[]>([]);
  const [filteredSigns, setFilteredSigns] = useState<DictionarySign[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [currentView, setCurrentView] = useState<"grid" | "list">("grid");
  const { toast } = useToast();

  useEffect(() => {
    fetchDictionary();
  }, []);

  useEffect(() => {
    filterSigns();
  }, [searchQuery, activeCategory, signs]);

  const fetchDictionary = async () => {
    try {
      setIsLoading(true);
      const result = await getISLDictionary();

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      setSigns(result.signs);
      setFilteredSigns(result.signs);
    } catch (error) {
      console.error("Error fetching dictionary:", error);
      toast({
        title: "Failed to load dictionary",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterSigns = () => {
    let filtered = [...signs];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((sign) =>
        sign.name.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (activeCategory !== "all") {
      if (activeCategory === "alphabet") {
        // Filter for single letters A-Z
        filtered = filtered.filter(
          (sign) => sign.name.length === 1 && /^[A-Za-z]$/.test(sign.name)
        );
      } else if (activeCategory === "numbers") {
        // Filter for numbers
        filtered = filtered.filter((sign) => /^\d+$/.test(sign.name));
      } else if (activeCategory === "common") {
        // Filter for common words - this is just an example
        const commonWords = [
          "hello",
          "goodbye",
          "thank_you",
          "please",
          "sorry",
          "yes",
          "no",
          "help",
        ];
        filtered = filtered.filter((sign) => commonWords.includes(sign.name));
      } else if (activeCategory === "phrases") {
        // Filter for phrases (assuming phrases contain underscore or space)
        filtered = filtered.filter(
          (sign) => sign.name.includes("_") || sign.name.includes(" ")
        );
      }
    }

    setFilteredSigns(filtered);
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Function to render placeholder if image path doesn't exist
  const renderSignImage = (sign: DictionarySign) => {
    const imageUrl = `http://localhost:5000${sign.image_path}`;
    
    return (
      <div className="flex flex-col items-center">
        <div className="w-full aspect-square border rounded-md flex items-center justify-center bg-white">
          <img
            src={imageUrl}
            alt={sign.name}
            className="max-w-full max-h-full object-contain p-2"
            onError={(e) => {
              // If image fails to load, show a placeholder
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
          />
        </div>
        <p className="mt-2 text-sm font-medium text-center">
          {sign.name.replace(/_/g, " ")}
        </p>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">ISL Dictionary</h1>
          <p className="text-muted-foreground mt-2">
            Browse and learn Indian Sign Language signs
          </p>
        </div>

        {/* Search and Filter */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Book className="mr-2 h-5 w-5" />
              ISL Dictionary
            </CardTitle>
            <CardDescription>
              Browse or search for ISL signs by categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search signs..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={currentView === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentView("grid")}
                  className="w-10"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="7" height="7" x="3" y="3" rx="1" />
                    <rect width="7" height="7" x="14" y="3" rx="1" />
                    <rect width="7" height="7" x="14" y="14" rx="1" />
                    <rect width="7" height="7" x="3" y="14" rx="1" />
                  </svg>
                </Button>
                <Button
                  variant={currentView === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentView("list")}
                  className="w-10"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="8" y1="6" x2="21" y2="6" />
                    <line x1="8" y1="12" x2="21" y2="12" />
                    <line x1="8" y1="18" x2="21" y2="18" />
                    <line x1="3" y1="6" x2="3.01" y2="6" />
                    <line x1="3" y1="12" x2="3.01" y2="12" />
                    <line x1="3" y1="18" x2="3.01" y2="18" />
                  </svg>
                </Button>
              </div>
            </div>

            <Tabs
              value={activeCategory}
              onValueChange={handleCategoryChange}
              className="mt-6"
            >
              <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
                <TabsTrigger value="all">All Signs</TabsTrigger>
                <TabsTrigger value="alphabet">Alphabet</TabsTrigger>
                <TabsTrigger value="numbers">Numbers</TabsTrigger>
                <TabsTrigger value="common">Common Words</TabsTrigger>
                <TabsTrigger value="phrases">Phrases</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              Showing {filteredSigns.length} of {signs.length} signs
            </p>
          </CardFooter>
        </Card>

        {/* Signs Display */}
        <Card>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-12">
                <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">
                  Loading dictionary...
                </p>
              </div>
            ) : filteredSigns.length === 0 ? (
              <div className="text-center p-12">
                <Book className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No signs found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </div>
            ) : currentView === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {filteredSigns.map((sign, index) => (
                  <div key={index} className="aspect-square">
                    {renderSignImage(sign)}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSigns.map((sign, index) => (
                  <div
                    key={index}
                    className="flex items-center border rounded-md p-3 hover:bg-accent/10 transition-colors"
                  >
                    <div className="w-16 h-16 mr-4 flex-shrink-0">
                      <img
                        src={`http://localhost:5000${sign.image_path}`}
                        alt={sign.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/placeholder.svg";
                        }}
                      />
                    </div>
                    <div>
                      <p className="font-medium">
                        {sign.name.replace(/_/g, " ")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {sign.name.length === 1 && /^[A-Za-z]$/.test(sign.name)
                          ? "Alphabet"
                          : /^\d+$/.test(sign.name)
                          ? "Number"
                          : sign.name.includes("_") || sign.name.includes(" ")
                          ? "Phrase"
                          : "Word"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Learning Resources */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Learning Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>
                Learning Indian Sign Language is a valuable skill that enables
                communication with the deaf and hard of hearing community. Below
                are some resources to help you expand your ISL knowledge:
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">ISL Fingerspelling</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Learn the hand shapes for each letter to spell out words
                  </p>
                  <Button variant="outline" size="sm">
                    View Guide
                  </Button>
                </div>
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">Basic Conversations</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Common phrases and dialogues for everyday communication
                  </p>
                  <Button variant="outline" size="sm">
                    Practice
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dictionary;
