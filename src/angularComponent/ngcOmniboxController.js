import {KEY, isSelectKey, isVerticalMovementKey} from '../coreComponent/keyboard.js';

// Protects against multiple key events firing in a row without disallowing holding down the key
const KEY_REPEAT_DELAY = 150;

// Amount of time to wait results to load before showing the loading screen
const LOADING_SCREEN_THRESHOLD = 150;

const customArrayPrototype = Object.create(Array.prototype);

export default class NgcOmniboxController {

  constructor() {
    this.hasSuggestions = false; // Whether we have any suggestions loaded

    // Flattened list of elements in the order they appear in the UI
    this._suggestionsUiList = [];

    this.isLoading = false; // Loading suggestions is in progress
    this.showLoadingElement = false; // Been loading for long enough we should show loading UI
    this.shouldShowChoices = false; // Whether to show the choices elements

    this.highlightNone();

    // Listen for updates to the model when it's an array
    const omnibox = this;
    ['push', 'pop', 'shift', 'unshift', 'splice'].forEach((property) => {
      customArrayPrototype[property] = function (...args) {
        const ret = Array.prototype[property].apply(this, args);
        omnibox._onNgModelChange();
        return ret;
      };
    });
  }

  set suggestions(suggestions) {
    if (Array.isArray(suggestions)) {
      this._suggestions = Array.prototype.slice.apply(suggestions);
      this._buildSuggestionsUiList();
    }

    this.hasSuggestions = Array.isArray(suggestions) && !!suggestions.length;
  }

  get suggestions() {
    return this._suggestions;
  }

  set ngModel(newModel) {
    this._ngModel = newModel;

    if (Array.isArray(this._ngModel)) {
      Object.setPrototypeOf(this._ngModel, customArrayPrototype);
    }

    this._onNgModelChange();
  }

  get ngModel() {
    return this._ngModel;
  }

  onInputChange() {
    this._updateSuggestions();
  }

  onKeyDown($event) {
    const keyCode = $event.which;

    if (this.hasSuggestions) {

      if (isVerticalMovementKey(keyCode) || (isSelectKey(keyCode) && this.highlightedIndex >= 0)) {
        $event.preventDefault();
        $event.stopPropagation();
      }

      if (!this._keyDownTimeout) {
        this._handleKeyDown(keyCode);
      }

      this._keyDownTimeout = setTimeout(() => this._handleKeyDown(keyCode), KEY_REPEAT_DELAY);
    }
  }

  onKeyUp() {
    clearTimeout(this._keyDownTimeout);
    this._keyDownTimeout = null;
  }

  /**
   * Whether or not we should show the suggestions menu.
   *
   * @returns {Boolean}
   */
  shouldShowSuggestions() {
    return (this.isLoading || !!this.query) && this.canShow({query: this.query}) !== false;
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

  /**
  * Highlights a particular suggestion item.
  *
  * @param {Object} item
  */
  highlightItem(item) {
    const uiItemMatch = this._suggestionsUiList.find((uiItem) => uiItem.data === item);

    if (uiItemMatch && this.isSelectable({suggestion: uiItemMatch.data}) !== false) {
      this.highlightedIndex = uiItemMatch.index;
    }
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

  /**
   * Whether a particular suggestion item is highlighted.
   *
   * @param {Object} item
   * @returns {Boolean}
   */
  isHighlighted(item) {
    return item === this._highlightedItem;
  }

  /**
   * Chooses a suggestion item and adds it to the list of choices. If `multiple` is off, then only
   * one choice can be chosen at a time, and the choice becomes the `ngModel`.
   *
   * @param {Object} item
   */
  choose(item) {
    if (item && !(Array.isArray(this.ngModel) && this.ngModel.indexOf(item) >= 0) &&
        this.isSelectable({suggestion: item}) !== false) {
      if (this.multiple) {
        this.ngModel = this.ngModel || [];
        this.ngModel.push(item);
      } else {
        this.ngModel = item;
      }

      this._updateSuggestions();
    }
  }

  /**
   * Removes a suggestion item from the list of choices. If `multiple` is off, then the `ngModel`
   * is cleared.
   *
   * @param {Object} item
   */
  unchoose(item) {
    if (item) {
      if (Array.isArray(this.ngModel)) {
        this.ngModel.splice(this.ngModel.indexOf(item), 1);
      } else if (!this.multiple) {
        this.ngModel = null;
      }

      this._updateSuggestions();
    }
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
      selection && this.choose(selection.data);
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

      if (!suggestions) {
        this.suggestions = null;
      } else if (Array.isArray(suggestions)) {
        this.suggestions = suggestions;
      } else {
        throw new Error('Suggestions must be an Array');
      }
    });
  }

  _showLoading() {
    this.isLoading = true;

    this._loadingTimeout = setTimeout(() => {
      this.showLoadingElement = true;
    }, LOADING_SCREEN_THRESHOLD);
  }

  _hideLoading() {
    clearTimeout(this._loadingTimeout);
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

  /**
   * Called when the model has been modified, either by being replaced entirely or when it's an
   * array and its contents are modified using the array modification functions.
   */
  _onNgModelChange() {
    this.shouldShowChoices = !!this.multiple && Array.isArray(this._ngModel) &&
        !!this._ngModel.length;
  }
}
