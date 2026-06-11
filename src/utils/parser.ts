// Safe and robust mathematical expression parser/evaluator
// Supports: +, -, *, /, ^, !, sin, cos, tan, log, ln, sqrt, abs, brackets, pi, e

type AngleUnit = 'deg' | 'rad';

// Factorial helper
const factorial = (n: number): number => {
  if (n < 0) return NaN;
  if (n === 0 || n === 1) return 1;
  if (!Number.isInteger(n)) {
    // Gamma function approximation for non-integers (optional, let's keep it simple or integer-only)
    return NaN; 
  }
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
};

// Token types
type TokenType = 'NUMBER' | 'OPERATOR' | 'FUNCTION' | 'LPAREN' | 'RPAREN' | 'COMMA' | 'CONSTANT';

interface Token {
  type: TokenType;
  value: string;
}

// Tokenizer
const tokenize = (expr: string): Token[] => {
  const tokens: Token[] = [];
  let i = 0;

  // Clean expression: normalize symbols
  expr = expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/π/g, 'pi')
    .replace(/\s+/g, '');

  const operators = new Set(['+', '-', '*', '/', '^', '!', '%']);
  const functions = new Set(['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'log', 'ln', 'sqrt', 'abs']);
  const constants = new Set(['pi', 'e']);

  while (i < expr.length) {
    const char = expr[i];

    // Check numbers (including decimals and scientific notation like 1e5)
    if (/[0-9.]/.test(char)) {
      let numStr = '';
      while (i < expr.length && /[0-9.eE]/.test(expr[i])) {
        // Handle scientific notation exponent signs like 1e-5
        if ((expr[i] === 'e' || expr[i] === 'E') && (expr[i + 1] === '-' || expr[i + 1] === '+')) {
          numStr += expr[i] + expr[i + 1];
          i += 2;
        } else {
          numStr += expr[i];
          i++;
        }
      }
      tokens.push({ type: 'NUMBER', value: numStr });
      continue;
    }

    // Check parentheses
    if (char === '(') {
      tokens.push({ type: 'LPAREN', value: '(' });
      i++;
      continue;
    }
    if (char === ')') {
      tokens.push({ type: 'RPAREN', value: ')' });
      i++;
      continue;
    }

    // Check operators
    if (operators.has(char)) {
      tokens.push({ type: 'OPERATOR', value: char });
      i++;
      continue;
    }

    // Check alphabetic characters (functions or constants)
    if (/[a-zA-Z]/.test(char)) {
      let name = '';
      while (i < expr.length && /[a-zA-Z0-9]/.test(expr[i])) {
        name += expr[i];
        i++;
      }
      
      if (functions.has(name)) {
        tokens.push({ type: 'FUNCTION', value: name });
      } else if (constants.has(name)) {
        tokens.push({ type: 'CONSTANT', value: name });
      } else {
        throw new Error(`Unknown identifier: ${name}`);
      }
      continue;
    }

    // If we reach here, there's an invalid character
    throw new Error(`Unexpected character: ${char}`);
  }

  return tokens;
};

// Evaluate using Shunting-yard algorithm
export const parseAndEvaluate = (expression: string, angleUnit: AngleUnit = 'deg'): number => {
  if (!expression.trim()) return 0;

  let tokens: Token[];
  try {
    tokens = tokenize(expression);
  } catch (e) {
    return NaN;
  }

  // Pre-process for unary operators (minus/plus) and implicit multiplication
  // E.g. -5 -> (0-5), 2pi -> 2*pi, 2(3) -> 2*(3)
  const processedTokens: Token[] = [];
  for (let j = 0; j < tokens.length; j++) {
    const current = tokens[j];
    const prev = j > 0 ? tokens[j - 1] : null;

    // Unary minus: if '-' is the first token, or follows an operator, or follows a left parenthesis
    if (current.type === 'OPERATOR' && current.value === '-') {
      const isUnary = !prev || prev.type === 'OPERATOR' || prev.type === 'LPAREN';
      if (isUnary) {
        // Insert a "0" before it
        processedTokens.push({ type: 'NUMBER', value: '0' });
      }
    }

    // Implicit multiplication:
    // Case 1: Number/Constant/RParen followed by Function/Constant/LParen
    // e.g. 2pi -> 2*pi, 2(3) -> 2*(3), pi(4) -> pi*(4), (2)(3) -> (2)*(3)
    if (prev) {
      const isPrevMultiplier = prev.type === 'NUMBER' || prev.type === 'CONSTANT' || prev.type === 'RPAREN';
      const isCurrMultiplicand = current.type === 'FUNCTION' || current.type === 'CONSTANT' || current.type === 'LPAREN';
      
      // Also handle cases like: 2 ! -> 2*! (wait, ! is postfix, so no. But if number follows postfix operator like 5! 2 -> 5! * 2)
      const isPrevPostfix = prev.type === 'OPERATOR' && (prev.value === '!' || prev.value === '%');
      const isMultiplier = isPrevMultiplier || isPrevPostfix;

      if (isMultiplier && isCurrMultiplicand) {
        processedTokens.push({ type: 'OPERATOR', value: '*' });
      }
    }

    processedTokens.push(current);
  }

  // Shunting-yard evaluation
  const outputQueue: number[] = [];
  const operatorStack: Token[] = [];

  const precedence: Record<string, number> = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2,
    '^': 3,
    '!': 4, // High precedence for postfix factorial
    '%': 4, // High precedence for postfix percentage
  };

  const associativity: Record<string, 'L' | 'R'> = {
    '+': 'L',
    '-': 'L',
    '*': 'L',
    '/': 'L',
    '^': 'R',
  };

  const toRadians = (val: number) => angleUnit === 'deg' ? (val * Math.PI) / 180 : val;
  const toDegrees = (val: number) => angleUnit === 'deg' ? (val * 180) / Math.PI : val;

  const applyOperator = (op: string) => {
    if (op === '!') {
      const val = outputQueue.pop();
      if (val === undefined) throw new Error('Stack underflow');
      outputQueue.push(factorial(val));
      return;
    }
    if (op === '%') {
      const val = outputQueue.pop();
      if (val === undefined) throw new Error('Stack underflow');
      outputQueue.push(val / 100);
      return;
    }

    const b = outputQueue.pop();
    const a = outputQueue.pop();

    if (a === undefined || b === undefined) {
      throw new Error('Stack underflow');
    }

    switch (op) {
      case '+': outputQueue.push(a + b); break;
      case '-': outputQueue.push(a - b); break;
      case '*': outputQueue.push(a * b); break;
      case '/': 
        if (b === 0) {
          throw new Error('Division by zero');
        }
        outputQueue.push(a / b); 
        break;
      case '^': outputQueue.push(Math.pow(a, b)); break;
      default: throw new Error(`Unknown operator: ${op}`);
    }
  };

  const applyFunction = (func: string) => {
    const val = outputQueue.pop();
    if (val === undefined) throw new Error('Stack underflow');

    switch (func) {
      case 'sin': outputQueue.push(Math.sin(toRadians(val))); break;
      case 'cos': outputQueue.push(Math.cos(toRadians(val))); break;
      case 'tan': {
        // Handle undefined tangent (e.g. tan 90 deg)
        if (angleUnit === 'deg' && Math.abs(val % 180) === 90) {
          outputQueue.push(NaN);
        } else {
          outputQueue.push(Math.tan(toRadians(val)));
        }
        break;
      }
      case 'asin': outputQueue.push(toDegrees(Math.asin(val))); break;
      case 'acos': outputQueue.push(toDegrees(Math.acos(val))); break;
      case 'atan': outputQueue.push(toDegrees(Math.atan(val))); break;
      case 'log': outputQueue.push(Math.log10(val)); break;
      case 'ln': outputQueue.push(Math.log(val)); break;
      case 'sqrt': outputQueue.push(Math.sqrt(val)); break;
      case 'abs': outputQueue.push(Math.abs(val)); break;
      default: throw new Error(`Unknown function: ${func}`);
    }
  };

  try {
    for (const token of processedTokens) {
      if (token.type === 'NUMBER') {
        outputQueue.push(parseFloat(token.value));
      } else if (token.type === 'CONSTANT') {
        if (token.value === 'pi') {
          outputQueue.push(Math.PI);
        } else if (token.value === 'e') {
          outputQueue.push(Math.E);
        }
      } else if (token.type === 'FUNCTION') {
        operatorStack.push(token);
      } else if (token.type === 'OPERATOR') {
        const op = token.value;

        // Postfix operator: evaluate immediately
        if (op === '!') {
          applyOperator(op);
          continue;
        }

        let top = operatorStack[operatorStack.length - 1];
        while (
          top &&
          (top.type === 'FUNCTION' ||
            (top.type === 'OPERATOR' &&
              (associativity[op] === 'L'
                ? precedence[op] <= precedence[top.value]
                : precedence[op] < precedence[top.value])))
        ) {
          operatorStack.pop();
          if (top.type === 'FUNCTION') {
            applyFunction(top.value);
          } else {
            applyOperator(top.value);
          }
          top = operatorStack[operatorStack.length - 1];
        }
        operatorStack.push(token);
      } else if (token.type === 'LPAREN') {
        operatorStack.push(token);
      } else if (token.type === 'RPAREN') {
        let top = operatorStack.pop();
        while (top && top.type !== 'LPAREN') {
          if (top.type === 'FUNCTION') {
            applyFunction(top.value);
          } else {
            applyOperator(top.value);
          }
          top = operatorStack.pop();
        }
        if (!top) {
          throw new Error('Mismatched parentheses'); // No matching LPAREN
        }
        // If the token at the top of the stack is a function token, pop it onto the output queue.
        const nextTop = operatorStack[operatorStack.length - 1];
        if (nextTop && nextTop.type === 'FUNCTION') {
          operatorStack.pop();
          applyFunction(nextTop.value);
        }
      }
    }

    while (operatorStack.length > 0) {
      const op = operatorStack.pop();
      if (!op || op.type === 'LPAREN' || op.type === 'RPAREN') {
        throw new Error('Mismatched parentheses');
      }
      if (op.type === 'FUNCTION') {
        applyFunction(op.value);
      } else {
        applyOperator(op.value);
      }
    }

    if (outputQueue.length !== 1) {
      throw new Error('Invalid expression evaluation');
    }

    const finalVal = outputQueue[0];
    
    // Clean up JavaScript floating point precision issues (e.g. 0.1 + 0.2 = 0.30000000000000004)
    if (!isNaN(finalVal) && isFinite(finalVal)) {
      // Convert to a reasonable decimal precision, e.g. 10 decimal places, but strip trailing zeros
      return parseFloat(finalVal.toFixed(10));
    }

    return finalVal;
  } catch (error) {
    return NaN;
  }
};
