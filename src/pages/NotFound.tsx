import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold text-primary">404</h1>
        <p className="mb-2 text-2xl font-semibold text-foreground">{t('errors.pageNotFound')}</p>
        <p className="mb-8 text-muted-foreground">{t('errors.pageNotFoundDesc')}</p>
        <Link to="/">
          <Button className="gap-2">
            <Home className="h-4 w-4" />
            {t('errors.goHome')}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
