ngcOmniboxFieldDirective.$inject = ['$document'];
export default function ngcOmniboxFieldDirective($document) {
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

      return {
        pre(scope, iElement, iAttrs, {omnibox}) {
          scope.omnibox = omnibox;
          omnibox.fieldElement = input;
        }
      };
    }
  };
}
