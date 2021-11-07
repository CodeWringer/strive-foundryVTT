/**
 * Shows a dialog to the user and returns a promise with the result of the user interaction. 
 * @param {String} args.dialogTemplate Path to a hbs template. 
 * @param {String} args.localizableTitle A localization String for the dialog title. 
 * @param {Object} dialogData An arbitrary data object which represents the context to use when rendering the dialog template. 
 * @returns {Promise<DialogResult>} Resolves, when the dialog is closed. 
 *          The returned object has the properties: 'confirmed' and 'html'. 
 *          The 'html' property allows filtering for values of input fields, for example.
 */
export async function showDialog(args = {
    dialogTemplate: undefined,
    localizableTitle: ""
}, dialogData) {
    const mergedDialogData = {
        confirmed: false,
        CONFIG: CONFIG,
        ...dialogData
    };

    return new Promise(async (resolve, reject) => {
        // Render template. 
        let renderedContent = await renderTemplate(args.dialogTemplate, mergedDialogData);

        let dialog = new Dialog({
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
            render: html => {},
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
 * @property {Boolean} confirmed If true, the user clicked the confirm button. 
 * @property {HTML} html The DOM of the dialog. Useful to filter for input elements and get their values. 
 */
export class DialogResult {
    confirmed = false;
    html = undefined;

    /**
     * @param confirmed {Boolean} confirmed If true, the user clicked the confirm button. 
     * @param html {HTML} html The DOM of the dialog. Useful to filter for input elements and get their values. 
     */
    constructor(confirmed, html) {
        this.confirmed = confirmed;
        this.html = html;
    }
}