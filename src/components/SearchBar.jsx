import React, { useState } from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ onSearch }) => {
  const [city, setCity] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (city.trim()) {
      onSearch(city.trim());
      setCity('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-4 w-full" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ position: 'relative', flexGrow: 1 }}>
        <input
          type="text"
          placeholder="Search for a city..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
      </div>
      <button type="submit" className="primary-btn">
        <Search size={20} />
        <span>Search</span>
      </button>
    </form>
  );
};

export default SearchBar;
