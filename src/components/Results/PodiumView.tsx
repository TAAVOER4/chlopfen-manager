
import React from 'react';
import { Medal } from 'lucide-react';
import { ParticipantResult, Sponsor } from '../../types';

interface PodiumViewProps {
  results: ParticipantResult[];
  sponsor?: Sponsor;
}

const PodiumView: React.FC<PodiumViewProps> = ({ results, sponsor }) => {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="flex items-end mb-12 space-x-8">
        {results.length >= 2 && (
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
              <div className="text-center">
                <Medal className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <span className="font-bold text-xl">#2</span>
              </div>
            </div>
            <div className="text-center">
              <p className="font-bold">{results[1].participant.firstName} {results[1].participant.lastName}</p>
              <p className="text-sm text-muted-foreground">{Math.round(results[1].totalScore * 10) / 10} Punkte</p>
            </div>
          </div>
        )}
        
        {results.length >= 1 && (
          <div className="flex flex-col items-center">
            <div className="w-36 h-40 bg-yellow-100 rounded-lg flex items-center justify-center mb-4 border-2 border-yellow-500">
              <div className="text-center">
                <Medal className="h-10 w-10 text-yellow-500 mx-auto mb-2" />
                <span className="font-bold text-2xl">#1</span>
              </div>
            </div>
            <div className="text-center">
              <p className="font-bold">{results[0].participant.firstName} {results[0].participant.lastName}</p>
              <p className="text-sm text-muted-foreground">{Math.round(results[0].totalScore * 10) / 10} Punkte</p>
            </div>
          </div>
        )}
        
        {results.length >= 3 && (
          <div className="flex flex-col items-center">
            <div className="w-32 h-28 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
              <div className="text-center">
                <Medal className="h-8 w-8 text-amber-700 mx-auto mb-2" />
                <span className="font-bold text-xl">#3</span>
              </div>
            </div>
            <div className="text-center">
              <p className="font-bold">{results[2].participant.firstName} {results[2].participant.lastName}</p>
              <p className="text-sm text-muted-foreground">{Math.round(results[2].totalScore * 10) / 10} Punkte</p>
            </div>
          </div>
        )}
      </div>

      {sponsor && (
        <div className="text-center mt-4">
          <p className="text-sm text-muted-foreground mb-2">Sponsor</p>
          <p className="font-medium text-lg">{sponsor.name}</p>
        </div>
      )}
    </div>
  );
};

export default PodiumView;
