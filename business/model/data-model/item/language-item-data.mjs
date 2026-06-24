import { FoundrySchemaFields } from "../../../../foundry-interop/data-model-wrapper.mjs"
import { LANGUAGE_GRADES } from "../../domain/const/language-grades.mjs"
import BaseItemData from "./base-item-data.mjs"

export default class LanguageItemData extends BaseItemData {
  /** @override */
  static defineSchema() {
    return {
      ...super.defineSchema(),
      grade: new FoundrySchemaFields.StringField({
        nullable: false,
        required: true,
        initial: LANGUAGE_GRADES.dabbling.name,
      }),
      readAndWrite: new FoundrySchemaFields.BooleanField({
        nullable: false,
        required: true,
        initial: false,
      }),
    }
  }
}
