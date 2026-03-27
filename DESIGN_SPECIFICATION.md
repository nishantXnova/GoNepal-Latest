# Design Specification for Review Page

This document provides the complete design system guidelines for the Go Nepal travel app to ensure consistency when creating a new review page.

---

## 1. Color Palette

### Light Mode Colors (Primary)
| Color Name | CSS Variable | HSL Value | Usage |
|------------|--------------|-----------|-------|
| Background | `--background` | `40 30% 98%` | Page backgrounds, off-white warm |
| Foreground | `--foreground` | `220 20% 15%` | Body text, dark charcoal |
| Primary | `--primary` | `220 60% 25%` | Buttons, links, deep mountain blue |
| Primary Foreground | `--primary-foreground` | `40 30% 98%` | Text on primary backgrounds |
| Secondary | `--secondary` | `35 40% 92%` | Cards, sections, warm cream |
| Secondary Foreground | `--secondary-foreground` | `220 20% 15%` | Text on secondary |
| Accent | `--accent` | `25 85% 55%` | Highlights, CTAs, terracotta/amber |
| Accent Foreground | `--accent-foreground` | `40 30% 98%` | Text on accent |
| Muted | `--muted` | `35 25% 90%` | Subtle backgrounds |
| Muted Foreground | `--muted-foreground` | `220 15% 45%` | Secondary text |
| Border | `--border` | `35 30% 88%` | Dividers, input borders |

### Nepal-Themed Colors
| Color Name | CSS Variable | HSL Value |
|------------|--------------|-----------|
| Nepal Gold | `--nepal-gold` | `38 90% 50%` |
| Nepal Terracotta | `--nepal-terracotta` | `15 70% 50%` |
| Nepal Forest | `--nepal-forest` | `160 40% 25%` |
| Nepal Sky | `--nepal-sky` | `200 70% 55%` |
| Nepal Snow | `--nepal-snow` | `210 30% 96%` |
| Nepal Stone | `--nepal-stone` | `30 15% 40%` |

### Dark Mode Colors
| Color Name | CSS Variable | HSL Value |
|------------|--------------|-----------|
| Background | `--background` | `220 25% 8%` |
| Foreground | `--foreground` | `40 20% 95%` |
| Primary | `--primary` | `38 90% 55%` (gold!) |
| Primary Foreground | `--primary-foreground` | `220 25% 8%` |

---

## 2. Typography

### Font Families
| Element | Font Family | Fallback |
|---------|-------------|----------|
| Headings (h1-h6) | `'Playfair Display'` | serif |
| Body text | `'Inter'` | sans-serif |
| UI Components | `'Inter'` | sans-serif |

### Google Fonts Import
```css
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Inter:wght@300;400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap');
```

### Typography Classes
- **Display headings**: `heading-display` → text-6xl to text-9xl, bold, tracking-tight
- **Section headings**: `heading-section` → text-4xl to text-6xl, semibold
- **Body large**: `text-body-large` → text-xl to text-2xl, leading-relaxed, font-light

---

## 3. Spacing & Layout

### Container
- Max width: `1400px`
- Padding: `px-6 sm:px-10 lg:px-16`

### Section Padding
- Default: `py-16 md:py-20 lg:py-24`

### Border Radius
- Default radius: `0.75rem` (12px)
- Large: `lg`
- Medium: `md`
- Small: `sm`
- Full/rounded: `rounded-full`

### Responsive Breakpoints
- Mobile: default
- SM: 640px
- MD: 768px
- LG: 1024px
- XL: 1280px
- 2XL: 1400px

---

## 4. Shadows

| Shadow Name | CSS Value | Usage |
|-------------|-----------|-------|
| Soft | `0 4px 20px -4px hsl(220 20% 15% / 0.1)` | Buttons, small elements |
| Card | `0 8px 30px -8px hsl(220 20% 15% / 0.12)` | Cards, hover states |
| Elevated | `0 20px 50px -15px hsl(220 20% 15% / 0.2)` | Modals, dropdowns |

---

## 5. Gradients

| Gradient Name | CSS Value |
|---------------|-----------|
| Hero | `linear-gradient(135deg, hsl(220 60% 20% / 0.9), hsl(25 85% 45% / 0.7))` |
| Warm | `linear-gradient(180deg, hsl(35 40% 95%), hsl(40 30% 98%))` |
| Mountain | `linear-gradient(180deg, hsl(200 70% 85%), hsl(220 60% 25%))` |
| Sunset | `linear-gradient(135deg, hsl(25 90% 55%), hsl(350 80% 50%))` |

---

## 6. Component Patterns

### Primary Button
```css
.bg-primary text-primary-foreground hover:bg-primary/90 
transition-transform duration-200 shadow-soft 
hover:shadow-elevated hover:scale-105 active:scale-95 rounded-full
```

### Accent Button
```css
.bg-accent text-accent-foreground hover:bg-accent/90 
transition-transform duration-200 shadow-soft 
hover:shadow-elevated hover:scale-105 active:scale-95 rounded-full
```

### Card Component
- Background: `bg-card`
- Border: `border-border`
- Shadow: `shadow-card`
- Hover: `hover:shadow-elevated hover:-translate-y-2` (use `.card-hover` class)

### Glass Effect
```css
backdrop-blur-xl bg-background/60 border border-white/10
```

---

## 7. Animations

### Custom Animations
- `animate-fade-up` - Slide up with fade
- `animate-fade-in` - Simple fade in
- `animate-scale-in` - Scale from 0.95 to 1
- `animate-slide-in-left` - Slide from left
- `animate-slide-in-right` - Slide from right

### Predefined Animations
- `float` - Floating effect (6s, infinite)
- `shimmer` - Shimmer effect for loading states

---

## 8. UI Elements to Match

### Buttons
- Use `btn-primary` or `btn-accent` classes
- Rounded full (`rounded-full`)
- Hover scale effect (1.05)
- Active scale effect (0.95)

### Form Inputs
- Border color: `border-input` (hsl(35 30% 88%))
- Ring color: `ring-primary` (hsl(220 60% 25%))
- Border radius: `0.75rem`

### Cards
- Background: `bg-card`
- Use `.card-hover` for interactive cards

### Star Ratings
- Use `--nepal-gold` (hsl(38 90% 50%)) for filled stars
- Use `--muted` for empty stars

---

## 9. Dark Mode Implementation

Add class `dark` to `<html>` element for dark mode. Use Tailwind's `dark:` prefix for dark mode styles.

---

## 11. Icons

The project uses **Lucide React** for all icons.

### Package
```json
"lucide-react": "^0.462.0"
```

### Usage Example
```tsx
import { Star, User, MapPin, Calendar, ChevronRight } from 'lucide-react';

// Star icon for ratings (use nepal-gold color)
<Star className="w-5 h-5 fill-nepal-gold text-nepal-gold" />

// Map pin for locations
<MapPin className="w-4 h-4 text-primary" />

// Chevron for navigation
<ChevronRight className="w-5 h-5 text-muted-foreground" />
```

### Common Icons Used in the App
- **Navigation**: `ChevronLeft`, `ChevronRight`, `ChevronDown`, `Menu`, `X`
- **Actions**: `Star`, `Heart`, `Bookmark`, `Share2`, `Edit`, `Trash2`
- **Travel**: `MapPin`, `Plane`, `Hotel`, `Calendar`, `Clock`
- **UI**: `User`, `Search`, `Filter`, `Bell`, `Settings`
- **Media**: `Image`, `Camera`, `Play`, `Volume2`
- **Feedback**: `CheckCircle`, `AlertCircle`, `Info`, `HelpCircle`

### Icon Sizing
- Small: `w-4 h-4` (16px)
- Default: `w-5 h-5` (20px)
- Medium: `w-6 h-6` (24px)
- Large: `w-8 h-8` (32px)

### Icon Colors
- Use `text-primary` for main actions
- Use `text-accent` for highlights
- Use `text-muted-foreground` for secondary icons
- Use `text-nepal-gold` for rating stars

---

## 12. Summary for AI Designer

When creating the review page:

1. **USE EXACT COLORS** from the palette above - don't improvise
2. **USE 'Playfair Display'** for all headings (h1-h6)
3. **USE 'Inter'** for all body text and UI elements
4. **USE 'rounded-full'** for buttons and interactive elements
5. **USE** the shadow classes `shadow-soft`, `shadow-card`, `shadow-elevated`
6. **FOLLOW** the button hover pattern (scale 1.05, shadow-elevated)
7. **USE** `bg-primary` for primary actions, `bg-accent` for highlights
8. **ENSURE** dark mode support using `dark:` prefix
9. **MATCH** border radius of 0.75rem (12px) on all components
10. **USE** `--nepal-gold` for ratings/stars
11. **USE Lucide React** for all icons (import from 'lucide-react')

This ensures the review page will be visually consistent with the rest of the Go Nepal application.