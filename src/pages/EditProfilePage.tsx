import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { profile, user, updateProfile, refreshProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [firstName, setFirstName] = useState(profile?.first_name || '');
  const [university, setUniversity] = useState(profile?.university || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Seules les images sont acceptées');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image trop lourde (max 2MB)');
      return;
    }

    setIsUploading(true);

    try {
      // Delete old avatar if exists
      if (avatarUrl) {
        const oldPath = avatarUrl.split('/').pop();
        if (oldPath) {
          await supabase.storage
            .from('avatars')
            .remove([`${user.id}/${oldPath}`]);
        }
      }

      // Upload new avatar
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      toast.success('Photo mise à jour !');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erreur lors de l\'upload');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!avatarUrl || !user) return;

    setIsUploading(true);
    try {
      // Extract file path from URL
      const urlParts = avatarUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      
      await supabase.storage
        .from('avatars')
        .remove([`${user.id}/${fileName}`]);

      setAvatarUrl('');
      toast.success('Photo supprimée');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!firstName.trim()) {
      toast.error('Le prénom est requis');
      return;
    }
    
    setIsLoading(true);
    
    const { error } = await updateProfile({
      first_name: firstName.trim(),
      university: university.trim() || null,
      avatar_url: avatarUrl || null,
    });
    
    setIsLoading(false);
    
    if (error) {
      toast.error('Erreur lors de la mise à jour');
    } else {
      await refreshProfile();
      toast.success('Profil mis à jour !');
      navigate('/profile');
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-gradient-radial pb-8 safe-bottom">
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
            {/* Avatar display */}
            <button
              onClick={handleAvatarClick}
              disabled={isUploading}
              className={cn(
                "w-28 h-28 rounded-full flex items-center justify-center glow-coral overflow-hidden transition-all",
                isUploading && "opacity-50",
                avatarUrl ? "" : "bg-coral"
              )}
            >
              {isUploading ? (
                <Loader2 className="h-8 w-8 animate-spin text-primary-foreground" />
              ) : avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl font-bold text-primary-foreground">
                  {firstName.charAt(0).toUpperCase() || '?'}
                </span>
              )}
            </button>
            
            {/* Camera button */}
            <button 
              onClick={handleAvatarClick}
              disabled={isUploading}
              className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-coral border-2 border-background flex items-center justify-center hover:bg-coral-dark transition-colors"
            >
              <Camera className="h-5 w-5 text-primary-foreground" />
            </button>
            
            {/* Remove button */}
            {avatarUrl && (
              <button 
                onClick={handleRemoveAvatar}
                disabled={isUploading}
                className="absolute top-0 right-0 w-8 h-8 rounded-full bg-destructive flex items-center justify-center hover:bg-destructive/80 transition-colors"
              >
                <X className="h-4 w-4 text-primary-foreground" />
              </button>
            )}
            
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mb-8">
          Clique sur la photo pour la modifier
        </p>

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
              value={profile?.email || ''}
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
            disabled={isLoading || isUploading}
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
