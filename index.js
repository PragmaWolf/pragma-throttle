'use strict';

/** Class for cycle throttling */
class PragmaThrottle {
    /**
     * Class constructor
     * @param {Object} [delays={}] Object with delays settings for throttling
     */
    constructor(delays = {}) {
        this._CLASS = this.constructor.name.toString();

        /**
         * Default throttling settings
         * @type {Object}
         */
        this.defaults = {
            delay: 1000
        };

        /**
         * Union throttle settings
         * @type {number} delay Delaying time in ms
         * @type {number} delayDefault Default delaying time in ms
         * @type {number} delayStep Increase delay time on this time in ms
         * @type {number} delayMax Maximum delaying time in ms
         */
        this.delays = Object.assign({}, this.defaults, delays);

        /**
         * Throttling state
         * @type {boolean|setTimeout}
         */
        this.throttled = false;

        /**
         * Object (class) for call in throttling
         * @type {null|Object|String}
         */
        this.obj = null;
        /**
         * Name of object method or function code for execution on throttling
         * @type {null|String|Function}
         */
        this.execute = null;
        /**
         * Arguments list for `execute`
         * @type {Array}
         */
        this.args = [];
        /**
         * Current delay time in ms
         * @type {Number}
         */
        this.delay = +this.delays.delay;
        /**
         * Default delay time in ms (for reset throttling timeout). Default value equal to `this.delay`.
         * @type {Number}
         */
        this.delayDefault = +this.delays.delayDefault || this.delay;
        /**
         * Delay increase step in ms. Default value is half of `delayDefault`.
         * @type {Number}
         */
        this.delayStep = +this.delays.delayStep || this.delayDefault / 2;
        /**
         * Maximum delay value in ms. Default value is `delayDefault * 10`.
         * @type {Number}
         */
        this.delayMax = +this.delays.delayMax || this.delayDefault * 10;
    }

    /**
     * Change delays settings for throttling
     * @param {Object} [delays={}] Object with delays settings for throttling
     * @returns {boolean} Always TRUE
     */
    setOptions(delays = {}) {
        let self = this;

        self.delays = Object.assign({}, self.defaults, delays);

        self.delay = +self.delays.delay;
        self.delayDefault = +self.delays.delayDefault || self.delay;
        self.delayStep = +self.delays.delayStep || self.delayDefault / 2;
        self.delayMax = +self.delays.delayMax || self.delayDefault * 10;
        return true;
    }

    /**
     * Throttling initialize. Validate and set getting parameters to class properties
     * @param {null|Object} executeInfo Object with execute information for throttling
     * @param {Number=} delay Current delay time in ms
     * @returns {boolean} TRUE if set parameters is done. FALSE if has some errors.
     */
    throttleInit(executeInfo, delay) {
        let self = this;

        if (!self.setExecute(executeInfo)) {
            console.error(`Can't initialize throttling settings`);
            return false;
        }

        delay = +delay;
        if (delay) {
            self.delay = delay;
        }

        return true;
    }

    /**
     * Start synchronous throttling.
     * If execute synchronous, delay begin countdown after execute workflow is finished.
     * If execute asynchronous, delay begin countdown after calling execute.
     * @param {null|Object} executeInfo Object with execute information for throttling
     * @param {Number=} delay Current delay time in ms
     * @returns {boolean} FALSE if error on throttling initialize.
     */
    throttleSync(executeInfo, delay) {
        let self = this;

        if (!self.throttleInit(executeInfo, delay)) {
            console.error(`Can't run synchronous throttling`);
            return false;
        }

        self.wrapperSync();
    }

    /**
     * Start asynchronous throttling.
     * Delay begin countdown after execute workflow is finished.
     * @param {null|Object} executeInfo Object with execute information for throttling
     * @param {Number=} delay Current delay time in ms
     * @returns {boolean} FALSE if error on throttling initialize.
     */
    throttleAsync(executeInfo, delay) {
        let self = this;

        if (!self.throttleInit(executeInfo, delay)) {
            console.error(`Can't run asynchronous throttling`);
            return false;
        }

        self.wrapperAsync();
    }

    // noinspection JSMethodCanBeStatic
    /**
     * Check getting execute info.
     * @param {Object} executeInfo Object with execute information for throttling
     * @returns {boolean} TRUE if get correct object with execute information, FALSE if not.
     */
    validateExecuteInfo(executeInfo) {
        let {obj = null, execute = null} = executeInfo;

        if (typeof execute === 'string' && !obj) {
            console.error(`Undefined object for execute method named "${execute}"`);
            return false;
        }

        if (typeof execute === 'string' && execute in obj) {
            return true;
        }

        return (typeof execute === 'function');
    }

    /**
     * Check and specify execute and his args.
     * @param {Object} executeInfo Object with execute information for throttling
     * @return {boolean} TRUE if execute specified, FALSE if not placed.
     */
    setExecute(executeInfo) {
        let self = this;

        if (self.validateExecuteInfo(executeInfo)) {
            let {obj = null, execute = null, args = []} = executeInfo;
            self.obj = obj || null;
            self.execute = execute;
            self.args = args || [];
            return true;
        }

        console.error(`Incorrect object with execute information`, executeInfo);
        return false;
    }

    /**
     * Update exists args for execute on throttling
     * @param {Array=} args Spread arguments list
     * @return {boolean} Always TRUE
     */
    setExecuteArguments(...args) {
        this.args = (Array.isArray(args)) ? args : [];
        return true;
    }

    /**
     * Call specified execute
     * @return {*} Result of execute, FALSE if not specified execute.
     */
    callExecute() {
        let self = this;

        if (!self.execute) {
            return false;
        }

        let args = Array.isArray(self.args) ? self.args : [];

        if (typeof self.execute === 'string' && self.execute in self.obj) {
            return self.obj[self.execute](...args);
        }

        if (typeof self.execute === 'function') {
            return self.execute(...args);
        }

        console.error(`Incorrect execution information in module`);
        return false;
    }

    /**
     * Reset throttle delaying to default value.
     * @return {boolean} Always TRUE
     */
    delayReset() {
        this.delay = this.delayDefault;
        return true;
    }

    /**
     * Manually increase throttling delay. Ignore maximum delay value.
     * @param {Number} delay Time in ms for increasing
     * @return {boolean} Always TRUE
     */
    delayManual(delay) {
        delay = +delay;
        this.delay = delay;
        return true;
    }

    /**
     * Automatically increase delay using `delayStep`. It can not be increased more than `delayMax`
     * @return {boolean} Always TRUE
     */
    delayIncrease() {
        let self = this;

        if (self.delay < self.delayMax) {
            self.delay += self.delayStep;
        }

        if (self.delay > self.delayMax) {
            self.delay = self.delayMax;
        }

        return true;
    }

    /**
     * Automatically decrease delay using `delayStep`. It can not be decreased more than `delayDefault`
     * @return {boolean} Always TRUE
     */
    delayDecrease() {
        let self = this;

        if (self.delay > self.delayDefault) {
            self.delay -= self.delayStep;
        }

        if (self.delay < self.delayDefault) {
            self.delay = self.delayDefault;
        }

        return true;
    }

    /**
     * Automatically random delay increase in the time between `delayDefault` and `delayMax`
     * @return {boolean} Always TRUE
     */
    delayRandom() {
        let self = this;
        let max = self.delayMax + 1;

        self.delay = Math.floor(Math.random() * (max - self.delayDefault)) + self.delayDefault;
        return true;
    }

    /**
     * Synchronous call throttled execute and create delay for next call
     * @return {null} NULL if throttled
     */
    wrapperSync() {
        let self = this;

        if (self.throttled) {
            return null;
        }

        self.callExecute();

        self.throttled = setTimeout(() => {
            clearTimeout(self.throttled);
            self.throttled = false;
            self.wrapperSync();
        }, self.delay);
    }

    /**
     * Asynchronous call throttled execute and create delay for next call after execute finished
     * @return {null} NULL if throttled
     */
    wrapperAsync() {
        let self = this;

        if (self.throttled) {
            return null;
        }

        self.callExecute()
            .then(() => {
                self.throttled = setTimeout(() => {
                    clearTimeout(self.throttled);
                    self.throttled = false;
                    self.wrapperAsync();
                }, self.delay);
            })
            .catch(error => {
                console.error(error);
            });
    }

    /**
     * Stop throttling and clear timeouts.
     */
    stop() {
        let self = this;

        clearTimeout(self.throttled);
        self.throttled = false;
    }

    /**
     * Stop throttling, clear timeouts and reset delay settings to defaults.
     */
    reset() {
        let self = this;

        self.stop();
        self.setOptions();
    }
}

module.exports = PragmaThrottle;
