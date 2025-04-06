
import React from 'react';

const DashboardHeader: React.FC = () => {
  return (
    <div className="text-center mb-6">
      <h1 className="text-4xl font-bold text-swiss-blue mb-2">Wettchlöpfen Manager</h1>
      
      {/* Sponsor logos in the same style as footer */}
      <div className="flex justify-center mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 bg-white p-4 rounded-lg w-full max-w-4xl">
          <div className="flex justify-center items-center">
            <img 
              src="/lovable-uploads/a5d2c313-c136-4233-8b7b-e1347138b272.png" 
              alt="Geislechlöpfer Ohmstal" 
              className="h-24 object-contain"
            />
          </div>
          <div className="flex justify-center items-center">
            <img 
              src="/lovable-uploads/d96b84f9-8847-4e45-bd71-c44b3fb53513.png" 
              alt="Geislechlöpfer Buttisholz" 
              className="h-24 object-contain"
            />
          </div>
          <div className="flex justify-center items-center">
            <img 
              src="/lovable-uploads/4ea13025-c283-4b04-91f7-8176d706ccf7.png" 
              alt="Chlaus-chlöpfer Hergiswil" 
              className="h-24 object-contain"
            />
          </div>
        </div>
      </div>
      
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        Digitale Verwaltung und Bewertung für Wettchlöpfen-Turniere
      </p>
    </div>
  );
};

export default DashboardHeader;
