// Ancillary functionality to help with various tasks throughout the app.

// -------------------------------------------------------------------------------------------
// Sanitize the user's search input for more consistent searches.
export function sanitizeInput(stringInput) {
    const trimmed = stringInput.trim()
    // Good to remove accidental excess spaces on input and replace with single intended space.
    const excessSpaceRemoved = trimmed.replace(/\s+/g, ' ')
    // Keep dashes since drink and ingredient names can contain them.
    const alphaNumericOnly = excessSpaceRemoved.replace(/[^a-z\d\s\-]/gi,'')
    // Case insensitivity means we can remain agnostic to the whims of the API we're fetching.
    return alphaNumericOnly.toLowerCase()
}