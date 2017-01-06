import {KEY, isSelectKey, isVerticalMovementKey} from '../coreComponent/keyboard.js';

// Protects against multiple key events firing in a row without disallowing holding down the key
const KEY_REPEAT_DELAY = 150;

// Amount of time to wait results to load before showing the loading screen
const LOADING_SCREEN_THRESHOLD = 150;

export default class NgcOmniboxController {
  static get $inject() {
    return ['$timeout'];
  }

  constructor($timeout) {
    this.$timeout = $timeout;

    // Flatttened list of elements in the order they appear in the UI
    this._suggestionsUiList = [];

    this.isLoading = false; // Loading suggestions is in progress
    this.showLoadingElement = false; // Been loading for long enough we should show loading UI

    this.highlightNone();
  }

  onInputChange() {
    this._updateSuggestions();
  }

  onKeyDown($event) {
    const keyCode = $event.which;

    if (this.hasSuggestions()) {

      if (isVerticalMovementKey(keyCode) || isSelectKey(keyCode)) {
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
   * @param {Array} [suggestions=this.suggestions]
   * @returns {Boolean}
   */
  hasSuggestions(suggestions = this.suggestions) {
    if (!suggestions || !Array.isArray(suggestions) || !suggestions.length) {
      return false;
    }

    return true;
  }

  /**
   * Tries to update the index of the currently highlighted item to be the next item in the list. If
   * we've reached the end, it'll loop back around and highlight the first item.
   *
   * @param {Number} startHighlightIndex -- If running this function recursively, this is the index
   *     that was used at the start. This is to prevent it running infinitely.
   * @returns {Number} -- Index of the newly highlighted item
   */
  highlightPrevious(startHighlightIndex) {
    let newIndex = this.highlightedIndex;

    if (newIndex > 0) {
      newIndex--;
    } else {
      newIndex = this._suggestionsUiList.length - 1;
    }

    // Protect against an infinite loop in cases where all items are disabled
    if (startHighlightIndex === newIndex) {
      this.highlightNone();
      return this.highlightedIndex;
    } else {
      this.highlightedIndex = newIndex;
    }

    const suggestion = this._suggestionsUiList[newIndex];
    if (this.isSelectable({suggestion: suggestion.data}) === false) {
      if (typeof startHighlightIndex !== 'number') {
        startHighlightIndex = newIndex;
      }

      this.highlightPrevious(startHighlightIndex);
    }

    return newIndex;
  }

  /**
   * Tries to update the index of the currently highlighted item to be the previous item in the
   * list. If we've reached the start, it'll loop back and highlight the last item.
   *
   * @param {Number} startHighlightIndex -- If running this function recursively, this is the index
   *     that was used at the start. This is to prevent it running infinitely.
   * @returns {Number} -- Index of the newly highlighted item
   */
  highlightNext(startHighlightIndex) {
    let newIndex = this.highlightedIndex;

    if (newIndex < this._suggestionsUiList.length - 1) {
      newIndex++;
    } else {
      newIndex = 0;
    }

    // Protect against an infinite loop in cases where all items are disabled
    if (startHighlightIndex === newIndex) {
      this.highlightNone();
      return this.highlightedIndex;
    } else {
      this.highlightedIndex = newIndex;
    }

    const suggestion = this._suggestionsUiList[newIndex];
    if (this.isSelectable({suggestion: suggestion.data}) === false) {
      if (typeof startHighlightIndex !== 'number') {
        startHighlightIndex = newIndex;
      }

      this.highlightNext(startHighlightIndex);
    }

    return newIndex;
  }

  /**
   * Un-highlights all suggestions.
   */
  highlightNone() {
    this.highlightedIndex = -1; // -1 means nothing is highlighted
  }

  set highlightedIndex(index) {
    this._highlightedIndex = index;

    const highlightedUiItem = this._suggestionsUiList[index];
    if (highlightedUiItem) {
      this._highlightedItem = highlightedUiItem.data;
    } else {
      this._highlightedItem = null;
    }
  }

  get highlightedIndex() {
    return this._highlightedIndex;
  }

  isHighlighted(item) {
    return item === this._highlightedItem;
  }

  _handleKeyDown(keyCode) {
    if (keyCode === KEY.UP) {
      this.highlightPrevious();
    } else if (keyCode === KEY.DOWN) {
      this.highlightNext();
    } else if (keyCode === KEY.ESC) {
      this.highlightNone();
    } else if (isSelectKey(keyCode)) {
      const selection = this._suggestionsUiList[this.highlightedIndex];
      selection && this._selectItem(selection.data);
    }
  }

  _updateSuggestions() {
    this._suggestionsUiList.length = 0;

    this.highlightNone();
    this._showLoading();

    const promise = this.source({query: this.query, suggestions: this.suggestions});
    this._sourceFunctionPromise = promise;

    promise.then((suggestions) => {
      // Bail out if the promise has changed
      if (promise !== this._sourceFunctionPromise) {
        return;
      }

      this._hideLoading();

      if (this.hasSuggestions(suggestions)) {
        this.suggestions = suggestions;
      } else {
        throw new Error('Suggestions must be an Array');
      }
    });
  }

  set suggestions(suggestions) {
    if (Array.isArray(suggestions)) {
      this._suggestions = Array.prototype.slice.apply(suggestions);
      this._buildSuggestionsUiList();
    }
  }

  get suggestions() {
    return this._suggestions;
  }

  _showLoading() {
    this.isLoading = true;

    this._loadingTimeout = this.$timeout(() => {
      this.showLoadingElement = true;
    }, LOADING_SCREEN_THRESHOLD);
  }

  _hideLoading() {
    this.$timeout.cancel(this._loadingTimeout);
    this._loadingTimeout = null;
    this.isLoading = false;
    this.showLoadingElement = false;
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
    if (!item || (Array.isArray(this.ngModel) && this.ngModel.indexOf(item) >= 0)) {
      return null;
    }

    if (this.multiple) {
      this.ngModel = this.ngModel || [];
      this.ngModel.push(item);
    } else {
      this.ngModel = item;
    }
  }
}
