import DialogResult from '../dto/dialog-result.mjs';
import { TEMPLATES } from '../templatePreloader.mjs';
import { getElementValue, setSelectedOptionByValue } from './sheet-utility.mjs';

/**
 * Shows a dialog to the user and returns a promise with the result of the user interaction. 
 * @param {String} args.dialogTemplate Path to a hbs template. 
 * @param {String | undefined} args.localizableTitle A localization String for the dialog title. 
 * @param {Function | undefined} args.render A function to call during render of the dialog. 
 * Receives the DOM of the dialog as its argument. 
 * Can be used for custom rendering logic like hiding certain inputs based on the state of another input. 
 * @param {Boolean | undefined} args.showConfirmButton If true, will display a confirmation button. 
 * * Default `true`. 
 * @param {Boolean | undefined} args.showCancelButton If true, will display a cancellation button. 
 * * Default `true`. 
 * @param {Object} dialogData An arbitrary data object which represents the context to use when rendering the dialog template. 
 * @returns {Promise<DialogResult>} Resolves, when the dialog is closed. 
 *          The returned object has the properties: 'confirmed' and 'html'. 
 *          The 'html' property allows filtering for values of input fields, for example.
 * @async
 */
export async function showDialog(args = {}, dialogData) {
    args = {
        dialogTemplate: undefined,
        localizableTitle: "",
        render: html => {},
        showConfirmButton: true,
        showCancelButton: true,
        ...args
    };
    const mergedDialogData = {
        confirmed: false,
        CONFIG: CONFIG,
        ...dialogData
    };

    return new Promise(async (resolve, reject) => {
        // Render template. 
        const renderedContent = await renderTemplate(args.dialogTemplate, mergedDialogData);

        const dialog = new Dialog({
            title: game.i18n.localize(args.localizableTitle),
            content: renderedContent,
            buttons: {
                confirm: {
                    icon: '<i class="fas fa-check"></i>',
                    label: game.i18n.localize("ambersteel.general.confirm"),
                    callback: () => {
                        mergedDialogData.confirmed = true;
                    }
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: game.i18n.localize("ambersteel.general.cancel"),
                    callback: () => {}
                }
            },
            default: "cancel",
            render: html => {
                // TODO: Activate DOM event listeners using the view model system. 
                args.render(html);
            },
            close: html => {
                resolve(new DialogResult(
                    mergedDialogData.confirmed,
                    html
                ));
            }
        });
        dialog.render(true);
    });
}

/**
 * Shows a confirmation dialog. 
 * @param {Object} args Optional arguments to pass to the rendering function. 
 * @param {String} args.localizableTitle Localization string for the dialog title. 
 * @param {String | undefined} args.content Optional. HTML content to show as the body of the dialog. 
 * @returns {Promise<Boolean>} Resolves, when the dialog is closed. 
 *          Is true, when the dialog was closed with confirmation. 
 * @async
 */
export async function showConfirmationDialog(args = {}) {
    args = {
        localizableTitle: "",
        ...args
    };
    const mergedDialogData = {
        confirmed: false
    };

    return new Promise(async (resolve, reject) => {
        const dialog = new Dialog({
            title: game.i18n.localize(args.localizableTitle),
            content: args.content ?? "",
            buttons: {
                confirm: {
                    icon: '<i class="fas fa-check"></i>',
                    label: game.i18n.localize("ambersteel.general.confirm"),
                    callback: () => {
                        mergedDialogData.confirmed = true;
                    }
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: game.i18n.localize("ambersteel.general.cancel"),
                    callback: () => {}
                }
            },
            default: "cancel",
            render: html => {},
            close: html => {
                resolve({
                    confirmed: mergedDialogData.confirmed,
                });
            }
        });
        dialog.render(true);
    });
}

/**
 * Shows a dialog that contains a paragraph of text. 
 * 
 * Offers a single confirmation button. 
 * @param {Object} args Optional arguments to pass to the rendering function. 
 * @param {String} args.localizableTitle
 * @param {String} args.localizedContent
 * @returns {Promise<void>} Resolves, when the dialog is closed. 
 * @async
 */
export async function showPlainDialog(args = {}) {
    args = {
        localizableTitle: "",
        localizedContent: "",
        ...args
    };

    return new Promise(async (resolve, reject) => {
        // Render template. 
        const renderedContent = await renderTemplate(TEMPLATES.DIALOG_PLAIN, args);

        const dialog = new Dialog({
            title: game.i18n.localize(args.localizableTitle),
            content: renderedContent,
            buttons: {
                ok: {
                    icon: '<i class="fas fa-check"></i>',
                    label: game.i18n.localize("ambersteel.general.ok"),
                    callback: () => {}
                }
            },
            default: "ok",
            render: html => {},
            close: html => {
                resolve();
            }
        });
        dialog.render(true);
    });
}

/**
 * Shows a dialog that contains a paragraph of text. 
 * 
 * Offers a single confirmation button. 
 * @param {Object} args Optional arguments to pass to the rendering function. 
 * @param {String} args.localizableTitle
 * @param {String} args.localizableLabel
 * @param {Array<ChoiceOption>} args.options An array of choices to offer for selection. 
 * @param {Any} args.selected Optional. The value to pre-select when the dialog is rendered. 
 * @returns {Promise<Object>} = {
 * selected: {String} Id of the selected item,
 * confirmed: {Boolean}
 * }
 * @async
 */
export async function showSelectionDialog(args = {}) {
    args = {
        localizableTitle: "ambersteel.general.select",
        localizableLabel: "",
        options: [],
        selected: undefined,
        ...args
    };

    return new Promise(async (resolve, reject) => {
        const dialogResult = await showDialog(
          {
            dialogTemplate: TEMPLATES.DIALOG_SELECT,
            localizableTitle: args.localizableTitle,
            render: html => {
                if (args.selected !== undefined) {
                    const selectElement = html.find("#selection");
                    setSelectedOptionByValue(selectElement, args.selected);
                }
            }
          },
          args
        );
        resolve({
            selected: getElementValue(dialogResult.html.find(".ambersteel-item-select")[0]),
            confirmed: dialogResult.confirmed
        });
    });
}