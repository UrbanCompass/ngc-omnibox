# Omnibox [![CircleCI](https://circleci.com/gh/UrbanCompass/ngc-omnibox.svg?style=shield)](https://circleci.com/gh/UrbanCompass/ngc-omnibox) [![codecov](https://codecov.io/gh/UrbanCompass/ngc-omnibox/branch/master/graph/badge.svg)](https://codecov.io/gh/UrbanCompass/ngc-omnibox)

The Omnibox is a lightweight implementation of an autocomplete field and menu that gives the
implementor as much control as possible over the markup and data structure used, and makes as few
UI and style assumptions as possible. It is currently implemented in AngularJS 1.x.

The primary goal of Omnibox is to give app makers as close to full control as possible. This means
that this component is not ready to be used in a project out of the box: it **requires configuration
and styling**. However, this means that it can be the basis for just about any autocomplete
implementation possible given the following assumptions:

1. You need a field in which you type text in to
2. You exepect that field to return a list of suggestions to choose from
3. You can choose one (or more, optionaly) of the suggestions

And that's it. If your autocomplete needs are compatible with those assumptions, you can use
Omnibox.

## Usage

A simple implementation that renders a list of suggestions:

```html
<ngc-omnibox ng-model="myCtrl.model" source="myCtrl.getSuggestions(query)">
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
<ngc-omnibox ng-model="myCtrl.model" source="myCtrl.getSuggestions(query)" multiple="true">

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

For more complicated and realistic use cases, including some that implement CSS, check out the
[examples](examples/).

## Component Architecture

The way to configure the markup for the Omnibox is by use of its subcomponents. The Omnibox library
does not have its own template, so all of the markup that is displayed is completely under your
control. Each subcomponent provides you a slot for custom markup and access to your data.

### Omnibox `<ngc-omnibox>`

This is the main, base-level component. All of the other subcomponents must be
included inside of this element. Since the component does not provide a template of its own, most of
the markup you provide inside (with some slight exceptions) will be maintained. All subcomponents
of the Omnibox have access to the `omnibox` object in their markup, which is a reference to the
top-level `Omnibox Controller`.

### Omnibox Field `<ngc-omnibox-field>` _(Required)_

The Omnibox field controls the position of the input field markup inside the Omnibox component. If
you want to customize the actual input field element, you can add an `<input>` inside this
component. This allows you to change attributes such as `type`, `placeholder`, etc. as well as add
css classes.

### Omnibox Suggestions `<ngc-omnibox-suggestions>` _(Required)_

Omnibox Suggestions is a container for your lists of suggestions to be rendered in. It has
additional subcomponents that allow you to slot in markup for different parts needed for the
suggestions to render. You can include at most one instance of an individual subcomponent. If you
include more than one, an Error will be thrown.

#### Omnibox Suggestions Item `<ngc-omnibox-suggestions-item>` _(Required)_
The Suggestion Item component gives you a slot for markup for a single suggestion. This markup
will be repeated once for each suggestion in your list of suggestions. It has access to a
`suggestion`, which represents a single suggestion in your list of suggestions.

#### Omnibox Suggestions Loading `<ngc-omnibox-suggestions-loading>`
The Suggestion Loading component gives you a slot for markup for when suggestions are loading
asynchronously.

#### Omnibox Suggestions Empty `<ngc-omnibox-suggestions-empty>`
The Suggestion Empty component gives you a slot for markup for when there are no suggestions. The
list of suggestions is considered empty when it is either falsy or an array with no length.

#### Omnibox Suggestions Category `<ngc-omnibox-suggestions-category>`
The Suggestion Category component is a container for markup for when a suggestion has `children`
and needs to loop through them recursively. If the category component is not provided in the markup
then the suggestions will be rendered as a flat list, ignoring any children.

#### Omnibox Suggestions Header `<ngc-omnibox-suggestions-header>`
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
in the `source` &-bound callback binding on the Omnibox that resolves to an array of suggestions.
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
end of the list. In its locals it has access to a string called `query` with the current query in
the input field, and an array called `suggestions`, which is the current list of suggestions being
displayed.
To display a hint to the user in addition to suggestions, resolve the promise with an object that
has keys for `hint` and `suggestions`: `{hint: 'My hint', suggestions: [...]}`. A hint is displayed
to the right of the text that has been input by the user. Pressing RIGHT on the keyboard replaces
the input text query with the hint. The hint should include the entirety of the query, plus whatever
else you want to hint with. When displayed, only the addition to the query is shown as a hint, but
if the user presses RIGHT to complete it, it will use the entirety of the hint provided. For
example, if the query is 'my query' and you want to hinted text to display ' is awesome', then you
should pass 'my query is awesome' as the hint. However, if you want the completed hint to be
formatted as 'My Query is Awesome', you should set that as the hint. When hinted, it will be
displayed as 'my query is Awesome', but when completed via RIGHT on the keyboard, it will replace
the query with the submitted formatting: 'My Query is Awesome'.
- `ngModel {Any}` _(Required)_: This is a one-way binding to the ngModel for the Omnibox. When the
`multiple` option is set to `true`, then the `ngModel` should be an array. Each item in the array
will be populated with choices from the objects passed via the `source` function. If the `multiple`
option is `false` (default), then the `ngModel` will be set to the singular chosen suggestion.
- `ngDisabled() {Boolean}`: This expression should evaluate to a boolean that determines if the
Omnibox component should be disabled.
- `multiple {Boolean}`: Whether to allow multiple choices from the list of suggestions. This option
controls whether the `ngModel` will be an array (multiple is on) or a single choice (off). Note that
if multiple is set to `true`, then `requireMatch` will behave as if it has been set to `true`. If
you need to support a "free-text" suggestion with multiple on, be sure to add it in your source
function as a suggestion.
- `hideOnBlur {Boolean}`: Whether the list of suggestions should automatically hide when the
component itself loses focus. Hitting ESC will always close the list of suggestions.
- `isSelectable({suggestion}) {Boolean}`: An expression that should evaluate to a Boolean that
determines if a suggestion is able to be interacted with. This expression will be executed whenever
a suggestion is attempted to be highlighted either by the keyboard or mouse. In its locals it has
access to an object called `suggestion` which is the current suggestion that is being interacted
with. A non-selectable suggestion cannot be clicked on, hovered over, or interacted with via the
keyboard.
- `canShowSuggestions({query}) {Boolean}`: An expression that should evaluate to a Boolean that
determines whether or not the list of suggestions can be displayed. In its locals it has access to a
string called `query` which is the current query being searched on.
- `requireMatch {Boolean}`: An expression that should evaluate to a Boolean that determines if a
matched suggestion is required for the field (defaults to `false`). This has a few effects on the
behavior of the omnibox:
  - `requireMatch = false`:
    1. Suggestions are not automatically highlighted.
    2. Hitting enter keeps whatever text the user has typed and closes the list of suggestions.
    3. When using the keyboard to highlight suggestions, going to the end and hitting down or the
       beginning and hitting up will highlight nothing.
    4. Hitting ESC when there is a match highlighted will un-highlight it. Hitting ESC again will
       close the list of suggestions.
    5. If multiple is `false`, then the entered becomes the model value when chosen. If multiple is
       `true`, then `requireMatch` is treated as `true`.
  - `requireMatch = true`:
    1. A suggestion is always higlighted (as long as there are some available)
    2. Hitting ENTER or TAB will always choose a suggestion.
    3. When using the keyboard to highlight suggestions, going to the end and hitting down will then
       highlight the first suggestion, and going to the beginning and hitting up will highlight the
       last.
    4. Hitting ESC will close the list of suggestions and clear the field.

## Omnibox Event Bindings

The following &-callback functions are available for binding on the `ngc-omnibox` component in
response to events:

- `onFocus({event})`: An expression that's called when the component gets focus. This includes not
just the input field, but the component in general. This is necessary since selecting the choices
might blur the input field, but not the component itself. If you need to know when just the input
field receives focus, you can use the `target` property of the event object to figure it out.
- `onBlur({event})`: An expression that's called when the component loses focus. This also includes
the entire component, not just the field. This blur event also has logic to reduce the noise that
sometimes happens where it'll lose focus then immediately regain it, so the blur is called only
after a timeout to make sure it doesn't re-receive focus first.
- `onChosen({choice, $event})`: An expression that's called when a suggestion is chosen. In its
locals it has access to `choice`, which is the item that was chosen, and an `$event` object. The
`$event` object has the following properties: `isDefaultPrevented`, `preventDefault()`, and
`performDefault()`. If `isDefaultPrevented` is set to true by calling `preventDefault()` from this
callback function, then the choice is not automatically added to the ngModel. If you then do want
the choice to be added, you can call `performDefault()` to do so.
- `onUnchosen({choice, $event})`: An expression that's called when a suggestion is unchosen (removed as a
choice). In its locals it has access to `choice`, which is the item that was unchosen, and an
`$event` object. The `$event` object has the following properties: `isDefaultPrevented`,
`preventDefault()`, and  `performDefault()`. If `isDefaultPrevented` is set to true by calling
`preventDefault()` from this callback function, then the choice is not automatically removed from
the ngModel. If you then do want the choice to be removed, you can call `performDefault()` to do so.
- `onShowSuggestions({suggestions})`: An expression that's called when the suggestions UI is shown.
In its locals it has access to `suggestions`.
- `onHideSuggestions({suggestions})`: An expression that's called when the suggestions UI is
hidden. In its locals it has access to `suggestions`.

## Omnibox Controller

The Omnibox Controller handles most of the behavior for the Omnibox Component. It provides a set
of functions and properties that can be accessed from subcomponents inside the Omnibox Component
via the `omnibox` object in their locals.

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

- `omnibox.highlightChoice(choice)`: Highlights a choice from the list of choices.
- `omnibox.highlightPreviousChoice()`: Highlights the previous suggestion before the currently
higlighted one. If the first one is highlighted then the field is focused.
- `omnibox.highlightNextChoice()`: Highlights the next suggestion after the currently higlighted
one. If the last one is highlighted then the field is focused.
- `omnibox.highlightFirstChoice()`: Highlights the first choice in the list of choices.
- `omnibox.highlightLastChoice()`: Highlights the last choice in the list of choices.
- `omnibox.highlightNoChoice()`: Un-highlights all choices.
- `omnibox.isChoiceHighlighted()`: Whether the submitted choice is currently highlighted.

## Highlight Match Filter
The `ngcOmniboxHighlightMatch` Angular filter can be used to highlight some text in your suggestion
that matches the query being searched against. It uses a regular expression to search for the exact
query being passed, and wraps that match in HTML. By default the filter will wrap it in a `<strong>`
tag, but you can customize this to be any HTML you like.

_Note that since we're parsing a String as HTML, the filter will throw a warning if you're not using
`ngSanitize` to make your string safe to convert to HTML._

### Usage

#### Basic Example

```html
<ngc-omnibox ng-model="myCtrl.model" source="myCtrl.getSuggestions(query)">
  <ngc-omnibox-field></ngc-omnibox-field>

  <ngc-omnibox-suggestions>
    <ngc-omnibox-suggestion-item ng-bind-html="suggestion.title | ngcOmniboxHighlightMatch:omnibox.query">
    </ngc-omnibox-suggestion-item>
  </ngc-omnibox-suggestions>
</ngc-omnibox>
```

#### Custom Markup

If you wish to customize the markup used to wrap your text, you can do so in the second parameter
passed to the filter. The parameter is a string replacement pattern, which should follow the
replacement rules for JavaScript's `String.prototype.replace()` function. More information can
be [found on MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#Specifying_a_string_as_a_parameter)

```html
<ngc-omnibox ng-model="myCtrl.model" source="myCtrl.getSuggestions(query)">
  <ngc-omnibox-field></ngc-omnibox-field>

  <ngc-omnibox-suggestions>
    <ngc-omnibox-suggestion-item ng-bind-html="suggestion.title | ngcOmniboxHighlightMatch:omnibox.query:'<em class=\'my-highlighted-text\'>$&</em>'">
    </ngc-omnibox-suggestion-item>
  </ngc-omnibox-suggestions>
</ngc-omnibox>
```

