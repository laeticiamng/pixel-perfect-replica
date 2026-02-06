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
import { PublicProfilePreview } from '@/components/profile';
import { useTranslation } from '@/lib/i18n';
import { ActivityType } from '@/types/signal';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const BIO_MAX_LENGTH = 140;

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
        .select('bio, favorite_activities, birth_year')
        .eq('id', user.id)
        .single();
      
      if (data) {
        if (data.bio) setBio(data.bio);
        if (data.favorite_activities) {
          setFavoriteActivities(data.favorite_activities as ActivityType[]);
        }
        if (data.birth_year) setBirthYear(String(data.birth_year));
      }
    };
    fetchProfileData();
  }, [user]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast.error(t('editProfile.onlyImages'));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error(t('editProfile.imageTooLarge'));
      return;
    }

    setIsUploading(true);

    try {
      if (avatarUrl) {
        const oldPath = avatarUrl.split('/').pop();
        if (oldPath) {
          await supabase.storage.from('avatars').remove([`${user.id}/${oldPath}`]);
        }
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `avatar-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setAvatarUrl(publicUrl);
      toast.success(t('editProfile.photoUpdated'));
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(t('editProfile.uploadError'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!avatarUrl || !user) return;

    setIsUploading(true);
    try {
      const urlParts = avatarUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      await supabase.storage.from('avatars').remove([`${user.id}/${fileName}`]);
      setAvatarUrl('');
      toast.success(t('editProfile.photoDeleted'));
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(t('editProfile.deleteError'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    const sanitizedFirstName = stripHtml(firstName.trim());
    const sanitizedUniversity = stripHtml(university.trim());
    const sanitizedBio = stripHtml(bio.trim());
    
    const firstNameResult = firstNameSchema.safeParse(sanitizedFirstName);
    if (!firstNameResult.success) {
      toast.error(firstNameResult.error.errors[0].message);
      return;
    }
    
    if (sanitizedUniversity) {
      const universityResult = universitySchema.safeParse(sanitizedUniversity);
      if (!universityResult.success) {
        toast.error(universityResult.error.errors[0].message);
        return;
      }
    }

    if (birthYear) {
      const yearNum = parseInt(birthYear, 10);
      const currentYear = new Date().getFullYear();
      if (isNaN(yearNum) || yearNum < 1920 || yearNum > currentYear - 13) {
        toast.error(t('editProfile.invalidBirthYear'));
        return;
      }
    }

    if (sanitizedBio.length > BIO_MAX_LENGTH) {
      toast.error(t('editProfile.bioTooLong', { max: String(BIO_MAX_LENGTH) }));
      return;
    }
    
    setIsLoading(true);

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
    
    if (profileError) {
      toast.error(t('editProfile.updateError'));
    } else {
      await refreshProfile();
      toast.success(t('editProfile.profileUpdated'));
      navigate('/profile');
    }
  };

  return (
    <PageLayout className="pb-8 safe-bottom">
      <PageHeader title={t('editProfile.title')} backTo="/profile" />

      <div className="px-6 py-8 animate-fade-in">
        {/* Avatar */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-coral/30 blur-xl animate-breathing" />
            <button
              onClick={handleAvatarClick}
              disabled={isUploading}
              aria-label={t('editProfile.editAvatar')}
              className={cn(
                "w-28 h-28 rounded-full flex items-center justify-center glow-coral overflow-hidden transition-all relative hover:scale-105 active:scale-95",
                isUploading && "opacity-50",
                avatarUrl ? "" : "bg-gradient-to-br from-coral to-coral-dark"
              )}
            >
              {isUploading ? (
                <Loader2 className="h-8 w-8 animate-spin text-primary-foreground" />
              ) : avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-bold text-primary-foreground">
                  {firstName.charAt(0).toUpperCase() || '?'}
                </span>
              )}
            </button>
            
            <button 
              onClick={handleAvatarClick}
              disabled={isUploading}
              aria-label={t('editProfile.addPhoto')}
              className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-coral border-2 border-background flex items-center justify-center hover:bg-coral-dark transition-colors"
            >
              <Camera className="h-5 w-5 text-primary-foreground" />
            </button>
            
            {avatarUrl && (
              <button 
                onClick={handleRemoveAvatar}
                disabled={isUploading}
                aria-label={t('editProfile.removePhoto')}
                className="absolute top-0 right-0 w-8 h-8 rounded-full bg-destructive flex items-center justify-center hover:bg-destructive/80 transition-colors"
              >
                <X className="h-4 w-4 text-primary-foreground" />
              </button>
            )}
            
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
          {t('editProfile.clickToEdit')}
        </p>

        {/* Form */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t('editProfile.firstName')}</label>
            <Input
              type="text"
              placeholder={t('editProfile.firstNamePlaceholder')}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="h-14 bg-deep-blue-light border-border text-foreground placeholder:text-muted-foreground rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t('editProfile.university')}</label>
            <Input
              type="text"
              placeholder={t('editProfile.universityPlaceholder')}
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              className="h-14 bg-deep-blue-light border-border text-foreground placeholder:text-muted-foreground rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">{t('editProfile.bio')}</label>
              <span className={cn(
                "text-xs font-medium",
                bio.length > BIO_MAX_LENGTH - 20 ? "text-signal-yellow" : "text-muted-foreground",
                bio.length > BIO_MAX_LENGTH - 5 && "text-signal-red"
              )}>
                {bio.length}/{BIO_MAX_LENGTH}
              </span>
            </div>
            <Textarea
              placeholder={t('editProfile.bioPlaceholder')}
              value={bio}
              onChange={(e) => {
                if (e.target.value.length <= BIO_MAX_LENGTH) {
                  setBio(e.target.value);
                }
              }}
              className="min-h-[100px] bg-deep-blue-light border-border text-foreground placeholder:text-muted-foreground rounded-xl resize-none"
            />
          </div>

          <FavoriteActivitiesSelector value={favoriteActivities} onChange={setFavoriteActivities} />

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t('editProfile.birthYear')}</label>
            <Input
              type="number"
              placeholder={t('editProfile.birthYearPlaceholder')}
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              min={1920}
              max={new Date().getFullYear() - 13}
              className="h-14 bg-deep-blue-light border-border text-foreground placeholder:text-muted-foreground rounded-xl"
            />
            <p className="text-xs text-muted-foreground">{t('editProfile.birthYearPrivacy')}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t('editProfile.emailLabel')}</label>
            <Input
              type="email"
              value={profile?.email || ''}
              disabled
              className="h-14 bg-deep-blue-light/50 border-border text-muted-foreground rounded-xl cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">{t('editProfile.emailReadonly')}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <PublicProfilePreview />
        </div>

        <div className="mt-8">
          <Button
            onClick={handleSave}
            disabled={isLoading || isUploading}
            className="w-full h-14 bg-coral hover:bg-coral-dark text-primary-foreground rounded-xl text-lg font-semibold glow-coral"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : t('save')}
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}
