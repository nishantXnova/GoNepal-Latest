import { motion } from "framer-motion";
import { Plane, ExternalLink, Calendar, MapPin, Clock, ChevronDown, Globe, PlaneIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Airline website mapping with UTM tracking
const airlineWebsites: Record<string, string> = {
  "Yeti": "https://www.yetiairlines.com/?utm_source=gonepal&utm_medium=referral&utm_campaign=flight_routes&utm_content=route_card",
  "Buddha Air": "https://www.buddhaair.com/?utm_source=gonepal&utm_medium=referral&utm_campaign=flight_routes&utm_content=route_card",
  "Shree": "https://www.shreeairlines.com/?utm_source=gonepal&utm_medium=referral&utm_campaign=flight_routes&utm_content=route_card",
  "Tara Air": "https://www.taraair.com/?utm_source=gonepal&utm_medium=referral&utm_campaign=flight_routes&utm_content=route_card",
  "Saurya Air": "https://sauryaairlines.com/?utm_source=gonepal&utm_medium=referral&utm_campaign=flight_routes&utm_content=route_card",
  "Nepal Airlines": "https://www.nepalairlines.com.np/?utm_source=gonepal&utm_medium=referral&utm_campaign=flight_routes&utm_content=route_card",
};

const popularRoutes = [
  { from: "Kathmandu", to: "Pokhara", duration: "25 min", frequency: "Daily", airlines: ["Buddha Air", "Yeti"] },
  { from: "Kathmandu", to: "Lukla", duration: "35 min", frequency: "Daily (weather permitting)", airlines: ["Tara Air"] },
  { from: "Pokhara", to: "Jomsom", duration: "20 min", frequency: "Daily", airlines: ["Tara Air"] },
  { from: "Kathmandu", to: "Bharatpur", duration: "25 min", frequency: "Daily", airlines: ["Buddha Air", "Yeti"] },
  { from: "Kathmandu", to: "Biratnagar", duration: "35–40 min", frequency: "Daily", airlines: ["Buddha Air", "Yeti"] },
  { from: "Kathmandu", to: "Nepalgunj", duration: "50–60 min", frequency: "Daily", airlines: ["Yeti", "Shree"] },
];

const airlines = [
  { 
    name: "Yeti Airlines", 
    website: "https://www.yetiairlines.com/?utm_source=gonepal&utm_medium=referral&utm_campaign=flight_routes&utm_content=other_airlines",
    description: "Leading domestic carrier with extensive mountain route coverage",
    featured: true
  },
  { 
    name: "Buddha Air", 
    website: "https://www.buddhaair.com/?utm_source=gonepal&utm_medium=referral&utm_campaign=flight_routes&utm_content=other_airlines",
    description: "Premier domestic airline serving major destinations",
    featured: true
  },
  { 
    name: "Shree Airlines", 
    website: "https://www.shreeairlines.com/?utm_source=gonepal&utm_medium=referral&utm_campaign=flight_routes&utm_content=other_airlines",
    description: "Reliable domestic flights with competitive pricing",
    featured: true
  },
  { 
    name: "Saurya Air", 
    website: "https://sauryaairlines.com/?utm_source=gonepal&utm_medium=referral&utm_campaign=flight_routes&utm_content=other_airlines",
    description: "Efficient domestic connectivity",
    featured: false
  },
  { 
    name: "Tara Air", 
    website: "https://www.taraair.com/?utm_source=gonepal&utm_medium=referral&utm_campaign=flight_routes&utm_content=other_airlines",
    description: "Mountain specialist with remote destination expertise",
    featured: false
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

const FlightBooking = () => {
  const [showAllAirlines, setShowAllAirlines] = useState(false);
  const [selectedRouteAirlines, setSelectedRouteAirlines] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRouteName, setSelectedRouteName] = useState("");
  
  const handleBookFlight = () => {
    window.open("https://www.nepalairlines.com.np/?utm_source=gonepal&utm_medium=referral&utm_campaign=flight_routes&utm_content=book_confidently", "_blank", "noopener,noreferrer");
  };

  const handleAirlineClick = (website: string) => {
    window.open(website, "_blank", "noopener,noreferrer");
  };

  const handleRouteAirlineClick = (airlines: string[], routeFrom: string, routeTo: string) => {
    if (airlines.length === 1) {
      // Single airline - redirect directly
      const website = airlineWebsites[airlines[0]];
      if (website) {
        window.open(website, "_blank", "noopener,noreferrer");
      }
    } else {
      // Multiple airlines - show dialog
      setSelectedRouteAirlines(airlines);
      setSelectedRouteName(`${routeFrom} – ${routeTo}`);
      setIsDialogOpen(true);
    }
  };

  const handleAirlineSelect = (airline: string) => {
    const website = airlineWebsites[airline];
    if (website) {
      window.open(website, "_blank", "noopener,noreferrer");
    }
    setIsDialogOpen(false);
  };

  return (
    <>
      {/* Airline Selection Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plane className="h-5 w-5 text-orange-500" />
              Choose Your Airline
            </DialogTitle>
            <DialogDescription>
              Which airline would you like to book for the {selectedRouteName} route?
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 py-4">
            {selectedRouteAirlines.map((airline) => (
              <button
                key={airline}
                onClick={() => handleAirlineSelect(airline)}
                className="flex items-center justify-between p-4 rounded-xl border border-orange-200 dark:border-orange-800 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 hover:from-orange-100 hover:to-amber-100 dark:hover:from-orange-900 dark:hover:to-amber-900 hover:border-orange-400 transition-all group"
              >
                <span className="font-semibold text-orange-700 dark:text-orange-300">{airline}</span>
                <div className="flex items-center gap-2 text-sm text-orange-500 group-hover:text-orange-600">
                  <span>Book Now</span>
                  <ExternalLink className="h-4 w-4" />
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <section id="flights" className="section-padding bg-gradient-to-br from-nepal-sky/10 via-background to-accent/5">
      <div className="container-wide">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full mb-4"
          >
            <Plane className="h-4 w-4" />
            <span className="text-sm font-medium">Flight Booking</span>
          </motion.div>
          <h2 className="heading-section text-foreground mb-4">
            Book Your Flights
          </h2>
          <p className="text-body-large text-muted-foreground max-w-2xl mx-auto">
            Reach Nepal's remote destinations quickly with domestic flights. From scenic mountain flights to essential connections.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left - Booking Card */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            whileHover={{ y: -5 }}
            className="bg-card rounded-3xl p-8 shadow-card border border-border"
          >
            <div className="flex items-center gap-4 mb-6">
              <Plane className="w-8 h-8 text-orange-400" />
              <div>
                <h3 className="font-display text-2xl font-semibold text-foreground">Nepal Airlines</h3>
                <p className="text-muted-foreground">Official National Flag Carrier</p>
              </div>
            </div>

            <p className="text-muted-foreground mb-6 leading-relaxed">
              Nepal Airlines operates domestic and international flights connecting major cities and remote mountain destinations. 
              Book directly through their official website for the best rates and schedules.
            </p>

            <div className="bg-secondary rounded-xl p-4 mb-6">
              <h4 className="font-medium text-foreground mb-3">Why Book with Nepal Airlines?</h4>
              <ul className="space-y-2">
                {[
                  "Nepal's national flag carrier with wide route network",
                  "Direct flights to mountain destinations like Lukla",
                  "International connections to major Asian cities",
                  "Flexible booking and rebooking options",
                ].map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    {item}
                  </motion.li>
                ))}
              </ul>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                onClick={handleBookFlight}
                className="w-full btn-accent text-lg py-6 gap-2"
              >
                <Plane className="h-5 w-5" />
                Book on Nepal Airlines
                <ExternalLink className="h-4 w-4" />
              </Button>
            </motion.div>

            <p className="text-xs text-muted-foreground text-center mt-4">
              You'll be redirected to nepalairlines.com.np to complete your booking
            </p>

            {/* More Airlines Button */}
            <div className="mt-6 pt-6 border-t border-border">
              <Button
                variant="outline"
                onClick={() => setShowAllAirlines(!showAllAirlines)}
                className="w-full flex items-center justify-center gap-2 py-4"
              >
                <Globe className="h-4 w-4" />
                <span>More Airlines & Options</span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${showAllAirlines ? 'rotate-180' : ''}`} />
              </Button>

              {showAllAirlines && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 space-y-3"
                >
                  <p className="text-sm font-medium text-foreground mb-3">Popular Domestic Airlines</p>
                  {airlines.map((airline, index) => (
                    <motion.button
                      key={airline.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      onClick={() => handleAirlineClick(airline.website)}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                        airline.featured 
                          ? 'bg-accent/5 border-accent/30 hover:bg-accent/10 hover:border-accent/50' 
                          : 'bg-secondary/30 border-border/50 hover:bg-secondary/50 hover:border-border'
                      }`}
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-medium text-foreground">{airline.name}</span>
                        <span className="text-xs text-muted-foreground">{airline.description}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {airline.featured && (
                          <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-full">Popular</span>
                        )}
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Right - Popular Routes */}
          <div>
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="font-display text-xl font-semibold text-foreground mb-6"
            >
              Popular Domestic Routes
            </motion.h3>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="space-y-4"
            >
              {popularRoutes.map((route, index) => (
                <motion.div 
                  key={index}
                  variants={itemVariants}
                  whileHover={{ x: 5, borderColor: "hsl(var(--accent) / 0.5)" }}
                  className="bg-card rounded-xl p-4 border border-border cursor-pointer transition-colors duration-300"
                  onClick={() => handleRouteAirlineClick(route.airlines, route.from, route.to)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-accent" />
                        <span className="font-medium text-foreground">{route.from}</span>
                      </div>
                      <div className="w-8 h-px bg-border relative">
                        <Plane className="h-3 w-3 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-accent" />
                        <span className="font-medium text-foreground">{route.to}</span>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{route.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{route.frequency}</span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:items-end gap-1">
                      <span className="text-xs font-semibold text-orange-500 uppercase tracking-wide">
                        ✈️ Best Pick
                      </span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {route.airlines.map((airline, idx) => (
                          <button 
                            key={idx} 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRouteAirlineClick(route.airlines, route.from, route.to);
                            }}
                            className="text-xs sm:text-sm bg-gradient-to-r from-orange-400/20 to-orange-500/20 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-full border border-orange-400/30 font-semibold hover:from-orange-400/30 hover:to-orange-500/30 hover:border-orange-500/50 transition-all cursor-pointer"
                          >
                            {airline}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-secondary/50 rounded-xl p-4 mt-6"
            >
              <h4 className="font-medium text-foreground mb-2">✈️ Mountain Flight Tip</h4>
              <p className="text-sm text-muted-foreground">
                The Kathmandu to Lukla flight is one of the world's most scenic and thrilling flights, 
                offering close-up views of Everest. Book early during peak trekking season!
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
    </>
  );
};

export default FlightBooking;
