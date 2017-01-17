import NgcOmniboxController from './ngcOmniboxController.js';

/**
 * Omnibox Component
 *
 * The Omnibox Component is the main container for the Omnibox. It provides the following bindings:
 *
 * - source({query, suggestions}) {Promise}: This function populates the list of suggestions by
 *       returning a Promise that resolves to an Array of suggestions. The individual suggestions
 *       can be of any type, but the list of suggestions must be an array. If you wish to provide
 *       nested suggestions (such as category headers, or a tree structure) then you must provide a
 *       key called `children` which will then be looped through to find more children, or the end
 *       of the list. It receives, in its scope, access to a String called `query` which the current
 *       query in the input field, and an Array called `suggestions`, which is the current list
 *       of suggestions being displayed.
 * - ngModel {Any}: This is a one-way binding to the ngModel for the Omnibox. When the `multiple`
 *       option is set to true, then the ngModel should be an Array. Each item in the Array will be
 *       populated with choices from the objects passed via the source function. If the `multiple`
 *       option is false (default), then the ngModel will be set to the singular chosen suggestion.
 * - ngDisabled() {Boolean}: This function should return a boolean that determines if the
 *       Omnibox component should be disabled.
 * - multiple {Boolean}: Whether to allow multiple choices from the list of suggestions. This option
 *       controls whether the ngModel will be an Array (multiple is on) or a single choice (off).
 * - hideOnBlur {Boolean}: Whether the list of suggestions should automatically hide when the
 *       component itself loses focus. Hitting ESC will always close the list of suggestions.
 * - isSelectable({suggestion}) {Boolean}: A function that should return a Boolean that determines
 *       if a suggestion is able to be interacted with. This function will be called whenever a
 *       suggestion is attempted to be highlighted either by the keyboard or mouse. It receives, in
 *       its scope, access to an object called `suggestion` which is the current sugestion that is
 *       being interacted with. A non-selectable suggestion cannot be clicked on, hovered over, or
 *       interacted with via the keyboard.
 * - canShowSuggestions ({query}) {Boolean}: A function that should return a Boolean that
 *       determines whether or not the list of suggestions can be displayed. It receives, in its
 *       scope, access to a String called `query` which is the current query being searched on.
 */
export default {
  controller: NgcOmniboxController,
  controllerAs: 'omnibox',
  bindings: {
    source: '&',
    ngModel: '=',
    ngDisabled: '&',
    multiple: '<?',
    hideOnBlur: '@',
    isSelectable: '&',
    canShowSuggestions: '&'
  }
};
