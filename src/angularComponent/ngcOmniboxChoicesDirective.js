import NgcOmniboxChoicesController from './NgcOmniboxChoicesController.js';

export default function ngcOmniboxChoicesDirective() {
  return {
    restrict: 'E',
    require: {
      omnibox: '^^ngcOmnibox'
    },
    scope: true,
    controller: NgcOmniboxChoicesController,
    controllerAs: 'choices',
    compile(tElement) {
      const element = tElement[0];
      const tokens = element.firstElementChild;

      if (tokens) {
        tokens.setAttribute('ng-repeat', 'choice in omnibox.ngModel');
        tokens.setAttribute('ng-keyup', 'choices.handleKeyUp($event, choice)');
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
