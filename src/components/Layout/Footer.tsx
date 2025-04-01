
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-swiss-blue text-white py-4 mt-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <p className="text-sm">© {new Date().getFullYear()} Wettchlöpfen Manager</p>
          </div>
          <div className="flex space-x-4">
            <a href="#" className="text-sm hover:text-gray-300">Impressum</a>
            <a href="#" className="text-sm hover:text-gray-300">Datenschutz</a>
            <a href="#" className="text-sm hover:text-gray-300">Kontakt</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
