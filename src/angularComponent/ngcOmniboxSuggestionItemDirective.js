import {SUGGESTION_ITEM_NAME} from './ngcOmniboxController.js';
import NgcOmniboxSuggestionItemController from './ngcOmniboxSuggestionItemController.js';

export default function ngcOmniboxSuggestionsDirective() {
  return {
    restrict: 'AE',
    require: ['^^ngcOmnibox', '^^ngcOmniboxSuggestions'],
    scope: true,
    controller: NgcOmniboxSuggestionItemController,
    controllerAs: 'suggestionItem',
    compile(tElement) {
      // Allows us to use document.getElementsByName which is fast AND returns a live-updating
      // HTMLCollection
      tElement.attr('name', SUGGESTION_ITEM_NAME);
      tElement.attr('role', 'option');

      return {
        pre(scope, iElement, iAttrs, [omnibox]) {
          scope.omnibox = omnibox;
          scope.suggestionItem.getIndex = () => omnibox.getSuggestionItemIndex(iElement[0]);
        }
      };
    }
  };
}
