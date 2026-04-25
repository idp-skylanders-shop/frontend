import React from 'react';

const FilterBar = ({
  filterElement, setFilterElement,
  filterSeries, setFilterSeries,
  minPrice, setMinPrice,
  maxPrice, setMaxPrice,
  searchTerm, setSearchTerm,
  setSearchQuery,
  MAX_LIMIT,
  handleMinSlide,
  handleMaxSlide,
  handleMinInputChange,
  handleMaxInputChange,
  handleBlur
}) => {

  const getPercent = (value) => {
      const safeValue = value === '' ? 0 : value; 
      return Math.round(((safeValue) / MAX_LIMIT) * 100);
  };

  const handleReset = () => {
    setFilterElement("");
    setFilterSeries("");
    setMinPrice(0);
    setMaxPrice(MAX_LIMIT);
    setSearchTerm("");
    setSearchQuery(""); 
  };

  return (
    <div style={{ width: '250px', paddingRight: '20px', borderRight: '2px solid #eee', flexShrink: 0 }}>
      
      <button 
        className="magic-btn" 
        style={{ width: '100%', marginBottom: '30px', borderRadius: '10px', padding: '15px' }}
        onClick={handleReset} 
      >
        Shop ALL
      </button>

      <div style={{ textAlign: 'left' }}>
        <h3 style={{ borderBottom: '2px solid #ddd', paddingBottom: '10px', marginBottom: '15px' }}>Filter</h3>

        {/* filtru dupa element */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Filter by Element</label>
          <select 
            className="magic-input" 
            style={{ width: '100%', padding: '10px', cursor: 'pointer' }}
            value={filterElement} 
            onChange={(e) => setFilterElement(e.target.value)} 
          >
            <option value="">All Elements</option>
            <option value="Fire">Fire 🔥</option>
            <option value="Water">Water 💧</option>
            <option value="Earth">Earth ⛰️</option>
            <option value="Air">Air 🌪️</option>
            <option value="Life">Life 🌱</option>
            <option value="Undead">Undead ☠️</option>
            <option value="Tech">Tech ⚙️</option>
            <option value="Magic">Magic ✨</option>
          </select>
        </div>

        {/* Filtru dupa serie */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Filter by Series</label>
          <select 
            className="magic-input" 
            style={{ width: '100%', padding: '10px', cursor: 'pointer' }}
            value={filterSeries} 
            onChange={(e) => setFilterSeries(e.target.value)} 
          >
            <option value="">All Series</option>
            <option value="Spyro's Adventure">Spyro's Adventure 🐉</option>
            <option value="Giants">Giants 🗿</option>
            <option value="Swap Force">Swap Force 🔁</option>
            <option value="Trap Team">Trap Team 🪤</option>
            <option value="SuperChargers">SuperChargers 🏎️</option>
            <option value="Imaginators">Imaginators 💡</option>
          </select>
        </div>

        {/* Filtru dupa range-ul pretului (similar cu emag) */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Price Range</label>
          <div className="slider-container">
            <input
              type="range"
              min="0"
              max={MAX_LIMIT}
              value={minPrice === '' ? 0 : minPrice}
              onChange={handleMinSlide}
              className="thumb thumb--left"
              style={{ zIndex: minPrice > MAX_LIMIT - 10 && "5" }}
            />
            <input
              type="range"
              min="0"
              max={MAX_LIMIT}
              value={maxPrice === '' ? MAX_LIMIT : maxPrice}
              onChange={handleMaxSlide}
              className="thumb thumb--right"
            />
            <div className="slider-track" />
            <div 
              className="slider-range" 
              style={{
                left: `${getPercent(minPrice)}%`,
                width: `${getPercent(maxPrice) - getPercent(minPrice)}%`
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginTop: '5px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: '5px', color: '#666' }}>$</span>
              <input 
                type="text" 
                inputMode="numeric"
                value={minPrice} 
                onChange={handleMinInputChange}
                onBlur={handleBlur}
                className="magic-input"
                style={{ width: '60px', padding: '5px', textAlign: 'center' }}
              />
            </div>
            
            <span style={{ alignSelf: 'center', color: '#aaa' }}>-</span>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: '5px', color: '#666' }}>$</span>
              <input 
                type="text" 
                inputMode="numeric"
                value={maxPrice} 
                onChange={handleMaxInputChange}
                onBlur={handleBlur}
                className="magic-input"
                style={{ width: '60px', padding: '5px', textAlign: 'center' }}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FilterBar;
