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

    // Flatttened list of elements in the order they appear in the UI
    this._suggestionsUiList = [];

    this.highlightedIndex = -1; // -1 means nothing is highlighted
  }

  $postLink() {

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
    let newIndex = this.highlightedIndex;

    if (newIndex > 0) {
      newIndex--;
    } else {
      newIndex = this._suggestionsUiList.length - 1;
    }

    // Protect against an infinite loop in cases where all items are disabled
    if (this.startHighlightIndex === newIndex) {
      return this.highlightedIndex;
    } else {
      this.highlightedIndex = newIndex;
    }

    const suggestion = this._suggestionsUiList[newIndex];
    if (!this.isSelectable({suggestion: suggestion.data})) {
      if (this.startHighlightIndex === null || typeof this.startHighlightIndex === 'undefined') {
        this.startHighlightIndex = newIndex;
      }

      this.highlightPrevious();
    } else {
      this.startHighlightIndex = null;
    }

    return newIndex;
  }

  /**
   * Tries to update the index of the currently highlighted item to be the previous item in the
   * list. If we've reached the starrt, it'll loop back and highlight the last item.
   *
   * @returns {Number} -- Index of the newly highlighted item
   */
  highlightNext() {
    let newIndex = this.highlightedIndex;

    if (newIndex < this._suggestionsUiList.length - 1) {
      newIndex++;
    } else {
      newIndex = 0;
    }

    // Protect against an infinite loop in cases where all items are disabled
    if (this.startHighlightIndex === newIndex) {
      return this.highlightedIndex;
    } else {
      this.highlightedIndex = newIndex;
    }

    const suggestion = this._suggestionsUiList[newIndex];
    if (!this.isSelectable({suggestion: suggestion.data})) {
      if (this.startHighlightIndex === null || typeof this.startHighlightIndex === 'undefined') {
        this.startHighlightIndex = newIndex;
      }

      this.highlightNext();
    } else {
      this.startHighlightIndex = null;
    }

    return newIndex;
  }

  isHighlighted(item) {
    const match = this._suggestionsUiList.find((listItem) => listItem.data === item);

    if (match) {
      return match.index >= 0 && match.index === this.highlightedIndex;
    } else {
      return false;
    }
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
    this._suggestionsUiList.length = 0;
    this.highlightedIndex = -1;

    this.source({query: this.query}).then((suggestions) => {
      if (suggestions) {
        this.suggestions = Array.prototype.slice.apply(suggestions);
        this._buildSuggestionsUiList();
      } else {
        this.suggestions = suggestions;
      }
    });
  }

  /**
   * Builds a flat list of items out of the suggestions for easier keyboard navigation.
   *
   * @private
   */
  _buildSuggestionsUiList() {
    let index = 0;

    function flatten(items) {
      let list = [];
      items.forEach((item) => {
        list.push({
          index,
          data: item
        });

        index++;

        if (Array.isArray(item.children) && item.children.length) {
          list = list.concat(flatten(item.children));
        }
      });

      return list;
    }

    this._suggestionsUiList = flatten(this.suggestions);
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
