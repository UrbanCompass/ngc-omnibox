import NgcOmniboxSuggestionsController from './ngcOmniboxSuggestionsController.js';

export default function ngcOmniboxSuggestionsDirective() {
  return {
    restrict: 'E',
    require: '^^ngcOmnibox',
    scope: false,
    controller: NgcOmniboxSuggestionsController,
    controllerAs: '$ctrl',
    compile: (tElement) => {
      tElement.attr('role', 'listbox');

      return {
        pre(scope, iElement, iAttrs, omnibox) {
          scope.omnibox = omnibox;
        }
      };
    }
  };
}
