import {KEY, isVerticalMovementKey} from '../coreComponent/keyboard.js';

// Protects against multiple key events firing in a row without disallowing holding down the key
const KEY_REPEAT_DELAY = 150;

export default class NgcOmniboxController {
  static get $inject() {
    return ['$document', '$element', '$timeout'];
  }

  constructor($document, $element, $timeout) {
    this.$document = $document;
    this.$element = $element;
    this.$timeout = $timeout;

    this._suggestionItems = [];

    this.highlightedIndex = -1; // -1 means nothing is highlighted
  }

  $postLink() {

  }

  /**
   * Register an item so that it can receive keyboard focus events.
   *
   * @param {Object} item
   */
  registerItem(item) {
    this._suggestionItems.push(item);
  }

  /**
   * De-register an item so no longer receives keyboard focus events.
   *
   * @param {Object} item
   */
  deregisterItem(item) {
    const index = this._suggestionItems.indexOf(item);
    this._suggestionItems.splice(index, 1);
  }

  onInputChange() {
    this._updateSuggestions();
  }

  onKeyDown($event) {
    const keyCode = $event.which;

    if (this.hasSuggestions()) {

      if (isVerticalMovementKey(keyCode)) {
        $event.preventDefault();
        $event.stopPropagation();
      }

      if (!this._keyDownTimeout) {
        this._handleKeyDown(keyCode);
      }

      this._keyDownTimeout = this.$timeout(() => this._handleKeyDown(keyCode), KEY_REPEAT_DELAY);
    }
  }

  onKeyUp() {
    this.$timeout.cancel(this._keyDownTimeout);
    this._keyDownTimeout = null;
  }

  /**
   * Determines if there are suggestions to display
   *
   * @returns {Boolean}
   */
  hasSuggestions() {
    const suggestions = this.suggestions;

    if (!suggestions || !Array.isArray(suggestions) || !suggestions.length) {
      return false;
    }

    return true;
  }

  /**
   * Tries to update the index of the currently highlighted item to be the next item in the list. If
   * we've reached the end, it'll loop back around and highlight the first item.
   *
   * @returns {Number} -- Index of the newly highlighted item
   */
  highlightPrevious() {
    if (this.highlightedIndex > 0) {
      this.highlightedIndex--;
    } else {
      this.highlightedIndex = this._suggestionItems.length - 1;
    }

    return this.highlightedIndex;
  }

  /**
   * Tries to update the index of the currently highlighted item to be the previous item in the
   * list. If we've reached the starrt, it'll loop back and highlight the last item.
   *
   * @returns {Number} -- Index of the newly highlighted item
   */
  highlightNext() {
    if (this.highlightedIndex < this._suggestionItems.length - 1) {
      this.highlightedIndex++;
    } else {
      this.highlightedIndex = 0;
    }

    return this.highlightedIndex;
  }

  isHighlighted(item) {
    const index = this._suggestionItems.indexOf(item);
    return index >= 0 && index === this.highlightedIndex;
  }

  _handleKeyDown(keyCode) {
    if (keyCode === KEY.UP) {
      this.highlightPrevious();
    } else if (keyCode === KEY.DOWN) {
      this.highlightNext();
    } else if (keyCode === KEY.ESC) {
      this.highlightedIndex = -1;
    }
  }

  _updateSuggestions() {
    this._suggestionItems.length = 0;
    this.highlightedIndex = -1;

    this.source({query: this.query}).then((suggestions) => {
      this.suggestions = suggestions;
    });
  }

  _selectItem(item) {
    if (this.multiple) {
      this.ngModel = this.ngModel || [];
      this.ngModel.push(item);
    } else {
      this.ngModel = item;
    }
  }
}
