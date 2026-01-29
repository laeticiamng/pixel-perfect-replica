import { useState, useEffect } from 'react';
import { Plus, Trash2, Phone, User, Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
}

export function EmergencyContactsManager() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Fetch contacts
  useEffect(() => {
    const fetchContacts = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('id, name, phone')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setContacts(data);
      }
      setIsLoading(false);
    };

    fetchContacts();
  }, [user]);

  const handleAddContact = async () => {
    if (!user || !newName.trim() || !newPhone.trim()) {
      toast.error('Remplis tous les champs');
      return;
    }

    if (contacts.length >= 3) {
      toast.error('Maximum 3 contacts d\'urgence');
      return;
    }

    // Validate phone format
    const phoneRegex = /^[\d\s+()-]{8,20}$/;
    if (!phoneRegex.test(newPhone)) {
      toast.error('Numéro de téléphone invalide');
      return;
    }

    setIsAdding(true);

    const { data, error } = await supabase
      .from('emergency_contacts')
      .insert({
        user_id: user.id,
        name: newName.trim(),
        phone: newPhone.trim(),
      })
      .select()
      .single();

    setIsAdding(false);

    if (error) {
      toast.error('Erreur lors de l\'ajout');
      return;
    }

    setContacts([...contacts, data]);
    setNewName('');
    setNewPhone('');
    setShowAddForm(false);
    toast.success('Contact ajouté !');
  };

  const handleDeleteContact = async (id: string) => {
    const { error } = await supabase
      .from('emergency_contacts')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Erreur lors de la suppression');
      return;
    }

    setContacts(contacts.filter(c => c.id !== id));
    toast.success('Contact supprimé');
  };

  if (isLoading) {
    return (
      <div className="glass rounded-xl p-4 flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="glass rounded-xl p-4">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-lg bg-destructive/20 text-destructive">
            <Shield className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground">Contacts d'urgence</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Ces contacts seront alertés en cas d'urgence (max 3)
            </p>
          </div>
        </div>
      </div>

      {/* Contacts List */}
      {contacts.length > 0 && (
        <div className="space-y-2">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="glass rounded-xl p-4 flex items-center justify-between animate-fade-in"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-deep-blue-light flex items-center justify-center">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{contact.name}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {contact.phone}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDeleteContact(contact.id)}
                className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Form */}
      {showAddForm ? (
        <div className="glass rounded-xl p-4 space-y-4 animate-slide-up">
          <Input
            type="text"
            placeholder="Nom du contact"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="h-12 bg-deep-blue-light border-border text-foreground rounded-xl"
          />
          <Input
            type="tel"
            placeholder="Numéro de téléphone"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            className="h-12 bg-deep-blue-light border-border text-foreground rounded-xl"
          />
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddForm(false);
                setNewName('');
                setNewPhone('');
              }}
              className="flex-1 h-12 rounded-xl"
            >
              Annuler
            </Button>
            <Button
              onClick={handleAddContact}
              disabled={isAdding || !newName.trim() || !newPhone.trim()}
              className="flex-1 h-12 bg-coral hover:bg-coral-dark text-primary-foreground rounded-xl"
            >
              {isAdding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Ajouter'
              )}
            </Button>
          </div>
        </div>
      ) : (
        contacts.length < 3 && (
          <Button
            onClick={() => setShowAddForm(true)}
            variant="outline"
            className={cn(
              "w-full h-14 rounded-xl border-dashed border-2",
              "hover:border-coral hover:text-coral transition-colors"
            )}
          >
            <Plus className="h-5 w-5 mr-2" />
            Ajouter un contact d'urgence
          </Button>
        )
      )}

      {/* Info */}
      <p className="text-xs text-muted-foreground text-center">
        En cas d'urgence, maintiens le bouton 🛡️ sur le radar pour alerter tes contacts
      </p>
    </div>
  );
}
