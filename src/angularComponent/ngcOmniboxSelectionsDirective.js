export default function ngcOmniboxSelectionsDirective() {
  return {
    restrict: 'E',
    require: {
      omnibox: '^^ngcOmnibox'
    },
    scope: true,
    compile(tElement) {
      const element = tElement[0];
      const tokens = element.firstElementChild;

      if (tokens) {
        tokens.setAttribute('ng-repeat', 'selection in omnibox.ngModel');
      } else {
        throw new Error('ngc-omnibox-selections requires a root HTML element');
      }

      return {
        pre(scope, iElement, iAttrs, {omnibox}) {
          scope.omnibox = omnibox;
        }
      };
    }
  };
}
