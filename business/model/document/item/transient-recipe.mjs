import { ExtenderUtil } from "../../../../common/util/extender-util.mjs"
import { Complication, Reference, TimeIncrement } from "../../domain/_module.mjs";
import TransientBaseItem from "./transient-base-item.mjs"

/**
 * @extends TransientBaseItem
 * 
 * @property {TransientBaseActor | undefined} owningDocument Another 
 * document that this document is embedded in. 
 * @property {Array<Tag>} tags An array of the current 
 * tags of this document. 
 * @property {Array<Tag>} acceptedTags Returns an array of accepted 
 * tags. 
 * * Read-only. 
 * * virtual. 
 * * Default `[]`.
 * @property {String} description Html content 
 * @property {String} gmNotes Html content 
 * 
 * @property {Array<Complication>} complications
 * @property {Number} requiredProgress
 * @property {Reference} projectSkill
 * @property {Number} quality
 * @property {TimeIncrement} timeIncrement
 * @property {Reference} product
 */
export default class TransientRecipe extends TransientBaseItem {
  /** @override */
  get defaultImg() { return "icons/svg/book.svg"; }
  
  get complications() {
    return (this.document.system.complications ?? []).map(dto => Complication.fromDto(dto));
  }
  set complications(value) {
    const mapped = value.map(it => it.toDto());
    this.document.system.complications = mapped;
    this.updateByPath("system.complications", mapped);
  }
  
  get requiredProgress() {
    return parseInt(this.document.system.requiredProgress ?? 0);
  }
  set requiredProgress(value) {
    this.document.system.requiredProgress = value;
    this.updateByPath("system.requiredProgress", value);
  }
  
  get projectSkill() {
    return this.document.system.projectSkill.map(dto => Reference.fromDto(dto));
  }
  set projectSkill(value) {
    const mapped = value.toDto();
    this.document.system.projectSkill = mapped;
    this.updateByPath("system.projectSkill", mapped);
  }
  
  get quality() {
    return parseInt(this.document.system.quality ?? 0);
  }
  set quality(value) {
    this.document.system.quality = value;
    this.updateByPath("system.quality", value);
  }
  
  get timeIncrement() {
    return this.document.system.timeIncrement.map(dto => TimeIncrement.fromDto(dto));
  }
  set timeIncrement(value) {
    const mapped = value.toDto();
    this.document.system.timeIncrement = mapped;
    this.updateByPath("system.timeIncrement", mapped);
  }
  
  get product() {
    return this.document.system.product.map(dto => Reference.fromDto(dto));
  }
  set product(value) {
    const mapped = value.toDto();
    this.document.system.product = mapped;
    this.updateByPath("system.product", mapped);
  }
  
  /** @override */
  getExtenders() {
    return super.getExtenders().concat(ExtenderUtil.getExtenders(TransientTrait));
  }
}
