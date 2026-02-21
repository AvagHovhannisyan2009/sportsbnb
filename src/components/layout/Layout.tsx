import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import MobileNav from "./MobileNav";
import { AIChatbot } from "@/components/chat/AIChatbot";

interface LayoutProps {
  children: ReactNode;
  showFooter?: boolean;
  showMobileNav?: boolean;
}

const Layout = ({ children, showFooter = true, showMobileNav = true }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-14 md:pb-0">
        {children}
      </main>
      {showFooter && <Footer />}
      {showMobileNav && <MobileNav />}
      <AIChatbot />
    </div>
  );
};

export default Layout;
