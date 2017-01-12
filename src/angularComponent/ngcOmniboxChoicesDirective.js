export default function ngcOmniboxChoicesDirective() {
  return {
    restrict: 'E',
    require: {
      omnibox: '^^ngcOmnibox'
    },
    scope: true,
    controller() {},
    controllerAs: 'choices',
    compile(tElement) {
      const element = tElement[0];
      const token = element.firstElementChild;

      if (token) {
        token.setAttribute('tabindex', -1);
        token.setAttribute('ng-repeat', 'choice in omnibox.ngModel');
        token.setAttribute('ng-focus', 'omnibox.highlightedChoice = choice');
        token.setAttribute('ng-blur', 'omnibox.highlightedChoice = null');
      } else {
        throw new Error('ngc-omnibox-choices requires a root HTML element');
      }

      return {
        pre(scope, iElement, iAttrs, {omnibox}) {
          scope.omnibox = omnibox;

          scope.$watch('omnibox.hasChoices', () => {
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
