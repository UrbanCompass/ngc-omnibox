import NgcOmniboxSuggestionsController from './ngcOmniboxSuggestionsController.js';

ngcOmniboxSuggestionsDirective.$inject = ['modifySuggestionsTemplate'];
export default function ngcOmniboxSuggestionsDirective(modifySuggestionsTemplate) {

  return {
    restrict: 'E',
    require: '^^ngcOmnibox',
    scope: true,
    controller: NgcOmniboxSuggestionsController,
    controllerAs: 'suggestions',
    compile(tElement) {
      tElement.html(modifySuggestionsTemplate(tElement[0]));

      return {
        pre(scope, iElement, iAttrs, omnibox) {
          scope.omnibox = omnibox;
        }
      };
    }
  };
}
