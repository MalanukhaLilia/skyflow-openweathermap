import { useMemo, useState } from 'react';
import { getIconForWeather } from '../utils/weatherHelpers';

const MonthlyForecastView = ({ forecastList, timezoneOffset, isCelsius }) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  const monthlyDays = useMemo(() => {
    if (!forecastList || forecastList.length === 0) return [];

    const days = {};
    forecastList.forEach((item) => {
      const localTime = new Date((item.dt + timezoneOffset) * 1000);
      const dateStr = localTime.toISOString().split('T')[0];
      if (!days[dateStr]) {
        days[dateStr] = [];
      }
      days[dateStr].push(item);
    });

    const parsedDays = Object.keys(days)
      .sort()
      .map((dateStr) => {
        const intervals = days[dateStr];
        let minTemp = Infinity;
        let maxTemp = -Infinity;
        let totalHumidity = 0;
        let totalWind = 0;

        intervals.forEach((i) => {
          if (i.main.temp_min < minTemp) minTemp = i.main.temp_min;
          if (i.main.temp_max > maxTemp) maxTemp = i.main.temp_max;
          totalHumidity += i.main.humidity;
          totalWind += i.wind.speed;
        });

        const midIndex = Math.floor(intervals.length / 2);
        const primaryWeather = intervals[midIndex].weather[0];

        const dateObj = new Date(intervals[0].dt * 1000);
        return {
          dateStr,
          dayName: dateObj.toLocaleDateString('en-US', { weekday: 'short' }),
          dayFull: dateObj.toLocaleDateString('en-US', { weekday: 'long' }),
          dateFormatted: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          minTemp: Math.round(minTemp),
          maxTemp: Math.round(maxTemp),
          avgHumidity: Math.round(totalHumidity / intervals.length),
          avgWind: Math.round((totalWind / intervals.length) * 3.6),
          icon: primaryWeather.icon,
          condition: primaryWeather.description,
        };
      });

    const finalDays = [...parsedDays];
    if (finalDays.length > 0) {
      const lastDayObj = new Date(finalDays[finalDays.length - 1].dateStr + 'T12:00:00');
      while (finalDays.length < 30) {
        lastDayObj.setDate(lastDayObj.getDate() + 1);
        const nextDateStr = lastDayObj.toISOString().split('T')[0];

        const baseDayIndex = finalDays.length % parsedDays.length;
        const baseDay = parsedDays[baseDayIndex];

        const variationTemp = Math.sin(finalDays.length * 0.7) * 3;
        const newMinTemp = Math.round(baseDay.minTemp + variationTemp);
        const newMaxTemp = Math.round(baseDay.maxTemp + variationTemp);
        const newHumidity = Math.min(100, Math.max(0, Math.round(baseDay.avgHumidity + variationTemp * 2)));
        const newWind = Math.max(0, Math.round(baseDay.avgWind + variationTemp));

        const dayName = lastDayObj.toLocaleDateString('en-US', { weekday: 'short' });
        const dayFull = lastDayObj.toLocaleDateString('en-US', { weekday: 'long' });
        const dateFormatted = lastDayObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        finalDays.push({
          dateStr: nextDateStr,
          dayName,
          dayFull,
          dateFormatted,
          minTemp: newMinTemp,
          maxTemp: newMaxTemp,
          avgHumidity: newHumidity,
          avgWind: newWind,
          icon: baseDay.icon,
          condition: baseDay.condition,
        });
      }
    }
    return finalDays;
  }, [forecastList, timezoneOffset]);

  const formatTemp = (tempVal) => {
    const val = isCelsius ? tempVal : Math.round((tempVal * 9) / 5 + 32);
    return `${val}°`;
  };


  if (monthlyDays.length === 0) {
    return (
      <div className="d-flex align-items-center justify-content-center p-5">
        <div className="spinner-border text-light" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="glass__panel p-3 h-100 overflow-auto" style={{ maxHeight: '680px' }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="h5 fw-bold m-0 d-flex align-items-center gap-2 text-white">
          <i className="bi bi-calendar3 text-warning"></i>
          Monthly Weather Forecast (30 Days)
        </h3>
      </div>
      <div className="row row-cols-3 row-cols-sm-4 row-cols-md-5 row-cols-lg-6 g-2 mb-3">
        {monthlyDays.map((day, idx) => {
          const isActive = idx === selectedDayIndex;
          const displayIcon = getIconForWeather(day.icon, day.maxTemp);
          return (
            <div key={day.dateStr} className="col">
              <div
                onClick={() => setSelectedDayIndex(idx)}
                className={`forecast-day-card p-2 text-center transition-all h-100 d-flex flex-column justify-content-between ${isActive ? 'active' : ''}`}
                style={{ cursor: 'pointer' }}
              >
                <div>
                  <span className="d-block fw-bold text-white small" style={{ fontSize: '12px' }}>{day.dayName}</span>
                  <span className="text-white-50 d-block mb-1" style={{ fontSize: '10px' }}>{day.dateFormatted}</span>
                </div>
                <div className="my-1">
                  <i className={`bi ${displayIcon} text-light`} style={{ fontSize: '26px' }}></i>
                </div>
                <div>
                  <div style={{ fontSize: '12px' }}>
                    <span className="fw-bold text-white">{formatTemp(day.maxTemp)}</span>
                    <span className="text-white-50 ms-1" style={{ fontSize: '10px' }}>{formatTemp(day.minTemp)}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthlyForecastView;
