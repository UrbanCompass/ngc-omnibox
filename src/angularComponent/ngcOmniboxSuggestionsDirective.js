/**
 * Omnibox Suggestions Directive
 *
 * The Suggestions Directive is used to configure and to determine where in the Omnibox Component to
 * render the list of suggestions. It can be used as either a custom element or an attribute on a
 * standard HTML element. This directive requires at least one Omnibox Suggestion Category or
 * Omnibox Suggestion Item. If neither is found, then an Error will be thrown.
 *
 * This component has no bindings as configuration, but instead provides the following sub-
 * components that should be used to determine what markup to render:
 * - Omnibox Suggestion Category: Markup for when a suggestion has `children`
 * - Omnibox Suggestion Header: Markup for an optional category header
 * - Omnibox Suggestion Item: Markup for a single suggestion
 * - Omnibox Suggestion Loading: Markup for when suggestions are loading
 * - Omnibox Suggestion Empty: Markup for when there are no suggestions matching the query
 *
 * Any markup not contianed within one of these sub-components will be removed.
 *
 * @returns {Object}
 */
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
