/**
 * Omnibox Choices Directive
 *
 * The Choices Directive is used to configure how markup is rendered for a single chosen suggestion.
 * It requires a single HTML element to exist as a direct child of the directive. That child is then
 * repeated over to render out the list of choices. Any other siblings of that first element will be
 * maintained, but will appear after the repeated choices and so will appear at the end and without
 * access to any choice being repeated over.
 *
 * Items inside this repeated first child have access to an `omnibox` object that is a reference to
 * the base Omnibox Controller, as well as a `choice` object which is the data item of the chosen
 * suggestion. The type of data this object has depends on the data passed in the source function.
 *
 * If you wish to add a button that removes the choice, simply make a call to `omnibox.unchoose()`
 * and pass in the current choice as the only parameter.
 *
 * Sample usage:
 *     <ngc-omnibox source="myController.getSuggestions(query)" ng-model="myController.choices">
 *       <ngc-omnibox-choices>
 *         <div class="myChoice"> <!-- This element will be repeated over -->
 *           {{choice.title}}
 *           <button ng-click="omnibox.unchoose(choice)">Remove</button>
 *         </div>
 *         <span>
 *           This markup will remain, but will appear after all the choices are repeated over.
 *         </span>
 *       </ngc-omnibox-choices>
 *     </ngc-omnibox>
 *
 * @returns {Object}
 */
export default function ngcOmniboxChoicesDirective() {
  return {
    restrict: 'AE',
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
