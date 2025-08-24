# Create New Post UI Design Specifications

## Overview

This document outlines the UI components and design system for the "create new post" feature, following UX research recommendations and modern design patterns.

## Design System Foundation

### Color System

- **Primary**: CSS variable `--primary` - Main brand color for CTAs
- **Secondary**: CSS variable `--secondary` - Supporting actions
- **Muted**: CSS variable `--muted` - Subtle backgrounds and secondary text
- **Border**: CSS variable `--border` - Clean separators
- **Destructive**: CSS variable `--destructive` - Error states

### Typography Scale

- **Display**: `text-3xl` (30px) - Page titles
- **H2**: `text-2xl` (24px) - Section headers
- **H3**: `text-xl` (20px) - Card titles
- **Body**: `text-base` (16px) - Default text
- **Small**: `text-sm` (14px) - Secondary text
- **Tiny**: `text-xs` (12px) - Captions

### Spacing System

- **Container**: `max-w-4xl mx-auto px-4 py-8`
- **Section gap**: `space-y-6`
- **Element gap**: `gap-4`
- **Form spacing**: `space-y-2`

## Component Architecture

### 1. Posts List Page (`/posts`)

**File**: `/src/routes/posts.tsx`

#### Layout Structure

```
Header Section
├── Title + Description
└── Adaptive CTA Button

Content Area
├── Empty State (when no posts)
└── Posts List (when posts exist)

Mobile FAB (when posts exist)
└── Floating Action Button
```

#### Key Features

- **Adaptive Interface**: Large CTA for empty state, compact button for existing posts
- **Mobile FAB**: Floating action button appears only on mobile when posts exist
- **Responsive Design**: Single column on mobile, optimized touch targets
- **Empty State**: Engaging illustration with clear call-to-action

#### Component States

- **Empty State**: `EmptyState` component with illustration and primary CTA
- **Posts List**: `PostsList` component with hover effects and action buttons
- **Loading State**: Skeleton screens (future enhancement)

### 2. New Post Creation Page (`/posts/new`)

**File**: `/src/routes/posts/new.tsx`

#### Layout Structure

```
Header
├── Back Button
├── Title + Status
└── Action Buttons (Preview, Save)

Form
├── Title Input (required)
├── Content Textarea
└── Character Counters

Mobile Actions
├── Preview Button
└── Save Draft Button

Footer
├── Publish Button (primary)
├── Cancel Button
└── Writing Tips
```

#### Key Features

- **Auto-save**: Visual feedback with loading states and confirmation
- **Progressive Enhancement**: Core form works without JavaScript
- **Mobile-first**: Touch-friendly inputs and button sizes
- **Clear Validation**: Required field indicators and character limits
- **Status Communication**: Real-time save status and drafts

## UI Components Specifications

### Button Variants

```typescript
// Primary CTA
<Button size="lg">Publish Post</Button>

// Secondary Action
<Button variant="outline">Save Draft</Button>

// Ghost Action
<Button variant="ghost" size="sm">Edit</Button>

// Icon Button
<Button variant="ghost" size="icon">
  <ArrowLeft className="w-4 h-4" />
</Button>

// Mobile FAB
<Button size="icon" className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg">
```

### Form Controls

```typescript
// Text Input
<Input
  className="text-lg h-12"
  placeholder="Enter your post title..."
  maxLength={100}
  autoFocus
/>

// Textarea
<Textarea
  className="min-h-[400px] text-base leading-relaxed resize-none"
  placeholder="Write your post content here..."
  maxLength={5000}
/>

// Label
<Label className="text-base font-medium">
  Title *
</Label>
```

### Interactive States

#### Button States

- **Default**: Clean, accessible with proper contrast
- **Hover**: Subtle background color change (`hover:bg-accent`)
- **Focus**: Ring outline for keyboard navigation (`focus-visible:ring-2`)
- **Active**: Slightly pressed appearance
- **Disabled**: Reduced opacity (`disabled:opacity-50`)
- **Loading**: Spinner icon with "Publishing..." text

#### Input States

- **Default**: Clean border with placeholder text
- **Focus**: Ring outline and border color change
- **Error**: Red border and error message (future enhancement)
- **Disabled**: Grayed out appearance

### Responsive Design

#### Breakpoints

- **Mobile**: `< 640px` - Single column, stacked buttons, mobile FAB
- **Tablet**: `640px - 1024px` - Larger touch targets, side-by-side buttons
- **Desktop**: `> 1024px` - Optimized for mouse interaction

#### Mobile Optimizations

- **Touch Targets**: Minimum 44px height for buttons
- **Thumb Reach**: FAB positioned in natural thumb zone
- **Keyboard**: Proper input focus and virtual keyboard handling
- **Gestures**: Swipe-friendly card interactions

### Accessibility Features

#### WCAG 2.1 AA Compliance

- **Color Contrast**: All text meets 4.5:1 contrast ratio
- **Focus Management**: Clear focus indicators and logical tab order
- **Screen Readers**: Semantic HTML with ARIA labels
- **Keyboard Navigation**: All interactions accessible via keyboard
- **Touch Accessibility**: Adequate touch target sizes

#### Inclusive Design

- **Motion**: Respects `prefers-reduced-motion` (future enhancement)
- **High Contrast**: Works with system high contrast modes
- **Font Scaling**: Responsive to user font size preferences

## Animation & Micro-interactions

### Subtle Animations

- **Hover Effects**: `transition-colors` for smooth color changes
- **Loading States**: Spinner animation with `animate-spin`
- **Page Transitions**: Future enhancement with Framer Motion
- **Form Feedback**: Smooth status message appearances

### Performance Considerations

- **CSS Transforms**: Hardware-accelerated animations
- **Debounced Auto-save**: Prevents excessive API calls
- **Optimistic Updates**: Immediate UI feedback

## Implementation Notes

### Required Dependencies

```json
{
  "@radix-ui/react-label": "^2.1.1",
  "@radix-ui/react-slot": "^1.2.3",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "lucide-react": "^0.539.0",
  "tailwind-merge": "^2.6.0"
}
```

### Path Aliases

- `@/*` - Points to `src/*` directory
- `@app/*` - Points to `src/*` directory (existing)

### Quick Implementation Commands

```bash
# Install new dependency
pnpm add @radix-ui/react-label

# Start development server
pnpm dev

# Build for production
pnpm build
```

## File Structure

```
src/
├── components/ui/
│   ├── button.tsx
│   ├── input.tsx
│   ├── textarea.tsx
│   └── label.tsx
├── lib/
│   └── utils.ts
└── routes/
    ├── posts.tsx
    └── posts/
        └── new.tsx
```

## Future Enhancements

1. **Rich Text Editor**: Upgrade textarea to markdown editor
2. **Image Upload**: Add image handling capabilities
3. **Auto-save Hook**: Extract auto-save logic into reusable hook
4. **Draft Management**: Save/restore drafts from localStorage
5. **Keyboard Shortcuts**: Add Cmd+S for save, Cmd+Enter for publish
6. **Preview Mode**: Side-by-side or modal preview functionality

This design system prioritizes rapid development while maintaining high-quality user experience and accessibility standards.
