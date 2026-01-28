import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Camera, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuthStore();
  
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [university, setUniversity] = useState(user?.university || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!firstName.trim()) {
      toast.error('Le prénom est requis');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    updateProfile({
      firstName: firstName.trim(),
      university: university.trim() || undefined,
    });
    
    setIsLoading(false);
    toast.success('Profil mis à jour !');
    navigate('/profile');
  };

  return (
    <div className="min-h-screen bg-gradient-radial">
      {/* Header */}
      <header className="safe-top px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate('/profile')}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-6 w-6 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Modifier le profil</h1>
        <div className="w-10" /> {/* Spacer */}
      </header>

      <div className="px-6 py-8">
        {/* Avatar */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-coral flex items-center justify-center glow-coral">
              <span className="text-4xl font-bold text-primary-foreground">
                {firstName.charAt(0).toUpperCase() || '?'}
              </span>
            </div>
            <button className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-deep-blue-light border-2 border-background flex items-center justify-center hover:bg-muted transition-colors">
              <Camera className="h-5 w-5 text-foreground" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Prénom</label>
            <Input
              type="text"
              placeholder="Ton prénom"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="h-14 bg-deep-blue-light border-border text-foreground placeholder:text-muted-foreground rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Université</label>
            <Input
              type="text"
              placeholder="Ton université (optionnel)"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              className="h-14 bg-deep-blue-light border-border text-foreground placeholder:text-muted-foreground rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email</label>
            <Input
              type="email"
              value={user?.email || ''}
              disabled
              className="h-14 bg-deep-blue-light/50 border-border text-muted-foreground rounded-xl cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">L'email ne peut pas être modifié</p>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8">
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="w-full h-14 bg-coral hover:bg-coral-dark text-primary-foreground rounded-xl text-lg font-semibold glow-coral"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              'Enregistrer'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
