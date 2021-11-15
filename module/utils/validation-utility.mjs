/**
 * Returns true, if the given object has properties with the given names and 
 * whose value is not null and not undefined. 
 * @param {Object} obj The object whose properties will be validated. 
 * @param {Array<String>} props An array of properties whose value must not be null or undefined. 
 * @returns {Boolean} True, if the expected properties are not null or undefined. 
 */
export function propertiesDefined(obj, props) {
    for (const prop of props) {
        if (obj[prop] == undefined
        || obj[prop] == null) return false;
    }
    return true;
}

/**
 * Throws an error, if the given object has properties with the given names and 
 * whose value is null or undefined. 
 * @param {Object} obj The object whose properties will be validated. 
 * @param {Array<String>} props An array of properties whose value must not be null or undefined. 
 * @throws An error, if any of the properties fail to validate. 
 */
export function validateOrThrow(obj, props) {
    if (!propertiesDefined(obj, props)) {
        throw `Not all of the required properties are set! ${props}`;
    }
}