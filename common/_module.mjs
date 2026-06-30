import { ArrayUtil } from "./util/array-utility.mjs"
import { ConstantsUtil } from "./util/constants-utility.mjs"
import { PropertyUtil } from "./util/property-utility.mjs"
import { StringUtil } from "./util/string-utility.mjs"
import { UuidUtil } from "./util/uuid-utility.mjs"
import { ValidationUtil } from "./util/validation-utility.mjs"
import ObservableCollection, { COLLECTION_CHANGE_TYPES } from "./observables/observable-collection.mjs"
import ObservableField from "./observables/observable-field.mjs"
import { EventEmitter } from "./event-emitter.mjs"
import { ExtenderUtil } from "./util/extender-util.mjs"
import { LOG_LEVELS } from "./logging/log-levels.mjs"
import { ConsoleLogger } from "./logging/console-logger.mjs"
import { CompareUtility } from "./util/compare-utility.mjs"

export {
  ArrayUtil,
  COLLECTION_CHANGE_TYPES,
  ConstantsUtil,
  EventEmitter,
  ExtenderUtil,
  ObservableCollection,
  ObservableField,
  PropertyUtil,
  StringUtil,
  UuidUtil,
  ValidationUtil,
  CompareUtility,
  LOG_LEVELS,
  ConsoleLogger,
}

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
  },
  observables: {
    COLLECTION_CHANGE_TYPES: COLLECTION_CHANGE_TYPES,
    ObservableCollection: ObservableCollection,
    ObservableField: ObservableField
  },
  logging: {
    ConsoleLogger: ConsoleLogger,
    LOG_LEVELS: LOG_LEVELS,
  },
  EventEmitter: EventEmitter,
};
