import DocumentFetcher from "../../../business/document/document-fetcher/document-fetcher.mjs";
import { isDefined, validateOrThrow } from "../../../business/util/validation-utility.mjs";
import ViewModel from "../../view-model/view-model.mjs";
import DamageFindingHierarchy from "./damage-finding-hierarchy.mjs";
import DamageFindingListItemViewModel from "./damage-finding-list-item-viewmodel.mjs";

/**
 * @property {Array<DamageFindingListItemViewModel>} findingViewModels
 * @property {Array<DamageHierarchyListItemViewModel>} subHierarchyViewModels
 */
export default class DamageHierarchyListItemViewModel extends ViewModel {
  /** @override */
  static get TEMPLATE() { return game.strive.const.TEMPLATES.DIALOG_DAMAGE_HIERARCHY_LIST_ITEM; }

  get findingTemplate() { return DamageFindingListItemViewModel.TEMPLATE; }

  get hierarchyTemplate() { return DamageHierarchyListItemViewModel.TEMPLATE; }

  /**
   * @param {Object} args 
   * @param {String | undefined} args.id
   * @param {ViewModel | undefined} args.parent
   * @param {DamageFindingHierarchy} args.hierarchy
   */
  constructor(args = {}) {
    super(args);

    validateOrThrow(args, ["hierarchy"]);

    this.hierarchy = args.hierarchy;

    this.findingViewModels = [];
    this.subHierarchyViewModels = [];

    this.hierarchy.findings.forEach(finding => {
      const vm = new DamageFindingListItemViewModel({
        id: `finding-${finding.id}`,
        parent: this,
        damageFinding: finding,
      });
      this[vm.id] = vm;
      this.findingViewModels.push(vm);
    });
    this.hierarchy.subHierarchies.forEach(subHierarchy => {
      const vm = new DamageHierarchyListItemViewModel({
        id: `sub-${subHierarchy.id}`,
        parent: this,
        hierarchy: subHierarchy,
      });
      this[vm.id] = vm;
      this.subHierarchyViewModels.push(vm);
    });
  }

  /** @override */
  async activateListeners(html) {
    await super.activateListeners(html);

    $(`#${this.id}-link`).click(async () => {
      const id = this.hierarchy.id;
      
      let toShow;

      // Check if the linked entity is a collection. 
      toShow = game.packs.get(id);

      if (isDefined(toShow)) {
        // Show the collection. 
        toShow.render(true);
      }

      // Check if the linked entity is a document. 
      toShow = await new DocumentFetcher().find({
        id: id,
      });
  
      if (isDefined(toShow)) {
        toShow.sheet.render(true);
      } else {
        game.strive.logger.logWarn(`Failed to find document '${id}' to open sheet`);
      }
    });
  }

  /**
   * Returns a render of the template with this view model instance as its basis. 
   * 
   * @returns {String}
   */
  async render() {
    return await renderTemplate(DamageHierarchyListItemViewModel.TEMPLATE, {
      viewModel: this,
    });
  }
}
