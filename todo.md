# Code quality and structure
- Questions.tsx can be refactored away
- Check/enforce consistency in naming, especially in the functions within components
- Make sure everything that needs a type annotation actually has one
- Some things in edit and display view should probably be factored out into their own component.
- Better organization within .css files. Remove any unused styles.
- onUpdate functions could probably be cleaned up a bit. At times updating whole app state when could make smaller
update, at times components have functions with nearly identical names/purposes but different type signatures. More
consistency in approach would probably be better.

# Features
- Highlighting is janky and may need a whole new approach
- Way to clear tests of selected answers without submitting test


# Bugs
- Question nav indicates whether question is answered in edit view
- Question nav back button breaks in display view