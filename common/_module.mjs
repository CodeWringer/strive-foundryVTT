import { ArrayUtil } from "./util/array-utility.mjs"
import { ConstantsUtil } from "./util/constants-utility.mjs"
import { PropertyUtil } from "./util/property-utility.mjs"
import { StringUtil } from "./util/string-utility.mjs"
import { UuidUtil } from "./util/uuid-utility.mjs"
import { ValidationUtil } from "./util/validation-utility.mjs"
import { ExtenderUtil } from "./util/extender-util.mjs"
import { LOG_LEVELS } from "./logging/log-levels.mjs"
import { ConsoleLogger } from "./logging/console-logger.mjs"
import { CompareUtility } from "./util/compare-utility.mjs"
import { FormulaUtility } from "./util/formula-utility.mjs"
import ConstantEntry from "./model/constant-entry.mjs"
import { Callbacks } from "./callbacks.mjs"

export const common = {
  util: {
    array: ArrayUtil,
    constants: ConstantsUtil,
    extender: ExtenderUtil,
    property: PropertyUtil,
    string: StringUtil,
    uuid: UuidUtil,
    validation: ValidationUtil,
    compare: CompareUtility,
    formula: FormulaUtility,
  },
  logging: {
    ConsoleLogger: ConsoleLogger,
    LOG_LEVELS: LOG_LEVELS,
  },
  model: {
    ConstantEntry: ConstantEntry,
  },
  Callbacks: Callbacks,
};
