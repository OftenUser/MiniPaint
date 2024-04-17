import HelperClass from './../../libs/helpers.js';

var Helper = new HelperClass();

(function ($) {

    const template = `
        <div class="ui_color_picker_gradient">
            <div class="secondary_pick" tabindex="0" role="figure" aria-label="Saturation vs. value selection. Use left/right arrow keys to control saturation. Use up/down arrow keys to control value.">
                <div class="saturation_gradient"></div>
                <div class="value_gradient"></div>
                <div class="handle"></div>
            </div>
            <div class="primary_pick">
                <input aria-label="Hue" type="range" min="0" max="360" step="1" class="color_picker_thin" />
            </div>
        </div>
    `;

    const onKeyDownSecondaryPick = (event) => {
        const $el = $(event.target.closest('.ui_color_picker_gradient'));
        const {hsv} = $el.data();
        const key = event.key;
        
        if (['Left', 'ArrowLeft'].includes(key)) {
            event.preventDefault();
            setHSV($el, {
                h: hsv.h,
                s: hsv.s - 1/100,
                v: hsv.v
            });
            $el.trigger('input');
        } else if (['Right', 'ArrowRight'].includes(key)) {
            event.preventDefault();
            setHSV($el, {
                h: hsv.h,
                s: hsv.s + 1/100,
                v: hsv.v
            });
            $el.trigger('input');
        } else if (['Up', 'ArrowUp'].includes(key)) {
            event.preventDefault();
            setHSV($el, {
                h: hsv.h,
                s: hsv.s,
                v: hsv.v + 1/100
            });
            $el.trigger('input');
        } else if (['Down', 'ArrowDown'].includes(key)) {
            event.preventDefault();
            setHSV($el, {
                h: hsv.h,
                s: hsv.s,
                v: hsv.v - 1/100
            });
            $el.trigger('input');
        }
    };

    const onMouseDownSecondaryPick = (event) => {
        event.preventDefault();
        const $el = $(event.target.closest('.ui_color_picker_gradient'));
        const {secondaryPick, secondaryPickHandle, hsv} = $el.data();
        const clientX = event.touches && event.touches.length > 0 ? event.touches[0].clientX : event.clientX;
        const clientY = event.touches && event.touches.length > 0 ? event.touches[0].clientY : event.clientY;
        const mouseDownSecondaryPickRect = secondaryPick.getBoundingClientRect();

        const xRatio = (clientX - mouseDownSecondaryPickRect.left) / (mouseDownSecondaryPickRect.right - mouseDownSecondaryPickRect.left);
        const yRatio = (clientY - mouseDownSecondaryPickRect.top) / (mouseDownSecondaryPickRect.bottom - mouseDownSecondaryPickRect.top);

        setHSV($el, {
            h: hsv.h,
            s: xRatio,
            v: 1 - yRatio
        });
        
        $el.trigger('input');

        $el.data({
            mouseDownSecondaryPickRect,
            mouseMoveWindowHandler: generateOnMouseMoveWindow($el),
            mouseUpWindowHandler: generateOnMouseUpWindow($el)
        });

        const $window = $(window);
        $window.on('mousemove touchmove', $el.data('mouseMoveWindowHandler'));
        $window.on('mouseup touchend', $el.data('mouseUpWindowHandler'));
    };

    const onTouchMoveSecondaryPick = (event) => {
        event.preventDefault();
    };

    const generateOnMouseMoveWindow = ($el) => {
        return (event) => {
            const {hsv, mouseDownSecondaryPickRect} = $el.data();
            const clientX = event.touches && event.touches.length > 0 ? event.touches[0].clientX : event.clientX;
            const clientY = event.touches && event.touches.length > 0 ? event.touches[0].clientY : event.clientY;
            const xRatio = (clientX - mouseDownSecondaryPickRect.left) / (mouseDownSecondaryPickRect.right - mouseDownSecondaryPickRect.left);
            const yRatio = (clientY - mouseDownSecondaryPickRect.top) / (mouseDownSecondaryPickRect.bottom - mouseDownSecondaryPickRect.top);
            setHSV($el, {
                h: hsv.h,
                s: xRatio,
                v: 1 - yRatio
            });
            $el.trigger('input');
        };
    };

    const generateOnMouseUpWindow = ($el) => {
        return (event) => {
            const $window = $(window);
            $window.off('mousemove touchmove', $el.data('mouseMoveWindowHandler'));
            $window.off('mouseup touchend', $el.data('mouseUpWindowHandler'));
        };
    };

    // All hsv values range from 0 to 1.
    const setHSV = ($el, hsv) => {
        const {secondaryPick, secondaryPickHandle, primaryRange} = $el.data();
        hsv.h  = Math.max(0, Math.min(1, hsv.h));
        hsv.s = Math.max(0, Math.min(1, hsv.s));
        hsv.v = Math.max(0, Math.min(1, hsv.v));
        $el.data('hsv', hsv);
        $(primaryRange).uiRange('set_value', (1 - hsv.h) * 360);
        secondaryPick.style.background = Helper.hsvToHex(hsv.h, 1, 1);
        secondaryPickHandle.style.left = ((hsv.s) * 100) + '%';
        secondaryPickHandle.style.top = ((1 - hsv.v) * 100) + '%';
    };

    $.fn.uiColorPickerGradient = function(behavior, ...args) {
        let returnValues = [];
        
        for (let i = 0; i < this.length; i++) {
            let el = this[i];

            // Constructor
            if (Object.prototype.toString.call(behavior) !== '[object String]') {
                const definition = behavior || {};

                const id = definition.id != null ? definition.id : el.getAttribute('id'); 
                const label = definition.label != null ? definition.label : el.getAttribute('aria-label');
                const hsv = definition.hsv || { h: 0, s: 0, v: 0 };

                $(el).after(template);
                const oldEl = el;
                el = el.nextElementSibling;
                $(oldEl).remove();
                this[i] = el;

                if (id) {
                    el.setAttribute('id', id);
                }
                
                if (label) {
                    el.setAttribute('aria-label', label);
                }

                const $el = $(el);

                const $primaryRange = $($el.find('.primary_pick input').get(0));
                $primaryRange
                    .uiRange({ vertical: true })
                    .uiRange('set_background', 'linear-gradient(to bottom, #FF0000 0%, #FFFF00 17%, #00FF00 33%, #00FFFF 50%, #0000FF 67%, #FF00FF 83%, #FF0000 100%)')
                    .on('input', () => {
                        const {hsv} = $el.data();
                        set_hsv($el, {
                            h: 1 - ($primaryRange.uiRange('get_value') / 360),
                            s: hsv.s,
                            v: hsv.v
                        });
                        $el.trigger('input');
                    });

                $el.find('> input').uiRange();

                const secondaryPick = $el.find('.secondary_pick')[0];

                $el.data({
                    primaryRange: $primaryRange[0],
                    secondaryPick,
                    secondaryPickHandle: $el.find('.secondary_pick .handle')[0],
                    hsv
                });

                setHSV($el, hsv);

                $(secondaryPick).on('keydown', onKeyDownSecondaryPick);
                $(secondaryPick).on('mousedown touchstart', onMouseDownSecondaryPick);
                $(secondaryPick).on('touchmove', onTouchMoveSecondaryPick);
            }
            // Behaviors
            else if (behavior === 'set_hsv') {
                const $el = $(el);
                const hsv = $el.data('hsv');
                const newHsv = args[0];
                
                if (newHsv && (hsv.h !== newHsv.h || hsv.s !== newHsv.s || hsv.v !== newHsv.v)) {
                    setHSV($(el), newHsv);
                }
            } else if (behavior === 'get_hsv') {
                const hsv = $(el).data('hsv');
                returnValues.push(JSON.parse(JSON.stringify(hsv)));
            }
        }
        
        if (returnValues.length > 0) {
            return returnValues.length === 1 ? returnValues[0] : returnValues;
        } else {
            return this;
        }
    };

})(jQuery);
