export const API_KEY = '5a5417f25c205e05f2bbfd938f406cb4';
export const CACHE_TTL = 15 * 60 * 1000;

export function getIconForWeather(iconCode, tempCelsius) {
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
}

export function mapIconCodeToType(iconCode) {
  if (!iconCode) return 'sunny';
  const code = iconCode.slice(0, 2);

  switch (code) {
    case '01':
      return 'sunny';
    case '02':
    case '03':
    case '04':
      return 'cloudy';
    case '09':
    case '10':
    case '11':
      return 'rainy';
    case '13':
      return 'snowy';
    default:
      return 'sunny';
  }
}

export function mapIconToBodyClass(iconCode) {
  if (!iconCode) return 'weather__cloudy';
  const isNight = iconCode.endsWith('n');
  const code = iconCode.slice(0, 2);

  if (isNight) {
    if (code === '01' || code === '02' || code === '03' || code === '04' || code === '50') {
      return 'weather__night';
    }
  }

  switch (code) {
    case '01':
      return 'weather__sunny';
    case '02':
    case '03':
    case '04':
      return 'weather__cloudy';
    case '09':
    case '10':
      return 'weather__rainy';
    case '11':
      return 'weather__thunderstorm';
    case '13':
      return 'weather__snowy';
    case '50':
    default:
      return 'weather__cloudy';
  }
}
