export default function ngcOmniboxChoicesDirective() {
  return {
    restrict: 'E',
    require: {
      omnibox: '^^ngcOmnibox'
    },
    scope: true,
    controller() {},
    compile(tElement) {
      const element = tElement[0];
      const tokens = element.firstElementChild;

      if (tokens) {
        tokens.setAttribute('ng-repeat', 'selection in omnibox.ngModel');
      } else {
        throw new Error('ngc-omnibox-choices requires a root HTML element');
      }

      return {
        pre(scope, iElement, iAttrs, {omnibox}) {
          scope.omnibox = omnibox;

          scope.$watch('omnibox.shouldShowChoices', () => {
            if (omnibox.multiple && omnibox.ngModel && omnibox.ngModel.length) {
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
