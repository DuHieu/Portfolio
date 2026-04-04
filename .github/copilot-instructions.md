# Copilot Instructions for Portfolio Project

## Project Overview
This is an **interactive portfolio website** built with React, TypeScript, and modern animation libraries. The site features a glass-morphism design with animated 3D effects, interactive particle backgrounds, and smooth scrolling navigation.

**Tech Stack**: React 18+, TypeScript, Tailwind CSS, Framer Motion (motion/react), Lucide Icons, Recharts

## Architecture & Structure

### Main Components Layout
- **[src/app/App.tsx](src/app/App.tsx)**: Root component that orchestrates the full-page portfolio experience
  - Manages global dark mode and smooth scroll behavior
  - Composes section components in order: Hero → Experience → Projects → Contact
  - Hosts interactive particle background and floating navigation

### Section Components
Each section is a self-contained page module in [src/app/components/](src/app/components/):
- **HeroSection**: Landing introduction with animated gradient text
- **ExperienceSection**: Timeline of work experiences with icons and color-coded entries
- **ProjectGallery**: Bento-grid layout with responsive card sizing (`large`, `medium`, `small`)
- **ContactSection**: Contact form with animated background orbs
- **FloatingNav**: Fixed navigation bar with section anchors (smooth scroll via `a[href^="#"]`)
- **InteractiveParticles**: Particle mesh animation system (main visual feature)
- **ParticleModeIndicator**: Visual indicator for particle rendering state

### UI Components Library
[src/app/components/ui/](src/app/components/ui/) contains headless UI primitives from Radix UI + Shadcn design:
- Built with `class-variance-authority` (CVA) for variant management
- Use **`cn()` utility** ([utils.ts](src/app/components/ui/utils.ts)) to merge Tailwind classes: `cn(baseClass, conditionalClass)`
- All components export named exports (e.g., `export { Button, buttonVariants }`)

### Styling System
**Key CSS Files**:
- [src/styles/tailwind.css](src/styles/tailwind.css): Tailwind engine with custom animation imports
- [src/styles/theme.css](src/styles/theme.css): Design token system with CSS variables
  - **Color palette**: Electric Blue (`#00D9FF`), Vivid Violet (`#A855F7`), Deep Black (`#0A0A0A`)
  - **Glass-morphism tokens**: `--glass-white`, `--glass-border` for backdrop blur effects

**Patterns**:
- Gradient text: `className="bg-gradient-to-r from-[#00D9FF] to-[#A855F7] bg-clip-text text-transparent"`
- Glass cards: `className="backdrop-blur-xl bg-white/5 border border-white/20 rounded-3xl"`
- Tracking/letter-spacing: Most text uses `tracking-wide` for premium feel

## Animation & Motion Patterns

### Framer Motion Usage (motion/react)
**Common patterns**:
```tsx
<motion.div
  initial={{ opacity: 0, y: 50 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: '-50px' }}
  transition={{ duration: 0.6, delay: index * 0.1 }}
/>
```

**Key concepts**:
- `whileInView`: Trigger animation when element enters viewport
- `viewport={{ once: true }}`: Animation plays only once (on first scroll into view)
- `margin: '-50px'`: Start animation before element is fully visible
- **Z-axis transforms**: Cards use `rotateX`, `scale` for 3D hover effects
- **Infinite loops**: Background elements use `repeat: Infinity` for continuous animation

## Data Structures

### Projects Array (ProjectGallery)
```tsx
{
  title: string;
  description: string;
  tags: string[];
  gradient: string; // Tailwind gradient class e.g., 'from-[#00D9FF] to-[#0088CC]'
  size: 'large' | 'medium' | 'small'; // Controls grid span via Bento layout
}
```

### Experience Array (ExperienceSection)
```tsx
{
  company: string;
  position: string;
  period: string;
  logo: string; // Emoji or unicode character
  color: string; // Tailwind gradient class
}
```

## Critical Workflows

### Adding New Sections
1. Create component in [src/app/components/](src/app/components/) (e.g., `new-section.tsx`)
2. Import and add to main `<main>` in [App.tsx](src/app/App.tsx)
3. Use `<motion.div>` wrapper with `id` prop for navigation anchor (e.g., `id="new-section"`)
4. Add navigation item to [floating-nav.tsx](src/app/components/floating-nav.tsx) `navItems` array

### Adding Projects/Experiences
- Modify array at top of component file (e.g., `projects[]` in ProjectGallery)
- Update corresponding UI to render new data properties

### Styling New Components
1. Use `cn()` utility to combine base + conditional Tailwind classes
2. Apply glass-morphism via: `backdrop-blur-xl bg-white/5 border border-white/20`
3. Add gradient text for emphasis: Use `bg-gradient-to-r from-[#00D9FF] to-[#A855F7]` pattern
4. Use motion library for entrance/hover animations with 3D transforms

## Important Conventions

- **Smooth scrolling**: Handled globally in `App.tsx` `useEffect` - all `href="#section"` anchors work automatically
- **Dark mode**: Hardcoded in App.tsx: `document.documentElement.classList.add('dark')` - theme always dark
- **Responsive**: Mobile-first: `px-4` base, `md:` breakpoints for larger screens, `max-w-7xl` container
- **Typography**: Using Inter font family, `tracking-wide` for letterspacing throughout
- **No explicit build commands**: Project is likely Vite or Next.js - check root for `vite.config.ts` or `next.config.js`

## Key Files to Reference

| Purpose | File |
|---------|------|
| Component composition | [src/app/App.tsx](src/app/App.tsx) |
| Motion patterns | [src/app/components/project-gallery.tsx](src/app/components/project-gallery.tsx) |
| Form handling | [src/app/components/contact-section.tsx](src/app/components/contact-section.tsx) |
| UI primitives | [src/app/components/ui/button.tsx](src/app/components/ui/button.tsx), [utils.ts](src/app/components/ui/utils.ts) |
| Theme tokens | [src/styles/theme.css](src/styles/theme.css) |
| Navigation setup | [src/app/components/floating-nav.tsx](src/app/components/floating-nav.tsx) |

## External Dependencies
- **framer-motion** (`motion/react`): Animation and gesture library
- **lucide-react**: Icon library
- **@radix-ui/react-***: Unstyled accessible component primitives
- **class-variance-authority**: Variant management for styled components
- **recharts**: Chart/graph rendering (in Chart UI component)
