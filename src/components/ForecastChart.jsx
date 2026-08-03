import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ForecastChart = ({ hourly }) => {
  const chartData = useMemo(() => {
    if (!hourly || !hourly.time) return [];

    // Take the first 24 hours of data
    return hourly.time.slice(0, 24).map((timeStr, index) => {
      const date = new Date(timeStr);
      // Format as "3 PM" or "12 AM"
      const hour = date.getHours();
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = `${hour % 12 || 12} ${ampm}`;

      return {
        time: formattedHour,
        temp: Math.round(hourly.temperature_2m[index]),
        humidity: Math.round(hourly.relative_humidity_2m[index]),
      };
    });
  }, [hourly]);

  if (chartData.length === 0) return null;

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '2rem' }}>
      <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 600 }}>24-Hour Temperature & Humidity Trend</h3>
      <div style={{ width: '100%', height: 260 }}>
        <ResponsiveContainer>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0.0}/>
              </linearGradient>
              <linearGradient id="colorHumidity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
            <XAxis 
              dataKey="time" 
              stroke="rgba(255, 255, 255, 0.4)" 
              tick={{ fontSize: 11 }} 
              interval={2} 
            />
            <YAxis 
              stroke="rgba(255, 255, 255, 0.4)" 
              tick={{ fontSize: 11 }}
            />
            <Tooltip 
              contentStyle={{ 
                background: 'rgba(15, 23, 42, 0.85)', 
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '0.75rem',
                color: 'white'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="temp" 
              name="Temp (°C)"
              stroke="var(--color-accent)" 
              fillOpacity={1} 
              fill="url(#colorTemp)" 
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="humidity" 
              name="Humidity (%)"
              stroke="#0ea5e9" 
              fillOpacity={1} 
              fill="url(#colorHumidity)" 
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ForecastChart;
