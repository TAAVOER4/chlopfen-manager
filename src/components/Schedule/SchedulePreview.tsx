
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { ScheduleItem, Sponsor, Tournament } from '@/types';
import { getCategoryDisplay } from '@/utils/categoryUtils';

interface SchedulePreviewProps {
  scheduleItems: ScheduleItem[];
  mainSponsors: Sponsor[];
  tournament?: Tournament;
  onGeneratePDF: () => void;
}

const SchedulePreview: React.FC<SchedulePreviewProps> = ({
  scheduleItems,
  mainSponsors,
  tournament,
  onGeneratePDF
}) => {
  return (
    <div className="border rounded-lg p-6 bg-white">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">{tournament?.name || 'Turnier'} - Zeitplan</h2>
        <p className="text-muted-foreground">
          {tournament?.date ? new Date(tournament.date).toLocaleDateString('de-CH') : 'Kein Datum'}
        </p>
      </div>
      
      {mainSponsors.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4 text-center">Hauptsponsoren</h3>
          <div className="flex flex-wrap justify-center gap-8">
            {mainSponsors.map(sponsor => (
              <div key={sponsor.id} className="text-center">
                <div className="h-20 w-32 bg-gray-50 rounded flex items-center justify-center overflow-hidden mb-2">
                  {sponsor.logo ? (
                    <img src={sponsor.logo} alt={`${sponsor.name} Logo`} className="max-h-16 max-w-full object-contain" />
                  ) : (
                    <span className="text-muted-foreground text-sm">{sponsor.name}</span>
                  )}
                </div>
                <p className="text-sm font-medium">{sponsor.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="py-2 px-4 text-left">Zeit</th>
              <th className="py-2 px-4 text-left">Programm</th>
              <th className="py-2 px-4 text-left">Kategorie</th>
            </tr>
          </thead>
          <tbody>
            {scheduleItems.map((item, index) => (
              <tr key={item.id} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                <td className="py-3 px-4 whitespace-nowrap">
                  {item.startTime} - {item.endTime}
                </td>
                <td className="py-3 px-4">
                  <div className="font-medium">{item.title}</div>
                  {item.description && (
                    <div className="text-sm text-muted-foreground">{item.description}</div>
                  )}
                </td>
                <td className="py-3 px-4">
                  {item.category ? getCategoryDisplay(item.category) : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SchedulePreview;
