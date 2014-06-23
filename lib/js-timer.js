if (!window.jQuery) {
    throw 'jQuery must be loaded before using the JS Timer!';
}

function JsTimer($) {
    var me = {
        /**
        * tpl
        *
        * HTML fragment representing the timer interface
        */
        tpl: ''.concat(
            '<div class="js-timer">',
              '<div id="display">',
                '<span class="hours"></span>:',
                '<span class="minutes"></span>:',
                '<span class="seconds"></span>',
              '</div>',
                '<div class="buttons">',
                    '<button id="btn-start" disabled="disabled"><span class="shortcut">S</span>tart</button>',
                    '<button id="btn-stop" disabled="disabled">Sto<span class="shortcut">p</span></button>',
                    '<button id="btn-reset">Reset</button>',
                    '<div class="btn-set-wrapper">',
                    '<button id="btn-set">Set to:</button>',
                    '<input type="text" placeholder="Enter time in minutes" name="time" id="timer-value" accesskey="r" />',
                    '</div>',
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
         * initialTimerSeconds
         *
         * The initial timer value in seconds.
         */
        initialTimerSeconds: 0,

        /**
         * currentTimerSeconds
         *
         * The initial timer value in the current timer run. Is changed every time the stop button is clicked.
         */
        currentTimerSeconds: 0,

        /**
         * startTimestamp 
         *
         * Holds the timestamp of when the timer started. This is a value in milliseconds.
         */
        startTimestamp: null,
        
        /**
         * intervalId
         *
         * Holds the unique interval ID of action used for updating the timer display.
         */
        intervalId: null,


        /**
        * init
        * 
        * Initializes plugin interface
        */
        init: function init() {
            this.setZero();
            // set button handlers
            this.dom.find('#btn-set').click(this.setTimer);
            this.dom.find('#timer-value').keydown(this.onKeydownTimerValue);
            this.dom.find('#timer-value').keydown(this.onKeydownTimerValue);
            this.dom.find('#btn-start').click(this.startTimer);
            this.dom.find('#btn-stop').click(this.stopTimer);
            this.dom.find('#btn-reset').click(this.resetTimer);
            $(document).keydown(this.onGlobalKeydown);
        },

        /**
         *  onKeydownTimerValue
         *
         *  Handler for ENTER key pressed.
         */
        onKeydownTimerValue: function onKeydownTimerValue(e) {
            if (e.keyCode !== 13) {
                return;
            }
            me.setTimer();
        },

        /**
         * onGlobalKeydown 
         */
        onGlobalKeydown: function         onGlobalKeydown(e) {
            switch (e.keyCode) {
                case 83:
                    // ALT+S
                    if (e.altKey) {
                        me.startTimer();
                    }
                    break;

                case 80:
                    // ALT+P
                    if (e.altKey) {
                        me.stopTimer();
                    }
                    break;

                case 32:
                    // ENTER
                    me.toggleTimer();
                    break;

                default:
                    break;
            }
            return;
        },

        /**
         * setZero 
         */
        setZero: function setZero() {
            this.dom.find('#display .hours').html('00');
            this.dom.find('#display .minutes').html('00');
            this.dom.find('#display .seconds').html('00');
        },

        enableStartBtn: function enableStartBtn() {
            me.dom.find('#btn-start').prop('disabled', false);
        },

        disableStartBtn: function disableStartBtn() {
            me.dom.find('#btn-start').prop('disabled', true);
        },

        enableStopBtn: function enableStopBtn() {
            me.dom.find('#btn-stop').prop('disabled', false);
        },

        disableStopBtn: function disableStopBtn() {
            me.dom.find('#btn-stop').prop('disabled', true);
        },

        /**
         * setTimer
         *
         * Handler for onclick event on the Set button.
         */
        setTimer: function setTimer(e) {
            var timeBox, time, parsedTime, seconds, matches;
            timeBox = me.dom.find('#timer-value');
            if (!timeBox) {
                throw 'time box not found!';
            }
            time = timeBox.val();
            if (time === '') {
                alert('Please enter time');
                return;
            }
            if (me.isIntegerish(time)) {
                seconds = parseInt(time, 10);
            } else {
                matches = time.match(/^([0-9]+)(s|m|h|d)$/);
                if (!matches) {
                    matches = time.match(/^([0-9]+):([0-5][0-9]):([0-5][0-9])$/);
                }
                if (!matches) {
                    alert("Invalid time was specified! \nEnter number of seconds, hh:mm:ss, or \"2m\" for two minutes, or \"3h\" for 3 hours, or \"4d\" for four days.");
                    return;
                }
                switch (matches[2]) {
                    case 's':
                        seconds = matches[1];
                        break;

                    case 'm':
                        seconds = parseInt(matches[1], 10) * 60;
                        break;
                    
                    case 'h':
                        seconds = parseInt(matches[1], 10) * 3600;
                        break;
                    
                    case 'd':
                        seconds = parseInt(matches[1], 10) * 3600 * 24;
                        break;
                    
                    default:
                        // time in format hh:mm:ss
                        seconds = (parseInt(matches[1], 10) * 3600) + (parseInt(matches[2], 10) * 60) + parseInt(matches[3], 10);
                }
            }
            parsedTime = me.parseSeconds(seconds);
            if (seconds < 0) {
                alert('Time cannot be negative');
                return;
            }
            me.setDisplayTo(parsedTime);
            me.initialTimerSeconds = me.currentTimerSeconds = seconds;
            me.enableStartBtn();
        },

        /**
         * startTimer
         *
         * Starts the countdown
         */
        startTimer: function startTimer() {
            if (!me.isInteger(me.currentTimerSeconds) || me.currentTimerSeconds < 0) {
                throw 'Cannot start timer because it has not been set yet.';
            }
            me.startTimestamp = (new Date()).getTime();
            me.intervalId = setInterval(me.updateTimer, 100);
            me.enableStopBtn();
        },

        /**
         * stopTimer
         *
         * Stops the timer.
         */
        stopTimer: function stopTimer() {
            var diff;
            clearInterval(me.intervalId);
            me.intervalId = null;
            diff = (new Date()).getTime() - me.startTimestamp;
            me.currentTimerSeconds = parseInt(me.currentTimerSeconds - (diff/1000), 10);
            me.disableStopBtn();
        },

        /**
         * toggleTimer 
         *
         * Starts or stops the timer if it is stopped or started.
         */
        toggleTimer: function toggleTimer() {
            if (me.intervalId === null) {
                me.startTimer();
            } else {
                me.stopTimer();
            }
        },

        /**
         * resetTimer 
         *
         * Stops the timer and resets it to the starting value.
         */
        resetTimer: function resetTimer() {
            me.stopTimer();
            me.setDisplayTo(me.parseSeconds(me.initialTimerSeconds));
            me.currentTimerSeconds = me.initialTimerSeconds;
            me.startTimestamp = null;
            if (me.initialTimerSeconds > 0) {
                me.enableStartBtn();
            }
        },

        /**
         * updateTimer
         *
         * Advances the timer.
         */
        updateTimer: function updateTimer() {
            if (!me.isInteger(me.startTimestamp) || me.startTimestamp <= 0) {
                throw 'startTimestamp is not valid Unix timestamp';
            }
            var diff, currentSeconds;
            diff = (new Date()).getTime() - me.startTimestamp;
            currentSeconds = parseInt(me.currentTimerSeconds - (diff/1000), 10);
            me.setDisplayTo(me.parseSeconds(currentSeconds));
            if (currentSeconds <= 0) {
                me.stopTimer();
                me.disableStartBtn();
                alert('Time`s up!');
            }
        },

        /**
         * setDisplayTo
         *
         * Sets the display to given time.
         *
         * @param {Object} time Contains hours, minutes, seconds.
         */
        setDisplayTo: function setDisplayTo(time) {
            me.dom.find('#display .hours').html(me.pad(time.hours, 2));
            me.dom.find('#display .minutes').html(me.pad(time.minutes, 2));
            me.dom.find('#display .seconds').html(me.pad(time.seconds, 2));
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
