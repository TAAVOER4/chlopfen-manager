
import { useState } from 'react';
import { toast } from 'sonner';
import { ScheduleItem, Tournament } from '@/types';
import { generateSchedulePDF } from '@/utils/pdfUtils';

// Mock schedule data
const mockSchedule: ScheduleItem[] = [
  {
    id: 1,
    tournamentId: 1,
    startTime: '09:00',
    endTime: '10:00',
    title: 'Eröffnungszeremonie',
    description: 'Begrüßung und Vorstellung der Sponsoren',
    type: 'ceremony'
  },
  {
    id: 2,
    tournamentId: 1,
    startTime: '10:00',
    endTime: '12:00',
    title: 'Kids Einzelwettbewerb',
    category: 'kids',
    type: 'competition'
  },
  {
    id: 3,
    tournamentId: 1,
    startTime: '12:00',
    endTime: '13:00',
    title: 'Mittagspause',
    type: 'break'
  },
  {
    id: 4,
    tournamentId: 1,
    startTime: '13:00',
    endTime: '15:00',
    title: 'Junioren Einzelwettbewerb',
    category: 'juniors',
    type: 'competition'
  },
  {
    id: 5,
    tournamentId: 1,
    startTime: '15:00',
    endTime: '17:00',
    title: 'Aktive Einzelwettbewerb',
    category: 'active',
    type: 'competition'
  },
  {
    id: 6,
    tournamentId: 1,
    startTime: '17:00',
    endTime: '18:00',
    title: 'Siegerehrung',
    description: 'Verleihung der Preise für alle Kategorien',
    type: 'ceremony'
  }
];

export const useSchedule = (activeTournament?: Tournament) => {
  const [schedule, setSchedule] = useState<ScheduleItem[]>(mockSchedule);
  const [currentItem, setCurrentItem] = useState<ScheduleItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<ScheduleItem>>({
    startTime: '09:00',
    endTime: '10:00',
    title: '',
    description: '',
    type: 'competition',
    category: 'kids'
  });

  // Filter schedule by active tournament
  const tournamentSchedule = activeTournament 
    ? schedule.filter(item => item.tournamentId === activeTournament.id) 
    : schedule;
  
  // Sort schedule by start time
  const sortedSchedule = [...tournamentSchedule].sort((a, b) => {
    return a.startTime.localeCompare(b.startTime);
  });

  const handleAddItem = () => {
    setCurrentItem(null);
    setFormData({
      startTime: '09:00',
      endTime: '10:00',
      title: '',
      description: '',
      type: 'competition',
      category: 'kids'
    });
    setIsDialogOpen(true);
  };

  const handleEditItem = (item: ScheduleItem) => {
    setCurrentItem(item);
    setFormData({
      startTime: item.startTime,
      endTime: item.endTime,
      title: item.title,
      description: item.description || '',
      type: item.type,
      category: item.category
    });
    setIsDialogOpen(true);
  };

  const handleDeleteItem = (item: ScheduleItem) => {
    setCurrentItem(item);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (currentItem) {
      setSchedule(schedule.filter(item => item.id !== currentItem.id));
      toast.success("Zeitplan-Eintrag gelöscht");
      setIsDeleteDialogOpen(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.startTime || !formData.endTime || !formData.type) {
      toast.error("Bitte füllen Sie alle erforderlichen Felder aus.");
      return;
    }
    
    if (currentItem) {
      // Edit existing item
      const updatedSchedule = schedule.map(item => 
        item.id === currentItem.id ? 
        { 
          ...item, 
          startTime: formData.startTime || item.startTime,
          endTime: formData.endTime || item.endTime,
          title: formData.title || item.title,
          description: formData.description,
          type: formData.type || item.type,
          category: formData.category
        } : item
      );
      setSchedule(updatedSchedule);
      toast.success("Zeitplan-Eintrag aktualisiert");
    } else {
      // Add new item
      const newItem: ScheduleItem = {
        id: Math.max(...schedule.map(item => item.id), 0) + 1,
        tournamentId: activeTournament?.id || 1,
        startTime: formData.startTime || '09:00',
        endTime: formData.endTime || '10:00',
        title: formData.title || '',
        description: formData.description,
        type: formData.type as 'competition' | 'ceremony' | 'break' | 'other',
        category: formData.type === 'competition' ? formData.category as any : undefined
      };
      
      setSchedule([...schedule, newItem]);
      toast.success("Zeitplan-Eintrag hinzugefügt");
    }
    
    setIsDialogOpen(false);
  };

  const handleGeneratePDF = () => {
    if (!activeTournament) {
      toast.error("Bitte wählen Sie ein aktives Turnier aus");
      return;
    }

    try {
      generateSchedulePDF(sortedSchedule, [], activeTournament);
      toast.success("PDF wurde generiert und der Download wurde gestartet");
    } catch (error) {
      toast.error("Fehler beim Generieren des PDFs");
      console.error("PDF generation error:", error);
    }
  };

  return {
    schedule,
    sortedSchedule,
    currentItem,
    formData,
    isDialogOpen,
    isDeleteDialogOpen,
    handleAddItem,
    handleEditItem,
    handleDeleteItem,
    confirmDelete,
    handleFormChange,
    handleSelectChange,
    handleSubmit,
    handleGeneratePDF,
    setIsDialogOpen,
    setIsDeleteDialogOpen
  };
};
