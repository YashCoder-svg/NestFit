import React, { useEffect, useState } from 'react';

interface AnimatedCounterProps {
  value: number;
  duration?: number; // milliseconds
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 500,
  prefix = '',
  suffix = '',
  className = ''
}) => {
  const [displayValue, setDisplayValue] = useState<number>(value);
  const prevValueRef = React.useRef(value);

  useEffect(() => {
    const startValue = prevValueRef.current;
    prevValueRef.current = value;
    const change = value - startValue;

    if (Math.abs(change) < 0.01) {
      setDisplayValue(value);
      return;
    }

    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.round(startValue + change * easeProgress);

      setDisplayValue(current);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };

    const animId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animId);
  }, [value, duration]);

  return (
    <span className={className}>
      {prefix}
      {displayValue.toLocaleString('en-IN')}
      {suffix}
    </span>
  );
};
