export default class NgcOmniboxSuggestionItemController {

  /**
   * Whether or not the item is currently highlighted.
   *
   * @returns {Boolean}
   */
  isHighlighted() {
    return this.omnibox.isHighlighted(this.suggestion);
  }

  /**
   * Whether or not the item is currently selectable by the keyboard or mouse.
   *
   * @returns {Boolean}
   */
  isSelectable() {
    return this.omnibox.isSelectable({suggestion: this.suggestion});
  }
}
