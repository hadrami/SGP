import React from 'react';

const Loader = () => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#40916c]"></div>
      <span className="ml-3 text-[#40916c] font-medium">Chargement...</span>
    </div>
  );
};

export default Loader;