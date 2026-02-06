import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { QrCode, Share2, Download, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useTranslation } from '@/lib/i18n';

interface ProfileQRCodeProps {
  userId: string;
  firstName: string;
  avatarUrl?: string | null;
  className?: string;
  triggerClassName?: string;
}

export function ProfileQRCode({ userId, firstName, avatarUrl, className, triggerClassName }: ProfileQRCodeProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { t } = useTranslation();

  const profileUrl = `${window.location.origin}/profile/${userId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast.success(t('profileQR.linkCopied'));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t('profileQR.copyError'));
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t('profileQR.shareTitle').replace('{name}', firstName),
          text: t('profileQR.shareText'),
          url: profileUrl,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDownload = () => {
    const svg = document.getElementById('profile-qr-code');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `easy-profile-${firstName}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
      toast.success(t('profileQR.downloaded'));
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={cn('gap-2', triggerClassName)}>
          <QrCode className="h-4 w-4" />
          <span className="hidden sm:inline">{t('profileQR.myQRCode')}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className={cn('sm:max-w-md', className)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-coral" />
            {t('profileQR.title')}
          </DialogTitle>
          <DialogDescription>{t('profileQR.description')}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-6 py-4">
          <div className="relative p-4 bg-white rounded-2xl shadow-lg">
            <QRCodeSVG
              id="profile-qr-code"
              value={profileUrl}
              size={200}
              level="H"
              includeMargin={true}
              imageSettings={avatarUrl ? { src: avatarUrl, height: 40, width: 40, excavate: true } : undefined}
              fgColor="#1a1a2e"
              bgColor="#ffffff"
            />
          </div>
          <div className="text-center">
            <p className="font-semibold text-lg">{firstName}</p>
            <p className="text-sm text-muted-foreground truncate max-w-[250px]">{profileUrl}</p>
          </div>
          <div className="flex gap-3 w-full">
            <Button variant="outline" onClick={handleCopyLink} className="flex-1 gap-2">
              {copied ? <Check className="h-4 w-4 text-signal-green" /> : <Copy className="h-4 w-4" />}
              {copied ? t('profileQR.copied') : t('profileQR.copyLink')}
            </Button>
            <Button variant="outline" onClick={handleDownload} className="gap-2">
              <Download className="h-4 w-4" />
            </Button>
            <Button onClick={handleShare} className="flex-1 gap-2 bg-coral hover:bg-coral-dark">
              <Share2 className="h-4 w-4" />
              {t('profileQR.share')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
