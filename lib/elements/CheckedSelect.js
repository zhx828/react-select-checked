import React from 'react';
import PropTypes from 'prop-types'
import createClass from 'create-react-class';
import Select from "react-select";
import classNames from 'classnames';
import CheckedOption from './CheckedOption';
import CheckedValue from './CheckedValue';
import OptionTools from './OptionTools';
import stripDiacritics from './stripDiacritics';

import 'react-select/dist/react-select.css';

const CheckedSelect = createClass({
    displayName: 'MultiSelectField',

    getInitialState () {
        return {
            disabled: false,
            crazy: false,
            stayOpen: false,
            value: [],
        };
    },

    markSelectedOptions (options, filterValue, currentValue) {

        if (this.props.ignoreAccents) {
            filterValue = stripDiacritics(filterValue);
        }

        if (this.props.ignoreCase) {
            filterValue = filterValue.toLowerCase();
        }

        if (currentValue) currentValue = currentValue.map(i => i[this.props.valueKey]);

        this._visibleOptions = options.filter(option => {

            // mark as selected when options are selected
            if (currentValue && currentValue.indexOf(option[this.props.valueKey]) > -1) {
                option.isSelected = true;
            }

            if (!filterValue) return true;
            let valueTest = String(option[this.props.valueKey]);
            let labelTest = String(option[this.props.labelKey]);
            if (this.props.ignoreAccents) {
                if (this.props.matchProp !== 'label') valueTest = stripDiacritics(valueTest);
                if (this.props.matchProp !== 'value') labelTest = stripDiacritics(labelTest);
            }
            if (this.props.ignoreCase) {
                if (this.props.matchProp !== 'label') valueTest = valueTest.toLowerCase();
                if (this.props.matchProp !== 'value') labelTest = labelTest.toLowerCase();
            }
            return this.props.matchPos === 'start' ? (
                (this.props.matchProp !== 'label' && valueTest.substr(0, filterValue.length) === filterValue) ||
                (this.props.matchProp !== 'value' && labelTest.substr(0, filterValue.length) === filterValue)
            ) : (
                (this.props.matchProp !== 'label' && valueTest.indexOf(filterValue) >= 0) ||
                (this.props.matchProp !== 'value' && labelTest.indexOf(filterValue) >= 0)
            );
        });
        return this._visibleOptions;
    },

    toggleSelection (value) {

        // get last item selected
        let lastItem = value[value.length - 1];

        // check if current state value already contain new item
        let foundDuplicate = this.state.value.find(elem => {
            return elem.value === lastItem.value;
        });

        // remove item if it exists
        if (foundDuplicate) {
            value = this.state.value.filter( val => {
                return foundDuplicate.value !== val.value;
            });

            // remove isSelected marker on the option
            this.props.options.map( option => {
                if (foundDuplicate.value === option.value) {
                    option.isSelected = false;
                }
                return option;
            });
        }

        if (this.props.onChange) {
            this.props.onChange(value);
        }
        this.setState({ value });
    },

    renderClearButton () {
        return null;
    },

    clearIsSelectedFlags() {
        this.props.options.map( option => {
            option.isSelected = false;
            return option;
        });
    },

    getResetValue () {
        if (this.props.resetValue !== undefined) {
            return this.props.resetValue;
        } else if (this.props.multi) {
            return [];
        } else {
            return null;
        }
    },

    setValue (value) {
        if (this.props.autoBlur) {
            this.blurInput();
        }
        if (this.props.required) {
            const required = this.handleRequired(value, this.props.multi);
            this.setState({ required });
        }
        if (this.props.onChange) {
            if (this.props.simpleValue && value) {
                value = this.props.multi ?
                    value.map(i => i[this.props.valueKey]).join(this.props.delimiter) : value[this.props.valueKey];
            }
            this.props.onChange(value);
        }
    },

    handleAddAll () {
        this._visibleOptions.forEach( visibleOption => {
            this.props.options.map( option => {
                if ( option.value === visibleOption.value ) {
                    option.isSelected = true;
                }
            });
        });
        this.setValue(this._visibleOptions);
        this.setState({ value:this._visibleOptions });
    },

    handleClearAll () {
        this.setValue(this.getResetValue());
        this.clearIsSelectedFlags();
        this.setState({ value:[] });
    },

    renderMenu (params) {
        return params.options.map((option, i) => {
            let isSelected = params.valueArray && params.valueArray.indexOf(option) > -1;
            let isFocused = option === params.focusedOption;
            let optionClass = classNames(params.optionClassName, {
                'Select-option': true,
                'is-selected': isSelected,
                'is-focused': isFocused,
                'is-disabled': option.disabled,
            });
            if (i === 0 ) {
                return (
                    <div key={`option-${i}-${option[params.valueKey]}`}>
                        <OptionTools
                            onAddAll={this.handleAddAll}
                            onClearAll={this.handleClearAll}
                        />
                        <CheckedOption
                            className={optionClass}
                            option={option}
                            onFocus={params.onFocus}
                            onSelect={params.onSelect}
                            key={`option-${i}-${option[params.valueKey]}`}
                            children={params.children}
                        />
                    </div>
                );
            }
            return (
                <div key={`option-${i}-${option[params.valueKey]}`}>
                    <CheckedOption
                        className={optionClass}
                        option={option}
                        onFocus={params.onFocus}
                        onSelect={params.onSelect}
                        children={params.children}
                    />
                </div>
            );
        });
    },

    render() {
        const { value } = this.state;
        return (
            <div className="section">
                <h3 className="section-heading">{this.props.label}</h3>
                <Select
                    clearRenderer={this.renderClearButton}
                    closeOnSelect={false}
                    disabled={this.props.disabled}
                    multi
                    onChange={this.toggleSelection}
                    menuRenderer={this.renderMenu}
                    optionComponent={CheckedOption}
                    options={this.props.options}
                    valueComponent={CheckedValue}
                    filterOptions={this.markSelectedOptions}
                    placeholder="Select your favourite(s)"
                    value={value}
                />
            </div>
        );
    }
});

CheckedSelect.propTypes = {
    disabled: PropTypes.bool,
    label: PropTypes.string,
    onChange: PropTypes.func,
    options: PropTypes.array,
};

CheckedSelect.defaultProps = {
    ignoreAccents: true,
    ignoreCase: true,
    matchPos: 'any',
    matchProp: 'any',
    valueKey: 'value',
    options: [],
    disabled: false,
};


module.exports = CheckedSelect;