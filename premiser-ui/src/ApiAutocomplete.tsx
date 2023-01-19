import throttle from "lodash/throttle";
import map from "lodash/map";
import { denormalize } from "normalizr";
import React, { ChangeEvent, Component } from "react";
import { Autocomplete, AutocompleteProps } from "react-md";
import { connect, ConnectedProps } from "react-redux";

import { logger, toSingleLine } from "howdju-common";

import autocompleter from "./autocompleter";
import { ESCAPE_KEY_CODE, Keys } from "./keyCodes";
import {
  autocompletes,
  mapActionCreatorGroupToDispatchToProps,
} from "./actions";
import { DebouncedFunc } from "lodash";
import {
  ComponentId,
  OnBlurCallback,
  OnEventCallback,
  OnKeyDownCallback,
  OnPropertyChangeCallback,
  PropertyChanges,
  SuggestionsKey,
} from "./types";
import { RootState } from "./setupStore";

const dataLabel = "data-label";
const dataValue = "data-value";

const hasFocus = (el: HTMLInputElement) => window.document.activeElement === el;

// TODO(1): remove use of any, convert to functional component?

export interface ApiAutocompleteProps {
  /** An ID for the DOM element */
  id?: ComponentId;
  /** The type of the text input */
  type?: "text" | "search";
  name: string;
  /** ms to throttle autocomplete refresh by */
  autocompleteThrottle?: number;
  /**
   * If the result of suggestionTransform is an object, this property is
   * required and tells the autocomplete which property of the object is the
   * label
   */
  dataLabel?: string;
  /** Optional name of property to extract from the suggestion to use as a react key */
  dataValue?: string;
  /** If true, pressing escape when the suggestions are already hidden will clear the field */
  escapeClears?: boolean;
  /** A dispatch-wrapped actionCreator to update the suggestions. */
  // TODO(1): should we useDispatch in this component, and instead accept just the action creator? I think it
  // would remove boilerplate from users.
  fetchSuggestions: (value: string, suggestionsKey: SuggestionsKey) => void;
  /** A dispatch-wrapped actionCreator to cancel updating the suggestions */
  cancelSuggestions: (suggestionsKey: SuggestionsKey) => void;
  /** Where to store the component's suggestions in the react state (under state.autocompletes.suggestions) */
  suggestionsKey: string;
  onBlur?: OnBlurCallback;
  /** The callback for when a user modifies the value in the text input.  Arguments: (val, event) */
  onPropertyChange?: OnPropertyChangeCallback;
  /** The callback for when the user selects a suggestion.  Called with the suggested value. */
  onAutocomplete: (suggestion: any) => void;
  /** An optional function for transforming the stored suggestions.  Called
   * with item to transform.  Provides flexibility when the results from
   * the API don't match the form required for the Autocomplete
   */
  suggestionTransform?: (suggestion: any) => any;
  /** The value to display in the text input */
  value: string;
  onKeyDown?: OnKeyDownCallback;
  /** If true, will try to keep autocomplete closed */
  forcedClosed?: boolean;
  focusInputOnAutocomplete?: boolean;
  /** The schema which the component uses to denormalize suggestions */
  suggestionSchema: any;
  /**
   * If present, pressing enter will trigger this function instead of default browser behavior.
   *
   * ApiAutocomplete supports an input behavior with multiline display but single-line values.
   * So it wraps long text, but when the user preses Enter, it will prevent a newline. The only way
   * to keep the newline out of the input is to preventDefault on Enter presses.
   */
  onSubmit?: OnEventCallback;
  /** If true, enforces no line breaks even if the input has multiple rows. */
  singleLine?: boolean;
  /**
   * The initial number of rows of text to show.
   *
   * If present, the input will be a textarea rather than a text input.
   */
  rows?: number;
  /**
   * The maximum number of rows of text to show.
   *
   * If present, the input will be a textarea rather than a text input.
   */
  maxRows?: number;

  /** These props are part of ApiAutocompleteProps, but Typescript requies us to redefine them for
   * some reason. */

  /** Label that appears in the input initially, and then moves about when focused. */
  label?: React.ReactNode;
  inputClassName?: string;
  maxLength?: number;
  className?: string;
  rightIcon?: JSX.Element;
  rightIconStateful?: boolean;
  /** Placeholder text that disappears after typing */
  placeholder?: string;
}

interface Props
  extends ApiAutocompleteProps,
    Omit<
      AutocompleteProps,
      "id" | "data" | "onBlur" | "value" | "onAutocomplete"
    >,
    PropsFromRedux {}

/**
 * Autocomplete that knows how to request suggestions from an API.
 *
 * Calls onAutocomplete with the result.
 *
 * This component also has behavior relating to line display and submitting.
 * TODO: factor out the line and submit behavior into SingleLineTextField and reuse it here, if
 * possible. It may not be possible if react-md has tightly coupled the input and the autocomplete behavior.
 *
 * The props affecting this behavior are:
 *
 * - singleLine: if truthy, will remove newlines from the value
 * - rows/maxRows: if either are present, react-md will render a textarea, othertwise a text input.
 *   This is significant for form submission, because pressing enter in a text input will trigger a
 *   form's onSubmit while in a textarea it will insert a newline.
 * - onSubmit: if present, pressing enter will call this instead of the default behavior.
 *
 * See the constructor warning for potential misconfiguration.
 */
class ApiAutocomplete extends Component<Props> {
  public static defaultProps = {
    autocompleteThrottle: 250,
    escapeClears: false,
    singleLine: false,
    focusInputOnAutocomplete: false,
  };

  throttledRefreshAutocomplete: DebouncedFunc<(value: any) => void>;
  autocomplete: any;

  constructor(props: Props) {
    super(props);
    this.throttledRefreshAutocomplete = throttle(() => {
      return;
    });
    const { singleLine, rows, maxRows, onSubmit } = this.props;
    if (!singleLine && (rows || maxRows) && onSubmit) {
      logger.warn(
        "Multiline ApiAutocomplete will not enforce single-line value. " +
          "So users can copy-paste newlines but not type them by pressing Enter." +
          "Did you mean to pass singleLine=true?"
      );
    }
  }

  componentDidMount() {
    this.throttledRefreshAutocomplete = throttle(
      this.refreshAutocomplete.bind(this),
      this.props.autocompleteThrottle
    );
  }

  componentDidUpdate(prevProps: Props) {
    autocompleter.fixOpen(
      this.autocomplete,
      this.props.value,
      this.props.transformedSuggestions
    );
    if (prevProps.forcedClosed) {
      this.closeAutocomplete();
    }
    if (prevProps.autocompleteThrottle !== this.props.autocompleteThrottle) {
      this.throttledRefreshAutocomplete = throttle(
        this.refreshAutocomplete.bind(this),
        this.props.autocompleteThrottle
      );
    }
  }

  onChange = (val: any, event: React.FormEvent<HTMLFormElement>) => {
    // TODO(17): I think .name is present at runtime, but FormEvent<HTMLFormElement> doesn't have it.
    const name = (event as unknown as ChangeEvent<HTMLInputElement>).target
      .name;
    if (this.props.singleLine) {
      val = toSingleLine(val);
    }
    this.onPropertyChange({ [name]: val });
  };

  onPropertyChange = (properties: PropertyChanges) => {
    if (this.props.onPropertyChange) {
      this.props.onPropertyChange(properties);
    }
    const val = properties[this.props.name];
    if (val) {
      this.throttledRefreshAutocomplete(val);
    } else {
      this.throttledRefreshAutocomplete.cancel();
      this.clearSuggestions();
    }
  };

  onKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (this.props.onKeyDown) {
      this.props.onKeyDown(event);
      if (event.defaultPrevented) {
        return;
      }
    }

    if (event.keyCode === ESCAPE_KEY_CODE) {
      this.throttledRefreshAutocomplete.cancel();
      if (this.isAutocompleteOpen()) {
        event.preventDefault();
        event.stopPropagation();
        this.closeAutocomplete();
        return;
      } else if (this.props.value && this.props.escapeClears) {
        event.preventDefault();
        event.stopPropagation();
        this.onPropertyChange({ [this.props.name]: "" });
        return;
      }
    } else if (event.key === Keys.ENTER) {
      this.closeAutocomplete();
      if (this.props.singleLine) {
        event.preventDefault();
      }
      if (this.props.onSubmit) {
        event.preventDefault();
        this.props.onSubmit(event);
      }
    }
  };

  onTouchEnd = () => {
    // Mobile devices need some way to hide the autocomplete, since they lack escape button or the screen space to click around
    // (Sometimes the touchend fires a click and sometimes it doesn't, so handle touch explicitly)
    this.closeAutocomplete();
  };

  isAutocompleteOpen = () => {
    return this.autocomplete.state.visible;
  };

  closeAutocomplete = () => {
    // Note that autocomplete._close fires a blur event. So if our logic in calling it here is off,
    // then we will be triggering blur and therefor our error properties at the wrong time.
    this.autocomplete._close();
  };

  refreshAutocomplete = (value: string) => {
    this.props.fetchSuggestions(value, this.props.suggestionsKey);
  };

  onAutocomplete = (
    _label: any,
    index: number,
    _transformedSuggestions: any[]
  ) => {
    if (this.props.onAutocomplete) {
      const suggestion = this.props.suggestions?.[index];
      this.props.onAutocomplete(suggestion);
    }
  };

  onMenuOpen = () => {
    // react-md is opening the autocomplete when it doesn't have focus
    if (!hasFocus(this.autocomplete._field)) {
      this.closeAutocomplete();
    }
    if (this.props.forcedClosed) {
      this.closeAutocomplete();
    }
  };

  onBlur = () => {
    if (this.props.onBlur) {
      this.props.onBlur(this.props.name);
    }
    this.throttledRefreshAutocomplete.cancel();
    if (this.props.cancelSuggestions) {
      this.props.cancelSuggestions(this.props.suggestionsKey);
    }
    if (this.props.suggestions && this.props.suggestions.length > 0) {
      this.clearSuggestions();
    }
  };

  clearSuggestions = () => {
    this.props.autocompletes?.clearSuggestions(this.props.suggestionsKey);
  };

  setAutocomplete = (autocomplete: any) => (this.autocomplete = autocomplete);

  render() {
    const {
      value,
      transformedSuggestions,
      focusInputOnAutocomplete,
      // ignore
      autocompletes,
      autocompleteThrottle,
      dispatch,
      escapeClears,
      fetchSuggestions,
      cancelSuggestions,
      suggestions,
      suggestionsKey,
      suggestionTransform,
      onPropertyChange,
      forcedClosed,
      suggestionSchema,
      onSubmit,
      singleLine,
      ...rest
    } = this.props;
    return (
      <Autocomplete
        {...rest}
        value={value}
        dataLabel={dataLabel}
        dataValue={dataValue}
        onChange={this.onChange}
        onKeyDown={this.onKeyDown}
        onAutocomplete={this.onAutocomplete}
        onMenuOpen={this.onMenuOpen}
        onBlur={this.onBlur}
        onTouchEnd={this.onTouchEnd}
        data={transformedSuggestions}
        filter={null}
        ref={this.setAutocomplete}
        focusInputOnAutocomplete={focusInputOnAutocomplete}
      />
    );
  }
}

// Pluck the properties from the model and give them names appropriate to a DOM element;
// react-md will put all its members as attributes on the element
const defaultSuggestionTransform = (props: any) => (model: any) => ({
  [dataLabel]: model[props.dataLabel],
  [dataValue]: model[props.dataValue],
});

const mapStateToProps = (state: RootState, ownProps: ApiAutocompleteProps) => {
  const normalized = (state.autocompletes.suggestions as any)[
    ownProps.suggestionsKey
  ];
  const suggestions =
    denormalize(normalized, [ownProps.suggestionSchema], state.entities) || [];
  const transformedSuggestions = ownProps.suggestionTransform
    ? map(suggestions, ownProps.suggestionTransform).map(
        defaultSuggestionTransform(ownProps)
      )
    : map(suggestions, defaultSuggestionTransform(ownProps));

  return {
    suggestions,
    transformedSuggestions,
  };
};

const connector = connect(
  mapStateToProps,
  mapActionCreatorGroupToDispatchToProps({
    autocompletes,
  })
);

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(ApiAutocomplete as any);
