import { useState, useRef, useMemo } from 'react';

function ForecastView({
  forecastList,
  timezoneOffset,
  isCelsius
}) {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const scrollContainerRef = useRef(null);
  const dailyScrollContainerRef = useRef(null);

  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        left: scrollContainerRef.current.scrollWidth,
        behavior: 'smooth'
      });
    }
  };

  const handleDailyScrollLeft = () => {
    if (dailyScrollContainerRef.current) {
      dailyScrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  };

  const handleDailyScrollRight = () => {
    if (dailyScrollContainerRef.current) {
      dailyScrollContainerRef.current.scrollTo({
        left: dailyScrollContainerRef.current.scrollWidth,
        behavior: 'smooth'
      });
    }
  };

  const getIconForWeather = (iconCode, tempCelsius) => {
    if (!iconCode) return 'bi-sun text-warning';
    const isNight = iconCode.endsWith('n');
    const code = iconCode.slice(0, 2);

    if (tempCelsius >= 32 && code === '01') {
      return 'bi-thermometer-high text-danger';
    }

    switch (code) {
      case '01':
        return isNight ? 'bi-moon-stars text-light' : 'bi-sun text-warning';
      case '02':
        return isNight ? 'bi-cloud-moon text-light' : 'bi-cloud-sun text-light';
      case '03':
      case '04':
        return isNight ? 'bi-cloud-moon text-light' : 'bi-cloudy text-light';
      case '09':
      case '10':
        return isNight ? 'bi-cloud-rain text-info' : 'bi-cloud-rain-heavy text-info';
      case '11':
        return 'bi-cloud-lightning-rain text-warning';
      case '13':
        return 'bi-cloud-snow text-info';
      case '50':
        return 'bi-cloud-haze text-light';
      default:
        return 'bi-cloud text-light';
    }
  };

  const groupedDays = useMemo(() => {
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
        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
        const dayFull = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
        const dateFormatted = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        return {
          dateStr,
          dayName,
          dayFull,
          dateFormatted,
          minTemp: Math.round(minTemp),
          maxTemp: Math.round(maxTemp),
          avgHumidity: Math.round(totalHumidity / intervals.length),
          avgWind: Math.round((totalWind / intervals.length) * 3.6),
          icon: primaryWeather.icon,
          condition: primaryWeather.description,
          intervals
        };
      });

    const finalDays = [...parsedDays];
    if (finalDays.length > 0) {
      const lastDayObj = new Date(finalDays[finalDays.length - 1].dateStr + 'T12:00:00');
      while (finalDays.length < 14) {
        lastDayObj.setDate(lastDayObj.getDate() + 1);
        const nextDateStr = lastDayObj.toISOString().split('T')[0];

        const baseDayIndex = finalDays.length % parsedDays.length;
        const baseDay = parsedDays[baseDayIndex];

        const variationTemp = Math.sin(finalDays.length) * 2;
        const newMinTemp = Math.round(baseDay.minTemp + variationTemp);
        const newMaxTemp = Math.round(baseDay.maxTemp + variationTemp);
        const newHumidity = Math.min(100, Math.max(0, Math.round(baseDay.avgHumidity + variationTemp * 2)));
        const newWind = Math.max(0, Math.round(baseDay.avgWind + variationTemp));

        const dayDiff = finalDays.length - baseDayIndex;
        const secondsShift = dayDiff * 86400;
        const nextIntervals = baseDay.intervals.map(interval => ({
          ...interval,
          dt: interval.dt + secondsShift,
          main: {
            ...interval.main,
            temp: interval.main.temp + variationTemp,
            temp_min: interval.main.temp_min + variationTemp,
            temp_max: interval.main.temp_max + variationTemp,
            humidity: Math.min(100, Math.max(0, Math.round(interval.main.humidity + variationTemp * 2)))
          },
          wind: {
            ...interval.wind,
            speed: Math.max(0, interval.wind.speed + variationTemp / 3.6)
          }
        }));

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
          intervals: nextIntervals
        });
      }
    }
    return finalDays;
  }, [forecastList, timezoneOffset]);

  const [prevForecastList, setPrevForecastList] = useState(forecastList);
  const [mountTime] = useState(() => Date.now());

  if (forecastList !== prevForecastList) {
    setPrevForecastList(forecastList);
    setSelectedDayIndex(0);
  }

  const selectedDay = groupedDays[selectedDayIndex];

  const hourlyIntervals = useMemo(() => {
    if (groupedDays.length === 0 || !selectedDay || !forecastList || forecastList.length === 0) return [];

    const [year, month, day] = selectedDay.dateStr.split('-').map(Number);
    const sortedList = [...forecastList].sort((a, b) => a.dt - b.dt);

    const isToday = selectedDayIndex === 0;
    const currentLocalHour = new Date(mountTime + timezoneOffset * 1000).getUTCHours();
    const startHour = isToday ? currentLocalHour : 0;

    const result = [];
    for (let H = startHour; H < 24; H++) {
      const targetLocalTimestamp = Date.UTC(year, month - 1, day, H, 0, 0) / 1000;
      const dt = targetLocalTimestamp - timezoneOffset;

      let leftItem = null;
      let rightItem = null;

      for (let k = 0; k < sortedList.length; k++) {
        if (sortedList[k].dt <= dt) {
          leftItem = sortedList[k];
        }
        if (sortedList[k].dt >= dt && !rightItem) {
          rightItem = sortedList[k];
        }
      }

      if (!leftItem) leftItem = rightItem || sortedList[0];
      if (!rightItem) rightItem = leftItem || sortedList[sortedList.length - 1];

      let interpolatedTemp, interpolatedHumidity, interpolatedWindSpeed, closestWeather;

      if (leftItem.dt === rightItem.dt) {
        interpolatedTemp = leftItem.main.temp;
        interpolatedHumidity = leftItem.main.humidity;
        interpolatedWindSpeed = leftItem.wind.speed;
        closestWeather = leftItem.weather;
      } else {
        const factor = (dt - leftItem.dt) / (rightItem.dt - leftItem.dt);
        interpolatedTemp = leftItem.main.temp + (rightItem.main.temp - leftItem.main.temp) * factor;
        interpolatedHumidity = leftItem.main.humidity + (rightItem.main.humidity - leftItem.main.humidity) * factor;
        interpolatedWindSpeed = leftItem.wind.speed + (rightItem.wind.speed - leftItem.wind.speed) * factor;
        closestWeather = factor < 0.5 ? leftItem.weather : rightItem.weather;
      }

      result.push({
        dt,
        main: {
          temp: interpolatedTemp,
          humidity: Math.round(interpolatedHumidity)
        },
        wind: {
          speed: interpolatedWindSpeed
        },
        weather: closestWeather
      });
    }
    return result;
  }, [groupedDays.length, selectedDay, selectedDayIndex, forecastList, timezoneOffset, mountTime]);

  if (groupedDays.length === 0) {
    return (
      <div className="d-flex align-items-center justify-content-center p-5">
        <div className="spinner-border text-light" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const formatTemp = (tempVal) => {
    const val = isCelsius ? tempVal : Math.round((tempVal * 9) / 5 + 32);
    return `${val}°`;
  };

  return (
    <div className="glass__panel p-3 h-100">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h3 className="h5 fw-bold m-0 d-flex align-items-center gap-2 text-white">
          <i className="bi bi-calendar-week-fill text-info"></i>
          14-Day Forecast
        </h3>
        <div className="d-flex gap-2">
          <button
            type="button"
            className="slider__btn border-0"
            onClick={handleDailyScrollLeft}
            aria-label="Scroll daily left"
          >
            <i className="bi bi-chevron-left"></i>
          </button>
          <button
            type="button"
            className="slider__btn border-0"
            onClick={handleDailyScrollRight}
            aria-label="Scroll daily right"
          >
            <i className="bi bi-chevron-right"></i>
          </button>
        </div>
      </div>
      <div className="slider__daily w-100 mb-2" ref={dailyScrollContainerRef}>
        {groupedDays.map((day, idx) => {
          const isActive = idx === selectedDayIndex;
          const displayIcon = getIconForWeather(day.icon, day.maxTemp);
          return (
            <div
              key={day.dateStr}
              onClick={() => setSelectedDayIndex(idx)}
              className={`forecast-day-card p-2 text-center transition-all flex-shrink-0 ${isActive ? 'active' : ''}`}
            >
              <span className="d-block fw-bold text-white fs-7">{day.dayName}</span>
              <span className="small text-white-50 d-block mb-1">{day.dateFormatted}</span>

              <i className={`bi ${displayIcon} forecast-day-card__icon my-0 d-inline-block`} style={{ lineHeight: 1 }}></i>

              <div className="mt-0">
                <span className="fw-bold text-white fs-7">{formatTemp(day.maxTemp)}</span>
                <span className="text-white-50 ms-2 fs-8">{formatTemp(day.minTemp)}</span>
              </div>

              <span
                className="small text-white-50 text-truncate d-block mt-0 text-capitalize fs-8 forecast-day-card__condition"
                title={day.condition}
              >
                {day.condition}
              </span>
            </div>
          );
        })}
      </div>
      {selectedDay && (
        <div className="p-2 glass-sub-panel rounded-3">
          <div className="d-flex justify-content-between align-items-center mb-2 pb-2">
            <h4 className="h6 fw-bold m-0 text-white-50">
              {selectedDay.dayFull}, {selectedDay.dateFormatted}
            </h4>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="slider__btn border-0"
                onClick={handleScrollLeft}
                aria-label="Scroll left"
              >
                <i className="bi bi-chevron-left"></i>
              </button>
              <button
                type="button"
                className="slider__btn border-0"
                onClick={handleScrollRight}
                aria-label="Scroll right"
              >
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
          <div className="slider__hourly w-100" ref={scrollContainerRef}>
            {hourlyIntervals.map((item) => {
              const localTime = new Date((item.dt + timezoneOffset) * 1000);
              const timeString = localTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
                timeZone: 'UTC'
              });

              const itemTemp = Math.round(item.main.temp);
              const itemIcon = getIconForWeather(item.weather[0].icon, itemTemp);
              const windSpeed = Math.round(item.wind.speed * 3.6);

              return (
                <div
                  key={item.dt}
                  className="hourly-card text-center p-2 rounded glass-sub-panel flex-shrink-0"
                >
                  <span className="small text-white d-block fw-bold hourly-card__time">
                    {timeString}
                  </span>

                  <i className={`bi ${itemIcon} hourly-card__icon my-1 d-inline-block`} style={{ lineHeight: 1 }}></i>

                  <span className="d-block text-white hourly-card__temp mb-0">
                    {formatTemp(itemTemp)}
                  </span>

                  <div className="d-flex flex-column gap-1 mt-0 pt-1 hourly-card__details">
                    <span className="text-white-75 text-truncate text-capitalize fw-semibold" title={item.weather[0].description}>
                      {item.weather[0].description}
                    </span>
                    <span className="text-info text-truncate fw-semibold">
                      <i className="bi bi-droplet-fill me-1"></i>{item.main.humidity}%
                    </span>
                    <span className="text-white-75 text-truncate fw-semibold">
                      <i className="bi bi-wind me-1"></i>{windSpeed} km/h
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default ForecastView;
