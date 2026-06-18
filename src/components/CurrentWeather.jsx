import { useState } from 'react';

function CurrentWeather({
  weather,
  isCelsius
}) {
  const [isFlipped, setIsFlipped] = useState(false);

  if (!weather) return null;

  const {
    city,
    temp,
    feelsLike,
    humidity,
    wind,
    condition,
    icon,
    pressure,
    sunrise,
    sunset,
    clouds
  } = weather;

  const displayTemp = isCelsius ? `${temp}°C` : `${Math.round((temp * 9) / 5 + 32)}°F`;
  const displayFeelsLike = isCelsius ? `${feelsLike}°C` : `${Math.round((feelsLike * 9) / 5 + 32)}°F`;

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="w-100 h-100">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h2 className="h4 fw-bold m-0 d-flex align-items-center gap-2 text-white">
          <span>Current Weather</span>
        </h2>
      </div>
      <div className="weather-card-container mb-2" onClick={handleCardClick}>
        <div className={`weather-card-inner ${isFlipped ? 'flipped' : ''}`}>
          <div className="weather-card-front glass__panel d-flex flex-column justify-content-between">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <span className="text-white-50 small text-uppercase tracking-wider">Location</span>
                <h3 className="h3 fw-bold m-0 text-white text-truncate" style={{ maxWidth: '200px' }}>{city}</h3>
              </div>
            </div>
            <div className="d-flex align-items-center justify-content-between my-2">
              <span className="display-4 fw-bold text-white tracking-tight">{displayTemp}</span>
              {icon && (
                <i
                  className={`bi ${icon} weather-icon-animated`}
                  style={{ fontSize: '65px', display: 'inline-block', lineHeight: 1 }}
                ></i>
              )}
            </div>
            <div className="d-flex justify-content-between align-items-end mt-2">
              <div>
                <span className="text-capitalize fw-semibold text-white fs-6">{condition}</span>
                <span className="small text-white-50 d-block">Feels like {displayFeelsLike}</span>
              </div>
              <div className="text-end text-white-50 small">
                <i className="bi bi-arrow-repeat me-1"></i> Flip for info
              </div>
            </div>
          </div>
          <div className="weather-card-back d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3 pb-2">
                <h4 className="h5 fw-bold m-0 text-truncate">{city} Details</h4>
              </div>
              <div className="row g-2">
                <div className="col-6">
                  <div className="p-1 px-2 glass-sub-panel rounded">
                    <span className="small text-white-50 d-block"><i className="bi bi-thermometer-half text-warning me-1"></i> Feels Like</span>
                    <span className="fw-semibold">{displayFeelsLike}</span>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-1 px-2 glass-sub-panel rounded">
                    <span className="small text-white-50 d-block"><i className="bi bi-droplet-fill text-info me-1"></i> Humidity</span>
                    <span className="fw-semibold">{humidity}</span>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-1 px-2 glass-sub-panel rounded">
                    <span className="small text-white-50 d-block"><i className="bi bi-wind text-light me-1"></i> Wind</span>
                    <span className="fw-semibold">{wind}</span>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-1 px-2 glass-sub-panel rounded">
                    <span className="small text-white-50 d-block"><i className="bi bi-speedometer text-secondary me-1"></i> Pressure</span>
                    <span className="fw-semibold">{pressure} hPa</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-2 pt-1 d-flex justify-content-between align-items-center small text-white-50">
              <span><i className="bi bi-sunrise-fill text-warning me-1"></i> {sunrise}</span>
              <span><i className="bi bi-sunset-fill text-primary me-1"></i> {sunset}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="row g-3">
        <div className="col-4">
          <div className="glass__panel p-2 py-3 text-center">
            <i className="bi bi-wind fs-4 mb-1 d-block dashboard-stat-icon icon-wind"></i>
            <span className="small text-white-50 d-block">Wind</span>
            <span className="fw-bold fs-6">{wind}</span>
          </div>
        </div>
        <div className="col-4">
          <div className="glass__panel p-2 py-3 text-center">
            <i className="bi bi-droplet-fill fs-4 mb-1 d-block dashboard-stat-icon icon-humidity"></i>
            <span className="small text-white-50 d-block">Humidity</span>
            <span className="fw-bold fs-6">{humidity}</span>
          </div>
        </div>
        <div className="col-4">
          <div className="glass__panel p-2 py-3 text-center">
            <i className="bi bi-clouds-fill fs-4 mb-1 d-block dashboard-stat-icon icon-clouds"></i>
            <span className="small text-white-50 d-block">Clouds</span>
            <span className="fw-bold fs-6">{clouds}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CurrentWeather;
