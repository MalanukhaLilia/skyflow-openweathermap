import { useState } from 'react';

function WeatherHeader({
  searchQuery,
  setSearchQuery,
  isCelsius,
  setIsCelsius,
  onSearchSubmit
}) {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (localSearch.trim()) {
      onSearchSubmit(localSearch.trim());
    }
  };

  const handleClear = () => {
    setLocalSearch('');
    setSearchQuery('');
  };

  return (
    <header className="glass__panel p-3 mb-3 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
      <div className="d-flex align-items-center gap-3">
        <div className="bg-light bg-opacity-10 p-2 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
          <img src="assets/img/weather_h1.svg" alt="SkyFlow" className="img-fluid weather-icon-animated" />
        </div>
        <div>
          <h1 className="h4 m-0 fw-bold tracking-wide d-flex align-items-center gap-2">
            SkyFlow <span className="badge bg-primary fs-8 fw-normal px-2 py-1">Forecast</span>
          </h1>
          <p className="small text-white-50 m-0 d-none d-sm-block">Real-time Weather & Monthly Forecasts</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="search-input-wrapper flex-grow-1 max-w-400 mx-md-4" style={{ maxWidth: '400px' }}>
        <input
          type="text"
          className="search-input"
          placeholder="Search location (e.g. Paris, Kyiv, Tokyo)..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
        />
        {localSearch && (
          <button
            type="button"
            className="search-icon-btn me-4"
            onClick={handleClear}
            style={{ right: '25px' }}
            aria-label="Clear search"
          >
            <i className="bi bi-x-lg fs-5"></i>
          </button>
        )}
        <button type="submit" className="search-icon-btn" aria-label="Submit search">
          <i className="bi bi-search fs-5"></i>
        </button>
      </form>
      <div className="d-flex align-items-center gap-3">
        <div className="unit-switch-custom">
          <button
            type="button"
            className={`switch-btn ${isCelsius ? 'active' : ''}`}
            onClick={() => setIsCelsius(true)}
          >
            °C
          </button>
          <button
            type="button"
            className={`switch-btn ${!isCelsius ? 'active' : ''}`}
            onClick={() => setIsCelsius(false)}
          >
            °F
          </button>
        </div>
      </div>
    </header>
  );
}

export default WeatherHeader;
