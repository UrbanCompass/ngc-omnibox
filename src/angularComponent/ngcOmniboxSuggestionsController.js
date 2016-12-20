export default class NgcOmniboxSuggestionsController {
  static get $inject() {
    return ['$scope'];
  }

  constructor($scope) {
    this.$scope = $scope;
  }

  $postLink() {
    this.omnibox = this.$scope.omnibox;
  }
}
