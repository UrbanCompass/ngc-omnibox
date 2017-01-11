ngcOmniboxFieldDirective.$inject = ['$document'];
export default function ngcOmniboxFieldDirective($document) {
  return {
    restrict: 'E',
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

      const input = doc.createElement('input');

      input.setAttribute('class', el.getAttribute('class'));
      input.setAttribute('type', el.getAttribute('type') || 'text');
      input.setAttribute('ng-attr-tabindex', el.getAttribute('tabindex') || 'undefined');
      input.setAttribute('ng-attr-placeholder', '{{omnibox.placeholder || undefined}}');
      input.setAttribute('ng-attr-autofocus', '{{::omnibox.autofocus === \'true\' || undefined}}');

      input.setAttribute('role', 'combobox');
      input.setAttribute('aria-autocomplete', 'list');
      input.setAttribute('ng-attr-aria-expanded', '{{omnibox.hasSuggestions}}');
      input.setAttribute('ng-attr-aria-multiselectable', '{{omnibox.multiple || undefined}}');

      input.setAttribute('ng-model', 'omnibox.query');
      input.setAttribute('ng-change', 'omnibox.onInputChange($event)');
      input.setAttribute('ng-disabled', 'omnibox.ngDisabled()');

      input.setAttribute('ng-keydown', 'omnibox.onKeyDown($event)');
      input.setAttribute('ng-keyup', 'omnibox.onKeyUp($event)');
      input.setAttribute('ng-focus', 'omniboxField.ngFocus()');
      input.setAttribute('ng-blur', 'omniboxField.ngBlur()');

      el.removeAttribute('class');
      el.removeAttribute('tabindex');
      el.removeAttribute('type');
      el.innerHTML = '';
      el.appendChild(input);

      return {
        pre(scope, iElement, iAttrs, {omnibox}) {
          scope.omnibox = omnibox;
        }
      };
    }
  };
}
