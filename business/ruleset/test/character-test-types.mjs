import { validateOrThrow } from "../../util/validation-utility.mjs";

/**
 * Represents a character test type. 
 * 
 * This is the type of test a character can undergo, to determine 
 * the outcome of an action. 
 * 
 * @property {String} name Internal name. 
 * @property {String} localizableName Localization key. 
 */
export class CharacterTestType {
  constructor(args = {}) {
    validateOrThrow(args, ["name", "localizableName"]);

    this.name = args.name;
    this.localizableName = args.localizableName;
  }
}

/**
 * Represents all defined test types. 
 * 
 * @property {TestType} binary
 * @property {TestType} stepped
 * @property {TestType} graduated
 * @property {TestType} failableGraduated
 * @property {TestType} creative
 * @property {TestType} opposed
 * 
 * @constant
 */
export const CHARACTER_TEST_TYPES = {
  binary: new CharacterTestType({
    name: "binary",
    localizableName: "ambersteel.character.testType.binary.label",
  }),
  stepped: new CharacterTestType({
    name: "stepped",
    localizableName: "ambersteel.character.testType.stepped.label",
  }),
  graduated: new CharacterTestType({
    name: "graduated",
    localizableName: "ambersteel.character.testType.graduated.label",
  }),
  failableGraduated: new CharacterTestType({
    name: "failableGraduated",
    localizableName: "ambersteel.character.testType.failableGraduated.label",
  }),
  creative: new CharacterTestType({
    name: "creative",
    localizableName: "ambersteel.character.testType.creative.label",
  }),
  opposed: new CharacterTestType({
    name: "opposed",
    localizableName: "ambersteel.character.testType.opposed.label",
  }),
}