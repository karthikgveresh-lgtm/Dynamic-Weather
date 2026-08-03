import React, { useMemo } from 'react';
import { Compass, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

const TravelIndex = ({ weather }) => {
  const recommendation = useMemo(() => {
    if (!weather || !weather.current) return null;

    const code = weather.current.weather_code;
    const temp = weather.current.temperature_2m;

    let score = 95; // base score out of 100
    let status = 'Excellent';
    let message = 'Perfect outdoor conditions! Parks, outdoor monuments, and viewpoints are highly recommended.';
    let level = 'success'; // success, warning, danger
    let bestCategories = ['Nature & Parks', 'Tourist Attraction', 'Historical & Cultural'];

    if (code === 0) {
      // Clear sky
      if (temp > 35) {
        score = 75;
        status = 'High Heat Advisory';
        message = 'Outdoor parks will be hot during midday. Seek indoor historical sites, temples, or museums during peak heat hours.';
        level = 'warning';
        bestCategories = ['Temple & Religious', 'Historical & Cultural'];
      }
    } else if (code >= 1 && code <= 3) {
      // Partly cloudy
      score = 90;
      status = 'Great';
      message = 'Pleasant weather for exploration. Enjoy gardens, temples, and landmarks.';
      if (temp > 35) {
        score = 70;
        status = 'Warm Conditions';
        level = 'warning';
      }
    } else if (code === 45 || code === 48) {
      // Fog
      score = 65;
      status = 'Moderate';
      message = 'Reduced visibility. Views from heights may be limited. Excellent day for indoor historical sites and local temples.';
      level = 'warning';
      bestCategories = ['Temple & Religious', 'Historical & Cultural'];
    } else if ((code >= 51 && code <= 65) || (code >= 80 && code <= 82)) {
      // Rain / showers
      score = 45;
      status = 'Poor for Outdoors';
      message = 'Rainy weather. Outdoor natural parks will be muddy and wet. Indoor cultural museums, palaces, and temples are recommended.';
      level = 'danger';
      bestCategories = ['Temple & Religious', 'Historical & Cultural'];
    } else if (code >= 71 && code <= 77) {
      // Snow
      score = 55;
      status = 'Cold & Snowy';
      message = 'Chilly and snowy outside. Stay warm and visit indoor historical sites or cozy museums.';
      level = 'warning';
      bestCategories = ['Historical & Cultural'];
    } else if (code >= 95 && code <= 99) {
      // Thunderstorm
      score = 20;
      status = 'Severe Weather';
      message = 'Thunderstorms detected. Avoid outdoor parks, lakes, and high viewpoints. Stay indoors at historical palaces or museum sites.';
      level = 'danger';
      bestCategories = ['Historical & Cultural'];
    }

    if (temp < 10) {
      score = Math.max(score - 15, 30);
      status = 'Chilly Conditions';
      message = 'Cold temperatures. If you go outdoors to parks, dress in layers. Indoor attractions offer a warm escape.';
      level = 'warning';
    }

    return { score, status, message, level, bestCategories };
  }, [weather]);

  if (!recommendation) return null;

  const { score, status, message, level, bestCategories } = recommendation;

  const getLevelColor = () => {
    if (level === 'success') return 'var(--color-accent)';
    if (level === 'warning') return '#eab308'; // Amber
    return '#ef4444'; // Red
  };

  const getLevelIcon = () => {
    if (level === 'success') return <CheckCircle2 size={24} color="var(--color-accent)" />;
    if (level === 'warning') return <AlertTriangle size={24} color="#eab308" />;
    return <ShieldAlert size={24} color="#ef4444" />;
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', height: 'fit-content' }}>
      <div className="flex justify-between items-center">
        <h3 style={{ fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Compass size={20} color="var(--color-accent)" /> Travel Compatibility Index
        </h3>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.6rem', borderRadius: '1rem' }}>
          Smart Advisor
        </span>
      </div>

      <div className="flex items-center gap-4" style={{ margin: '0.5rem 0' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Circular Score Display */}
          <div style={{
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            border: `4px solid ${getLevelColor()}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: '700'
          }}>
            {score}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '1.1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {getLevelIcon()}
            {status}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
            Out of 100 points
          </div>
        </div>
      </div>

      <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.4, color: 'var(--color-text-secondary)' }}>
        {message}
      </p>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>
          RECOMMENDED ACTIVITIES:
        </div>
        <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
          {bestCategories.map(cat => (
            <span key={cat} style={{
              fontSize: '0.75rem',
              background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.2)',
              color: '#a5b4fc',
              padding: '0.25rem 0.6rem',
              borderRadius: '0.5rem',
              fontWeight: 600
            }}>
              {cat}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TravelIndex;
