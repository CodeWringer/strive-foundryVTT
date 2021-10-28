/**
 * Click handler for spinner "up" buttons. 
 * @param event 
 */
export function onClickNumberSpinnerUp(event) {
    let dataset = event.currentTarget.dataset;
    let step = dataset.step ? parseInt(dataset.step) : 1;
    let max = dataset.max ? parseInt(dataset.max) : undefined;
    
    let inputElement = event.currentTarget.closest("span.spinner-container").getElementsByTagName("input")[0];
    let currentValue = parseInt(inputElement.value);

    if (max != undefined && currentValue + step > max) return;

    inputElement.value = currentValue + step;
    inputElement.dispatchEvent(new Event("change"));
};

/**
 * Click handler for spinner "down" buttons. 
 * @param event 
 */
export function onClickNumberSpinnerDown(event) {
    let dataset = event.currentTarget.dataset;
    let step = dataset.step ? parseInt(dataset.step) : 1;
    let min = dataset.min ? parseInt(dataset.min) : undefined;
    
    let inputElement = event.currentTarget.closest("span.spinner-container").getElementsByTagName("input")[0];
    let currentValue = parseInt(inputElement.value);
    
    if (min != undefined && currentValue - step < min) return;

    inputElement.value = currentValue - step;
    inputElement.dispatchEvent(new Event("change"));
};