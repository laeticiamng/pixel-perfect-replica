import { useState } from 'react';
import { Loader2, Search, ExternalLink, Calendar, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useEventScraper } from '@/hooks/useEventScraper';
import toast from 'react-hot-toast';

interface ScrapedEvent {
  id: string;
  name: string;
  description: string | null;
  location_name: string;
  starts_at: string;
  ends_at: string;
}

export function EventScraperCard() {
  const { scrapeEvents, isLoading, error } = useEventScraper();
  const [universityUrl, setUniversityUrl] = useState('');
  const [city, setCity] = useState('Paris');
  const [results, setResults] = useState<{
    scraped_pages: number;
    events_found: number;
    events_imported: number;
    events: ScrapedEvent[];
  } | null>(null);

  const handleScrape = async () => {
    if (!universityUrl.trim()) {
      toast.error('Veuillez entrer une URL');
      return;
    }

    const data = await scrapeEvents(universityUrl.trim(), city.trim());
    if (data) {
      setResults(data);
      toast.success(`${data.events_imported} événements importés !`);
    }
  };

  const presetUrls = [
    { label: 'Sorbonne', url: 'https://www.sorbonne-universite.fr/evenements', city: 'Paris' },
    { label: 'Sciences Po', url: 'https://www.sciencespo.fr/fr/actualites', city: 'Paris' },
    { label: 'Lyon 1', url: 'https://www.univ-lyon1.fr/agenda', city: 'Lyon' },
    { label: 'Bordeaux', url: 'https://www.u-bordeaux.fr/actualites-agenda', city: 'Bordeaux' },
  ];

  return (
    <Card className="glass border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5 text-coral" />
          Scraping d'événements universitaires
        </CardTitle>
        <CardDescription>
          Utilise Firecrawl pour extraire automatiquement les événements des sites universitaires
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preset buttons */}
        <div className="flex flex-wrap gap-2">
          {presetUrls.map((preset) => (
            <Button
              key={preset.label}
              variant="outline"
              size="sm"
              onClick={() => {
                setUniversityUrl(preset.url);
                setCity(preset.city);
              }}
              className="text-xs"
            >
              {preset.label}
            </Button>
          ))}
        </div>

        {/* Form */}
        <div className="space-y-3">
          <div>
            <Label htmlFor="universityUrl">URL de la page événements</Label>
            <Input
              id="universityUrl"
              value={universityUrl}
              onChange={(e) => setUniversityUrl(e.target.value)}
              placeholder="https://universite.fr/evenements"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="city">Ville</Label>
            <Input
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Paris"
              className="mt-1"
            />
          </div>
        </div>

        <Button
          onClick={handleScrape}
          disabled={isLoading || !universityUrl.trim()}
          className="w-full bg-coral hover:bg-coral/90"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Scraping en cours...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Lancer le scraping
            </>
          )}
        </Button>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="space-y-4 mt-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-signal-green/10 text-signal-green">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">
                {results.scraped_pages} pages analysées • {results.events_found} événements trouvés • {results.events_imported} importés
              </span>
            </div>

            {results.events.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {results.events.map((event) => (
                  <div
                    key={event.id}
                    className="p-3 rounded-lg bg-muted/50 border border-border"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate">{event.name}</h4>
                        {event.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {event.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.location_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(event.starts_at).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Importé
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
