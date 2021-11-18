/**
 * Registers events on elements of the given DOM. 
 * @param html {Object} DOM of the sheet for which to register listeners. 
 * @param owner {ActorSheet|ItemSheet} DOM owner object. This should be an actor sheet object or item sheet object.
 * @param isOwner {Boolean} If true, registers events that require owner permission. 
 * @param isEditable {Boolean} If true, registers events that require editing permission. 
 */
export function activateListeners(html, owner, isOwner, isEditable) {
    // -------------------------------------------------------------
    if (!isOwner) return;
    // -------------------------------------------------------------
    if (!isEditable) return;

    // Increment.
    html.find(".button-spinner-up").click(_onClickNumberSpinnerUp.bind(owner));

    // Decrement
    html.find(".button-spinner-down").click(_onClickNumberSpinnerDown.bind(owner));
}

/**
 * Click handler for spinner "up" buttons. 
 * @param event 
 * @private
 */
function _onClickNumberSpinnerUp(event) {
    const dataset = event.currentTarget.dataset;
    const step = dataset.step ? parseInt(dataset.step) : 1;
    const max = dataset.max ? parseInt(dataset.max) : undefined;

    const inputElement = event.currentTarget.closest("span.spinner-container").getElementsByTagName("input")[0];
    const currentValue = parseInt(inputElement.value);

    if (max != undefined && currentValue + step > max) return;

    inputElement.value = currentValue + step;
    inputElement.dispatchEvent(new Event("change"));
};

/**
 * Click handler for spinner "down" buttons. 
 * @param event 
 * @private
 */
function _onClickNumberSpinnerDown(event) {
    const dataset = event.currentTarget.dataset;
    const step = dataset.step ? parseInt(dataset.step) : 1;
    const min = dataset.min ? parseInt(dataset.min) : undefined;

    const inputElement = event.currentTarget.closest("span.spinner-container").getElementsByTagName("input")[0];
    const currentValue = parseInt(inputElement.value);

    if (min != undefined && currentValue - step < min) return;

    inputElement.value = currentValue - step;
    inputElement.dispatchEvent(new Event("change"));
};
