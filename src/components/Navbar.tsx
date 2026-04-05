import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, User, LogIn, Shield, Bookmark, Newspaper, BadgeCheck, ChevronDown, Package, Star, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import LanguageToggle from "./LanguageToggle";
import OfflineToolkit from "./OfflineToolkit";
import gonepallogo from "@/assets/gonepallogo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useWeather } from "@/contexts/WeatherContext";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { openWeather } = useWeather();
  const [isOfflineToolkitOpen, setIsOfflineToolkitOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === "/";
  const { user, loading, isAdmin, isGuide } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const mainNavLinks = [
    { href: "/#destinations", label: "Destinations" },
    { href: "/#experiences", label: "Experiences" },
  ];

  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false);

    if (href.startsWith("/#")) {
      const sectionId = href.substring(2);
      if (isHomePage) {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        window.location.href = href;
      }
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
        ? "glass-effect shadow-soft py-3"
        : "bg-transparent py-5"
        }`}
    >
      <OfflineToolkit isOpen={isOfflineToolkitOpen} onClose={() => setIsOfflineToolkitOpen(false)} />
      <div className="container-wide flex items-center justify-between">
        {/* Logo */}
        <Link to="/" id="navbar-logo" className="flex items-center gap-2 group">
          <div className="relative">
            {/* Logo Image with color toggle animation */}
            <img
              src={gonepallogo}
              alt="GoNepal"
              className={`h-10 w-auto transition-all duration-700 ease-out transform ${isScrolled
                ? "grayscale-0 drop-shadow-lg scale-105"
                : "grayscale-0 brightness-110 scale-100 hover:scale-105"
                }`}
              style={{
                filter: isScrolled
                  ? "sepia(100%) saturate(300%) brightness(110%) hue-rotate(-10deg)"
                  : "brightness(0) invert(1)" // Makes it pure white
              }}
            />
            {/* Subtle shimmer effect when scrolled */}
            {isScrolled && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer rounded-full" />
            )}
          </div>
          <span className={`font-display text-2xl font-bold transition-all duration-500 ${isScrolled
            ? "text-orange-600 drop-shadow-sm"
            : "text-white/90 drop-shadow-md"
            }`}>
            GoNepal
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8 text-sm">
          {mainNavLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(link.href);
              }}
              className={`font-medium tracking-wide transition-all duration-300 hover:text-accent cursor-pointer ${isScrolled ? "text-foreground" : "text-white/90"
                }`}
            >
              {link.label}
            </a>
          ))}

          {/* Tourist ID Link */}
          <Link
            to="/tourist-id"
            id="tourist-id-link"
            className={`font-medium tracking-wide transition-all duration-300 hover:text-accent cursor-pointer flex items-center gap-1.5 ${isScrolled ? "text-foreground" : "text-white/90"
              }`}
          >
            <BadgeCheck className="w-4 h-4 text-nepal-gold" />
            Tourist ID
          </Link>

          {/* News Quick Link */}
          <Link
            to="/news"
            id="news-link"
            className={`font-medium tracking-wide transition-all duration-300 hover:text-accent cursor-pointer flex items-center gap-1.5 ${isScrolled ? "text-foreground" : "text-white/90"
              }`}
          >
            <Newspaper className="w-4 h-4" />
            Insights
          </Link>

          {/* Reviews Link */}
          <Link
            to="/reviews"
            id="reviews-link"
            className={`font-medium tracking-wide transition-all duration-300 hover:text-accent cursor-pointer flex items-center gap-1.5 ${isScrolled ? "text-foreground" : "text-white/90"
              }`}
          >
            <Star className="w-4 h-4 text-nepal-gold" />
            Reviews
          </Link>

          {/* Travel Tools Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className={`flex items-center gap-1 font-medium tracking-wide transition-all duration-300 hover:text-accent outline-none ${isScrolled ? "text-foreground" : "text-white/90"}`}>
              Travel Tools <ChevronDown className="w-3 h-3 opacity-50" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="glass-effect border-white/10 shadow-elevated min-w-[180px] p-2">
              <DropdownMenuItem onClick={() => handleNavClick("/#nearby-places")} className="cursor-pointer py-2 px-3 rounded-lg hover:bg-accent/10 focus:bg-accent/10">
                Discovery Map
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleNavClick("/#flights")} className="cursor-pointer py-2 px-3 rounded-lg hover:bg-accent/10 focus:bg-accent/10">
                Flight Bookings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openWeather()} className="cursor-pointer py-2 px-3 rounded-lg hover:bg-accent/10 focus:bg-accent/10">
                Weather Forecast
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsOfflineToolkitOpen(true)} className="cursor-pointer py-2 px-3 rounded-lg hover:bg-accent/10 focus:bg-accent/10 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Offline Toolkit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleNavClick("/#translator")} className="cursor-pointer py-2 px-3 rounded-lg hover:bg-accent/10 focus:bg-accent/10">
                Translator
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Auth/Profile Section */}
          <div className="flex items-center gap-4 ml-4 pl-4 border-l border-white/10">
            {!loading ? (
              user ? (
                <div className="flex items-center gap-3">
                  {isAdmin && (
                    <Button
                      onClick={() => navigate("/admin")}
                      variant="ghost"
                      size="icon"
                      title="Admin Dashboard"
                      className={`h-9 w-9 rounded-full transition-all duration-300 ${isScrolled
                        ? "text-foreground hover:bg-muted"
                        : "text-white hover:bg-white/10"
                        }`}
                    >
                      <Shield className="h-5 w-5" />
                    </Button>
                  )}
                  {isGuide && (
                    <Button
                      onClick={() => navigate("/guide/dashboard")}
                      variant="ghost"
                      size="icon"
                      title="Guide Dashboard"
                      className={`h-9 w-9 rounded-full transition-all duration-300 ${isScrolled
                        ? "text-foreground hover:bg-muted"
                        : "text-white hover:bg-white/10"
                        }`}
                    >
                      <Briefcase className="h-5 w-5" />
                    </Button>
                  )}
                  <Button
                    onClick={() => navigate("/saved-places")}
                    variant="ghost"
                    size="icon"
                    title="Saved Places"
                    className={`h-9 w-9 rounded-full transition-all duration-300 ${isScrolled
                      ? "text-foreground hover:bg-muted"
                      : "text-white hover:bg-white/10"
                      }`}
                  >
                    <Bookmark className="h-5 w-5" />
                  </Button>
                  <LanguageToggle isScrolled={isScrolled} />
                  <Button
                    onClick={() => navigate("/profile")}
                    variant="ghost"
                    size="icon"
                    title="My Profile"
                    className={`h-9 w-9 rounded-full border border-white/10 transition-all duration-300 ${isScrolled
                      ? "text-foreground hover:bg-muted border-black/5"
                      : "text-white hover:bg-white/10"
                      }`}
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <LanguageToggle isScrolled={isScrolled} />
                  <Button
                    onClick={() => navigate("/auth")}
                    className={`rounded-full px-6 font-semibold transition-all duration-500 shadow-lg ${isScrolled
                      ? "btn-primary"
                      : "bg-white text-primary hover:bg-white/90 scale-100 hover:scale-105"
                      }`}
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                </div>
              )
            ) : (
              <div className="h-9 w-9 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`md:hidden p-2 transition-colors ${isScrolled ? "text-foreground" : "text-primary-foreground"
            }`}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 glass-effect shadow-card animate-fade-up">
          <div className="container-wide py-6 flex flex-col gap-4">
            {mainNavLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                className="text-foreground font-medium py-2 hover:text-accent transition-colors"
              >
                {link.label}
              </a>
            ))}

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                openWeather();
              }}
              className="text-foreground font-medium py-2 hover:text-accent transition-colors text-left"
            >
              Weather Check
            </button>

            <Link
              to="/tourist-id"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-foreground font-medium py-2 hover:text-accent transition-colors flex items-center gap-2"
            >
              <BadgeCheck className="w-4 h-4" />
              Tourist ID
            </Link>

            <Link
              to="/news"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-foreground font-medium py-2 hover:text-accent transition-colors flex items-center gap-2"
            >
              <Newspaper className="w-4 h-4" />
              Travel News
            </Link>

            <Link
              to="/reviews"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-foreground font-medium py-2 hover:text-accent transition-colors flex items-center gap-2"
            >
              <Star className="w-4 h-4 text-nepal-gold" />
              Reviews
            </Link>

            {!loading && (
              <div className="flex flex-col gap-4 mt-2">
                <div className="flex items-center justify-between px-2 bg-secondary/50 rounded-xl p-2">
                  <span className="text-sm font-medium text-muted-foreground ml-2">App Language</span>
                  <LanguageToggle isScrolled={true} />
                </div>
                {user ? (
                  <>
                    {isAdmin && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          navigate("/admin");
                        }}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Admin Dashboard
                      </Button>
                    )}
                    {isGuide && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          navigate("/guide/dashboard");
                        }}
                      >
                        <Briefcase className="h-4 w-4 mr-2" />
                        Guide Dashboard
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        navigate("/saved-places");
                      }}
                    >
                      <Bookmark className="h-4 w-4 mr-2" />
                      Saved History
                    </Button>
                    <Button
                      className="btn-primary w-full"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        navigate("/profile");
                      }}
                    >
                      <User className="h-4 w-4 mr-2" />
                      My Profile
                    </Button>
                  </>
                ) : (
                  <Button
                    className="btn-primary w-full"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate("/auth");
                    }}
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
