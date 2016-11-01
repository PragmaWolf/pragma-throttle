# PragmaThrottle #

Module for cycle throttling with sync and async methods. Has linear, random and manual delay.

## Used and tested on ##

- NodeJS 7+ [Documentation](https://nodejs.org/dist/latest-v5.x/docs/api/)

## Navigation

- [Install](#install)
- [Initialization](#initialization)
- [Options](#options)
- [Methods](#methods)
    
- [License](#license)

## Install ##

```bash
npm i -save pragma-throttle
```

## Initialization ##

```javascript
const Trottler = require('pragma-throttle');
const throttleDelays = {
    delay: 1000,
    delayDefault: 1000,
    delayStep: 100,
    delayMax: 10000
};
const Throttle = new Throttler(throttleDelays);
```

## Options ##

Delay options:

```json
{
    "delay": 1000,
    "delayDefault": 1000,
    "delayStep": 100,
    "delayMax": 10000
}
```

__delay__ - `number` - The delay between the iterations of the throttled loop.

__delayDefault__ - `number` - The default delay between the iterations of the throttled loop.

__delayStep__ - `number` - Increase/decrease the delay at each iteration to the value.

__delayMax__ - `number` - The maximum delay.

Throttled objects options:

```json
{
    "obj": {},
    "execute": "Method",
    "args": []
}
```

__obj__ - `object|` - The object that owns the method specified in `execute`.

__execute__ - `function|string` - Object `obj` method name or a simple function.

__args__ - `array` - Arguments for method or function specified in `execute`.

## Methods ##

### throttleSync(executeInfo[, delay]) ###

__executeInfo__ - `null|Object` - Object with throttled options.

__delay__ - `Number` - Start delay time in ms.

Return FALSE if error on throttling initialize.

Start synchronous throttling.
If execute synchronous, delay begin countdown after execute workflow is finished.
If execute asynchronous, delay begin countdown after calling execute.

```javascript
let throttleObj = {
    obj: Class,
    execute: 'SyncClassMethod'
};

Throttle.throttleSync(throttleObj, 1000);
```

### throttleAsync(executeInfo[, delay]) ###

__executeInfo__ - `null|Object` - Object with throttled options.

__delay__ - `Number` - Start delay time in ms.

Return FALSE if error on throttling initialize.

Start asynchronous throttling.

Delay begin countdown after execute workflow is finished.

```javascript
let throttleObj = {
    obj: Class,
    execute: 'AsyncClassMethod'
};

Throttle.throttleAsync(throttleObj, 1000);
```

### setExecute(executeInfo) ###

__executeInfo__ - `null|Object` - Object with throttled options.

Return TRUE if execute specified, FALSE if not placed.

Check and specify execute and his args.

### setExecuteArguments(...args) ###

__args__ - `array` - Spread arguments list.

Return always TRUE

Update exists args for execute on throttling

### delayReset() ###

Return always TRUE

Reset throttle delaying to default value. 
Put it into throttled function or method.

### delayManual(delay) ###

__delay__ - `Number` - Time in ms for increasing

Return always TRUE

Manually increase throttling delay. Ignore maximum delay value. 
Put it into throttled function or method.

### delayIncrease() ###

Return always TRUE

Automatically increase delay using `delayStep`. 
It can not be increased more than `delayMax`. 
Put it into throttled function or method.

### delayDecrease() ###

Return always TRUE

Automatically decrease delay using `delayStep`. 
It can not be decreased more than `delayDefault`. 
Put it into throttled function or method.

### delayRandom() ###

Return always TRUE

Automatically random delay increase in the time between `delayDefault` and `delayMax`. 
Put it into throttled function or method.

# License #

[wtfpl]: wtfpl-badge-1.png "WTFPL License :)"
![No WTFPL License image :(][wtfpl]
