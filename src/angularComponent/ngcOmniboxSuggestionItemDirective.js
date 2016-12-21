import NgcOmniboxSuggestionItemController from './ngcOmniboxSuggestionItemController.js';

export default function ngcOmniboxSuggestionsDirective() {
  return {
    restrict: 'AE',
    require: ['^^ngcOmnibox', '^^ngcOmniboxSuggestions'],
    scope: false,
    controller: NgcOmniboxSuggestionItemController,
    controllerAs: '$ctrl',
    compile(tElement) {
      // Allows us to use document.getElementsByName which is fast AND returns a live-updating
      // HTMLCollection
      tElement.attr('name', 'ngc-omnibox-suggestion-item');
      tElement.attr('role', 'option');

      return {
        pre(scope, iElement, iAttrs, [omnibox]) {
          scope.omnibox = omnibox;
          scope.getIndex = () => omnibox.getSuggestionItemIndex(iElement[0]);
        }
      };
    }
  };
}
