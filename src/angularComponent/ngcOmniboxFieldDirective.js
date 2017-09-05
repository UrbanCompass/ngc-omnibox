/**
 * Omnibox Field Directive
 *
 * The Field Directive is used to determine where in the Omnibox Component to render the input field
 * element. It can be used either as a custom element, or an attribute on a standard HTML element.
 * Once included, an input field element will be appended inside and used for all typing events.
 * If you need access to the actual input field used (or want it to be rendered on the page before
 * Angular is init'd), then you can include an input element inside this directive and that will
 * be used instead of a new one being created.
 *
 * This directive also has the following bindings available:
 *
 * - ngFocus(): This callback is executed when the input field receives focus.
 * - ngBlur(): This callback is executed when the input field loses focus.
 *
 * Sample usage:
 *     <ngc-omnibox source="myController.getSuggestions(query)" ng-model="myController.choices">
 *       <ngc-omnibox-field><input type="text" placeholder="Search here..."></ngc-omnibox-field>
 *     </ngc-omnibox>
 */
ngcOmniboxFieldDirective.$inject = ['$document', '$window'];
export default function ngcOmniboxFieldDirective($document, $window) {
  return {
    restrict: 'AE',
    require: {
      omnibox: '^^ngcOmnibox'
    },
    bindToController: {
      ngFocus: '&',
      ngBlur: '&'
    },
    scope: true,
    controller() {},
    controllerAs: 'omniboxField',
    compile(tElement) {
      const doc = $document[0];
      const el = tElement[0];

      const input = el.querySelector('input') || doc.createElement('input');
      const inputHint = input.cloneNode();

      if (!input.parentNode) {
        el.appendChild(input);
      }

      if (!input.getAttribute('type')) {
        input.setAttribute('type', 'text');
      }

      input.setAttribute('role', 'combobox');
      input.setAttribute('aria-autocomplete', 'list');
      input.setAttribute('tabindex', input.getAttribute('tabindex') || 0);

      input.setAttribute('ng-attr-aria-expanded', '{{omnibox.hasSuggestions}}');
      input.setAttribute('ng-attr-aria-multiselectable', '{{omnibox.multiple || undefined}}');

      input.setAttribute('ng-model', 'omnibox.query');
      input.setAttribute('ng-change', 'omnibox.onInputChange($event)');
      input.setAttribute('ng-disabled', 'omnibox.ngDisabled()');

      input.setAttribute('ng-focus', 'omniboxField.ngFocus()');
      input.setAttribute('ng-blur', 'omniboxField.ngBlur()');

      inputHint.setAttribute('ng-if',
          'omnibox.query && omnibox.hint && omnibox.query !== omnibox.hint');
      inputHint.setAttribute('tabindex', -1);
      inputHint.setAttribute('readonly', true);
      inputHint.setAttribute('ng-model', 'omnibox.hint');
      inputHint.removeAttribute('placeholder');
      inputHint.style.pointerEvents = 'none';
      inputHint.style.position = 'absolute';
      inputHint.style.top = 0;
      inputHint.style.left = 0;
      input.parentNode.insertBefore(inputHint, input);

      return {
        pre(scope, iElement, iAttrs, {omnibox}) {
          scope.omnibox = omnibox;
          omnibox.fieldElement = iElement[0].querySelector('input');

          scope.$watch('omnibox.hint', (hint) => {
            const position = $window.getComputedStyle(el).position;

            if (hint && (position === 'static')) {
              el.style.position = 'relative';
            } else if (!hint) {
              el.style.position = '';
            }
          });
        }
      };
    }
  };
}
