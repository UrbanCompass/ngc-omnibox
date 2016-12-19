import NgcOmniboxSuggestionsController from './ngcOmniboxSuggestionsController.js';

export default function ngcOmniboxSuggestionsDirective() {
  return {
    restrict: 'E',
    require: '^^ngcOmnibox',
    scope: true,
    controller: NgcOmniboxSuggestionsController,
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
