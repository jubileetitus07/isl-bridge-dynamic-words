
import { Outlet, Link } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { AlertCircle } from "lucide-react";

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Setup Notice Banner */}
      <div className="bg-amber-50 border-b border-amber-200">
        <div className="container mx-auto py-2 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-amber-600 mr-2" />
              <p className="text-sm text-amber-800">
                Backend server not connected. The application requires setup to work properly.
              </p>
            </div>
            <Link to="/setup" className="text-sm font-medium text-amber-800 hover:text-amber-900">
              View Setup Guide →
            </Link>
          </div>
        </div>
      </div>
      
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
