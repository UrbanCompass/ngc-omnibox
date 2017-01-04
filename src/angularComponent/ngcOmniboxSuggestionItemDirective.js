import NgcOmniboxSuggestionItemController from './ngcOmniboxSuggestionItemController.js';

export default function ngcOmniboxSuggestionItemDirective() {
  return {
    restrict: 'AE',
    require: ['^^ngcOmnibox', '^^ngcOmniboxSuggestions'],
    scope: true,
    bindToController: {
      suggestion: '<'
    },
    controller: NgcOmniboxSuggestionItemController,
    controllerAs: 'suggestionItem',
    compile(tElement) {
      tElement.attr('role', 'option');

      return {
        pre(scope, iElement, iAttrs, [omnibox]) {
          scope.omnibox = omnibox;
        }
      };
    }
  };
}
