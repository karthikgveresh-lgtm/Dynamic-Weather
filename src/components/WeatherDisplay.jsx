import React from 'react';
import { Droplets, Wind, Thermometer, Cloud, Sun, Moon, CloudFog, CloudRain, CloudSnow, CloudLightning } from 'lucide-react';
import { getWeatherDescription, getWeatherIconName } from '../services/weatherApi';

const IconComponent = ({ name, size, color }) => {
  const icons = {
    Sun, Moon, Cloud, CloudFog, CloudRain, CloudSnow, CloudLightning
  };
  const Icon = icons[name] || Cloud;
  return <Icon size={size} color={color} />;
};

const WeatherDisplay = ({ weather }) => {
  if (!weather) {
    return (
      <div className="glass-panel flex flex-col items-center justify-center text-center animate-fade-in" style={{ minHeight: '300px' }}>
        <Cloud size={64} style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem' }} />
        <h2>Welcome to WeatherMap</h2>
        <p>Search for a city to see the dynamic weather and map.</p>
      </div>
    );
  }

  const { location, current, daily } = weather;
  const description = getWeatherDescription(current.weather_code);
  const iconName = getWeatherIconName(current.weather_code, current.is_day);

  return (
    <div className="glass-panel animate-fade-in flex flex-col gap-6" style={{ height: '100%' }}>
      <div className="flex justify-between items-center">
        <div>
          <h2 style={{ fontSize: '2.5rem', margin: 0 }}>{location.name}</h2>
          <p style={{ fontSize: '1.2rem', textTransform: 'capitalize', color: 'var(--color-accent)' }}>
            {description}
          </p>
        </div>
        <div style={{ filter: 'drop-shadow(0px 10px 15px rgba(0,0,0,0.2))' }}>
          <IconComponent name={iconName} size={80} color="var(--color-text-primary)" />
        </div>
      </div>

      <div style={{ fontSize: '4rem', fontWeight: '700', lineHeight: 1 }}>
        {Math.round(current.temperature_2m)}°C
      </div>

      <div className="flex gap-4" style={{ flexWrap: 'wrap', marginTop: '1rem' }}>
        <div className="flex items-center gap-2" style={{ background: 'rgba(255,255,255,0.05)', padding: '0.8rem 1.2rem', borderRadius: '1rem', flex: '1 1 45%' }}>
          <Thermometer size={24} color="var(--color-accent)" />
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Feels Like</div>
            <div style={{ fontWeight: '600' }}>{Math.round(current.apparent_temperature)}°C</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2" style={{ background: 'rgba(255,255,255,0.05)', padding: '0.8rem 1.2rem', borderRadius: '1rem', flex: '1 1 45%' }}>
          <Wind size={24} color="var(--color-accent)" />
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Wind</div>
            <div style={{ fontWeight: '600' }}>{current.wind_speed_10m} km/h</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2" style={{ background: 'rgba(255,255,255,0.05)', padding: '0.8rem 1.2rem', borderRadius: '1rem', flex: '1 1 100%' }}>
          <Droplets size={24} color="var(--color-accent)" />
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Humidity</div>
            <div style={{ fontWeight: '600' }}>{current.relative_humidity_2m}%</div>
          </div>
        </div>
      </div>

      {daily && daily.time && (
        <div style={{ marginTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Upcoming Forecast</h3>
          <div className="flex gap-4" style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {daily.time.slice(1, 6).map((time, index) => {
              const date = new Date(time);
              const day = date.toLocaleDateString('en-US', { weekday: 'short' });
              const dailyCode = daily.weather_code[index + 1];
              const maxTemp = daily.temperature_2m_max[index + 1];
              const minTemp = daily.temperature_2m_min[index + 1];
              const dIcon = getWeatherIconName(dailyCode, 1);
              
              return (
                <div key={index} className="flex flex-col items-center" style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '1rem', minWidth: '90px' }}>
                  <div style={{ fontWeight: '600' }}>{day}</div>
                  <div style={{ margin: '0.5rem 0' }}>
                    <IconComponent name={dIcon} size={30} color="var(--color-text-primary)" />
                  </div>
                  <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>
                    {Math.round(maxTemp)}° <span style={{ color: 'var(--color-text-secondary)', fontWeight: 'normal' }}>{Math.round(minTemp)}°</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherDisplay;
