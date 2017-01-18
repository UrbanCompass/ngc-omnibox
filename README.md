# Omnibox [![CircleCI](https://circleci.com/gh/UrbanCompass/ngc-omnibox.svg?style=shield)](https://circleci.com/gh/UrbanCompass/ngc-omnibox) [![codecov](https://codecov.io/gh/UrbanCompass/ngc-omnibox/branch/master/graph/badge.svg)](https://codecov.io/gh/UrbanCompass/ngc-omnibox)

The Omnibox is a lightweight implementation of an autocomplete field and menu that gives the
implementor as much control as possible over the markup and data structure used, and makes as few
UI and style assumptions as possible. It is currently implemented in AngularJS 1.x.

The primary goal of Omnibox is to make as few assumptions about the scenarios in which it will
be used as possible. This means that this component is not ready to be used in a project out of the
box: it **requires configuration and styling**. However, this means that it can be the basis for
just about any autocomplete implementation possible given the following assumptions:

1. You need a field in which you type text in to
2. You exepect that field to return a list of suggestions to choose from
3. You can choose one of the suggestions
4. You can optionally choose more than one suggestion

And that's it. If your autocomplete needs are compatible with those assumptions, you can use
Omnibox.

## Usage

A simple implementation that simply renders a list of suggestions:

```html
<ngc-omnibox ng-model="myCtrl.model" source="myCtrl.sourceFn(query)">
  <ngc-omnibox-field></ngc-omnibox-field>

  <ngc-omnibox-suggestions>
    <ngc-omnibox-suggestion-item>{{suggestion.title}}</ngc-omnibox-suggestion-item>

    <ngc-omnibox-suggestion-loading>Loading...</ngc-omnibox-suggestion-loading>
    <ngc-omnibox-suggestion-empty>No results...</ngc-omnibox-suggestion-empty>
  </ngc-omnibox-suggestions>
</ngc-omnibox>
```

A more complicated implementation that supports multiple choices and suggestions broken down by
category:

```html
<ngc-omnibox ng-model="myCtrl.model" source="myCtrl.sourceFn(query)" multiple="true">

  <ngc-omnibox-choices>
    <span>
      {{choice.title}}
      <button ng-click="omnibox.unchoose(choice)">&times;</button>
    </span>
  </ngc-omnibox-choices>

  <ngc-omnibox-field>
    <input type="text" autofocus="true" placeholder="Enter your search...">
  </ngc-omnibox-field>

  <ngc-omnibox-suggestions>
    <ngc-omnibox-category>
      <ngc-omnibox-suggestion-header>
        Category: {{suggestion.title}}
      </ngc-omnibox-suggestion-header>

      <ngc-omnibox-sugestion-item>
        {{suggestion.title}} - {{suggestion.subtitle}}
      <ngc-omnibox-suggestion-item>
    </ngc-omnibox-category>

    <ngc-omnibox-suggestion-loading>Loading...</ngc-omnibox-suggestion-loading>
    <ngc-omnibox-suggestion-empty>No results...</ngc-omnibox-suggestion-empty>
  </ngc-omnibox-suggestions>

</ngc-omnibox>
```

## Component Architecture

The way to configure the markup for the Omnibox is by use of its sub-components. The Omnibox library
does not have its own template, so all of the markup that is displayed is completely under your
control. Each sub-component provides you a slot for custom markup and access to your data.

### Omnibox `<ngc-omnibox>`

This is the main, base-level component. All of the other sub-components must be
included inside of this element. Since the component does not provide a template of its own, most of
the markup you provide inside (with some slight exceptions) will be maintained. All sub-components
of the Omnibox have access to the `omnibox` object in the scope of their markup, which is a
reference to the top-level `Omnibox Controller`.

### Omnibox Field `<ngc-omnibox-field>` _(Required)_

The Omnibox field controls where inside the Omnibox component you'd like the input field rendered.

### Omnibox Suggestions `<ngc-omnibox-suggestions>` _(Required)_

Omnibox Suggestions is a container for where your list of suggestions will be rendered. It has
additional sub-components that allow you to slot in markup for different parts needed for the
suggestions to render. Please note that this is the only component which **will not respect all of
the markup you provide**. Any markup inside here that is not one of the documented sub-components
will be removed.

#### Omnibox Suggestion Item `<ngc-omnibox-suggestion-item>` _(Required)_
The Suggestion Item component gives you a slot for markup for a single suggestion. This markup
will be repeated once for each suggestion in your list of suggestions. It has access to a
`suggestion`, which represents a single suggestion in your list of suggestions.

#### Omnibox Suggestion Loading `<ngc-omnibox-suggestion-loading>`
The Suggestion Loading component gives you a slot for markup for when suggestions are loading
asynchronously.

#### Omnibox Suggestion Empty `<ngc-omnibox-suggestion-empty>`
The Suggestion Empty component gives you a slot for markup for when there are no suggestions. The
list of suggestions is considered empty when it is either falsy or an array with no length.

#### Omnibox Suggestion Category `<ngc-omnibox-suggestion-category>`
The Suggestion Category component is a container for markup for when a suggestion has `children`
and needs to loop through them recursively. If the category component is not provided in the markup
then the suggestions will be rendered as a flat list, ignoring any children.

#### Omnibox Suggestion Header `<ngc-omnibox-suggestion-header>`
The Suggestion Header is an optional component when using in conjunction with a Suggestion Category.
It provides a slot for markup and access to a `suggestion` that contains the `children`.

### Omnibox Choices `<ngc-omnibox-choices>`

Omnibox Choices controls the markup for rendering multiple choices from the list of suggestions
(think tokens or tags). This component is somewhat unique in that it assumes the first child element
is what you want the markup to be for each choice and will repeat over it. Any siblings of that
first child will be maintained, but placed after the choices.

## Source Function and Data Structure

One of the things that makes Omnibox so flexible is that it has only two assumptions about how your
data is structured:

1. Your list of suggestions must be an array. An array of what is up to you, but it must be an array
2. If you need to render items in a group or recursively in a tree structure, you must provide a
key on your suggestion named `children`, and that must be an array.

Everything else is completely up to you. To populate the list of suggestions, you return a `Promise`
in the `source` &-bound callback binding on the `Omnibox` that resolves to an array of suggestions.
The Omnibox will render whatever is in that array. All filtering, data manipulation, slicing, and
dicing _must be done before resolving this promise_. The Omnibox component provides no search
algorithm of it's own: it expects the suggestions it receives to already be sorted and formatted
correctly.

When your markup receives a `suggestion` or a `choice`, it is simply a reference to either one of
the items in the top-level array, or one of the items in the children array. No other modifications
are made to your data.

## Omnibox Binding Options

The following bindings are available on the main `<ngc-omnibox>` component:

- `source({query, suggestions}) {Promise}` _(Required)_: An expression that populates the list of
suggestions by returning a `Promise` that resolves to an array of suggestions. The individual
suggestions can be of any type, but the list of suggestions must be an array. If you wish to provide
nested suggestions (such as category headers, or a tree structure) then you must provide a key
called `children` on your suggestion which will then be looped through to find more children, or the
end of the list. It receives, in its scope, access to a string called `query` with the current
query in the input field, and an array called `suggestions`, which is the current list of
suggestions being displayed.
- `ngModel {Any}` _(Required)_: This is a one-way binding to the ngModel for the Omnibox. When the
`multiple` option is set to `true`, then the `ngModel` should be an array. Each item in the array
will be populated with choices from the objects passed via the `source` function. If the `multiple`
option is `false` (default), then the `ngModel` will be set to the singular chosen suggestion.
- `ngDisabled() {Boolean}`: This expression should evaluate to a boolean that determines if the
Omnibox component should be disabled.
- `multiple {Boolean}`: Whether to allow multiple choices from the list of suggestions. This option
controls whether the `ngModel` will be an array (multiple is on) or a single choice (off).
- `hideOnBlur {Boolean}`: Whether the list of suggestions should automatically hide when the
component itself loses focus. Hitting ESC will always close the list of suggestions.
- `isSelectable({suggestion}) {Boolean}`: An expression that should evaluate to a Boolean that
determines if a suggestion is able to be interacted with. This expression will be executed whenever
a suggestion is attempted to be highlighted either by the keyboard or mouse. It receives, in its
scope, access to an object called `suggestion` which is the current suggestion that is being
interacted with. A non-selectable suggestion cannot be clicked on, hovered over, or interacted with
via the keyboard.
- `canShowSuggestions({query}) {Boolean}`: An expression that should evaluate to a Boolean that
determines whether or not the list of suggestions can be displayed. It receives, in its scope,
access to a string called `query` which is the current query being searched on.

## Omnibox Controller

The Omnibox Controller handles most of the behavior for the Omnibox Component. It provides a set
of functions and properties that can be accessed from anywhere inside the Omnibox Component markup
via the `omnibox` object on the scope.

**Any options not documented here should be considered private.** Accessing or using undocumented
methods could break at any time, and changes to those methods or properties will not be considered
when semantic versioning. Please refrain from using them.

### Available Properties

- `omnibox.fieldElement {HTML Element}`: A reference to the DOM node of the input field
- `omnibox.suggestions {Array}` _readonly_: A reference to the array of suggestions. This value
should never be updated or modified directly. To update the list of suggestions, use the `source`
function.
- `omnibox.hasSuggestions {Boolean}`: Whether the Omnibox has any suggestions loaded.
- `omnibox.hasChoices {Boolean}`: Whether the Omnibox has any suggestions chosen. This is only
available when `multiple` is set to `true`.
- `omnibox.isLoading {Boolean}`: Whether the Omnibox is waiting for the `source` function to resolve
its `Promise` and load the suggestions.
- `omnibox.ngModel {Any}`: Reference to the current choice or choices for the Omnibox.

### Available Methods

### General

- `omnibox.focus()`: Focuses the input field.
- `omnibox.blur()`: Blurs the input field.

#### Suggestions

- `omnibox.choose(suggestion, shouldFocusField)`: Chooses a suggestion item and adds it to the list
of choices. If `multiple` is off, then only one choice can be chosen at a time, and the choice
becomes the `ngModel`. `shouldFocusField` defaults to `true`, but if set to `false`, then the input
field isn't automatically re-focused after choosing a suggestion.
- `omnibox.unchoose(suggestion, shouldFocusField)`: Removes a suggestion item from the list of
choices. If `multiple` is off, then the `ngModel` is cleared. `shouldFocusField` defaults to `true`,
but if set to `false`, then the input field isn't automatically re-focused after unchoosing a
suggestion.
- `omnibox.shouldShowSuggestions()`: Whether or not the suggestions menu should be visible.
- `omnibox.highlightSuggestion(suggestion)`: Highlights a particular suggestion item in the list of
suggestions. If the suggestion is not visible on screen, it will be scrolled into view.
- `omnibox.highlightPreviousSuggestion(startIndex)`: Highlights the previous suggestion before the
current one. If no suggestion is highlighted, then the last suggestion is highlighted. If the first
suggestion was highilighted, then it highlights the last suggestion. You can optionally pass a
startIndex override what the current suggestion should be.
- `omnibox.highlightNextSuggestion(startIndex)`: Highlights the next suggestion after the
current one. If no suggestion is highlighted, then the first suggestion is highlighted. If the last
suggestion was highilighted, then it highlights the first suggestion. You can optionally pass a
startIndex override what the current suggestion should be.
- `omnibox.highlightNone()`: Un-highlights any highlighted suggestion.
- `omnibox.isHighlighted(suggestion)`: Whether the provided suggestion is currently highlighted.

#### Choices (only work when `multiple` is set to `true`)

- `omnibox.highlightChoice(choice)`: Highlights the submitted choice.
- `omnibox.highlightPreviousChoice()`: Highlights the previous suggestion before the currently
higlighted one. If the first one is highlighted then the field is focused.
- `omnibox.highlightNextChoice()`: Highlights the next suggestion after the currently higlighted
one. If the last one is highlighted then the field is focused.
- `omnibox.highlightFirstChoice()`: Highlights the first choice in the list of choices.
- `omnibox.highlightLastChoice()`: Highlights the last choice in the list of choices.
- `omnibox.highlightNoChoice()`: Un-highlights all choices.
- `omnibox.isChoiceHighlighted()`: Whether the submitted choice is currently highlighted.
