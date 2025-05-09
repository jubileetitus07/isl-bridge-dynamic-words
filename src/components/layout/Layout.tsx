
import { useState, useEffect } from "react";
import { Outlet, Link } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { AlertCircle, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const Layout = () => {
  const [showBanner, setShowBanner] = useState(true);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const checkBackendConnection = async () => {
    try {
      setIsChecking(true);
      const response = await fetch("http://localhost:5000/api/isl-dictionary");
      if (response.ok) {
        setIsBackendConnected(true);
      } else {
        setIsBackendConnected(false);
      }
    } catch (error) {
      console.error("Backend server not reachable:", error);
      setIsBackendConnected(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Check if backend server is running
    checkBackendConnection();
    
    // Check connection every 30 seconds
    const interval = setInterval(checkBackendConnection, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Setup Notice Banner */}
      {showBanner && !isBackendConnected && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="container mx-auto py-2 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-amber-600 mr-2" />
                <p className="text-sm text-amber-800">
                  Backend server not connected. The application requires the Flask backend to be running at http://localhost:5000.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  size="sm"
                  variant="outline"
                  className="text-amber-800 hover:text-amber-900 h-8"
                  onClick={checkBackendConnection}
                  disabled={isChecking}
                >
                  {isChecking ? 
                    <RefreshCw className="h-4 w-4 animate-spin mr-1" /> :
                    <RefreshCw className="h-4 w-4 mr-1" />
                  }
                  Check Connection
                </Button>
                <Link to="/setup" className="text-sm font-medium text-amber-800 hover:text-amber-900">
                  View Setup Guide →
                </Link>
                <button 
                  onClick={() => setShowBanner(false)} 
                  className="text-amber-600 hover:text-amber-800"
                  aria-label="Dismiss"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
