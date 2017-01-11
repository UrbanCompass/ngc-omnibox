export default class NgcOmniboxChoicesController {
  static get $inject() {
    return ['$scope'];
  }

  constructor($scope) {
    this.$scope = $scope;
  }

  handleKeyUp($event, choice) {
    // Backspace or Delete
    if ($event.keyCode === 8 || $event.keyCode === 46) {
      this.$scope.omnibox.unchoose(choice);
    }
  }
}
