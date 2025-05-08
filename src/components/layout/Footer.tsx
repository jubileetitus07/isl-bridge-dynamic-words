
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t py-6 md:py-0">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-4 md:h-16">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <Link to="/" className="font-medium flex items-center gap-1">
            <span className="font-bold text-translator-primary">ISL</span>
            <span>Bridge</span>
          </Link>
          <p className="text-sm text-muted-foreground text-center md:text-left">
            &copy; {currentYear} ISL Bridge. All rights reserved.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            About
          </Link>
          <Link to="/sign-to-text" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Sign to Text
          </Link>
          <Link to="/text-to-sign" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Text to Sign
          </Link>
          <Link to="/dictionary" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Dictionary
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
