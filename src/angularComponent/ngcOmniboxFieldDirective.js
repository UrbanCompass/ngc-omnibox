ngcOmniboxFieldDirective.$inject = ['$document'];
export default function ngcOmniboxFieldDirective($document) {
  return {
    restrict: 'E',
    require: {
      omnibox: '^^ngcOmnibox'
    },
    bindToController: {
      type: '@'
    },
    scope: true,
    controller() {},
    controllerAs: 'omniboxField',
    compile(tElement) {
      const doc = $document[0];

      const input = doc.createElement('input');

      input.setAttribute('ng-attr-type', '{{::omniboxField.type || \'text\'}}');
      input.setAttribute('role', 'combobox');
      input.setAttribute('aria-autocomplete', 'list');
      input.setAttribute('ng-attr-aria-expanded', '{{omnibox.hasSuggestions}}');
      input.setAttribute('ng-attr-aria-multiselectable', '{{omnibox.multiple || undefined}}');
      input.setAttribute('ng-model', 'omnibox.query');
      input.setAttribute('ng-change', 'omnibox.onInputChange($event)');
      input.setAttribute('ng-keydown', 'omnibox.onKeyDown($event)');
      input.setAttribute('ng-keyup', 'omnibox.onKeyUp($event)');
      input.setAttribute('ng-attr-placeholder', '{{omnibox.placeholder || undefined}}');
      input.setAttribute('ng-attr-autofocus',
          '{{::omnibox.autofocus === \'true\' || undefined}}');
      input.setAttribute('ng-disabled', 'omnibox.ngDisabled()');

      tElement[0].appendChild(input);

      return {
        pre(scope, iElement, iAttrs, {omnibox}) {
          scope.omnibox = omnibox;
        }
      };
    }
  };
}
