import React, { useState, useRef, useEffect } from 'react';
import SearchBar from './SearchBar';
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  CloudLightning, 
  CloudFog, 
  Compass, 
  MapPin, 
  Navigation, 
  Thermometer, 
  Droplets, 
  Wind, 
  ArrowRight,
  TrendingUp,
  Map
} from 'lucide-react';

// Reusable Tilt Card for 3D Perspective Effects
const TiltCard = ({ children, className, glowClass, style, ...props }) => {
  const cardRef = useRef(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    // Calculate rotation: max 12 degrees
    const rotX = -(y / (rect.height / 2)) * 12;
    const rotY = (x / (rect.width / 2)) * 12;
    
    setRotation({ x: rotX, y: rotY });
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const combinedStyle = {
    transform: isHovered 
      ? `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale3d(1.02, 1.02, 1.02)` 
      : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
    transition: isHovered ? 'none' : 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.3s ease',
    transformStyle: 'preserve-3d',
    ...style
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={combinedStyle}
      className={`glass-panel tilt-card ${glowClass || ''} ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Weather Particle Overlays
const ParticleOverlay = ({ mood }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate particle positions on load or mood change
    const newParticles = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 2}s`,
      duration: `${1 + Math.random() * 2}s`,
      size: `${2 + Math.random() * 4}px`,
      opacity: 0.3 + Math.random() * 0.7
    }));
    setParticles(newParticles);
  }, [mood]);

  if (mood === 'sunny') {
    return (
      <div className="sunrays-container">
        {Array.from({ length: 12 }).map((_, i) => (
          <div 
            key={i} 
            className="sunray" 
            style={{ transform: `rotate(${i * 30}deg)` }}
          />
        ))}
      </div>
    );
  }

  if (mood === 'rainy' || mood === 'stormy') {
    return (
      <div className="rain-overlay">
        {particles.map((p) => (
          <div
            key={p.id}
            className="rain-drop"
            style={{
              left: p.left,
              animationDelay: p.delay,
              animationDuration: p.duration,
              opacity: p.opacity
            }}
          />
        ))}
        {mood === 'stormy' && <div className="lightning-flash trigger-lightning" />}
      </div>
    );
  }

  if (mood === 'snowy') {
    return (
      <div className="snow-overlay">
        {particles.map((p) => (
          <div
            key={p.id}
            className="snow-flake"
            style={{
              left: p.left,
              width: p.size,
              height: p.size,
              animationDelay: p.delay,
              animationDuration: `${2.5 + parseFloat(p.duration)}s`,
              opacity: p.opacity
            }}
          />
        ))}
      </div>
    );
  }

  if (mood === 'foggy') {
    return (
      <>
        <div className="fog-layer fog-1" />
        <div className="fog-layer fog-2" />
      </>
    );
  }

  return null;
};

// Weather data for playground demonstration
const MOOD_DATA = {
  sunny: {
    city: 'Tokyo',
    temp: '28°C',
    condition: 'Clear Sky',
    humidity: '45%',
    wind: '8 km/h',
    uvIndex: 'Very High',
    icon: <Sun size={84} className="floating-element" style={{ color: '#f59e0b', filter: 'drop-shadow(0 0 20px rgba(245,158,11,0.5))' }} />
  },
  rainy: {
    city: 'London',
    temp: '14°C',
    condition: 'Heavy Drizzle',
    humidity: '92%',
    wind: '22 km/h',
    uvIndex: 'Low',
    icon: <CloudRain size={84} className="floating-element" style={{ color: '#3b82f6', filter: 'drop-shadow(0 0 20px rgba(59,130,246,0.5))' }} />
  },
  snowy: {
    city: 'Reykjavik',
    temp: '-2°C',
    condition: 'Light Snowfall',
    humidity: '85%',
    wind: '15 km/h',
    uvIndex: 'None',
    icon: <CloudSnow size={84} className="floating-element" style={{ color: '#f8fafc', filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.5))' }} />
  },
  stormy: {
    city: 'New York',
    temp: '22°C',
    condition: 'Severe Thunderstorm',
    humidity: '88%',
    wind: '35 km/h',
    uvIndex: 'Low',
    icon: <CloudLightning size={84} className="floating-element" style={{ color: '#8b5cf6', filter: 'drop-shadow(0 0 25px rgba(139,92,246,0.6))' }} />
  },
  foggy: {
    city: 'San Francisco',
    temp: '12°C',
    condition: 'Dense Fog',
    humidity: '98%',
    wind: '5 km/h',
    uvIndex: 'Medium',
    icon: <CloudFog size={84} className="floating-element" style={{ color: '#94a3b8', filter: 'drop-shadow(0 0 20px rgba(148,163,184,0.4))' }} />
  }
};

const LandingPage = ({ onSearch, onLocationSearch }) => {
  const [mood, setMood] = useState('sunny');
  const activeData = MOOD_DATA[mood];

  const popularCities = ['Tokyo', 'London', 'New York', 'Paris', 'Hassan'];

  // Apply mood background to index.html container
  useEffect(() => {
    const rootEl = document.querySelector('.landing-wrapper');
    if (rootEl) {
      rootEl.className = `landing-wrapper mood-bg-transition mood-${mood}`;
    }
  }, [mood]);

  return (
    <div className={`landing-wrapper mood-bg-transition mood-${mood}`} style={{ minHeight: '100vh', width: '100%', position: 'relative', overflow: 'hidden' }}>
      
      {/* Background Weather Particles */}
      <ParticleOverlay mood={mood} />

      {/* Main Glass Layout */}
      <div style={{ position: 'relative', zIndex: 2, padding: '2rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Navigation Bar */}
        <header className="flex justify-between items-center" style={{ paddingBottom: '3rem' }}>
          <h2 className="logo-text" style={{ cursor: 'pointer', margin: 0 }}>
            <span>Dynamic</span>Weather
          </h2>
          <div className="glass-panel flex items-center gap-4" style={{ padding: '0.5rem 1.25rem', borderRadius: 'var(--radius-full)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Playground Environment:</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'capitalize', color: 'var(--color-accent)' }}>{mood}</span>
          </div>
        </header>

        {/* Hero Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '3rem',
          alignItems: 'center',
          paddingBottom: '4rem'
        }}>
          
          {/* Hero Left Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ 
              background: 'rgba(255,255,255,0.04)', 
              border: '1px solid rgba(255,255,255,0.08)', 
              borderRadius: '99px', 
              padding: '0.4rem 1rem', 
              alignSelf: 'flex-start',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.8rem',
              fontWeight: 600
            }}>
              <Compass size={14} className="animate-spin" style={{ animationDuration: '6s' }} />
              <span>Experience Weather in 3D</span>
            </div>

            <h1 style={{ fontSize: '3.2rem', lineHeight: '1.1', fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>
              Discover Travel & Weather <span className="logo-text">Better.</span>
            </h1>

            <p style={{ fontSize: '1.1rem', margin: 0, color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
              A high-fidelity travel dashboard. Search a destination to access instant weather alerts, interactive live maps, POI highlights with Wikipedia context, and driving route animations.
            </p>

            {/* Glassmorphic Search Bar Panel */}
            <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(20px)' }}>
              <SearchBar onSearch={onSearch} onLocationSearch={onLocationSearch} />
              
              {/* Quick Jump Badges */}
              <div className="flex gap-2 items-center flex-wrap" style={{ marginTop: '1.25rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Popular:</span>
                {popularCities.map((city) => (
                  <button
                    key={city}
                    onClick={() => onSearch(city)}
                    className="glass-panel"
                    style={{
                      padding: '0.3rem 0.8rem',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      background: 'rgba(255,255,255,0.03)',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'var(--color-accent)';
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(255,255,255,0.03)';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Hero Right: 3D Weather Mood Playground */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', justifyContent: 'center' }}>
            
            {/* The Main 3D Card */}
            <div className="perspective-container">
              <TiltCard 
                className="glow-transition" 
                glowClass={`glow-${mood}`}
                style={{ 
                  padding: '2.5rem', 
                  borderRadius: '2rem',
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '2rem',
                  minHeight: '380px',
                  background: 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(25px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                
                {/* 3D Floating Layer for Card Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', transform: 'translateZ(30px)' }}>
                  <div className="flex flex-col">
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', tracking: '0.1em', fontWeight: 600 }}>Demo Area</span>
                    <h3 style={{ margin: 0, fontSize: '2.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MapPin size={24} color="var(--color-accent)" />
                      {activeData.city}
                    </h3>
                  </div>
                  <div style={{ marginLeft: 'auto' }}>
                    <span style={{ fontSize: '0.9rem', padding: '0.4rem 0.8rem', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', border: '1px solid rgba(255,255,255,0.05)', fontWeight: 600 }}>
                      Live Preview
                    </span>
                  </div>
                </div>

                {/* Main weather visual & temperature */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem', transform: 'translateZ(50px)' }}>
                  <div>
                    <h1 style={{ fontSize: '4.8rem', fontWeight: 800, margin: 0, letterSpacing: '-0.04em', lineHeight: '1' }}>
                      {activeData.temp}
                    </h1>
                    <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 500, color: 'var(--color-text-primary)', marginTop: '0.25rem' }}>
                      {activeData.condition}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {activeData.icon}
                  </div>
                </div>

                {/* Dashboard Metrics (3D depth level 2) */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(3, 1fr)', 
                  gap: '1rem',
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                  paddingTop: '1.5rem',
                  transform: 'translateZ(25px)'
                }}>
                  <div className="flex flex-col items-center">
                    <Thermometer size={18} style={{ color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>UV Index</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{activeData.uvIndex}</span>
                  </div>
                  <div className="flex flex-col items-center" style={{ borderLeft: '1px solid rgba(255,255,255,0.08)', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
                    <Droplets size={18} style={{ color: '#3b82f6', marginBottom: '0.25rem' }} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Humidity</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{activeData.humidity}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Wind size={18} style={{ color: '#10b981', marginBottom: '0.25rem' }} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Wind</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{activeData.wind}</span>
                  </div>
                </div>
              </TiltCard>
            </div>

            {/* Mood selector buttons */}
            <div className="glass-panel flex gap-2 items-center justify-center flex-wrap" style={{ padding: '0.75rem', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.08)' }}>
              {Object.keys(MOOD_DATA).map((moodName) => (
                <button
                  key={moodName}
                  onClick={() => setMood(moodName)}
                  style={{
                    padding: '0.6rem 1.2rem',
                    borderRadius: '1rem',
                    border: 'none',
                    background: mood === moodName ? 'var(--color-accent)' : 'transparent',
                    color: mood === moodName ? '#fff' : 'var(--color-text-secondary)',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (mood !== moodName) {
                      e.target.style.color = 'var(--color-text-primary)';
                      e.target.style.background = 'rgba(255,255,255,0.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (mood !== moodName) {
                      e.target.style.color = 'var(--color-text-secondary)';
                      e.target.style.background = 'transparent';
                    }
                  }}
                >
                  {moodName === 'sunny' && '☀️ Sunny'}
                  {moodName === 'rainy' && '🌧️ Rainy'}
                  {moodName === 'snowy' && '❄️ Snowy'}
                  {moodName === 'stormy' && '⛈️ Stormy'}
                  {moodName === 'foggy' && '🌫️ Foggy'}
                </button>
              ))}
            </div>

          </div>

        </div>

        {/* Feature Grid */}
        <div style={{ paddingTop: '3rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '1.8rem', fontWeight: 700 }}>
            Features Crafted for Travelers
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem'
          }}>
            
            <TiltCard glowClass={`glow-${mood}`} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>
                <Navigation size={24} style={{ margin: 'auto' }} />
              </div>
              <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>3D Route Simulation</h4>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                Calculate spatial routing paths and simulate journeys. Live updates report remaining distances and driving estimates.
              </p>
            </TiltCard>

            <TiltCard glowClass={`glow-${mood}`} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                <MapPin size={24} style={{ margin: 'auto' }} />
              </div>
              <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>Contextual Attraction Finder</h4>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                Discover historical points of interest, restaurants, and parks. Sourced live with descriptions and photos from Wikipedia.
              </p>
            </TiltCard>

            <TiltCard glowClass={`glow-${mood}`} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>
                <TrendingUp size={24} style={{ margin: 'auto' }} />
              </div>
              <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>Interactive Analytics</h4>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                Track humidity levels and hourly temperature shifts inside customizable dashboard charts powered by Recharts.
              </p>
            </TiltCard>

          </div>
        </div>

        {/* Footer */}
        <footer style={{ marginTop: '5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2rem', paddingBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            © {new Date().getFullYear()} DynamicWeather. Powered by Open-Meteo & TomTom.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', cursor: 'pointer' }} onClick={() => setMood('sunny')}>☀️ Sunny</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', cursor: 'pointer' }} onClick={() => setMood('rainy')}>🌧️ Rainy</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', cursor: 'pointer' }} onClick={() => setMood('snowy')}>❄️ Snowy</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', cursor: 'pointer' }} onClick={() => setMood('stormy')}>⛈️ Stormy</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', cursor: 'pointer' }} onClick={() => setMood('foggy')}>🌫️ Foggy</span>
          </div>
        </footer>

      </div>

    </div>
  );
};

export default LandingPage;
