import React, { useState } from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ onSearch, initialShowButton = true }) => {
  const [city, setCity] = useState('');
  const [showSearchBtn, setShowSearchBtn] = useState(initialShowButton);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (city.trim()) {
      onSearch(city.trim());
      setCity('');
      setShowSearchBtn(false); // Hide the search button after searching
    }
  };

  const handleFocus = () => {
    setShowSearchBtn(true); // Show the search button when the search bar is pressed/focused
  };

  return (
    <div className="flex flex-col gap-2 w-full" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <form onSubmit={handleSubmit} className="flex gap-3 w-full">
        <div style={{ position: 'relative', flexGrow: 1 }}>
          <input
            type="text"
            placeholder="Search for a city..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onFocus={handleFocus}
          />
        </div>
        {showSearchBtn && (
          <button 
            type="submit" 
            className="primary-btn animate-fade-in"
            style={{ animationDuration: '0.2s' }}
          >
            <Search size={18} />
            <span>Search</span>
          </button>
        )}
      </form>
    </div>
  );
};

export default SearchBar;
