import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="w-full bg-[#1C1C1C] border-b border-gray-800 py-4">
      <div className="container max-w-5xl mx-auto">
        <Link to="/" className="inline-block">
          <h1 className="text-2xl font-bold text-white hover:text-primary transition-colors">
            AI Business Automation
          </h1>
        </Link>
      </div>
    </header>
  );
};

export default Header;