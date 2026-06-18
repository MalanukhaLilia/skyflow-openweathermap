function FavoriteCities({
  favorites,
  activeCity,
  onSelectCity,
  onRemoveFavorite,
  citiesWeatherData,
  isCelsius
}) {
  return (
    <div className="glass__panel p-3 h-100">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h3 className="h5 fw-bold m-0 d-flex align-items-center gap-2">
          <i className="bi bi-star-fill text-warning"></i>
          My Locations
        </h3>
        <span className="badge bg-light bg-opacity-10 text-white-50">{favorites.length} saved</span>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-4 text-white-50 border border-dashed rounded-3 border-secondary border-opacity-50">
          <i className="bi bi-geo-alt fs-2 mb-2 d-block"></i>
          <p className="small mb-0">No locations saved. Search a city and click the star to save it!</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-2 overflow-auto" style={{ maxHeight: '650px', paddingRight: '5px' }}>
          {favorites.map((city) => {
            const weather = citiesWeatherData[city.toLowerCase()];
            const isActive = activeCity.toLowerCase() === city.toLowerCase();

            let tempStr = '--';
            let iconSrc = null;

            if (weather) {
              const tempVal = isCelsius ? weather.temp : Math.round((weather.temp * 9) / 5 + 32);
              tempStr = `${tempVal}°`;
              iconSrc = weather.icon;
            }

            return (
              <div
                key={city}
                onClick={() => onSelectCity(city)}
                className={`favorite-city-card d-flex align-items-center justify-content-between p-2 px-3 rounded-3 cursor-pointer ${isActive ? 'active' : ''
                  }`}
              >
                <div className="d-flex align-items-center gap-3 overflow-hidden">
                  {iconSrc ? (
                    <i className={`bi ${iconSrc.replace(/\btext-\S+/g, '')} text-white`} style={{ fontSize: '24px', width: '30px', display: 'inline-block', textAlign: 'center' }}></i>
                  ) : (
                    <i className="bi bi-cloud-sun text-white fs-5"></i>
                  )}
                  <div className="text-truncate">
                    <span className="fw-semibold text-white d-block text-truncate">{city}</span>
                    {weather && (
                      <span className="small text-white-50 text-capitalize text-truncate d-block">
                        {weather.condition}
                      </span>
                    )}
                  </div>
                </div>
                <div className="d-flex align-items-center gap-3 ms-2">
                  <span className="fs-5 fw-bold text-white">{tempStr}</span>
                  <button
                    type="button"
                    className="btn btn-link p-0 border-0 favorite-city-card__remove-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFavorite(city);
                    }}
                    aria-label={`Remove ${city} from favorites`}
                  >
                    <i className="bi bi-trash-fill"></i>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default FavoriteCities;
