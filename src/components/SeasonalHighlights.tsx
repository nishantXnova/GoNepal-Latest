import { motion } from "framer-motion";
import { Sun, Cloud, Leaf, Snowflake } from "lucide-react";

const seasons = [
  {
    name: "Spring",
    months: "March - May",
    icon: Sun,
    description: "Rhododendrons bloom across the hills. Perfect trekking weather with clear mountain views.",
    highlights: ["Wildflower blooms", "Holi festival", "Clear skies"],
    bestFor: "Trekking, Photography",
  },
  {
    name: "Monsoon",
    months: "June - August",
    icon: Cloud,
    description: "Lush green landscapes and fewer tourists. Great for cultural experiences and budget travel.",
    highlights: ["Green valleys", "Lower prices", "Cultural tours"],
    bestFor: "Culture, Budget Travel",
  },
  {
    name: "Autumn",
    months: "September - November",
    icon: Leaf,
    description: "Peak season with crystal-clear visibility. The best time for mountain views and festivals.",
    highlights: ["Best visibility", "Dashain festival", "Ideal weather"],
    bestFor: "Trekking, Festivals",
  },
  {
    name: "Winter",
    months: "December - February",
    icon: Snowflake,
    description: "Crisp, clear days with stunning mountain views. Perfect for lower altitude treks.",
    highlights: ["Snow-capped peaks", "Wildlife spotting", "Fewer crowds"],
    bestFor: "Wildlife, Photography",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

const SeasonalHighlights = () => {
  return (
    <section className="section-padding bg-secondary relative overflow-hidden">
      <div className="container-wide relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-4 mb-6">
            <div className="h-[1px] w-8 bg-accent" />
            <p className="text-accent uppercase tracking-[0.4em] text-xs font-bold">
              The Ethereal Cycle
            </p>
            <div className="h-[1px] w-8 bg-accent" />
          </div>
          <h2 className="heading-section text-foreground leading-tight">
            Nepal Has No Off-Season. Just Different Moods.
          </h2>
          <p className="text-body-large text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
            Monsoon greens the jungle. Autumn clears the peaks. Winter silences everything. Spring makes you forget the others existed.
          </p>
        </motion.div>

        {/* Seasons Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {seasons.map((season) => (
            <motion.div
              key={season.name}
              variants={cardVariants}
              whileHover={{ y: -15, transition: { duration: 0.5, ease: "easeOut" } }}
              className="group bg-card rounded-[2.5rem] p-8 relative overflow-hidden shadow-soft hover:shadow-elevated transition-all duration-700 border border-white/5"
            >
              {/* Decorative Background Element */}
              <div className={`absolute -top-12 -right-12 w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 opacity-10 blur-2xl group-hover:scale-150 transition-transform duration-700`} />

              {/* Icon */}
              <season.icon className="w-8 h-8 text-orange-400 mb-4" />

              {/* Season Name */}
              <div className="mb-6">
                <h3 className="font-display text-2xl font-bold text-foreground mb-1 group-hover:text-accent transition-colors duration-500">
                  {season.name}
                </h3>
                <p className="text-accent text-[11px] font-bold uppercase tracking-widest">{season.months}</p>
              </div>

              {/* Description */}
              <p className="text-muted-foreground/80 text-sm leading-relaxed mb-8 font-light italic">
                "{season.description}"
              </p>

              {/* Highlights */}
              <div className="flex flex-wrap gap-2 mb-8 border-t border-black/5 pt-6">
                {season.highlights.map((highlight) => (
                  <span
                    key={highlight}
                    className="bg-secondary/80 text-secondary-foreground/80 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-bold"
                  >
                    {highlight}
                  </span>
                ))}
              </div>

              {/* Best For */}
              <div className="flex items-center gap-2 mt-auto">
                <div className="h-[1px] w-4 bg-accent/30" />
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest leading-none">
                  {season.bestFor}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default SeasonalHighlights;
