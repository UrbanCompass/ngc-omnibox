export default class NgcOmniboxSuggestionItemController {

  handleMouseEnter() {
    this.omnibox.highlightSuggestion(this.suggestion);
  }

  handleMouseLeave() {
    this.omnibox.highlightNone();
  }

  handleClick() {
    this.omnibox.choose(this.suggestion);
  }

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
