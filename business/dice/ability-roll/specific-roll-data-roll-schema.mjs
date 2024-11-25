import { ValidationUtil } from "../../util/validation-utility.mjs";
import RollData from "../roll-data.mjs";
import RollQueryData from "../roll-query-data.mjs";
import { RollSchema } from "../roll-schema.mjs";

/**
 * Defines a schema for rolling dice based on the given roll data. 
 * 
 * @extends RollSchema
 */
export class SpecificRollDataRollSchema extends RollSchema {
  /**
   * @param {Object} args 
   * @param {RollData} args.rollData
   */
  constructor(args = {}) {
    super(args);

    ValidationUtil.validateOrThrow(args, ["rollData"]);

    this.rollData = args.rollData;
  }

  /** @override */
  async getRollData(document, rollQueryData) {
    return this.rollData
  }
  
  /** @override */
  async _queryRollData(document, dialog) {
    return new RollQueryData({
      ob: this.rollData._resolveOb(this.rollData.obFormula),
    });
  }
}
