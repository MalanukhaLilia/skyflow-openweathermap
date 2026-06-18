function WeatherFooter({ weatherDataList = [] }) {
  const getDynamicFooterMessage = () => {
    if (!weatherDataList || weatherDataList.length === 0) {
      return "Enjoy the beautiful day and stay weather-aware!";
    }

    const rainyCities = weatherDataList.filter(item => 
      item.type === 'rainy' || 
      item.condition.toLowerCase().includes('rain') || 
      item.condition.toLowerCase().includes('storm') || 
      item.condition.toLowerCase().includes('drizzle')
    );

    if (rainyCities.length > 0) {
      const cityNames = rainyCities.map(c => c.city).join(', ');
      return `🌂 Don't forget an umbrella if you are in ${cityNames} today!`;
    }

    const sunnyCities = weatherDataList.filter(item => {
      const isClear = item.type === 'sunny' || 
                      item.condition.toLowerCase().includes('clear') || 
                      item.condition.toLowerCase().includes('sunny');
      const isNight = item.isNight ?? false;
      return isClear && !isNight;
    });

    if (sunnyCities.length > 0) {
      const cityNames = sunnyCities.map(c => c.city).join(', ');
      return `😎 Keep your sunglasses handy if you are in ${cityNames}!`;
    }

    return "🌈 Have a wonderful day and enjoy the beautiful weather wherever you are!";
  };

  return (
    <footer className="glass__panel p-3 mt-3 text-center">
      <h5 className="h6 fw-semibold m-0 text-white mb-2">{getDynamicFooterMessage()}</h5>
      <p className="small text-white-50 m-0 footer-text">
        &copy; {new Date().getFullYear()} SkyFlow Weather. All rights reserved. Powered by OpenWeatherMap API.
      </p>
    </footer>
  );
}

export default WeatherFooter;
