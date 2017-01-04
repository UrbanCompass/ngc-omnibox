export default class NgcOmniboxSuggestionItemController {
  static get $inject() {
    return ['$scope'];
  }
  constructor($scope) {
    this.$scope = $scope;
  }
  $onInit() {
    this.omnibox = this.$scope.omnibox;
    this.omnibox.registerItem(this.suggestion);

  }
  $onDestroy() {
    this.omnibox.deregisterItem(this.index);
  }
}
