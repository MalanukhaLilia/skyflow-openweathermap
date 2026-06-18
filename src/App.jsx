import { useState, useEffect } from 'react';
import WeatherHeader from './components/WeatherHeader';
import FavoriteCities from './components/FavoriteCities';
import CurrentWeather from './components/CurrentWeather';
import ForecastView from './components/ForecastView';
import MonthlyForecastView from './components/MonthlyForecastView';
import WeatherFooter from './components/WeatherFooter';

import {
  API_KEY,
  CACHE_TTL,
  getIconForWeather,
  mapIconToBodyClass,
  mapIconCodeToType
} from './utils/weatherHelpers';

const DEFAULT_WEATHER_TOKYO = {
  city: 'Tokyo',
  temp: 22,
  feelsLike: 22,
  humidity: '60%',
  wind: '14 km/h',
  pressure: 1012,
  sunrise: '04:50 AM',
  sunset: '06:45 PM',
  clouds: 30,
  condition: 'Clear Sky',
  icon: 'bi-sun text-warning',
  type: 'sunny',
  isNight: false
};

const DEFAULT_FORECAST_TOKYO = Array.from({ length: 40 }).map((_, i) => {
  const dt = Math.floor(Date.now() / 1000) + i * 10800;
  return {
    dt,
    main: {
      temp: 20 + Math.sin(i / 2) * 3,
      feels_like: 20 + Math.sin(i / 2) * 3,
      temp_min: 17,
      temp_max: 23,
      pressure: 1012,
      humidity: 60 + Math.round(Math.sin(i / 3) * 10)
    },
    weather: [{
      id: 800,
      main: 'Clear',
      description: 'clear sky',
      icon: '01d'
    }],
    wind: { speed: 3.5, deg: 180 },
    dt_txt: new Date(dt * 1000).toISOString().replace('T', ' ').slice(0, 19)
  };
});

function getCachedWeatherData(city) {
  if (!city) return null;
  const keyCurrent = `skyflow_cache_${city.toLowerCase()}_current`;
  const keyForecast = `skyflow_cache_${city.toLowerCase()}_forecast`;
  const cachedCurrent = localStorage.getItem(keyCurrent);
  const cachedForecast = localStorage.getItem(keyForecast);

  if (cachedCurrent && cachedForecast) {
    try {
      const currentData = JSON.parse(cachedCurrent).data;
      const forecastData = JSON.parse(cachedForecast).data;

      const temp = Math.round(currentData.main.temp);
      const feelsLike = Math.round(currentData.main.feels_like);
      const humidity = `${currentData.main.humidity}%`;
      const windSpeedKmH = Math.round(currentData.wind.speed * 3.6);
      const wind = `${windSpeedKmH} km/h`;
      const description = currentData.weather[0].description;
      const iconCode = currentData.weather[0].icon;

      const sunriseTime = new Date((currentData.sys.sunrise + currentData.timezone) * 1000)
        .toUTCString().slice(17, 22);
      const sunsetTime = new Date((currentData.sys.sunset + currentData.timezone) * 1000)
        .toUTCString().slice(17, 22);

      return {
        weather: {
          city: currentData.name,
          temp,
          feelsLike,
          humidity,
          wind,
          pressure: currentData.main.pressure,
          sunrise: `${sunriseTime} AM`,
          sunset: `${sunsetTime} PM`,
          clouds: currentData.clouds.all,
          condition: description.charAt(0).toUpperCase() + description.slice(1),
          icon: getIconForWeather(iconCode, temp),
          type: mapIconCodeToType(iconCode),
          isNight: iconCode.endsWith('n')
        },
        forecastList: forecastData.list,
        timezoneOffset: currentData.timezone,
        bodyClass: mapIconToBodyClass(iconCode)
      };
    } catch (e) {
      return null;
    }
  }

  if (city.toLowerCase() === 'tokyo') {
    return {
      weather: DEFAULT_WEATHER_TOKYO,
      forecastList: DEFAULT_FORECAST_TOKYO,
      timezoneOffset: 32400,
      bodyClass: 'weather__sunny'
    };
  }

  return null;
}

function App() {
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('skyflow_favorites');
    return saved ? JSON.parse(saved) : ['Lisbon', 'Paris', 'Tokyo', 'Sydney', 'New York'];
  });

  const [activeCity, setActiveCity] = useState(() => {
    const saved = localStorage.getItem('skyflow_active_city');
    return saved || 'Tokyo';
  });

  const [isCelsius, setIsCelsius] = useState(() => {
    const saved = localStorage.getItem('skyflow_is_celsius');
    return saved ? JSON.parse(saved) : true;
  });

  const [activeView, setActiveView] = useState('current');

  const [currentWeather, setCurrentWeather] = useState(() => {
    const active = localStorage.getItem('skyflow_active_city') || 'Tokyo';
    const cached = getCachedWeatherData(active);
    return cached ? cached.weather : null;
  });

  const [forecastList, setForecastList] = useState(() => {
    const active = localStorage.getItem('skyflow_active_city') || 'Tokyo';
    const cached = getCachedWeatherData(active);
    return cached ? cached.forecastList : [];
  });

  const [timezoneOffset, setTimezoneOffset] = useState(() => {
    const active = localStorage.getItem('skyflow_active_city') || 'Tokyo';
    const cached = getCachedWeatherData(active);
    return cached ? cached.timezoneOffset : 0;
  });

  const [favoritesWeatherData, setFavoritesWeatherData] = useState({});

  const [loading, setLoading] = useState(() => {
    const active = localStorage.getItem('skyflow_active_city') || 'Tokyo';
    const cached = getCachedWeatherData(active);
    return !cached;
  });
  
  const [error, setError] = useState(null);

  useEffect(() => {
    localStorage.setItem('skyflow_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('skyflow_active_city', activeCity);
  }, [activeCity]);

  useEffect(() => {
    localStorage.setItem('skyflow_is_celsius', JSON.stringify(isCelsius));
  }, [isCelsius]);

  useEffect(() => {
    const cached = getCachedWeatherData(activeCity);
    if (cached) {
      document.body.className = cached.bodyClass;
    }
  }, []);

  const fetchWithCache = async (url, cacheSubKey) => {
    const key = `skyflow_cache_${cacheSubKey.toLowerCase()}`;
    const cached = localStorage.getItem(key);
    if (cached) {
      const { timestamp, data } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL) {
        return data;
      }
    }

    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('City not found. Please check spelling.');
      }
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();

    localStorage.setItem(key, JSON.stringify({
      timestamp: Date.now(),
      data
    }));

    return data;
  };

  useEffect(() => {
    async function fetchActiveCityWeather() {
      if (!currentWeather || currentWeather.city.toLowerCase() !== activeCity.toLowerCase()) {
        setLoading(true);
      }
      setError(null);
      try {
        const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(activeCity)}&appid=${API_KEY}&units=metric`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(activeCity)}&appid=${API_KEY}&units=metric`;

        const [currentData, forecastData] = await Promise.all([
          fetchWithCache(currentWeatherUrl, `${activeCity}_current`),
          fetchWithCache(forecastUrl, `${activeCity}_forecast`)
        ]);

        const temp = Math.round(currentData.main.temp);
        const feelsLike = Math.round(currentData.main.feels_like);
        const humidity = `${currentData.main.humidity}%`;
        const windSpeedKmH = Math.round(currentData.wind.speed * 3.6);
        const wind = `${windSpeedKmH} km/h`;
        const description = currentData.weather[0].description;
        const iconCode = currentData.weather[0].icon;

        const sunriseTime = new Date((currentData.sys.sunrise + currentData.timezone) * 1000)
          .toUTCString().slice(17, 22);
        const sunsetTime = new Date((currentData.sys.sunset + currentData.timezone) * 1000)
          .toUTCString().slice(17, 22);

        setCurrentWeather({
          city: currentData.name,
          temp,
          feelsLike,
          humidity,
          wind,
          pressure: currentData.main.pressure,
          sunrise: `${sunriseTime} AM`,
          sunset: `${sunsetTime} PM`,
          clouds: currentData.clouds.all,
          condition: description.charAt(0).toUpperCase() + description.slice(1),
          icon: getIconForWeather(iconCode, temp),
          type: mapIconCodeToType(iconCode),
          isNight: iconCode.endsWith('n')
        });

        setForecastList(forecastData.list);
        setTimezoneOffset(currentData.timezone);

        document.body.className = mapIconToBodyClass(iconCode);

      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to retrieve weather data.');
      } finally {
        setLoading(false);
      }
    }

    fetchActiveCityWeather();
  }, [activeCity]);

  useEffect(() => {
    async function fetchFavoritesWeather() {
      const summaries = {};
      const promises = favorites.map(async (city) => {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
        try {
          const data = await fetchWithCache(url, `${city}_summary`);
          summaries[city.toLowerCase()] = {
            temp: Math.round(data.main.temp),
            condition: data.weather[0].description,
            icon: getIconForWeather(data.weather[0].icon, data.main.temp),
            type: mapIconCodeToType(data.weather[0].icon),
            isNight: data.weather[0].icon.endsWith('n'),
            city: data.name
          };
        } catch (e) {
          console.error(`Error loading favorite city: ${city}`, e);
        }
      });

      await Promise.all(promises);
      setFavoritesWeatherData(summaries);
    }

    if (favorites.length > 0) {
      fetchFavoritesWeather();
    }
  }, [favorites]);

  const handleSearchSubmit = (query) => {
    setActiveCity(query);
  };

  const handleToggleFavorite = () => {
    const normalizedCity = currentWeather ? currentWeather.city : activeCity;
    const isFav = favorites.some(f => f.toLowerCase() === normalizedCity.toLowerCase());

    if (isFav) {
      setFavorites(prev => prev.filter(f => f.toLowerCase() !== normalizedCity.toLowerCase()));
    } else {
      setFavorites(prev => [...prev, normalizedCity]);
    }
  };

  const handleSelectCity = (city) => {
    setActiveCity(city);
  };

  const handleRemoveFavorite = (city) => {
    setFavorites(prev => prev.filter(f => f.toLowerCase() !== city.toLowerCase()));
  };

  const isFavorite = currentWeather
    ? favorites.some(f => f.toLowerCase() === currentWeather.city.toLowerCase())
    : favorites.some(f => f.toLowerCase() === activeCity.toLowerCase());

  const renderActiveView = () => {
    if (loading) {
      return (
        <div className="text-center py-5">
          <div className="spinner-border text-info weather-spinner mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4 className="h6 text-white-50">Retrieving atmospheric reports...</h4>
        </div>
      );
    }

    switch (activeView) {
      case 'current':
        return <CurrentWeather weather={currentWeather} isCelsius={isCelsius} />;
      case 'forecast':
        return <ForecastView forecastList={forecastList} timezoneOffset={timezoneOffset} isCelsius={isCelsius} />;
      case 'monthly':
        return <MonthlyForecastView forecastList={forecastList} timezoneOffset={timezoneOffset} isCelsius={isCelsius} />;
      default:
        return null;
    }
  };

  const footerWeatherList = Object.values(favoritesWeatherData);

  return (
    <div className="container px-4 px-sm-5 py-3 my-auto" style={{ maxWidth: '1440px' }}>

      <WeatherHeader
        searchQuery={activeCity}
        setSearchQuery={setActiveCity}
        isCelsius={isCelsius}
        setIsCelsius={setIsCelsius}
        onSearchSubmit={handleSearchSubmit}
      />

      {error && (
        <div className="alert alert-danger alert-dismissible fade show glass__panel text-white border-danger border-opacity-50 mb-4" role="alert">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-exclamation-triangle-fill text-danger fs-5"></i>
            <span><strong>Oops!</strong> {error}</span>
          </div>
          <button
            type="button"
            className="btn-close btn-close-white"
            onClick={() => setError(null)}
            aria-label="Close"
          ></button>
        </div>
      )}

      <main className="row g-3">
        <div className="col-12 col-lg-3 sidebar-container">
          <FavoriteCities
            favorites={favorites}
            activeCity={currentWeather ? currentWeather.city : activeCity}
            onSelectCity={handleSelectCity}
            onRemoveFavorite={handleRemoveFavorite}
            citiesWeatherData={favoritesWeatherData}
            isCelsius={isCelsius}
          />
        </div>
        <div className="col-12 col-lg-9 main-content-container">
          <div className="glass__panel p-3 h-100 d-flex flex-column">

            <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2 pb-3">
              <div className="nav-pills-custom">
                <button
                  type="button"
                  className={`nav-link-custom ${activeView === 'current' ? 'active' : ''}`}
                  onClick={() => setActiveView('current')}
                >
                  <i className="bi bi-cloud-sun-fill me-2"></i>Current Weather
                </button>
                <button
                  type="button"
                  className={`nav-link-custom ${activeView === 'forecast' ? 'active' : ''}`}
                  onClick={() => setActiveView('forecast')}
                >
                  <i className="bi bi-calendar-week-fill me-2"></i>14-Day Forecast
                </button>
                <button
                  type="button"
                  className={`nav-link-custom ${activeView === 'monthly' ? 'active' : ''}`}
                  onClick={() => setActiveView('monthly')}
                >
                  <i className="bi bi-calendar3 me-2"></i>Monthly Forecast
                </button>
              </div>

              {currentWeather && (
                <div className="d-flex align-items-center gap-3">
                  <div className="small text-white-50">
                    <i className="bi bi-geo-alt-fill me-1"></i>
                    {currentWeather.city}
                  </div>
                  <button
                    type="button"
                    className="btn btn-favorite p-0 me-3 d-flex align-items-center gap-1"
                    onClick={handleToggleFavorite}
                    aria-label={isFavorite ? "Remove from favorites" : "Save to favorites"}
                  >
                    <i className={`bi ${isFavorite ? 'bi-star-fill' : 'bi-star'} fs-6`}></i>
                    <span className="small d-none d-sm-inline" style={{ fontSize: '13px' }}>{isFavorite ? 'Saved' : 'Save'}</span>
                  </button>
                </div>
              )}
            </div>
            <div className="flex-grow-1 d-flex flex-column justify-content-center">
              {renderActiveView()}
            </div>
          </div>
        </div>
      </main>
      <WeatherFooter weatherDataList={footerWeatherList} />
    </div>
  );
}

export default App;
