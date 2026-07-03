import { common } from "../../../../common/_module.mjs";

/**
 * Represents a language grade. 
 * 
 * @property {String} name Internal name. 
 * @property {String} localizableName Localization key. 
 * @property {String} icon CSS class of an icon. 
 * * E. g. `"fas fa-virus"`
 * @property {Number} ordinal Numeric order constant. 
 * Usable for sorting. 
 */
export class LanguageGrade {
  /**
   * @param {Object} args 
   * @param {String} args.name 
   * @param {String | undefined} args.localizableName 
   * @param {String | undefined} args.icon 
   * @param {Number} args.ordinal
   */
  constructor(args = {}) {
    common.util.validation.validateOrThrow(args, ["name", "localizableName", "ordinal"])

    this.name = args.name;
    this.localizableName = args.localizableName;
    this.icon = args.icon;
    this.ordinal = args.ordinal;
  }
}

/**
 * Represents the defined injury states.
 * 
 * @property {LanguageGrade} dabbling 
 * @property {LanguageGrade} proficient 
 * @property {LanguageGrade} native 
 * 
 * @constant
 */
export const LANGUAGE_GRADES = {
  dabbling: new LanguageGrade({
    name: "dabbling",
    localizableName: "system.item.language.grade.dabbling",
    icon: "fas fa-bone",
    ordinal: 0,
  }),
  proficient: new LanguageGrade({
    name: "proficient",
    localizableName: "system.item.language.grade.proficient",
    icon: "fas fa-bone",
    ordinal: 1,
  }),
  native: new LanguageGrade({
    name: "native",
    localizableName: "system.item.language.grade.native",
    icon: "fas fa-bone",
    ordinal: 2,
  }),
};
