# Code quality and structure
- Questions.tsx can be refactored away
- Check/enforce consistency in naming, especially in the functions within components
- Make sure everything that needs a type annotation actually has one
- Some things in edit and display view should probably be factored out into their own component.
- Better organization within .css files. Remove any unused styles.
- onUpdate functions could probably be cleaned up a bit. At times updating whole app state when could make smaller
update, at times components have functions with nearly identical names/purposes but different type signatures. More
consistency in approach would probably be better.
- App state in backend shouldn't be stored as raw dict

# Features
- Way to clear tests of selected answers without submitting test
- Are you sure? pop up For delete functionality. 
- In display view, make long answer choices collapsable. 
- "Failed to start session" if session fails to connect


# Bugs
- Highlighting. Selecting the correct can be frustrating, and the eraser tool can behave strangely
- Buttons off-center after starting a session
- Frontend needs mechanism to detect whether connection is down