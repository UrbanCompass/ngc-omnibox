export default function ngcOmniboxSuggestionItemDirective() {
  return {
    restrict: 'E',
    require: {
      omnibox: '^^ngcOmnibox'
    },
    scope: true,
    compile(tElement) {
      const element = tElement[0];
      const tokens = element.firstElementChild;

      tokens && tokens.setAttribute('ng-repeat', 'selection in omnibox.ngModel');

      return {
        pre(scope, iElement, iAttrs, {omnibox}) {
          scope.omnibox = omnibox;
        }
      };
    }
  };
}
