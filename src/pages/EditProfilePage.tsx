import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { sanitizeDbText, stripHtml } from '@/lib/sanitize';
import { firstNameSchema, universitySchema } from '@/lib/validation';
import { PageLayout } from '@/components/PageLayout';
import { PageHeader } from '@/components/shared';
import { FavoriteActivitiesSelector } from '@/components/social';
import { ActivityType } from '@/types/signal';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const BIO_MAX_LENGTH = 140;

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { profile, user, updateProfile, refreshProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [firstName, setFirstName] = useState(profile?.first_name || '');
  const [university, setUniversity] = useState(profile?.university || '');
  const [bio, setBio] = useState('');
  const [birthYear, setBirthYear] = useState<string>('');
  const [favoriteActivities, setFavoriteActivities] = useState<ActivityType[]>([]);
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch current bio, favorite activities, and birth year from database
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('bio, favorite_activities')
        .eq('id', user.id)
        .single();
      
      // Also fetch birth_year separately (may not be in types yet)
      const { data: birthData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (data) {
        if (data.bio) setBio(data.bio);
        if (data.favorite_activities) {
          setFavoriteActivities(data.favorite_activities as ActivityType[]);
        }
      }
      // Cast to access birth_year even if not in types
      const profileData = birthData as { birth_year?: number } | null;
      if (profileData?.birth_year) setBirthYear(String(profileData.birth_year));
    };
    fetchProfileData();
  }, [user]);

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
    // Sanitize inputs
    const sanitizedFirstName = stripHtml(firstName.trim());
    const sanitizedUniversity = stripHtml(university.trim());
    const sanitizedBio = stripHtml(bio.trim());
    
    // Validate first name
    const firstNameResult = firstNameSchema.safeParse(sanitizedFirstName);
    if (!firstNameResult.success) {
      toast.error(firstNameResult.error.errors[0].message);
      return;
    }
    
    // Validate university if provided
    if (sanitizedUniversity) {
      const universityResult = universitySchema.safeParse(sanitizedUniversity);
      if (!universityResult.success) {
        toast.error(universityResult.error.errors[0].message);
        return;
      }
    }

    // Validate birth year if provided
    if (birthYear) {
      const yearNum = parseInt(birthYear, 10);
      const currentYear = new Date().getFullYear();
      if (isNaN(yearNum) || yearNum < 1920 || yearNum > currentYear - 13) {
        toast.error('Année de naissance invalide (min 13 ans)');
        return;
      }
    }

    // Validate bio length
    if (sanitizedBio.length > BIO_MAX_LENGTH) {
      toast.error(`La bio ne doit pas dépasser ${BIO_MAX_LENGTH} caractères`);
      return;
    }
    
    setIsLoading(true);

    // Update profile including bio, birth_year and favorite activities
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        first_name: sanitizedFirstName,
        university: sanitizedUniversity || null,
        avatar_url: avatarUrl || null,
        bio: sanitizedBio || null,
        birth_year: birthYear ? parseInt(birthYear, 10) : null,
        favorite_activities: favoriteActivities,
      })
      .eq('id', user?.id);
    
    setIsLoading(false);
    const error = profileError;
    
    if (error) {
      toast.error('Erreur lors de la mise à jour');
    } else {
      await refreshProfile();
      toast.success('Profil mis à jour !');
      navigate('/profile');
    }
  };

  return (
    <PageLayout className="pb-8 safe-bottom">
      <PageHeader title="Modifier le profil" backTo="/profile" />

      <div className="px-6 py-8 animate-fade-in">
        {/* Avatar */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-full bg-coral/30 blur-xl animate-breathing" />
            {/* Avatar display */}
            <button
              onClick={handleAvatarClick}
              disabled={isUploading}
              aria-label="Modifier la photo de profil"
              className={cn(
                "w-28 h-28 rounded-full flex items-center justify-center glow-coral overflow-hidden transition-all relative hover:scale-105 active:scale-95",
                isUploading && "opacity-50",
                avatarUrl ? "" : "bg-gradient-to-br from-coral to-coral-dark"
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
              aria-label="Ajouter une photo"
              className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-coral border-2 border-background flex items-center justify-center hover:bg-coral-dark transition-colors"
            >
              <Camera className="h-5 w-5 text-primary-foreground" />
            </button>
            
            {/* Remove button */}
            {avatarUrl && (
              <button 
                onClick={handleRemoveAvatar}
                disabled={isUploading}
                aria-label="Supprimer la photo de profil"
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
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Bio</label>
              <span className={cn(
                "text-xs font-medium",
                bio.length > BIO_MAX_LENGTH - 20 ? "text-signal-yellow" : "text-muted-foreground",
                bio.length > BIO_MAX_LENGTH - 5 && "text-signal-red"
              )}>
                {bio.length}/{BIO_MAX_LENGTH}
              </span>
            </div>
            <Textarea
              placeholder="Décris-toi en quelques mots..."
              value={bio}
              onChange={(e) => {
                if (e.target.value.length <= BIO_MAX_LENGTH) {
                  setBio(e.target.value);
                }
              }}
              className="min-h-[100px] bg-deep-blue-light border-border text-foreground placeholder:text-muted-foreground rounded-xl resize-none"
            />
          </div>

          {/* Favorite Activities */}
          <FavoriteActivitiesSelector
            value={favoriteActivities}
            onChange={setFavoriteActivities}
          />

          {/* Birth Year - Private, used for age-based matching */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Année de naissance</label>
            <Input
              type="number"
              placeholder="Ex: 2000"
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              min={1920}
              max={new Date().getFullYear() - 13}
              className="h-14 bg-deep-blue-light border-border text-foreground placeholder:text-muted-foreground rounded-xl"
            />
            <p className="text-xs text-muted-foreground">
              🔒 Jamais affiché — utilisé uniquement pour te proposer des personnes d'âge proche
            </p>
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
    </PageLayout>
  );
}
