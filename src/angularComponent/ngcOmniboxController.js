import {KEY, isVerticalMovementKey} from '../coreComponent/keyboard.js';

export const INSTANCE_ID = `ngc-omnibox-${new Date().getTime() * Math.random()}`;
export const SUGGESTION_ITEM_NAME = `${INSTANCE_ID}-suggestion-item`;
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

    this.highlightedIndex = -1; // -1 means nothing is highlighted
  }

  $postLink() {
    this.inputEl = this.$element[0].querySelector('input[role="combobox"]');

    this._suggestionElements = this.$document[0].getElementsByName(
      SUGGESTION_ITEM_NAME
    ); // Live HTMLCollection so it's always automatically up to date

    // Cached copy as an array we can do transformations on
    this._cachedNodeList = Array.prototype.slice.apply(this._suggestionElements);
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

    if (!suggestions || (!Array.isArray(suggestions) && typeof suggestions !== 'object')) {
      return false;
    } else if (Array.isArray(suggestions) && !suggestions.length) {
      return false;
    } else if (typeof suggestions === 'object' && !Object.keys(suggestions).length) {
      return false;
    }

    return true;
  }

  /**
   * Tries to update the index of the currently highlighted item to be the next item in the list. If
   * we've reached the end, it'll loop back around and highlight the first item.
   *
   * @returns {Boolean} -- Index of the newly highlighted item
   */
  highlightPrevious() {
    if (this.highlightedIndex > 0) {
      this.highlightedIndex--;
    } else {
      this.highlightedIndex = this._suggestionElements.length - 1;
    }

    return this.highlightedIndex;
  }

  /**
   * Tries to update the index of the currently highlighted item to be the previous item in the
   * list. If we've reached the starrt, it'll loop back and highlight the last item.
   *
   * @returns {Boolean} -- Index of the newly highlighted item
   */
  highlightNext() {
    if (this.highlightedIndex < this._suggestionElements.length - 1) {
      this.highlightedIndex++;
    } else {
      this.highlightedIndex = 0;
    }

    return this.highlightedIndex;
  }

  /**
   * Returns the overall index of suggestion HTML element in our list of suggestions.
   *
   * @param {HTMLElement} elem
   * @returns {Number|Null}
   */
  getSuggestionItemIndex(elem) {
    const index = this._cachedNodeList.indexOf(elem);
    return index >= 0 ? index : null; // -1 is our index for nothing highlighted
  }

  _handleKeyDown(keyCode) {
    if (keyCode === KEY.UP) {
      this.highlightPrevious();
    } else if (keyCode === KEY.DOWN) {
      this.highlightNext();
    } else if (keyCode === KEY.ESC) {
      this.highlightedIndex = -1;
    }

    this._updateHighlightedItem();
  }

  _updateHighlightedItem() {
    let selectedEl = this.$element[0].querySelector('[aria-selected]');
    selectedEl && selectedEl.removeAttribute('aria-selected');

    selectedEl = this._suggestionElements[this.highlightedIndex];
    selectedEl && selectedEl.setAttribute('aria-selected', true);
  }

  _updateSuggestions() {
    this._cachedNodeList.length = 0;
    this.highlightedIndex = -1;

    this.source({query: this.ngModel}).then((suggestions) => {
      this.suggestions = suggestions;

      // Wait for DOM to update, then keep a cached copy of the HTMLCollection for indexOf lookup
      this.$timeout(() => {}, 0).then(() => {
        this._cachedNodeList = Array.prototype.slice.apply(this._suggestionElements);
      });
    });
  }
}
