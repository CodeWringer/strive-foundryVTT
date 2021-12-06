# Ambersteel System

This is the Ambersteel table-top role-playing game system for FoundryVTT. 

## TODO
* [X] Roll an attribute
  * [X] Auto-increment successes/failures
  * [X] Custom result display
* [X] Roll a skill
  * [X] Auto-increment successes/failures
  * [X] Custom result display
* [X] Auto-level-up attribute
  * [X] Reset requirements
* [X] Auto-level-up skill
  * [X] Reset requirements
  * [X] Auto-move from learning to known
* [X] Skills Item
* [X] Beliefs Tab
* [X] Biography Tab
* [X] Shift-Click on sendToChat-button -> Menu to allow limiting chat message visibility
* [X] GM Notes Tab
* [X] Fate Tab
  * [X] Adding a fate card
    * [ ] Show cost on selection dialog. 
    * [ ] Deduct cost when added. 
  * [X] Removing a fate card
  * [ ] Limit
* [X] Rework skill ability table
* [X] Check if optional arguments work correctly (everywhere)
* [X] Check if every sendToChat call is correct
* [X] Extract button components
* [X] Refactor: Move game-specific logic to game.ambersteel namespace. 
* [X] Update attributes to current ruleset
  * [X] Remove "Magic Sense"
  * [X] Move "Arcana" to "Mental Attributes"
* [X] Health Tab
* [ ] Assets Tab
  * [ ] Item slot system
    * [ ] Automatically fit new items onto the grid. 
    * [ ] Reject items that cannot be fit onto the grid. 
    * [ ] Allow moving and rotating items on the grid. 
    * [ ] Allow removing items from the grid. 
  * [ ] Owned assets (not on person)
    * [ ] As a list
    * [ ] Adding
    * [ ] Removing
    * [ ] Updating
  * [ ] Add the ability to drop/pick up inventory items to/from chat. 
    * [ ] Prompt player on sendToChat, if they want to allow the transfer of their item. 
* [ ] Refactor: Cleanup language file
* [ ] Refactor: Turn skill and attribute tables into custom lists, instead
* [X] Deletion confirmation dialog
* [X] Create list (compendium) of skills
  * [X] Support adding skills from this list
  * [X] Differentiate skills - introduce two types: `preset` and `custom`
    * [X] Preset items cannot be edited
    * [ ] Requires database update
* [X] Create list (compendium) of injuries
  * [X] Support injuries from this list
  * [X] Differentiate injuries - introduce two types: `preset` and `custom`
    * [X] Preset items cannot be edited
    * [ ] Requires database update
* [X] Create list (compendium) of illnesses
  * [X] Support illnesses from this list
  * [X] Differentiate illnesses - introduce two types: `preset` and `custom`
    * [X] Preset items cannot be edited
    * [ ] Requires database update
* [X] Create list (compendium) of fate cards
  * [X] Support adding fate cards from this list
  * [X] Differentiate fate cards - introduce two types: `preset` and `custom`
    * [X] Preset items cannot be edited
    * [ ] Requires database update
* [ ] Send actor to chat. 
* [ ] Send skill to chat. 
* [X] Info button to open an item sheet from an actor sheet. 
* [ ] Create rules compendium/journal for easy in-app lookup of the rules. 
  * [ ] Add context-dependent help buttons which link to specific rule-sections. 
* [ ] Add inline-rolling on sheets.
  * A roll result then automatically replaces the button to roll. 
* [X] Better readability through styling. 
* [ ] Automatically apply/show the penalties of an injury/illness. 
* [ ] Display hint for toughness test required on half of max injuries. 
* [ ] Whether a skill ability list is expanded should no longer be stored on the item.data. 