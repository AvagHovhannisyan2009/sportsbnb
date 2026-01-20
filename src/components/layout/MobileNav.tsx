import { Link, useLocation } from "react-router-dom";
import { Search, Users, LayoutDashboard, User, Building2, Calendar, ClipboardList } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const MobileNav = () => {
  const location = useLocation();
  const { profile } = useAuth();

  const isOwner = profile?.user_type === "owner";

  const playerNavItems = [
    { href: "/discover", label: "Discover", icon: Search },
    { href: "/games", label: "Games", icon: Users },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/profile", label: "Profile", icon: User },
  ];

  const ownerNavItems = [
    { href: "/owner/venues", label: "Venues", icon: Building2 },
    { href: "/owner/schedule", label: "Schedule", icon: Calendar },
    { href: "/owner/bookings", label: "Bookings", icon: ClipboardList },
    { href: "/profile", label: "Profile", icon: User },
  ];

  const navItems = isOwner ? ownerNavItems : playerNavItems;

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 safe-area-pb">
      <div className="grid grid-cols-4 h-14">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors active:scale-95 ${
                isActive(item.href)
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
