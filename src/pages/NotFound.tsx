import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/PageLayout";
import { Home, Search } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { logger } from "@/lib/logger";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    logger.ui.warning(`404: attempted to access ${location.pathname}`);
  }, [location.pathname]);

  return (
    <PageLayout className="flex items-center justify-center px-6">
      <div className="text-center">
        <div className="w-20 h-20 rounded-full bg-coral/20 flex items-center justify-center mx-auto mb-6">
          <Search className="h-10 w-10 text-coral" />
        </div>
        <h1 className="mb-3 text-5xl font-bold text-foreground">404</h1>
        <p className="mb-2 text-xl text-foreground">{t('notFound.title')}</p>
        <p className="mb-8 text-muted-foreground">
          {t('notFound.description')}
        </p>
        <Button
          onClick={() => navigate("/")}
          className="bg-coral hover:bg-coral-dark text-primary-foreground rounded-xl px-6"
        >
          <Home className="h-4 w-4 mr-2" />
          {t('notFound.backHome')}
        </Button>
      </div>
    </PageLayout>
  );
};

export default NotFound;
