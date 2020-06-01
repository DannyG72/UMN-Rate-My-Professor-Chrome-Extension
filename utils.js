/**
 * Changes a string to title case
 * @param {string} str - the string to change to title case
 */
function toTitleCase(str) {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

/**
 * Pause program execution for a time period
 * @param {number} milliseconds
 * @returns {void}
 */
function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}
