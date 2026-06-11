import { useState, useEffect, useCallback } from 'react';
import { parseAndEvaluate } from '../utils/parser';
import { playClickSound } from '../utils/audio';

export interface HistoryItem {
  id: string;
  formula: string;
  result: string;
  timestamp: string;
}

export const useCalculator = () => {
  const [expression, setExpression] = useState<string>('');
  const [liveResult, setLiveResult] = useState<string>('');
  const [isResultCommitted, setIsResultCommitted] = useState<boolean>(false);
  const [angleUnit, setAngleUnit] = useState<'deg' | 'rad'>('deg');
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);
  const [isScientificOpen, setIsScientificOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  
  // Load history from localStorage
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('calculator_history');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('calculator_history', JSON.stringify(history));
  }, [history]);

  // Play click sound helper
  const triggerClick = useCallback(() => {
    if (isSoundEnabled) {
      playClickSound(0.2); // soft click volume
    }
  }, [isSoundEnabled]);

  // Live calculation preview
  useEffect(() => {
    if (!expression.trim()) {
      setLiveResult('');
      return;
    }

    // Try evaluating. If it evaluates successfully (not NaN), show it.
    // Also, if the expression ends with an operator, it is incomplete, so don't evaluate.
    const trimmed = expression.trim();
    const endsWithOp = /[+\-*/^]$/.test(trimmed);
    const endsWithFunc = /[a-z]+\($/.test(trimmed);
    
    if (endsWithOp || endsWithFunc) {
      // Just keep last result or clear live preview
      return;
    }

    const val = parseAndEvaluate(expression, angleUnit);
    if (!isNaN(val) && isFinite(val)) {
      setLiveResult(val.toString());
    } else {
      setLiveResult('');
    }
  }, [expression, angleUnit]);

  const handleDigit = useCallback((digit: string) => {
    triggerClick();
    setExpression((prev) => {
      if (isResultCommitted) {
        setIsResultCommitted(false);
        return digit;
      }
      // Avoid starting a number with multiple zeros
      if (prev === '0' && digit === '0') return '0';
      if (prev === '0') return digit;
      return prev + digit;
    });
  }, [isResultCommitted, triggerClick]);

  const handleDecimal = useCallback(() => {
    triggerClick();
    setExpression((prev) => {
      if (isResultCommitted) {
        setIsResultCommitted(false);
        return '0.';
      }
      
      // Find the last number token in the expression
      const tokens = prev.split(/[\s+\-*/^()]+/);
      const lastToken = tokens[tokens.length - 1];

      // If the last token is a constant, or already has a decimal, don't add
      if (lastToken.includes('.') || lastToken === 'pi' || lastToken === 'e') {
        return prev;
      }

      if (prev === '' || /[\s+\-*/^()]$/.test(prev)) {
        return prev + '0.';
      }

      return prev + '.';
    });
  }, [isResultCommitted, triggerClick]);

  const handleOperator = useCallback((op: string) => {
    triggerClick();
    
    // Normalize operators
    let opString = ` ${op} `;
    if (op === '*') opString = ' × ';
    if (op === '/') opString = ' ÷ ';

    setExpression((prev) => {
      if (isResultCommitted) {
        setIsResultCommitted(false);
        // Start next expression with the last result
        const startVal = prev === 'Error' ? '0' : prev;
        return startVal + opString;
      }

      if (prev === '') {
        if (op === '-') {
          // Allow starting with negative sign
          return '-';
        }
        return '0' + opString;
      }

      // Check if expression already ends with an operator, replace it
      const endsWithOpRegex = /\s*[+\-×÷^]\s*$/;
      if (endsWithOpRegex.test(prev)) {
        // If it was a unary minus alone at the start, don't replace
        if (prev === '-') {
          return prev;
        }
        return prev.replace(endsWithOpRegex, opString);
      }

      return prev + opString;
    });
  }, [isResultCommitted, triggerClick]);

  const handleFunction = useCallback((func: string) => {
    triggerClick();
    setExpression((prev) => {
      const funcStr = `${func}(`;
      if (isResultCommitted || prev === '0' || prev === '') {
        setIsResultCommitted(false);
        return funcStr;
      }
      
      // If the last character is a digit or constant, insert implicit multiplication (handled by parser, but visually append is fine)
      return prev + funcStr;
    });
  }, [isResultCommitted, triggerClick]);

  const handleConstant = useCallback((constant: string) => {
    triggerClick();
    setExpression((prev) => {
      const symbol = constant === 'pi' ? 'π' : 'e';
      if (isResultCommitted || prev === '0' || prev === '') {
        setIsResultCommitted(false);
        return symbol;
      }
      return prev + symbol;
    });
  }, [isResultCommitted, triggerClick]);

  const handleParenthesis = useCallback((paren: string) => {
    triggerClick();
    setExpression((prev) => {
      if (isResultCommitted) {
        setIsResultCommitted(false);
        return paren;
      }
      if (prev === '0' && paren === '(') return '(';
      return prev + paren;
    });
  }, [isResultCommitted, triggerClick]);

  const handleBackspace = useCallback(() => {
    triggerClick();
    setExpression((prev) => {
      if (isResultCommitted) {
        setIsResultCommitted(false);
        return '';
      }

      // If it ends with a space-surrounded operator, delete the operator and spaces (3 chars)
      if (prev.endsWith(' × ') || prev.endsWith(' ÷ ') || prev.endsWith(' + ') || prev.endsWith(' - ') || prev.endsWith(' ^ ')) {
        return prev.slice(0, -3);
      }

      // Delete scientific function names altogether if possible
      const functions = ['asin(', 'acos(', 'atan(', 'sin(', 'cos(', 'tan(', 'log(', 'sqrt(', 'abs(', 'ln('];
      for (const func of functions) {
        if (prev.endsWith(func)) {
          return prev.slice(0, -func.length);
        }
      }

      return prev.slice(0, -1);
    });
  }, [isResultCommitted, triggerClick]);

  const handleClear = useCallback(() => {
    triggerClick();
    setExpression('');
    setLiveResult('');
    setIsResultCommitted(false);
  }, [triggerClick]);

  const handleNegate = useCallback(() => {
    triggerClick();
    setExpression((prev) => {
      if (isResultCommitted) {
        setIsResultCommitted(false);
        if (prev === 'Error' || prev === '0' || prev === '') return '-';
        return prev.startsWith('-') ? prev.slice(1) : '-' + prev;
      }

      if (prev === '') return '-';

      // Find the last number token (including decimal places) or constant (π, e) or closing parenthesis
      // E.g. in "3 + 5" -> "5" -> "-5"
      // E.g. in "3 + (5)" -> "(5)" -> "-(5)"
      // Let's look for the last chunk
      const match = prev.match(/([0-9.]+|π|e|\([^)]+\))$/);
      if (match) {
        const lastChunk = match[0];
        const rest = prev.slice(0, -lastChunk.length);
        
        // If the rest ends with a minus sign that acts as a negation (not a subtract operator, i.e., at start or after another operator)
        const isNegated = rest.endsWith('-');
        if (isNegated) {
          // Check if it's a unary negation or subtract.
          // If the char before minus is an operator/parenthesis, it was unary negation, so remove it.
          const beforeMinus = rest.slice(0, -1).trim();
          const isUnaryMinus = beforeMinus === '' || /[+\-×÷^()]$/.test(beforeMinus);
          if (isUnaryMinus) {
            return beforeMinus + lastChunk;
          }
        }
        
        // Otherwise, insert a unary minus. If rest ends with a space (like "3 + "), append "-" to make "3 + -5".
        // Wait, standard visual shows "3 + -5".
        return rest + '-' + lastChunk;
      }

      // Fallback
      if (prev.endsWith('-')) return prev.slice(0, -1);
      return prev + '-';
    });
  }, [isResultCommitted, triggerClick]);

  const handleEvaluate = useCallback(() => {
    triggerClick();
    if (!expression.trim()) return;

    const val = parseAndEvaluate(expression, angleUnit);
    let resultStr = '';

    if (isNaN(val) || !isFinite(val)) {
      resultStr = 'Error';
    } else {
      resultStr = val.toString();
    }

    // Save to history if valid evaluation and the expression is not already a static result
    if (expression.trim() !== resultStr && resultStr !== 'Error') {
      const newItem: HistoryItem = {
        id: Math.random().toString(36).substring(2, 9),
        formula: expression,
        result: resultStr,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setHistory((prev) => [newItem, ...prev].slice(0, 50)); // limit history to 50 items
    }

    setExpression(resultStr);
    setLiveResult('');
    setIsResultCommitted(true);
  }, [expression, angleUnit, triggerClick]);

  // Load a calculation from history
  const loadHistoryItem = useCallback((item: HistoryItem) => {
    triggerClick();
    setExpression(item.formula);
    setLiveResult(item.result);
    setIsResultCommitted(false);
    setIsHistoryOpen(false);
  }, [triggerClick]);

  // Clear history
  const clearHistory = useCallback(() => {
    triggerClick();
    setHistory([]);
  }, [triggerClick]);

  // Listen to keyboard inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement;
      // If the user is typing in an input (not expected here, but safe practice)
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
        return;
      }

      const key = e.key;

      if (/[0-9]/.test(key)) {
        e.preventDefault();
        handleDigit(key);
      } else if (key === '.') {
        e.preventDefault();
        handleDecimal();
      } else if (key === '+' || key === '-' || key === '*' || key === '/') {
        e.preventDefault();
        handleOperator(key);
      } else if (key === '^') {
        e.preventDefault();
        handleOperator('^');
      } else if (key === '%') {
        e.preventDefault();
        // Append percentage operator
        triggerClick();
        setExpression((prev) => {
          if (isResultCommitted) {
            setIsResultCommitted(false);
            return prev + '%';
          }
          return prev + '%';
        });
      } else if (key === '(' || key === ')') {
        e.preventDefault();
        handleParenthesis(key);
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        handleEvaluate();
      } else if (key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (key === 'Escape') {
        e.preventDefault();
        handleClear();
      } else if (key === '!') {
        e.preventDefault();
        triggerClick();
        setExpression(prev => prev + '!');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    handleDigit,
    handleDecimal,
    handleOperator,
    handleParenthesis,
    handleEvaluate,
    handleBackspace,
    handleClear,
    isResultCommitted,
    triggerClick
  ]);

  return {
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
  };
};
