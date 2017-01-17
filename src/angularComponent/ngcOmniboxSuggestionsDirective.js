ngcOmniboxSuggestionsDirective.$inject = ['ngcModifySuggestionsTemplate'];
export default function ngcOmniboxSuggestionsDirective(ngcModifySuggestionsTemplate) {

  return {
    restrict: 'AE',
    require: '^^ngcOmnibox',
    scope: true,
    controller() {},
    controllerAs: 'suggestions',
    compile(tElement) {
      tElement.html(ngcModifySuggestionsTemplate(tElement[0]));

      return {
        pre(scope, iElement, iAttrs, omnibox) {
          scope.omnibox = omnibox;

          scope.$watch(() => omnibox.shouldShowSuggestions(), () => {
            if (omnibox.shouldShowSuggestions()) {
              iElement.css('display', '');
            } else {
              iElement.css('display', 'none');
            }
          });
        }
      };
    }
  };
}
