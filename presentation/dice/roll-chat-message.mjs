/**
 * Activates listeners for roll chat messages. 
 * 
 * @param {HTMLElement} element A DOM element that represents a roll chat message. 
 */
export function activateRollChatMessageListeners(element) {
  const jElement = $(element);
  const id = jElement.attr("id");

  const buttonDetails = jElement.find(`#${id}-toggle-details`);
  const detailsSection = jElement.find(`#${id}-details`);
  
  buttonDetails.click(async (event) => {
    event.preventDefault(); // Prevents side-effects from event-bubbling. 

    const isHidden = detailsSection.hasClass("hidden");
    if (isHidden === true) {
      // Expand. 
      detailsSection.attr("style", "height: 0%");
      detailsSection.removeClass("hidden");
      // detailsSection.animate({
      //   height: "100%"
      // }, 300, () => {
      // });
    } else {
      // Collapse
      detailsSection.attr("style", "height: 100%");
      // detailsSection.animate({
      //   height: "0%"
      // }, 300, () => {
      //   detailsSection.addClass("hidden");
      // });
      detailsSection.addClass("hidden");
    }
  });
}
