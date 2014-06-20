if (!window.jQuery) {
    throw 'jQuery must be loaded before using the JS Timer!';
}

// TODO startTimer
// TODO stopTimer
// TODO resetTimer

function JsTimer($) {
    var me = {
        /**
        * tpl
        *
        * HTML fragment representing the timer interface
        */
        tpl: ''.concat(
            '<div class="js-timer">',
            	'<div class="display">',
            		'<span class="hours"></span>:',
            		'<span class="minutes"></span>:',
            		'<span class="seconds"></span>',
            	'</div>',
                '<div class="buttons">',
                    '<button id="btn-start">Start</button>',
                    '<button id="btn-stop">Stop</button>',
                    '<button id="btn-reset">Reset</button>',
                    '<button id="btn-set">Set to:</button>',
                    '<input type="text" placeholder="Enter time in minutes" name="time" id="time" />',
                '</div>',
            '</div>'
        ),

        /**
        * dom
        *
        * Holds reference to the interface's jQuery object
        */
        dom: null,


        /**
        * init
        * 
        * Initializes plugin interface
        */
        init: function init() {
            this.setZero();
            // set button handlers
            this.dom.find('#btn-set').click(this.setTime);
        },

        /**
         * setZero 
         */
        setZero: function setZero() {
            this.dom.find('.display .hours').html('00');
            this.dom.find('.display .minutes').html('00');
            this.dom.find('.display .seconds').html('00');
        },

        setTime: function setTime(e) {
            var timeBox, time, parsedTime;
            timeBox = me.dom.find('#time');
            if (!timeBox) {
                throw 'time box not found!';
            }
            time = timeBox.val();
            if (time === '') {
                throw 'Please enter time in seconds';
            }
            if (!me.isIntegerish(time)) {
                throw 'Please enter number of seconds (integer)';
            }
            parsedTime = me.parseSeconds(parseInt(time, 10));
            me.setDisplayTo(parsedTime);
        },

        setDisplayTo: function setDisplayTo(time) {
            me.dom.find('.display .hours').html(me.pad(time.hours, 2));
            me.dom.find('.display .minutes').html(me.pad(time.minutes, 2));
            me.dom.find('.display .seconds').html(me.pad(time.seconds, 2));
        },

        isInteger: function isInteger(x) {
            return Math.round(x) === x;
        },

        isIntegerish: function isIntegerishish(x) {
            return x == parseInt(x, 10);
        },

        pad: function pad(n, width, z) {
            z = z || '0';
            n = n + '';
            return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
        },

        /**
         * parseSeconds 
         *
         * Parses passed seconds into an object of hours, minutes, seconds.
         *
         * @param {int} s
         * @return {object}
         */
        parseSeconds: function parseSeconds(s) {
            var result = {
                hours: 0,
                minutes: 0,
                seconds: 0
            };
            result.hours = Math.floor(s / 3600);
            result.minutes = Math.floor((s - (3600 * result.hours)) / 60);
            result.seconds = parseInt(s - (3600 * result.hours) - (60 * result.minutes), 10);
            return result;
        }
    };

    var api = {
        /**
            * render
            *
            * Renders the timer into the passed DOM (or into body if no DOM was passed)
            *
            * @param {dom} dom
            */
        render: function render(dom) {
            if (!dom) {
                dom = $('body');
            } else {
                dom = $(dom);
            }
            dom.append(me.tpl);
            me.dom = dom;
            me.init();
        }
    };
    return api;
}
