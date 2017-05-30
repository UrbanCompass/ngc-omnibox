import {KEY, isSelectKey, isVerticalMovementKey} from '../keyboard.js';

// Protects against multiple key events firing in a row without disallowing holding down the key
const KEY_REPEAT_DELAY = 150;

// Amount of time to wait results to load before showing the loading screen
const LOADING_SCREEN_THRESHOLD = 150;

// Time in miliseconds to wait before closing the suggestions after focus is lost
const SUGGESTIONS_BLUR_THRESHOLD = 10;

export default class NgcOmniboxController {
  static get $inject() {
    return ['$document', '$element', '$scope'];
  }

  constructor($document, $element, $scope) {
    this.doc = $document[0];
    this.element = $element[0];
    this.$scope = $scope;

    this.hideSuggestions = false; // Whether to forcibly hide the list of suggestions
    this.hasSuggestions = false; // Whether we have any suggestions loaded
    this.hasChoices = false; // Whether we have any suggestions chosen

    this._suggestionsUiList = []; // Flattened list of elements in the order they appear in the UI
    this.highlightedChoice = null; // Keeps track of the currently highlighted choice

    this.isLoading = false; // Loading suggestions is in progress
    this.shouldShowLoadingElement = false; // Been loading for long enough we should show loading UI

    this.highlightNone();

    // Need our overall component to be focusable so that it can continue listening to keyboard
    // events when we stop focusing on the input field and focus on the choices
    this.element.setAttribute('tabindex', -1);
    this.element.addEventListener('keydown', (evt) => {
      this.onKeyDown(evt);
      $scope.$apply();
    });
    this.element.addEventListener('keyup', (evt) => {
      this.onKeyUp(evt);
      $scope.$apply();
    });

    let blurTimeout;
    this.element.addEventListener('focus', (event) => {
      clearTimeout(blurTimeout);
      this.onFocus({event});
    }, true);
    this.element.addEventListener('blur', (event) => {
      blurTimeout = setTimeout(() => {
        if (this.hideOnBlur !== 'false') {
          this.hideSuggestions = true;
          this.highlightedChoice = null;
          $scope.$apply();
        }

        this.onBlur({event});
      }, SUGGESTIONS_BLUR_THRESHOLD);
    }, true);

    // Remove the focus ring when the overall component is focused
    const styleSheets = this.doc.styleSheets;
    if (styleSheets && styleSheets.length) {
      styleSheets[styleSheets.length - 1].insertRule('ngc-omnibox:focus {outline: none}', 0);
    }
  }

  set fieldElement(el) {
    if (this._fieldElement) {
      this._fieldElement.removeEventListener('focus', this._highlightNoChoice);
    }

    this._highlightNoChoice = () => this.highlightedChoice = null;

    this._fieldElement = el;
    this._fieldElement.addEventListener('focus', this.highlightNoChoice);
  }

  get fieldElement() {
    return this._fieldElement;
  }

  set suggestions(suggestions) {
    if (!suggestions) {
      this._suggestions = null;
    } else if (Array.isArray(suggestions)) {
      this._suggestions = Array.prototype.slice.apply(suggestions);
      this._buildSuggestionsUiList();
    } else {
      throw new Error('Suggestions must be an Array');
    }

    this.hasSuggestions = Array.isArray(suggestions) && !!suggestions.length;
  }

  get suggestions() {
    return this._suggestions;
  }

  set ngModel(newModel) {
    if (newModel === '' || newModel === null || typeof newModel === 'undefined') {
      this._ngModel = null;
      this.query = '';
      this.onInputChange();
    } else {
      this._ngModel = newModel;
    }

    if (Array.isArray(this._ngModel)) {
      const currentPrototype = Object.getPrototypeOf(this._ngModel);
      const newPrototype = Object.create(currentPrototype);

      // Listen for updates to the model when it's an array
      const omnibox = this;
      ['push', 'pop', 'shift', 'unshift', 'splice'].forEach((property) => {
        newPrototype[property] = function (...args) {
          const ret = currentPrototype[property].apply(this, args);
          omnibox._onNgModelChange();
          return ret;
        };
      });

      Object.setPrototypeOf(this._ngModel, newPrototype);
    }

    this._onNgModelChange();
  }

  get ngModel() {
    return this._ngModel;
  }

  set highlightedChoice(choice) {
    this._highlightedChoice = choice;

    const focusedEl = this.doc.activeElement;
    if (this._fieldElement && (focusedEl === this.element || this.element.contains(focusedEl))) {
      if (choice) {
        this.element.focus();
      } else {
        this._fieldElement.focus();
      }
    }
  }

  get highlightedChoice() {
    return this._highlightedChoice;
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

  set hideSuggestions(hide) {
    this._hideSuggestions = hide;

    // Clear out the suggestions when we hide the panel. This stops from showing old results for
    // a hot second when we re-open the panel
    if (hide === true && Array.isArray(this.suggestions)) {
      this.suggestions.length = 0;
    }
  }

  get hideSuggestions() {
    return this._hideSuggestions;
  }

  /**
  * Highlights a particular suggestion item.
  *
  * @param {Object} item
  */
  highlightSuggestion(item) {
    if (this.isHighlightingDisabled) {
      return;
    }

    const [uiItemMatch] = this._suggestionsUiList.filter((uiItem) => uiItem.data === item);

    if (uiItemMatch && this.isSelectable({suggestion: uiItemMatch.data}) !== false) {
      this.highlightedIndex = uiItemMatch.index;
    }
  }

  /**
   * Tries to update the index of the currently highlighted item to be the next item in the list. If
   * we've reached the end, it'll loop back around and highlight the first item.
   *
   * @param {Number} startHighlightIndex -- If running this function recursively, this is the index
   *     that was used at the start. This is to prevent it running infinitely.
   * @returns {Number} -- Index of the newly highlighted item
   */
  highlightPreviousSuggestion(startHighlightIndex) {
    let newIndex = this.highlightedIndex;

    if (newIndex > 0) {
      newIndex--;
    } else if (!this.requireMatch && newIndex === 0) {
      // If a match isn't required, select nothing when looping around
      newIndex = -1;
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
    if (suggestion && this.isSelectable({suggestion: suggestion.data}) === false) {
      if (typeof startHighlightIndex !== 'number') {
        startHighlightIndex = newIndex;
      }

      return this.highlightPreviousSuggestion(startHighlightIndex);
    }

    this._scrollSuggestionIntoView();

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
  highlightNextSuggestion(startHighlightIndex) {
    let newIndex = this.highlightedIndex;

    if (newIndex < this._suggestionsUiList.length - 1) {
      newIndex++;
    } else if (!this.requireMatch && newIndex === this._suggestionsUiList.length - 1) {
      // If a match isn't required, select nothing when looping around
      newIndex = -1;
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
    if (suggestion && this.isSelectable({suggestion: suggestion.data}) === false) {
      if (typeof startHighlightIndex !== 'number') {
        startHighlightIndex = newIndex;
      }

      return this.highlightNextSuggestion(startHighlightIndex);
    }

    this._scrollSuggestionIntoView();

    return newIndex;
  }

  /**
   * Un-highlights all suggestions.
   */
  highlightNone() {
    if (this.isHighlightingDisabled || this.requireMatch) {
      return;
    }

    this.highlightedIndex = -1; // -1 means nothing is highlighted
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
   * Highlights a choice from the list of choices.
   *
   * @param {Any} choice
   */
  highlightChoice(choice) {
    if (!this.multiple || !Array.isArray(this.ngModel) || this.ngModel.indexOf(choice) === -1) {
      return;
    }

    this.highlightedChoice = choice;
  }

  /**
   * Highlights the next choice after the currently higlighted one. If the last one is
   * highlighted then the field is focused.
   */
  highlightNextChoice() {
    if (!this.multiple || !Array.isArray(this.ngModel)) {
      return;
    }

    const index = this.ngModel.indexOf(this.highlightedChoice);

    if (index < this.ngModel.length - 1) {
      this.highlightedChoice = this.ngModel[index + 1];
    } else {
      this.highlightedChoice = null;
    }
  }

  /**
   * Highlights the previous suggestion before the currently higlighted one. If the first one is
   * highlighted then the field is focused.
   */
  highlightPreviousChoice() {
    if (!this.multiple || !Array.isArray(this.ngModel)) {
      return;
    }

    const index = this.ngModel.indexOf(this.highlightedChoice);

    if (index > 0) {
      this.highlightedChoice = this.ngModel[index - 1];
    } else {
      this.highlightedChoice = null;
    }
  }

  /**
   * Highlights the first choice in the list of choices.
   */
  highlightFirstChoice() {
    if (this.multiple) {
      this.highlightedChoice = this.ngModel[0];
    }
  }

/**
 * Highlights the first choice in the list of choices.
 */
  highlightLastChoice() {
    if (this.multiple) {
      this.highlightedChoice = this.ngModel[this.ngModel.length - 1];
    }
  }

  /**
   * Whether the submitted choice is currently highlighted.
   *
   * @param {Any} choice
   * @returns {Boolean}
   */
  isChoiceHighlighted(choice) {
    return this.multiple && this.highlightedChoice === choice;
  }

  focus() {
    this._fieldElement && this._fieldElement.focus();
  }

  blur() {
    this._fieldElement && this._fieldElement.blur();
  }

  /**
   * Chooses a suggestion item and adds it to the list of choices. If `multiple` is off, then only
   * one choice can be chosen at a time, and the choice becomes the `ngModel`.
   *
   * @param {Object} item
   * @param {Boolean} shouldFocusField -- Whether to focus the input field after choosing
   */
  choose(item, shouldFocusField = true) {
    if (item && !(Array.isArray(this.ngModel) && this.ngModel.indexOf(item) >= 0) &&
        this.isSelectable({suggestion: item}) !== false) {
      if (this.multiple) {
        this.ngModel = this.ngModel || [];
        this.ngModel.push(item);
      } else {
        this.ngModel = item;
      }

      this.onChosen({choice: item});

      this.query = '';
      shouldFocusField && this.focus();
      this.hideSuggestions = true;
    }
  }

  /**
   * Removes a suggestion item from the list of choices. If `multiple` is off, then the `ngModel`
   * is cleared.
   *
   * @param {Object} item
   * @param {Boolean} shouldFocusField -- Whether to focus the input field after unchoosing
   */
  unchoose(item, shouldFocusField = true) {
    if (item) {
      if (Array.isArray(this.ngModel)) {
        this.ngModel.splice(this.ngModel.indexOf(item), 1);
      } else if (!this.multiple) {
        this.ngModel = null;
      }

      this.onUnchosen({choice: item});

      shouldFocusField && this.focus();
    }
  }

  /**
   * Whether or not we should show the suggestions menu.
   *
   * @returns {Boolean}
   */
  shouldShowSuggestions() {
    const shouldShowSuggestionsCurrently = this._shouldShowSuggestions;

    this._shouldShowSuggestions = !this.hideSuggestions &&
        (this.shouldShowLoadingElement || !!this.suggestions) &&
        this.canShowSuggestions({query: this.query}) !== false;

    if (this._shouldShowSuggestions &&
        this._shouldShowSuggestions !== shouldShowSuggestionsCurrently) {
      this.onShowSuggestions && this.onShowSuggestions({suggestions: this.suggestions});
    } else if (!this._shouldShowSuggestions &&
        this._shouldShowSuggestions !== shouldShowSuggestionsCurrently) {
      this.onHideSuggestions && this.onHideSuggestions({suggestions: this.suggestions});
    }

    return this._shouldShowSuggestions;
  }

  /**
   * Updates the list of suggestions based on the current query and the source function.
   *
   * @returns {Promise} -- Resolved after the suggestions have been updated
   */
  updateSuggestions() {
    this._suggestionsUiList.length = 0;
    this.hint = null;

    this.highlightedIndex = -1; // Forcibly select nothing
    this._showLoading();
    this.hideSuggestions = false;

    const promise = this.source({query: this.query, suggestions: this.suggestions});
    this._sourceFunctionPromise = promise;

    return promise.then((suggestions) => {
      // Bail out if the promise has changed
      if (promise !== this._sourceFunctionPromise) {
        return;
      }

      let hint;
      if (suggestions && !Array.isArray(suggestions) && typeof suggestions === 'object') {
        hint = suggestions.hint;
        suggestions = suggestions.suggestions;
      }

      this.suggestions = suggestions;

      if (hint) {
        // Hint with just the part of the hint that isn't the query
        this.hint = this.query + hint.slice(this.query.length, hint.length);
        this.fullHint = hint; // Store this for completion of the hint
      }

      this._hideLoading();

      if (this.requireMatch) {
        this.highlightNextSuggestion();
      }
    });
  }

  onInputChange() {
    if (!this.query) {
      this.hideSuggestions = true;
      this.hint = null;
    } else {
      this.updateSuggestions();
    }
  }

  onKeyDown($event) {
    const {keyCode} = $event;

    if ((isVerticalMovementKey(keyCode) || isSelectKey(keyCode)) && this.shouldShowSuggestions()) {
      $event.preventDefault();
      $event.stopPropagation();
    }

    if (!this._keyDownTimeout) {
      this._handleKeyDown($event);
    } else {
      this._keyDownTimeout = setTimeout(() => this._handleKeyDown($event), KEY_REPEAT_DELAY);
    }
  }

  onKeyUp($event) {
    clearTimeout(this._keyDownTimeout);
    this._keyDownTimeout = null;

    this._handleKeyUp($event);
  }

  _handleKeyDown(event) {
    const keyCode = event.keyCode;

    if (this.doc.activeElement === this._fieldElement) {
      this.selectionStartKeyDown = this.doc.activeElement.selectionStart;
      this.selectionEndKeyDown = this.doc.activeElement.selectionEnd;

      const inputLength = this._fieldElement.value.length;

      if (this.hint) {
        if (keyCode === KEY.RIGHT && this.selectionEndKeyDown === inputLength) {
          this.query = this.fullHint;
          this.onInputChange();
        } else if (keyCode === KEY.ESC) {
          this.hint = null;
        }
      }
    }

    if (this.shouldShowSuggestions()) {
      if (keyCode === KEY.UP) {
        this.highlightPreviousSuggestion();
      } else if (keyCode === KEY.DOWN) {
        this.highlightNextSuggestion();
      } else if (keyCode === KEY.ESC && !this.hint) { // Prioritize hiding the hint on ESC
        if (this.requireMatch) {
          this.query = '';
          this.hideSuggestions = true;
        } else if (this._highlightedItem) {
          this.highlightNone();
        } else {
          this.hideSuggestions = true;
        }
      } else if (isSelectKey(keyCode)) {
        const selection = this._suggestionsUiList[this.highlightedIndex];

        if (selection) {
          this.choose(selection.data);
        } else if (!this.multiple && !this.requireMatch) {
          this.choose(this.query);
        }
      }
    } else if (keyCode === KEY.DOWN) {
      this.updateSuggestions();
    }
  }

  _handleKeyUp({keyCode}) {
    if (this.hasChoices) {
      if (this.doc.activeElement === this._fieldElement) {
        this.selectionStartKeyUp = this.doc.activeElement.selectionStart;
        this.selectionEndKeyUp = this.doc.activeElement.selectionEnd;

        // We should now consider navigating out of the input field. We only want to trigger this
        // when we are already at the beginning or end of the field and hit Left or Right *again*.
        if (this.selectionStartKeyDown === this.selectionStartKeyUp && this.selectionEndKeyDown ===
            this.selectionEndKeyUp && !this.hint) {
          const inputLength = this._fieldElement.value.length;

          if ((keyCode === KEY.LEFT || (keyCode === KEY.BACKSPACE && !this.query)) &&
              this.selectionStartKeyUp === 0) {
            if (this.highlightedChoice) {
              this.highlightPreviousChoice();
            } else {
              this.highlightLastChoice();
            }
          } else if ((keyCode === KEY.RIGHT || keyCode === KEY.DELETE && !this.query) &&
              this.selectionStartKeyUp === inputLength) {
            if (this.highlightedChoice) {
              this.highlightNextChoice();
            } else {
              this.highlightFirstChoice();
            }
          }
        }
      } else if (this.highlightedChoice) {
        if (keyCode === KEY.LEFT) {
          this.highlightPreviousChoice();
        } else if (keyCode === KEY.RIGHT) {
          this.highlightNextChoice();
        } else if (keyCode === KEY.BACKSPACE) {
          const choice = this.highlightedChoice;
          this.highlightPreviousChoice();
          this.unchoose(choice, false);
        } else if (keyCode === KEY.DELETE) {
          const choice = this.highlightedChoice;
          this.highlightNextChoice();
          this.unchoose(choice, false);
        }
      }
    }
  }

  _showLoading() {
    this.isLoading = true;

    this._loadingTimeout = setTimeout(() => {
      this.shouldShowLoadingElement = true;
      this.$scope && this.$scope.$apply();
    }, LOADING_SCREEN_THRESHOLD);
  }

  _hideLoading() {
    clearTimeout(this._loadingTimeout);
    this._loadingTimeout = null;
    this.isLoading = false;
    this.shouldShowLoadingElement = false;
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
    this.hasChoices = !!this.multiple && Array.isArray(this._ngModel) && !!this._ngModel.length;

    if (this.requireMatch) {
      this.query = '';
    }
  }

  _scrollSuggestionIntoView() {
    // Disable highlighting while scrolling so the mouse doesn't accidentally highlight a new item
    this.isHighlightingDisabled = true;

    // Wait until next render cycle
    setTimeout(() => {
      const selectedEl = this.element.querySelector('[aria-selected]');

      if (selectedEl) {
        if (typeof selectedEl.scrollIntoView === 'function') {
          // Standard way
          selectedEl.scrollIntoView(false);
        } else if (typeof selectedEl.scrollIntoViewIfNeeded === 'function') {
          // Non-standard way (webkit-like browsers)
          selectedEl.scrollIntoViewIfNeeded();
        }
      }
    }, 0);

    setTimeout(() => {
      this.isHighlightingDisabled = false;
    }, 10);
  }
}
