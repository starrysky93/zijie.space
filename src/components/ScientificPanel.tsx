import React from 'react';

interface ScientificPanelProps {
  onFunction: (func: string) => void;
  onConstant: (constant: string) => void;
  onOperator: (op: string) => void;
  onParenthesis: (paren: string) => void;
}

export const ScientificPanel: React.FC<ScientificPanelProps> = ({
  onFunction,
  onConstant,
  onOperator,
  onParenthesis,
}) => {
  const keys = [
    { label: 'sin', type: 'func', value: 'sin' },
    { label: 'cos', type: 'func', value: 'cos' },
    { label: 'tan', type: 'func', value: 'tan' },
    
    { label: 'ln', type: 'func', value: 'ln' },
    { label: 'log', type: 'func', value: 'log' },
    { label: '√', type: 'func', value: 'sqrt' },
    
    { label: 'π', type: 'const', value: 'pi' },
    { label: 'e', type: 'const', value: 'e' },
    { label: 'xʸ', type: 'op', value: '^' },
    
    { label: '(', type: 'paren', value: '(' },
    { label: ')', type: 'paren', value: ')' },
    { label: 'x!', type: 'op', value: '!' },
  ];

  return (
    <div className="scientific-panel" aria-label="Scientific functions">
      <div className="scientific-grid">
        {keys.map((key) => (
          <button
            key={key.label}
            className="calc-key key-scientific"
            onClick={() => {
              if (key.type === 'func') onFunction(key.value);
              else if (key.type === 'const') onConstant(key.value);
              else if (key.type === 'op') onOperator(key.value);
              else if (key.type === 'paren') onParenthesis(key.value);
            }}
            aria-label={key.label}
          >
            {key.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ScientificPanel;
