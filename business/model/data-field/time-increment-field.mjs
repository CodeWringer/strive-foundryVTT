import { FoundrySchemaFields } from "../../../foundry-interop/data-model-wrapper.mjs";
import { TIME_UNITS } from "../const/time-units.mjs";

/**
 * Declares a Time Increment, composed of a number and time unit field. 
 * 
 * @param {Number} value
 * @param {String} unit Must correspond to one of the `name` fields of the 
 * `TIME_UNITS` constants. 
 */
export default class TimeIncrementField extends FoundrySchemaFields.SchemaField {
  constructor(fields = {}, { initialValue = null, ...options } = {}) {
    fields = {
      value: new FoundrySchemaFields.NumberField({
        required: true,
        nullable: false,
        integer: 0,
        initial: 0,
        min: 0,
      }),
      unit: new FoundrySchemaFields.StringField({
        required: true,
        nullable: false,
        initial: TIME_UNITS.none.name,
      }),
      ...fields
    };
    Object.entries(fields).forEach(([k, v]) => !v ? delete fields[k] : null);
    super(fields, options);
  }
}