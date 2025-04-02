
import React from 'react';
import { 
  Users, 
  Award, 
  Settings, 
  Database, 
  Calendar,
  Printer,
  Flag,
  Trophy,
  FileText
} from 'lucide-react';
import { AdminCard } from './AdminCard';

export const AdminCardsGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AdminCard
        title="Teilnehmerverwaltung"
        description="Verwaltung der Teilnehmer und Gruppenzuweisung"
        content="Verwalten Sie alle Teilnehmer, weisen Sie Gruppen zu und exportieren Sie Teilnehmerlisten."
        icon={<Users className="h-5 w-5 mr-2" />}
        linkTo="/participants"
      />
      
      <AdminCard
        title="Benutzerverwaltung"
        description="Verwaltung der Benutzer und Zugriffsrechte"
        content="Verwalten Sie die Benutzer, vergeben Sie Zugriffsrechte und weisen Sie Kategorien zu."
        icon={<Award className="h-5 w-5 mr-2" />}
        linkTo="/admin/users"
      />
      
      <AdminCard
        title="Sponsorenverwaltung"
        description="Verwaltung der Sponsoren und Zuordnung zu Kategorien"
        content="Verwalten Sie die Sponsoren und ordnen Sie diese den Kategorien und Rängen zu."
        icon={<Flag className="h-5 w-5 mr-2" />}
        linkTo="/admin/sponsors"
      />
      
      <AdminCard
        title="Turniereinstellungen"
        description="Konfiguration des aktuellen Turniers"
        content="Legen Sie den Turniernamen, das Datum und andere Einstellungen fest. Weisen Sie dem Turnier Teilnehmer und Richter zu."
        icon={<Trophy className="h-5 w-5 mr-2" />}
        linkTo="/admin/tournament"
      />
      
      <AdminCard
        title="Zeitplan"
        description="Verwaltung des Turnier-Zeitplans"
        content="Erstellen und bearbeiten Sie den Zeitplan für das Turnier."
        icon={<Calendar className="h-5 w-5 mr-2" />}
        linkTo="/admin/schedule"
      />
      
      <AdminCard
        title="Berichte & Exporte"
        description="Generierung von Berichten und Exporten"
        content="Erstellen Sie Berichte, Ranglisten und exportieren Sie Daten in verschiedenen Formaten."
        icon={<FileText className="h-5 w-5 mr-2" />}
        linkTo="/admin/reports"
      />
    </div>
  );
};
