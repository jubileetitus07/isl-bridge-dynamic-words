
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HandMetal, MessageSquareText, Book, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const location = useLocation();
  const [currentPath, setCurrentPath] = useState("/");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setCurrentPath(location.pathname);
  }, [location.pathname]);

  const navItems = [
    { path: "/sign-to-text", label: "Sign to Text", icon: <HandMetal className="mr-2 h-4 w-4" /> },
    { path: "/text-to-sign", label: "Text to Sign", icon: <MessageSquareText className="mr-2 h-4 w-4" /> },
    { path: "/dictionary", label: "ISL Dictionary", icon: <Book className="mr-2 h-4 w-4" /> },
    { path: "/about", label: "About", icon: <Info className="mr-2 h-4 w-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-bold text-2xl text-translator-primary">ISL</span>
            <span className="hidden sm:inline-block font-medium text-xl">Bridge</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex flex-1 justify-center">
          <Tabs value={currentPath} className="w-full max-w-2xl">
            <TabsList className="grid grid-cols-4">
              {navItems.map((item) => (
                <TabsTrigger
                  key={item.path}
                  value={item.path}
                  asChild
                  className="flex items-center"
                >
                  <Link to={item.path} className="w-full flex items-center justify-center">
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden ml-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={cn("h-6 w-6 transition-all", isMobileMenuOpen && "rotate-90")}
            >
              {isMobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="18" x2="20" y2="18" />
                </>
              )}
            </svg>
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <nav className="md:hidden p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 animate-fade-in">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center p-3 rounded-md hover:bg-muted",
                    currentPath === item.path && "bg-primary/10 text-primary"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
};

export default Navbar;
