import { FoundrySchemaFields } from "../../../foundry-interop/data-model-wrapper.mjs";
import { INJURY_SHRUG_OFF_STATES } from "../domain/const/injury-shrug-off-states.mjs";

/**
 * Declares an injury shrug-off slot (on a Character). 
 * 
 * @param {FoundrySchemaFields.StringField} state Current state. 
 * Corresponds to one of the enum values of `INJURY_SHRUG_OFF_STATES`
 * @param {FoundrySchemaFields.NumberField} threshold The exact number, that 
 * once reached or undershot, means this shrug-off should be rolled for. 
 * Is more of informative character, but also serves to keep shrug-offs 
 * consistent. They act like a soft ID. 
 * 
 * @extends FoundrySchemaFields.SchemaField
 */
export default class InjuryShrugOffField extends FoundrySchemaFields.SchemaField {
  constructor(fields = {}, { initialValue = null, ...options } = {}) {
    fields = {
      state: new FoundrySchemaFields.StringField({
        required: true,
        nullable: false,
        initial: INJURY_SHRUG_OFF_STATES.indeterminate.name,
      }),
      threshold: new FoundrySchemaFields.NumberField({
        required: true,
        nullable: false,
        initial: 0,
        min: 0,
      }),
      ...fields
    };
    Object.entries(fields).forEach(([k, v]) => !v ? delete fields[k] : null);
    super(fields, options);
  }
}
