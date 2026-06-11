import React from 'react';
import { Delete } from 'lucide-react';

interface KeypadProps {
  onDigit: (digit: string) => void;
  onDecimal: () => void;
  onOperator: (op: string) => void;
  onClear: () => void;
  onBackspace: () => void;
  onNegate: () => void;
  onEvaluate: () => void;
}

export const Keypad: React.FC<KeypadProps> = ({
  onDigit,
  onDecimal,
  onOperator,
  onClear,
  onBackspace,
  onNegate,
  onEvaluate,
}) => {
  return (
    <div className="keypad-grid" aria-label="Standard keypad">
      {/* Row 1 */}
      <button className="calc-key key-fn" onClick={onClear} aria-label="Clear All">
        C
      </button>
      <button className="calc-key key-fn" onClick={onNegate} aria-label="Negate Sign">
        ±
      </button>
      <button className="calc-key key-fn" onClick={() => onOperator('%')} aria-label="Percentage">
        %
      </button>
      <button className="calc-key key-op" onClick={() => onOperator('/')} aria-label="Divide">
        ÷
      </button>

      {/* Row 2 */}
      <button className="calc-key key-digit" onClick={() => onDigit('7')} aria-label="7">
        7
      </button>
      <button className="calc-key key-digit" onClick={() => onDigit('8')} aria-label="8">
        8
      </button>
      <button className="calc-key key-digit" onClick={() => onDigit('9')} aria-label="9">
        9
      </button>
      <button className="calc-key key-op" onClick={() => onOperator('*')} aria-label="Multiply">
        ×
      </button>

      {/* Row 3 */}
      <button className="calc-key key-digit" onClick={() => onDigit('4')} aria-label="4">
        4
      </button>
      <button className="calc-key key-digit" onClick={() => onDigit('5')} aria-label="5">
        5
      </button>
      <button className="calc-key key-digit" onClick={() => onDigit('6')} aria-label="6">
        6
      </button>
      <button className="calc-key key-op" onClick={() => onOperator('-')} aria-label="Subtract">
        -
      </button>

      {/* Row 4 */}
      <button className="calc-key key-digit" onClick={() => onDigit('1')} aria-label="1">
        1
      </button>
      <button className="calc-key key-digit" onClick={() => onDigit('2')} aria-label="2">
        2
      </button>
      <button className="calc-key key-digit" onClick={() => onDigit('3')} aria-label="3">
        3
      </button>
      <button className="calc-key key-op" onClick={() => onOperator('+')} aria-label="Add">
        +
      </button>

      {/* Row 5 */}
      <button className="calc-key key-digit" onClick={() => onDigit('0')} aria-label="0">
        0
      </button>
      <button className="calc-key key-digit" onClick={onDecimal} aria-label="Decimal point">
        .
      </button>
      <button className="calc-key key-fn" onClick={onBackspace} aria-label="Backspace">
        <Delete size={20} />
      </button>
      <button className="calc-key key-equal" onClick={onEvaluate} aria-label="Equals">
        =
      </button>
    </div>
  );
};

export default Keypad;
