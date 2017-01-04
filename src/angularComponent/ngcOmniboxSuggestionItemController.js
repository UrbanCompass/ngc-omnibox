export default class NgcOmniboxSuggestionItemController {
  $onInit() {
    this.omnibox.registerItem(this.suggestion);

  }
  $onDestroy() {
    this.omnibox.deregisterItem(this.index);
  }
}
