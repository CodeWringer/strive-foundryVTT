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
import { ChatUtil } from "./util/chat-utility.mjs"

export {
  ArrayUtil,
  ChatUtil,
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
}

export const common = {
  util: {
    array: ArrayUtil,
    chat: ChatUtil,
    constants: ConstantsUtil,
    extender: ExtenderUtil,
    property: PropertyUtil,
    string: StringUtil,
    uuid: UuidUtil,
    validation: ValidationUtil,
  },
  observables: {
    COLLECTION_CHANGE_TYPES: COLLECTION_CHANGE_TYPES,
    ObservableCollection: ObservableCollection,
    ObservableField: ObservableField
  },
  EventEmitter: EventEmitter,
};
