# Dravya Labs - Frontend Design Analysis & Guidelines

This document serves as the central hub for analyzing the current state of the Dravya Labs frontend UI and outlining corrections and guidelines for future development.

## 1. Current Design System Architecture

The frontend is built on a modern, premium stack combining **Next.js App Router**, **Tailwind CSS v4**, and **Shadcn UI**. The aesthetic goal is **"Ancient Wisdom, Modern Science"**—blending the organic, calming nature of Ayurveda with the sleek, dynamic feel of an AI platform.

### Typography & Fonts
- **Primary Fonts**: Manrope (Modern, clean, tech-forward) and Noto Sans (Highly readable).
- **Styling**: Large, tracking-tight hero headings paired with highly readable, relaxed-line-height body text.

### Color Palette & Theming
- **Base Backgrounds**: Deep navy/space blues (`#0a192f`, `#1a2b40`) provide a dark, premium canvas.
- **Accents**: 
  - **Wellness Green** (`#52d677`): Primary brand color, used for buttons, icons, and active states.
  - **Tech Blue** (`#4285f4`): Used in gradients to represent the AI/Tech aspect.
- **Chat Interface**: Dedicated organic green theme (`--chat-bg-dark: #102218`, `--chat-primary: #2bee7c`).

### Animations
The project features a highly custom animation system defined in `globals.css`:
- **Organic Motion**: `wellnessFloat`, `wellnessBreathe`, and `wellnessPulse` for elements that should feel "alive".
- **Interactions**: `.hover-lift` class for cards to provide satisfying depth on hover.

---

## 2. Critical UI Issues & Immediate Corrections Needed

Based on a codebase analysis, here are the most pressing UI/UX issues that need to be corrected:

### A. Theming Clash (Shadcn Variables vs. Custom Hex)
- **The Issue**: In `globals.css`, the default Shadcn variables are set for a light theme (`--background: hsl(0 0% 100%)`), but the application's custom variables (`--color-bg-primary: #0a192f`) enforce a dark theme. 
- **The Consequence**: If you add a Shadcn component like a `Dialog`, `DropdownMenu`, or `Popover`, it will render as bright white with black text, completely clashing with the dark Navy backgrounds.
- **The Fix**: Update the Shadcn `:root` CSS variables in `globals.css` to match the dark theme by default, or ensure all Shadcn components are wrapped in a `.dark` class provider.

### B. Glassmorphism Consistency
- **The Issue**: In `LandingNavbar.tsx`, the background was recently updated to `bg-white/100`, which removes the transparent glass effect.
- **The Fix**: For navbars floating over rich backgrounds (like the hero video), use translucent backgrounds with blurs (e.g., `bg-white/10 backdrop-blur-md` or `bg-slate-900/60 backdrop-blur-lg`) to maintain a premium, cohesive aesthetic.

### C. Typography Scaling Collisions
- **The Issue**: There are mobile-specific media queries in `globals.css` that force font sizes (e.g., `h1 { font-size: 2rem !important; }`), which can conflict with Tailwind's utility classes (`text-4xl sm:text-5xl`).
- **The Fix**: Remove `!important` CSS overrides for typography. Rely strictly on Tailwind's responsive prefixes (e.g., `text-3xl md:text-5xl lg:text-7xl`) directly in the components for predictable scaling.

---

## 3. Folder Structure & Architecture

The app has recently been reorganized to follow Next.js best practices:
- **Route Groups**: `(auth)`, `(main)`, `(professional)`, and `(public)` keep the URLs clean while separating layouts.
- **Components**: Segregated into `navigation/` and `features/`.

### Guidelines for New Components
1. **`components/ui/`**: Strictly reserve this for generic, reusable Shadcn components (Buttons, Inputs, Dialogs). Do not put business logic here.
2. **`components/shared/`**: Create this folder for recurring Dravya-specific UI elements (e.g., `HerbalCard.tsx`, `SectionHeader.tsx`).
3. **`components/navigation/`**: Keep all sidebars, topbars, and navbars here.

---

## 4. Future Design Directives (How to proceed)

When building new screens or correcting the UI, adhere to these principles:

1. **Prioritize Contrast**: Ensure text against the dark navy backgrounds has at least a 4.5:1 contrast ratio. Use `--color-text-secondary` (`#a8b2d1`) for descriptions, never pure grey.
2. **Micro-animations**: Use the existing `.animate-wellness-fade-in` and `.hover-lift` classes to make the UI feel responsive, but do not over-animate every single element. 
3. **Rounded Corners**: The design system uses large border radii (e.g., `rounded-2xl`, `rounded-3xl`) to feel friendly and organic. Avoid sharp, square corners unless necessary for data tables.
4. **Gradients**: Use gradients sparingly to draw attention (like the `text-gradient-green` class for primary headings), rather than as massive background fills that distract from the content.
