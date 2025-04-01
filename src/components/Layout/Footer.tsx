
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-swiss-blue text-white py-6 mt-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center">
          {/* Sponsor logos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6 bg-white p-4 rounded-lg w-full max-w-4xl">
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

          {/* Footer content */}
          <div className="flex flex-col md:flex-row justify-between items-center w-full">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <p className="text-sm">© {new Date().getFullYear()} Wettchlöpfen Manager</p>
            </div>
            <div className="flex space-x-4">
              <Link to="#" className="text-sm hover:text-gray-300">Impressum</Link>
              <Link to="#" className="text-sm hover:text-gray-300">Datenschutz</Link>
              <Link to="#" className="text-sm hover:text-gray-300">Kontakt</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
