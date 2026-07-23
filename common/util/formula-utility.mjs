import { ArrayUtil } from "./array-utility.mjs";
import { StringUtil } from "./string-utility.mjs";
import { ValidationUtil } from "./validation-utility.mjs";

export const FormulaUtility = {
  /**
   * Evaluates and resolves the given formula.
   * @param {String} str A string containing two numbers with some arithmetic operation, 
   * or just a plain number.
   * 
   * e. g. `"33.11"`
   * 
   * e. g. `"(33.11 - 5) / 2"`
   * @returns {Number} The resulting number.
   */
  eval: (str) => {
    const toEval = (str + "").trim();
    if (StringUtil.matches(toEval, /^-?\d+(\.\d+)?$/)) {
      return parseFloat(toEval);
    } else if (ValidationUtil.isBlankOrUndefined(str)) {
      return NaN;
    }

    /***
     * Ensures "/" and "*" operator precedence. 
     * 
     * @param {String} str
     * @returns {String}
     * 
     * @example
     * Given `"10 - 7 / -22.2 * 2"`, returns `"10 - ((7 / -22.2) * 2)"`
     * 
     * Steps:
     * "10 - 7 / -22.2 * 2"
     * "10 - (7 / -22.2) * 2"
     * "10 - ((7 / -22.2) * 2)"
     * 
     * @example
     * Given `"10 - 7 / (-2 * 2)"`, returns `"10 - (7 / (-2 * 2))"`
     */
    const _getSyntheticFormula = (str) => {
      for (let i = 0; i < str.length; i++) {
        const char = str[i];

        if (char === '(') {
          // Parenthesized expressions will be handled recursively. 

          const start = i;
          const end = StringUtil.findClosing(str, StringUtil.MATCHABLE_CHARS.PARENTHESES, i);
          const substr = str.substring(start + 1, end);
          const syntheticFormula = _getSyntheticFormula(substr);
          const strBuilder = [
            str.substring(0, start),
            `(${syntheticFormula})`,
            str.substring(end + 1)
          ];
          str = strBuilder.join("");
          i = strBuilder[0].length + strBuilder[1].length;
        } else if (char === "/" || char === "*") {
          // Traverse backwards, find the previous operand.
          let indexPrecedingOperandStart;
          for (let j = i - 1; j >= 0; j--) {
            const precedingChar = str[j];

            if (precedingChar === ')') {
              indexPrecedingOperandStart = StringUtil.findOpening(str, StringUtil.MATCHABLE_CHARS.PARENTHESES, j);
              break;
            } else if (StringUtil.matches(precedingChar, /\d|\./)) {
              indexPrecedingOperandStart = j;
            } else if (ValidationUtil.isDefined(indexPrecedingOperandStart)) {
              break;
            }
          }

          if (!ValidationUtil.isDefined(indexPrecedingOperandStart)) {
            // Edge case for malformed formulae.
            indexPrecedingOperandStart = 0;
          }

          // Traverse ahead, find the next operand.
          let indexSucceedingOperandEnd;
          for (let j = i + 1; j < str.length; j++) {
            const succedingChar = str[j];

            if (succedingChar === '(') {
              indexSucceedingOperandEnd = StringUtil.findClosing(str, StringUtil.MATCHABLE_CHARS.PARENTHESES, j);
              break;
            } else if (StringUtil.matches(succedingChar, /\d|\./)) {
              indexSucceedingOperandEnd = j + 1;
            } else if (ValidationUtil.isDefined(indexSucceedingOperandEnd)) {
              break;
            }
          }

          if (!ValidationUtil.isDefined(indexSucceedingOperandEnd)) {
            // Edge case for malformed formulae.
            indexSucceedingOperandEnd = str.length;
          }

          if (indexPrecedingOperandStart !== 0 || indexSucceedingOperandEnd !== str.length) {
            // Insert parentheses.
            str = `${str.substring(0, indexPrecedingOperandStart)}(${str.substring(indexPrecedingOperandStart, indexSucceedingOperandEnd)})${str.substring(indexSucceedingOperandEnd)}`
          }

          // +1 to account for the two characters "(" and ")" that were inserted, 
          // but also keeping in mind that i will also be incremented. 
          i = indexSucceedingOperandEnd + 1;
        }
      }
      return str;
    };

    const syntheticFormula = _getSyntheticFormula(toEval);

    // Able to handle formulae such as:
    // 10 - 7 / -2 * 2 = 17
    // -33.11 - 3 - ((10 - 7 / 2 * 2) / 3) / 2 + 2 * 2 = -32.61
    // (3 * +2 + (7 - (-  1))) / -2 = -7

    // Parse the formula and find all operations (i. e. operands, operators and groups). 
    const operations = FormulaUtility._getOperations(syntheticFormula);

    /**
     * Converts the `operations` into a single, resolvable arithmetic operation object and 
     * returns it.
     * @param {Array<Operation>} operations List of operations (i. e. operands, operators, groups). 
     * @returns {ArithmeticOperation} A resolvable arithmetic operation object. 
     */
    const _getArithmeticOperation = (operations) => {
      let operandA;
      let operandB;
      let operator;
      let i = 0;
      for (; i < operations.length; i++) {
        const operation = operations[i];
        if (operation.isOperator) {
          operator = operation.value;

          if (i == 0) {
            // Special case - the first operation is an operator. 
            // Common case for negative numbers at the beginning of the expression. 
            operandA = 0;
          } else if (operations[i - 1].isGroup) {
            const previousOperand = operations[i - 1].value;
            const previousOperandOperations = FormulaUtility._getOperations(previousOperand.substring(1, previousOperand.length - 1));
            operandA = _getArithmeticOperation(previousOperandOperations);
          } else {
            operandA = parseFloat(operations[i - 1].value);
          }

          break;
        }
      }

      const subOps = ArrayUtil.arrayTake(operations, i + 1);
      if (subOps[0].isGroup) {
        const succedingOperand = subOps[0].value;
        const succceedingOperandOperations = FormulaUtility._getOperations(succedingOperand.substring(1, succedingOperand.length - 1));
        operandB = _getArithmeticOperation(succceedingOperandOperations);
      } else if (subOps.length > 1) {
        operandB = _getArithmeticOperation(subOps);
      } else {
        operandB = parseFloat(subOps[0].value);
      }

      return new ArithmeticOperation({
        operandA: operandA,
        operator: operator,
        operandB: operandB,
      });
    };

    let rootArOp;
    if (operations.length === 1 && operations[0].value.startsWith("(") && operations[0].value.endsWith(")")) {
      // Special case - if the entire string to evaluate is a group operand. 

      const actualOperations = FormulaUtility._getOperations(toEval.substring(1, toEval.length - 1));
      rootArOp = _getArithmeticOperation(actualOperations);
    } else {
      rootArOp = _getArithmeticOperation(operations);
    }

    return rootArOp.resolve();
  },

  /**
   * Finds and returns the end index of a numeric operand that begins at `indexStart`. 
   * @param {String} str 
   * @param {Number} indexStart 
   * @returns {Number}
   * @private
   */
  _findNumberOperandEnd(str, indexStart) {
    for (let j = indexStart; j < str.length; j++) {
      const c = str[j];
      if (StringUtil.matches(c, /[^0-9\.]/)) {
        // Upon reaching any character that is neither a number, nor the dot, 
        // we have found the end of the operand.
        return j;
      }
    }
    return str.length;
  },

  /**
   * Finds and returns the end index of a numeric operand that begins at `indexStart`. 
   * 
   * WARNING may be return `null`, in case the string terminates before the group at 
   * the given `indexStart` does!
   * @param {String} str 
   * @param {Number} indexStart 
   * @returns {Number | null}
   * @private
   */
  _findGroupOperandEnd(str, indexStart) {
    let openedParentheses = 0;
    for (let j = indexStart; j < str.length; j++) {
      const c = str[j];
      if (StringUtil.matches(c, /\(/)) {
        // Reached a nested group.
        openedParentheses++;
      } else if (StringUtil.matches(c, /\)/)) {
        // Reached a group's closing.
        openedParentheses--;
      }

      if (openedParentheses <= 0) {
        return j;
      }
    }
    return null;
  },

  /**
   * 
   * @param {String} str 
   * @returns {Array<Operation>}
   * @private
   */
  _getOperations(str) {
    const operations = [];
    for (let i = 0; i < str.length; i++) {
      const char = str[i];

      if (StringUtil.matches(char, /[+-/*]/)) {
        // Found operator.
        operations.push(new Operation({
          value: char,
          isOperand: false,
          isGroup: false,
          isOperator: true,
        }));
      } else if (StringUtil.matches(char, /[0-9]/)) {
        // Found operand.
        const operandEnd = FormulaUtility._findNumberOperandEnd(str, i);
        operations.push(new Operation({
          value: str.substring(i, operandEnd),
          isOperand: true,
          isGroup: false,
          isOperator: false,
        }));
        i = operandEnd - 1;
      } else if (StringUtil.matches(char, /\(/)) {
        // Found group operand.
        const operandEnd = FormulaUtility._findGroupOperandEnd(str, i);
        operations.push(new Operation({
          value: str.substring(i, operandEnd + 1),
          isOperand: true,
          isGroup: true,
          isOperator: false,
        }));
        i = operandEnd;
      }
    }
    return operations;
  }
};

class Operation {
  /**
   * @param {Object} args 
   * @param {Number} args.value 
   * @param {Boolean | undefined} args.isOperand 
   * @param {Boolean | undefined} args.isGroup 
   * @param {Boolean | undefined} args.isOperator 
   */
  constructor(args = {}) {
    ValidationUtil.validateOrThrow(args, ["value"]);

    this.value = args.value
    this.isOperand = args.isOperand ?? false;
    this.isGroup = args.isGroup ?? false;
    this.isOperator = args.isOperator ?? false;
  }
}

class ArithmeticOperation {
  /**
   * @param {Object} args 
   * @param {Number | ArithmeticOperation | undefined} args.operandA 
   * * default `0`
   * @param {String} args.operator `"+" | "-" | "/" | "*"`
   * @param {Number | ArithmeticOperation} args.operandB 
   */
  constructor(args = {}) {
    ValidationUtil.validateOrThrow(args, ["operator", "operandB"]);

    this.operandA = args.operandA ?? 0;
    this.operator = args.operator;
    this.operandB = args.operandB;
  }

  resolve() {
    const resolvedA = ValidationUtil.isDefined(this.operandA.resolve) ? this.operandA.resolve() : this.operandA;
    const resolvedB = ValidationUtil.isDefined(this.operandB.resolve) ? this.operandB.resolve() : this.operandB;

    if (this.operator === "+") {
      return resolvedA + resolvedB;
    } else if (this.operator === "-") {
      return resolvedA - resolvedB;
    } else if (this.operator === "/") {
      return resolvedA / resolvedB;
    } else if (this.operator === "*") {
      return resolvedA * resolvedB;
    }
  }
}
