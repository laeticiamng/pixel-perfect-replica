import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/PageLayout";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <PageLayout className="flex items-center justify-center px-6">
      <div className="text-center">
        <div className="text-8xl mb-6">🔍</div>
        <h1 className="mb-3 text-5xl font-bold text-foreground">404</h1>
        <p className="mb-2 text-xl text-foreground">Page introuvable</p>
        <p className="mb-8 text-muted-foreground">
          Cette page n'existe pas ou a été déplacée
        </p>
        <Button
          onClick={() => navigate("/")}
          className="bg-coral hover:bg-coral-dark text-primary-foreground rounded-xl px-6"
        >
          <Home className="h-4 w-4 mr-2" />
          Retour à l'accueil
        </Button>
      </div>
    </PageLayout>
  );
};

export default NotFound;
