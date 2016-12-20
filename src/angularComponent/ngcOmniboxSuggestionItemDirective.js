import NgcOmniboxSuggestionItemController from './ngcOmniboxSuggestionItemController.js';

export default function ngcOmniboxSuggestionsDirective() {
  return {
    restrict: 'AE',
    require: '^^ngcOmnibox',
    scope: true,
    controller: NgcOmniboxSuggestionItemController,
    controllerAs: '$ctrl',
    compile: () => {
      return {
        pre(scope, iElement, iAttrs, omnibox) {
          scope.omnibox = omnibox;
        }
      };
    }
  };
}
