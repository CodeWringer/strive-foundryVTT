import { ConstantsUtil } from "../../util/constants-utility.mjs";
import { ValidationUtil } from "../../util/validation-utility.mjs";

/**
 * Represents a general health condition. 
 * 
 * @property {String} name Internal name. 
 * @property {String | undefined} localizableName Localization key. 
 * @property {String | undefined} localizableToolTip Localizable tool tip text. 
 * @property {String | undefined} icon CSS class of an icon. 
 * * E. g. `"fas fa-virus"`
 * @property {Number} limit A limit on how many times this health condition may be incurred. 
 * * `0` implies there is no limit. 
 * * Minimum is `0`.
 * @property {String | undefined} iconHtml
 * @property {String | undefined} iconTextureUrl (Relative) url to a png or svg file, for 
 * use by PixiJs. 
 */
export class HealthCondition {
  /**
   * @private
   */
  _limit = 0;
  get limit() { return this._limit; }
  set limit(value) {
    this._limit = Math.max(value, 0);
  }

  /**
   * @param {Object} args
   * @param {String} args.name Internal name. 
   * @param {String | undefined} args.localizableName Localization key. 
   * @param {String | undefined} args.localizableToolTip Localizable tool tip text. 
   * @param {Number | undefined} args.limit A limit on how many times this health condition may be incurred. 
   * * `0` implies there is no limit. 
   * * Default `0`.
   * * Negative values are clamped to `0`.
   * @param {String | undefined} args.iconHtml
   * @param {String | undefined} args.iconTextureUrl (Relative) url to a png or svg file, for 
   * use by PixiJs. 
   */
  constructor(args = {}) {
    ValidationUtil.validateOrThrow(args, ["name"]);

    this.name = args.name;
    this.localizableName = args.localizableName;
    this.localizableToolTip = args.localizableToolTip;
    this._limit = args.limit ?? 0;
    this.iconHtml = args.iconHtml;
    this.iconTextureUrl = args.iconTextureUrl;
  }
}

/**
 * Represents the defined general health conditions.
 * 
 * @property {HealthCondition} berserk 
 * @property {HealthCondition} bleeding 
 * @property {HealthCondition} burning 
 * @property {HealthCondition} dissolving 
 * @property {HealthCondition} drugAddicted 
 * @property {HealthCondition} electrified 
 * @property {HealthCondition} exhausted 
 * @property {HealthCondition} frostbitten 
 * @property {HealthCondition} grappled 
 * @property {HealthCondition} hasted 
 * @property {HealthCondition} jealous 
 * @property {HealthCondition} marked
 * @property {HealthCondition} pacified 
 * @property {HealthCondition} poisoned 
 * @property {HealthCondition} prone 
 * @property {HealthCondition} rooted 
 * @property {HealthCondition} stunned
 * @property {HealthCondition} terrified 
 * @property {HealthCondition} unconscious 
 * 
 * @constant
 */
export const HEALTH_CONDITIONS = {
  berserk: new HealthCondition({
    name: "berserk",
    localizableName: "system.character.health.states.berserk.name",
    localizableToolTip: "system.character.health.states.berserk.tooltip",
    limit: 0,
    iconHtml: `<i class="ico dark ico-berserk-solid"></i>`,
    iconTextureUrl: "/systems/strive/presentation/image/berserk-solid.svg",
  }),
  bleeding: new HealthCondition({
    name: "bleeding",
    localizableName: "system.character.health.states.bleeding.name",
    localizableToolTip: "system.character.health.states.bleeding.tooltip",
    limit: 0,
    iconHtml: `<i class="ico dark ico-damage-type-bleeding-solid"></i>`,
    iconTextureUrl: "/systems/strive/presentation/image/damage-type-bleeding-solid.svg",
  }),
  burning: new HealthCondition({
    name: "burning",
    localizableName: "system.character.health.states.burning.name",
    localizableToolTip: "system.character.health.states.burning.tooltip",
    limit: 0,
    iconHtml: `<i class="ico dark ico-damage-type-burning-solid"></i>`,
    iconTextureUrl: "/systems/strive/presentation/image/damage-type-burning-solid.svg",
  }),
  dissolving: new HealthCondition({
    name: "dissolving",
    localizableName: "system.character.health.states.dissolving.name",
    localizableToolTip: "system.character.health.states.dissolving.tooltip",
    limit: 0,
    iconHtml: `<i class="ico dark ico-damage-type-acid-solid"></i>`,
    iconTextureUrl: "/systems/strive/presentation/image/damage-type-acid-solid.svg",
  }),
  drugAddicted: new HealthCondition({
    name: "drugAddicted",
    localizableName: "system.character.health.states.drugAddicted.name",
    localizableToolTip: "system.character.health.states.drugAddicted.tooltip",
    limit: 1,
    iconHtml: `<i class="ico dark ico-medical-supplies-solid"></i>`,
    iconTextureUrl: "/systems/strive/presentation/image/medical-supplies-solid.svg",
  }),
  electrified: new HealthCondition({
    name: "electrified",
    localizableName: "system.character.health.states.electrified.name",
    localizableToolTip: "system.character.health.states.electrified.tooltip",
    limit: 1,
    iconHtml: `<i class="ico dark ico-damage-type-electrical-solid"></i>`,
    iconTextureUrl: "/systems/strive/presentation/image/damage-type-electrical-solid.svg",
  }),
  exhausted: new HealthCondition({
    name: "exhausted",
    localizableName: "system.character.health.states.exhausted.name",
    localizableToolTip: "system.character.health.states.exhausted.tooltip",
    limit: 1,
    iconHtml: `<i class="ico dark ico-exhausted-solid"></i>`,
    iconTextureUrl: "/systems/strive/presentation/image/exhausted-solid.svg",
  }),
  frostbitten: new HealthCondition({
    name: "frostbitten",
    localizableName: "system.character.health.states.frostbitten.name",
    localizableToolTip: "system.character.health.states.frostbitten.tooltip",
    limit: 0,
    iconHtml: `<i class="ico dark ico-damage-type-freezing-solid"></i>`,
    iconTextureUrl: "/systems/strive/presentation/image/damage-type-freezing-solid.svg",
  }),
  grappled: new HealthCondition({
    name: "grappled",
    localizableName: "system.character.health.states.grappled.name",
    localizableToolTip: "system.character.health.states.grappled.tooltip",
    limit: 1,
    iconHtml: `<i class="ico dark ico-chain-links-solid"></i>`,
    iconTextureUrl: "/systems/strive/presentation/image/chain-links-solid.svg",
  }),
  hasted: new HealthCondition({
    name: "hasted",
    localizableName: "system.character.health.states.hasted.name",
    localizableToolTip: "system.character.health.states.hasted.tooltip",
    limit: 1,
    iconHtml: `<i class="ico dark ico-sprint-solid"></i>`,
    iconTextureUrl: "/systems/strive/presentation/image/sprint-solid.svg",
  }),
  jealous: new HealthCondition({
    name: "jealous",
    localizableName: "system.character.health.states.jealous.name",
    localizableToolTip: "system.character.health.states.jealous.tooltip",
    limit: 0,
    iconHtml: `<i class="ico dark ico-jealous-solid"></i>`,
    iconTextureUrl: "/systems/strive/presentation/image/jealous-solid.svg",
  }),
  marked: new HealthCondition({
    name: "marked",
    localizableName: "system.character.health.states.marked.name",
    localizableToolTip: "system.character.health.states.marked.tooltip",
    limit: 1,
    iconHtml: `<i class="ico dark ico-marked-solid"></i>`,
    iconTextureUrl: "/systems/strive/presentation/image/marked-solid.svg",
  }),
  pacified: new HealthCondition({
    name: "pacified",
    localizableName: "system.character.health.states.pacified.name",
    localizableToolTip: "system.character.health.states.pacified.tooltip",
    limit: 0,
    iconHtml: `<i class="ico dark ico-angel-solid"></i>`,
    iconTextureUrl: "/systems/strive/presentation/image/angel-solid.svg",
  }),
  poisoned: new HealthCondition({
    name: "poisoned",
    localizableName: "system.character.health.states.poisoned.name",
    localizableToolTip: "system.character.health.states.poisoned.tooltip",
    limit: 0,
    iconHtml: `<i class="ico dark ico-damage-type-poisoning-solid"></i>`,
    iconTextureUrl: "/systems/strive/presentation/image/damage-type-poisoning-solid.svg",
  }),
  prone: new HealthCondition({
    name: "prone",
    localizableName: "system.character.health.states.prone.name",
    localizableToolTip: "system.character.health.states.prone.tooltip",
    limit: 1,
    iconHtml: `<i class="ico dark ico-prone-solid"></i>`,
    iconTextureUrl: "/systems/strive/presentation/image/prone-solid.svg",
  }),
  rooted: new HealthCondition({
    name: "rooted",
    localizableName: "system.character.health.states.rooted.name",
    localizableToolTip: "system.character.health.states.rooted.tooltip",
    limit: 1,
    iconHtml: `<i class="ico dark ico-rooted-solid"></i>`,
    iconTextureUrl: "/systems/strive/presentation/image/rooted-solid.svg",
  }),
  stunned: new HealthCondition({
    name: "stunned",
    localizableName: "system.character.health.states.stunned.name",
    localizableToolTip: "system.character.health.states.stunned.tooltip",
    limit: 0,
    iconHtml: `<i class="ico dark ico-stunned-solid"></i>`,
    iconTextureUrl: "/systems/strive/presentation/image/stunned-solid.svg",
  }),
  terrified: new HealthCondition({
    name: "terrified",
    localizableName: "system.character.health.states.terrified.name",
    localizableToolTip: "system.character.health.states.terrified.tooltip",
    limit: 0,
    iconHtml: `<i class="ico dark ico-terrified-solid"></i>`,
    iconTextureUrl: "/systems/strive/presentation/image/terrified-solid.svg",
  }),
  unconscious: new HealthCondition({
    name: "unconscious",
    localizableName: "system.character.health.states.unconscious.name",
    localizableToolTip: "system.character.health.states.unconscious.tooltip",
    limit: 1,
    iconHtml: `<i class="ico dark ico-unconscious-solid"></i>`,
    iconTextureUrl: "/systems/strive/presentation/image/unconscious-solid.svg",
  }),
};
ConstantsUtil.enrichConstant(HEALTH_CONDITIONS);
