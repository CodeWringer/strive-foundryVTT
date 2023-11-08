import ButtonViewModel from '../button/button-viewmodel.mjs';
import { validateOrThrow } from "../../../business/util/validation-utility.mjs";
import DocumentFetcher from "../../../business/document/document-fetcher/document-fetcher.mjs";
import DynamicInputDialog from '../../dialog/dynamic-input-dialog/dynamic-input-dialog.mjs';
import DynamicInputDefinition from '../../dialog/dynamic-input-dialog/dynamic-input-definition.mjs';
import { DYNAMIC_INPUT_TYPES } from '../../dialog/dynamic-input-dialog/dynamic-input-types.mjs';
import ChoiceAdapter from '../input-choice/choice-adapter.mjs';
import ChoiceOption from '../input-choice/choice-option.mjs';

/**
 * A button that allows adding a newly created embedded document to a specific actor. 
 * 
 * @extends ButtonViewModel
 * 
 * @property {Boolean} withDialog If true, will prompt the user to make a selection with a dialog. 
 * @property {String} creationType `"skill" | "skill-ability" | "fate-card" | "item" | "injury" | "illness"`
 * @property {Object} creationData Data to pass to the item creation function. 
 * @property {String | undefined} localizedType Localized name of the type of thing to add. 
 * @property {String | undefined} localizedDialogTitle Localized title of the dialog. 
 * 
 */
export default class ButtonAddViewModel extends ButtonViewModel {
  /**
   * Registers the Handlebars partial for this component. 
   * 
   * @static
   */
  static registerHandlebarsPartial() {
    Handlebars.registerPartial('buttonAdd', `{{> "${super.TEMPLATE}"}}`);
  }

  /**
   * @param {Object} args 
   * @param {String | undefined} args.id Optional. Unique ID of this view model instance. 
   * @param {Boolean | undefined} args.isEditable Optional. If true, will be interactible. 
   * @param {String | undefined} args.localizedToolTip A localized text to 
   * display as a tool tip. 
   * @property {String | undefined} args.localizedText A localized text to 
   * display as a button label. 
   * 
   * @param {TransientDocument} args.target The target object to affect. 
   * @param {String} args.creationType `"skill" | "skill-ability" | "fate-card" | "item" | "injury" | "illness"`
   * @param {Boolean | undefined} args.withDialog Optional. If true, will prompt the user to make a selection with a dialog. 
   * @param {Object | undefined} args.creationData Optional. Data to pass to the item creation function. 
   * @param {String | undefined} args.localizedType Localized name of the type of thing to add. 
   * @param {String | undefined} args.localizedDialogTitle Localized title of the dialog. 
   */
  constructor(args = {}) {
    super({
      ...args,
      iconHtml: '<i class="fas fa-plus"></i>',
      localizedText: args.localizedText,
      localizedToolTip: args.localizedToolTip ?? "ambersteel.general.add",
    });
    validateOrThrow(args, ["target", "creationType"]);

    this.target = args.target;
    this.creationType = args.creationType;
    this.withDialog = args.withDialog ?? false;
    this.creationData = args.creationData ?? Object.create(null);
    this.localizedType = args.localizedType;
    this.localizedDialogTitle = args.localizedDialogTitle;
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * 
   * @override
   * @see {ButtonViewModel.onClick}
   * 
   * @throws {Error} NullPointerException - Thrown, if 'target', 'target.type' or 'creationType' is undefined. 
   * @throws {Error} InvalidArgumentException - Thrown, if trying to add a skill-ability to a non-skill-item. 
   * @throws {Error} InvalidArgumentException - Thrown, if 'creationType' is unrecognized. 
   * 
   * @async
   */
  async onClick() {
    if (this.isEditable !== true) return;

    if (this.target === undefined || this.target.type === undefined) {
      throw new Error("NullPointerException: 'target' or 'target.type' is undefined");
    }
    if (this.creationType === undefined) {
      throw new Error("NullPointerException: 'creationType' is undefined");
    }

    // Special case, because skill abilities aren't items - they're objects contained in an array, 
    // referenced by a property of a skill-item.
    if (this.creationType === "skill-ability") {
      if (this.target.type !== "skill") {
        throw new Error("InvalidArgumentException: Cannot add item of type 'skill-ability' to non-'skill'-type item!");
      }
      const creationData = {
        ...this.creationData,
        isCustom: true
      };
      this.target.createSkillAbility(creationData);
    } else {
      let creationData;

      if (this.withDialog === true) {
        creationData = this._getCreationDataWithDialog();
      } else {
        creationData = {
          name: `New ${this.creationType.capitalize()}`,
          type: this.creationType,
          system: {
            ...this.creationData,
            isCustom: true,
          }
        };
      }

      return await Item.create(creationData, { parent: this.target.document }); // TODO #85: This should probably be extracted to the transient-type object. 
    }
  }

  /**
   * Prompts the user to pick a specific document to add to the target, 
   * via a dialog and returns the creation data of the selected document. 
   * 
   * @returns {Object} The creation data the user implicitly picked. 
   * 
   * @async
   * @private
   */
  async _getCreationDataWithDialog() {
    const documentIndices = new DocumentFetcher().getIndices({
      documentType: "Item",
      contentType: this.creationType,
    });

    const customChoice = new ChoiceOption({
      value: "custom",
      localizedValue: game.i18n.localize("ambersteel.general.custom"),
    });

    const options = [
      customChoice,
    ].concat(documentIndices.map(documentIndex => 
      new ChoiceOption({
        value: documentIndex.id,
        localizedValue: documentIndex.name,
      })
    ));

    const inputChoices = "inputChoices";
    const dialog = await new DynamicInputDialog({
      localizedTitle: this.localizedDialogTitle,
      inputDefinitions: [
        new DynamicInputDefinition({
          type: DYNAMIC_INPUT_TYPES.DROP_DOWN,
          name: inputChoices,
          localizedLabel: this.localizedType,
          required: true,
          defaultValue: options[0],
          specificArgs: {
            options: options,
            adapter: new ChoiceAdapter({
              toChoiceOption: (obj) => options.find(it => it.value === obj.id),
              fromChoiceOption: (choice) => documentIndices.find(it => it.id === choice.value),
            }),
          },
        }),
      ],
    }).renderAndAwait(true);

    if (dialog.confirmed !== true) return;

    const selectedValue = dialog[inputChoices].value;
    let creationData;
    if (selectedValue === customChoice.value) {
      creationData = {
        name: `New ${this.creationType.capitalize()}`,
        type: this.creationType,
        system: {
          ...this.creationData,
          isCustom: true,
        }
      };
    } else {
      const templateItem = await new DocumentFetcher().find({
        id: selectedValue,
      });
      if (templateItem === undefined) {
        throw new Error("Template item could not be found");
      }
      creationData = {
        name: templateItem.name,
        type: templateItem.type,
        system: {
          ...templateItem.system,
          ...this.creationData,
          isCustom: false,
        }
      };
    }

    return creationData;
  }
}
