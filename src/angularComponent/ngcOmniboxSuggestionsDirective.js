import NgcOmniboxSuggestionsController from './ngcOmniboxSuggestionsController.js';

ngcOmniboxSuggestionsDirective.$inject = ['ngcOmniboxSuggestionsTemplate'];
export default function ngcOmniboxSuggestionsDirective(ngcOmniboxSuggestionsTemplate) {

  return {
    restrict: 'E',
    require: '^^ngcOmnibox',
    scope: true,
    controller: NgcOmniboxSuggestionsController,
    controllerAs: 'suggestions',
    compile(tElement) {
      tElement.html(ngcOmniboxSuggestionsTemplate.getModifiedTemplate(tElement[0]));

      return {
        pre(scope, iElement, iAttrs, omnibox) {
          scope.omnibox = omnibox;
        }
      };
    }
  };
}
