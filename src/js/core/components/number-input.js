import Helper_class from './../../libs/helpers.js';

var Helper = new HelperClass();

/**
 * The purpose of using this class vs a native input[type="number"] is for custom styling and
 * to allow for gestures on mobile that makes it easier to use with a thumb on a touch screen (future implementation)
 */

(function ($) {

    const template = `
        <div class="ui_number_input">
            <input type="number">
            <button class="increase_number" tabindex="-1" title="Increase"><span class="sr_only">Increase</span></button>
            <button class="decrease_number" tabindex="-1" title="Decrease"><span class="sr_only">Decrease</span></button>
        </div>
    `;

    const onFocusNumberInput = (event) => {
        const $el = $(event.target.closest('.ui_number_input'));
        $el.trigger('focus', event);
    };

    const onBlurNumberInput = (event) => {
        const $el = $(event.target.closest('.ui_number_input'));
        $el.trigger('blur', event);
    };

    const onInputNumberInput = (event) => {
        const $el = $(event.target.closest('.ui_number_input'));
        const value = $el.data('input').value;
        
        if (value != '') {
            setValue($el, $el.data('input').value);
        }
        
        $el.trigger('input', event);
    };

    const onChangeNumberInput = (event) => {
        const $el = $(event.target.closest('.ui_number_input'));
        const {input, min} = $el.data();
        let value = input.value;
        
        if (value === '') {
            value = 0;
        }
        
        setValue($el, value);
        $el.trigger('change', event);
    };

    const onWheelNumberInput = (event) => {
        const $el = $(event.target.closest('.ui_number_input'));
        const {value, step, disabled} = $el.data();
        event.preventDefault();
        const delta = (event.originalEvent.deltaY > 0 ? -1 : (event.originalEvent.deltaY < 0 ? 1 : 0));
        
        if (!disabled && delta !== 0) {
            setValue($el, (isNaN(value) ? 0 : value) + (step * delta)); // Intentionally not using getStepAmount
            $el.trigger('input');
        }
    }

    const onTouchStartIncreaseButton = (event) => {
        const $el = $(event.target.closest('.ui_number_input'));
        const {value, buttonRepeatTimeout, buttonRepeatInterval, disabled} = $el.data();
        
        if (!disabled) {
            clearTimeout(buttonRepeatTimeout);
            clearInterval(buttonRepeatInterval);
            setValue($el, (isNaN(value) ? 0 : value) + getStepAmount($el, true));
            $el.trigger('input');
        }
    };

    const onMouseDownIncreaseButton = (event) => {
        const $el = $(event.target.closest('.ui_number_input'));
        const {value, buttonRepeatTimeout, buttonRepeatInterval, disabled} = $el.data();
        
        if (!disabled) {
            clearTimeout(buttonRepeatTimeout);
            clearInterval(buttonRepeatInterval);
            setValue($el, (isNaN(value) ? 0 : value) + getStepAmount($el, true));
            $el.trigger('input');
            $el.data('buttonRepeatTimeout', setTimeout(() => {
                $el.data('buttonRepeatInterval', setInterval(() => {
                    const {value} = $el.data();
                    setValue($el, value + getStepAmount($el, true));
                    $el.trigger('input');
                }, 50));
            }, 400));
        }
    };

    const onMouseUpIncreaseButton = (event) => {
        const $el = $(event.target.closest('.ui_number_input'));
        const {buttonRepeatTimeout, buttonRepeatInterval} = $el.data();
        clearTimeout(buttonRepeatTimeout);
        clearInterval(buttonRepeatInterval);
    };

    const onTouchStartDecreaseButton = (event) => {
        const $el = $(event.target.closest('.ui_number_input'));
        const {value, buttonRepeatTimeout, buttonRepeatInterval, disabled} = $el.data();
        
        if (!disabled) {
            clearTimeout(buttonRepeatTimeout);
            clearInterval(buttonRepeatInterval);
            setValue($el, (isNaN(value) ? 0 : value) - getStepAmount($el, false));
            $el.trigger('input');
        }
    };

    const onMouseDownDecreaseButton = (event) => {
        const $el = $(event.target.closest('.ui_number_input'));
        const {value, buttonRepeatTimeout, buttonRepeatInterval, disabled} = $el.data();
        
        if (!disabled) {
            clearTimeout(buttonRepeatTimeout);
            clearInterval(buttonRepeatInterval);
            setValue($el, (isNaN(value) ? 0 : value) - getStepAmount($el, false));
            $el.trigger('input');
            $el.data('buttonRepeatTimeout', setTimeout(() => {
                $el.data('buttonRepeatInterval', setInterval(() => {
                    const { value } = $el.data();
                    set_value($el, value - getStepAmount($el, false));
                    $el.trigger('input');
                }, 50));
            }, 400));
        }
    };

    const onMouseUpDecreaseButton = (event) => {
        const $el = $(event.target.closest('.ui_number_input'));
        const {buttonRepeatTimeout, buttonRepeatInterval} = $el.data();
        clearTimeout(buttonRepeatTimeout);
        clearInterval(buttonRepeatInterval);
    };

    const setValue = ($el, value) => {
        const {min, max, step, stepDecimalPlaces, input} = $el.data();
        
        if (typeof value === 'string') {
            value = parseFloat(value);
        }
        
        if (!isNaN(value)) {
            value = parseFloat((step * Math.round(value / step)).toFixed(stepDecimalPlaces));
            value = Math.max(min, Math.min(max, value));
            if (value + '.' !== input.value) {
                input.value = value;
            }
        } else {
            value = parseFloat(null);
            input.value = '';
        }
        
        $el.data('value', value);
    };

    const setDisabled = ($el, disabled) => {
        const {input} = $el.data();
        
        if (disabled) {
            input.setAttribute('disabled', 'disabled');
        } else {
            input.removeAttribute('disabled');
        }
        
        $el.data('disabled', disabled);
    };

    const getStepAmount = ($el, increasing) => {
        const {value, step, exponentialStepButtons} = $el.data();
        
        if (exponentialStepButtons) {
            let amount = step;
            let absValue = Math.abs((isNaN(value) ? 0 : value));
            
            if (absValue >= (increasing ? 500 : 501))
                amount = 100;
            else if (absValue >= (increasing ? 100 : 101))
                amount = 50;
            else if (absValue >= (increasing ? 10 : 11))
                amount = 10;
            else if (absValue >= (increasing ? 5 : 6))
                amount = 5;
            else
                amount = 1;
            return amount;
        } else {
            return step;
        }
    };

    $.fn.uiNumberInput = function(behavior, ...args) {
        let returnValues = [];
        for (let i = 0; i < this.length; i++) {
            let el = this[i];

            // Constructor
            if (Object.prototype.toString.call(behavior) !== '[object String]') {
                const definition = behavior || {};

                const classList = el.className;
                const id = definition.id != null ? definition.id : el.getAttribute('id');
                const min = definition.min != null ? definition.min : parseFloat(el.getAttribute('min')) || null;
                const max = definition.max != null ? definition.max : parseFloat(el.getAttribute('max')) || null;
                const step = definition.step != null ? definition.step : el.hasAttribute('step') ? parseFloat(el.getAttribute('step')) : 1;
                const exponentialStepButtons = !!definition.exponentialStepButtons;
                const disabled = definition.disabled != null ? definition.disabled : el.hasAttribute('disabled') ? true : false;
                const value = definition.value != null ? definition.value : parseFloat(el.value) || 0;
                const ariaLabeledBy = el.getAttribute('aria-labelledby');

                let $el;
                
                if (el.parentNode) {
                    $(el).after(template);
                    const oldEl = el;
                    el = el.nextElementSibling;
                    $(oldEl).remove();
                } else {
                    const orphanedParent = document.createElement('div');
                    orphanedParent.innerHTML = template;
                    el = orphanedParent.firstElementChild;
                }
                
                this[i] = el;
                $el = $(el);

                const input = $el.find('input[type="number"]')[0];
                const increaseButton = $el.find('.increase_number')[0];
                const decreaseButton = $el.find('.decrease_number')[0];

                if (classList) {
                    el.classList.add(classList);
                }
                
                if (id) {
                    el.setAttribute('id', id);
                }
                
                if (ariaLabeledBy) {
                    input.setAttribute('aria-labelledby', ariaLabeledBy);
                }
                
                if (min != null) {
                    input.setAttribute('min', min);
                }
                
                if (max != null) {
                    input.setAttribute('max', max);
                }
                
                if (Math.floor(step) === step) {
                    input.setAttribute('step', step);
                } else {
                    input.setAttribute('step', 'any');
                }

                let stepDecimalPlaces = 0;
                
                if ((step % 1) != 0) 
                    stepDecimalPlaces = step.toString().split(".")[1].length;  

                $el.data({
                    id,
                    input,
                    increaseButton,
                    decreaseButton,
                    buttonRepeatTimeout: undefined,
                    buttonRepeatInterval: undefined,
                    value,
                    min,
                    max,
                    step,
                    stepDecimalPlaces,
                    exponentialStepButtons
                });

                $(input)
                    .on('focus', onFocusNumberInput)
                    .on('blur', onBlurNumberInput)
                    .on('input', onInputNumberInput)
                    .on('change', onChangeNumberInput)
                    .on('wheel', onWheelNumberInput);
                $(increaseButton)
                    .on('touchstart', onTouchStartIncreaseButton)
                    .on('mousedown', onMouseDownIncreaseButton)
                    .on('mouseup mouseleave touchend', onMouseUpIncreaseButton);
                $(decreaseButton)
                    .on('touchstart', onTouchStartDecreaseButton)
                    .on('mousedown', onMouseDownDecreaseButton)
                    .on('mouseup mouseleave', onMouseUpDecreaseButton);
                
                setValue($el, value);
                setDisabled($el, disabled);
            }
            // Behaviors
            else if (behavior === 'set_value') {
                const newValue = parseFloat(args[0]);
                const $el = $(el);
                if ($el.data('value') !== newValue) {
                    setValue($(el), newValue);
                }
            }
            else if (behavior === 'getValue') {
                returnValues.push($(el).data('value'));
            }
            else if (behavior === 'getID') {
                returnValues.push($(el).data('id'));
            }
            else if (behavior === 'setDisabled') {
                const newValue = !!args[0];
                setDisabled($(el), newValue);
            }
            else if (behavior === 'getDisabled') {
                returnValues.push($(el).data('disabled'));
            }
        }
        if (returnValues.length > 0) {
            return returnValues.length === 1 ? returnValues[0] : returnValues;
        } else {
            return this;
        }
    };

})(jQuery);
