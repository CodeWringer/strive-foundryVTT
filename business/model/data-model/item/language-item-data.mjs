import { FoundrySchemaFields, TypeDataModel } from "../../../../foundry-interop/data-model-wrapper.mjs";
import { LANGUAGE_GRADES } from "../../const/language-grades.mjs";

export default class LanguageItemData extends TypeDataModel {
  /** @override */
  static defineSchema() {
    return {
      description: new FoundrySchemaFields.HTMLField({
        blank: true,
        nullable: false,
        initial: "",
      }),
      gmNotes: new FoundrySchemaFields.HTMLField({
        blank: true,
        nullable: false,
        initial: "",
      }),
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
