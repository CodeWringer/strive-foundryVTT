# Ambersteel System

This is the Ambersteel table-top role-playing game system for FoundryVTT. 

See also the companion repository that contains the ruleset: https://github.com/CodeWringer/ambersteel

# View models? Why?
The short answer: Because I wanted to move as much logic out of the templates, as possible. 

THe long answer: Any functions embedded in Handlebars templates are abstracted away in a minified library. Debugging that code wasn't fun, nor effective. Therefore, the actual view-logic had to be moved to my own js files which I could debug much more easily. 

In addition, the view model system allows for inheritance and common functionality to be implemented and used, completely outside of Handlebars templates. This increased maintainability dramatically. 

By keeping view models small and specific, it is also easier to reason about and implement components that could work independently of whatever sheet template they're inserted into. 

## Distinction from view states
View model objects are complex and can contain any amount of view-logic. View model objects can also contain other, complex data. 

For example, the `ItemGridViewViewModel` holds an instance of a `ItemGridView` object. This object is deliberately not persisted in a view state. The reason for this is that the `ItemGridView` internally works with PixiJS and holds instances to PixiJS objects. When the sheet that contains the item grid view is closed, these PixiJS objects are no longer needed and *have* to be properly disposed, to avoid memory leaks. 

In the given example, it *would* be possible to store the `ItemGridView` instance on a view state. The downsides to that would be that the PixiJS objects require setup every time the sheet is re-rendered, anyways and that modern browsers don't like having too many active WebGL instances at once. 

# View state? Why?
The short answer: Because I needed session-persistent view state data. 

The long answer: There are some instances of ui elements whose state needed to be persistent across re-renders of a sheet. 

For example, the skill ability list can be collapsed (hidden) or expanded (visible). By default, it will always be hidden, when embedded on an actor sheet. The user can then click on a button which expands the list, thus making it visible. Then, whenever the user edits any property of a skill ability, that property will be persisted to the data base (= the skill item document is updated). 

Any document update causes a re-render of the current sheet. This holds true for when embedded documents are updated, as well. 

When the sheet is re-rendered, the skill ability list is reverted to its default state, which is collapsed (hidden). This causes a really bad user experience, as multiple changes of a skill ability can only be accomplished by having to re-expand the list, for every subsequent change. 

The solution to the user experience problem is to store the current state of the list and read that state during rendering. So, if the list is currently expanded, it should still be expanded after the next re-render of the sheet. 

The problems aris when wondering about where to store this state. It *could* be stored as derived data of the current document. The problem with that is, that derived data is purged and re-calculated every time the sheet is re-rendered. Alternatively, the state *could* be stored in the document's persisted data. There would be two downsides to this. First, it would pollute business data with view data. Second, this view data would persist across sessions, which is far longer than intended. 

Therefore, a place to store this data outside of the document was needed. This is where the view state system and the global view state collection come into play. By storing the view data globally, but uniquely, for each client, every client only generates as much data as needed and view state could be persisted for the duration of a session. The downside to this approach is that the view state collection is only cleaned up if the user logs out and back into the game. This implies a memory leak. Considering the relatively small size of the data that needs to be persisted, this shouldn't be a problem, but I haven't done any performance tests, yet. If it really is a problem, a solution for that would have to be found. 

## Distinction from view models
View state objects are simple, completely logic-free data objects. They hold raw values that represent a current snapshot of a view's state. 

# Credit
* FontAwesome v5 (Free)
  * https://fontawesome.com/license#license
  * Assets:
    * weight-hanging (altered)
    * trash-solid (altered)
    * external-link-alt-solid (altered)
    * comments-solid (altered)
    * dice-three-solid (altered)
    * hashtag-solid (altered)
    * times-circle-solid (altered)
    * hand-holding-solid (altered)
    * caret-up-solid (altered)