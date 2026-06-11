import React, { useRef, useEffect } from 'react';

interface DisplayProps {
  expression: string;
  liveResult: string;
  angleUnit: 'deg' | 'rad';
}

export const Display: React.FC<DisplayProps> = ({
  expression,
  liveResult,
  angleUnit,
}) => {
  const formulaEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to right/bottom when expression changes
  useEffect(() => {
    if (formulaEndRef.current) {
      formulaEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  }, [expression]);

  // Clean expression for user reading (e.g. normal operators instead of code ones if we want)
  // Our expression hook already formats * to × and / to ÷, which is perfect!
  const formattedExpression = expression || '0';

  return (
    <div className="display-container" aria-live="polite">
      {/* Angle Unit Indicator */}
      <span className="deg-indicator">
        {angleUnit}
      </span>

      {/* Main Formula / Expression Input */}
      <div className="display-formula" id="calculator-display">
        {formattedExpression}
        <div ref={formulaEndRef} />
      </div>

      {/* Live Result Preview */}
      <div className="display-preview" aria-label="Running calculation result">
        {liveResult ? `≈ ${liveResult}` : ''}
      </div>
    </div>
  );
};

export default Display;
