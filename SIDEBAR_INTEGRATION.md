# Sidebar Component Integration

## Overview
This document outlines the integration of a modern, animated sidebar component into your Next.js nicotine pouches project.

## ✅ Project Setup Status

Your project already has the required setup:
- ✅ **shadcn/ui structure** - `/components/ui` folder exists
- ✅ **Tailwind CSS** - Properly configured with custom colors and animations
- ✅ **TypeScript** - Full TypeScript support
- ✅ **Lucide React** - Icon library already installed

## 📦 Dependencies Added

```bash
npm install framer-motion
```

## 🗂️ File Structure

```
src/
├── components/
│   └── ui/
│       ├── sidebar.tsx          # Main sidebar component
│       └── sidebar-demo.tsx     # Demo component
├── app/
│   ├── dashboard/
│   │   └── page.tsx            # Updated dashboard with sidebar
│   └── sidebar-demo/
│       └── page.tsx            # Demo page
```

## 🎯 Component Features

### Sidebar Component (`/components/ui/sidebar.tsx`)
- **Animated sidebar** with hover-to-expand functionality
- **Mobile responsive** with slide-out menu
- **Context-based state management** for open/close state
- **Customizable animations** with Framer Motion
- **Dark mode support** built-in

### Key Components:
- `Sidebar` - Main wrapper component
- `SidebarProvider` - Context provider for state management
- `SidebarBody` - Container for sidebar content
- `DesktopSidebar` - Desktop version with hover animations
- `MobileSidebar` - Mobile version with slide-out menu
- `SidebarLink` - Individual navigation links

## 🚀 Usage Examples

### Basic Usage
```tsx
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar';
import { Heart, Bell } from 'lucide-react';

const MyComponent = () => {
  const [open, setOpen] = useState(false);
  
  const links = [
    {
      label: "Favourites",
      href: "/favourites",
      icon: <Heart className="h-5 w-5" />,
    },
    {
      label: "Alerts",
      href: "/alerts", 
      icon: <Bell className="h-5 w-5" />,
      onClick: () => console.log('Custom action'),
    },
  ];

  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody>
        <div className="flex flex-col gap-2">
          {links.map((link, idx) => (
            <SidebarLink key={idx} link={link} />
          ))}
        </div>
      </SidebarBody>
    </Sidebar>
  );
};
```

### Dashboard Integration
The dashboard (`/app/dashboard/page.tsx`) has been updated to use the new sidebar:
- **Tab switching** between Favourites and Price Alerts
- **URL state management** for deep linking
- **User profile** display in sidebar
- **Responsive design** for all screen sizes

## 🎨 Customization

### Styling
The sidebar uses Tailwind classes and can be customized via:
- **Colors**: Modify `bg-neutral-100` and `text-neutral-700` classes
- **Animations**: Adjust `duration-150` and `ease-in-out` classes
- **Spacing**: Change `gap-2`, `py-2`, `px-4` classes

### Animation Behavior
- **Desktop**: Hover to expand, auto-collapse on mouse leave
- **Mobile**: Tap menu icon to slide in from left
- **Smooth transitions** with Framer Motion

## 📱 Responsive Behavior

- **Desktop (md+)**: Fixed sidebar with hover animations
- **Mobile (<md)**: Collapsible sidebar with slide-out menu
- **Touch-friendly** navigation on mobile devices

## 🔧 Configuration Options

### Sidebar Props
```tsx
interface SidebarProps {
  open?: boolean;                    // Controlled open state
  setOpen?: (open: boolean) => void; // State setter
  animate?: boolean;                 // Enable/disable animations
}
```

### Link Props
```tsx
interface Links {
  label: string;                     // Link text
  href: string;                      // Navigation URL
  icon: React.JSX.Element;          // Icon component
  onClick?: () => void;             // Custom click handler
}
```

## 🌐 Demo Pages

1. **Dashboard**: `/dashboard` - Full dashboard with integrated sidebar
2. **Sidebar Demo**: `/sidebar-demo` - Standalone component demo

## 🎯 Integration Benefits

1. **Consistent Navigation** - Unified sidebar across all pages
2. **Better UX** - Smooth animations and responsive design
3. **Accessibility** - Proper ARIA labels and keyboard navigation
4. **Maintainability** - Reusable component with clear API
5. **Performance** - Optimized animations with Framer Motion

## 🔄 State Management

The sidebar uses React Context for state management:
- **Global state** accessible via `useSidebar()` hook
- **Automatic state synchronization** between desktop and mobile
- **URL state persistence** for deep linking

## 🎨 Design System Integration

The sidebar integrates seamlessly with your existing design system:
- **shadcn/ui components** for consistency
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Custom color scheme** matching your brand

## 🚀 Next Steps

1. **Customize styling** to match your brand colors
2. **Add more navigation items** as needed
3. **Implement user preferences** for sidebar behavior
4. **Add breadcrumb navigation** if needed
5. **Integrate with your authentication system** (already done)

The sidebar is now fully integrated and ready to use across your application!
