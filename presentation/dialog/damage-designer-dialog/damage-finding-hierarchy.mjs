import { ValidationUtil } from "../../../business/util/validation-utility.mjs";
import { DamageFinding } from "./damage-finding.mjs";

/**
 * Groups damage findings together. 
 */
export default class DamageFindingHierarchy {
  /**
   * @param {Object} args 
   * @param {String} args.id Corresponds to the ID of a collection, actor or skill. 
   * @param {String} args.name Corresponds to the name of a collection, actor or skill. 
   * @param {Array<DamageFinding> | undefined} args.findings
   * @param {Array<DamageFindingHierarchy> | undefined} args.subHierarchies
   */
  constructor(args = {}) {
    this.id = args.id;
    this.name = args.name;
    this.findings = args.findings ?? [];
    this.subHierarchies = args.subHierarchies ?? [];
  }

  /**
   * 
   * @param {String} id 
   * 
   * @returns {DamageFinding | undefined}
   */
  getFinding(id) {
    return this.findings.find(it => it.id === id);
  }

  /**
   * 
   * @param {String} id 
   * 
   * @returns {Boolean}
   */
  containsFinding(id) {
    return ValidationUtil.isDefined(this.getFinding(id));
  }

  /**
   * Adds the given finding and silently prevents adding the same 
   * finding more than once. 
   * 
   * @param {DamageFinding} finding
   */
  addFinding(finding) {
    if (!this.containsFinding(finding.id)) {
      this.findings.push(finding);
    }
  }
  
  /**
   * 
   * @param {String} id 
   * 
   * @returns {DamageFindingHierarchy | undefined}
   */
  getSubHierarchy(id) {
    return this.subHierarchies.find(it => it.id === id);
  }

  /**
   * 
   * @param {String} id 
   * 
   * @returns {Boolean}
   */
  containsSubHierarchy(id) {
    return ValidationUtil.isDefined(this.getSubHierarchy(id));
  }

  /**
   * Adds the given sub hierarchy and silently prevents adding the same 
   * sub hierarchy more than once. 
   * 
   * @param {DamageFindingHierarchy} subHierarchy
   */
  addSubHierarchy(subHierarchy) {
    if (!this.containsSubHierarchy(subHierarchy.id)) {
      this.subHierarchies.push(subHierarchy);
    }
  }

  /**
   * @param {Function} sortingFunc 
   */
  sort(sortingFunc) {
    this.findings.sort(sortingFunc);
    this.subHierarchies.sort(sortingFunc);
    this.subHierarchies.forEach(subHierarchy => {
      subHierarchy.sort(sortingFunc);
    });
  }
  
  /**
   * 
   * @param {Number} substitute 
   * * Default `0`
   * 
   * @returns {Number}
   */
  getComparableDamage(substitute = 0) {
    let result = 999999999;

    this.findings.forEach(finding => {
      const damage = finding.getComparableDamage(substitute);
      if (damage < result) {
        result = damage;
      }
    });
    this.subHierarchies.forEach(subHierarchy => {
      const damage = subHierarchy.getComparableDamage(substitute);
      if (damage < result) {
        result = damage;
      }
    });

    return result;
  }
}
