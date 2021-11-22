import DialogResult from '../dto/dialog-result.mjs';
import * as NumberSpinner from '../components/number-spinner.mjs';

/**
 * Shows a dialog to the user and returns a promise with the result of the user interaction. 
 * @param {String} args.dialogTemplate Path to a hbs template. 
 * @param {String} args.localizableTitle A localization String for the dialog title. 
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
                    label: game.i18n.localize("ambersteel.labels.confirm"),
                    callback: () => {
                        mergedDialogData.confirmed = true;
                    }
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: game.i18n.localize("ambersteel.labels.cancel"),
                    callback: () => {}
                }
            },
            default: "cancel",
            render: html => {
                NumberSpinner.activateListeners(html, this, true, true);
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