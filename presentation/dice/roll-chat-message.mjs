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
  const elementsToToggleWithDetails = jElement.find(".toggle-with-details");
  
  buttonDetails.click(async (event) => {
    event.preventDefault(); // Prevents side-effects from event-bubbling. 

    if (detailsSection.hasClass("hidden")) {
      // Expand
      detailsSection.removeClass("hidden");
    } else {
      // Collapse
      detailsSection.addClass("hidden");
    }

    elementsToToggleWithDetails.toggleClass("hidden");
  });
}
