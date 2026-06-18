import { BaseItemSheet } from "../../../sheet/item/base/base-item-sheet.mjs";

/**
 * Global definition of an Item sheet. This is what FoundryVTT instantiates to render 
 * an Item sheet. 
 * 
 * Unfortunately, FoundryVTT only allows registering a single ItemSheet class definition. 
 * This prevents OOP, as it is not possible to register specific ItemSheet derivatives 
 * for each Item document type. To circumvent this limitation and enable OOP after all, 
 * STRIVE introduces so-called sub-types. 
 * 
 * There is one sub-type for each Item document type. ALL of these sub-types MUST be 
 * registered in the static `SUB_TYPES` property! 
 * 
 * @property {viewModel} viewModel
 */
export class LanguageItemSheet extends BaseItemSheet {

}
