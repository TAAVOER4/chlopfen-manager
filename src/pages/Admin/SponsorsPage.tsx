
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { 
  Award, 
  PlusCircle, 
  Flag, 
  Heart, 
  ListFilter,
  PenLine,
  Trash2
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { mockSponsors } from '@/data/mockData';
import { Sponsor, Category, SponsorType, GroupCategory } from '@/types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useUser } from '@/contexts/UserContext';

const SponsorsPage = () => {
  const { isAdmin } = useUser();
  const { toast } = useToast();
  const [sponsors, setSponsors] = useState<Sponsor[]>(mockSponsors);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("prize");
  const [currentSponsor, setCurrentSponsor] = useState<Sponsor | null>(null);
  const [formData, setFormData] = useState<Partial<Sponsor>>({
    name: '',
    logo: '',
    category: 'kids',
    rank: 1,
    type: 'prize',
    websiteUrl: ''
  });

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-4">Zugriff verweigert</h2>
        <p className="text-muted-foreground mb-4">Sie haben keine Berechtigung, diese Seite zu sehen.</p>
        <Button asChild>
          <a href="/">Zurück zur Startseite</a>
        </Button>
      </div>
    );
  }

  const handleAddSponsor = () => {
    setCurrentSponsor(null);
    setFormData({
      name: '',
      logo: '',
      category: 'kids',
      rank: activeTab === 'prize' ? 1 : undefined,
      type: activeTab as SponsorType,
      websiteUrl: ''
    });
    setIsDialogOpen(true);
  };

  const handleEditSponsor = (sponsor: Sponsor) => {
    setCurrentSponsor(sponsor);
    setFormData(sponsor);
    setIsDialogOpen(true);
  };

  const handleDeleteSponsor = (sponsor: Sponsor) => {
    setCurrentSponsor(sponsor);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (currentSponsor) {
      setSponsors(sponsors.filter(s => s.id !== currentSponsor.id));
      toast({
        title: "Sponsor gelöscht",
        description: `${currentSponsor.name} wurde erfolgreich gelöscht.`
      });
      setIsDeleteDialogOpen(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.logo || !formData.category) {
      toast({
        title: "Fehlerhafte Eingabe",
        description: "Bitte füllen Sie alle erforderlichen Felder aus.",
        variant: "destructive"
      });
      return;
    }
    
    if (currentSponsor) {
      // Edit existing sponsor
      const updatedSponsors = sponsors.map(s => 
        s.id === currentSponsor.id ? { ...formData, id: currentSponsor.id } as Sponsor : s
      );
      setSponsors(updatedSponsors);
      toast({
        title: "Sponsor aktualisiert",
        description: `${formData.name} wurde erfolgreich aktualisiert.`
      });
    } else {
      // Add new sponsor
      const newSponsor: Sponsor = {
        ...formData,
        id: Math.max(...sponsors.map(s => s.id), 0) + 1,
      } as Sponsor;
      
      setSponsors([...sponsors, newSponsor]);
      toast({
        title: "Sponsor hinzugefügt",
        description: `${formData.name} wurde erfolgreich hinzugefügt.`
      });
    }
    
    setIsDialogOpen(false);
  };

  const getCategoryOptions = () => {
    if (formData.type === 'prize') {
      return (
        <>
          <SelectItem value="kids">Kids</SelectItem>
          <SelectItem value="juniors">Junioren</SelectItem>
          <SelectItem value="active">Aktive</SelectItem>
        </>
      );
    } else {
      return (
        <>
          <SelectItem value="kids">Kids</SelectItem>
          <SelectItem value="juniors">Junioren</SelectItem>
          <SelectItem value="active">Aktive</SelectItem>
          <SelectItem value="kids_juniors">Kids/Junioren</SelectItem>
        </>
      );
    }
  };

  const getSponsorTypeIcon = (type: SponsorType) => {
    switch (type) {
      case 'prize': return <Award className="h-5 w-5 text-yellow-500" />;
      case 'donor': return <Heart className="h-5 w-5 text-red-500" />;
      case 'banner': return <Flag className="h-5 w-5 text-blue-500" />;
      default: return null;
    }
  };

  const getSponsorTypeDisplay = (type: SponsorType) => {
    switch (type) {
      case 'prize': return 'Preissponsor';
      case 'donor': return 'Gönner';
      case 'banner': return 'Bandensponsor';
      default: return type;
    }
  };

  const getCategoryDisplay = (category: Category | GroupCategory) => {
    switch (category) {
      case 'kids': return 'Kids';
      case 'juniors': return 'Junioren';
      case 'active': return 'Aktive';
      case 'kids_juniors': return 'Kids/Junioren';
      default: return category;
    }
  };

  const filteredSponsors = sponsors.filter(sponsor => sponsor.type === activeTab);

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold text-swiss-blue mb-6">Sponsorenverwaltung</h1>
      
      <Tabs defaultValue="prize" onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-6">
          <TabsList>
            <TabsTrigger value="prize" className="flex items-center gap-2">
              <Award className="h-4 w-4" /> Preissponsor
            </TabsTrigger>
            <TabsTrigger value="donor" className="flex items-center gap-2">
              <Heart className="h-4 w-4" /> Gönner
            </TabsTrigger>
            <TabsTrigger value="banner" className="flex items-center gap-2">
              <Flag className="h-4 w-4" /> Bandensponsor
            </TabsTrigger>
          </TabsList>
          
          <Button onClick={handleAddSponsor} className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Sponsor hinzufügen
          </Button>
        </div>
        
        <TabsContent value="prize">
          <Card>
            <CardHeader>
              <CardTitle>Preissponsor Management</CardTitle>
              <CardDescription>
                Verwalten Sie die Sponsoren für die Preisverleihung in den verschiedenen Kategorien.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Logo</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Kategorie</TableHead>
                    <TableHead>Rang</TableHead>
                    <TableHead>Website</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSponsors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Keine Sponsoren gefunden. Fügen Sie neue Sponsoren hinzu.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSponsors.map((sponsor) => (
                      <TableRow key={sponsor.id}>
                        <TableCell>
                          <div className="h-12 w-16 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                            {sponsor.logo ? (
                              <img src={sponsor.logo} alt={`${sponsor.name} Logo`} className="max-h-12 max-w-full object-contain" />
                            ) : (
                              <Award className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{sponsor.name}</TableCell>
                        <TableCell>{getCategoryDisplay(sponsor.category)}</TableCell>
                        <TableCell>{sponsor.rank || '-'}</TableCell>
                        <TableCell>
                          {sponsor.websiteUrl ? (
                            <a href={sponsor.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              Website öffnen
                            </a>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditSponsor(sponsor)}>
                              <PenLine className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDeleteSponsor(sponsor)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="donor">
          <Card>
            <CardHeader>
              <CardTitle>Gönner Management</CardTitle>
              <CardDescription>
                Verwalten Sie Gönner und Sponsoren, die das Turnier unterstützen.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Logo</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Kategorie</TableHead>
                    <TableHead>Website</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSponsors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Keine Gönner gefunden. Fügen Sie neue Gönner hinzu.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSponsors.map((sponsor) => (
                      <TableRow key={sponsor.id}>
                        <TableCell>
                          <div className="h-12 w-16 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                            {sponsor.logo ? (
                              <img src={sponsor.logo} alt={`${sponsor.name} Logo`} className="max-h-12 max-w-full object-contain" />
                            ) : (
                              <Heart className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{sponsor.name}</TableCell>
                        <TableCell>{getCategoryDisplay(sponsor.category)}</TableCell>
                        <TableCell>
                          {sponsor.websiteUrl ? (
                            <a href={sponsor.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              Website öffnen
                            </a>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditSponsor(sponsor)}>
                              <PenLine className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDeleteSponsor(sponsor)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="banner">
          <Card>
            <CardHeader>
              <CardTitle>Bandensponsor Management</CardTitle>
              <CardDescription>
                Verwalten Sie Bandensponsoren für das Turnier.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Logo</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Kategorie</TableHead>
                    <TableHead>Website</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSponsors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Keine Bandensponsoren gefunden. Fügen Sie neue Bandensponsoren hinzu.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSponsors.map((sponsor) => (
                      <TableRow key={sponsor.id}>
                        <TableCell>
                          <div className="h-12 w-16 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                            {sponsor.logo ? (
                              <img src={sponsor.logo} alt={`${sponsor.name} Logo`} className="max-h-12 max-w-full object-contain" />
                            ) : (
                              <Flag className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{sponsor.name}</TableCell>
                        <TableCell>{getCategoryDisplay(sponsor.category)}</TableCell>
                        <TableCell>
                          {sponsor.websiteUrl ? (
                            <a href={sponsor.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              Website öffnen
                            </a>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditSponsor(sponsor)}>
                              <PenLine className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDeleteSponsor(sponsor)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Add/Edit Sponsor Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{currentSponsor ? 'Sponsor bearbeiten' : 'Neuen Sponsor hinzufügen'}</DialogTitle>
            <DialogDescription>
              {currentSponsor 
                ? 'Bearbeiten Sie die Details des Sponsors.' 
                : 'Fügen Sie einen neuen Sponsor hinzu.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input 
                  id="name" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleFormChange} 
                  placeholder="Sponsorname" 
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="logo">Logo URL *</Label>
                <Input 
                  id="logo" 
                  name="logo" 
                  value={formData.logo} 
                  onChange={handleFormChange} 
                  placeholder="https://example.com/logo.png" 
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="websiteUrl">Website URL</Label>
                <Input 
                  id="websiteUrl" 
                  name="websiteUrl" 
                  value={formData.websiteUrl || ''} 
                  onChange={handleFormChange} 
                  placeholder="https://example.com" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Sponsor Typ *</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => handleSelectChange('type', value)}
                  disabled={currentSponsor !== null}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Wählen Sie den Typ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prize">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        <span>Preissponsor</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="donor">
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        <span>Gönner</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="banner">
                      <div className="flex items-center gap-2">
                        <Flag className="h-4 w-4" />
                        <span>Bandensponsor</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Kategorie *</Label>
                <Select 
                  value={formData.category as string} 
                  onValueChange={(value) => handleSelectChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Wählen Sie eine Kategorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {getCategoryOptions()}
                  </SelectContent>
                </Select>
              </div>
              
              {formData.type === 'prize' && (
                <div className="space-y-2">
                  <Label htmlFor="rank">Rang *</Label>
                  <Select 
                    value={formData.rank?.toString()} 
                    onValueChange={(value) => handleSelectChange('rank', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Wählen Sie einen Rang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1. Platz</SelectItem>
                      <SelectItem value="2">2. Platz</SelectItem>
                      <SelectItem value="3">3. Platz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button type="submit">
                {currentSponsor ? 'Speichern' : 'Hinzufügen'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Sponsor löschen</DialogTitle>
            <DialogDescription>
              Sind Sie sicher, dass Sie diesen Sponsor löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>
          
          {currentSponsor && (
            <div className="py-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-16 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                  {currentSponsor.logo ? (
                    <img src={currentSponsor.logo} alt={`${currentSponsor.name} Logo`} className="max-h-12 max-w-full object-contain" />
                  ) : (
                    getSponsorTypeIcon(currentSponsor.type)
                  )}
                </div>
                <div>
                  <p className="font-medium">{currentSponsor.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {getSponsorTypeDisplay(currentSponsor.type)} - {getCategoryDisplay(currentSponsor.category)}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SponsorsPage;
