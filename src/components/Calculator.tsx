import React from 'react';
import { History, Volume2, VolumeX } from 'lucide-react';
import { useCalculator } from '../hooks/useCalculator';
import Display from './Display';
import Keypad from './Keypad';
import ScientificPanel from './ScientificPanel';
import HistoryDrawer from './HistoryDrawer';
import ThemeSelector from './ThemeSelector';

type Theme = 'midnight' | 'emerald' | 'sunset' | 'cyberpunk';

interface CalculatorProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export const Calculator: React.FC<CalculatorProps> = ({
  currentTheme,
  onThemeChange,
}) => {
  const {
    expression,
    liveResult,
    history,
    angleUnit,
    isSoundEnabled,
    isScientificOpen,
    isHistoryOpen,
    setAngleUnit,
    setIsSoundEnabled,
    setIsScientificOpen,
    setIsHistoryOpen,
    handleDigit,
    handleDecimal,
    handleOperator,
    handleFunction,
    handleConstant,
    handleParenthesis,
    handleBackspace,
    handleClear,
    handleNegate,
    handleEvaluate,
    loadHistoryItem,
    clearHistory,
  } = useCalculator();

  return (
    <div className={`calculator-card pulse-accent ${isScientificOpen ? 'scientific-layout' : ''}`}>
      {/* Top Toolbar */}
      <div className="calc-header">
        {/* Left Side: Theme Switcher */}
        <ThemeSelector currentTheme={currentTheme} onThemeChange={onThemeChange} />

        {/* Right Side: Toggles */}
        <div className="header-controls">
          {/* Angle Mode Toggle (DEG / RAD) */}
          <button
            className={`icon-btn active-text`}
            onClick={() => setAngleUnit(angleUnit === 'deg' ? 'rad' : 'deg')}
            title={`切換角度單位 (當前: ${angleUnit.toUpperCase()})`}
            aria-label={`Angle unit is ${angleUnit}`}
          >
            {angleUnit === 'deg' ? 'DEG' : 'RAD'}
          </button>

          {/* Sound FX Toggle */}
          <button
            className={`icon-btn ${isSoundEnabled ? 'active' : ''}`}
            onClick={() => setIsSoundEnabled(!isSoundEnabled)}
            title={isSoundEnabled ? '關閉按鍵聲音' : '開啟按鍵聲音'}
            aria-label={isSoundEnabled ? 'Mute click sounds' : 'Unmute click sounds'}
          >
            {isSoundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          {/* Scientific Mode Toggle */}
          <button
            className={`icon-btn active-text ${isScientificOpen ? 'active' : ''}`}
            onClick={() => setIsScientificOpen(!isScientificOpen)}
            title={isScientificOpen ? '切換為簡易模式' : '切換為工程模式'}
            aria-label={isScientificOpen ? 'Disable scientific mode' : 'Enable scientific mode'}
            style={{ fontSize: '0.8rem', fontWeight: 'bold' }}
          >
            F(x)
          </button>

          {/* History Drawer Toggle */}
          <button
            className={`icon-btn ${isHistoryOpen ? 'active' : ''}`}
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            title="開啟計算歷史"
            aria-label="Open history"
          >
            <History size={18} />
          </button>
        </div>
      </div>

      {/* Screen Display */}
      <Display
        expression={expression}
        liveResult={liveResult}
        angleUnit={angleUnit}
      />

      {/* Main Core Body (Scientific Panel + Standard Keypad) */}
      <div className="calculator-body">
        {/* Scientific Panel (Collapsible) */}
        {isScientificOpen && (
          <ScientificPanel
            onFunction={handleFunction}
            onConstant={handleConstant}
            onOperator={handleOperator}
            onParenthesis={handleParenthesis}
          />
        )}

        {/* Basic Keypad */}
        <Keypad
          onDigit={handleDigit}
          onDecimal={handleDecimal}
          onOperator={handleOperator}
          onClear={handleClear}
          onBackspace={handleBackspace}
          onNegate={handleNegate}
          onEvaluate={handleEvaluate}
        />
      </div>

      {/* Sliding History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        history={history}
        onClose={() => setIsHistoryOpen(false)}
        onLoadItem={loadHistoryItem}
        onClearHistory={clearHistory}
      />
    </div>
  );
};

export default Calculator;
