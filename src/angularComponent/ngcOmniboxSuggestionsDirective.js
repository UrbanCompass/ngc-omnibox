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
ngcOmniboxSuggestionsDirective.$inject = ['$document', 'ngcModifySuggestionsTemplate'];
export default function ngcOmniboxSuggestionsDirective($document, ngcModifySuggestionsTemplate) {

  return {
    restrict: 'AE',
    require: '^^ngcOmnibox',
    scope: true,
    controller() {},
    controllerAs: 'suggestions',
    compile(tElement) {
      const doc = $document[0];
      const element = tElement[0];
      const tmpl = ngcModifySuggestionsTemplate(element);
      const isElemDirective = element.tagName === 'NGC-OMNIBOX-SUGGESTIONS';

      // Wrap all of the element contents so we can put an ng-if on it. The wrapper should use
      // all the attributes passed in by the app-maker except for the directive since that would
      // cause an infinite loop
      const wrapper = doc.createElement(isElemDirective ? 'div' : element.localName);
      wrapper.innerHTML = tmpl;
      wrapper.setAttribute('ng-if', 'omnibox.shouldShowSuggestions()');

      const attributes = Array.prototype.slice.apply(element.attributes);
      attributes.forEach((attr) => {
        // If the element is using the attribute directive, don't apply it to avoid infinite loop
        if (attr.name !== 'ngc-omnibox-suggestions') {
          wrapper.setAttribute(attr.name, attr.value);
        }
      });

      // Use the same directive strategy (attribute or element) for the new wrapping element as
      // the app-maker did.
      if (isElemDirective) {
        element.outerHTML = '<ngc-omnibox-suggestions>' + wrapper.outerHTML +
            '</ngc-omnibox-suggestions>';
      } else if (element.hasAttribute('ngc-omnibox-suggestions')) {
        element.outerHTML = '<div ngc-omnibox-suggestions>' + wrapper.outerHTML + '</div>';
      } else {
        element.innerHTML = wrapper.outerHTML;
      }

      return {
        pre(scope, iElement, iAttrs, omnibox) {
          scope.omnibox = omnibox;

          scope.$watch(() => omnibox.shouldShowSuggestions(), () => {
            if (omnibox.shouldShowSuggestions()) {
              iElement.css('display', '');
              iElement[0].scrollTop = 0;
            } else {
              iElement.css('display', 'none');
            }
          });
        }
      };
    }
  };
}
