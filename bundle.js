!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.nameMe=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process){
'use strict';
var randomWord = require('random-word-by-length');
var uniqueRandom = require('unique-random');
var https = require('https');
var Promise = require('bluebird');
var randomNumber = uniqueRandom(0, 3);

var base = 'https://skimdb.npmjs.com/registry/';
if (process.browser) {
	base = 'https://skimdb.iriscouch.com/registry/';
}
function checkName(name) {
	return new Promise (function (resolve, reject) {
		if (inValid(name)) {
		throw new Error(name + ' is an invalid npm name');
		}
		https.get(base + name, function (res) {
			res.on('data',function(){});
			if (res.statusCode > 399 || res.statusCode < 200) {
				return reject(res);
			}
			resolve();
		}).on('error', reject);
	});
}
function improve(name, len) {
	var num = randomNumber();
	if (num === 0 && name.slice(0, 5) !== 'node-') {
		name = 'node-' + name;
		return randomName(name, len);
	} 
	if (num === 1 && name.slice(-3) !== '-js') {
		name += '-js';
		return randomName(name, len);
	}
	if (name.slice(-3) === '-js') {
		name = randomWord(len) + '-' + name;
		return randomName(name, len);
	}
	name += '-';
	name += randomWord(len);
	return randomName(name, len);
	
}
var inValidStart = /^[_\.]/;
var noSlash = /[\/\\]/;
function inValid(name) {
	return inValidStart.test(name) || noSlash.test(name);
}
function randomName(name, len) {
	if (typeof name === 'number') {
		len = name;
		name = false;
	}
	name =  name || randomWord(len);
	return checkName(name).then(function () {
			return improve(name, len);
		}, function (e) {
			if (e.statusCode === 404) {
				return name;
			} else {
				throw e;
			}
		});
}
module.exports = randomName;
}).call(this,require("/usr/local/share/npm/lib/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js"))
},{"/usr/local/share/npm/lib/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js":51,"bluebird":4,"https":49,"random-word-by-length":37,"unique-random":38}],2:[function(require,module,exports){
/**
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
module.exports = function(Promise) {
var SomePromiseArray = Promise._SomePromiseArray;
function Promise$_Any(promises) {
    var ret = new SomePromiseArray(promises);
    var promise = ret.promise();
    if (promise.isRejected()) {
        return promise;
    }
    ret.setHowMany(1);
    ret.setUnwrap();
    ret.init();
    return promise;
}

Promise.any = function Promise$Any(promises) {
    return Promise$_Any(promises);
};

Promise.prototype.any = function Promise$any() {
    return Promise$_Any(this);
};

};

},{}],3:[function(require,module,exports){
(function (process){
/**
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
var schedule = require("./schedule.js");
var Queue = require("./queue.js");
var errorObj = require("./util.js").errorObj;
var tryCatch1 = require("./util.js").tryCatch1;
var _process = typeof process !== "undefined" ? process : void 0;

function Async() {
    this._isTickUsed = false;
    this._schedule = schedule;
    this._length = 0;
    this._lateBuffer = new Queue(16);
    this._functionBuffer = new Queue(65536);
    var self = this;
    this.consumeFunctionBuffer = function Async$consumeFunctionBuffer() {
        self._consumeFunctionBuffer();
    };
}

Async.prototype.haveItemsQueued = function Async$haveItemsQueued() {
    return this._length > 0;
};

Async.prototype.invokeLater = function Async$invokeLater(fn, receiver, arg) {
    if (_process !== void 0 &&
        _process.domain != null &&
        !fn.domain) {
        fn = _process.domain.bind(fn);
    }
    this._lateBuffer.push(fn, receiver, arg);
    this._queueTick();
};

Async.prototype.invoke = function Async$invoke(fn, receiver, arg) {
    if (_process !== void 0 &&
        _process.domain != null &&
        !fn.domain) {
        fn = _process.domain.bind(fn);
    }
    var functionBuffer = this._functionBuffer;
    functionBuffer.push(fn, receiver, arg);
    this._length = functionBuffer.length();
    this._queueTick();
};

Async.prototype._consumeFunctionBuffer =
function Async$_consumeFunctionBuffer() {
    var functionBuffer = this._functionBuffer;
    while (functionBuffer.length() > 0) {
        var fn = functionBuffer.shift();
        var receiver = functionBuffer.shift();
        var arg = functionBuffer.shift();
        fn.call(receiver, arg);
    }
    this._reset();
    this._consumeLateBuffer();
};

Async.prototype._consumeLateBuffer = function Async$_consumeLateBuffer() {
    var buffer = this._lateBuffer;
    while(buffer.length() > 0) {
        var fn = buffer.shift();
        var receiver = buffer.shift();
        var arg = buffer.shift();
        var res = tryCatch1(fn, receiver, arg);
        if (res === errorObj) {
            this._queueTick();
            if (fn.domain != null) {
                fn.domain.emit("error", res.e);
            } else {
                throw res.e;
            }
        }
    }
};

Async.prototype._queueTick = function Async$_queue() {
    if (!this._isTickUsed) {
        this._schedule(this.consumeFunctionBuffer);
        this._isTickUsed = true;
    }
};

Async.prototype._reset = function Async$_reset() {
    this._isTickUsed = false;
    this._length = 0;
};

module.exports = new Async();

}).call(this,require("/usr/local/share/npm/lib/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js"))
},{"./queue.js":26,"./schedule.js":29,"./util.js":36,"/usr/local/share/npm/lib/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js":51}],4:[function(require,module,exports){
/**
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
var Promise = require("./promise.js")();
module.exports = Promise;
},{"./promise.js":21}],5:[function(require,module,exports){
/**
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
var cr = Object.create;
if (cr) {
    var callerCache = cr(null);
    var getterCache = cr(null);
    callerCache[" size"] = getterCache[" size"] = 0;
}

module.exports = function(Promise) {
var util = require("./util.js");
var canEvaluate = util.canEvaluate;
var isIdentifier = util.isIdentifier;

function makeMethodCaller (methodName) {
    return new Function("obj", "                                             \n\
        'use strict'                                                         \n\
        var len = this.length;                                               \n\
        switch(len) {                                                        \n\
            case 1: return obj.methodName(this[0]);                          \n\
            case 2: return obj.methodName(this[0], this[1]);                 \n\
            case 3: return obj.methodName(this[0], this[1], this[2]);        \n\
            case 0: return obj.methodName();                                 \n\
            default: return obj.methodName.apply(obj, this);                 \n\
        }                                                                    \n\
        ".replace(/methodName/g, methodName));
}

function makeGetter (propertyName) {
    return new Function("obj", "                                             \n\
        'use strict';                                                        \n\
        return obj.propertyName;                                             \n\
        ".replace("propertyName", propertyName));
}

function getCompiled(name, compiler, cache) {
    var ret = cache[name];
    if (typeof ret !== "function") {
        if (!isIdentifier(name)) {
            return null;
        }
        ret = compiler(name);
        cache[name] = ret;
        cache[" size"]++;
        if (cache[" size"] > 512) {
            var keys = Object.keys(cache);
            for (var i = 0; i < 256; ++i) delete cache[keys[i]];
            cache[" size"] = keys.length - 256;
        }
    }
    return ret;
}

function getMethodCaller(name) {
    return getCompiled(name, makeMethodCaller, callerCache);
}

function getGetter(name) {
    return getCompiled(name, makeGetter, getterCache);
}

function caller(obj) {
    return obj[this.pop()].apply(obj, this);
}
Promise.prototype.call = function Promise$call(methodName) {
    var $_len = arguments.length;var args = new Array($_len - 1); for(var $_i = 1; $_i < $_len; ++$_i) {args[$_i - 1] = arguments[$_i];}
    if (canEvaluate) {
        var maybeCaller = getMethodCaller(methodName);
        if (maybeCaller !== null) {
            return this._then(maybeCaller, void 0, void 0, args, void 0);
        }
    }
    args.push(methodName);
    return this._then(caller, void 0, void 0, args, void 0);
};

function namedGetter(obj) {
    return obj[this];
}
function indexedGetter(obj) {
    return obj[this];
}
Promise.prototype.get = function Promise$get(propertyName) {
    var isIndex = (typeof propertyName === "number");
    var getter;
    if (!isIndex) {
        if (canEvaluate) {
            var maybeGetter = getGetter(propertyName);
            getter = maybeGetter !== null ? maybeGetter : namedGetter;
        } else {
            getter = namedGetter;
        }
    } else {
        getter = indexedGetter;
    }
    return this._then(getter, void 0, void 0, propertyName, void 0);
};
};

},{"./util.js":36}],6:[function(require,module,exports){
/**
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
module.exports = function(Promise, INTERNAL) {
var errors = require("./errors.js");
var canAttach = errors.canAttach;
var async = require("./async.js");
var CancellationError = errors.CancellationError;

Promise.prototype._cancel = function Promise$_cancel(reason) {
    if (!this.isCancellable()) return this;
    var parent;
    var promiseToReject = this;
    while ((parent = promiseToReject._cancellationParent) !== void 0 &&
        parent.isCancellable()) {
        promiseToReject = parent;
    }
    promiseToReject._attachExtraTrace(reason);
    promiseToReject._rejectUnchecked(reason);
};

Promise.prototype.cancel = function Promise$cancel(reason) {
    if (!this.isCancellable()) return this;
    reason = reason !== void 0
        ? (canAttach(reason) ? reason : new Error(reason + ""))
        : new CancellationError();
    async.invokeLater(this._cancel, this, reason);
    return this;
};

Promise.prototype.cancellable = function Promise$cancellable() {
    if (this._cancellable()) return this;
    this._setCancellable();
    this._cancellationParent = void 0;
    return this;
};

Promise.prototype.uncancellable = function Promise$uncancellable() {
    var ret = new Promise(INTERNAL);
    ret._propagateFrom(this, 2 | 4);
    ret._follow(this);
    ret._unsetCancellable();
    return ret;
};

Promise.prototype.fork =
function Promise$fork(didFulfill, didReject, didProgress) {
    var ret = this._then(didFulfill, didReject, didProgress,
                         void 0, void 0);

    ret._setCancellable();
    ret._cancellationParent = void 0;
    return ret;
};
};

},{"./async.js":3,"./errors.js":11}],7:[function(require,module,exports){
/**
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
module.exports = function() {
var inherits = require("./util.js").inherits;
var defineProperty = require("./es5.js").defineProperty;

var rignore = new RegExp(
    "\\b(?:[a-zA-Z0-9.]+\\$_\\w+|" +
    "tryCatch(?:1|2|3|4|Apply)|new \\w*PromiseArray|" +
    "\\w*PromiseArray\\.\\w*PromiseArray|" +
    "setTimeout|CatchFilter\\$_\\w+|makeNodePromisified|processImmediate|" +
    "process._tickCallback|nextTick|Async\\$\\w+)\\b"
);

var rtraceline = null;
var formatStack = null;

function formatNonError(obj) {
    var str;
    if (typeof obj === "function") {
        str = "[function " +
            (obj.name || "anonymous") +
            "]";
    } else {
        str = obj.toString();
        var ruselessToString = /\[object [a-zA-Z0-9$_]+\]/;
        if (ruselessToString.test(str)) {
            try {
                var newStr = JSON.stringify(obj);
                str = newStr;
            }
            catch(e) {

            }
        }
        if (str.length === 0) {
            str = "(empty array)";
        }
    }
    return ("(<" + snip(str) + ">, no stack trace)");
}

function snip(str) {
    var maxChars = 41;
    if (str.length < maxChars) {
        return str;
    }
    return str.substr(0, maxChars - 3) + "...";
}

function CapturedTrace(ignoreUntil, isTopLevel) {
    this.captureStackTrace(CapturedTrace, isTopLevel);

}
inherits(CapturedTrace, Error);

CapturedTrace.prototype.captureStackTrace =
function CapturedTrace$captureStackTrace(ignoreUntil, isTopLevel) {
    captureStackTrace(this, ignoreUntil, isTopLevel);
};

CapturedTrace.possiblyUnhandledRejection =
function CapturedTrace$PossiblyUnhandledRejection(reason) {
    if (typeof console === "object") {
        var message;
        if (typeof reason === "object" || typeof reason === "function") {
            var stack = reason.stack;
            message = "Possibly unhandled " + formatStack(stack, reason);
        } else {
            message = "Possibly unhandled " + String(reason);
        }
        if (typeof console.error === "function" ||
            typeof console.error === "object") {
            console.error(message);
        } else if (typeof console.log === "function" ||
            typeof console.log === "object") {
            console.log(message);
        }
    }
};

CapturedTrace.combine = function CapturedTrace$Combine(current, prev) {
    var curLast = current.length - 1;
    for (var i = prev.length - 1; i >= 0; --i) {
        var line = prev[i];
        if (current[curLast] === line) {
            current.pop();
            curLast--;
        } else {
            break;
        }
    }

    current.push("From previous event:");
    var lines = current.concat(prev);

    var ret = [];

    for (var i = 0, len = lines.length; i < len; ++i) {

        if ((rignore.test(lines[i]) ||
            (i > 0 && !rtraceline.test(lines[i])) &&
            lines[i] !== "From previous event:")
       ) {
            continue;
        }
        ret.push(lines[i]);
    }
    return ret;
};

CapturedTrace.protectErrorMessageNewlines = function(stack) {
    for (var i = 0; i < stack.length; ++i) {
        if (rtraceline.test(stack[i])) {
            break;
        }
    }

    if (i <= 1) return;

    var errorMessageLines = [];
    for (var j = 0; j < i; ++j) {
        errorMessageLines.push(stack.shift());
    }
    stack.unshift(errorMessageLines.join("\u0002\u0000\u0001"));
};

CapturedTrace.isSupported = function CapturedTrace$IsSupported() {
    return typeof captureStackTrace === "function";
};

var captureStackTrace = (function stackDetection() {
    if (typeof Error.stackTraceLimit === "number" &&
        typeof Error.captureStackTrace === "function") {
        rtraceline = /^\s*at\s*/;
        formatStack = function(stack, error) {
            if (typeof stack === "string") return stack;

            if (error.name !== void 0 &&
                error.message !== void 0) {
                return error.name + ". " + error.message;
            }
            return formatNonError(error);


        };
        var captureStackTrace = Error.captureStackTrace;
        return function CapturedTrace$_captureStackTrace(
            receiver, ignoreUntil) {
            captureStackTrace(receiver, ignoreUntil);
        };
    }
    var err = new Error();

    if (typeof err.stack === "string" &&
        typeof "".startsWith === "function" &&
        (err.stack.startsWith("stackDetection@")) &&
        stackDetection.name === "stackDetection") {

        defineProperty(Error, "stackTraceLimit", {
            writable: true,
            enumerable: false,
            configurable: false,
            value: 25
        });
        rtraceline = /@/;
        var rline = /[@\n]/;

        formatStack = function(stack, error) {
            if (typeof stack === "string") {
                return (error.name + ". " + error.message + "\n" + stack);
            }

            if (error.name !== void 0 &&
                error.message !== void 0) {
                return error.name + ". " + error.message;
            }
            return formatNonError(error);
        };

        return function captureStackTrace(o) {
            var stack = new Error().stack;
            var split = stack.split(rline);
            var len = split.length;
            var ret = "";
            for (var i = 0; i < len; i += 2) {
                ret += split[i];
                ret += "@";
                ret += split[i + 1];
                ret += "\n";
            }
            o.stack = ret;
        };
    } else {
        formatStack = function(stack, error) {
            if (typeof stack === "string") return stack;

            if ((typeof error === "object" ||
                typeof error === "function") &&
                error.name !== void 0 &&
                error.message !== void 0) {
                return error.name + ". " + error.message;
            }
            return formatNonError(error);
        };

        return null;
    }
})();

return CapturedTrace;
};

},{"./es5.js":13,"./util.js":36}],8:[function(require,module,exports){
/**
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
module.exports = function(NEXT_FILTER) {
var util = require("./util.js");
var errors = require("./errors.js");
var tryCatch1 = util.tryCatch1;
var errorObj = util.errorObj;
var keys = require("./es5.js").keys;
var TypeError = errors.TypeError;

function CatchFilter(instances, callback, promise) {
    this._instances = instances;
    this._callback = callback;
    this._promise = promise;
}

function CatchFilter$_safePredicate(predicate, e) {
    var safeObject = {};
    var retfilter = tryCatch1(predicate, safeObject, e);

    if (retfilter === errorObj) return retfilter;

    var safeKeys = keys(safeObject);
    if (safeKeys.length) {
        errorObj.e = new TypeError(
            "Catch filter must inherit from Error "
          + "or be a simple predicate function");
        return errorObj;
    }
    return retfilter;
}

CatchFilter.prototype.doFilter = function CatchFilter$_doFilter(e) {
    var cb = this._callback;
    var promise = this._promise;
    var boundTo = promise._boundTo;
    for (var i = 0, len = this._instances.length; i < len; ++i) {
        var item = this._instances[i];
        var itemIsErrorType = item === Error ||
            (item != null && item.prototype instanceof Error);

        if (itemIsErrorType && e instanceof item) {
            var ret = tryCatch1(cb, boundTo, e);
            if (ret === errorObj) {
                NEXT_FILTER.e = ret.e;
                return NEXT_FILTER;
            }
            return ret;
        } else if (typeof item === "function" && !itemIsErrorType) {
            var shouldHandle = CatchFilter$_safePredicate(item, e);
            if (shouldHandle === errorObj) {
                var trace = errors.canAttach(errorObj.e)
                    ? errorObj.e
                    : new Error(errorObj.e + "");
                this._promise._attachExtraTrace(trace);
                e = errorObj.e;
                break;
            } else if (shouldHandle) {
                var ret = tryCatch1(cb, boundTo, e);
                if (ret === errorObj) {
                    NEXT_FILTER.e = ret.e;
                    return NEXT_FILTER;
                }
                return ret;
            }
        }
    }
    NEXT_FILTER.e = e;
    return NEXT_FILTER;
};

return CatchFilter;
};

},{"./errors.js":11,"./es5.js":13,"./util.js":36}],9:[function(require,module,exports){
/**
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
var util = require("./util.js");
var isPrimitive = util.isPrimitive;
var wrapsPrimitiveReceiver = util.wrapsPrimitiveReceiver;

module.exports = function(Promise) {
var returner = function Promise$_returner() {
    return this;
};
var thrower = function Promise$_thrower() {
    throw this;
};

var wrapper = function Promise$_wrapper(value, action) {
    if (action === 1) {
        return function Promise$_thrower() {
            throw value;
        };
    } else if (action === 2) {
        return function Promise$_returner() {
            return value;
        };
    }
};


Promise.prototype["return"] =
Promise.prototype.thenReturn =
function Promise$thenReturn(value) {
    if (wrapsPrimitiveReceiver && isPrimitive(value)) {
        return this._then(
            wrapper(value, 2),
            void 0,
            void 0,
            void 0,
            void 0
       );
    }
    return this._then(returner, void 0, void 0, value, void 0);
};

Promise.prototype["throw"] =
Promise.prototype.thenThrow =
function Promise$thenThrow(reason) {
    if (wrapsPrimitiveReceiver && isPrimitive(reason)) {
        return this._then(
            wrapper(reason, 1),
            void 0,
            void 0,
            void 0,
            void 0
       );
    }
    return this._then(thrower, void 0, void 0, reason, void 0);
};
};

},{"./util.js":36}],10:[function(require,module,exports){
/**
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
module.exports = function(Promise, INTERNAL) {
var PromiseReduce = Promise.reduce;

Promise.prototype.each = function Promise$each(fn) {
    return PromiseReduce(this, fn, null, INTERNAL);
};

Promise.each = function Promise$Each(promises, fn) {
    return PromiseReduce(promises, fn, null, INTERNAL);
};
};

},{}],11:[function(require,module,exports){
/**
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
var Objectfreeze = require("./es5.js").freeze;
var util = require("./util.js");
var inherits = util.inherits;
var notEnumerableProp = util.notEnumerableProp;

function markAsOriginatingFromRejection(e) {
    try {
        notEnumerableProp(e, "isOperational", true);
    }
    catch(ignore) {}
}

function originatesFromRejection(e) {
    if (e == null) return false;
    return ((e instanceof OperationalError) ||
        e["isOperational"] === true);
}

function isError(obj) {
    return obj instanceof Error;
}

function canAttach(obj) {
    return isError(obj);
}

function subError(nameProperty, defaultMessage) {
    function SubError(message) {
        if (!(this instanceof SubError)) return new SubError(message);
        this.message = typeof message === "string" ? message : defaultMessage;
        this.name = nameProperty;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
    inherits(SubError, Error);
    return SubError;
}

var _TypeError, _RangeError;
var CancellationError = subError("CancellationError", "cancellation error");
var TimeoutError = subError("TimeoutError", "timeout error");
var AggregateError = subError("AggregateError", "aggregate error");
try {
    _TypeError = TypeError;
    _RangeError = RangeError;
} catch(e) {
    _TypeError = subError("TypeError", "type error");
    _RangeError = subError("RangeError", "range error");
}

var methods = ("join pop push shift unshift slice filter forEach some " +
    "every map indexOf lastIndexOf reduce reduceRight sort reverse").split(" ");

for (var i = 0; i < methods.length; ++i) {
    if (typeof Array.prototype[methods[i]] === "function") {
        AggregateError.prototype[methods[i]] = Array.prototype[methods[i]];
    }
}

AggregateError.prototype.length = 0;
AggregateError.prototype["isOperational"] = true;
var level = 0;
AggregateError.prototype.toString = function() {
    var indent = Array(level * 4 + 1).join(" ");
    var ret = "\n" + indent + "AggregateError of:" + "\n";
    level++;
    indent = Array(level * 4 + 1).join(" ");
    for (var i = 0; i < this.length; ++i) {
        var str = this[i] === this ? "[Circular AggregateError]" : this[i] + "";
        var lines = str.split("\n");
        for (var j = 0; j < lines.length; ++j) {
            lines[j] = indent + lines[j];
        }
        str = lines.join("\n");
        ret += str + "\n";
    }
    level--;
    return ret;
};

function OperationalError(message) {
    this.name = "OperationalError";
    this.message = message;
    this.cause = message;
    this["isOperational"] = true;

    if (message instanceof Error) {
        this.message = message.message;
        this.stack = message.stack;
    } else if (Error.captureStackTrace) {
        Error.captureStackTrace(this, this.constructor);
    }

}
inherits(OperationalError, Error);

var key = "__BluebirdErrorTypes__";
var errorTypes = Error[key];
if (!errorTypes) {
    errorTypes = Objectfreeze({
        CancellationError: CancellationError,
        TimeoutError: TimeoutError,
        OperationalError: OperationalError,
        RejectionError: OperationalError,
        AggregateError: AggregateError
    });
    notEnumerableProp(Error, key, errorTypes);
}

module.exports = {
    Error: Error,
    TypeError: _TypeError,
    RangeError: _RangeError,
    CancellationError: errorTypes.CancellationError,
    OperationalError: errorTypes.OperationalError,
    TimeoutError: errorTypes.TimeoutError,
    AggregateError: errorTypes.AggregateError,
    originatesFromRejection: originatesFromRejection,
    markAsOriginatingFromRejection: markAsOriginatingFromRejection,
    canAttach: canAttach
};

},{"./es5.js":13,"./util.js":36}],12:[function(require,module,exports){
/**
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
module.exports = function(Promise) {
var TypeError = require('./errors.js').TypeError;

function apiRejection(msg) {
    var error = new TypeError(msg);
    var ret = Promise.rejected(error);
    var parent = ret._peekContext();
    if (parent != null) {
        parent._attachExtraTrace(error);
    }
    return ret;
}

return apiRejection;
};

},{"./errors.js":11}],13:[function(require,module,exports){
/**
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
var isES5 = (function(){
    "use strict";
    return this === void 0;
})();

if (isES5) {
    module.exports = {
        freeze: Object.freeze,
        defineProperty: Object.defineProperty,
        keys: Object.keys,
        getPrototypeOf: Object.getPrototypeOf,
        isArray: Array.isArray,
        isES5: isES5
    };
} else {
    var has = {}.hasOwnProperty;
    var str = {}.toString;
    var proto = {}.constructor.prototype;

    var ObjectKeys = function ObjectKeys(o) {
        var ret = [];
        for (var key in o) {
            if (has.call(o, key)) {
                ret.push(key);
            }
        }
        return ret;
    }

    var ObjectDefineProperty = function ObjectDefineProperty(o, key, desc) {
        o[key] = desc.value;
        return o;
    }

    var ObjectFreeze = function ObjectFreeze(obj) {
        return obj;
    }

    var ObjectGetPrototypeOf = function ObjectGetPrototypeOf(obj) {
        try {
            return Object(obj).constructor.prototype;
        }
        catch (e) {
            return proto;
        }
    }

    var ArrayIsArray = function ArrayIsArray(obj) {
        try {
            return str.call(obj) === "[object Array]";
        }
        catch(e) {
            return false;
        }
    }

    module.exports = {
        isArray: ArrayIsArray,
        keys: ObjectKeys,
        defineProperty: ObjectDefineProperty,
        freeze: ObjectFreeze,
        getPrototypeOf: ObjectGetPrototypeOf,
        isES5: isES5
    };
}

},{}],14:[function(require,module,exports){
/**
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
module.exports = function(Promise, INTERNAL) {
var PromiseMap = Promise.map;

Promise.prototype.filter = function Promise$filter(fn, options) {
    return PromiseMap(this, fn, options, INTERNAL);
};

Promise.filter = function Promise$Filter(promises, fn, options) {
    return PromiseMap(promises, fn, options, INTERNAL);
};
};

},{}],15:[function(require,module,exports){
/**
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
module.exports = function(Promise, NEXT_FILTER, cast) {
var util = require("./util.js");
var wrapsPrimitiveReceiver = util.wrapsPrimitiveReceiver;
var isPrimitive = util.isPrimitive;
var thrower = util.thrower;

function returnThis() {
    return this;
}
function throwThis() {
    throw this;
}
function return$(r) {
    return function Promise$_returner() {
        return r;
    };
}
function throw$(r) {
    return function Promise$_thrower() {
        throw r;
    };
}
function promisedFinally(ret, reasonOrValue, isFulfilled) {
    var then;
    if (wrapsPrimitiveReceiver && isPrimitive(reasonOrValue)) {
        then = isFulfilled ? return$(reasonOrValue) : throw$(reasonOrValue);
    } else {
        then = isFulfilled ? returnThis : throwThis;
    }
    return ret._then(then, thrower, void 0, reasonOrValue, void 0);
}

function finallyHandler(reasonOrValue) {
    var promise = this.promise;
    var handler = this.handler;

    var ret = promise._isBound()
                    ? handler.call(promise._boundTo)
                    : handler();

    if (ret !== void 0) {
        var maybePromise = cast(ret, void 0);
        if (maybePromise instanceof Promise) {
            return promisedFinally(maybePromise, reasonOrValue,
                                    promise.isFulfilled());
        }
    }

    if (promise.isRejected()) {
        NEXT_FILTER.e = reasonOrValue;
        return NEXT_FILTER;
    } else {
        return reasonOrValue;
    }
}

function tapHandler(value) {
    var promise = this.promise;
    var handler = this.handler;

    var ret = promise._isBound()
                    ? handler.call(promise._boundTo, value)
                    : handler(value);

    if (ret !== void 0) {
        var maybePromise = cast(ret, void 0);
        if (maybePromise instanceof Promise) {
            return promisedFinally(maybePromise, value, true);
        }
    }
    return value;
}

Promise.prototype._passThroughHandler =
function Promise$_passThroughHandler(handler, isFinally) {
    if (typeof handler !== "function") return this.then();

    var promiseAndHandler = {
        promise: this,
        handler: handler
    };

    return this._then(
            isFinally ? finallyHandler : tapHandler,
            isFinally ? finallyHandler : void 0, void 0,
            promiseAndHandler, void 0);
};

Promise.prototype.lastly =
Promise.prototype["finally"] = function Promise$finally(handler) {
    return this._passThroughHandler(handler, true);
};

Promise.prototype.tap = function Promise$tap(handler) {
    return this._passThroughHandler(handler, false);
};
};

},{"./util.js":36}],16:[function(require,module,exports){
/**
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
module.exports = function(Promise, apiRejection, INTERNAL, cast) {
var errors = require("./errors.js");
var TypeError = errors.TypeError;
var deprecated = require("./util.js").deprecated;
var util = require("./util.js");
var errorObj = util.errorObj;
var tryCatch1 = util.tryCatch1;
var yieldHandlers = [];

function promiseFromYieldHandler(value, yieldHandlers) {
    var _errorObj = errorObj;
    var _Promise = Promise;
    var len = yieldHandlers.length;
    for (var i = 0; i < len; ++i) {
        var result = tryCatch1(yieldHandlers[i], void 0, value);
        if (result === _errorObj) {
            return _Promise.reject(_errorObj.e);
        }
        var maybePromise = cast(result, promiseFromYieldHandler);
        if (maybePromise instanceof _Promise) return maybePromise;
    }
    return null;
}

function PromiseSpawn(generatorFunction, receiver, yieldHandler) {
    var promise = this._promise = new Promise(INTERNAL);
    promise._setTrace(void 0);
    this._generatorFunction = generatorFunction;
    this._receiver = receiver;
    this._generator = void 0;
    this._yieldHandlers = typeof yieldHandler === "function"
        ? [yieldHandler].concat(yieldHandlers)
        : yieldHandlers;
}

PromiseSpawn.prototype.promise = function PromiseSpawn$promise() {
    return this._promise;
};

PromiseSpawn.prototype._run = function PromiseSpawn$_run() {
    this._generator = this._generatorFunction.call(this._receiver);
    this._receiver =
        this._generatorFunction = void 0;
    this._next(void 0);
};

PromiseSpawn.prototype._continue = function PromiseSpawn$_continue(result) {
    if (result === errorObj) {
        this._generator = void 0;
        var trace = errors.canAttach(result.e)
            ? result.e : new Error(result.e + "");
        this._promise._attachExtraTrace(trace);
        this._promise._reject(result.e, trace);
        return;
    }

    var value = result.value;
    if (result.done === true) {
        this._generator = void 0;
        if (!this._promise._tryFollow(value)) {
            this._promise._fulfill(value);
        }
    } else {
        var maybePromise = cast(value, void 0);
        if (!(maybePromise instanceof Promise)) {
            maybePromise =
                promiseFromYieldHandler(maybePromise, this._yieldHandlers);
            if (maybePromise === null) {
                this._throw(new TypeError("A value was yielded that could not be treated as a promise"));
                return;
            }
        }
        maybePromise._then(
            this._next,
            this._throw,
            void 0,
            this,
            null
       );
    }
};

PromiseSpawn.prototype._throw = function PromiseSpawn$_throw(reason) {
    if (errors.canAttach(reason))
        this._promise._attachExtraTrace(reason);
    this._continue(
        tryCatch1(this._generator["throw"], this._generator, reason)
   );
};

PromiseSpawn.prototype._next = function PromiseSpawn$_next(value) {
    this._continue(
        tryCatch1(this._generator.next, this._generator, value)
   );
};

Promise.coroutine =
function Promise$Coroutine(generatorFunction, options) {
    if (typeof generatorFunction !== "function") {
        throw new TypeError("generatorFunction must be a function");
    }
    var yieldHandler = Object(options).yieldHandler;
    var PromiseSpawn$ = PromiseSpawn;
    return function () {
        var generator = generatorFunction.apply(this, arguments);
        var spawn = new PromiseSpawn$(void 0, void 0, yieldHandler);
        spawn._generator = generator;
        spawn._next(void 0);
        return spawn.promise();
    };
};

Promise.coroutine.addYieldHandler = function(fn) {
    if (typeof fn !== "function") throw new TypeError("fn must be a function");
    yieldHandlers.push(fn);
};

Promise.spawn = function Promise$Spawn(generatorFunction) {
    deprecated("Promise.spawn is deprecated. Use Promise.coroutine instead.");
    if (typeof generatorFunction !== "function") {
        return apiRejection("generatorFunction must be a function");
    }
    var spawn = new PromiseSpawn(generatorFunction, this);
    var ret = spawn.promise();
    spawn._run(Promise.spawn);
    return ret;
};
};

},{"./errors.js":11,"./util.js":36}],17:[function(require,module,exports){
/**
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
module.exports =
function(Promise, PromiseArray, cast, INTERNAL) {
var util = require("./util.js");
var canEvaluate = util.canEvaluate;
var tryCatch1 = util.tryCatch1;
var errorObj = util.errorObj;


if (canEvaluate) {
    var thenCallback = function(i) {
        return new Function("value", "holder", "                             \n\
            'use strict';                                                    \n\
            holder.pIndex = value;                                           \n\
            holder.checkFulfillment(this);                                   \n\
            ".replace(/Index/g, i));
    };

    var caller = function(count) {
        var values = [];
        for (var i = 1; i <= count; ++i) values.push("holder.p" + i);
        return new Function("holder", "                                      \n\
            'use strict';                                                    \n\
            var callback = holder.fn;                                        \n\
            return callback(values);                                         \n\
            ".replace(/values/g, values.join(", ")));
    };
    var thenCallbacks = [];
    var callers = [void 0];
    for (var i = 1; i <= 5; ++i) {
        thenCallbacks.push(thenCallback(i));
        callers.push(caller(i));
    }

    var Holder = function(total, fn) {
        this.p1 = this.p2 = this.p3 = this.p4 = this.p5 = null;
        this.fn = fn;
        this.total = total;
        this.now = 0;
    };

    Holder.prototype.callers = callers;
    Holder.prototype.checkFulfillment = function(promise) {
        var now = this.now;
        now++;
        var total = this.total;
        if (now >= total) {
            var handler = this.callers[total];
            var ret = tryCatch1(handler, void 0, this);
            if (ret === errorObj) {
                promise._rejectUnchecked(ret.e);
            } else if (!promise._tryFollow(ret)) {
                promise._fulfillUnchecked(ret);
            }
        } else {
            this.now = now;
        }
    };
}




Promise.join = function Promise$Join() {
    var last = arguments.length - 1;
    var fn;
    if (last > 0 && typeof arguments[last] === "function") {
        fn = arguments[last];
        if (last < 6 && canEvaluate) {
            var ret = new Promise(INTERNAL);
            ret._setTrace(void 0);
            var holder = new Holder(last, fn);
            var reject = ret._reject;
            var callbacks = thenCallbacks;
            for (var i = 0; i < last; ++i) {
                var maybePromise = cast(arguments[i], void 0);
                if (maybePromise instanceof Promise) {
                    if (maybePromise.isPending()) {
                        maybePromise._then(callbacks[i], reject,
                                           void 0, ret, holder);
                    } else if (maybePromise.isFulfilled()) {
                        callbacks[i].call(ret,
                                          maybePromise._settledValue, holder);
                    } else {
                        ret._reject(maybePromise._settledValue);
                        maybePromise._unsetRejectionIsUnhandled();
                    }
                } else {
                    callbacks[i].call(ret, maybePromise, holder);
                }
            }
            return ret;
        }
    }
    var $_len = arguments.length;var args = new Array($_len); for(var $_i = 0; $_i < $_len; ++$_i) {args[$_i] = arguments[$_i];}
    var ret = new PromiseArray(args).promise();
    return fn !== void 0 ? ret.spread(fn) : ret;
};

};

},{"./util.js":36}],18:[function(require,module,exports){
/**
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
module.exports = function(Promise, PromiseArray, apiRejection, cast, INTERNAL) {
var util = require("./util.js");
var tryCatch3 = util.tryCatch3;
var errorObj = util.errorObj;
var PENDING = {};
var EMPTY_ARRAY = [];

function MappingPromiseArray(promises, fn, limit, _filter) {
    this.constructor$(promises);
    this._callback = fn;
    this._preservedValues = _filter === INTERNAL
        ? new Array(this.length())
        : null;
    this._limit = limit;
    this._inFlight = 0;
    this._queue = limit >= 1 ? [] : EMPTY_ARRAY;
    this._init$(void 0, -2);
}
util.inherits(MappingPromiseArray, PromiseArray);

MappingPromiseArray.prototype._init = function MappingPromiseArray$_init() {};

MappingPromiseArray.prototype._promiseFulfilled =
function MappingPromiseArray$_promiseFulfilled(value, index) {
    var values = this._values;
    if (values === null) return;

    var length = this.length();
    var preservedValues = this._preservedValues;
    var limit = this._limit;
    if (values[index] === PENDING) {
        values[index] = value;
        if (limit >= 1) {
            this._inFlight--;
            this._drainQueue();
            if (this._isResolved()) return;
        }
    } else {
        if (limit >= 1 && this._inFlight >= limit) {
            values[index] = value;
            this._queue.push(index);
            return;
        }
        if (preservedValues !== null) preservedValues[index] = value;

        var callback = this._callback;
        var receiver = this._promise._boundTo;
        var ret = tryCatch3(callback, receiver, value, index, length);
        if (ret === errorObj) return this._reject(ret.e);

        var maybePromise = cast(ret, void 0);
        if (maybePromise instanceof Promise) {
            if (maybePromise.isPending()) {
                if (limit >= 1) this._inFlight++;
                values[index] = PENDING;
                return maybePromise._proxyPromiseArray(this, index);
            } else if (maybePromise.isFulfilled()) {
                ret = maybePromise.value();
            } else {
                maybePromise._unsetRejectionIsUnhandled();
                return this._reject(maybePromise.reason());
            }
        }
        values[index] = ret;
    }
    var totalResolved = ++this._totalResolved;
    if (totalResolved >= length) {
        if (preservedValues !== null) {
            this._filter(values, preservedValues);
        } else {
            this._resolve(values);
        }

    }
};

MappingPromiseArray.prototype._drainQueue =
function MappingPromiseArray$_drainQueue() {
    var queue = this._queue;
    var limit = this._limit;
    var values = this._values;
    while (queue.length > 0 && this._inFlight < limit) {
        var index = queue.pop();
        this._promiseFulfilled(values[index], index);
    }
};

MappingPromiseArray.prototype._filter =
function MappingPromiseArray$_filter(booleans, values) {
    var len = values.length;
    var ret = new Array(len);
    var j = 0;
    for (var i = 0; i < len; ++i) {
        if (booleans[i]) ret[j++] = values[i];
    }
    ret.length = j;
    this._resolve(ret);
};

MappingPromiseArray.prototype.preservedValues =
function MappingPromiseArray$preserveValues() {
    return this._preservedValues;
};

function map(promises, fn, options, _filter) {
    var limit = typeof options === "object" && options !== null
        ? options.concurrency
        : 0;
    limit = typeof limit === "number" &&
        isFinite(limit) && limit >= 1 ? limit : 0;
    return new MappingPromiseArray(promises, fn, limit, _filter);
}

Promise.prototype.map = function Promise$map(fn, options) {
    if (typeof fn !== "function") return apiRejection("fn must be a function");

    return map(this, fn, options, null).promise();
};

Promise.map = function Promise$Map(promises, fn, options, _filter) {
    if (typeof fn !== "function") return apiRejection("fn must be a function");
    return map(promises, fn, options, _filter).promise();
};


};

},{"./util.js":36}],19:[function(require,module,exports){
/**
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
module.exports = function(Promise) {
var util = require("./util.js");
var async = require("./async.js");
var tryCatch2 = util.tryCatch2;
var tryCatch1 = util.tryCatch1;
var errorObj = util.errorObj;

function thrower(r) {
    throw r;
}

function Promise$_spreadAdapter(val, receiver) {
    if (!util.isArray(val)) return Promise$_successAdapter(val, receiver);
    var ret = util.tryCatchApply(this, [null].concat(val), receiver);
    if (ret === errorObj) {
        async.invokeLater(thrower, void 0, ret.e);
    }
}

function Promise$_successAdapter(val, receiver) {
    var nodeback = this;
    var ret = val === void 0
        ? tryCatch1(nodeback, receiver, null)
        : tryCatch2(nodeback, receiver, null, val);
    if (ret === errorObj) {
        async.invokeLater(thrower, void 0, ret.e);
    }
}
function Promise$_errorAdapter(reason, receiver) {
    var nodeback = this;
    var ret = tryCatch1(nodeback, receiver, reason);
    if (ret === errorObj) {
        async.invokeLater(thrower, void 0, ret.e);
    }
}

Promise.prototype.nodeify = function Promise$nodeify(nodeback, options) {
    if (typeof nodeback == "function") {
        var adapter = Promise$_successAdapter;
        if (options !== void 0 && Object(options).spread) {
            adapter = Promise$_spreadAdapter;
        }
        this._then(
            adapter,
            Promise$_errorAdapter,
            void 0,
            nodeback,
            this._boundTo
        );
    }
    return this;
};
};

},{"./async.js":3,"./util.js":36}],20:[function(require,module,exports){
/**
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
module.exports = function(Promise, PromiseArray) {
var util = require("./util.js");
var async = require("./async.js");
var errors = require("./errors.js");
var tryCatch1 = util.tryCatch1;
var errorObj = util.errorObj;

Promise.prototype.progressed = function Promise$progressed(handler) {
    return this._then(void 0, void 0, handler, void 0, void 0);
};

Promise.prototype._progress = function Promise$_progress(progressValue) {
    if (this._isFollowingOrFulfilledOrRejected()) return;
    this._progressUnchecked(progressValue);

};

Promise.prototype._progressHandlerAt =
function Promise$_progressHandlerAt(index) {
    return index === 0
        ? this._progressHandler0
        : this[(index << 2) + index - 5 + 2];
};

Promise.prototype._doProgressWith =
function Promise$_doProgressWith(progression) {
    var progressValue = progression.value;
    var handler = progression.handler;
    var promise = progression.promise;
    var receiver = progression.receiver;

    var ret = tryCatch1(handler, receiver, progressValue);
    if (ret === errorObj) {
        if (ret.e != null &&
            ret.e.name !== "StopProgressPropagation") {
            var trace = errors.canAttach(ret.e)
                ? ret.e : new Error(ret.e + "");
            promise._attachExtraTrace(trace);
            promise._progress(ret.e);
        }
    } else if (ret instanceof Promise) {
        ret._then(promise._progress, null, null, promise, void 0);
    } else {
        promise._progress(ret);
    }
};


Promise.prototype._progressUnchecked =
function Promise$_progressUnchecked(progressValue) {
    if (!this.isPending()) return;
    var len = this._length();
    var progress = this._progress;
    for (var i = 0; i < len; i++) {
        var handler = this._progressHandlerAt(i);
        var promise = this._promiseAt(i);
        if (!(promise instanceof Promise)) {
            var receiver = this._receiverAt(i);
            if (typeof handler === "function") {
                handler.call(receiver, progressValue, promise);
            } else if (receiver instanceof Promise && receiver._isProxied()) {
                receiver._progressUnchecked(progressValue);
            } else if (receiver instanceof PromiseArray) {
                receiver._promiseProgressed(progressValue, promise);
            }
            continue;
        }

        if (typeof handler === "function") {
            async.invoke(this._doProgressWith, this, {
                handler: handler,
                promise: promise,
                receiver: this._receiverAt(i),
                value: progressValue
            });
        } else {
            async.invoke(progress, promise, progressValue);
        }
    }
};
};

},{"./async.js":3,"./errors.js":11,"./util.js":36}],21:[function(require,module,exports){
(function (process){
/**
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
var old;
if (typeof Promise !== "undefined") old = Promise;
function noConflict(bluebird) {
    try { if (Promise === bluebird) Promise = old; }
    catch (e) {}
    return bluebird;
}
module.exports = function() {
var util = require("./util.js");
var async = require("./async.js");
var errors = require("./errors.js");

var INTERNAL = function(){};
var APPLY = {};
var NEXT_FILTER = {e: null};

var cast = require("./thenables.js")(Promise, INTERNAL);
var PromiseArray = require("./promise_array.js")(Promise, INTERNAL, cast);
var CapturedTrace = require("./captured_trace.js")();
var CatchFilter = require("./catch_filter.js")(NEXT_FILTER);
var PromiseResolver = require("./promise_resolver.js");

var isArray = util.isArray;

var errorObj = util.errorObj;
var tryCatch1 = util.tryCatch1;
var tryCatch2 = util.tryCatch2;
var tryCatchApply = util.tryCatchApply;
var RangeError = errors.RangeError;
var TypeError = errors.TypeError;
var CancellationError = errors.CancellationError;
var TimeoutError = errors.TimeoutError;
var OperationalError = errors.OperationalError;
var originatesFromRejection = errors.originatesFromRejection;
var markAsOriginatingFromRejection = errors.markAsOriginatingFromRejection;
var canAttach = errors.canAttach;
var thrower = util.thrower;
var apiRejection = require("./errors_api_rejection")(Promise);


var makeSelfResolutionError = function Promise$_makeSelfResolutionError() {
    return new TypeError("circular promise resolution chain");
};

function Promise(resolver) {
    if (typeof resolver !== "function") {
        throw new TypeError("the promise constructor requires a resolver function");
    }
    if (this.constructor !== Promise) {
        throw new TypeError("the promise constructor cannot be invoked directly");
    }
    this._bitField = 0;
    this._fulfillmentHandler0 = void 0;
    this._rejectionHandler0 = void 0;
    this._promise0 = void 0;
    this._receiver0 = void 0;
    this._settledValue = void 0;
    this._boundTo = void 0;
    if (resolver !== INTERNAL) this._resolveFromResolver(resolver);
}

Promise.prototype.bind = function Promise$bind(thisArg) {
    var ret = new Promise(INTERNAL);
    ret._follow(this);
    ret._propagateFrom(this, 2 | 1);
    ret._setBoundTo(thisArg);
    return ret;
};

Promise.prototype.toString = function Promise$toString() {
    return "[object Promise]";
};

Promise.prototype.caught = Promise.prototype["catch"] =
function Promise$catch(fn) {
    var len = arguments.length;
    if (len > 1) {
        var catchInstances = new Array(len - 1),
            j = 0, i;
        for (i = 0; i < len - 1; ++i) {
            var item = arguments[i];
            if (typeof item === "function") {
                catchInstances[j++] = item;
            } else {
                var catchFilterTypeError =
                    new TypeError(
                        "A catch filter must be an error constructor "
                        + "or a filter function");

                this._attachExtraTrace(catchFilterTypeError);
                async.invoke(this._reject, this, catchFilterTypeError);
                return;
            }
        }
        catchInstances.length = j;
        fn = arguments[i];

        this._resetTrace();
        var catchFilter = new CatchFilter(catchInstances, fn, this);
        return this._then(void 0, catchFilter.doFilter, void 0,
            catchFilter, void 0);
    }
    return this._then(void 0, fn, void 0, void 0, void 0);
};

Promise.prototype.then =
function Promise$then(didFulfill, didReject, didProgress) {
    return this._then(didFulfill, didReject, didProgress,
        void 0, void 0);
};


Promise.prototype.done =
function Promise$done(didFulfill, didReject, didProgress) {
    var promise = this._then(didFulfill, didReject, didProgress,
        void 0, void 0);
    promise._setIsFinal();
};

Promise.prototype.spread = function Promise$spread(didFulfill, didReject) {
    return this._then(didFulfill, didReject, void 0,
        APPLY, void 0);
};

Promise.prototype.isCancellable = function Promise$isCancellable() {
    return !this.isResolved() &&
        this._cancellable();
};

Promise.prototype.toJSON = function Promise$toJSON() {
    var ret = {
        isFulfilled: false,
        isRejected: false,
        fulfillmentValue: void 0,
        rejectionReason: void 0
    };
    if (this.isFulfilled()) {
        ret.fulfillmentValue = this._settledValue;
        ret.isFulfilled = true;
    } else if (this.isRejected()) {
        ret.rejectionReason = this._settledValue;
        ret.isRejected = true;
    }
    return ret;
};

Promise.prototype.all = function Promise$all() {
    return new PromiseArray(this).promise();
};


Promise.is = function Promise$Is(val) {
    return val instanceof Promise;
};

Promise.all = function Promise$All(promises) {
    return new PromiseArray(promises).promise();
};

Promise.prototype.error = function Promise$_error(fn) {
    return this.caught(originatesFromRejection, fn);
};

Promise.prototype._resolveFromSyncValue =
function Promise$_resolveFromSyncValue(value) {
    if (value === errorObj) {
        this._cleanValues();
        this._setRejected();
        this._settledValue = value.e;
        this._ensurePossibleRejectionHandled();
    } else {
        var maybePromise = cast(value, void 0);
        if (maybePromise instanceof Promise) {
            this._follow(maybePromise);
        } else {
            this._cleanValues();
            this._setFulfilled();
            this._settledValue = value;
        }
    }
};

Promise.method = function Promise$_Method(fn) {
    if (typeof fn !== "function") {
        throw new TypeError("fn must be a function");
    }
    return function Promise$_method() {
        var value;
        switch(arguments.length) {
        case 0: value = tryCatch1(fn, this, void 0); break;
        case 1: value = tryCatch1(fn, this, arguments[0]); break;
        case 2: value = tryCatch2(fn, this, arguments[0], arguments[1]); break;
        default:
            var $_len = arguments.length;var args = new Array($_len); for(var $_i = 0; $_i < $_len; ++$_i) {args[$_i] = arguments[$_i];}
            value = tryCatchApply(fn, args, this); break;
        }
        var ret = new Promise(INTERNAL);
        ret._setTrace(void 0);
        ret._resolveFromSyncValue(value);
        return ret;
    };
};

Promise.attempt = Promise["try"] = function Promise$_Try(fn, args, ctx) {
    if (typeof fn !== "function") {
        return apiRejection("fn must be a function");
    }
    var value = isArray(args)
        ? tryCatchApply(fn, args, ctx)
        : tryCatch1(fn, ctx, args);

    var ret = new Promise(INTERNAL);
    ret._setTrace(void 0);
    ret._resolveFromSyncValue(value);
    return ret;
};

Promise.defer = Promise.pending = function Promise$Defer() {
    var promise = new Promise(INTERNAL);
    promise._setTrace(void 0);
    return new PromiseResolver(promise);
};

Promise.bind = function Promise$Bind(thisArg) {
    var ret = new Promise(INTERNAL);
    ret._setTrace(void 0);
    ret._setFulfilled();
    ret._setBoundTo(thisArg);
    return ret;
};

Promise.cast = function Promise$_Cast(obj) {
    var ret = cast(obj, void 0);
    if (!(ret instanceof Promise)) {
        var val = ret;
        ret = new Promise(INTERNAL);
        ret._setTrace(void 0);
        ret._setFulfilled();
        ret._cleanValues();
        ret._settledValue = val;
    }
    return ret;
};

Promise.resolve = Promise.fulfilled = Promise.cast;

Promise.reject = Promise.rejected = function Promise$Reject(reason) {
    var ret = new Promise(INTERNAL);
    ret._setTrace(void 0);
    markAsOriginatingFromRejection(reason);
    ret._cleanValues();
    ret._setRejected();
    ret._settledValue = reason;
    if (!canAttach(reason)) {
        var trace = new Error(reason + "");
        ret._setCarriedStackTrace(trace);
    }
    ret._ensurePossibleRejectionHandled();
    return ret;
};

Promise.onPossiblyUnhandledRejection =
function Promise$OnPossiblyUnhandledRejection(fn) {
        CapturedTrace.possiblyUnhandledRejection = typeof fn === "function"
                                                    ? fn : void 0;
};

var unhandledRejectionHandled;
Promise.onUnhandledRejectionHandled =
function Promise$onUnhandledRejectionHandled(fn) {
    unhandledRejectionHandled = typeof fn === "function" ? fn : void 0;
};

var debugging = false || !!(
    typeof process !== "undefined" &&
    typeof process.execPath === "string" &&
    typeof process.env === "object" &&
    (process.env["BLUEBIRD_DEBUG"] ||
        process.env["NODE_ENV"] === "development")
);


Promise.longStackTraces = function Promise$LongStackTraces() {
    if (async.haveItemsQueued() &&
        debugging === false
   ) {
        throw new Error("cannot enable long stack traces after promises have been created");
    }
    debugging = CapturedTrace.isSupported();
};

Promise.hasLongStackTraces = function Promise$HasLongStackTraces() {
    return debugging && CapturedTrace.isSupported();
};

Promise.prototype._then =
function Promise$_then(
    didFulfill,
    didReject,
    didProgress,
    receiver,
    internalData
) {
    var haveInternalData = internalData !== void 0;
    var ret = haveInternalData ? internalData : new Promise(INTERNAL);

    if (!haveInternalData) {
        if (debugging) {
            var haveSameContext = this._peekContext() === this._traceParent;
            ret._traceParent = haveSameContext ? this._traceParent : this;
        }
        ret._propagateFrom(this, 7);
    }

    var callbackIndex =
        this._addCallbacks(didFulfill, didReject, didProgress, ret, receiver);

    if (this.isResolved()) {
        async.invoke(this._queueSettleAt, this, callbackIndex);
    }

    return ret;
};

Promise.prototype._length = function Promise$_length() {
    return this._bitField & 262143;
};

Promise.prototype._isFollowingOrFulfilledOrRejected =
function Promise$_isFollowingOrFulfilledOrRejected() {
    return (this._bitField & 939524096) > 0;
};

Promise.prototype._isFollowing = function Promise$_isFollowing() {
    return (this._bitField & 536870912) === 536870912;
};

Promise.prototype._setLength = function Promise$_setLength(len) {
    this._bitField = (this._bitField & -262144) |
        (len & 262143);
};

Promise.prototype._setFulfilled = function Promise$_setFulfilled() {
    this._bitField = this._bitField | 268435456;
};

Promise.prototype._setRejected = function Promise$_setRejected() {
    this._bitField = this._bitField | 134217728;
};

Promise.prototype._setFollowing = function Promise$_setFollowing() {
    this._bitField = this._bitField | 536870912;
};

Promise.prototype._setIsFinal = function Promise$_setIsFinal() {
    this._bitField = this._bitField | 33554432;
};

Promise.prototype._isFinal = function Promise$_isFinal() {
    return (this._bitField & 33554432) > 0;
};

Promise.prototype._cancellable = function Promise$_cancellable() {
    return (this._bitField & 67108864) > 0;
};

Promise.prototype._setCancellable = function Promise$_setCancellable() {
    this._bitField = this._bitField | 67108864;
};

Promise.prototype._unsetCancellable = function Promise$_unsetCancellable() {
    this._bitField = this._bitField & (~67108864);
};

Promise.prototype._setRejectionIsUnhandled =
function Promise$_setRejectionIsUnhandled() {
    this._bitField = this._bitField | 2097152;
};

Promise.prototype._unsetRejectionIsUnhandled =
function Promise$_unsetRejectionIsUnhandled() {
    this._bitField = this._bitField & (~2097152);
    if (this._isUnhandledRejectionNotified()) {
        this._unsetUnhandledRejectionIsNotified();
        this._notifyUnhandledRejectionIsHandled();
    }
};

Promise.prototype._isRejectionUnhandled =
function Promise$_isRejectionUnhandled() {
    return (this._bitField & 2097152) > 0;
};

Promise.prototype._setUnhandledRejectionIsNotified =
function Promise$_setUnhandledRejectionIsNotified() {
    this._bitField = this._bitField | 524288;
};

Promise.prototype._unsetUnhandledRejectionIsNotified =
function Promise$_unsetUnhandledRejectionIsNotified() {
    this._bitField = this._bitField & (~524288);
};

Promise.prototype._isUnhandledRejectionNotified =
function Promise$_isUnhandledRejectionNotified() {
    return (this._bitField & 524288) > 0;
};

Promise.prototype._setCarriedStackTrace =
function Promise$_setCarriedStackTrace(capturedTrace) {
    this._bitField = this._bitField | 1048576;
    this._fulfillmentHandler0 = capturedTrace;
};

Promise.prototype._unsetCarriedStackTrace =
function Promise$_unsetCarriedStackTrace() {
    this._bitField = this._bitField & (~1048576);
    this._fulfillmentHandler0 = void 0;
};

Promise.prototype._isCarryingStackTrace =
function Promise$_isCarryingStackTrace() {
    return (this._bitField & 1048576) > 0;
};

Promise.prototype._getCarriedStackTrace =
function Promise$_getCarriedStackTrace() {
    return this._isCarryingStackTrace()
        ? this._fulfillmentHandler0
        : void 0;
};

Promise.prototype._receiverAt = function Promise$_receiverAt(index) {
    var ret = index === 0
        ? this._receiver0
        : this[(index << 2) + index - 5 + 4];
    if (this._isBound() && ret === void 0) {
        return this._boundTo;
    }
    return ret;
};

Promise.prototype._promiseAt = function Promise$_promiseAt(index) {
    return index === 0
        ? this._promise0
        : this[(index << 2) + index - 5 + 3];
};

Promise.prototype._fulfillmentHandlerAt =
function Promise$_fulfillmentHandlerAt(index) {
    return index === 0
        ? this._fulfillmentHandler0
        : this[(index << 2) + index - 5 + 0];
};

Promise.prototype._rejectionHandlerAt =
function Promise$_rejectionHandlerAt(index) {
    return index === 0
        ? this._rejectionHandler0
        : this[(index << 2) + index - 5 + 1];
};

Promise.prototype._addCallbacks = function Promise$_addCallbacks(
    fulfill,
    reject,
    progress,
    promise,
    receiver
) {
    var index = this._length();

    if (index >= 262143 - 5) {
        index = 0;
        this._setLength(0);
    }

    if (index === 0) {
        this._promise0 = promise;
        if (receiver !== void 0) this._receiver0 = receiver;
        if (typeof fulfill === "function" && !this._isCarryingStackTrace())
            this._fulfillmentHandler0 = fulfill;
        if (typeof reject === "function") this._rejectionHandler0 = reject;
        if (typeof progress === "function") this._progressHandler0 = progress;
    } else {
        var base = (index << 2) + index - 5;
        this[base + 3] = promise;
        this[base + 4] = receiver;
        this[base + 0] = typeof fulfill === "function"
                                            ? fulfill : void 0;
        this[base + 1] = typeof reject === "function"
                                            ? reject : void 0;
        this[base + 2] = typeof progress === "function"
                                            ? progress : void 0;
    }
    this._setLength(index + 1);
    return index;
};

Promise.prototype._setProxyHandlers =
function Promise$_setProxyHandlers(receiver, promiseSlotValue) {
    var index = this._length();

    if (index >= 262143 - 5) {
        index = 0;
        this._setLength(0);
    }
    if (index === 0) {
        this._promise0 = promiseSlotValue;
        this._receiver0 = receiver;
    } else {
        var base = (index << 2) + index - 5;
        this[base + 3] = promiseSlotValue;
        this[base + 4] = receiver;
        this[base + 0] =
        this[base + 1] =
        this[base + 2] = void 0;
    }
    this._setLength(index + 1);
};

Promise.prototype._proxyPromiseArray =
function Promise$_proxyPromiseArray(promiseArray, index) {
    this._setProxyHandlers(promiseArray, index);
};

Promise.prototype._proxyPromise = function Promise$_proxyPromise(promise) {
    promise._setProxied();
    this._setProxyHandlers(promise, -1);
};

Promise.prototype._setBoundTo = function Promise$_setBoundTo(obj) {
    if (obj !== void 0) {
        this._bitField = this._bitField | 8388608;
        this._boundTo = obj;
    } else {
        this._bitField = this._bitField & (~8388608);
    }
};

Promise.prototype._isBound = function Promise$_isBound() {
    return (this._bitField & 8388608) === 8388608;
};

Promise.prototype._resolveFromResolver =
function Promise$_resolveFromResolver(resolver) {
    var promise = this;
    this._setTrace(void 0);
    this._pushContext();

    function Promise$_resolver(val) {
        if (promise._tryFollow(val)) {
            return;
        }
        promise._fulfill(val);
    }
    function Promise$_rejecter(val) {
        var trace = canAttach(val) ? val : new Error(val + "");
        promise._attachExtraTrace(trace);
        markAsOriginatingFromRejection(val);
        promise._reject(val, trace === val ? void 0 : trace);
    }
    var r = tryCatch2(resolver, void 0, Promise$_resolver, Promise$_rejecter);
    this._popContext();

    if (r !== void 0 && r === errorObj) {
        var e = r.e;
        var trace = canAttach(e) ? e : new Error(e + "");
        promise._reject(e, trace);
    }
};

Promise.prototype._spreadSlowCase =
function Promise$_spreadSlowCase(targetFn, promise, values, boundTo) {
    var promiseForAll = new PromiseArray(values).promise();
    var promise2 = promiseForAll._then(function() {
        return targetFn.apply(boundTo, arguments);
    }, void 0, void 0, APPLY, void 0);
    promise._follow(promise2);
};

Promise.prototype._callSpread =
function Promise$_callSpread(handler, promise, value) {
    var boundTo = this._boundTo;
    if (isArray(value)) {
        for (var i = 0, len = value.length; i < len; ++i) {
            if (cast(value[i], void 0) instanceof Promise) {
                this._spreadSlowCase(handler, promise, value, boundTo);
                return;
            }
        }
    }
    promise._pushContext();
    return tryCatchApply(handler, value, boundTo);
};

Promise.prototype._callHandler =
function Promise$_callHandler(
    handler, receiver, promise, value) {
    var x;
    if (receiver === APPLY && !this.isRejected()) {
        x = this._callSpread(handler, promise, value);
    } else {
        promise._pushContext();
        x = tryCatch1(handler, receiver, value);
    }
    promise._popContext();
    return x;
};

Promise.prototype._settlePromiseFromHandler =
function Promise$_settlePromiseFromHandler(
    handler, receiver, value, promise
) {
    if (!(promise instanceof Promise)) {
        handler.call(receiver, value, promise);
        return;
    }
    var x = this._callHandler(handler, receiver, promise, value);
    if (promise._isFollowing()) return;

    if (x === errorObj || x === promise || x === NEXT_FILTER) {
        var err = x === promise
                    ? makeSelfResolutionError()
                    : x.e;
        var trace = canAttach(err) ? err : new Error(err + "");
        if (x !== NEXT_FILTER) promise._attachExtraTrace(trace);
        promise._rejectUnchecked(err, trace);
    } else {
        var castValue = cast(x, promise);
        if (castValue instanceof Promise) {
            if (castValue.isRejected() &&
                !castValue._isCarryingStackTrace() &&
                !canAttach(castValue._settledValue)) {
                var trace = new Error(castValue._settledValue + "");
                promise._attachExtraTrace(trace);
                castValue._setCarriedStackTrace(trace);
            }
            promise._follow(castValue);
            promise._propagateFrom(castValue, 1);
        } else {
            promise._fulfillUnchecked(x);
        }
    }
};

Promise.prototype._follow =
function Promise$_follow(promise) {
    this._setFollowing();

    if (promise.isPending()) {
        this._propagateFrom(promise, 1);
        promise._proxyPromise(this);
    } else if (promise.isFulfilled()) {
        this._fulfillUnchecked(promise._settledValue);
    } else {
        this._rejectUnchecked(promise._settledValue,
            promise._getCarriedStackTrace());
    }

    if (promise._isRejectionUnhandled()) promise._unsetRejectionIsUnhandled();

    if (debugging &&
        promise._traceParent == null) {
        promise._traceParent = this;
    }
};

Promise.prototype._tryFollow =
function Promise$_tryFollow(value) {
    if (this._isFollowingOrFulfilledOrRejected() ||
        value === this) {
        return false;
    }
    var maybePromise = cast(value, void 0);
    if (!(maybePromise instanceof Promise)) {
        return false;
    }
    this._follow(maybePromise);
    return true;
};

Promise.prototype._resetTrace = function Promise$_resetTrace() {
    if (debugging) {
        this._trace = new CapturedTrace(this._peekContext() === void 0);
    }
};

Promise.prototype._setTrace = function Promise$_setTrace(parent) {
    if (debugging) {
        var context = this._peekContext();
        this._traceParent = context;
        var isTopLevel = context === void 0;
        if (parent !== void 0 &&
            parent._traceParent === context) {
            this._trace = parent._trace;
        } else {
            this._trace = new CapturedTrace(isTopLevel);
        }
    }
    return this;
};

Promise.prototype._attachExtraTrace =
function Promise$_attachExtraTrace(error) {
    if (debugging) {
        var promise = this;
        var stack = error.stack;
        stack = typeof stack === "string" ? stack.split("\n") : [];
        CapturedTrace.protectErrorMessageNewlines(stack);
        var headerLineCount = 1;
        var combinedTraces = 1;
        while(promise != null &&
            promise._trace != null) {
            stack = CapturedTrace.combine(
                stack,
                promise._trace.stack.split("\n")
            );
            promise = promise._traceParent;
            combinedTraces++;
        }

        var stackTraceLimit = Error.stackTraceLimit || 10;
        var max = (stackTraceLimit + headerLineCount) * combinedTraces;
        var len = stack.length;
        if (len > max) {
            stack.length = max;
        }

        if (len > 0)
            stack[0] = stack[0].split("\u0002\u0000\u0001").join("\n");

        if (stack.length <= headerLineCount) {
            error.stack = "(No stack trace)";
        } else {
            error.stack = stack.join("\n");
        }
    }
};

Promise.prototype._cleanValues = function Promise$_cleanValues() {
    if (this._cancellable()) {
        this._cancellationParent = void 0;
    }
};

Promise.prototype._propagateFrom =
function Promise$_propagateFrom(parent, flags) {
    if ((flags & 1) > 0 && parent._cancellable()) {
        this._setCancellable();
        this._cancellationParent = parent;
    }
    if ((flags & 4) > 0) {
        this._setBoundTo(parent._boundTo);
    }
    if ((flags & 2) > 0) {
        this._setTrace(parent);
    }
};

Promise.prototype._fulfill = function Promise$_fulfill(value) {
    if (this._isFollowingOrFulfilledOrRejected()) return;
    this._fulfillUnchecked(value);
};

Promise.prototype._reject =
function Promise$_reject(reason, carriedStackTrace) {
    if (this._isFollowingOrFulfilledOrRejected()) return;
    this._rejectUnchecked(reason, carriedStackTrace);
};

Promise.prototype._settlePromiseAt = function Promise$_settlePromiseAt(index) {
    var handler = this.isFulfilled()
        ? this._fulfillmentHandlerAt(index)
        : this._rejectionHandlerAt(index);

    var value = this._settledValue;
    var receiver = this._receiverAt(index);
    var promise = this._promiseAt(index);

    if (typeof handler === "function") {
        this._settlePromiseFromHandler(handler, receiver, value, promise);
    } else {
        var done = false;
        var isFulfilled = this.isFulfilled();
        if (receiver !== void 0) {
            if (receiver instanceof Promise &&
                receiver._isProxied()) {
                receiver._unsetProxied();

                if (isFulfilled) receiver._fulfillUnchecked(value);
                else receiver._rejectUnchecked(value,
                    this._getCarriedStackTrace());
                done = true;
            } else if (receiver instanceof PromiseArray) {
                if (isFulfilled) receiver._promiseFulfilled(value, promise);
                else receiver._promiseRejected(value, promise);
                done = true;
            }
        }

        if (!done) {
            if (isFulfilled) promise._fulfill(value);
            else promise._reject(value, this._getCarriedStackTrace());
        }
    }

    if (index >= 256) {
        this._queueGC();
    }
};

Promise.prototype._isProxied = function Promise$_isProxied() {
    return (this._bitField & 4194304) === 4194304;
};

Promise.prototype._setProxied = function Promise$_setProxied() {
    this._bitField = this._bitField | 4194304;
};

Promise.prototype._unsetProxied = function Promise$_unsetProxied() {
    this._bitField = this._bitField & (~4194304);
};

Promise.prototype._isGcQueued = function Promise$_isGcQueued() {
    return (this._bitField & -1073741824) === -1073741824;
};

Promise.prototype._setGcQueued = function Promise$_setGcQueued() {
    this._bitField = this._bitField | -1073741824;
};

Promise.prototype._unsetGcQueued = function Promise$_unsetGcQueued() {
    this._bitField = this._bitField & (~-1073741824);
};

Promise.prototype._queueGC = function Promise$_queueGC() {
    if (this._isGcQueued()) return;
    this._setGcQueued();
    async.invokeLater(this._gc, this, void 0);
};

Promise.prototype._gc = function Promise$gc() {
    var len = this._length() * 5;
    for (var i = 0; i < len; i++) {
        delete this[i];
    }
    this._setLength(0);
    this._unsetGcQueued();
};

Promise.prototype._queueSettleAt = function Promise$_queueSettleAt(index) {
    if (this._isRejectionUnhandled()) this._unsetRejectionIsUnhandled();
    async.invoke(this._settlePromiseAt, this, index);
};

Promise.prototype._fulfillUnchecked =
function Promise$_fulfillUnchecked(value) {
    if (!this.isPending()) return;
    if (value === this) {
        var err = makeSelfResolutionError();
        this._attachExtraTrace(err);
        return this._rejectUnchecked(err, void 0);
    }
    this._cleanValues();
    this._setFulfilled();
    this._settledValue = value;
    var len = this._length();

    if (len > 0) {
        async.invoke(this._settlePromises, this, len);
    }
};

Promise.prototype._rejectUncheckedCheckError =
function Promise$_rejectUncheckedCheckError(reason) {
    var trace = canAttach(reason) ? reason : new Error(reason + "");
    this._rejectUnchecked(reason, trace === reason ? void 0 : trace);
};

Promise.prototype._rejectUnchecked =
function Promise$_rejectUnchecked(reason, trace) {
    if (!this.isPending()) return;
    if (reason === this) {
        var err = makeSelfResolutionError();
        this._attachExtraTrace(err);
        return this._rejectUnchecked(err);
    }
    this._cleanValues();
    this._setRejected();
    this._settledValue = reason;

    if (this._isFinal()) {
        async.invokeLater(thrower, void 0, trace === void 0 ? reason : trace);
        return;
    }
    var len = this._length();

    if (trace !== void 0) this._setCarriedStackTrace(trace);

    if (len > 0) {
        async.invoke(this._rejectPromises, this, null);
    } else {
        this._ensurePossibleRejectionHandled();
    }
};

Promise.prototype._rejectPromises = function Promise$_rejectPromises() {
    this._settlePromises();
    this._unsetCarriedStackTrace();
};

Promise.prototype._settlePromises = function Promise$_settlePromises() {
    var len = this._length();
    for (var i = 0; i < len; i++) {
        this._settlePromiseAt(i);
    }
};

Promise.prototype._ensurePossibleRejectionHandled =
function Promise$_ensurePossibleRejectionHandled() {
    this._setRejectionIsUnhandled();
    if (CapturedTrace.possiblyUnhandledRejection !== void 0) {
        async.invokeLater(this._notifyUnhandledRejection, this, void 0);
    }
};

Promise.prototype._notifyUnhandledRejectionIsHandled =
function Promise$_notifyUnhandledRejectionIsHandled() {
    if (typeof unhandledRejectionHandled === "function") {
        async.invokeLater(unhandledRejectionHandled, void 0, this);
    }
};

Promise.prototype._notifyUnhandledRejection =
function Promise$_notifyUnhandledRejection() {
    if (this._isRejectionUnhandled()) {
        var reason = this._settledValue;
        var trace = this._getCarriedStackTrace();

        this._setUnhandledRejectionIsNotified();

        if (trace !== void 0) {
            this._unsetCarriedStackTrace();
            reason = trace;
        }
        if (typeof CapturedTrace.possiblyUnhandledRejection === "function") {
            CapturedTrace.possiblyUnhandledRejection(reason, this);
        }
    }
};

var contextStack = [];
Promise.prototype._peekContext = function Promise$_peekContext() {
    var lastIndex = contextStack.length - 1;
    if (lastIndex >= 0) {
        return contextStack[lastIndex];
    }
    return void 0;

};

Promise.prototype._pushContext = function Promise$_pushContext() {
    if (!debugging) return;
    contextStack.push(this);
};

Promise.prototype._popContext = function Promise$_popContext() {
    if (!debugging) return;
    contextStack.pop();
};

Promise.noConflict = function Promise$NoConflict() {
    return noConflict(Promise);
};

Promise.setScheduler = function(fn) {
    if (typeof fn !== "function") throw new TypeError("fn must be a function");
    async._schedule = fn;
};

if (!CapturedTrace.isSupported()) {
    Promise.longStackTraces = function(){};
    debugging = false;
}

Promise._makeSelfResolutionError = makeSelfResolutionError;
require("./finally.js")(Promise, NEXT_FILTER, cast);
require("./direct_resolve.js")(Promise);
require("./synchronous_inspection.js")(Promise);
require("./join.js")(Promise, PromiseArray, cast, INTERNAL);
Promise.RangeError = RangeError;
Promise.CancellationError = CancellationError;
Promise.TimeoutError = TimeoutError;
Promise.TypeError = TypeError;
Promise.OperationalError = OperationalError;
Promise.RejectionError = OperationalError;
Promise.AggregateError = errors.AggregateError;

util.toFastProperties(Promise);
util.toFastProperties(Promise.prototype);
Promise.Promise = Promise;
require('./timers.js')(Promise,INTERNAL,cast);
require('./race.js')(Promise,INTERNAL,cast);
require('./call_get.js')(Promise);
require('./generators.js')(Promise,apiRejection,INTERNAL,cast);
require('./map.js')(Promise,PromiseArray,apiRejection,cast,INTERNAL);
require('./nodeify.js')(Promise);
require('./promisify.js')(Promise,INTERNAL);
require('./props.js')(Promise,PromiseArray,cast);
require('./reduce.js')(Promise,PromiseArray,apiRejection,cast,INTERNAL);
require('./settle.js')(Promise,PromiseArray);
require('./some.js')(Promise,PromiseArray,apiRejection);
require('./progress.js')(Promise,PromiseArray);
require('./cancel.js')(Promise,INTERNAL);
require('./filter.js')(Promise,INTERNAL);
require('./any.js')(Promise,PromiseArray);
require('./each.js')(Promise,INTERNAL);
require('./using.js')(Promise,apiRejection,cast);

Promise.prototype = Promise.prototype;
return Promise;

};

}).call(this,require("/usr/local/share/npm/lib/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js"))
},{"./any.js":2,"./async.js":3,"./call_get.js":5,"./cancel.js":6,"./captured_trace.js":7,"./catch_filter.js":8,"./direct_resolve.js":9,"./each.js":10,"./errors.js":11,"./errors_api_rejection":12,"./filter.js":14,"./finally.js":15,"./generators.js":16,"./join.js":17,"./map.js":18,"./nodeify.js":19,"./progress.js":20,"./promise_array.js":22,"./promise_resolver.js":23,"./promisify.js":24,"./props.js":25,"./race.js":27,"./reduce.js":28,"./settle.js":30,"./some.js":31,"./synchronous_inspection.js":32,"./thenables.js":33,"./timers.js":34,"./using.js":35,"./util.js":36,"/usr/local/share/npm/lib/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js":51}],22:[function(require,module,exports){
/**
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
module.exports = function(Promise, INTERNAL, cast) {
var canAttach = require("./errors.js").canAttach;
var util = require("./util.js");
var isArray = util.isArray;

function toResolutionValue(val) {
    switch(val) {
    case -1: return void 0;
    case -2: return [];
    case -3: return {};
    }
}

function PromiseArray(values) {
    var promise = this._promise = new Promise(INTERNAL);
    var parent = void 0;
    if (values instanceof Promise) {
        parent = values;
        promise._propagateFrom(parent, 1 | 4);
    }
    promise._setTrace(parent);
    this._values = values;
    this._length = 0;
    this._totalResolved = 0;
    this._init(void 0, -2);
}
PromiseArray.prototype.length = function PromiseArray$length() {
    return this._length;
};

PromiseArray.prototype.promise = function PromiseArray$promise() {
    return this._promise;
};

PromiseArray.prototype._init =
function PromiseArray$_init(_, resolveValueIfEmpty) {
    var values = cast(this._values, void 0);
    if (values instanceof Promise) {
        this._values = values;
        values._setBoundTo(this._promise._boundTo);
        if (values.isFulfilled()) {
            values = values._settledValue;
            if (!isArray(values)) {
                var err = new Promise.TypeError("expecting an array, a promise or a thenable");
                this.__hardReject__(err);
                return;
            }
        } else if (values.isPending()) {
            values._then(
                PromiseArray$_init,
                this._reject,
                void 0,
                this,
                resolveValueIfEmpty
           );
            return;
        } else {
            values._unsetRejectionIsUnhandled();
            this._reject(values._settledValue);
            return;
        }
    } else if (!isArray(values)) {
        var err = new Promise.TypeError("expecting an array, a promise or a thenable");
        this.__hardReject__(err);
        return;
    }

    if (values.length === 0) {
        if (resolveValueIfEmpty === -5) {
            this._resolveEmptyArray();
        }
        else {
            this._resolve(toResolutionValue(resolveValueIfEmpty));
        }
        return;
    }
    var len = this.getActualLength(values.length);
    var newLen = len;
    var newValues = this.shouldCopyValues() ? new Array(len) : this._values;
    var isDirectScanNeeded = false;
    for (var i = 0; i < len; ++i) {
        var maybePromise = cast(values[i], void 0);
        if (maybePromise instanceof Promise) {
            if (maybePromise.isPending()) {
                maybePromise._proxyPromiseArray(this, i);
            } else {
                maybePromise._unsetRejectionIsUnhandled();
                isDirectScanNeeded = true;
            }
        } else {
            isDirectScanNeeded = true;
        }
        newValues[i] = maybePromise;
    }
    this._values = newValues;
    this._length = newLen;
    if (isDirectScanNeeded) {
        this._scanDirectValues(len);
    }
};

PromiseArray.prototype._settlePromiseAt =
function PromiseArray$_settlePromiseAt(index) {
    var value = this._values[index];
    if (!(value instanceof Promise)) {
        this._promiseFulfilled(value, index);
    } else if (value.isFulfilled()) {
        this._promiseFulfilled(value._settledValue, index);
    } else if (value.isRejected()) {
        this._promiseRejected(value._settledValue, index);
    }
};

PromiseArray.prototype._scanDirectValues =
function PromiseArray$_scanDirectValues(len) {
    for (var i = 0; i < len; ++i) {
        if (this._isResolved()) {
            break;
        }
        this._settlePromiseAt(i);
    }
};

PromiseArray.prototype._isResolved = function PromiseArray$_isResolved() {
    return this._values === null;
};

PromiseArray.prototype._resolve = function PromiseArray$_resolve(value) {
    this._values = null;
    this._promise._fulfill(value);
};

PromiseArray.prototype.__hardReject__ =
PromiseArray.prototype._reject = function PromiseArray$_reject(reason) {
    this._values = null;
    var trace = canAttach(reason) ? reason : new Error(reason + "");
    this._promise._attachExtraTrace(trace);
    this._promise._reject(reason, trace);
};

PromiseArray.prototype._promiseProgressed =
function PromiseArray$_promiseProgressed(progressValue, index) {
    if (this._isResolved()) return;
    this._promise._progress({
        index: index,
        value: progressValue
    });
};


PromiseArray.prototype._promiseFulfilled =
function PromiseArray$_promiseFulfilled(value, index) {
    if (this._isResolved()) return;
    this._values[index] = value;
    var totalResolved = ++this._totalResolved;
    if (totalResolved >= this._length) {
        this._resolve(this._values);
    }
};

PromiseArray.prototype._promiseRejected =
function PromiseArray$_promiseRejected(reason, index) {
    if (this._isResolved()) return;
    this._totalResolved++;
    this._reject(reason);
};

PromiseArray.prototype.shouldCopyValues =
function PromiseArray$_shouldCopyValues() {
    return true;
};

PromiseArray.prototype.getActualLength =
function PromiseArray$getActualLength(len) {
    return len;
};

return PromiseArray;
};

},{"./errors.js":11,"./util.js":36}],23:[function(require,module,exports){
/**
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
var util = require("./util.js");
var maybeWrapAsError = util.maybeWrapAsError;
var errors = require("./errors.js");
var TimeoutError = errors.TimeoutError;
var OperationalError = errors.OperationalError;
var async = require("./async.js");
var haveGetters = util.haveGetters;
var es5 = require("./es5.js");

function isUntypedError(obj) {
    return obj instanceof Error &&
        es5.getPrototypeOf(obj) === Error.prototype;
}

function wrapAsOperationalError(obj) {
    var ret;
    if (isUntypedError(obj)) {
        ret = new OperationalError(obj);
    } else {
        ret = obj;
    }
    errors.markAsOriginatingFromRejection(ret);
    return ret;
}

function nodebackForPromise(promise) {
    function PromiseResolver$_callback(err, value) {
        if (promise === null) return;

        if (err) {
            var wrapped = wrapAsOperationalError(maybeWrapAsError(err));
            promise._attachExtraTrace(wrapped);
            promise._reject(wrapped);
        } else if (arguments.length > 2) {
            var $_len = arguments.length;var args = new Array($_len - 1); for(var $_i = 1; $_i < $_len; ++$_i) {args[$_i - 1] = arguments[$_i];}
            promise._fulfill(args);
        } else {
            promise._fulfill(value);
        }

        promise = null;
    }
    return PromiseResolver$_callback;
}


var PromiseResolver;
if (!haveGetters) {
    PromiseResolver = function PromiseResolver(promise) {
        this.promise = promise;
        this.asCallback = nodebackForPromise(promise);
        this.callback = this.asCallback;
    };
}
else {
    PromiseResolver = function PromiseResolver(promise) {
        this.promise = promise;
    };
}
if (haveGetters) {
    var prop = {
        get: function() {
            return nodebackForPromise(this.promise);
        }
    };
    es5.defineProperty(PromiseResolver.prototype, "asCallback", prop);
    es5.defineProperty(PromiseResolver.prototype, "callback", prop);
}

PromiseResolver._nodebackForPromise = nodebackForPromise;

PromiseResolver.prototype.toString = function PromiseResolver$toString() {
    return "[object PromiseResolver]";
};

PromiseResolver.prototype.resolve =
PromiseResolver.prototype.fulfill = function PromiseResolver$resolve(value) {
    if (!(this instanceof PromiseResolver)) {
        throw new TypeError("Illegal invocation, resolver resolve/reject must be called within a resolver context. Consider using the promise constructor instead.");
    }

    var promise = this.promise;
    if (promise._tryFollow(value)) {
        return;
    }
    async.invoke(promise._fulfill, promise, value);
};

PromiseResolver.prototype.reject = function PromiseResolver$reject(reason) {
    if (!(this instanceof PromiseResolver)) {
        throw new TypeError("Illegal invocation, resolver resolve/reject must be called within a resolver context. Consider using the promise constructor instead.");
    }

    var promise = this.promise;
    errors.markAsOriginatingFromRejection(reason);
    var trace = errors.canAttach(reason) ? reason : new Error(reason + "");
    promise._attachExtraTrace(trace);
    async.invoke(promise._reject, promise, reason);
    if (trace !== reason) {
        async.invoke(this._setCarriedStackTrace, this, trace);
    }
};

PromiseResolver.prototype.progress =
function PromiseResolver$progress(value) {
    if (!(this instanceof PromiseResolver)) {
        throw new TypeError("Illegal invocation, resolver resolve/reject must be called within a resolver context. Consider using the promise constructor instead.");
    }
    async.invoke(this.promise._progress, this.promise, value);
};

PromiseResolver.prototype.cancel = function PromiseResolver$cancel() {
    async.invoke(this.promise.cancel, this.promise, void 0);
};

PromiseResolver.prototype.timeout = function PromiseResolver$timeout() {
    this.reject(new TimeoutError("timeout"));
};

PromiseResolver.prototype.isResolved = function PromiseResolver$isResolved() {
    return this.promise.isResolved();
};

PromiseResolver.prototype.toJSON = function PromiseResolver$toJSON() {
    return this.promise.toJSON();
};

PromiseResolver.prototype._setCarriedStackTrace =
function PromiseResolver$_setCarriedStackTrace(trace) {
    if (this.promise.isRejected()) {
        this.promise._setCarriedStackTrace(trace);
    }
};

module.exports = PromiseResolver;

},{"./async.js":3,"./errors.js":11,"./es5.js":13,"./util.js":36}],24:[function(require,module,exports){
/**
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
module.exports = function(Promise, INTERNAL) {
var THIS = {};
var util = require("./util.js");
var nodebackForPromise = require("./promise_resolver.js")
    ._nodebackForPromise;
var withAppended = util.withAppended;
var maybeWrapAsError = util.maybeWrapAsError;
var canEvaluate = util.canEvaluate;
var TypeError = require("./errors").TypeError;
var defaultSuffix = "Async";
var defaultFilter = function(name, func) {
    return util.isIdentifier(name) &&
        name.charAt(0) !== "_" &&
        !util.isClass(func);
};
var defaultPromisified = {__isPromisified__: true};


function escapeIdentRegex(str) {
    return str.replace(/([$])/, "\\$");
}

function isPromisified(fn) {
    try {
        return fn.__isPromisified__ === true;
    }
    catch (e) {
        return false;
    }
}

function hasPromisified(obj, key, suffix) {
    var val = util.getDataPropertyOrDefault(obj, key + suffix,
                                            defaultPromisified);
    return val ? isPromisified(val) : false;
}
function checkValid(ret, suffix, suffixRegexp) {
    for (var i = 0; i < ret.length; i += 2) {
        var key = ret[i];
        if (suffixRegexp.test(key)) {
            var keyWithoutAsyncSuffix = key.replace(suffixRegexp, "");
            for (var j = 0; j < ret.length; j += 2) {
                if (ret[j] === keyWithoutAsyncSuffix) {
                    throw new TypeError("Cannot promisify an API " +
                        "that has normal methods with '"+suffix+"'-suffix");
                }
            }
        }
    }
}

function promisifiableMethods(obj, suffix, suffixRegexp, filter) {
    var keys = util.inheritedDataKeys(obj);
    var ret = [];
    for (var i = 0; i < keys.length; ++i) {
        var key = keys[i];
        var value = obj[key];
        if (typeof value === "function" &&
            !isPromisified(value) &&
            !hasPromisified(obj, key, suffix) &&
            filter(key, value, obj)) {
            ret.push(key, value);
        }
    }
    checkValid(ret, suffix, suffixRegexp);
    return ret;
}

function switchCaseArgumentOrder(likelyArgumentCount) {
    var ret = [likelyArgumentCount];
    var min = Math.max(0, likelyArgumentCount - 1 - 5);
    for(var i = likelyArgumentCount - 1; i >= min; --i) {
        if (i === likelyArgumentCount) continue;
        ret.push(i);
    }
    for(var i = likelyArgumentCount + 1; i <= 5; ++i) {
        ret.push(i);
    }
    return ret;
}

function argumentSequence(argumentCount) {
    return util.filledRange(argumentCount, "arguments[", "]");
}

function parameterDeclaration(parameterCount) {
    return util.filledRange(parameterCount, "_arg", "");
}

function parameterCount(fn) {
    if (typeof fn.length === "number") {
        return Math.max(Math.min(fn.length, 1023 + 1), 0);
    }
    return 0;
}

function generatePropertyAccess(key) {
    if (util.isIdentifier(key)) {
        return "." + key;
    }
    else return "['" + key.replace(/(['\\])/g, "\\$1") + "']";
}

function makeNodePromisifiedEval(callback, receiver, originalName, fn, suffix) {
    var newParameterCount = Math.max(0, parameterCount(fn) - 1);
    var argumentOrder = switchCaseArgumentOrder(newParameterCount);
    var callbackName =
        (typeof originalName === "string" && util.isIdentifier(originalName)
            ? originalName + suffix
            : "promisified");

    function generateCallForArgumentCount(count) {
        var args = argumentSequence(count).join(", ");
        var comma = count > 0 ? ", " : "";
        var ret;
        if (typeof callback === "string") {
            ret = "                                                          \n\
                this.method(args, fn);                                       \n\
                break;                                                       \n\
            ".replace(".method", generatePropertyAccess(callback));
        } else if (receiver === THIS) {
            ret =  "                                                         \n\
                callback.call(this, args, fn);                               \n\
                break;                                                       \n\
            ";
        } else if (receiver !== void 0) {
            ret =  "                                                         \n\
                callback.call(receiver, args, fn);                           \n\
                break;                                                       \n\
            ";
        } else {
            ret =  "                                                         \n\
                callback(args, fn);                                          \n\
                break;                                                       \n\
            ";
        }
        return ret.replace("args", args).replace(", ", comma);
    }

    function generateArgumentSwitchCase() {
        var ret = "";
        for(var i = 0; i < argumentOrder.length; ++i) {
            ret += "case " + argumentOrder[i] +":" +
                generateCallForArgumentCount(argumentOrder[i]);
        }
        var codeForCall;
        if (typeof callback === "string") {
            codeForCall = "                                                  \n\
                this.property.apply(this, args);                             \n\
            "
                .replace(".property", generatePropertyAccess(callback));
        } else if (receiver === THIS) {
            codeForCall = "                                                  \n\
                callback.apply(this, args);                                  \n\
            ";
        } else {
            codeForCall = "                                                  \n\
                callback.apply(receiver, args);                              \n\
            ";
        }

        ret += "                                                             \n\
        default:                                                             \n\
            var args = new Array(len + 1);                                   \n\
            var i = 0;                                                       \n\
            for (var i = 0; i < len; ++i) {                                  \n\
               args[i] = arguments[i];                                       \n\
            }                                                                \n\
            args[i] = fn;                                                    \n\
            [CodeForCall]                                                    \n\
            break;                                                           \n\
        ".replace("[CodeForCall]", codeForCall);
        return ret;
    }

    return new Function("Promise",
                        "callback",
                        "receiver",
                        "withAppended",
                        "maybeWrapAsError",
                        "nodebackForPromise",
                        "INTERNAL","                                         \n\
        var ret = function FunctionName(Parameters) {                        \n\
            'use strict';                                                    \n\
            var len = arguments.length;                                      \n\
            var promise = new Promise(INTERNAL);                             \n\
            promise._setTrace(void 0);                                       \n\
            var fn = nodebackForPromise(promise);                            \n\
            try {                                                            \n\
                switch(len) {                                                \n\
                    [CodeForSwitchCase]                                      \n\
                }                                                            \n\
            } catch (e) {                                                    \n\
                var wrapped = maybeWrapAsError(e);                           \n\
                promise._attachExtraTrace(wrapped);                          \n\
                promise._reject(wrapped);                                    \n\
            }                                                                \n\
            return promise;                                                  \n\
        };                                                                   \n\
        ret.__isPromisified__ = true;                                        \n\
        return ret;                                                          \n\
        "
        .replace("FunctionName", callbackName)
        .replace("Parameters", parameterDeclaration(newParameterCount))
        .replace("[CodeForSwitchCase]", generateArgumentSwitchCase()))(
            Promise,
            callback,
            receiver,
            withAppended,
            maybeWrapAsError,
            nodebackForPromise,
            INTERNAL
        );
}

function makeNodePromisifiedClosure(callback, receiver) {
    function promisified() {
        var _receiver = receiver;
        if (receiver === THIS) _receiver = this;
        if (typeof callback === "string") {
            callback = _receiver[callback];
        }
        var promise = new Promise(INTERNAL);
        promise._setTrace(void 0);
        var fn = nodebackForPromise(promise);
        try {
            callback.apply(_receiver, withAppended(arguments, fn));
        } catch(e) {
            var wrapped = maybeWrapAsError(e);
            promise._attachExtraTrace(wrapped);
            promise._reject(wrapped);
        }
        return promise;
    }
    promisified.__isPromisified__ = true;
    return promisified;
}

var makeNodePromisified = canEvaluate
    ? makeNodePromisifiedEval
    : makeNodePromisifiedClosure;

function promisifyAll(obj, suffix, filter, promisifier) {
    var suffixRegexp = new RegExp(escapeIdentRegex(suffix) + "$");
    var methods =
        promisifiableMethods(obj, suffix, suffixRegexp, filter);

    for (var i = 0, len = methods.length; i < len; i+= 2) {
        var key = methods[i];
        var fn = methods[i+1];
        var promisifiedKey = key + suffix;
        obj[promisifiedKey] = promisifier === makeNodePromisified
                ? makeNodePromisified(key, THIS, key, fn, suffix)
                : promisifier(fn);
    }
    util.toFastProperties(obj);
    return obj;
}

function promisify(callback, receiver) {
    return makeNodePromisified(callback, receiver, void 0, callback);
}

Promise.promisify = function Promise$Promisify(fn, receiver) {
    if (typeof fn !== "function") {
        throw new TypeError("fn must be a function");
    }
    if (isPromisified(fn)) {
        return fn;
    }
    return promisify(fn, arguments.length < 2 ? THIS : receiver);
};

Promise.promisifyAll = function Promise$PromisifyAll(target, options) {
    if (typeof target !== "function" && typeof target !== "object") {
        throw new TypeError("the target of promisifyAll must be an object or a function");
    }
    options = Object(options);
    var suffix = options.suffix;
    if (typeof suffix !== "string") suffix = defaultSuffix;
    var filter = options.filter;
    if (typeof filter !== "function") filter = defaultFilter;
    var promisifier = options.promisifier;
    if (typeof promisifier !== "function") promisifier = makeNodePromisified;

    if (!util.isIdentifier(suffix)) {
        throw new RangeError("suffix must be a valid identifier");
    }

    var keys = util.inheritedDataKeys(target, {includeHidden: true});
    for (var i = 0; i < keys.length; ++i) {
        var value = target[keys[i]];
        if (keys[i] !== "constructor" &&
            util.isClass(value)) {
            promisifyAll(value.prototype, suffix, filter, promisifier);
            promisifyAll(value, suffix, filter, promisifier);
        }
    }

    return promisifyAll(target, suffix, filter, promisifier);
};
};


},{"./errors":11,"./promise_resolver.js":23,"./util.js":36}],25:[function(require,module,exports){
/**
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
module.exports = function(Promise, PromiseArray, cast) {
var util = require("./util.js");
var apiRejection = require("./errors_api_rejection")(Promise);
var isObject = util.isObject;
var es5 = require("./es5.js");

function PropertiesPromiseArray(obj) {
    var keys = es5.keys(obj);
    var len = keys.length;
    var values = new Array(len * 2);
    for (var i = 0; i < len; ++i) {
        var key = keys[i];
        values[i] = obj[key];
        values[i + len] = key;
    }
    this.constructor$(values);
}
util.inherits(PropertiesPromiseArray, PromiseArray);

PropertiesPromiseArray.prototype._init =
function PropertiesPromiseArray$_init() {
    this._init$(void 0, -3) ;
};

PropertiesPromiseArray.prototype._promiseFulfilled =
function PropertiesPromiseArray$_promiseFulfilled(value, index) {
    if (this._isResolved()) return;
    this._values[index] = value;
    var totalResolved = ++this._totalResolved;
    if (totalResolved >= this._length) {
        var val = {};
        var keyOffset = this.length();
        for (var i = 0, len = this.length(); i < len; ++i) {
            val[this._values[i + keyOffset]] = this._values[i];
        }
        this._resolve(val);
    }
};

PropertiesPromiseArray.prototype._promiseProgressed =
function PropertiesPromiseArray$_promiseProgressed(value, index) {
    if (this._isResolved()) return;

    this._promise._progress({
        key: this._values[index + this.length()],
        value: value
    });
};

PropertiesPromiseArray.prototype.shouldCopyValues =
function PropertiesPromiseArray$_shouldCopyValues() {
    return false;
};

PropertiesPromiseArray.prototype.getActualLength =
function PropertiesPromiseArray$getActualLength(len) {
    return len >> 1;
};

function Promise$_Props(promises) {
    var ret;
    var castValue = cast(promises, void 0);

    if (!isObject(castValue)) {
        return apiRejection("cannot await properties of a non-object");
    } else if (castValue instanceof Promise) {
        ret = castValue._then(Promise.props, void 0, void 0, void 0, void 0);
    } else {
        ret = new PropertiesPromiseArray(castValue).promise();
    }

    if (castValue instanceof Promise) {
        ret._propagateFrom(castValue, 4);
    }
    return ret;
}

Promise.prototype.props = function Promise$props() {
    return Promise$_Props(this);
};

Promise.props = function Promise$Props(promises) {
    return Promise$_Props(promises);
};
};

},{"./errors_api_rejection":12,"./es5.js":13,"./util.js":36}],26:[function(require,module,exports){
/**
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
function arrayCopy(src, srcIndex, dst, dstIndex, len) {
    for (var j = 0; j < len; ++j) {
        dst[j + dstIndex] = src[j + srcIndex];
    }
}

function Queue(capacity) {
    this._capacity = capacity;
    this._length = 0;
    this._front = 0;
    this._makeCapacity();
}

Queue.prototype._willBeOverCapacity =
function Queue$_willBeOverCapacity(size) {
    return this._capacity < size;
};

Queue.prototype._pushOne = function Queue$_pushOne(arg) {
    var length = this.length();
    this._checkCapacity(length + 1);
    var i = (this._front + length) & (this._capacity - 1);
    this[i] = arg;
    this._length = length + 1;
};

Queue.prototype.push = function Queue$push(fn, receiver, arg) {
    var length = this.length() + 3;
    if (this._willBeOverCapacity(length)) {
        this._pushOne(fn);
        this._pushOne(receiver);
        this._pushOne(arg);
        return;
    }
    var j = this._front + length - 3;
    this._checkCapacity(length);
    var wrapMask = this._capacity - 1;
    this[(j + 0) & wrapMask] = fn;
    this[(j + 1) & wrapMask] = receiver;
    this[(j + 2) & wrapMask] = arg;
    this._length = length;
};

Queue.prototype.shift = function Queue$shift() {
    var front = this._front,
        ret = this[front];

    this[front] = void 0;
    this._front = (front + 1) & (this._capacity - 1);
    this._length--;
    return ret;
};

Queue.prototype.length = function Queue$length() {
    return this._length;
};

Queue.prototype._makeCapacity = function Queue$_makeCapacity() {
    var len = this._capacity;
    for (var i = 0; i < len; ++i) {
        this[i] = void 0;
    }
};

Queue.prototype._checkCapacity = function Queue$_checkCapacity(size) {
    if (this._capacity < size) {
        this._resizeTo(this._capacity << 3);
    }
};

Queue.prototype._resizeTo = function Queue$_resizeTo(capacity) {
    var oldFront = this._front;
    var oldCapacity = this._capacity;
    var oldQueue = new Array(oldCapacity);
    var length = this.length();

    arrayCopy(this, 0, oldQueue, 0, oldCapacity);
    this._capacity = capacity;
    this._makeCapacity();
    this._front = 0;
    if (oldFront + length <= oldCapacity) {
        arrayCopy(oldQueue, oldFront, this, 0, length);
    } else {        var lengthBeforeWrapping =
            length - ((oldFront + length) & (oldCapacity - 1));

        arrayCopy(oldQueue, oldFront, this, 0, lengthBeforeWrapping);
        arrayCopy(oldQueue, 0, this, lengthBeforeWrapping,
                    length - lengthBeforeWrapping);
    }
};

module.exports = Queue;

},{}],27:[function(require,module,exports){
/**
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
module.exports = function(Promise, INTERNAL, cast) {
var apiRejection = require("./errors_api_rejection.js")(Promise);
var isArray = require("./util.js").isArray;

var raceLater = function Promise$_raceLater(promise) {
    return promise.then(function(array) {
        return Promise$_Race(array, promise);
    });
};

var hasOwn = {}.hasOwnProperty;
function Promise$_Race(promises, parent) {
    var maybePromise = cast(promises, void 0);

    if (maybePromise instanceof Promise) {
        return raceLater(maybePromise);
    } else if (!isArray(promises)) {
        return apiRejection("expecting an array, a promise or a thenable");
    }

    var ret = new Promise(INTERNAL);
    if (parent !== void 0) {
        ret._propagateFrom(parent, 7);
    } else {
        ret._setTrace(void 0);
    }
    var fulfill = ret._fulfill;
    var reject = ret._reject;
    for (var i = 0, len = promises.length; i < len; ++i) {
        var val = promises[i];

        if (val === void 0 && !(hasOwn.call(promises, i))) {
            continue;
        }

        Promise.cast(val)._then(fulfill, reject, void 0, ret, null);
    }
    return ret;
}

Promise.race = function Promise$Race(promises) {
    return Promise$_Race(promises, void 0);
};

Promise.prototype.race = function Promise$race() {
    return Promise$_Race(this, void 0);
};

};

},{"./errors_api_rejection.js":12,"./util.js":36}],28:[function(require,module,exports){
/**
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
module.exports = function(Promise, PromiseArray, apiRejection, cast, INTERNAL) {
var util = require("./util.js");
var tryCatch4 = util.tryCatch4;
var tryCatch3 = util.tryCatch3;
var errorObj = util.errorObj;
function ReductionPromiseArray(promises, fn, accum, _each) {
    this.constructor$(promises);
    this._preservedValues = _each === INTERNAL ? [] : null;
    this._zerothIsAccum = (accum === void 0);
    this._gotAccum = false;
    this._reducingIndex = (this._zerothIsAccum ? 1 : 0);
    this._valuesPhase = undefined;

    var maybePromise = cast(accum, void 0);
    var rejected = false;
    var isPromise = maybePromise instanceof Promise;
    if (isPromise) {
        if (maybePromise.isPending()) {
            maybePromise._proxyPromiseArray(this, -1);
        } else if (maybePromise.isFulfilled()) {
            accum = maybePromise.value();
            this._gotAccum = true;
        } else {
            maybePromise._unsetRejectionIsUnhandled();
            this._reject(maybePromise.reason());
            rejected = true;
        }
    }
    if (!(isPromise || this._zerothIsAccum)) this._gotAccum = true;
    this._callback = fn;
    this._accum = accum;
    if (!rejected) this._init$(void 0, -5);
}
util.inherits(ReductionPromiseArray, PromiseArray);

ReductionPromiseArray.prototype._init =
function ReductionPromiseArray$_init() {};

ReductionPromiseArray.prototype._resolveEmptyArray =
function ReductionPromiseArray$_resolveEmptyArray() {
    if (this._gotAccum || this._zerothIsAccum) {
        this._resolve(this._preservedValues !== null
                        ? [] : this._accum);
    }
};

ReductionPromiseArray.prototype._promiseFulfilled =
function ReductionPromiseArray$_promiseFulfilled(value, index) {
    var values = this._values;
    if (values === null) return;
    var length = this.length();
    var preservedValues = this._preservedValues;
    var isEach = preservedValues !== null;
    var gotAccum = this._gotAccum;
    var valuesPhase = this._valuesPhase;
    var valuesPhaseIndex;
    if (!valuesPhase) {
        valuesPhase = this._valuesPhase = Array(length);
        for (valuesPhaseIndex=0; valuesPhaseIndex<length; ++valuesPhaseIndex) {
            valuesPhase[valuesPhaseIndex] = 0;
        }
    }
    valuesPhaseIndex = valuesPhase[index];

    if (index === 0 && this._zerothIsAccum) {
        if (!gotAccum) {
            this._accum = value;
            this._gotAccum = gotAccum = true;
        }
        valuesPhase[index] = ((valuesPhaseIndex === 0)
            ? 1 : 2);
    } else if (index === -1) {
        if (!gotAccum) {
            this._accum = value;
            this._gotAccum = gotAccum = true;
        }
    } else {
        if (valuesPhaseIndex === 0) {
            valuesPhase[index] = 1;
        }
        else {
            valuesPhase[index] = 2;
            if (gotAccum) {
                this._accum = value;
            }
        }
    }
    if (!gotAccum) return;

    var callback = this._callback;
    var receiver = this._promise._boundTo;
    var ret;

    for (var i = this._reducingIndex; i < length; ++i) {
        valuesPhaseIndex = valuesPhase[i];
        if (valuesPhaseIndex === 2) {
            this._reducingIndex = i + 1;
            continue;
        }
        if (valuesPhaseIndex !== 1) return;

        value = values[i];
        if (value instanceof Promise) {
            if (value.isFulfilled()) {
                value = value._settledValue;
            } else if (value.isPending()) {
                return;
            } else {
                value._unsetRejectionIsUnhandled();
                return this._reject(value.reason());
            }
        }

        if (isEach) {
            preservedValues.push(value);
            ret = tryCatch3(callback, receiver, value, i, length);
        }
        else {
            ret = tryCatch4(callback, receiver, this._accum, value, i, length);
        }

        if (ret === errorObj) return this._reject(ret.e);

        var maybePromise = cast(ret, void 0);
        if (maybePromise instanceof Promise) {
            if (maybePromise.isPending()) {
                valuesPhase[i] = 4;
                return maybePromise._proxyPromiseArray(this, i);
            } else if (maybePromise.isFulfilled()) {
                ret = maybePromise.value();
            } else {
                maybePromise._unsetRejectionIsUnhandled();
                return this._reject(maybePromise.reason());
            }
        }

        this._reducingIndex = i + 1;
        this._accum = ret;
    }

    if (this._reducingIndex < length) return;
    this._resolve(isEach ? preservedValues : this._accum);
};

function reduce(promises, fn, initialValue, _each) {
    if (typeof fn !== "function") return apiRejection("fn must be a function");
    var array = new ReductionPromiseArray(promises, fn, initialValue, _each);
    return array.promise();
}

Promise.prototype.reduce = function Promise$reduce(fn, initialValue) {
    return reduce(this, fn, initialValue, null);
};

Promise.reduce = function Promise$Reduce(promises, fn, initialValue, _each) {
    return reduce(promises, fn, initialValue, _each);
};
};

},{"./util.js":36}],29:[function(require,module,exports){
(function (process){
/**
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
var schedule;
var _MutationObserver;
if (typeof process === "object" && typeof process.version === "string") {
    schedule = function Promise$_Scheduler(fn) {
        process.nextTick(fn);
    };
}
else if ((typeof MutationObserver !== "undefined" &&
         (_MutationObserver = MutationObserver)) ||
         (typeof WebKitMutationObserver !== "undefined" &&
         (_MutationObserver = WebKitMutationObserver))) {
    schedule = (function() {
        var div = document.createElement("div");
        var queuedFn = void 0;
        var observer = new _MutationObserver(
            function Promise$_Scheduler() {
                var fn = queuedFn;
                queuedFn = void 0;
                fn();
            }
       );
        observer.observe(div, {
            attributes: true
        });
        return function Promise$_Scheduler(fn) {
            queuedFn = fn;
            div.setAttribute("class", "foo");
        };

    })();
}
else if (typeof setTimeout !== "undefined") {
    schedule = function Promise$_Scheduler(fn) {
        setTimeout(fn, 0);
    };
}
else throw new Error("no async scheduler available");
module.exports = schedule;

}).call(this,require("/usr/local/share/npm/lib/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js"))
},{"/usr/local/share/npm/lib/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js":51}],30:[function(require,module,exports){
/**
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
module.exports =
    function(Promise, PromiseArray) {
var PromiseInspection = Promise.PromiseInspection;
var util = require("./util.js");

function SettledPromiseArray(values) {
    this.constructor$(values);
}
util.inherits(SettledPromiseArray, PromiseArray);

SettledPromiseArray.prototype._promiseResolved =
function SettledPromiseArray$_promiseResolved(index, inspection) {
    this._values[index] = inspection;
    var totalResolved = ++this._totalResolved;
    if (totalResolved >= this._length) {
        this._resolve(this._values);
    }
};

SettledPromiseArray.prototype._promiseFulfilled =
function SettledPromiseArray$_promiseFulfilled(value, index) {
    if (this._isResolved()) return;
    var ret = new PromiseInspection();
    ret._bitField = 268435456;
    ret._settledValue = value;
    this._promiseResolved(index, ret);
};
SettledPromiseArray.prototype._promiseRejected =
function SettledPromiseArray$_promiseRejected(reason, index) {
    if (this._isResolved()) return;
    var ret = new PromiseInspection();
    ret._bitField = 134217728;
    ret._settledValue = reason;
    this._promiseResolved(index, ret);
};

Promise.settle = function Promise$Settle(promises) {
    return new SettledPromiseArray(promises).promise();
};

Promise.prototype.settle = function Promise$settle() {
    return new SettledPromiseArray(this).promise();
};
};

},{"./util.js":36}],31:[function(require,module,exports){
/**
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
module.exports =
function(Promise, PromiseArray, apiRejection) {
var util = require("./util.js");
var RangeError = require("./errors.js").RangeError;
var AggregateError = require("./errors.js").AggregateError;
var isArray = util.isArray;


function SomePromiseArray(values) {
    this.constructor$(values);
    this._howMany = 0;
    this._unwrap = false;
    this._initialized = false;
}
util.inherits(SomePromiseArray, PromiseArray);

SomePromiseArray.prototype._init = function SomePromiseArray$_init() {
    if (!this._initialized) {
        return;
    }
    if (this._howMany === 0) {
        this._resolve([]);
        return;
    }
    this._init$(void 0, -5);
    var isArrayResolved = isArray(this._values);
    if (!this._isResolved() &&
        isArrayResolved &&
        this._howMany > this._canPossiblyFulfill()) {
        this._reject(this._getRangeError(this.length()));
    }
};

SomePromiseArray.prototype.init = function SomePromiseArray$init() {
    this._initialized = true;
    this._init();
};

SomePromiseArray.prototype.setUnwrap = function SomePromiseArray$setUnwrap() {
    this._unwrap = true;
};

SomePromiseArray.prototype.howMany = function SomePromiseArray$howMany() {
    return this._howMany;
};

SomePromiseArray.prototype.setHowMany =
function SomePromiseArray$setHowMany(count) {
    if (this._isResolved()) return;
    this._howMany = count;
};

SomePromiseArray.prototype._promiseFulfilled =
function SomePromiseArray$_promiseFulfilled(value) {
    if (this._isResolved()) return;
    this._addFulfilled(value);
    if (this._fulfilled() === this.howMany()) {
        this._values.length = this.howMany();
        if (this.howMany() === 1 && this._unwrap) {
            this._resolve(this._values[0]);
        } else {
            this._resolve(this._values);
        }
    }

};
SomePromiseArray.prototype._promiseRejected =
function SomePromiseArray$_promiseRejected(reason) {
    if (this._isResolved()) return;
    this._addRejected(reason);
    if (this.howMany() > this._canPossiblyFulfill()) {
        var e = new AggregateError();
        for (var i = this.length(); i < this._values.length; ++i) {
            e.push(this._values[i]);
        }
        this._reject(e);
    }
};

SomePromiseArray.prototype._fulfilled = function SomePromiseArray$_fulfilled() {
    return this._totalResolved;
};

SomePromiseArray.prototype._rejected = function SomePromiseArray$_rejected() {
    return this._values.length - this.length();
};

SomePromiseArray.prototype._addRejected =
function SomePromiseArray$_addRejected(reason) {
    this._values.push(reason);
};

SomePromiseArray.prototype._addFulfilled =
function SomePromiseArray$_addFulfilled(value) {
    this._values[this._totalResolved++] = value;
};

SomePromiseArray.prototype._canPossiblyFulfill =
function SomePromiseArray$_canPossiblyFulfill() {
    return this.length() - this._rejected();
};

SomePromiseArray.prototype._getRangeError =
function SomePromiseArray$_getRangeError(count) {
    var message = "Input array must contain at least " +
            this._howMany + " items but contains only " + count + " items";
    return new RangeError(message);
};

SomePromiseArray.prototype._resolveEmptyArray =
function SomePromiseArray$_resolveEmptyArray() {
    this._reject(this._getRangeError(0));
};

function Promise$_Some(promises, howMany) {
    if ((howMany | 0) !== howMany || howMany < 0) {
        return apiRejection("expecting a positive integer");
    }
    var ret = new SomePromiseArray(promises);
    var promise = ret.promise();
    if (promise.isRejected()) {
        return promise;
    }
    ret.setHowMany(howMany);
    ret.init();
    return promise;
}

Promise.some = function Promise$Some(promises, howMany) {
    return Promise$_Some(promises, howMany);
};

Promise.prototype.some = function Promise$some(howMany) {
    return Promise$_Some(this, howMany);
};

Promise._SomePromiseArray = SomePromiseArray;
};

},{"./errors.js":11,"./util.js":36}],32:[function(require,module,exports){
/**
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
module.exports = function(Promise) {
function PromiseInspection(promise) {
    if (promise !== void 0) {
        this._bitField = promise._bitField;
        this._settledValue = promise.isResolved()
            ? promise._settledValue
            : void 0;
    }
    else {
        this._bitField = 0;
        this._settledValue = void 0;
    }
}

PromiseInspection.prototype.isFulfilled =
Promise.prototype.isFulfilled = function Promise$isFulfilled() {
    return (this._bitField & 268435456) > 0;
};

PromiseInspection.prototype.isRejected =
Promise.prototype.isRejected = function Promise$isRejected() {
    return (this._bitField & 134217728) > 0;
};

PromiseInspection.prototype.isPending =
Promise.prototype.isPending = function Promise$isPending() {
    return (this._bitField & 402653184) === 0;
};

PromiseInspection.prototype.value =
Promise.prototype.value = function Promise$value() {
    if (!this.isFulfilled()) {
        throw new TypeError("cannot get fulfillment value of a non-fulfilled promise");
    }
    return this._settledValue;
};

PromiseInspection.prototype.error =
PromiseInspection.prototype.reason =
Promise.prototype.reason = function Promise$reason() {
    if (!this.isRejected()) {
        throw new TypeError("cannot get rejection reason of a non-rejected promise");
    }
    return this._settledValue;
};

PromiseInspection.prototype.isResolved =
Promise.prototype.isResolved = function Promise$isResolved() {
    return (this._bitField & 402653184) > 0;
};

Promise.PromiseInspection = PromiseInspection;
};

},{}],33:[function(require,module,exports){
/**
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
module.exports = function(Promise, INTERNAL) {
var util = require("./util.js");
var canAttach = require("./errors.js").canAttach;
var errorObj = util.errorObj;
var isObject = util.isObject;

function getThen(obj) {
    try {
        return obj.then;
    }
    catch(e) {
        errorObj.e = e;
        return errorObj;
    }
}

function Promise$_Cast(obj, originalPromise) {
    if (isObject(obj)) {
        if (obj instanceof Promise) {
            return obj;
        }
        else if (isAnyBluebirdPromise(obj)) {
            var ret = new Promise(INTERNAL);
            ret._setTrace(void 0);
            obj._then(
                ret._fulfillUnchecked,
                ret._rejectUncheckedCheckError,
                ret._progressUnchecked,
                ret,
                null
            );
            ret._setFollowing();
            return ret;
        }
        var then = getThen(obj);
        if (then === errorObj) {
            if (originalPromise !== void 0 && canAttach(then.e)) {
                originalPromise._attachExtraTrace(then.e);
            }
            return Promise.reject(then.e);
        } else if (typeof then === "function") {
            return Promise$_doThenable(obj, then, originalPromise);
        }
    }
    return obj;
}

var hasProp = {}.hasOwnProperty;
function isAnyBluebirdPromise(obj) {
    return hasProp.call(obj, "_promise0");
}

function Promise$_doThenable(x, then, originalPromise) {
    var resolver = Promise.defer();
    var called = false;
    try {
        then.call(
            x,
            Promise$_resolveFromThenable,
            Promise$_rejectFromThenable,
            Promise$_progressFromThenable
        );
    } catch(e) {
        if (!called) {
            called = true;
            var trace = canAttach(e) ? e : new Error(e + "");
            if (originalPromise !== void 0) {
                originalPromise._attachExtraTrace(trace);
            }
            resolver.promise._reject(e, trace);
        }
    }
    return resolver.promise;

    function Promise$_resolveFromThenable(y) {
        if (called) return;
        called = true;

        if (x === y) {
            var e = Promise._makeSelfResolutionError();
            if (originalPromise !== void 0) {
                originalPromise._attachExtraTrace(e);
            }
            resolver.promise._reject(e, void 0);
            return;
        }
        resolver.resolve(y);
    }

    function Promise$_rejectFromThenable(r) {
        if (called) return;
        called = true;
        var trace = canAttach(r) ? r : new Error(r + "");
        if (originalPromise !== void 0) {
            originalPromise._attachExtraTrace(trace);
        }
        resolver.promise._reject(r, trace);
    }

    function Promise$_progressFromThenable(v) {
        if (called) return;
        var promise = resolver.promise;
        if (typeof promise._progress === "function") {
            promise._progress(v);
        }
    }
}

return Promise$_Cast;
};

},{"./errors.js":11,"./util.js":36}],34:[function(require,module,exports){
/**
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
var _setTimeout = function(fn, ms) {
    var len = arguments.length;
    var arg0 = arguments[2];
    var arg1 = arguments[3];
    var arg2 = len >= 5 ? arguments[4] : void 0;
    setTimeout(function() {
        fn(arg0, arg1, arg2);
    }, ms);
};

module.exports = function(Promise, INTERNAL, cast) {
var util = require("./util.js");
var errors = require("./errors.js");
var apiRejection = require("./errors_api_rejection")(Promise);
var TimeoutError = Promise.TimeoutError;

var afterTimeout = function Promise$_afterTimeout(promise, message, ms) {
    if (!promise.isPending()) return;
    if (typeof message !== "string") {
        message = "operation timed out after" + " " + ms + " ms"
    }
    var err = new TimeoutError(message);
    errors.markAsOriginatingFromRejection(err);
    promise._attachExtraTrace(err);
    promise._cancel(err);
};

var afterDelay = function Promise$_afterDelay(value, promise) {
    promise._fulfill(value);
};

var delay = Promise.delay = function Promise$Delay(value, ms) {
    if (ms === void 0) {
        ms = value;
        value = void 0;
    }
    ms = +ms;
    var maybePromise = cast(value, void 0);
    var promise = new Promise(INTERNAL);

    if (maybePromise instanceof Promise) {
        promise._propagateFrom(maybePromise, 7);
        promise._follow(maybePromise);
        return promise.then(function(value) {
            return Promise.delay(value, ms);
        });
    } else {
        promise._setTrace(void 0);
        _setTimeout(afterDelay, ms, value, promise);
    }
    return promise;
};

Promise.prototype.delay = function Promise$delay(ms) {
    return delay(this, ms);
};

Promise.prototype.timeout = function Promise$timeout(ms, message) {
    ms = +ms;

    var ret = new Promise(INTERNAL);
    ret._propagateFrom(this, 7);
    ret._follow(this);
    _setTimeout(afterTimeout, ms, ret, message, ms);
    return ret.cancellable();
};

};

},{"./errors.js":11,"./errors_api_rejection":12,"./util.js":36}],35:[function(require,module,exports){
/**
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
module.exports = function (Promise, apiRejection, cast) {
    var TypeError = require("./errors.js").TypeError;
    var inherits = require("./util.js").inherits;
    var PromiseInspection = Promise.PromiseInspection;

    function inspectionMapper(inspections) {
        var len = inspections.length;
        for (var i = 0; i < len; ++i) {
            var inspection = inspections[i];
            if (inspection.isRejected()) {
                return Promise.reject(inspection.error());
            }
            inspections[i] = inspection.value();
        }
        return inspections;
    }

    function thrower(e) {
        setTimeout(function(){throw e;}, 0);
    }

    function dispose(resources, inspection) {
        var i = 0;
        var len = resources.length;
        var ret = Promise.defer();
        function iterator() {
            if (i >= len) return ret.resolve();
            var maybePromise = cast(resources[i++], void 0);
            if (maybePromise instanceof Promise &&
                maybePromise._isDisposable()) {
                try {
                    maybePromise = cast(maybePromise._getDisposer()
                                        .tryDispose(inspection), void 0);
                } catch (e) {
                    return thrower(e);
                }
                if (maybePromise instanceof Promise) {
                    return maybePromise._then(iterator, thrower,
                                              null, null, null);
                }
            }
            iterator();
        }
        iterator();
        return ret.promise;
    }

    function disposerSuccess(value) {
        var inspection = new PromiseInspection();
        inspection._settledValue = value;
        inspection._bitField = 268435456;
        return dispose(this, inspection).thenReturn(value);
    }

    function disposerFail(reason) {
        var inspection = new PromiseInspection();
        inspection._settledValue = reason;
        inspection._bitField = 134217728;
        return dispose(this, inspection).thenThrow(reason);
    }

    function Disposer(data, promise) {
        this._data = data;
        this._promise = promise;
    }

    Disposer.prototype.data = function Disposer$data() {
        return this._data;
    };

    Disposer.prototype.promise = function Disposer$promise() {
        return this._promise;
    };

    Disposer.prototype.resource = function Disposer$resource() {
        if (this.promise().isFulfilled()) {
            return this.promise().value();
        }
        return null;
    };

    Disposer.prototype.tryDispose = function(inspection) {
        var resource = this.resource();
        var ret = resource !== null
            ? this.doDispose(resource, inspection) : null;
        this._promise._unsetDisposable();
        this._data = this._promise = null;
        return ret;
    };

    function FunctionDisposer(fn, promise) {
        this.constructor$(fn, promise);
    }
    inherits(FunctionDisposer, Disposer);

    FunctionDisposer.prototype.doDispose = function (resource, inspection) {
        var fn = this.data();
        return fn.call(resource, resource, inspection);
    };

    Promise.using = function Promise$using() {
        var len = arguments.length;
        if (len < 2) return apiRejection(
                        "you must pass at least 2 arguments to Promise.using");
        var fn = arguments[len - 1];
        if (typeof fn !== "function") return apiRejection("fn must be a function");
        len--;
        var resources = new Array(len);
        for (var i = 0; i < len; ++i) {
            var resource = arguments[i];
            if (resource instanceof Disposer) {
                var disposer = resource;
                resource = resource.promise();
                resource._setDisposable(disposer);
            }
            resources[i] = resource;
        }

        return Promise.settle(resources)
            .then(inspectionMapper)
            .spread(fn)
            ._then(disposerSuccess, disposerFail, void 0, resources, void 0);
    };

    Promise.prototype._setDisposable =
    function Promise$_setDisposable(disposer) {
        this._bitField = this._bitField | 262144;
        this._disposer = disposer;
    };

    Promise.prototype._isDisposable = function Promise$_isDisposable() {
        return (this._bitField & 262144) > 0;
    };

    Promise.prototype._getDisposer = function Promise$_getDisposer() {
        return this._disposer;
    };

    Promise.prototype._unsetDisposable = function Promise$_unsetDisposable() {
        this._bitField = this._bitField & (~262144);
        this._disposer = void 0;
    };

    Promise.prototype.disposer = function Promise$disposer(fn) {
        if (typeof fn === "function") {
            return new FunctionDisposer(fn, this);
        }
        throw new TypeError();
    };

};

},{"./errors.js":11,"./util.js":36}],36:[function(require,module,exports){
/**
 * Copyright (c) 2014 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
"use strict";
var es5 = require("./es5.js");
var haveGetters = (function(){
    try {
        var o = {};
        es5.defineProperty(o, "f", {
            get: function () {
                return 3;
            }
        });
        return o.f === 3;
    }
    catch (e) {
        return false;
    }

})();
var canEvaluate = typeof navigator == "undefined";
var errorObj = {e: {}};
function tryCatch1(fn, receiver, arg) {
    try { return fn.call(receiver, arg); }
    catch (e) {
        errorObj.e = e;
        return errorObj;
    }
}

function tryCatch2(fn, receiver, arg, arg2) {
    try { return fn.call(receiver, arg, arg2); }
    catch (e) {
        errorObj.e = e;
        return errorObj;
    }
}

function tryCatch3(fn, receiver, arg, arg2, arg3) {
    try { return fn.call(receiver, arg, arg2, arg3); }
    catch (e) {
        errorObj.e = e;
        return errorObj;
    }
}

function tryCatch4(fn, receiver, arg, arg2, arg3, arg4) {
    try { return fn.call(receiver, arg, arg2, arg3, arg4); }
    catch (e) {
        errorObj.e = e;
        return errorObj;
    }
}

function tryCatchApply(fn, args, receiver) {
    try { return fn.apply(receiver, args); }
    catch (e) {
        errorObj.e = e;
        return errorObj;
    }
}

var inherits = function(Child, Parent) {
    var hasProp = {}.hasOwnProperty;

    function T() {
        this.constructor = Child;
        this.constructor$ = Parent;
        for (var propertyName in Parent.prototype) {
            if (hasProp.call(Parent.prototype, propertyName) &&
                propertyName.charAt(propertyName.length-1) !== "$"
           ) {
                this[propertyName + "$"] = Parent.prototype[propertyName];
            }
        }
    }
    T.prototype = Parent.prototype;
    Child.prototype = new T();
    return Child.prototype;
};

function asString(val) {
    return typeof val === "string" ? val : ("" + val);
}

function isPrimitive(val) {
    return val == null || val === true || val === false ||
        typeof val === "string" || typeof val === "number";

}

function isObject(value) {
    return !isPrimitive(value);
}

function maybeWrapAsError(maybeError) {
    if (!isPrimitive(maybeError)) return maybeError;

    return new Error(asString(maybeError));
}

function withAppended(target, appendee) {
    var len = target.length;
    var ret = new Array(len + 1);
    var i;
    for (i = 0; i < len; ++i) {
        ret[i] = target[i];
    }
    ret[i] = appendee;
    return ret;
}

function getDataPropertyOrDefault(obj, key, defaultValue) {
    if (es5.isES5) {
        var desc = Object.getOwnPropertyDescriptor(obj, key);
        if (desc != null) {
            return desc.get == null && desc.set == null
                    ? desc.value
                    : defaultValue;
        }
    } else {
        return {}.hasOwnProperty.call(obj, key) ? obj[key] : void 0;
    }
}

function notEnumerableProp(obj, name, value) {
    if (isPrimitive(obj)) return obj;
    var descriptor = {
        value: value,
        configurable: true,
        enumerable: false,
        writable: true
    };
    es5.defineProperty(obj, name, descriptor);
    return obj;
}


var wrapsPrimitiveReceiver = (function() {
    return this !== "string";
}).call("string");

function thrower(r) {
    throw r;
}

var inheritedDataKeys = (function() {
    if (es5.isES5) {
        return function(obj, opts) {
            var ret = [];
            var visitedKeys = Object.create(null);
            var getKeys = Object(opts).includeHidden
                ? Object.getOwnPropertyNames
                : Object.keys;
            while (obj != null) {
                var keys;
                try {
                    keys = getKeys(obj);
                } catch (e) {
                    return ret;
                }
                for (var i = 0; i < keys.length; ++i) {
                    var key = keys[i];
                    if (visitedKeys[key]) continue;
                    visitedKeys[key] = true;
                    var desc = Object.getOwnPropertyDescriptor(obj, key);
                    if (desc != null && desc.get == null && desc.set == null) {
                        ret.push(key);
                    }
                }
                obj = es5.getPrototypeOf(obj);
            }
            return ret;
        };
    } else {
        return function(obj) {
            var ret = [];
            /*jshint forin:false */
            for (var key in obj) {
                ret.push(key);
            }
            return ret;
        };
    }

})();

function isClass(fn) {
    try {
        if (typeof fn === "function") {
            var keys = es5.keys(fn.prototype);
            return keys.length > 0 &&
                   !(keys.length === 1 && keys[0] === "constructor");
        }
        return false;
    } catch (e) {
        return false;
    }
}

function toFastProperties(obj) {
    /*jshint -W027*/
    function f() {}
    f.prototype = obj;
    return f;
    eval(obj);
}

var rident = /^[a-z$_][a-z$_0-9]*$/i;
function isIdentifier(str) {
    return rident.test(str);
}

function filledRange(count, prefix, suffix) {
    var ret = new Array(count);
    for(var i = 0; i < count; ++i) {
        ret[i] = prefix + i + suffix;
    }
    return ret;
}

var ret = {
    isClass: isClass,
    isIdentifier: isIdentifier,
    inheritedDataKeys: inheritedDataKeys,
    getDataPropertyOrDefault: getDataPropertyOrDefault,
    thrower: thrower,
    isArray: es5.isArray,
    haveGetters: haveGetters,
    notEnumerableProp: notEnumerableProp,
    isPrimitive: isPrimitive,
    isObject: isObject,
    canEvaluate: canEvaluate,
    errorObj: errorObj,
    tryCatch1: tryCatch1,
    tryCatch2: tryCatch2,
    tryCatch3: tryCatch3,
    tryCatch4: tryCatch4,
    tryCatchApply: tryCatchApply,
    inherits: inherits,
    withAppended: withAppended,
    asString: asString,
    maybeWrapAsError: maybeWrapAsError,
    wrapsPrimitiveReceiver: wrapsPrimitiveReceiver,
    toFastProperties: toFastProperties,
    filledRange: filledRange
};

module.exports = ret;

},{"./es5.js":13}],37:[function(require,module,exports){
'use strict';
var words = require('word-list-json');
var uniqueRandom = require('unique-random');
var uniqueRandoms = {
  full: uniqueRandom(0, words.length - 1)
};
var maxLen = 0;
Object.keys(words.lengths).forEach(function (len) {
  if (Number(len) > maxLen) {
    maxLen = len;
  }
  uniqueRandoms[len] = uniqueRandom(0, words.lengths[len] - 1);
});
function randomWord(len) {
  if (typeof len !== 'number' || len < 2 || len !== len || len > maxLen) {
    len = 'full';
  }
  while (!(len in uniqueRandoms)) {
    len--;
  }
  
  return words[uniqueRandoms[len]()];
}
randomWord.maxLen = maxLen;
randomWord.uniqueRandoms = uniqueRandoms;
module.exports = randomWord;
},{"unique-random":38,"word-list-json":39}],38:[function(require,module,exports){
/*!
	unique-random
	Generate random numbers that are consecutively unique
	https://github.com/sindresorhus/unique-random
	by Sindre Sorhus
	MIT License
*/
(function () {
	'use strict';

	function uniqueRandom(min, max) {
		var prev;
		return function rand() {
			var num = Math.floor(Math.random() * (max - min + 1) + min);
			return prev = num === prev && min !== max ? rand() : num;
		};
	}

	if (typeof module !== 'undefined' && module.exports) {
		module.exports = uniqueRandom;
	} else {
		window.uniqueRandom = uniqueRandom;
	}
})();

},{}],39:[function(require,module,exports){
'use strict';
var words = require('./words.json');
module.exports = words.words;
words.words.lengths = words.lengths;
},{"./words.json":40}],40:[function(require,module,exports){
module.exports={"words":["me","aa","zo","za","yu","yo","ye","ya","xu","xi","wo","we","ut","us","ur","up","un","um","uh","ug","to","ti","te","ta","st","so","si","sh","re","qi","ad","po","pi","pe","pa","oy","ox","ow","ou","os","or","op","oo","on","om","oi","oh","of","oe","od","ob","ny","nu","no","ne","na","my","mu","ae","mo","mm","mi","ab","ma","lo","li","la","ky","ko","ag","ki","ka","jo","ja","it","is","io","in","if","id","ho","hm","ah","ai","hi","he","ha","gu","go","al","gi","fy","fe","fa","ex","et","es","er","en","em","el","eh","ef","ee","ed","ea","do","di","de","da","ch","by","am","bo","bi","be","ba","ay","ax","aw","at","as","ar","an","vor","vol","voe","vly","vis","vin","vim","vig","vie","vid","via","vex","abs","vet","veg","vee","vaw","vav","vau","vat","vas","var","van","vag","vae","vac","uva","utu","uts","ute","uta","ziz","use","zit","urp","urn","ure","urd","urb","zip","ups","upo","zin","uns","uni","zig","umu","ums","ump","umm","zho","ulu","ule","uke","zex","ugs","ugh","zep","ufo","uey","uds","udo","tyg","tye","twp","two","twa","tux","tut","tup","tun","tum","tui","tug","tub","tsk","try","toy","aby","tow","tot","tor","top","too","ton","tom","tog","toe","tod","toc","zel","tix","tit","tis","tip","tin","til","tik","tig","tie","tid","tic","zek","thy","tho","the","tex","tew","tet","tes","ten","tel","teg","tef","tee","ted","tec","tea","zee","tay","tax","taw","tav","tau","tat","tas","tar","tap","tao","tan","tam","tak","taj","tai","tag","tae","tad","tab","zed","syn","sye","swy","sus","sur","suq","sup","sun","sum","suk","sui","sug","sue","sud","sub","sty","zea","sri","spy","spa","soz","soy","sox","sow","sov","sou","sot","sos","sop","son","som","sol","soh","sog","sod","soc","sob","zax","sny","ace","sma","sly","sky","ski","ska","six","sit","sis","sir","sip","sin","sim","sik","sif","ach","sic","sib","zas","shy","shh","she","sha","zap","sez","sey","sex","sew","set","ser","sen","sel","sei","seg","see","sed","sec","sea","saz","say","sax","saw","sav","sau","sat","sar","sap","san","sam","sal","sai","sag","sae","sad","sac","sab","rye","rya","rut","run","rum","rug","rue","rud","ruc","rub","row","rot","roo","rom","rok","roe","rod","roc","rob","riz","rit","rip","rin","rim","rig","rif","rid","rib","ria","rhy","rho","rez","rex","rew","rev","ret","res","rep","reo","ren","rem","rei","reh","reg","ref","ree","act","red","rec","reb","zag","ray","rax","raw","rav","rat","ras","rap","ran","ram","raj","rai","rah","rag","rad","qua","qis","qin","zuz","qat","pyx","pye","pya","puy","put","pus","pur","pup","pun","pul","puh","pug","pud","pub","pst","psi","pry","yus","pro","pre","poz","pox","pow","pot","pos","add","pop","poo","pom","pol","poi","poh","pod","poa","yup","ply","plu","pix","piu","pit","pis","pir","pip","pin","pig","pie","pic","pia","yum","pht","pho","phi","pew","pet","pes","per","pep","pen","pel","peh","peg","pee","ped","pec","pea","yuk","pay","pax","paw","pav","pat","pas","par","pap","pan","pam","pal","pah","pad","pac","abb","oys","oye","yug","oxy","oxo","zos","owt","own","owl","owe","yow","ova","out","ous","our","oup","ouk","oud","you","ose","yon","ort","ors","orf","ore","ord","orc","orb","ora","yom","opt","ops","ope","yok","oot","oos","oor","oop","oon","oom","ooh","oof","yod","ony","ons","ono","one","yob","oms","aas","ado","olm","ole","old","oke","oka","ois","oil","oik","yip","ohs","oho","ohm","yin","oft","off","yid","oes","ygo","ods","ode","odd","oda","yex","och","oca","obs","obo","obi","obe","oba","yew","oat","oar","oak","oaf","nys","nye","yet","nut","nus","ads","nur","nun","nub","yes","nth","noy","nox","now","not","nos","nor","noo","non","nom","noh","nog","nod","nob","yep","nix","nit","nis","nip","nim","nil","nie","nid","nib","new","net","nep","nek","neg","zzz","nee","ned","neb","yen","nay","naw","nat","nas","nap","nan","nam","nah","nag","nae","nab","yeh","myc","yea","mux","mut","mus","mun","mum","mug","mud","zoo","moz","moy","mow","mou","mot","adz","mos","yay","mor","mop","moo","mon","mom","mol","moi","mog","moe","mod","moc","mob","moa","yaw","mna","yar","miz","mix","mis","mir","mim","mil","mig","mid","mic","mib","yap","mho","mew","meu","met","mes","men","mem","mel","meh","meg","mee","med","yam","may","max","maw","mat","mas","mar","map","man","mam","mal","mak","aah","mag","mae","mad","mac","maa","yak","lym","lye","luz","lux","luv","lur","lum","lug","lud","loy","lox","aff","low","lou","lot","los","lor","lop","loo","log","lod","lob","yah","lit","lis","lip","lin","lig","lie","lid","lib","yag","lez","ley","lex","lew","lev","leu","let","les","lep","lek","lei","leg","lee","led","lea","lay","lax","law","lav","lat","las","lar","lap","lam","lah","lag","lad","aft","lac","lab","yae","kyu","kye","yad","kue","kow","kos","kor","kop","kon","koi","kob","koa","amp","aba","aga","kit","kis","kir","kip","kin","kif","kid","xis","khi","key","kex","ket","age","kep","ken","keg","kef","ked","keb","kea","kay","kaw","kat","kas","kam","kak","kai","kaf","kae","kab","zol","jut","jus","jun","jug","jud","joy","jow","jot","jor","jol","jog","joe","job","wyn","jiz","jin","jig","jib","jew","jeu","jet","jee","jay","jaw","jar","jap","jam","jak","jai","jag","jab","wye","iwi","ivy","its","ita","wus","iso","ism","ish","wud","irk","ire","ios","ion","wry","ins","ago","inn","ink","ing","wox","imp","ill","ilk","igg","ifs","iff","wow","ids","ide","wot","icy","ick","ich","ice","hyp","hye","hut","hup","hun","hum","hui","huh","hug","hue","hub","hoy","hox","how","hot","hos","hop","hoo","hon","hom","ags","hoi","hoh","hog","hoe","hod","hoc","hob","hoa","wos","hmm","wop","woo","aha","hit","ahi","his","hip","ahs","hin","him","won","aia","aid","hie","hid","hic","wok","hey","hex","hew","het","hes","her","ail","hep","hen","hem","heh","aim","wog","hay","haw","ain","air","hat","has","hap","hao","han","ham","haj","hah","hag","hae","had","wof","gyp","gym","guy","guv","gut","gus","gur","gup","gun","gum","gul","gue","gub","woe","goy","gox","gov","got","gos","gor","goo","gon","ais","ait","goe","god","gob","goa","zoa","aka","gnu","ake","gju","git","gis","wiz","ala","gip","gio","gin","gig","gif","gie","gid","gib","wit","ghi","gey","get","ger","geo","gen","gem","gel","gee","ged","gay","alb","gaw","gau","gat","gas","gar","gap","gan","gam","gal","gak","gag","gae","gad","gab","wis","fur","fun","fum","fug","fud","fub","fry","fro","fra","foy","fox","fou","for","fop","fon","foh","fog","foe","fob","fly","flu","fiz","fix","fit","ale","fir","fin","fil","fig","fie","fid","fib","fez","fey","few","feu","fet","fes","fer","fen","fem","feh","feg","fee","fed","alf","win","fay","fax","faw","fat","fas","far","fap","fan","fah","fag","fae","fad","fab","faa","wig","eye","exo","why","ewt","ewk","ewe","evo","eve","euk","eth","eta","who","est","ess","abo","ers","err","ern","erm","erk","erg","erf","ere","era","wha","eon","ens","eng","ene","end","wey","emu","ems","emo","emf","eme","wex","elt","els","elm","ell","elk","elf","eld","wet","eke","eik","ehs","wen","ego","egg","eft","efs","eff","wem","een","eel","eek","wee","eds","edh","wed","ecu","eco","ech","ebb","eau","eat","eas","ear","ean","web","dzo","dye","all","dux","dup","duo","dun","dui","duh","dug","due","dud","dub","dso","dry","doy","dow","dot","dos","dor","dop","doo","don","dom","dol","doh","dog","dof","doe","dod","doc","dob","aal","div","dit","dis","dip","din","dim","dig","dif","die","did","dib","way","dey","dex","dew","dev","den","del","dei","deg","def","dee","deb","wax","day","daw","das","dap","dan","dam","dal","dak","dah","dag","dae","dad","dab","waw","cwm","cuz","cut","cur","cup","cum","cue","cud","cub","cry","cru","coz","coy","cox","cow","cot","cos","cor","alp","cop","coo","con","col","cog","cod","cob","cly","als","alt","cit","cis","cig","cid","chi","che","cha","wat","cep","cel","cee","caz","cay","caw","cat","alu","car","cap","can","cam","cag","cad","cab","caa","bys","bye","was","buy","war","ama","but","bus","bur","bun","bum","bug","bud","bub","bru","brr","bro","bra","boy","box","bow","bot","bos","bor","bop","boo","bon","bok","boi","boh","bog","bod","bob","boa","wap","biz","bit","bis","bio","bin","big","bid","bib","wan","bez","bey","bet","bes","ame","ben","bel","beg","bee","bed","wai","bay","bat","bas","bar","bap","ban","bam","bal","bah","bag","bad","bac","ami","baa","wag","azo","ayu","ays","aye","wae","axe","wad","awn","awl","awk","awe","awa","wab","avo","ave","ava","auk","auf","aue","aua","att","ats","ate","vum","ass","asp","ask","ash","vug","ary","art","ars","arm","ark","arf","are","ard","arc","arb","vox","apt","app","apo","ape","any","ant","ans","ann","ani","ane","and","ana","vow","amu","nef","snot","snog","snod","snob","snit","snip","snig","snib","snee","sned","sneb","snaw","zarf","aced","snar","snap","snag","snab","smut","smur","smug","smog","smit","smir","smew","acer","smee","wont","wons","slut","slur","slum","slug","slue","slub","slow","slot","slop","slog","sloe","slob","slit","slip","slim","slid","sley","slew","slee","sled","sleb","slay","aces","slaw","slat","slap","slam","slag","slae","slab","skyr","skyf","wonk","skug","skua","skry","skol","skit","skis","skip","skio","skin","skim","skid","zaps","skew","sket","sker","skep","skeo","sken","skeg","skee","skaw","skat","skas","skag","womb","sjoe","sizy","size","wolf","sitz","sits","sith","site","wold","sist","siss","woks","sirs","siri","sire","woke","sips","sipe","zols","sins","sink","sinh","sing","sine","sind","wogs","sims","simp","simi","sima","zany","silt","silo","sill","silk","sile","sild","sike","sika","wofs","sijo","sign","sigh","sift","zags","sies","sien","sidh","woes","side","sida","sics","sick","sich","sice","zurf","sibs","sibb","wock","sial","woad","zack","shwa","shut","ache","shun","shul","shri","show","shot","shop","shoo","shog","shoe","shod","shmo","shiv","shit","shir","ship","shin","shim","zoic","shew","shet","shes","shed","shea","wive","shay","shaw","shat","shan","sham","shah","shag","shad","wits","with","wite","seys","ywis","sexy","sext","wist","sews","sewn","wiss","sett","sets","seta","wisp","sess","sesh","sese","sers","serr","serk","serf","sere","sera","wish","sept","seps","sent","sens","sene","send","sena","wise","semi","seme","sels","sell","self","achy","sele","seld","yuzu","sekt","seis","seir","seil","seik","seif","wiry","acid","segs","sego","wire","sees","seer","seep","seen","seem","seel","seek","seed","wipe","winy","sect","secs","seco","sech","able","seat","seas","sear","sean","seam","seal","wins","scye","scut","scur","scup","scum","scul","scug","scud","scry","scow","scot","scop","scog","scaw","scat","scar","scan","scam","scag","scad","scab","wino","says","winn","saxe","wink","saws","sawn","wing","savs","save","wine","saut","saul","wind","sati","sate","yutz","sass","sash","sars","sark","sari","sard","wimp","saps","wily","sant","sans","sank","sang","sane","sand","wilt","sams","samp","same","sama","will","salt","sals","salp","sall","sale","wili","saki","sake","sais","sair","sain","saim","sail","said","saic","wile","sagy","sags","sago","sage","acme","saga","wild","saft","safe","acne","wiki","sads","sado","sadi","sade","wigs","sacs","sack","zoea","sabs","sabe","wife","saag","rype","ryot","rynd","ryke","ryfe","ryes","wiel","ryas","ryal","wide","ruts","ruth","wick","rust","rusk","rush","ruse","rusa","ruru","rurp","runt","runs","rung","rune","rund","wich","rums","rump","rume","wice","ruly","rule","rukh","ruin","rugs","ruga","whys","ruff","rues","ruer","rued","yurt","ruds","rude","rudd","ably","rucs","ruck","whup","ruby","rubs","rube","whow","rowt","rows","whot","rove","roux","rout","roup","roum","roul","roue","rots","roto","rotl","roti","rote","rota","whop","rosy","rost","rose","rory","rort","rore","ropy","rope","root","roos","roop","roon","room","rook","roof","rood","whom","ronz","ront","rong","rone","roms","romp","roma","whoa","roll","rolf","role","roky","roks","roke","yups","roji","roin","roil","roes","roed","whiz","acre","rods","rode","whit","rocs","rock","roch","whir","robs","robe","whip","roar","roan","roam","road","riza","whio","rivo","rive","riva","ritz","ritt","rits","rite","whin","risp","risk","rise","ript","rips","ripp","ripe","whim","riot","rins","rink","ring","rine","rind","whig","rimy","rimu","rims","rime","rima","whid","rill","rile","rigs","rigg","whey","rift","rifs","riff","rife","whew","riem","riel","rids","ride","whet","ricy","rick","rich","rice","ribs","riba","when","rias","rial","riad","zobu","whee","rhus","rhos","what","rhea","whap","wham","rews","whae","revs","yunx","rets","rete","weys","rest","resh","yump","reps","repp","repo","wexe","reos","zobo","reny","rent","rens","renk","rend","wets","rems","weta","rely","reke","reis","rein","reik","reif","yule","rehs","west","regs","rego","wert","reft","refs","wero","rees","reen","reel","reek","reef","reed","were","reds","redo","wept","acta","rede","redd","went","recs","reck","wens","rebs","wend","rear","reap","rean","ream","real","reak","read","wena","razz","raze","rays","raya","yuky","wems","raws","rawn","wemb","ravs","rave","yuks","raun","ratu","rats","rato","rath","rate","rata","welt","rast","rasp","rash","rase","wels","rark","rare","rapt","raps","rape","well","rant","rank","rani","rang","rand","rana","welk","rams","ramp","rami","weld","rale","raku","raki","rake","raja","weka","rait","rais","rain","rail","raik","raid","raia","weir","rahs","weil","ragu","rags","ragi","ragg","rage","raga","weid","raft","raff","rads","rade","weft","racy","rack","rach","race","raca","rabi","quop","quod","quiz","quit","quip","quin","quim","quid","quey","quep","quay","quat","quai","quag","quad","weet","qoph","wees","qins","weer","weep","qats","ween","acts","qaid","qadi","weem","pyro","pyre","pyot","pyne","pyin","pyic","pyet","pyes","weel","pyat","pyas","week","puys","weed","putz","putt","puts","yuko","puss","push","weds","purs","purr","purl","puri","pure","yuke","pupu","pups","pupa","webs","puny","punt","puns","punk","pung","puna","zupa","pumy","pump","puma","puly","pulu","puls","pulp","pull","pulk","puli","pule","pula","wear","puky","puku","puke","puka","puja","puir","puha","wean","pugs","pugh","weal","puff","puer","pudu","puds","weak","puck","puce","pubs","pube","yugs","acyl","ptui","ways","psst","psis","yuga","prys","waxy","pruh","prow","zulu","pros","prop","proo","prom","prog","prof","prod","prob","proa","waws","prim","prig","prez","prey","prex","prep","prem","pree","wawl","pray","prau","prat","prao","pram","prad","pozz","wawe","poxy","wawa","pows","pown","abba","pout","pour","pouk","pouf","pott","pots","pote","wavy","posy","post","poss","posh","pose","wave","pory","port","adaw","porn","pork","pore","pops","pope","waur","waul","poot","poos","poor","poop","poon","pool","pook","pooh","poof","pood","wauk","pony","pont","pons","ponk","pong","pone","pond","poms","pomp","pomo","pome","watt","poly","polt","pols","polo","poll","polk","pole","wats","poky","poke","pois","wate","zizz","pogy","pogo","poet","poep","poem","pods","wast","poco","pock","poas","wasp","wash","wase","plus","plum","plug","plue","yuft","ploy","plow","plot","plop","plod","plim","plie","plex","plew","pled","pleb","plea","play","plat","plap","plan","pize","pixy","wary","pium","wart","adds","pity","pits","pith","pita","wars","piss","piso","pish","pise","warp","pirs","pirn","pirl","warn","pipy","pips","pipi","pipe","addy","pipa","warm","pioy","pion","piny","pint","pins","pink","ping","pine","pina","wark","pimp","pima","pily","pill","pili","pile","pila","piki","pike","pika","pigs","ware","piet","pies","pier","pied","ward","pics","pick","pice","pica","warb","pias","pian","pial","yuck","waqf","phut","waps","phot","phos","phon","phoh","yuch","phiz","phis","wany","phew","phat","pfui","pfft","pews","want","pets","wans","pest","peso","wank","perv","pert","perp","pern","perm","perk","peri","pere","wang","peps","pepo","wane","peon","pent","pens","penk","peni","pene","pend","wand","pelt","pels","pell","pelf","pele","pela","abbe","peke","pein","pehs","wame","pegs","pegh","waly","pees","peer","peep","peen","peel","peek","peed","wall","peds","walk","pecs","peck","pech","wali","peba","peat","peas","pear","pean","peal","peak","peag","wale","abos","pays","wald","wakf","paws","pawn","pawl","pawk","pawa","wake","pavs","pave","waka","adit","paul","paua","paty","patu","pats","path","pate","wait","past","pass","pash","pase","wais","part","pars","parr","parp","park","pare","pard","para","wair","paps","pape","papa","wain","pant","pans","pang","pane","pand","wail","pams","waif","paly","pals","palp","palm","pall","pale","waid","pais","pair","pain","pail","paik","paid","pahs","yuca","page","pads","padi","wags","pacy","pact","pacs","paco","pack","pace","paca","wage","paan","paal","yuan","waft","oyez","oyes","oyer","waff","waes","zouk","wady","oxim","oxid","oxes","oxer","oxen","wadt","owts","wads","owse","owre","owns","wadi","owly","owls","wade","owes","ower","owed","wadd","yoyo","ovum","over","oven","ovel","oval","wack","ouzo","outs","wabs","oust","yows","ours","ourn","waac","oups","ouph","oupa","vums","ouma","oulk","ould","ouks","yowl","ouds","vuln","ouch","vugs","otto","otic","ossa","oses","vugh","osar","vugg","orzo","oryx","orts","yowe","vrow","orra","orle","orgy","orfs","orfe","vrou","ores","vrot","ords","ordo","vril","orcs","orca","zits","orby","orbs","vows","oral","orad","yous","vote","opus","opts","vors","your","oppo","opes","open","oped","volt","opal","opah","vols","oozy","ooze","oots","volk","oosy","oose","vole","vola","oops","youk","oont","oons","voip","ooms","void","oohs","voes","oofy","oofs","ziti","voar","onyx","yorp","onus","onto","onst","vlog","onos","vlei","only","onie","ones","oner","abri","once","vizy","vivo","omov","omit","omer","omen","ombu","vive","olpe","viva","olms","vite","olla","olio","olid","oles","oleo","olea","vita","oldy","olds","olde","vise","okta","okra","okes","okeh","visa","okay","okas","york","virl","oint","oink","oily","oils","vire","oiks","viol","viny","vint","vins","ohms","vino","ohia","ohed","vine","ogre","ogle","ogee","ogam","vina","offy","offs","yore","ofay","vims","yoop","vill","odyl","odso","vile","odor","odic","odes","odea","vild","odds","vigs","odas","odal","odah","viga","yoof","octa","oche","view","ados","occy","ocas","vies","vier","obos","obol","oboe","vied","obit","obis","obia","yont","obey","obes","vids","obas","vide","yoni","oaty","oats","oath","vice","oast","oary","oars","vibs","oaky","oaks","vibe","oafs","vias","vial","nyes","nyed","viae","nyas","yond","nuts","vext","zite","nurs","nurr","nurl","nurd","adry","vets","veto","nuns","yomp","numb","null","nuke","nuff","nude","nubs","aahs","vest","very","noys","vert","vers","nowy","nowt","nows","nown","nowl","verd","nova","nout","nous","noup","noun","noul","nott","note","nota","verb","nosy","nosh","nose","vera","norm","nork","nori","vent","nope","noop","noon","nook","noob","vend","noni","nong","none","nona","vena","noms","nome","noma","vell","nolo","noll","nole","noir","noil","vele","nogs","nogg","veld","noes","noel","nods","nodi","node","vela","nock","nobs","vein","noah","veil","nixy","nixe","vehm","nits","nite","vego","nisi","nish","vega","nirl","nips","nipa","abbs","nine","nims","nimb","vees","nils","nill","veer","nigh","niff","nife","nies","nief","nied","veep","nids","nidi","nide","yolk","nick","nice","nibs","veal","ngai","next","newt","news","vaws","nevi","neve","neum","neuk","nett","nets","nete","yold","nest","ness","nesh","nerk","nerd","neps","vavs","neon","nene","nemn","nema","neks","yoks","neif","negs","vaut","nefs","vaus","neep","neem","need","yoke","neds","vatu","neck","nebs","vats","neat","near","neap","neal","zips","nazi","naze","nays","vast","vase","navy","nave","nats","vasa","yogi","nary","nark","nare","nard","narc","naps","nape","napa","vary","naos","naoi","nans","nang","nane","nana","vars","namu","nams","name","vare","nala","nain","nail","naik","naif","vara","nags","naga","yogh","naff","vant","nads","nada","nach","nabs","nabk","nabe","vans","naan","naam","vang","mzee","myxo","myth","myna","mycs","vane","myal","yoga","mwah","muzz","vamp","mutt","muts","muti","mute","vali","must","muss","muso","musk","mush","muse","vale","murr","murl","murk","mure","mura","muon","munt","muns","muni","mung","vair","mumu","mums","mump","mumm","vain","mull","mule","muir","muil","muid","mugs","mugg","vail","muff","muds","vags","muck","much","vagi","mozz","mozo","moze","yods","moys","moyl","moya","vaes","moxa","mows","mown","mowa","yodh","move","mous","moup","moue","vade","motu","mott","mots","moti","moth","mote","vacs","most","moss","mosk","mosh","mose","yode","adze","uvea","mort","mors","morn","more","uvas","mora","uvae","mopy","mops","mope","zori","moot","moos","moor","moop","moon","mool","mook","mooi","mood","utus","mony","mons","mono","monk","mong","mona","yock","moms","momi","mome","yobs","moly","molt","mols","moll","mole","mold","mola","utis","moko","moki","moke","mojo","moit","moil","utes","mohr","mogs","zins","mofo","aeon","moes","moer","utas","mods","modi","mode","zing","mocs","mock","moch","ympt","moby","mobs","mobe","uses","moat","moas","moan","moai","user","used","mnas","ympe","ylke","mizz","urva","mixy","mixt","urus","mity","mitt","mite","mist","miss","miso","mise","ursa","miry","mirv","aero","mirs","miro","mirk","miri","mire","urps","mips","miny","minx","mint","mino","mink","mini","ming","mine","mind","mina","mime","ylem","milt","mils","milo","mill","milk","milf","mile","mild","urns","mike","mihi","miha","migs","migg","yite","miff","mien","mids","midi","uric","mics","mico","mick","mich","mice","mica","urge","mibs","ures","urea","mhos","yirr","mezz","meze","mews","mewl","urdy","meve","meus","urds","mets","meth","mete","meta","urde","mess","mesh","mese","mesa","yirk","merl","merk","meri","mere","merc","meow","meou","menu","ment","meno","meng","mene","mend","urbs","mems","memo","meme","yird","melt","mels","mell","meld","mela","urao","mein","yips","megs","mega","upta","meff","meet","mees","meer","meek","meed","upsy","meds","yipe","meck","meat","mean","meal","mead","upon","mazy","maze","mays","mayo","maya","zine","maxi","upgo","maws","mawr","mawn","mawk","updo","maut","maun","maul","maud","maty","matt","mats","math","mate","upby","masu","mast","mass","mask","mash","mase","masa","upas","mary","mart","mars","marm","marl","mark","marg","mare","mard","marc","mara","yins","maps","unto","many","mans","mano","mani","mang","mane","mand","mana","zinc","mams","mama","unit","malt","mals","malm","mall","mali","male","mala","unis","maks","mako","maki","make","yill","undy","mair","main","maim","mail","maik","maid","maha","mags","magi","magg","mage","undo","maes","unde","mads","made","unco","macs","mack","aery","aesc","mach","mace","unci","mabe","maas","maar","unce","unbe","lyte","lyse","lyre","lyra","lynx","lyne","lyms","lyme","unau","lyes","unai","lych","lyam","lwei","yike","luxe","umus","luvs","yids","lutz","lute","lust","lusk","lush","lurs","lurk","lure","zoot","luny","lunt","lunk","lung","lune","luna","lums","lump","luma","umra","lulu","lull","luke","luit","lugs","luge","umpy","luff","lues","luds","afar","ludo","lude","umps","luck","luce","lube","luau","loys","umph","ygoe","umma","lowt","lows","lowp","lown","lowe","zimb","love","lout","lous","lour","loup","loun","loud","umbo","lots","loto","loti","loth","lote","lota","zill","lost","loss","losh","lose","ulva","lory","lorn","lore","lord","ulus","lops","lope","yews","loot","loos","loor","loop","loon","loom","look","loof","ulna","long","lone","lome","loma","loll","loke","loir","loin","loid","logy","logs","logo","loge","ulex","loft","lods","lode","ules","loco","lock","loci","loch","loca","lobs","lobo","lobi","lobe","zila","loan","loam","loaf","load","ulan","live","litu","lits","lith","lite","ukes","list","lisp","lisk","yeve","lirk","liri","lire","lira","lips","lipo","lipe","lipa","yeuk","lion","liny","lint","lins","lino","linn","link","ling","line","lind","yett","limy","limp","limo","limn","lime","limb","lima","lily","lilt","lilo","lill","like","ligs","ugly","lift","life","lieu","lies","lier","lien","lief","lied","ughs","lids","lido","yeti","lick","lich","lice","libs","zigs","lias","liar","ufos","lezz","yest","leys","ueys","yesk","lewd","zoos","levy","levo","leve","leva","udos","leud","udon","lets","yerk","lest","less","udal","lerp","lere","lept","leps","tzar","lent","lens","leno","leng","lend","leme","leku","leks","leke","tyte","leis","leir","tyro","lehr","legs","tyre","left","leet","lees","leer","leep","leek","leed","typy","typp","lech","leat","leas","lear","leap","lean","leam","leal","leak","leaf","lead","typo","lazy","lazo","laze","lays","type","tyne","laws","lawn","lawk","tynd","lavs","lave","lava","tymp","lauf","laud","latu","lats","lati","lath","late","tyke","last","lass","lash","lase","tyin","lars","larn","lark","affy","lari","lare","lard","tygs","laps","yerd","lanx","lant","lank","lang","lane","land","lana","lams","lamp","lame","lamb","lama","tyes","lall","laky","lakh","lake","lair","lain","laik","laid","laic","lahs","tyer","lags","tyee","laer","afro","lady","lads","lade","tyed","abed","lacy","lacs","lack","lace","tyde","labs","yeps","twos","kyus","ziff","kyte","kype","kyne","kynd","kyle","kyes","twit","kybo","kyat","kyar","kyak","twin","kvas","kuzu","kutu","kuti","kuta","kuru","kuri","kune","kuna","kula","kuku","kuia","kufi","kues","kueh","twig","kudu","kudo","ksar","kris","krab","kows","twee","koto","koss","tway","koru","kors","koro","kore","kora","twat","kops","koph","twas","kook","kons","konk","kond","twal","kolo","kola","koka","koji","kois","twae","kohl","koha","koff","koel","kobs","kobo","yens","koas","koap","koan","tuzz","zhos","knut","knur","knub","know","knot","knop","knob","knit","knew","knee","knar","knap","knag","tutu","tuts","klik","klap","kiwi","kiva","kits","kith","kite","yelt","kist","kiss","kish","tusk","kirs","kirn","kirk","tush","kips","kipp","kipe","turn","kins","kino","kink","king","kine","kind","kina","turm","kilt","kilp","kilo","kiln","kill","kild","kike","kifs","kiff","turk","kiev","kier","kief","kids","turf","kick","kibe","turd","agar","khud","khor","khis","tups","khet","khat","agas","khan","khaf","keys","yelp","tuny","kewl","kets","keto","kete","keta","tuns","kest","kesh","kero","kern","kerf","kerb","kept","keps","kepi","tung","aged","tune","kent","kens","agee","keno","tund","kemp","kemb","kelt","kelp","kell","keks","keir","kegs","tuna","kefs","yelm","keet","keep","keen","agen","keel","keek","keef","keds","tums","keck","kebs","tump","keas","yell","kbar","kazi","kays","kayo","tule","kaws","kawa","tuis","kava","kats","kati","kata","yelk","tugs","kart","karo","karn","kark","kara","kaph","kapa","kaon","kant","kans","kang","ager","kane","kana","kami","ages","kame","kama","yeld","kali","kale","kaks","kaki","kaka","tuft","kais","kain","kaim","kail","kaik","kaif","kaie","kaid","tuff","kagu","kago","kafs","tufa","kaes","kaed","tuck","kadi","kade","kack","kabs","tubs","kaas","kaal","tube","jynx","juve","juts","jute","tuba","just","zoon","jury","jure","jura","jupe","junk","tuan","jump","juku","juke","juju","jugs","juga","tsks","judy","juds","judo","yegg","juco","jube","juba","joys","tsar","jows","jowl","tryp","jour","jouk","jots","jota","trye","joss","josh","jors","yeed","jook","jong","jomo","jolt","jols","joll","jole","trug","joky","joke","join","john","jogs","true","joey","joes","troy","joco","jock","jobs","jobe","trow","trot","jizz","trop","jivy","jive","jism","jird","jinx","jins","jinn","jink","tron","jimp","jilt","jill","jigs","trog","jiff","jibs","jibe","agha","jibb","trod","jiao","jews","trip","jeux","trio","jets","jete","trin","jest","jess","agin","jerk","jeon","jell","jehu","agio","jeff","jefe","jeez","jees","jeer","jeep","jeel","jeed","trim","jedi","jeat","jean","jazz","jazy","jays","trig","jaxy","jaws","trie","java","jaup","jauk","jato","jasy","jass","jasp","jars","jarp","jarl","jark","trez","japs","jape","trey","jann","jane","jams","jamb","abut","jaks","jake","trew","jail","tret","jags","jagg","jaga","tres","jafa","jade","aglu","jack","agly","jabs","trek","jaap","tref","agma","izar","ixia","iwis","tree","tray","iure","trat","item","itch","itas","trap","tram","isos","trad","isna","isms","toze","isle","isit","toys","isba","toyo","iron","irks","yede","iris","irid","ires","ired","towy","iota","yech","ions","abye","towt","into","inti","tows","town","agog","inro","inns","abys","inly","inky","agon","inks","yebo","inia","ings","ingo","tout","info","inch","inby","tour","imps","impi","toun","immy","imid","imam","illy","ills","touk","ilks","ilka","tots","ilia","ilex","ilea","ikon","ikat","ikan","iglu","iggs","tote","igad","yeas","iffy","tost","toss","idyl","tosh","idol","idly","idle","ides","idem","idee","idea","tose","tosa","tory","icon","icky","tort","ichs","tors","ices","icer","iced","torr","ibis","ibex","iamb","hyte","hyps","hypo","hype","toro","hymn","hyle","hyla","hyke","hyes","hyen","hyed","torn","hwyl","hwan","huts","tori","huss","huso","husk","hush","hurt","hurl","hups","tore","hunt","huns","hunk","hunh","hung","torc","hums","hump","humf","huma","tora","hull","hulk","hule","hula","huis","huic","huia","year","huhu","tops","hugy","hugs","huge","topo","huff","hues","huer","hued","topi","huck","hubs","toph","hoys","hoya","tope","yean","hows","howl","howk","howf","howe","toot","hove","hout","hour","houf","hots","hote","acai","host","hoss","hose","toon","hors","horn","hori","hore","hora","hops","hope","toom","hoot","hoor","hoop","hoon","hook","hoof","hood","tool","hons","honk","hong","hone","hond","took","homy","homs","homo","home","homa","yeah","holy","holt","hols","holp","holm","holk","hole","hold","hoki","hoke","hoka","hoik","tony","tons","hohs","hoha","tonk","hogs","hogh","ague","hogg","tong","hoes","hoer","hoed","tone","hods","yead","hock","toms","hobs","hobo","tomo","hoax","hoas","hoar","tome","tomb","zeze","tolu","tolt","toll","hizz","hiya","hive","ahed","hits","ahem","tole","hist","told","hiss","hisn","hish","tola","hire","hipt","ahis","hips","toko","hioi","hint","hins","hing","ahoy","toke","hind","toit","hims","toil","hilt","hill","hili","toho","togs","aias","hild","hila","hike","toge","aida","high","hies","hied","toga","aide","hide","zzzs","hick","tofu","toft","heys","toff","toey","hews","hewn","toes","aids","hets","heth","aiga","hete","toed","hest","hesp","toea","hery","hers","hero","hern","herm","herl","here","herd","herb","ybet","tody","hept","heps","tods","hent","hens","hend","yays","hems","hemp","heme","tocs","help","helo","helm","hell","hele","held","heir","heil","heid","hehs","toco","heft","ails","heel","heed","heck","hech","hebe","heat","hear","heap","heal","head","tock","zeta","hazy","haze","hays","toby","haws","hawm","hawk","toad","have","aims","yawy","aine","haut","haul","hauf","ains","haud","hats","hath","hate","tizz","yaws","hast","hass","hasp","hask","hash","tivy","hart","harp","haro","harn","harm","harl","hark","hare","hard","hapu","haps","tits","haos","titi","hant","hank","hang","hand","tite","hams","hame","yawp","halt","halo","halm","hall","half","hale","haku","hake","haka","hajj","haji","abet","hair","hain","hail","haik","hahs","haha","tirr","hags","hagg","tiro","haft","haff","haet","haes","haen","haem","haed","tirl","hads","hadj","hade","tire","hack","habu","haar","haaf","tipt","gyve","gyte","gyro","gyri","gyre","gyps","tips","gyny","gyms","gymp","tipi","gybe","gyal","guys","yawn","guvs","tiny","guts","tint","gust","gush","tins","guru","gurs","gurn","gurl","tink","gups","ting","guns","gunk","gung","tine","gums","gump","tind","guly","guls","gulp","gull","gulf","gule","gula","tina","airn","guid","guga","guff","gues","yawl","gude","guck","gubs","time","guar","guan","tilt","grum","grue","grub","grrl","grow","grot","grok","grog","grit","airs","gris","grip","grin","grim","grig","grid","grey","grex","grew","gren","gree","gray","grav","grat","gran","gram","grad","grab","goys","tils","till","gown","gowl","gowk","gowf","gowd","govs","tile","gout","gouk","goth","airt","zest","goss","gosh","tiks","gory","gorp","gorm","gori","gore","gora","tiki","goos","goor","goop","goon","gool","gook","goog","goof","good","tike","gons","gonk","gong","gone","tika","airy","yaup","golp","golf","gole","gold","goji","gogo","goff","goey","tigs","goes","goer","goel","acca","aits","aitu","gods","tige","goby","gobs","gobo","ajar","ajee","gobi","yaud","goat","goas","goal","goaf","goad","tift","tiff","gnus","ties","tier","gnow","gnaw","akas","gnat","gnar","glut","glum","tied","glug","glue","aked","glow","glop","akee","glom","glob","glit","glim","glid","glib","akes","glia","gley","glen","akin","glei","gleg","glee","gled","glam","glad","gjus","yate","gizz","give","gits","gite","tidy","gist","gism","tids","girt","girr","giro","girn","tide","yarr","girl","gird","gips","tics","gios","tick","gins","ginn","gink","ging","tich","gimp","gilt","gill","gild","gila","gigs","giga","tice","gift","alae","yarn","gies","gien","gied","tiar","gids","tian","gibs","gibe","yark","yare","ghis","thus","alan","ghee","ghat","thug","geum","gets","geta","thud","gest","gert","gers","germ","gere","thru","geos","thro","genu","alap","gent","gens","gene","alar","gena","thou","gems","thon","gelt","gels","geld","yard","geit","geez","gees","geep","geek","geed","this","geds","alas","thir","geck","geat","gear","gean","geal","gazy","gaze","gays","thio","gaws","alay","gawp","gawk","gawd","thin","alba","thig","gave","gaus","gaur","gaup","gaun","gaum","gaud","they","gats","albe","gath","gate","thew","gast","gasp","gash","then","gart","gars","gari","gare","garb","them","gapy","gaps","gapo","gape","thee","gaol","gant","gans","gang","gane","zero","gamy","gams","gamp","game","gamb","gama","thaw","gals","gall","gale","gala","that","gaks","thar","gajo","gait","gair","gain","gaid","gags","gage","gaga","than","gaff","albs","gaes","gaen","gaed","thae","gads","gadi","gade","text","gaby","gabs","yaps","fyrd","fyle","fyke","fyce","tews","fuzz","fuze","futz","fust","fuss","fuse","fusc","fury","furs","furr","furl","yapp","funs","funk","fung","fund","tets","fumy","fums","fume","teth","full","fuji","fugu","fugs","tete","fuff","fuel","fuds","zerk","fuck","fuci","fubs","test","yank","frug","frow","fros","from","frog","froe","tern","friz","frit","fris","frig","frib","fret","free","fray","frau","frat","fras","frap","frag","frae","frab","term","fozy","foys","terf","foxy","tepa","fowl","fous","four","foul","foud","tent","foss","fort","form","fork","alco","fore","ford","forb","fora","tens","fops","tene","foot","fool","food","font","fons","fone","fond","tend","folk","fold","foin","foil","foid","fohn","yang","fogy","fogs","tems","foes","foen","temp","foci","fobs","teme","foam","foal","telt","flux","flus","flue","flub","tels","flox","flow","flor","flop","flog","floe","floc","flob","flix","flit","flir","flip","flim","flic","fley","flex","flew","fleg","flee","fled","flea","flay","flax","flaw","flat","flap","flan","flam","flak","flag","flab","fizz","tell","fixt","tele","five","fitt","fits","teld","fist","fisk","fish","fisc","firs","firn","firm","firk","tela","fire","yams","fiqh","fins","fino","alec","fink","fini","fine","find","tein","fils","alee","alef","filo","film","fill","file","fila","teil","fiky","fike","figs","figo","tehr","fife","fier","fief","tegu","fids","fido","tegs","fico","fice","fibs","tegg","fiat","fiar","zeps","feys","tefs","fews","teff","feus","feud","yale","fett","fets","fete","feta","tees","fest","fess","ales","teer","fern","ferm","fere","teen","feod","fent","fens","alew","feni","fend","teem","fems","feme","teel","felt","fell","feis","fehs","fehm","teek","fegs","teed","feet","fees","feer","feen","feel","feed","feeb","yald","feds","tedy","feck","feat","fear","teds","alfa","feal","yaks","faze","fays","tecs","tech","faws","fawn","abas","fave","fava","faux","faut","faur","faun","fats","fate","teat","fast","alfs","alga","fash","teas","fart","fars","faro","farm","farl","fare","fard","tear","team","fans","fano","fank","fang","fane","fand","teal","fame","falx","fall","fake","faix","fair","fain","fail","faik","fahs","teak","fags","tead","faff","yahs","fady","fads","fado","fade","zoom","fact","face","fabs","tays","faas","faan","yags","taxi","eyry","eyre","eyra","eyot","eyne","eyes","eyer","eyen","eyed","taxa","eyas","exul","expo","exon","yagi","exit","exes","exed","exec","exam","tawt","ewts","taws","ewks","tawa","ewes","ewer","zels","evos","evoe","tavs","evil","evet","eves","ever","even","tava","euro","euoi","euks","yaff","eugh","euge","etui","etna","etic","eths","ethe","taut","eten","etch","etat","etas","taus","zyga","ests","tatu","esse","tatt","espy","esne","esky","eses","tats","eruv","erst","tath","errs","tate","eros","erns","erne","yads","tass","erks","task","eric","erhu","alif","ergs","ergo","tash","zeks","erev","eres","ered","tart","eras","tars","tarp","epos","epic","epha","epee","eorl","eons","taro","eoan","envy","enuf","tarn","enow","enol","engs","tare","enew","enes","tara","ends","yack","tapu","emys","emyd","emus","taps","tape","empt","emos","tapa","emmy","emma","emit","emir","emic","emfs","yaba","emeu","emes","taos","yaar","elts","tans","else","tank","elmy","alit","elms","tanh","ells","tang","elks","tane","elhi","elfs","tana","elds","abid","elan","tams","ekka","ekes","eked","tamp","eish","eine","eina","eild","eiks","tame","eide","zyme","ehed","tall","egos","talk","egma","egis","eggy","eggs","tali","eger","egal","egad","efts","tale","talc","effs","tala","taky","eevn","eery","taks","eely","eels","taki","take","eech","taka","xyst","edit","edhs","zein","edgy","edge","eddy","eddo","tait","ecus","tais","ecru","ecos","ecod","tain","echt","echo","eche","tail","ecco","ecce","ecad","ebon","ebbs","taig","eave","eaux","eaus","xray","eats","eath","tahr","easy","east","ease","taha","ears","earn","alko","earl","eard","tags","eans","alky","zees","eale","each","taes","dzos","tael","dzho","dyne","dyke","dyes","dyer","dyed","taed","aals","dyad","dwam","tads","duty","dust","dusk","dush","durr","duro","durn","dure","dura","dups","dupe","wyte","duos","tact","dunt","duns","dunk","dung","dune","taco","dump","dumb","duma","duly","dull","dule","duke","duka","duit","tack","tach","dugs","tace","duff","duet","dues","duel","dued","tabu","duds","dude","tabs","duct","duck","duci","duce","dubs","tabi","duar","duan","dual","duad","dsos","wyns","drys","taal","drum","drug","drub","drow","drop","drip","drib","drey","drew","drek","dreg","dree","dray","draw","drat","drap","dram","drag","drad","drac","drab","dozy","doze","doys","wynn","doxy","dowt","dows","dowp","down","dowl","dowf","dowd","syph","dove","doux","dout","dour","doup","doun","doum","douk","douc","doty","dots","doth","dote","sype","dost","doss","dosh","dose","syne","dory","dort","dors","dorr","dorp","dorm","dork","dore","dorb","synd","dopy","dops","dope","dopa","sync","doos","door","doon","doom","dool","dook","doob","wynd","dons","dong","done","dona","syli","domy","doms","dome","syke","dolt","dols","doll","dole","syes","dojo","doit","dohs","syen","dogy","dogs","doge","syed","doff","zeds","does","doer","doen","doek","syce","dods","dodo","sybo","docs","doco","dock","wyle","doby","dobs","swum","doat","doab","swot","djin","diya","dixy","dixi","divs","divo","divi","dive","diva","swop","ditz","ditt","dits","dite","dita","swob","diss","disk","dish","disc","disa","swiz","dirt","dirl","dirk","dire","dipt","dips","swim","diol","dint","dins","dino","dink","ding","dine","swig","dims","dimp","dime","swey","dill","dike","dika","digs","swee","difs","diff","sway","diet","dies","diel","died","dieb","swat","didy","dido","swap","dict","dick","dich","dice","dibs","swan","dial","swam","dhow","dhol","dhal","dhak","deys","swag","dexy","swad","dewy","dews","swab","devs","deva","susu","deus","desk","desi","derv","dero","dern","derm","dere","deny","dent","dens","deni","dene","suss","demy","demo","deme","delt","dels","delo","dell","deli","delf","dele","wyes","deke","deil","deif","deid","surf","degu","degs","sure","defy","deft","defo","defi","surd","deev","deet","dees","deer","deep","deen","deem","deek","deed","sura","deco","deck","debt","debs","debe","abac","deaw","dear","dean","deal","deaf","dead","suqs","daze","days","wych","dawt","daws","dawn","dawk","dawd","sups","davy","daut","daur","daud","daub","dato","date","data","dash","supe","dart","darn","dark","dari","darg","dare","darb","alls","daps","wuss","dant","dans","dank","dang","suns","dams","damp","damn","dame","sunn","dalt","dals","dali","dale","sunk","daks","suni","dais","dahs","dahl","sung","dags","dago","zebu","daft","daff","daes","sumy","dads","dado","dada","ally","sums","dack","dace","dabs","sump","daal","sumo","alma","czar","cyte","cyst","cyme","cyma","cyan","cwms","wull","sulu","cuts","cute","sulk","cuss","cusp","cusk","cush","curt","alme","curs","curr","curn","curl","curf","cure","curd","curb","suks","cups","sukh","cunt","cums","wudu","cult","culm","cull","cuke","cuit","cuif","cuff","cues","cued","suit","alms","cuds","suid","cubs","cube","wuds","sugs","crux","crus","crue","crud","sugo","crow","crop","crog","croc","crit","cris","crim","crib","cria","crew","crem","cree","cred","cray","craw","crap","cran","cram","alod","crag","crab","cozy","coze","sugh","aloe","coys","zeas","coxy","coxa","suet","cowy","cows","cowp","cowl","cowk","sues","cove","cour","coup","cott","cots","coth","cote","suer","cosy","cost","coss","cosh","aloo","cose","sued","cory","cors","corn","corm","cork","corf","core","cord","alow","zeal","suds","copy","cops","cope","sudd","coot","coos","coop","coon","coom","cool","cook","coof","writ","cony","cons","conn","conk","coni","conf","cone","cond","suck","coms","comp","comm","come","comb","coma","coly","colt","cols","coll","cole","cold","cola","such","coky","coke","coit","coir","coin","coil","coif","coho","cogs","subs","coft","coff","coed","cods","code","coda","suba","coco","cock","coch","coca","cobs","cobb","wren","coax","coat","coal","stye","clue","club","cloy","clow","clou","clot","clop","clon","alps","clog","clod","wrap","clit","clip","also","clew","clem","cleg","clef","stun","clay","claw","clat","clap","clan","clam","clag","clad","cive","city","cits","cito","cite","stum","cist","stud","cirl","cire","cion","cine","cill","cigs","stub","ciel","cids","cide","stow","ciao","chut","chur","chum","chug","chub","chow","chou","chop","chon","chog","choc","chiz","chiv","chit","chis","chip","chin","chik","chid","chic","chib","chia","stot","chez","chew","cher","chef","stop","chay","chaw","chav","chat","chas","char","chap","chao","cham","chal","chai","chad","stob","stoa","cete","cess","cert","cero","cere","ceps","cepe","stir","cent","cens","celt","cels","cell","stim","ceil","cees","stie","cedi","cede","ceca","ceas","stey","cays","stew","alto","caws","cawk","stet","cavy","cave","cava","caup","caum","caul","cauk","cauf","cats","cate","step","cast","cask","cash","case","casa","alts","sten","cart","cars","carr","carp","carn","carl","alum","cark","care","card","carb","stem","caps","capo","capi","caph","cape","capa","sted","cany","cant","cans","cann","cang","cane","stay","cams","camp","camo","came","cama","staw","calx","calp","calo","calm","call","calk","calf","caky","cake","cain","caid","cagy","cags","cage","stat","caff","cafe","cads","cadi","cade","alus","star","cack","caca","cabs","caba","stap","caas","stag","byte","stab","byrl","byre","byke","byes","zonk","byde","sris","buzz","buys","wows","butt","buts","wowf","spur","bute","spun","busy","bust","buss","busk","amah","bush","spug","bury","burs","burr","burp","burn","burl","burk","burg","burd","burb","bura","spue","buoy","bunt","buns","bunn","bunk","bung","bund","buna","spud","bums","bump","bumf","spry","bull","bulk","bulb","buke","buik","buhr","buhl","bugs","spot","bufo","buff","buds","budo","budi","buda","spod","buck","bubu","bubs","bubo","buba","spiv","buat","brux","amas","brut","brus","spit","brrr","spin","brow","bros","broo","brog","brod","spim","brit","bris","brio","brin","brim","brik","brig","brie","brey","brew","brer","bren","brei","bree","bred","bray","braw","brat","bras","bran","brak","brag","brae","brad","spik","bozo","boys","boyo","boyg","boyf","spif","boxy","spie","bows","bowr","bowl","spic","bout","boun","bouk","bott","bots","both","bote","bota","spew","boss","bosk","bosh","spet","bort","bors","born","borm","bork","bore","bord","bora","spek","bops","sped","boot","boos","boor","boon","boom","bool","book","booh","boob","spec","bony","bonk","bong","bone","bond","bona","spaz","bomb","boma","bolt","bolo","boll","bole","bold","bola","boks","boko","boke","spay","bois","boil","spaw","bohs","boho","spat","bogy","bogs","spas","boff","boet","boep","body","bods","bode","spar","bock","bobs","boba","span","boat","boas","boar","boak","boab","spam","spag","blur","blue","blub","blow","blot","blog","bloc","blob","blit","blip","blin","bley","blew","blet","blee","bled","bleb","blay","blaw","blat","blam","blah","blag","blae","blad","blab","bize","spae","bitt","bits","bito","bite","zone","bist","bisk","bish","ambo","bise","wove","birr","biro","birl","birk","bird","bios","biog","soys","bint","bins","bink","bing","bine","bind","soya","bima","bill","bilk","bile","bike","bigs","bigg","biga","wots","biff","bier","bien","bids","bidi","bide","zati","bice","bibs","bibb","sows","bias","sowp","bhut","bhel","bhat","bhai","sown","beys","sowm","bevy","bets","beth","bete","beta","sowl","best","sowf","berm","berk","berg","bere","bent","bens","benj","beni","bene","wost","bend","sovs","bema","belt","bels","bell","zona","bein","begs","bego","sout","beet","bees","beer","beep","been","beef","sous","bedu","beds","bede","sour","beck","beau","beat","bear","bean","beam","beak","bead","soup","bayt","bays","baye","soum","bawr","bawn","bawl","bawd","amen","baur","bauk","baud","batt","bats","bath","bate","soul","bast","bass","bask","bash","base","souk","bars","barp","barn","barm","bark","barf","bare","bard","barb","wort","bapu","baps","sots","bant","bans","bank","bani","bang","bane","band","banc","soth","bams","worn","balu","bals","balm","ball","balk","bale","bald","soss","bake","baju","bait","bail","bahu","baht","worm","bags","bagh","sort","baft","baff","ames","bael","bads","bade","sorn","bacs","back","bach","sori","baby","babu","babe","baba","sore","amia","baas","baal","sord","sorb","azym","azon","sora","azan","ayus","sops","soph","ayre","ayin","ayes","work","ayah","soot","axon","axle","axis","axil","axes","axel","axed","amid","soop","axal","soon","awry","awol","awny","awns","soom","awls","sool","awks","sook","awfy","awes","awee","awed","sons","awdl","away","song","sone","amie","avow","avos","wore","avid","aves","aver","avel","amin","somy","avas","aval","soms","auto","aura","aunt","aune","auld","aula","auks","some","aufs","soma","word","auas","sols","atua","solo","soli","atop","atom","atok","atoc","atma","ates","amir","sole","atap","sold","amis","sola","asps","wops","asks","soke","ashy","soja","asea","asci","asar","soil","aryl","sohs","arvo","arum","arty","arts","arti","soho","amla","arsy","arse","zari","arpa","arow","arna","army","arms","sogs","arle","ammo","arks","woot","aris","aril","arid","aria","argh","arfs","soft","arew","aret","ares","areg","ared","area","sofa","ards","sods","arcs","arco","arch","soda","arbs","arba","woos","arar","arak","socs","aqua","apts","sock","apso","apse","apps","soca","apos","apod","woon","apex","apes","aper","aped","sobs","apay","soba","anus","ants","anti","ante","anta","wool","ansa","soar","anow","anon","anoa","anns","anno","anna","soap","ankh","anis","anil","soak","anga","anew","anes","woof","ands","snye","ance","anas","anan","anal","wood","snug","amyl","amus","snub","amps","snow","amok","anise","grike","amole","among","noose","noops","noons","amort","adult","nooky","nooks","amour","amove","amowt","zymic","zymes","amped","nooit","noria","zygon","zygal","aalii","zuzim","zurfs","zupas","zupan","zulus","noobs","noris","zowie","zouks","nonyl","aargh","zorro","zoris","zoril","zoppo","zoppa","norks","norma","ample","zooty","amply","norms","ampul","amrit","north","amuck","amuse","aarti","nosed","noser","noses","nosey","amyls","zoons","zooms","notal","zooks","zooid","notch","zooey","zooea","noted","noter","zonks","abaca","zones","zoner","notes","zoned","zonda","zonal","zonae","abaci","notum","zombi","aback","abacs","zoist","nopal","zoism","nould","noule","nouls","aduki","zoeas","zoeal","zoeae","nouns","anana","nouny","adsum","noups","zocco","zobus","zobos","zoaea","zloty","zlote","zizit","zizel","abaft","abaka","zitis","novae","novas","ziram","abamp","zippy","anata","novel","zippo","zinky","zinke","zingy","novum","zings","noway","nowed","ancho","zines","zineb","aband","nowls","zincy","zincs","zinco","nowts","nowty","noxal","noxes","ancle","ancon","noyau","noyed","noyes","andro","zimbs","zimbi","zills","zilla","zilch","zilas","zigan","anear","ziffs","zibet","zhomo","anele","zezes","zexes","zetas","nubby","zesty","zests","nubia","zeros","anent","nucha","zerks","zerda","abase","nonny","nuddy","angas","angel","nuder","nudes","nudge","anger","nudie","zeins","abash","zebus","angle","zebub","nudzh","zebra","nuffs","anglo","zebec","zeals","nugae","zazen","zayin","angry","angst","nuked","zaxes","zatis","nukes","nulla","zaris","zarfs","nulls","anigh","abask","anile","zappy","anils","anima","zanze","zanza","abate","zante","zanja","numbs","numen","anime","animi","nonis","anion","amoks","zamia","zambo","zaman","anker","amnio","ankhs","ankle","nunny","ankus","zakat","anlas","amnic","amnia","zaire","annal","annas","annat","nurds","nurdy","annex","nurls","nurrs","nurse","zacks","zabra","yuzus","annoy","yurts","yurta","annul","yuppy","yupon","yumps","yummy","anoas","anode","yummo","nongs","yules","anole","yulan","yukos","anomy","yukky","yukes","yuked","nutso","nutsy","abaya","yugas","yufts","yucky","yucks","yucko","nutty","ansae","abbas","nyaff","antae","yucch","yucca","yucas","abbed","yuans","abbes","nyala","ytost","antar","ysame","antas","yrneh","yrivd","yrent","yrapt","nying","abbey","anted","yowls","nylon","nymph","yowie","yowes","yowed","abbot","youth","youse","antes","yourt","nonet","yours","yourn","nyssa","nones","oaked","oaken","oaker","young","youks","yorps","oakum","yorks","yores","yoops","yoofs","yonks","yonis","yonic","yomps","yomim","yolky","yolks","abcee","oared","yokul","yokes","yoker","yokel","yoked","yojan","yoick","yogis","yogin","yogic","yoghs","oases","oasis","yogee","yogas","oasts","yodle","yodhs","oaten","yodel","yocks","yobbo","oater","ympes","oaths","ymolt","ylkes","ylike","ylems","yitie","yites","yirth","yirrs","yirks","yirds","yippy","yipes","oaves","obang","yince","yills","yikes","yiked","antic","yield","obeah","yfere","yexes","yexed","yewen","yeves","yeven","yeuky","yeuks","yetts","yetis","abeam","yesty","yests","abear","obeli","yesks","yeses","yerks","yerds","yerba","obese","yente","yenta","abele","yelts","yelps","yelms","yells","yelks","obeys","adred","yeggs","yeeds","yedes","obias","yechy","yechs","obied","yecch","obiit","yeast","obits","years","yearn","objet","yeard","yeans","yealm","yeahs","yeads","ydred","ydrad","ycond","ycled","yclad","ybore","yawps","yawny","yawns","adrad","oboes","yawls","yawey","yawed","abets","yaups","yauld","yauds","obole","yates","oboli","obols","yarto","yarta","yarrs","yarns","yarks","yarfa","yarer","yards","yarco","yappy","yapps","yapon","yapok","adoze","occam","yanks","yangs","yamun","yampy","yamen","yales","occur","yakow","yakka","nonce","abhor","yaird","adown","ocean","yahoo","yagis","yager","yaffs","yacks","yacka","yacht","yacca","yabby","ocher","yabba","yabas","yaars","oches","xysts","xysti","xylyl","ochre","xylol","ochry","ocker","xylic","xylem","ocrea","xylan","xrays","abide","xoana","xerus","xerox","octad","xeric","octal","octan","antis","xenon","nonas","xenic","xenia","xebec","octas","octet","wytes","wyted","wynns","wynds","wyles","wyled","abies","wuxia","wussy","wushu","wuses","wurst","wulls","wudus","octyl","wryly","wryer","wrung","wroth","wrote","oculi","wroot","odahs","odals","adorn","wrong","wroke","odder","antra","antre","writs","oddly","antsy","nomos","anvil","nomoi","anyon","odeon","odeum","aorta","apace","apage","write","apaid","odism","apart","odist","odium","wrist","apayd","apays","ammos","apeak","apeek","adore","nomic","apers","apert","nomes","apery","apgar","wring","nomen","nomas","odors","odour","aphid","wries","aphis","nomad","nolos","nolls","odyle","noles","wrier","wried","noisy","wrick","odyls","apian","noise","aping","apiol","noirs","apish","apism","wrest","noint","wrens","noily","noils","apnea","nohow","noggs","wreck","noels","nodus","wreak","nodes","apode","noddy","apods","wrawl","wrath","wrate","nodal","wrast","wrapt","wraps","nocks","apoop","ofays","wrang","offal","wrack","woxen","wowee","aport","wowed","woven","nobly","wound","offed","noble","would","worts","nobby","worth","worst","noahs","worse","nkosi","worry","nizam","appal","nixie","nixes","nixer","nixed","wormy","nival","offer","worms","appay","nitty","nitry","appel","world","offie","works","nitro","apple","nitre","niton","wordy","apply","words","nitid","nites","niter","nisus","woozy","nisse","wootz","woosh","woose","nisei","woops","woons","nirly","wooly","nirls","niqab","wools","nippy","oflag","appro","often","nipas","woold","woofy","woofs","ninth","wooer","appui","ninon","wooed","ofter","woody","appuy","ninny","apres","ninja","ogams","apron","nines","apses","apsis","apsos","ogeed","ogees","apted","apter","oggin","aptly","ogham","nimps","aquae","nimbs","woods","ogive","ogled","ogler","nimbi","ogles","adunc","nills","aquas","ogmic","nikau","nikah","nikab","araba","nihil","ogres","ohias","ohing","ohmic","ohone","oidia","wonts","wonky","wonks","araks","arame","arars","oiled","oiler","wongi","arbas","wonga","womyn","women","womby","wombs","arbor","night","nighs","arced","woman","wolve","wolly","niger","wolfs","nifty","niffy","niffs","wolds","wokka","woken","nifes","woful","oinks","adust","wodge","wocks","nieve","niefs","woald","woads","wizes","wizen","niece","wives","wiver","nidus","wived","witty","nidor","oints","ojime","nides","withy","adopt","withs","nided","okapi","arcos","nidal","okays","okehs","arcus","ardeb","ardor","ardri","okras","withe","oktas","nicol","aread","areae","areal","arear","areas","areca","aredd","arede","olden","arefy","areic","arena","arene","wites","nicks","wited","older","arepa","arere","arete","arets","arett","argal","argan","oldie","argil","witch","argle","argol","argon","witan","nicht","argot","argue","niche","wists","argus","nicer","arhat","arias","ammon","nicad","ariel","ariki","wispy","arils","ariot","arise","arish","wisps","wisht","wisha","arked","ngwee","arled","arles","ngoma","wises","wiser","ngati","armed","armer","armet","ngana","ngaio","armil","nexus","nexts","newts","newsy","armor","oleic","olein","olent","oleos","arnas","oleum","arnut","aroba","aroha","aroid","aroma","wised","wirra","arose","arpas","arpen","newly","arrah","wires","wirer","newie","adobo","olios","arras","newer","array","newel","newed","nevus","wired","neves","arret","never","arris","nevel","olive","wipes","wiper","wiped","winze","arrow","amman","arsed","ollas","ollav","oller","ollie","adobe","arses","arsey","arsis","arson","ology","amlas","amity","artal","olpae","artel","olpes","abled","winos","winns","omasa","omber","winna","winks","ombre","wingy","ombus","omega","wings","artic","omens","omers","winge","winey","omits","omlah","wines","wined","artis","windy","artsy","omovs","aruhe","arums","arval","arvos","omrah","aryls","winds","asana","oncer","onces","oncet","oncus","onely","oners","onery","ascot","ascus","asdic","onion","onium","ashed","ashen","ashes","ashet","onkus","onlay","aside","onned","neums","asked","asker","askew","askoi","askos","neume","neuks","netty","winch","netts","aspen","asper","onset","wince","abler","wimpy","wimps","ables","wilts","ablet","netop","willy","wills","aspic","netes","ontic","nests","aspis","aspro","amiss","assai","assam","wilja","wilis","assay","wilga","nervy","wiles","wiled","wilds","asses","nerve","nertz","nerts","asset","wilco","wikis","assez","ablow","nerol","nerks","nerka","wight","wiggy","nerdy","wigga","wigan","wifty","nerds","wifie","wifey","wifes","neral","wifed","wiels","nepit","oobit","wield","assot","width","oohed","widow","wides","wider","widen","aster","widdy","oomph","admix","oonts","ooped","wicky","wicks","neper","astir","oorie","ooses","wicca","ootid","oozed","oozes","whups","abmho","whump","whoso","admit","whose","whort","neons","whorl","opahs","whore","whops","whoot","opals","whoop","whoof","whomp","opens","astun","opepe","asway","aswim","asyla","opera","whole","nenes","nempt","amirs","nemns","ataps","ataxy","whizz","whity","nemas","amins","nelly","nelis","neive","neist","whits","opine","oping","neigh","neifs","negus","atigi","atilt","atimy","opium","atlas","atman","atmas","atocs","atoke","atoks","atoll","negro","oppos","atoms","atomy","opsin","atone","atony","atopy","atria","atrip","white","opted","opter","optic","neeze","whist","neese","neeps","whiss","neems","neemb","attap","attar","neele","neeld","needy","needs","whisk","whish","whirs","whirr","attic","neddy","whirl","whipt","whips","orach","oracy","whios","whiny","whins","orals","orang","orant","atuas","necks","orate","whine","audad","orbed","audio","whims","orbit","whilk","while","whigs","whift","audit","orcas","auger","aught","whiff","whids","augur","nebel","nebek","aulas","aulic","auloi","aulos","aumil","which","aunes","wheys","neats","aunts","aunty","amino","aurae","aural","neath","aurar","auras","aurei","aures","auric","nears","auris","whews","aurum","neaps","whets","orcin","neals","neafe","nazis","where","whens","nazir","nazes","whelp","whelm","whelk","wheft","order","nawab","navvy","wheep","wheen","navew","naves","navel","wheel","navar","naval","wheat","whear","wheal","whaur","whaup","whats","whata","abode","naunt","ordos","wharf","whare","whaps","nauch","oread","whang","whams","whamo","whale","orfes","natty","whack","abohm","wexes","wexed","organ","wetly","natis","wetas","aboil","wests","autos","orgia","wersh","weros","nates","natch","wents","wenny","orgic","wenge","wends","natal","wench","wembs","welts","nasty","orgue","oribi","welsh","welly","auxin","wells","nashi","avail","avale","avant","oriel","nasal","avast","amine","avels","welkt","welks","avens","welke","narre","welds","narky","avers","narks","avert","naris","avgas","naric","avian","nares","nards","narcs","welch","amigo","avine","avion","wekas","avise","aviso","weize","avize","weise","avoid","weirs","orixa","orles","amiga","orlon","amies","orlop","ormer","avows","narco","weird","avyze","await","awake","ornis","award","naras","aware","awarn","awash","awato","awave","nappy","weils","aways","amids","awdls","aweel","aweto","awful","awing","amido","nappe","nappa","awmry","awned","awner","napoo","awoke","awols","awork","amide","amici","axels","axial","amice","axile","axils","axing","axiom","weigh","weids","napes","wefts","wefte","axion","naped","axite","axled","axles","napas","axman","axmen","axoid","axone","axons","nanua","ayahs","weets","ayelp","amias","aygre","ayins","ayont","orpin","ayres","ayrie","weete","aboma","azans","weest","weepy","weeps","azide","azido","azine","azlon","azoic","azole","azons","azote","azoth","orris","azuki","azure","azurn","azury","nanny","weeny","azygy","azyme","azyms","baaed","weens","baals","nanna","babas","weems","nandu","babel","weels","babes","weeks","nancy","nance","nanas","babka","baboo","ortho","namus","namma","babul","babus","names","weeke","namer","weedy","weeds","named","bacca","nalla","naled","nalas","bacco","baccy","bacha","nakfa","naker","wedgy","bachs","wedge","naked","wedel","naive","wecht","nairu","naira","nails","naiks","orval","naifs","naiad","nahal","nagor","naggy","weber","webby","nagas","orzos","naffs","oscar","weave","naevi","naeve","nadir","backs","nadas","weary","wears","nacre","nacho","nache","weans","weamb","nabob","weals","weald","nabla","nabks","nabis","nabes","wazoo","wazir","naans","naams","mzees","myxos","bacon","oshac","osier","mythy","myths","wayed","osmic","osmol","waxes","waxer","waxen","waxed","aboon","wawls","baddy","badge","wawes","abord","badly","wawas","baels","baffs","baffy","bafts","bagel","ossia","baggy","baghs","bagie","mythi","wavey","bahts","bahus","bahut","waves","mysid","bails","ostia","bairn","waver","baith","myrrh","baits","baiza","baize","bajan","bajra","bajri","bajus","baked","baken","baker","bakes","bakra","waved","abore","waurs","balas","wauls","waulk","wauks","myopy","myops","balds","baldy","baled","baler","bales","myope","otaku","waugh","myoma","balks","balky","wauff","myoid","watts","otary","other","mynas","mynah","ottar","mylar","otter","ottos","balls","oubit","bally","oucht","ouens","balms","balmy","ought","baloo","balsa","water","balti","balun","balus","ouija","bambi","oulks","ament","banak","banal","oumas","ounce","oundy","oupas","ouped","ouphe","amens","watch","banco","bancs","watap","banda","ouphs","wasts","ourie","bandh","ousel","myall","waste","admin","bands","mvule","muzzy","bandy","baned","banes","waspy","bangs","wasps","bania","muxes","muxed","banjo","washy","banks","ousts","admen","mutts","banns","muton","bants","bantu","banty","mutis","banya","amene","bapus","mutha","mutes","muter","muted","advew","wases","barbe","mutch","warty","barbs","musty","barby","barca","musts","warts","musth","barde","bardo","bards","bardy","mussy","bared","musse","warst","barer","bares","musos","barfs","barge","musky","musks","baric","barks","barky","musit","barms","barmy","barns","warre","outby","barny","music","mushy","baron","warps","musha","muset","muses","muser","abort","barps","warns","mused","barra","warms","barre","musca","musar","murva","warks","murti","murry","murrs","barro","barry","murri","barye","murre","basal","basan","murra","amend","murly","murls","based","warez","wares","basen","murky","murks","baser","wared","bases","wards","basho","basic","murid","murex","mures","basij","basil","mured","basin","muras","basis","mural","basks","warby","warbs","bason","muons","basse","muntu","bassi","munts","basso","bassy","basta","waqfs","baste","basti","munis","wanze","basto","basts","outdo","batch","bated","bates","mungs","mungo","bathe","wanty","munge","wants","munga","baths","munch","mumus","mumsy","wanna","wanly","wanle","wanky","wanks","mumps","batik","baton","mummy","mumms","batta","wangs","waney","wanes","waned","wands","wamus","outed","batts","battu","outer","batty","bauds","bauks","baulk","baurs","bavin","wames","bawds","bawdy","outgo","bawls","wamed","bawns","bawrs","bawty","bayed","bayes","bayle","bayou","bayts","bazar","bazoo","beach","waltz","walty","wally","walls","beads","beady","beaks","beaky","beams","beamy","beano","beans","beany","beard","beare","bears","beast","beath","walla","beats","beaty","mulsh","walks","mulse","beaus","beaut","mulls","walis","beaux","wales","bebop","becap","waler","waled","walds","becke","mulla","waldo","becks","mulga","muley","wakfs","wakes","waker","mules","muled","mulct","mulch","waken","bedad","mujik","muist","muirs","waked","muils","muids","muhly","wakas","bedel","muggy","bedes","muggs","bedew","waive","waits","bedim","mugga","mufti","muffs","waite","mudra","outre","mudir","waist","bedye","beech","beedi","mudge","wairs","beefs","beefy","muddy","beeps","beers","beery","ameer","wains","wails","beets","befit","about","waift","waifs","mucus","befog","mucro","waide","above","wahoo","wagyu","begad","began","begar","begat","begem","mucor","beget","outro","mucky","begin","mucks","wagon","begot","mucin","mucid","mucic","mucho","begum","begun","mpret","wagga","wages","mozos","mozes","mozed","moyls","beige","beigy","being","moyle","wager","moyas","moxie","waged","moxas","bekah","mowra","wafts","mower","mowed","belah","belar","waffs","mowas","belay","belch","movie","moves","mover","belee","moved","belga","belie","wafer","mouth","belle","wadts","mousy","wadis","wades","moust","bells","wader","waded","belly","waddy","wadds","belon","below","belts","bemad","bemas","mouse","wacky","mourn","bemix","moups","wacks","wacko","bemud","mount","wacke","ameba","mound","bench","moult","mouls","bends","mould","bendy","moues","waacs","vying","vutty","abram","mouch","vulva","motza","motus","benes","benet","vulns","benga","vulgo","motty","motts","motto","benis","benne","benni","benny","motte","bento","bents","benty","vughy","vughs","vuggy","vuggs","vrows","vrouw","vrous","motor","vroom","vrils","vraic","vozhd","bepat","motis","voxel","motif","mothy","vower","moths","beray","motey","beres","beret","motet","motes","moten","motel","vowel","moted","mosts","vowed","bergs","moste","mossy","mosso","berko","berks","berme","berms","berob","berry","mosks","voulu","berth","beryl","adyta","vouge","besat","besaw","mosey","moses","mosed","vouch","besee","adzed","votes","voter","beses","beset","morts","voted","besit","adzes","abray","morse","morro","besom","morra","besot","vomit","besti","vomer","morph","volve","volva","moron","morns","morne","bests","moria","betas","volts","beted","betel","betes","volti","mores","beths","volte","betid","morel","beton","ouzel","volta","ouzos","betta","ovals","betty","volks","moray","morat","bevel","moras","bever","bevor","bevue","bevvy","ovary","ovate","bewet","bewig","moral","volet","voles","morae","voled","aecia","mopus","mopsy","moppy","bezel","bezes","bezil","bhais","bhaji","bhang","bhels","volar","bhoot","bhuna","bhuts","biach","biali","bialy","ovels","volae","mopey","mopes","bibbs","moper","bible","moped","voips","voile","voila","voids","voice","moove","moots","vogue","vogie","voema","vodun","vodou","vodka","voddy","voces","moose","biccy","moory","bicep","moors","bices","ovens","moops","vocal","moony","vocab","voars","moons","vlogs","biddy","bided","bider","bides","bidet","vlies","vleis","bidis","bidon","bield","moong","biers","vizor","biffo","biffs","biffy","bifid","mooly","mools","vizir","bigae","mooli","moola","biggs","biggy","bigha","mooks","vixen","aedes","bight","bigly","mooed","moody","bigos","bigot","moods","bijou","mooch","biked","biker","bikes","moobs","bikie","bilbo","bilby","monty","biled","biles","bilge","bilgy","vivid","vives","month","viver","vivda","vivat","ambry","bilks","vivas","monte","bills","billy","vitta","bimah","bimas","bimbo","monos","binal","bindi","binds","biner","bines","binge","bingo","bings","bingy","binit","binks","bints","vitex","vitas","overs","monks","vital","vitae","visto","vista","visor","vison","visne","visit","monie","mongs","visie","vises","vised","mongo","biogs","visas","money","virus","biome","moner","mondo","virtu","monde","biont","virls","monas","monal","monad","virid","momus","mommy","virge","virga","vires","vireo","momma","biota","vired","momes","overt","viral","aegis","molts","molto","molly","viper","viols","biped","molls","bipod","viold","molla","viola","vinyl","vints","moles","birch","moldy","molds","molas","molar","molal","birds","mokos","abrim","mokis","vinos","abrin","mokes","mojos","ambos","birks","birle","birls","biros","moits","birrs","birse","birsy","birth","moist","vinic","moire","vinew","moira","moils","vines","viner","bises","mohur","vined","mohua","bisks","mohrs","mohel","bisom","bison","vinca","vinas","vinal","abris","vimen","vills","bitch","mogul","moggy","villi","biter","bites","mofos","bitos","bitou","bitsy","bitte","moers","aeons","modus","villa","bitts","bitty","modii","viler","modge","vilde","bivia","modes","bivvy","ovine","bizes","bizzo","bizzy","blabs","black","ovist","vigor","ovoid","vigil","vigia","ovoli","vigas","vifda","viewy","views","ovolo","moder","modem","viers","model","video","modal","amble","blade","blads","blady","blaer","blaes","blaff","mocks","blags","blahs","blain","blame","blams","mochy","mochs","bland","mocha","vichy","vices","blank","ovule","viced","blare","blart","moble","blase","blash","adman","owche","blast","vicar","mobie","mobey","mobes","mobby","blate","vibey","blats","blatt","vibex","moats","blaud","owing","vibes","blawn","moans","blaws","blays","blaze","owled","owler","bleak","owlet","blear","bleat","mneme","viand","blebs","mizzy","bleed","bleep","blees","vials","blend","mizen","blent","vezir","aerie","blert","mixup","bless","mixte","blest","vexil","vexes","vexer","owned","vexed","blets","owner","bleys","blimp","mixes","blimy","mixer","blind","mixen","mixed","bling","mitts","blini","blink","blins","bliny","blips","bliss","mitre","owres","blist","owrie","blite","vetch","owsen","blits","blitz","mitis","blive","bloat","vests","oxbow","blobs","block","oxers","oxeye","mites","miter","blocs","mitch","vesta","blogs","bloke","blond","blood","vespa","oxide","verve","misty","vertu","verts","mists","oxids","blook","bloom","oxies","oxime","oxims","bloop","oxlip","blore","oxter","blots","verst","verso","blown","blows","blowy","ambit","blubs","blude","missy","bludy","oyers","ozeki","blued","verse","ozone","verry","ozzie","bluer","blues","paals","paans","verra","bluet","bluey","bluff","pacas","paced","bluid","blume","blunk","pacer","blunt","blurb","paces","blurs","blurt","blush","pacey","missa","pacha","blype","boabs","boaks","board","boars","boart","boast","boats","packs","bobac","bobak","bobas","pacos","pacta","bobby","pacts","bobol","bocca","bocce","bocci","boche","bocks","boded","paddy","bodes","bodge","bodhi","padis","padle","bodle","verge","padma","padre","padri","boeps","boets","boeuf","boffo","boffs","bogan","misos","bogey","paean","paedo","paeon","boggy","bogie","bogle","bogus","bohea","pagan","verbs","bohos","paged","pager","boils","boing","boink","pages","boite","boked","bokeh","bokes","bokos","bolar","bolas","bolds","boles","pagle","bolix","pagod","pagri","bolls","bolos","bolts","bolus","bomas","paiks","venus","pails","bombe","venue","bombo","pains","paint","bombs","vents","paire","bonce","amber","pairs","bonds","paisa","boned","boner","bones","boney","paise","bongo","bongs","bonie","bonks","bonne","pakka","bonny","bonus","bonza","bonze","booai","booay","misgo","boobs","booby","boody","booed","boofy","boogy","palas","boohs","venom","palay","venin","palea","books","paled","mises","booky","bools","booms","paler","boomy","pales","venge","veney","boong","miser","palet","boons","boord","boors","boose","boost","booth","palki","boots","booty","vends","booze","palla","boozy","misdo","borak","boral","boras","borax","borde","bords","bored","boree","borel","borer","bores","borgo","boric","amban","borks","palls","borms","borna","borne","pally","boron","borts","borty","bortz","bosie","palms","bosks","bosky","bosom","palmy","boson","bossy","palpi","bosun","palps","palsy","venal","venae","botas","botch","pampa","botel","botes","bothy","botte","panax","velum","pance","misch","panda","vells","botts","botty","bouge","bough","veles","bouks","veldt","pands","boule","velds","boult","pandy","paned","bound","panel","velar","bouns","panes","veiny","panga","veins","bourd","bourg","pangs","veily","panic","bourn","bouse","veils","panim","bousy","bouts","bovid","bowat","panko","vehme","panne","vegos","vegie","bowed","bowel","bower","bowes","bowet","bowie","bowls","bowne","bowrs","bowse","pansy","boxed","boxen","boxer","boxes","boxty","amaze","boyar","mirza","boyau","mirvs","boyed","boyfs","amaut","boygs","veges","boyla","boyos","boysy","bozos","mirth","braai","panto","vegas","miros","mirly","brace","mirky","mirks","brach","vegan","veery","veers","veeps","veena","mirin","vealy","veals","veale","vawte","brack","mirex","mires","mired","bract","brads","pants","vauts","vaute","braes","brags","vaunt","braid","brail","panty","brain","minus","minty","mints","vault","vauch","vatus","vatic","paoli","brake","paolo","minos","braks","braky","brame","minor","minny","vasty","vasts","brand","minks","brane","minke","brank","papal","brans","brant","papas","papaw","brash","paper","vases","brass","minis","vasal","brast","papes","minim","brats","varve","varus","brava","brave","bravi","bravo","brawl","brawn","braws","braxy","brays","braza","braze","pappi","mingy","mings","bread","varna","varix","minge","break","pappy","mines","bream","miner","varia","vares","varec","mined","vardy","varas","varan","minds","mincy","brede","breds","mince","minas","vapor","breed","breem","minar","minae","breer","parae","brees","mimsy","breid","breis","breme","vapid","brens","brent","brere","brers","vants","mimic","breve","mimes","mimer","mimeo","mimed","brews","miltz","milty","milts","breys","briar","bribe","brick","milpa","milos","milor","bride","mills","vangs","vanes","vaned","brief","brier","bries","vanda","paras","mille","vampy","vamps","milky","brigs","briki","briks","brill","milks","milko","brims","brine","bring","parch","brink","milia","milfs","brins","briny","brios","miles","miler","brise","brisk","milds","briss","valve","brith","brits","britt","milch","brize","broad","value","valse","mikra","mikes","miked","valor","mihis","mihas","broch","brock","amate","brods","pardi","brogh","brogs","might","miggs","mifty","broil","miffy","miffs","broke","brome","mieve","valis","miens","bromo","valid","pards","bronc","pardy","midst","valet","vales","pared","vakil","brond","vakas","vairy","vairs","brood","vaire","midis","brook","midgy","brool","broom","vails","absey","broos","brose","brosy","broth","midge","vagus","middy","pareo","parer","vague","brown","pares","brows","pareu","parev","brugh","bruin","bruit","brule","parge","brume","brung","pargo","brunt","brush","brusk","paris","vagal","brust","amass","vades","vaded","parka","brute","bruts","parki","buats","buaze","vacua","bubal","bubas","bubba","bubby","parks","parky","bubus","parle","buchu","parly","parol","bucko","bucks","bucku","budas","parps","parra","buddy","budge","uvula","budis","budos","buffa","uveas","uveal","absit","buffe","parrs","buffi","parry","buffo","parse","buffs","buffy","bufos","bufty","buggy","bugle","buhls","buhrs","buiks","build","built","utter","buist","bukes","parti","bulbs","bulge","bulgy","bulks","bulky","parts","bulla","party","parve","parvo","paseo","utile","pases","pasha","uteri","pashm","bulls","paspy","usury","usurp","bully","passe","bulse","usure","usual","bumbo","pasta","bumfs","paste","usque","bumph","usnea","using","bumps","bumpy","usher","bunas","bunce","bunch","users","bunco","bunde","bundh","pasts","pasty","bunds","bundt","bundu","bundy","patch","bungs","bungy","bunia","bunje","bunjy","pated","bunko","bunks","bunns","bunny","micro","micra","micos","micky","micks","bunts","bunty","bunya","buoys","buppy","usage","urvas","buran","buras","burbs","micht","burds","urubu","miche","urson","ursid","ursae","urped","buret","burgh","micas","paten","miaul","burgs","burin","burka","burke","miasm","burks","miaow","miaou","burls","burly","mhorr","pater","mezzo","mezze","burns","burnt","buroo","burps","burqa","urned","burro","mezes","urnal","burrs","urman","burry","bursa","urite","burse","burst","meynt","mewls","amain","busby","bused","buses","amahs","urine","mewed","meves","meved","pates","meuse","urial","urges","urger","paths","bushy","urged","patin","busks","busky","bussu","busti","metro","busts","busty","patio","patka","patly","metre","butch","urent","urena","buteo","butes","butle","ureic","butte","uredo","metol","ureas","ureal","metis","urdee","metif","urbia","metic","urban","urate","urase","urari","urare","uraos","butts","butty","patsy","patte","butut","butyl","meths","buxom","buyer","patty","patus","pauas","buzzy","bwana","bwazi","alway","byded","bydes","byked","bykes","bylaw","metho","adits","byres","pauls","byrls","byssi","bytes","byway","caaed","cabal","pause","urali","metes","cabas","meter","uraei","cabby","caber","pavan","cabin","cable","paved","cabob","paven","caboc","paver","paves","pavid","pavin","cabre","pavis","cacao","cacas","meted","cache","pawas","pawaw","pawed","pawer","cacks","cacky","pawks","pawky","pawls","uptie","cacti","pawns","upter","paxes","caddy","cadee","cades","cadet","cadge","payed","cadgy","alure","cadie","cadis","payee","cadre","payer","caeca","uptak","caese","payor","cafes","paysd","caffs","alums","caged","peace","cager","cages","cagey","peach","cagot","cahow","caids","cains","caird","cairn","adios","peage","peags","cajon","cajun","caked","cakes","cakey","peaks","peaky","peals","adieu","peans","peare","pearl","pears","peart","metal","pease","peats","peaty","upsey","upset","upsee","peavy","peaze","pebas","pecan","uprun","pechs","pecke","calfs","pecks","pecky","mesto","calid","calif","messy","calix","calks","calla","upran","upper","upped","pedal","calls","meson","calms","calmy","uplit","pedes","calos","mesne","calpa","calps","mesic","meshy","upled","calve","uplay","meses","pedro","calyx","mesel","caman","camas","peece","upjet","mesas","mesal","camel","merse","peeks","merry","cameo","cames","camis","peels","camos","peens","peeoy","peepe","merls","merle","merks","campi","peeps","campo","merit","camps","campy","meris","camus","meril","canal","merge","peers","meres","merer","upend","peery","updry","updos","merel","mered","merde","mercy","peeve","peggy","peghs","candy","upbye","mercs","caned","caneh","caner","canes","peins","cangs","canid","peise","peize","upbow","canna","pekan","merch","pekes","pekin","pekoe","unzip","pelas","peles","canns","pelfs","canny","canoe","canon","meows","meous","unwon","canso","canst","menus","mento","unwit","pells","pelma","menta","pelon","canto","mensh","unwet","mense","cants","canty","mensa","pelta","unwed","pelts","capas","caped","mengs","caper","menge","menes","mened","capes","mends","capex","caphs","penal","menad","memos","pence","capiz","caple","pends","capon","memes","pendu","capos","capot","melty","pened","melts","penes","melon","pengo","penie","penis","penks","mells","penna","capul","caput","penne","penni","untin","melik","carap","melic","carat","until","untie","melee","melds","melba","melas","penny","carbo","untax","mekka","meith","meiny","meint","meins","carbs","carby","pents","cardi","peons","peony","pepla","pepos","meffs","cards","cardy","cared","meets","meers","carer","cares","caret","peppy","unsod","carex","meeds","cargo","medle","carks","carle","carls","medii","perai","perce","carns","carny","carob","carol","medic","perch","carom","caron","perdu","carpi","media","perdy","perea","carps","alula","unsex","medal","unsew","mecks","unset","peres","carrs","carry","carse","carta","mecca","carte","mebos","meaty","meats","meath","carts","unsay","carve","mease","carvy","meare","meany","meant","means","casas","casco","meane","mealy","cased","meals","cases","meads","mbira","mazut","casks","casky","mazey","mazes","mazer","mazed","mayst","mayos","caste","mayor","mayed","casts","maybe","mayas","unrip","mayan","casus","maxis","unrig","unrid","peril","maxim","maxes","maxed","mawrs","unred","mawky","mawks","mawed","mavis","mavin","mavie","maven","mauve","mauts","mauri","maund","catch","mauls","mauds","mauby","matzo","matza","peris","matts","unpin","cater","matte","cates","unpen","unpeg","unpay","perks","perky","perms","matlo","matin","catty","maths","cauda","perns","matey","mates","cauks","cauld","adhan","perps","caulk","cauls","altos","caums","perry","caups","causa","perse","mater","cause","mated","match","unmix","matai","masus","cavas","masty","perst","caved","cavel","masts","caver","caves","cavie","cavil","perts","cawed","cawks","unmew","caxon","unmet","cease","ceaze","perve","cebid","cecal","cecum","cedar","ceded","ceder","cedes","massy","cedis","ceiba","ceili","pervs","pervy","ceils","celeb","masse","cella","unman","celli","massa","cello","cells","pesky","celom","pesos","celts","mason","masks","cense","mashy","unlit","mases","unlid","maser","mased","pesto","unlet","unled","pests","pesty","unlay","petal","cento","masas","unlaw","marvy","petar","unkid","unket","marts","unked","peter","cents","centu","unjam","ceorl","cepes","unity","units","petit","unite","petre","petri","marsh","marse","marry","cerci","marri","union","cered","ceres","cerge","ceria","ceric","cerne","petti","unify","ceros","maror","maron","certs","certy","marms","petto","petty","marly","pewee","marls","cesse","pewit","cesta","cesti","altho","marle","cetes","cetyl","cezve","marks","chace","chack","chaco","chado","chads","peyse","chafe","chaff","chaft","chain","marka","unhip","chair","phage","chais","marid","maria","margs","phang","phare","chalk","unhat","marge","pharm","aeros","mares","chals","mardy","marcs","phase","march","champ","ungum","chams","chana","pheer","chang","maras","ungot","chank","marah","ungod","marae","maqui","chant","unget","chaos","maple","mapau","chape","phene","manus","manul","chaps","ungag","chapt","manty","chara","manto","pheon","chard","chare","manta","phese","phial","manse","unfix","chark","unfit","manos","manor","charm","manna","manly","charr","chars","chart","manky","unfed","chary","chase","chasm","manis","phlox","chats","phoca","uneth","manic","mania","adept","mangy","mangs","phone","chave","chavs","mango","chawk","chaws","chaya","chays","cheap","cheat","mange","check","manga","manet","manes","undug","maneh","undue","maned","cheek","phono","cheep","cheer","phons","phony","mandi","undid","chefs","manat","cheka","manas","chela","chelp","photo","chemo","mammy","chere","phots","phpht","chert","mamma","mamie","chess","mamey","chest","mamee","mambo","cheth","mamba","mamas","malwa","chevy","malva","malty","malts","chews","chewy","chiao","under","chias","chibs","chica","malmy","malms","chich","chick","malls","undee","phuts","chico","chics","chide","chief","chiel","phyla","chiks","undam","child","malis","uncut","uncus","phyle","malik","chile","chili","malic","chill","males","chimb","chime","uncoy","chimo","chimp","china","uncos","malax","chine","chink","malas","piani","chino","malar","chins","piano","pians","malam","chips","chirk","pibal","chirl","chirm","chiro","pical","picas","chirp","makos","makis","chirr","chirt","chiru","makes","piccy","maker","makar","chits","chive","chivs","major","chivy","chizz","uncle","maize","maist","maise","uncia","mairs","maire","mains","unces","picks","picky","maims","uncap","mails","maill","chock","choco","maile","chocs","chode","chogs","maiks","maiko","choir","maids","choke","picot","choko","choky","chola","unbox","mahwa","mahua","choli","cholo","mahoe","chomp","picra","magus","magot","choof","chook","choom","choon","picul","chops","unbid","chord","chore","piece","unbed","piend","magma","unbar","piers","piert","pieta","chose","chota","chott","unban","chout","choux","magic","chowk","chows","maggs","unbag","piets","piety","piezo","unaus","mages","unary","unarm","unapt","mafic","mafia","maerl","unais","umras","umrah","umpty","umpie","umped","ummed","ummas","ummah","umiaq","umiak","umiac","madre","umbre","umbra","umbos","umble","madly","umber","madid","madge","chubs","chuck","umbel","piggy","umami","ulzie","chufa","chuff","ulyie","pight","ulvas","chugs","madam","chump","chums","chunk","pigmy","ultra","churl","churn","churr","chuse","chute","chyle","piing","chyme","ulpan","pikas","ulnas","ulnar","ulnae","chynd","pikau","piked","ulnad","cibol","ulmin","piker","pikes","pikey","ulema","pikis","pikul","pilaf","ulcer","ulans","pilao","pilar","ulama","pilau","pilaw","cided","cider","pilch","cides","ciels","cigar","ukase","ciggy","cilia","pilea","cills","cimar","piled","cimex","pilei","cinch","piler","uhuru","uhlan","piles","ugged","cinct","ugali","macro","udons","udder","udals","macon","macle","macks","cines","machs","macho","cions","pilis","tzars","cippi","circa","machi","circs","mache","tythe","tyros","tyres","tyred","maces","tyran","typto","typps","typos","macer","maced","typic","pills","typey","macaw","types","typed","pilot","typal","tynes","tyned","tynde","tymps","pilow","tyler","tykes","tyiyn","tying","tyers","tyees","twyer","mabes","twoer","aesir","maars","twixt","maare","maaed","twits","twite","cires","lytta","cirls","lytic","cirri","lythe","cisco","lytes","lyted","lyssa","pilum","lysol","cissy","pilus","pimas","cists","cital","lysis","twist","cited","citer","cites","lysin","lyses","twirp","lysed","twirl","alter","twire","twiny","pimps","twins","lyric","lyres","pinas","cives","civet","civic","civie","civil","lynes","twink","lynch","civvy","clach","pinch","clack","clade","twine","pined","twilt","twill","clads","claes","pines","clags","claim","lymph","twigs","lymes","piney","lying","lycra","clame","twier","clamp","lycee","lycea","clams","twice","clang","lyase","lyart","lyard","twerp","clank","lyams","lweis","clans","pingo","pings","tweet","luxes","claps","clapt","tweer","luvvy","tween","tweel","claro","clart","clary","clash","clasp","class","lutes","luter","tweed","tweak","tways","twats","luted","lutea","twank","lusus","lusty","lusts","clast","altar","clats","pinko","pinks","twang","twals","claut","pinky","clave","pinna","twain","clavi","twaes","tuyer","lusks","tuxes","claws","lushy","clays","clean","tutus","luser","tutty","lurve","lurry","tutti","clear","lurks","cleat","lurid","lurgy","lurgi","cleck","lurex","cleek","lures","cleep","clefs","cleft","lurer","clegs","lured","cleik","clems","tutor","lurch","clepe","clept","lupus","tutee","lupin","clerk","lunts","cleve","lunks","clews","click","tusky","clied","tusks","clies","cliff","clift","lungs","tushy","lungi","climb","lunge","clime","lunet","lunes","cline","cling","turps","lunch","clink","turns","lunas","lunar","lumpy","clint","pinny","lumps","clipe","clips","clipt","pinon","turms","lummy","lumme","turme","pinot","clits","turks","cloak","cloam","pinta","clock","lumen","clods","cloff","pinto","clogs","pints","pinup","turfy","cloke","clomb","clomp","turfs","clone","clonk","lumas","clons","lulus","cloop","cloot","lulls","clops","close","clote","cloth","turds","clots","cloud","luges","turbo","luger","luged","clour","clous","clout","luffs","clove","luffa","clown","clows","cloye","afald","ludos","cloys","afara","cloze","ludic","ludes","afars","pions","piony","pious","lucre","lucky","lucks","tuque","clubs","cluck","pioye","pioys","clued","clues","clump","adeem","clung","clunk","pipal","pipas","clype","piped","lucid","cnida","tuple","tupik","tupek","coach","tunny","luces","afear","coact","piper","pipes","lubra","tunic","lubes","lubed","tungs","pipet","tunes","tuner","tuned","luaus","luach","tunds","coala","lozen","tunas","loyal","loxes","loxed","lowts","coals","coaly","coapt","tumpy","tumps","lowse","coarb","lowry","lowps","lowns","coast","tumor","tummy","lowne","tumid","coate","coati","lownd","lowly","coats","lowes","pipis","pipit","cobbs","cobby","cobia","coble","cobra","tulpa","lower","cobza","tulle","lowed","tulip","tules","tuktu","cocas","cocci","tuism","tuina","cocco","tugra","lowan","lovey","pippy","loves","tufty","tufts","lover","pipul","pique","tuffs","tuffe","tufas","loved","lovat","tucks","cocks","louts","pirai","cocky","cocoa","lousy","cocos","louse","loury","lours","tubes","codas","loure","loups","codec","tuber","coded","loupe","coden","louns","tubed","coder","tubby","codes","codex","tubas","tubar","tubal","lound","louma","tubae","abuna","tuath","louis","louie","tuart","tuans","codon","lough","loued","coeds","tsuba","tsked","lotus","lotto","tsars","lotte","lotos","lotic","lotes","tsadi","lotas","tsade","lotah","pirls","lossy","tryst","pirns","loses","loser","tryps","tryma","losen","tryke","losel","tryer","losed","pirog","lorry","truth","loris","trust","coffs","loric","truss","lores","lorel","lordy","lords","cogie","trunk","loran","loral","loppy","trump","truly","cogon","cogue","cohab","trull","trugs","lopes","trugo","cohen","abune","loper","loped","pisco","pises","trues","truer","loots","cohoe","cohog","trued","cohos","coifs","coign","coils","loose","loord","loopy","loops","coins","loony","loons","truck","truce","coirs","looms","coits","coked","looks","cokes","colas","colby","troys","trows","looie","loofs","colds","coled","trove","loofa","looey","looed","coles","looby","pisky","pisos","coley","colic","longs","trout","colin","pissy","piste","longe","longa","trots","troth","loner","lomes","trope","abuse","trooz","lomed","lomas","lolog","troop","lolly","trons","tronk","trone","tronc","trona","lolls","tromp","pitas","lokes","troll","troke","trois","loirs","trogs","loipe","loins","pitch","loids","trods","trode","trock","lohan","colls","colly","logos","logon","colog","logoi","colon","troat","troak","troad","piths","color","pithy","login","logie","trite","logic","logia","loggy","trist","loges","piton","tripy","logan","pitta","lofty","lofts","trips","colts","loess","lodge","colza","comae","lodes","comal","loden","comas","locus","locum","combe","combi","locos","combo","combs","tripe","piums","trios","pivot","comby","trior","locks","comer","comes","triol","comet","trins","pixel","comfy","comic","trine","comix","comma","trims","lochs","pixes","pixie","pized","pizes","trill","pizza","trild","trike","trigs","local","lobus","trigo","plaas","lobos","triff","tries","trier","tried","lobes","tride","lobed","lobby","commo","lobar","loave","trick","loath","loast","comms","place","loans","trice","loamy","loams","tribe","loafs","loads","loach","llano","trial","llama","commy","triad","triac","livre","treys","livor","trews","trets","trest","tress","livid","lives","liver","liven","trend","plack","lived","plage","trema","treks","treif","trefa","abuts","trees","treen","plaid","treed","plain","treck","litre","treat","liths","plait","tread","trays","plane","trawl","plank","plans","plant","trave","compo","tratt","trats","litho","trass","trash","trapt","traps","lithe","lites","plaps","plash","plasm","trape","trant","plast","liter","lited","comps","compt","litas","litai","lists","trans","tranq","trank","trams","lisps","lisle","lisks","tramp","lirot","comte","comus","lirks","liras","plate","trait","plats","train","lippy","trail","traik","tragi","platy","trads","lipos","playa","trade","lipin","tract","lipid","lipas","lions","track","conch","trace","linux","trabs","linum","linty","tozie","lints","tozes","tozed","abuzz","toyos","toyon","toyer","toyed","toxin","toxic","towzy","towze","towts","towsy","linos","towse","abyes","linny","linns","towny","towns","linky","links","towie","tower","towel","condo","towed","linin","lingy","plays","abysm","lings","touzy","touze","touts","lingo","tousy","coned","linga","cones","coney","touse","tours","liney","lines","liner","linen","touns","touks","abyss","lined","plaza","tough","plead","pleas","touch","totty","lindy","linds","totes","toter","linch","totem","toted","linac","total","limps","tossy","toshy","toses","tosed","tosas","limpa","torus","affix","limos","limns","pleat","torts","confs","torte","torta","conga","limma","conge","torso","torsk","torsi","torse","plebe","torrs","limit","plebs","torot","toros","congo","limey","limes","limen","torii","toric","limed","tores","limby","limbs","torcs","limbo","limbi","conia","conic","torch","toras","conin","limba","toran","limax","torah","limas","toque","liman","toppy","lilts","lilos","topos","lills","topoi","lilac","conks","conky","alpha","likin","likes","liker","topis","conne","topic","tophs","tophi","tophe","topes","aahed","toper","liken","topek","topee","toped","plena","liked","topaz","toots","conns","tooth","toons","acais","tooms","tools","ligne","tonus","pleon","tonne","plesh","tonks","tonka","tonic","tongs","tonga","toney","tones","toner","toned","tondo","light","tondi","tonal","ligge","tomos","liger","tommy","tomia","tomes","tombs","ligan","lifts","toman","tolyl","tolus","plews","lifes","tolts","lifer","tolly","tolls","lieve","plica","toles","toled","lieus","liers","tolas","tolar","tolan","tokos","liens","tokes","toker","token","toked","tokay","liege","toits","liefs","toise","toing","toils","plied","plier","lidos","plies","toile","togue","lidar","toges","toged","togas","togae","licks","tofus","tofts","toffy","toffs","acari","licit","licht","toeas","toddy","lichi","todde","today","tocos","tocky","tocks","plims","pling","conte","plink","toaze","toast","libri","toady","toads","libra","tizzy","tiyin","titup","ploat","titty","plods","plong","titre","title","plonk","titis","tithe","titer","plook","titch","plops","conto","titan","liber","plots","tirrs","libel","tiros","tirls","tires","tired","tipsy","tippy","liart","liars","liard","tipis","liang","liane","liana","tinty","tints","lezzy","lezza","lezes","tinny","lexis","plotz","tinks","plouk","tings","tinge","lexes","tines","tined","tinea","tinds","tinct","tinas","lewis","timps","conus","timon","plows","timid","levis","times","timer","levin","ploys","timed","pluck","timbo","leves","tilts","tilth","lever","tilly","tills","level","levee","tiles","tiler","plues","pluff","tiled","tilde","tilak","tikka","tikis","tikes","tikas","plugs","plumb","tigon","convo","leugh","leuds","tight","tiges","plume","tiger","accas","tifts","tiffs","cooch","cooed","cooee","cooer","cooey","coofs","leuco","leuch","cooks","plump","cooky","letup","tiers","cools","cooly","coomb","cooms","coomy","coons","plums","coops","coopt","lethe","plumy","coost","coots","cooze","copal","letch","lests","tides","copay","coped","copen","coper","copes","plunk","tided","tiddy","leses","lesbo","lerps","tidal","ticky","leres","lered","coppy","copra","ticks","addle","tichy","tices","ticed","ticca","tical","tibia","tiars","tiara","tians","lepta","copse","plush","copsy","thymy","lepra","thymi","thyme","lepid","leper","plyer","leone","alowe","thuya","coral","thurl","lento","coram","corbe","thunk","poach","corby","aloud","lenti","thump","lense","lenos","lenis","cords","thumb","poaka","cored","poake","thuja","thugs","poboy","lengs","thuds","corer","cores","corey","lenes","corgi","coria","lends","lemur","corks","thrum","lemon","corky","corms","aloos","lemma","throw","lemes","lemel","lemed","leman","pocks","corni","pocky","throe","leish","leirs","podal","corno","throb","corns","cornu","lehua","lehrs","corny","thrip","thrid","threw","poddy","corps","podex","three","podge","podgy","podia","thraw","legit","poems","thrae","thowl","poeps","thous","those","thorp","poesy","thoro","leggy","thorn","thong","tholi","thole","thoft","legge","corse","leges","leger","corso","poets","pogey","pogge","legal","thirl","lefty","third","lefts","aloof","cosec","cosed","coses","coset","cosey","lefte","cosie","leeze","leets","thiol","thins","leese","leery","leers","pogos","leeps","think","leeks","thing","thine","thill","thilk","thigs","thigh","leech","leear","ledum","thief","ledgy","ledge","costa","coste","thick","poilu","costs","poind","cotan","along","coted","cotes","coths","leccy","leben","thewy","thews","leaze","leavy","thete","cotta","point","leave","leats","theta","thesp","these","cotts","addio","couch","least","coude","cough","could","leash","poise","lease","leary","lears","therm","count","there","learn","theow","leare","leapt","leaps","leany","leant","leans","thens","theme","thema","thelf","their","thein","theic","thegn","theft","thees","leams","theek","theed","theca","thebe","leaky","thawy","thaws","leaks","thars","tharm","thans","thank","leafy","thang","thane","leafs","thana","pokal","thali","thale","thaim","thagi","poked","thack","texts","leady","leads","texes","texas","tewit","tewel","tewed","teugh","teuch","poker","pokes","tetri","pokey","tetra","teths","pokie","tetes","leach","lazzo","lazzi","testy","tests","lazos","teste","lazes","testa","lazed","tesla","lazar","terts","layup","terse","terry","layin","layer","layed","terra","laxly","terns","alone","coupe","terne","coups","laxes","laxer","polar","courb","terms","courd","coure","lawny","cours","lawns","court","lawks","lawin","terga","terfs","terfe","teres","terek","couta","couth","lawer","lawed","lavvy","aloin","coved","lavra","coven","terce","cover","poled","laves","laver","laved","coves","covet","lavas","teras","covey","covin","cowal","cowan","poler","terai","poles","poley","cowed","cower","laura","laund","polio","aloha","cowks","polis","cowls","tepoy","cowps","cowry","laugh","laufs","lauds","aloft","coxae","coxal","tepid","coxed","coxes","coxib","aloes","coyed","coyer","lauch","coyly","coypu","aloed","lauan","alods","cozed","cozen","cozes","cozey","cozie","craal","latte","polje","polka","crabs","tepee","crack","tepas","tepal","latke","polks","craft","tenue","tenty","tents","crags","craic","craig","lathy","crake","laths","crame","tenth","lathi","cramp","crams","lathe","latex","crane","crank","polls","tense","later","laten","crans","crape","lated","polly","latch","craps","latah","lasts","tenor","crapy","crare","crash","tenon","crass","tenny","lassu","tenno","crate","tenne","lasso","lassi","crave","tenia","tenge","crawl","tenet","craws","tenes","lases","crays","craze","laser","lased","crazy","creak","cream","polos","polts","larva","tendu","tends","larum","larns","larky","larks","tench","laris","credo","creds","creed","creek","creel","largo","creep","crees","large","lares","laree","temse","lardy","lards","creme","crems","crena","tempt","temps","tempo","larch","tempi","crepe","lapse","creps","crept","temes","crepy","temed","cress","lapje","crest","lapis","telos","lapin","teloi","crewe","lapel","telly","crews","crias","almug","cribs","lants","crick","polyp","cried","crier","cries","crime","tells","lanky","lanks","telic","telia","crimp","crims","crine","telex","polys","crios","cripe","crise","crisp","lanes","lands","teles","pombe","crith","pomes","crits","croak","almud","lande","pommy","croci","pomos","crock","afire","crocs","croft","crogs","lanch","cromb","crome","crone","cronk","crony","crook","lance","lanas","crool","lanai","croon","aflaj","lamps","crops","pomps","telco","crore","cross","telae","ponce","teins","teind","teils","teiid","tehrs","tegus","tegua","teggs","lammy","teffs","poncy","teeth","teers","teeny","crost","teens","ponds","pones","poney","croup","lamia","crout","teene","lames","crowd","teend","lamer","ponga","teems","crown","crows","pongo","croze","pongs","pongy","teels","adder","ponks","teddy","cruck","crude","lamed","cruds","crudy","cruel","lamby","crues","cruet","cruft","lambs","crumb","crump","lamas","afoot","lalls","tecta","crunk","afore","laldy","cruor","crura","cruse","crush","techy","techs","laksa","crust","lakin","crusy","lakhs","cruve","lakes","crwth","laker","laked","laity","teaze","laith","teats","lairy","lairs","tease","crypt","teary","tears","laird","laiks","teams","teals","laika","teaks","laigh","laids","teaed","teads","teade","teach","afoul","laics","tazze","tazza","tayra","taxus","taxor","laich","taxon","taxol","taxis","ctene","lahar","cubby","cubeb","cubed","cuber","cubes","cubic","ponts","cubit","ponty","taxes","taxer","taxed","tawts","cuddy","lager","tawse","lagan","cuffo","cuffs","afrit","cuifs","cuing","tawny","cuish","ponzu","pooch","cuits","laevo","cukes","culch","culet","culex","laers","culls","cully","tawie","poods","culms","culpa","pooed","culti","tawer","tawed","tawas","tawai","cults","ladle","culty","taver","tavas","poofs","tavah","tauts","lades","lader","cumec","cumin","laden","laded","taupe","poofy","tauon","cundy","afros","cunei","after","taunt","tauld","cunts","cupel","poohs","pooja","cupid","taube","tatus","cuppa","cuppy","pooka","tatty","tatts","pooks","pools","curat","poons","curbs","added","curch","almes","poops","curds","curdy","cured","poori","curer","cures","curet","curfs","curia","tatou","curie","curio","tatie","taths","curli","lacks","poort","tates","tater","curls","curly","tatar","tasty","curns","curny","addax","taste","currs","curry","almeh","curse","cursi","poots","poove","curst","almas","tasse","lacey","lacet","laces","poovy","tasks","adays","lacer","laced","curve","popes","taser","tasar","curvy","cusec","tarty","cushy","cusks","tarts","labra","cusps","cuspy","cusso","labor","labis","cusum","poppa","cutch","cuter","cutes","cutey","cutie","labia","cutin","cutis","label","labda","tarsi","cutto","cutty","cutup","poppy","laari","cuvee","cwtch","kythe","kytes","kyrie","kypes","cyano","tarry","kynds","kynde","tarre","tarps","kyloe","kylix","cyans","kylin","cyber","tarot","taros","tarok","taroc","tarns","kylie","kyles","kydst","kybos","targe","targa","tares","tared","kyats","kyars","tardy","tardo","cycad","popsy","cycas","cycle","kyang","kyaks","kyack","kwela","taras","cyclo","kvell","tapus","kvass","kuzus","kutus","kutis","kutch","kutas","tappa","tapis","kusso","tapir","kurus","kurta","kurre","tapet","kuris","tapes","taper","porae","tapen","poral","taped","porch","cyder","tapas","cylix","almah","cymae","cymar","cymas","kumys","cymes","cymol","cynic","tanto","tanti","kulfi","kulas","kulan","kulak","kukus","adaws","tansy","kukri","kuias","pored","kugel","kufis","porer","tanna","cysts","pores","cytes","kudzu","kudus","tanky","porge","tanks","kudos","tanka","ksars","tanhs","tangy","tangs","cyton","tango","krunk","tangi","porgy","krubi","kroon","czars","daals","dabba","krone","krona","allyl","daces","dacha","dacks","tanga","krill","tanas","krewe","dadah","kreng","dadas","daddy","dados","tamps","kreep","kraut","daffs","daffy","dagga","kranz","krans","daggy","dagos","krang","krait","kraft","krabs","tammy","dahls","kraal","daiko","daily","daine","daint","dairy","daisy","tamis","daker","koura","daled","dales","dalis","dalle","dally","dalts","tamin","tames","tamer","daman","damar","tamed","kotow","kotos","porks","kotch","dames","damme","koses","porky","korus","damns","korun","koros","korma","kores","damps","dampy","dance","korat","koras","korai","dancy","koppa","kopje","dandy","kophs","kopek","koori","kooky","dangs","danio","kooks","danks","danny","porno","porns","dants","porny","konks","daraf","darbs","darcy","dared","tamal","darer","dares","darga","dargs","daric","daris","kondo","konbu","talus","darks","darky","alloy","kombu","kolos","darns","taluk","talpa","darre","kolas","darts","darzi","talon","dashi","kokum","kokra","dashy","talma","koker","kokas","kojis","koine","datal","kohls","kohen","kohas","tally","talls","dated","kogal","dater","dates","kofta","datos","datto","datum","koffs","daube","koels","daubs","dauby","dauds","kobos","dault","daunt","koban","koaps","koans","koala","knuts","knurs","daurs","dauts","daven","knurr","davit","dawah","knurl","dawds","dawed","dawen","dawks","porta","dawns","knubs","dawts","allow","dayan","daych","knows","known","daynt","knowe","knout","dazed","knots","dazer","dazes","knosp","knops","talky","talks","knoll","knock","knobs","knive","knits","knish","deads","tales","taler","deair","knife","talea","talcy","talcs","deals","dealt","knelt","deans","knell","deare","knees","dearn","talas","dears","talar","deary","deash","kneel","talaq","death","kneed","talak","takis","takin","takhi","takes","deave","deaws","deawy","knead","debag","debar","taker","knawe","taken","knave","takas","knaur","knars","tajes","debby","knarl","debel","taits","debes","taish","knaps","taira","debit","knags","taint","tains","knack","klutz","debts","debud","kluge","debug","debur","debus","kloof","debut","debye","klong","decad","ports","decaf","tails","kliks","klieg","decal","klick","porty","klett","posed","poser","poses","taiko","taigs","taiga","tahrs","tahas","tagma","klaps","taggy","klang","kiwis","posey","tafia","taffy","kivas","kitul","kitty","decay","taels","tacts","tacos","tacky","posho","tacks","again","kiths","tacit","tachs","tacho","kithe","kites","kiter","kited","tache","tacet","taces","tacan","posit","tabus","tabun","kists","kissy","tabor","taboo","decko","decks","kisan","kirri","table","tabla","tabid","kirns","tabes","kirks","taber","agama","tabby","kirby","taata","taals","kipps","syver","sythe","kippa","kipes","agami","sysop","kiosk","syrup","kiore","syren","syrah","syphs","kinos","sypes","syped","posse","synth","kinky","kinks","decor","kinin","kings","decos","synod","decoy","synes","syned","synds","decry","kines","kindy","kinds","syncs","dedal","synch","kinda","kinas","deeds","deedy","deely","deems","deens","kimbo","kilty","kilts","deeps","deere","deers","kilps","kilos","deets","deeve","deevs","kilns","kills","defat","symar","kilim","kiley","sylva","kikoi","kikes","kight","sylph","kievs","kieve","defer","kiers","sylis","sykes","syker","deffo","syens","kiefs","syces","sycee","sybow","syboe","sybil","sybbe","posts","swung","swoun","kidge","kidel","swots","sworn","swore","defis","kiddy","kiddo","sword","swopt","swops","kicky","swoop","kicks","swoon","swoln","defog","swobs","potae","agape","kibla","swizz","kibes","swive","swits","kibei","swith","kibbi","swiss","kibbe","kiang","kiaat","swish","khuds","degas","khoum","swirl","swire","khors","swipe","khoja","swink","khets","kheth","swing","swine","kheda","degum","khazi","degus","swims","khaya","khats","agars","khaph","swill","swigs","khans","swift","swies","agast","sweys","swerf","swept","swelt","deice","khaki","khafs","agate","deids","allot","khadi","deify","deign","deils","swell","sweir","deism","deist","deity","keyed","deked","dekes","dekko","potch","sweet","swees","kexes","sweer","delay","kevil","kevel","sweep","poted","deled","sweel","sweed","swede","deles","sweat","delfs","delft","ketol","potes","swear","sweal","sways","ketes","swayl","ketch","ketas","kests","swats","swath","kesar","swash","kerve","delis","swart","swarm","kerry","dells","delly","swarf","sware","sward","keros","delos","kerns","delph","swapt","swaps","delta","delts","kerne","swans","kerma","kerky","kerfs","delve","kerel","kerbs","swank","swang","swamy","agave","deman","potin","swamp","swami","swaly","swale","potoo","swain","swail","agaze","swags","kepis","kents","demes","kente","demic","swage","swads","kenos","swack","swabs","kendo","kench","demit","kenaf","kempy","kempt","demob","kemps","sutta","sutra","sutor","susus","kembs","sushi","suses","kembo","demon","kelty","kelts","kelpy","kelps","surra","kelly","kells","kelim","kelep","surly","demos","keirs","dempt","surgy","kehua","demur","surge","surfy","surfs","kefir","potsy","keeve","keets","denar","keeps","sures","surer","keens","sured","surds","keeno","denay","keema","surat","suras","keels","sural","surah","supra","keeks","denes","denet","keefs","keech","kedgy","denim","denis","kedge","supes","kecks","dense","kebob","kebar","kebab","agene","dents","kbars","kazoo","kazis","kayos","kayle","kayak","kawed","kawau","kawas","kavas","super","deoxy","sunup","kaval","kaury","kauru","kauri","kaugh","katti","katis","sunny","sunns","sunna","sunks","sunis","potto","katas","katal","potts","potty","pouch","agent","kasme","kasha","karzy","pouff","poufs","sumps","karts","sumph","karsy","sumos","pouke","pouks","karst","karri","depot","karos","karoo","karns","summa","sumac","sulus","karma","karks","karat","karas","sulph","sully","depth","sulky","sulks","kaput","kappa","kapok","kaphs","kapas","kaons","poule","poulp","sulfo","derat","kanzu","deray","derby","kants","poult","sulfa","dered","sulci","sukuk","sukhs","sujee","suits","deres","derig","kanji","kangs","suite","kanga","kanes","kaneh","suint","suing","kandy","suids","kanas","suhur","derma","sugos","sughs","kanae","sugar","sugan","kamme","kamis","derms","derns","kamik","agers","kames","deros","derro","derry","derth","dervs","kamas","suety","suets","suers","suent","suede","sudsy","kalpa","sudor","sudds","kalis","kalif","kales","sucre","sucky","sucks","pound","kalam","kakis","kakas","desex","poupe","deshi","agger","kains","poupt","succi","kaing","kaims","aggie","kails","kaiks","kaika","kaifs","kaies","kaids","kaiak","desks","kahal","kagus","kagos","pours","kafir","kadis","kades","kacks","kacha","kabob","kabar","kabab","kaama","desse","juvie","juves","pouts","pouty","jutty","jutes","powan","justs","power","powin","pownd","juror","powns","powny","powre","deter","jurel","jurat","jural","jupon","jupes","junto","junta","junky","junks","poxed","poxes","subha","detox","poynt","junco","jumpy","jumps","poyou","suber","poyse","jumby","jumbo","deuce","jumar","julep","jukus","jukes","juked","devas","jujus","devel","juicy","juice","jugum","subby","devil","pozzy","praam","jugal","judos","subas","subah","prads","devon","devot","judge","judas","jucos","suave","dewan","dewar","dewax","jubes","dewed","jubas","prahu","styte","dexes","dexie","styre","stymy","styme","joyed","dhaks","dhals","jowly","dhobi","jowls","dhole","dholl","dhols","dhoti","dhows","dhuti","stylo","jowed","jowar","prams","prana","styli","joust","style","diact","jours","styes","styed","prang","sturt","prank","sture","praos","prase","stupe","stupa","joule","stunt","jouks","stuns","prate","jougs","joual","jotun","jotty","stunk","stung","stums","jotas","dials","stump","stumm","stulm","stull","jorum","diane","joram","jooks","jonty","stuff","jongs","study","studs","jones","jomos","jomon","jolty","jolts","stude","prats","pratt","jolly","jolls","diary","stuck","stubs","joles","joled","praty","jokol","jokey","strut","jokes","joker","joked","joist","praus","diazo","strum","prawn","joint","joins","dibbs","stroy","diced","strow","dicer","dices","dicey","johns","strop","joeys","dicht","jodel","prays","dicks","dicky","dicot","jocks","jocko","dicta","jobes","jobed","dicts","dicty","jnana","jivey","diddy","jives","jiver","jived","didie","didos","didst","strip","diebs","jisms","jirre","jirga","jirds","strim","diene","jinns","jinni","jinne","aggri","jinks","strig","jingo","diets","jimpy","stria","jimmy","strew","diffs","jilts","strep","jills","jihad","dight","jigot","digit","jiggy","stray","jiffy","jiffs","aggro","straw","jibes","jiber","jibed","aggry","jibbs","dikas","diked","diker","dikes","dikey","jibba","aghas","strap","jiaos","agila","jhala","dildo","jewie","dilli","jewel","dills","dilly","jewed","strak","agile","jeune","jetty","dimer","jeton","strag","jetes","dimes","jesus","strae","strad","jests","stows","stowp","stown","dimly","dimps","dinar","jesse","dined","diner","dines","jerry","dinge","dingo","dings","dingy","dinic","jerky","dinks","dinky","jerks","dinna","stove","dinos","stout","allod","dints","aging","jerid","diode","diols","stour","stoup","jenny","jemmy","stoun","diota","stott","stots","jembe","stoss","jelly","jells","story","jello","storm","stork","store","jelab","stopt","stops","jehus","jehad","jeffs","agios","jefes","agism","jeers","stope","jeeps","agist","jeely","jeels","dippy","stoor","jedis","dipso","jebel","jeats","jeans","stoop","jazzy","diram","stool","stook","stood","stony","stonn","stonk","direr","dirge","agita","dirke","dirks","dirls","jaxie","dirts","dirty","stong","jawed","stone","stond","jawan","stomp","javel","javas","jaups","stoma","stoln","stole","jaunt","stoke","stoit","stoic","stogy","stoep","jauks","jatos","jasps","stock","jaspe","stobs","stoat","stoas","stoai","stoae","stivy","jasey","stive","disas","jarul","stirs","jarta","stirp","stirk","stire","jarps","jarls","jarks","stipe","stipa","stint","stink","japes","japer","japed","japan","sting","janty","stimy","stims","stime","janny","janns","stilt","disci","janes","still","stile","stilb","jamon","jammy","disco","james","stiff","sties","stied","jambu","jambs","jambo","jambe","stick","stich","aglee","aglet","stewy","stews","jalop","jalap","jakey","stets","jakes","agley","jails","stern","agloo","jagra","stere","stept","steps","jagir","jaggy","jaggs","stent","stens","jager","jagas","steno","jaffa","stend","jafas","discs","stems","jades","jaded","aglow","jacky","steme","jacks","stell","stele","stela","stein","steil","steer","predy","adapt","preed","aglus","steep","steen","steem","jacal","steel","steek","jabot","steed","steds","stede","stedd","stear","jaaps","stean","izzat","preen","izars","steam","izard","agmas","ixtle","steal","steak","ixora","ixias","stead","stays","ivory","staws","stave","ivies","ivied","staun","prees","stats","ither","items","state","itchy","stash","istle","start","stars","issue","starr","issei","starn","dishy","preif","stark","stare","staps","staph","stank","stang","stane","stand","stamp","disks","prems","premy","prent","stall","isnae","preon","preop","stalk","stale","islet","isles","isled","disme","stake","stair","ishes","stain","staig","staid","stagy","stags","isbas","stage","preps","staff","stade","presa","prese","stack","stabs","press","prest","squiz","squit","irony","irons","irone","iroko","irked","squid","iring","irids","squib","squeg","preve","squaw","irate","squat","irade","ippon","iotas","squad","ionic","squab","spyre","spyal","sputa","spurt","spurs","iodin","iodid","iodic","spurn","spunk","spumy","spume","inwit","spule","spugs","spues","spuer","spued","spuds","prexy","sprug","sprue","preys","sprog","sprod","prial","sprit","price","prick","sprig","sprew","spree","spred","pricy","pride","pried","prief","spray","prier","pries","sprat","sprag","sprad","prigs","prill","spout","prima","spots","prime","sposh","primi","sport","primo","primp","spork","prims","spore","spoot","dital","ditas","ditch","primy","spoor","dited","dites","invar","prink","print","spoon","spoom","prion","spool","ditsy","ditto","inust","prior","ditts","ditty","inurn","ditzy","inure","spook","prise","divan","spoof","divas","inula","dived","diver","prism","priss","spoke","dives","spoil","spods","spode","privy","prize","proas","divis","probe","splog","divna","divos","divot","split","probs","intro","divvy","diwan","dixie","dixit","diyas","dizen","dizzy","prods","proem","djinn","djins","doabs","doats","dobby","dobie","dobla","dobra","dobro","docht","profs","intra","progs","docks","proin","docos","splay","splat","proke","spivs","spitz","intis","spits","allis","doddy","spite","prole","spiry","spirt","dodge","dodgy","intil","dodos","doeks","doers","doest","doeth","doffs","proll","doges","dogey","promo","doggo","proms","doggy","dogie","dogma","prone","spire","prong","pronk","spiny","proof","adage","dohyo","doilt","doily","doing","doits","dojos","dolce","dolci","doled","spins","doles","dolia","props","spink","prore","prose","dolls","dolly","dolma","spine","dolor","proso","dolos","pross","dolts","prost","domal","prosy","domed","domes","spina","spims","spilt","domic","spill","proto","spile","spiky","spiks","proud","proul","donah","donas","prove","spike","donee","doner","donga","dongs","donko","donna","donne","spifs","donny","donor","donsy","donut","acyls","doobs","dooce","doody","prowl","dooks","doole","dools","dooly","prows","dooms","proxy","spiff","proyn","spies","spier","doomy","alley","doona","prude","spiel","spied","doorn","prune","doors","prunt","doozy","spide","spicy","dopas","doped","doper","dopes","pruta","dopey","pryer","spics","dorad","dorba","dorbs","doree","dores","doric","pryse","doris","spick","dorks","dorky","psalm","dorms","dormy","pseud","dorps","dorrs","dorsa","dorse","spice","spica","pshaw","dorts","dorty","dosed","doseh","spial","doser","doses","psion","psoae","psoai","psoas","dotal","psora","doted","doter","dotes","psych","dotty","douar","psyop","doubt","douce","doucs","dough","spewy","douks","doula","spews","douma","doums","doups","doura","douse","douts","pubco","doved","speug","pubes","pubic","pubis","doven","dover","doves","pucan","dovie","spets","dowar","pucer","dowds","dowdy","puces","dowed","dowel","pucka","dower","dowie","dowle","dowls","dowly","downa","pucks","sperm","speos","spent","puddy","pudge","pudgy","pudic","pudor","spend","downs","pudsy","pudus","spelt","puers","acute","spell","spelk","downy","puffs","puffy","dowps","dowry","dowse","dowts","doxie","speld","speks","doyen","doyly","dozed","dozen","dozer","dozes","puggy","pugil","speir","puhas","drabs","allel","pujah","pujas","drack","draco","pukas","speil","puked","speer","draff","puker","draft","pukes","pukey","pukka","speel","pukus","pulao","pulas","puled","puler","pules","pulik","pulis","pulka","speed","pulks","drags","drail","drain","pulli","drake","pulls","drama","pulmo","specs","speck","pulps","drams","pulpy","drank","drant","drape","pulse","draps","drats","accoy","drave","speat","pulus","drawl","inter","drawn","draws","pumas","drays","dread","spear","spean","speal","dream","pumie","speak","spazz","spaza","spays","spayd","drear","spaws","pumps","dreck","dreed","drees","spawn","punas","dregs","punce","punch","spawl","dreks","drent","drere","dress","spaul","drest","punga","dreys","intel","pungs","dribs","drice","dried","drier","dries","drift","punji","punka","drill","spats","drily","drink","drips","dript","drive","spate","punks","punky","spasm","droid","droil","droit","drole","droll","punny","drome","drone","drony","droob","droog","drook","drool","droop","punto","punts","punty","spart","pupae","pupal","spars","pupas","drops","pupil","dropt","dross","puppy","pupus","drouk","drove","drown","purda","drows","pured","puree","drubs","purer","pures","purge","drugs","purin","druid","puris","spark","drums","drunk","drupe","druse","drusy","druxy","dryad","dryer","dryly","purls","dsobo","dsomo","duads","spare","duals","spard","duans","duars","dubbo","purpy","spans","purrs","purse","ducal","ducat","duces","duchy","ducks","pursy","ducky","spank","ducts","purty","duddy","duded","dudes","puses","duels","duets","duett","duffs","dufus","duing","duits","dukas","duked","pushy","dukes","pusle","dukka","spang","spane","allee","dules","dulia","dulls","dully","dulse","dumas","pussy","spams","dumbo","dumbs","spalt","dumka","dumky","dummy","inset","putid","dumps","dumpy","dunam","dunce","dunch","spall","spale","spald","spake","spait","puton","dunes","dungs","dungy","dunks","putti","dunno","dunny","dunsh","dunts","spain","spail","spahi","putto","putts","duomi","duomo","spags","putty","allay","duped","duper","dupes","duple","puzel","spaes","spaer","spaed","spado","duply","duppy","pyats","dural","duras","dured","dures","durgy","pyets","pygal","durns","duroc","duros","duroy","durra","durrs","durry","durst","durum","durzi","dusks","dusky","pygmy","inrun","agoge","pyins","dusts","spade","dusty","dutch","spacy","pylon","duvet","pyned","pynes","duxes","pyoid","dwaal","dwale","dwalm","dwams","dwang","dwarf","dwaum","dweeb","input","dwell","pyots","dwelt","dwile","dwine","pyral","dyads","dyers","pyran","dying","dyked","dykes","dykey","dykon","inorb","pyres","pyrex","space","sozin","soyuz","pyric","soyle","dynel","dynes","soyas","sowth","sowse","sowps","sowne","sownd","sowms","sowls","sowle","sowfs","pyros","sowff","sower","sowed","sowce","innit","sowar","inner","inned","pyxed","pyxes","souts","dzhos","alkyl","eager","eagle","pyxie","eagre","eales","alkyd","eaned","eards","eared","alkos","inlet","inlay","earls","early","earns","earst","earth","south","inkle","souse","pyxis","sours","inker","inked","pzazz","agone","alkie","eased","easel","easer","eases","easle","qadis","qaids","easts","soupy","qanat","eaten","eater","eathe","eaved","eaves","soups","ebbed","ebbet","qibla","ebons","ebony","ebook","actor","qophs","qorma","quack","sound","soums","ecads","souls","inion","acton","souks","sough","souct","souce","quads","eched","eches","quaff","sotol","soths","sorus","quags","sorts","echos","eclat","quail","quair","quais","quake","sorta","sorry","quaky","sorra","quale","sorns","qualm","sorgo","quant","sorex","sores","sorer","ecrus","sorel","ingot","soree","sored","sords","sordo","ingle","sorda","sorbs","sorbo","quare","quark","ingan","soras","soral","quart","sopra","soppy","edema","edged","edger","edges","edict","sopor","edify","edile","quash","sophy","sophs","sooty","soots","quasi","quass","edits","infra","quate","infos","sooth","educe","educt","quats","soote","soops","sooms","eejit","quayd","sools","quays","eerie","soole","sooks","eeven","qubit","eevns","sooey","sonsy","quean","effed","sonse","sonny","queen","sonne","sonly","sonic","songs","queer","sones","quell","sonde","sonce","queme","infix","sonar","quena","egads","egers","egest","quern","eggar","egged","egger","query","quest","egmas","queue","queyn","egret","queys","infer","ehing","eider","eidos","eight","quich","quick","somas","soman","eigne","eiked","eikon","eilds","solve","eisel","solus","eject","solum","quids","eking","ekkas","quiet","solos","solon","elain","eland","elans","quiff","quill","elate","quilt","elbow","elchi","elder","quims","quina","eldin","elect","quine","solid","quino","soles","soler","quins","quint","solei","soled","solds","soldo","soldi","solde","solas","inert","solar","quipo","inerm","solan","solah","sokol","sokes","soken","sokah","sojas","soily","soils","quips","quipu","quire","sohur","soggy","soger","softy","quirk","softs","inept","quirt","quist","softa","sofas","sofar","quite","quits","sodom","sodic","soddy","sodas","quoad","socle","socks","socko","quods","quoif","quoin","socas","quoit","elegy","quoll","elemi","quonk","sober","quops","aliya","elfed","quota","elfin","sobas","soave","eliad","soars","elide","quote","soare","soapy","soaps","elint","elite","alive","indue","quoth","qursh","elmen","alist","quyte","eloge","elogy","eloin","elope","soaks","elops","indri","elpee","rabat","elsin","snyes","elude","indow","snush","snugs","elute","elvan","rabbi","elver","elves","indol","emacs","email","rabic","rabid","snuff","snuck","snubs","rabis","raced","snowy","embar","racer","races","snows","rache","embay","embed","snowk","ember","racks","racon","radar","snout","embog","radge","snots","indie","snort","india","snore","embow","index","embox","indew","radii","radio","snoot","radix","radon","snoop","snool","snook","snood","snoke","snogs","snoep","snoek","snods","snobs","raffs","embus","rafts","ragas","emcee","ragde","raged","emeer","ragee","emend","rager","snits","rages","ragga","emery","raggs","raggy","emeus","ragis","snirt","snipy","snips","emirs","emits","incut","emmas","incus","emmer","emmet","emmew","emmys","snipe","snigs","emong","emote","ragus","incur","rahed","snift","rahui","emove","raias","raids","raiks","sniff","snies","raile","snide","rails","snick","snibs","raine","snell","rains","rainy","raird","raise","snees","raita","sneer","sneed","sneds","sneck","raits","snebs","rajah","rajas","rajes","raked","rakee","sneap","raker","rakes","rakia","sneak","rakis","rakus","rales","empts","empty","snead","rally","ralph","snaws","snath","ramal","emule","snash","snary","snars","ramee","ramen","ramet","emure","aline","emyde","emyds","snarl","ramie","enact","ramin","ramis","snark","snarf","snare","snaps","rammy","enarm","enate","snaky","ramps","snake","ramus","snail","snags","ranas","rance","snafu","ranch","snack","snabs","smuts","smush","smurs","smugs","rands","randy","ranee","ranga","range","incog","rangi","rangy","ranid","ranis","smowt","ranke","smout","incle","smote","smore","ranks","smoot","smoor","smolt","rants","smoky","smoko","raped","smoke","raper","rapes","smogs","raphe","ended","smock","smits","ender","rapid","endew","smith","smite","smirs","smirr","smirk","rappe","smile","smews","rared","smerk","raree","smelt","rarer","rares","smell","smeke","smeik","smees","rarks","smeek","rased","raser","rases","smear","smaze","inbye","smash","endow","inbox","endue","smart","enema","enemy","rasps","raspy","rasse","smarm","rasta","enews","smalt","smalm","ratal","inarm","ratan","enfix","inapt","ratas","ratch","small","smaik","rated","ratel","rater","smack","rates","smaak","slype","slyly","ratha","slyer","rathe","sluts","acerb","inane","raths","slush","ratio","sluse","slurs","ratoo","ratos","slurp","slurb","slunk","slung","imshy","imshi","slums","slump","ratty","ratus","sluit","slugs","eniac","rauns","raupo","sluff","enjoy","slues","slued","raved","slubs","ravel","raven","slubb","sloyd","slows","raver","raves","ravin","enlit","enmew","rawer","rawin","slove","ennog","ennui","enoki","rawly","enols","enorm","rawns","raxed","raxes","rayah","enows","rayas","rayed","rayle","rayne","slots","rayon","razed","razee","sloth","razer","razes","slosh","razoo","razor","enrol","slorm","slopy","slops","impot","reach","react","slope","sloot","ensew","sloop","readd","sloom","slojd","ensky","sloid","slogs","reads","ready","sloes","imply","ensue","slobs","reaks","sloan","enter","realm","realo","reals","slive","slits","impis","slish","slipt","reame","slips","slipe","reams","reamy","reans","reaps","slink","sling","slimy","slims","rearm","entia","rears","reast","slime","reata","slily","reate","reave","slier","slide","acers","slick","rebar","slice","sleys","slews","slept","rebbe","rebec","rebel","impel","rebid","sleet","entry","imped","sleer","rebit","sleep","enure","enurn","sleek","sleds","slebs","rebop","envoi","envoy","slays","enzym","slaws","alike","actin","eorls","eosin","slave","epact","slaty","slats","epees","slate","rebus","rebut","slash","ephah","ephas","rebuy","slart","acted","slaps","recal","ephod","ephor","recap","recce","slant","slank","recco","reccy","epics","slang","slane","slams","slake","slain","slaid","slags","slaes","slade","recit","slack","slabs","recks","aceta","skyte","immix","immit","skyrs","skyre","skyfs","immew","skyey","skyer","skyed","recon","skunk","skull","skulk","skugs","skuas","imino","imine","imids","imido","imide","skrik","imbue","skran","skosh","skort","skool","skols","skoff","skoal","sklim","skivy","imbed","skive","imbar","skits","imaum","skite","imari","imams","imago","epoch","epode","epopt","skirt","recta","skirr","epoxy","recti","epris","recto","skirl","skips","equal","image","skios","recur","skint","skins","skink","equid","recut","skims","skimp","skimo","illth","equip","redan","skill","skiff","skiey","skies","skier","skied","skids","align","skews","iller","erase","erbia","erect","skets","redds","reddy","reded","erevs","ilium","skers","ilial","iliad","iliac","skeps","alifs","ileus","skeos","ileum","skens","ergon","skene","ileal","ileac","ergos","ergot","ikons","agons","erhus","ikats","erica","skelp","erick","erics","agony","ering","ikans","agood","skelm","ihram","erned","ernes","erode","erose","skell","skelf","redes","iglus","agora","skein","skegs","igloo","igged","skegg","igapo","skeet","skees","iftar","skeer","skeen","erred","error","idyls","idyll","erses","skeef","skeed","eruct","skear","idols","erugo","erupt","skean","skaws","eruvs","skatt","erven","ervil","redia","skats","skate","skart","redid","skank","redip","skald","idola","skail","skags","idles","idler","idled","sizes","sizer","idiot","sizel","redly","sized","escar","idiom","sizar","sixty","redon","sixth","redos","sixte","redox","escot","sixmo","sixes","sixer","esile","eskar","esker","ident","esnes","idees","siver","situs","situp","ideas","redry","ideal","essay","idant","ictus","ictic","sitka","sithe","esses","ictal","icons","sites","sited","sitar","sists","redub","ester","redux","redye","sissy","sises","sisal","estoc","estop","ickle","icker","sirup","icing","sirra","icily","icier","estro","reech","etage","etape","reede","etats","etens","siroc","siris","sirih","sires","ichor","reeds","reedy","alien","ethal","siren","siree","iches","sired","iched","ether","sippy","icers","reefs","reefy","sipes","siped","ethic","sinus","ibrik","sinky","sinks","reeks","reeky","iambs","sinhs","iambi","hythe","ethos","ethyl","reels","sings","hyson","etnas","hyrax","singe","reens","ettin","ettle","etude","etuis","etwee","etyma","sinew","sines","sined","reest","sinds","reeve","since","refed","refel","simul","simps","refer","reffo","eughs","euked","refit","hypos","refix","eupad","simis","refly","simba","simas","simar","refry","silva","silty","silts","euros","silos","silly","sills","eusol","regal","silky","silks","regar","hyphy","evade","hypha","hypes","silex","reges","siles","siler","reggo","silen","siled","silds","regie","sikes","siker","sikas","sijos","signs","alibi","evens","event","regma","evert","regna","every","regos","evets","evhoe","evict","signa","evils","sigma","regur","evite","alias","rehab","sigla","evohe","evoke","sigil","algum","rehem","ewers","ewest","ewhow","ewked","sight","sighs","exact","reifs","reify","sifts","reign","exalt","reiki","reiks","sieve","sieur","sieth","reink","exams","reins","reird","sient","siens","sield","siege","sidle","sidhe","sidha","reist","excel","reive","rejig","sides","rejon","reked","sider","rekes","rekey","sided","hyper","hyped","relax","sidas","sicks","sicko","relay","hyoid","hynde","hymns","sicht","sices","sibyl","sibbs","achar","hymen","relet","exeat","sials","execs","hylic","hyles","shyly","hyleg","agree","exeem","hylas","relic","hykes","hying","exeme","shyer","shwas","relie","shuts","exert","shute","hyens","shush","shura","hyena","shunt","shuns","relit","ached","shuls","shuln","shule","shuck","shtup","shtum","shtik","exies","exile","exine","exing","exist","shrug","algor","reman","exits","shrub","exode","shrow","remap","exons","shris","remen","remet","remex","remit","remix","shrew","expat","shred","shoyu","showy","shows","shown","showd","expel","renal","renay","rends","shove","hydro","shout","shott","renew","shots","shote","hydra","reney","renga","renig","short","shorn","shorl","renin","renne","shore","expos","shops","hwyls","shope","huzzy","shoot","shoos","shoon","huzza","shool","shook","shone","shola","shoji","hutia","hutch","shogs","shogi","aches","hussy","shoes","shoer","husos","husky","husks","shoed","shock","hushy","shoat","shoal","shmek","rente","shlub","hurts","shlep","shivs","rents","shive","shiva","shiur","hurst","hurry","shits","shite","hurra","shist","shiso","shish","hurly","extol","hurls","shirt","extra","shirs","shirr","shirk","hurds","shire","ships","hunts","shiny","shins","hunky","hunks","shine","agria","shims","reoil","hunch","shily","shill","humus","humpy","humps","exude","humph","exuls","exult","exurb","eyass","humor","shift","shies","shier","eyers","shiel","shied","humid","eying","humic","eyots","eyras","eyres","eyrie","eyrir","fabby","fable","humfs","shiai","shews","shewn","sheva","faced","shets","facer","faces","facet","repay","facia","humas","repeg","shere","sherd","repel","human","hully","hulls","sheol","shent","shend","hullo","facts","hulky","hulks","hules","hulas","faddy","algin","faded","huias","huhus","fader","fades","fadge","fados","agrin","faena","faery","algid","faffs","huggy","faggy","fagin","fagot","huger","huffy","faiks","huffs","fails","faine","shell","fains","faint","huers","shelf","hudud","hudna","fairs","fairy","repin","faith","hucks","sheik","faked","faker","fakes","fakey","fakie","fakir","falaj","hubby","hoyle","hoyed","repla","sheet","hoyas","hoxes","hoxed","falls","false","howso","sheer","howre","howls","famed","howks","fames","howfs","sheep","howff","sheen","howes","howdy","sheel","sheds","fanal","howbe","hoves","hover","hoven","fancy","hovel","hoved","fands","hovea","fanes","houts","fanga","fango","fangs","fanks","fanny","fanon","fanos","sheas","shear","reply","sheal","sheaf","fanum","algas","faqir","farad","repos","shchi","shays","shaya","shaws","shawn","shawm","farce","house","farci","hours","houri","farcy","fards","fared","farer","fares","shawl","hound","farle","farls","farms","hough","houfs","shave","houff","faros","shaul","hotty","algal","farse","farts","fasci","repot","hotly","shash","shart","hoten","hotel","hotch","algae","sharp","sharn","hosts","fasti","shark","fasts","repps","fatal","hosta","fated","fates","share","shard","shaps","hosey","hoses","shape","hoser","hosen","fatly","fatso","hosel","hosed","horsy","fatty","fatwa","horst","faugh","fauld","fault","shans","repro","shank","fauna","fauns","faurd","horse","fauts","fauve","favas","favel","faver","faves","favor","shand","shams","favus","alfas","horny","fawns","fawny","faxed","faxes","horns","fayed","fayer","fayne","fayre","fazed","fazes","feals","feare","fears","feart","fease","feast","horme","shame","horis","feats","shama","shaly","feaze","horde","horas","shalt","shalm","fecal","feces","fecht","horal","fecit","horah","fecks","hoppy","aleye","shall","shale","shaky","shakt","shako","fedex","hopes","shake","hoper","feebs","hoped","feeds","shahs","feels","feens","hoove","feers","feese","hooty","feeze","hoots","fehme","feign","reran","feint","feist","shags","hoosh","felch","hoors","hoord","hoops","felid","fella","hoons","shaft","shady","hooly","shads","fells","felly","felon","hooky","hooks","felts","felty","femal","hooka","femes","hoofs","shade","hooey","hoody","hoods","femme","femmy","alews","femur","fence","hooch","rerig","fends","fendy","shack","fenis","fenks","fenny","fents","feods","feoff","honor","honky","honks","feral","ferer","feres","feria","ferly","hongs","seyen","fermi","ferms","hongi","rerun","ferns","ferny","sexts","resat","honey","resaw","hones","sexto","honer","honed","honds","honda","honan","sexes","sexer","sexed","sewin","resay","ferry","sewer","sewen","sewel","sewed","sewar","sewan","homos","fesse","resee","festa","sever","seven","setup","fests","festy","fetal","fetas","fetch","feted","fetes","reses","reset","setts","resew","fetid","achoo","seton","fetor","fetta","fetts","setal","fetus","fetwa","feuar","alert","setae","resid","feuds","feued","fever","sessa","fewer","resin","feyed","feyer","feyly","fezes","fezzy","sesey","fiars","aleph","fiats","fiber","homme","servo","fibre","homie","homey","serve","resit","fibro","serum","serry","serrs","serre","homes","fices","fiche","fichu","ficin","ficos","homer","serra","serow","resod","ficus","seron","homed","serks","homas","fides","fidge","fidos","fiefs","field","holts","serin","serif","resow","fiend","fient","fiere","seric","fiers","fiery","fiest","fifed","fifer","fifes","holon","fifth","fifty","fight","figos","holms","holly","fiked","fikes","hollo","filar","serge","holla","holks","filch","serfs","filed","filer","files","filet","holey","holes","holed","seres","serer","holds","filii","fille","hokum","hokku","fillo","fills","filly","aleft","hokis","filmi","hokey","hokes","hoked","sered","films","hokas","filmy","alefs","filos","alecs","seral","filth","hoist","serai","filum","hoise","serac","hoing","hoiks","final","hoick","hohed","finca","finch","finds","fined","hoghs","hoggs","finer","fines","septs","agued","hogen","septa","aleck","hogan","agues","sepoy","hoers","finis","finks","hodja","sepic","finny","sepia","finos","fiord","fiqhs","fique","hodad","hocus","hocks","sepal","fired","hobos","sepad","senza","senvy","sents","senti","firer","fires","sente","hobby","firie","firks","resto","firms","firns","firry","first","firth","fiscs","hoast","hoary","hoars","sensi","hoard","aguna","fishy","sense","fisks","hoagy","sensa","hoaed","senor","aguti","hizen","ahead","fists","hives","hiver","fisty","fitch","hived","aheap","fitly","fitna","senna","fitte","fitts","fiver","fives","hithe","fixed","fixer","fixes","fixit","hitch","hists","rests","fizzy","fjeld","fjord","sengi","senes","resty","flabs","sends","flack","flaff","senas","retag","ahent","flags","hissy","flail","flair","flake","flaks","flaky","aldol","ahigh","flame","semis","flamm","ahind","retax","flams","flamy","retch","flank","hires","flans","hirer","hiree","hired","ahing","flaps","flare","flary","flash","ahint","hippy","semie","flask","retem","retia","hippo","flats","retie","semes","hiply","semen","hiois","ahold","hints","semee","hinny","hinky","flava","hings","hinge","hinds","selva","flawn","flaws","flawy","flaxy","sells","flays","fleam","ahull","fleas","hinau","fleck","himbo","ahuru","hilus","hilum","hilts","hilly","selle","hills","sella","fleer","flees","fleet","hillo","flegs","fleme","flesh","hilch","selfs","hilar","hikoi","hikes","hiker","hiked","hijra","flews","hijab","seles","flexo","hight","highs","fleys","flick","flics","flied","flier","flies","flimp","flims","selah","fling","flint","sekts","sekos","flips","flirs","flirt","seize","seity","retro","hiems","flisk","flite","flits","flitt","aidas","float","hides","hider","hided","aided","flobs","retry","seism","seise","seirs","aider","hicks","flock","flocs","alder","floes","flogs","flong","flood","seine","seils","floor","aides","seifs","flops","flora","sehri","hiant","segue","segos","segol","heyed","segno","segni","flors","flory","flosh","floss","hexyl","flota","flote","segar","sefer","flour","hexes","hexer","hexed","flout","seers","seepy","seeps","flown","flows","aldea","seems","reuse","flubs","flued","revel","flues","fluey","fluff","seely","seels","fluid","seeld","seeks","hexad","seedy","fluke","fluky","flume","aidoi","flump","flung","seeds","hewgh","flunk","hewer","hewed","aidos","fluor","hevea","heugh","heuch","sedum","heths","aiery","hetes","sedgy","sedge","sedes","seder","flurr","revet","flush","revie","sedan","flute","fluty","sects","fluyt","alcos","flyby","flyer","revue","flype","flyte","rewan","foals","rewax","foams","foamy","focal","rewed","focus","rewet","rewin","aigas","foehn","fogey","aight","hests","rewon","foggy","fogie","fogle","fogou","hesps","fohns","foids","foils","foins","foist","herye","folds","foley","folia","hertz","folic","folie","folio","herse","herry","rewth","folks","rexes","sechs","folky","heros","heron","folly","secco","fomes","fonda","fonds","fondu","fonly","sebum","herns","fonts","foods","foody","herms","seaze","fools","rheas","rheme","herma","herls","seats","rheum","heres","rhies","rhime","rhine","rhino","foots","herds","footy","herby","herbs","foram","sease","foray","sears","seare","forbs","forby","force","rhody","rhomb","fordo","fords","seans","seamy","rhone","seams","rhumb","seame","rhyme","seals","rhyne","rhyta","hepar","hents","henry","riads","rials","riant","henny","forel","henna","henge","hends","riata","ailed","ribas","hence","hempy","sdein","hemps","sdayn","fores","ribby","ribes","scyes","scuzz","scuts","riced","scute","ricer","rices","ricey","scuta","scuse","scurs","richt","scurf","scups","ricin","scums","forex","hemin","ricks","forge","sculs","hemic","sculp","forgo","hemes","rider","rides","ridge","scull","ridgy","sculk","forks","forky","riels","scugs","hemal","riems","rieve","scuft","scuff","scuds","scudo","scudi","helve","helps","rifer","scuba","forme","helot","helos","helms","forms","riffs","scrum","rifle","hells","hello","scrub","rifte","scrow","rifts","rifty","alcid","forte","forth","helix","riggs","right","forts","scrog","scrod","rigid","forty","forum","rigol","forza","rigor","forze","fossa","fosse","scrip","helio","scrim","fouat","riled","riles","fouds","fouer","fouet","riley","foule","rille","fouls","found","heles","fount","heled","rills","hejra","hejab","fours","heist","heirs","rimae","fouth","fovea","heils","fowls","fowth","rimed","foxed","foxes","rimer","screw","rimes","foxie","heigh","heids","foyer","foyle","foyne","frabs","frack","fract","hefty","hefts","scree","hefte","scray","heeze","heels","scraw","heedy","scrat","frags","frail","heeds","fraim","frame","franc","rimus","hedgy","scrap","scran","hedge","frank","scram","heder","scrag","scrae","rinds","frape","rindy","rines","fraps","frass","frate","scrab","scows","scowp","frati","frats","fraud","scowl","hecks","fraus","hecht","rings","frays","freak","hebes","scout","heben","rinks","rinse","heavy","freed","scour","rioja","scoup","heave","scoug","scots","heats","freer","frees","riots","freet","riped","ripen","scorn","heath","freit","fremd","frena","heast","score","riper","ripes","scops","frere","scope","fresh","scopa","scoot","ripps","frets","heart","friar","hears","fribs","heare","scoop","heard","heapy","fried","scoog","heaps","scone","heame","frier","fries","risen","riser","rises","rishi","heals","frigs","frill","heald","heady","frise","frisk","risks","risky","frist","risps","heads","frith","scold","scogs","frits","fritt","risus","fritz","scoff","scody","frize","rites","frizz","ritts","sclim","frock","froes","ritzy","frogs","rival","aimed","aimer","frond","frons","front","hazes","hazer","hazel","hazed","hazan","frore","frorn","frory","frosh","frost","froth","hayle","hayey","hayer","hayed","scion","frown","frows","rivas","hawse","hawms","frowy","froze","rived","rivel","hawks","riven","frugs","fruit","hawed","schwa","river","havoc","haves","schul","haver","frump","haven","frush","frust","haute","ainee","fryer","fubar","fubby","fubsy","hause","fucks","haunt","hault","fucus","hauls","fuddy","fudge","haulm","fuels","fuero","fuffs","fuffy","fugal","fuggy","hauld","fugie","fugio","ainga","fugle","haugh","haufs","fugly","fugue","hauds","fugus","fujis","fulls","fully","rives","rivet","hatha","aioli","hates","hater","schmo","fumed","hated","fumer","fumes","fumet","riyal","hatch","hasty","haste","fundi","hasta","funds","fundy","fungi","fungo","hasps","fungs","hasks","hashy","rizas","funks","funky","funny","fural","furan","roach","furca","harts","schav","furls","harsh","harry","furol","furor","roads","harpy","harps","furrs","furry","furth","furze","furzy","haros","harns","fused","fusee","fusel","harms","fuses","roams","scent","fusil","roans","scene","roars","roary","scend","roast","fussy","scena","roate","sceat","scaws","fusts","fusty","robed","futon","robes","robin","scaur","roble","scaup","fuzed","fuzee","fuzes","fuzil","scaud","fuzzy","fyces","fyked","fykes","fyles","fyrds","fytte","robot","gabba","harls","gabby","harks","scatt","scats","gable","gaddi","gades","gadge","scath","gadid","gadis","gadje","gadjo","scary","harim","gadso","album","scart","scars","gaffe","hares","gaffs","harem","gaged","gager","gages","hared","gaids","hardy","gaily","hards","gains","gairs","gaita","scarp","gaits","gaitt","gajos","acrid","scarf","galah","galas","galax","galea","rocks","scare","gales","haram","hapus","happy","rocky","scapi","acres","scape","haply","acred","scapa","roded","rodeo","scant","scans","rodes","hapax","haoma","haole","scand","galls","hants","scams","gally","galop","hanse","galut","hansa","scamp","hanky","hanks","scaly","scalp","galvo","gamas","gamay","gamba","hangs","gambe","hangi","gambo","scall","gambs","handy","gamed","roger","gamer","games","rogue","scale","roguy","gamey","gamic","gamin","gamma","roils","roily","gamme","scald","gammy","roins","roist","hands","gamps","gamut","rojak","ganch","scala","gandy","ganef","ganev","rojis","roked","scail","scags","roker","rokes","rolag","gangs","scaff","roles","scads","scabs","rolfs","ganja","ganof","gants","gaols","gaped","gaper","gapes","rolls","gapos","gappy","hanch","garbe","hance","garbo","hanap","garbs","hamza","garda","romal","sazes","acids","roman","sayst","garis","hammy","sayon","sayne","sayid","sayer","sayed","garni","saxes","garre","hames","hamed","hamba","garth","garum","romeo","gases","hamal","halve","sawer","sawed","halva","gasps","gaspy","halts","gassy","albee","romps","sawah","savvy","savoy","halse","halos","ronde","halon","savor","savin","savey","saves","saver","saved","rondo","roneo","gasts","gated","rones","halms","halma","gater","gates","ronin","gaths","gator","ronne","gaucy","gauds","gaudy","gauge","ronte","gauje","sauts","gault","ronts","gaums","gaumy","albas","halls","gaunt","gaups","gaurs","gauss","gauze","gauzy","gavel","gavot","hallo","roods","gawcy","alays","gawds","saute","acidy","gawks","gawky","gawps","gawsy","gayal","gayer","gayly","gazal","gazar","gazed","gazer","gazes","saury","gazon","gazoo","alate","geals","geans","halid","geare","roofs","gears","saunt","geats","gebur","gecko","gecks","halfs","alary","roofy","sauna","geeks","geeky","geeps","geese","geest","halfa","sault","sauls","geist","hales","geits","saugh","saucy","haler","haled","sauch","gelds","gelee","gelid","sauce","halal","sauba","gelly","gelts","hakus","gemel","hakim","hakes","satyr","gemma","hakea","hakas","hakam","gemmy","rooks","gemot","hajji","alarm","genal","rooky","genas","hajis","hajes","alaps","satis","haith","hairy","satin","sates","satem","rooms","sated","roomy","roons","hairs","satay","satai","genes","genet","sassy","roops","roopy","sasse","genic","sasin","roosa","genie","genii","genip","roose","saser","roost","haint","genny","genoa","hains","genom","sarus","haily","genre","genro","alapa","hails","saros","haiku","haiks","sarod","haika","sarky","sarks","saris","sarin","haick","sargo","hahas","sarge","saree","sared","sards","gents","genty","genua","genus","haggs","geode","saran","roots","geoid","sappy","hafts","aired","sapor","hafiz","hafis","haffs","airer","haets","sapid","haems","rooty","roped","roper","sapan","saola","ropes","sants","ropey","santo","roque","alant","gerah","roral","rores","roric","gerbe","rorid","rorie","alans","geres","acing","gerle","sansa","acini","rorts","sanko","rorty","germs","germy","gerne","sangs","sango","sangh","gesse","gesso","rosed","geste","roses","sanga","sanes","saner","roset","saned","gests","hadst","getas","sandy","getup","alang","geums","alane","geyan","geyer","hadji","ghast","ghats","ghaut","ghazi","aland","ghees","hades","haded","ghest","sands","hadal","ghost","hacks","roshi","ghoul","ghyll","giant","alamo","gibed","gibel","giber","gibes","gibli","gibus","giddy","rosin","gifts","hacek","habus","hable","gigas","rosit","gighe","gigot","gigue","alack","gilas","gilds","habit","gilet","rosti","gills","gilly","haars","gilpy","haafs","gyves","gyved","gilts","gytes","gimel","gimme","gyrus","rosts","gimps","gimpy","ginge","rotal","rotan","gyros","ackee","samps","gyron","rotas","sampi","gyres","gings","gyred","ginks","ginny","ginzo","gipon","gippo","gippy","gipsy","gyral","gypsy","sammy","gyppy","girds","alaap","gyppo","girls","girly","girns","giron","giros","girrs","girsh","girth","gyoza","girts","gismo","rotch","gisms","gists","gites","akkas","giust","roted","rotes","gived","given","giver","gives","gizmo","akita","gynny","glace","samfu","gynie","samey","sames","rotis","samen","samel","rotls","aking","roton","rotor","glade","samek","acker","rotos","rotte","glads","sambo","glady","glaik","glair","samba","samas","gynae","saman","salvo","gymps","glams","gland","salve","glans","glare","glary","glass","rouen","gyeld","gybes","gybed","gyals","salue","salty","gwine","salts","salto","glaum","glaur","glaze","guyse","guyot","glazy","gleam","glean","guyle","gleba","glebe","guyed","gleby","glede","gleds","gleed","gleek","glees","gutty","gleet","roues","rouge","rough","gleis","glens","glent","gleys","glial","glias","glibs","glide","gliff","gutta","glift","glike","akene","glime","gutsy","glims","glint","glisk","glits","gusty","gusts","glitz","gusto","gloam","gloat","akela","salse","salsa","salps","gussy","globe","globi","salpa","salop","globs","salon","gusli","salol","globy","glode","glogg","akees","gusle","salmi","sally","gloms","gusla","gloom","gushy","gloop","glops","gurus","glory","gursh","gloss","gurry","salle","gurns","salix","glost","gurly","gurls","glout","glove","glows","gloze","gurge","roule","guqin","salic","guppy","salet","glued","gluer","glues","gluey","glugs","sales","glume","rouls","glums","roums","gluon","gunny","salep","glute","gluts","salal","salad","gunky","gunks","round","gungy","gunge","sakis","sakia","sakes","gundy","saker","sakai","sajou","saith","saist","sairs","glyph","saint","sains","saine","saims","gnarl","gumps","gnarr","gnars","gnash","gummy","sails","gnats","gnawn","gnaws","gnome","gumma","gumbo","saiga","saids","saics","gnows","ajwan","gulpy","goads","gulps","goafs","ajuga","saick","saice","gulph","goals","gully","gulls","goary","goats","sahib","saheb","goaty","goban","gobar","sagum","gobbi","gobbo","gobby","ajiva","gulfy","gobis","gobos","aizle","gulfs","aiver","sagos","gulet","godet","gules","saggy","gulch","gulas","godly","gular","gulag","aitus","godso","goels","goers","aitch","goest","goeth","goety","gofer","goffs","gogga","guise","gogos","goier","going","guiro","gojis","sages","sager","guimp","sagas","guilt","golds","acmes","acmic","goldy","golem","goles","roups","roupy","golfs","rouse","guile","guild","guids","golly","aisle","golpe","golps","guide","gombo","gomer","gompa","gonad","safes","safer","gugas","safed","gonef","guffs","goner","gongs","airns","gonia","roust","gonif","acned","sadza","acnes","sados","sadly","gonks","gonna","route","gonof","sadis","guest","sadhu","sadhe","gonys","gonzo","gooby","sades","saddo","guess","routh","goods","goody","gooey","goofs","goofy","gudes","googs","gooks","gooky","goold","gools","gooly","goons","goony","gucky","gucks","goops","goopy","goors","goory","airts","goose","acock","goosy","gopak","gopik","goral","routs","goras","guava","guars","roved","gored","gores","gorge","roven","rover","roves","sacra","goris","sacks","guard","rowan","gorms","gormy","gorps","gorse","guans","gorsy","guano","gosht","rowdy","guana","airth","gosse","guaco","grypt","grype","gryke","goths","gotta","gouch","gouge","gouks","goura","gourd","gryde","gryce","sabre","rowed","sabra","gouts","gouty","grunt","sabot","sable","sabir","sabin","sabha","sabes","saber","grund","gowan","gowds","gowfs","gowks","gowls","rowel","gowns","goxes","goyim","goyle","graal","grump","rowen","grabs","grace","sabed","acold","grume","rower","sabal","saags","ryper","grade","ryots","gruff","grads","rynds","rymme","rykes","ryked","grufe","rowme","grues","rownd","graff","gruel","rybat","graft","grued","grail","grain","ryals","grubs","graip","rutty","rowth","grama","grame","grrrl","grrls","rutin","ruths","rusty","rusts","rowts","royal","grows","gramp","grams","grana","grand","grown","growl","russe","rusma","rusks","grove","rushy","grout","acorn","ruses","rusas","rurus","rurps","group","royne","rural","rupia","rupee","runty","runts","royst","rozet","grans","grant","rozit","runny","ruana","runic","grape","rungs","rubai","runes","runed","runds","graph","runch","grouf","rumpy","rumps","rumpo","grots","grapy","grasp","grass","grosz","rubby","rumor","rummy","gross","grate","rumly","grope","rumes","rumen","rumbo","grave","rubel","groom","rumba","rumal","groof","grone","rules","ruler","gravs","gravy","groma","groks","ruled","rukhs","ruins","groin","grays","grogs","graze","ruing","grody","great","groat","grebe","grebo","grece","ruggy","groan","rubes","grize","greed","grits","greek","green","grith","grisy","rugby","rugal","rugae","grist","ruffs","grise","ruffe","ruers","gripy","gript","rueda","grips","rudie","rudes","ruder","ruddy","rudds","grees","greet","grege","grego","grein","gripe","rudas","griot","grins","grens","grese","greve","grews","rubin","grind","grimy","rucks","greys","grice","gride","grime","ruble","ruche","grids","grief","rubus","griff","grift","grill","grigs"],"lengths":{"2":124,"3":1435,"4":6963,"5":19614}}
},{}],41:[function(require,module,exports){
/**
 * The buffer module from node.js, for the browser.
 *
 * Author:   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * License:  MIT
 *
 * `npm install buffer`
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = Buffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192

/**
 * If `Buffer._useTypedArrays`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (compatible down to IE6)
 */
Buffer._useTypedArrays = (function () {
   // Detect if browser supports Typed Arrays. Supported browsers are IE 10+,
   // Firefox 4+, Chrome 7+, Safari 5.1+, Opera 11.6+, iOS 4.2+.
  if (typeof Uint8Array !== 'function' || typeof ArrayBuffer !== 'function')
    return false

  // Does the browser support adding properties to `Uint8Array` instances? If
  // not, then that's the same as no `Uint8Array` support. We need to be able to
  // add all the node Buffer API methods.
  // Bug in Firefox 4-29, now fixed: https://bugzilla.mozilla.org/show_bug.cgi?id=695438
  try {
    var arr = new Uint8Array(0)
    arr.foo = function () { return 42 }
    return 42 === arr.foo() &&
        typeof arr.subarray === 'function' // Chrome 9-10 lack `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding, noZero) {
  if (!(this instanceof Buffer))
    return new Buffer(subject, encoding, noZero)

  var type = typeof subject

  // Workaround: node's base64 implementation allows for non-padded strings
  // while base64-js does not.
  if (encoding === 'base64' && type === 'string') {
    subject = stringtrim(subject)
    while (subject.length % 4 !== 0) {
      subject = subject + '='
    }
  }

  // Find the length
  var length
  if (type === 'number')
    length = coerce(subject)
  else if (type === 'string')
    length = Buffer.byteLength(subject, encoding)
  else if (type === 'object')
    length = coerce(subject.length) // Assume object is an array
  else
    throw new Error('First argument needs to be a number, array or string.')

  var buf
  if (Buffer._useTypedArrays) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    buf = augment(new Uint8Array(length))
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    buf = this
    buf.length = length
    buf._isBuffer = true
  }

  var i
  if (Buffer._useTypedArrays && typeof Uint8Array === 'function' &&
      subject instanceof Uint8Array) {
    // Speed optimization -- use set if we're copying from a Uint8Array
    buf._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    for (i = 0; i < length; i++) {
      if (Buffer.isBuffer(subject))
        buf[i] = subject.readUInt8(i)
      else
        buf[i] = subject[i]
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  } else if (type === 'number' && !Buffer._useTypedArrays && !noZero) {
    for (i = 0; i < length; i++) {
      buf[i] = 0
    }
  }

  return buf
}

// STATIC METHODS
// ==============

Buffer.isEncoding = function (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.isBuffer = function (b) {
  return !!(b !== null && b !== undefined && b._isBuffer)
}

Buffer.byteLength = function (str, encoding) {
  var ret
  str = str + ''
  switch (encoding || 'utf8') {
    case 'hex':
      ret = str.length / 2
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.concat = function (list, totalLength) {
  assert(isArray(list), 'Usage: Buffer.concat(list, [totalLength])\n' +
      'list should be an Array.')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (typeof totalLength !== 'number') {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

// BUFFER INSTANCE METHODS
// =======================

function _hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  assert(strLen % 2 === 0, 'Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16)
    assert(!isNaN(byte), 'Invalid hex string')
    buf[offset + i] = byte
  }
  Buffer._charsWritten = i * 2
  return i
}

function _utf8Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf8ToBytes(string), buf, offset, length)
  return charsWritten
}

function _asciiWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function _binaryWrite (buf, string, offset, length) {
  return _asciiWrite(buf, string, offset, length)
}

function _base64Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function _utf16leWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf16leToBytes(string), buf, offset, length)
  return charsWritten
}

Buffer.prototype.write = function (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0
  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = _asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = _binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = _base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leWrite(this, string, offset, length)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toString = function (encoding, start, end) {
  var self = this

  encoding = String(encoding || 'utf8').toLowerCase()
  start = Number(start) || 0
  end = (end !== undefined)
    ? Number(end)
    : end = self.length

  // Fastpath empty strings
  if (end === start)
    return ''

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexSlice(self, start, end)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Slice(self, start, end)
      break
    case 'ascii':
      ret = _asciiSlice(self, start, end)
      break
    case 'binary':
      ret = _binarySlice(self, start, end)
      break
    case 'base64':
      ret = _base64Slice(self, start, end)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leSlice(self, start, end)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toJSON = function () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (!target_start) target_start = 0

  // Copy 0 bytes; we're done
  if (end === start) return
  if (target.length === 0 || source.length === 0) return

  // Fatal error conditions
  assert(end >= start, 'sourceEnd < sourceStart')
  assert(target_start >= 0 && target_start < target.length,
      'targetStart out of bounds')
  assert(start >= 0 && start < source.length, 'sourceStart out of bounds')
  assert(end >= 0 && end <= source.length, 'sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  // copy!
  for (var i = 0; i < end - start; i++)
    target[i + target_start] = this[i + start]
}

function _base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function _utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function _asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++)
    ret += String.fromCharCode(buf[i])
  return ret
}

function _binarySlice (buf, start, end) {
  return _asciiSlice(buf, start, end)
}

function _hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function _utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i+1] * 256)
  }
  return res
}

Buffer.prototype.slice = function (start, end) {
  var len = this.length
  start = clamp(start, len, 0)
  end = clamp(end, len, len)

  if (Buffer._useTypedArrays) {
    return augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    var newBuf = new Buffer(sliceLen, undefined, true)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
    return newBuf
  }
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

Buffer.prototype.readUInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  return this[offset]
}

function _readUInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    val = buf[offset]
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
  } else {
    val = buf[offset] << 8
    if (offset + 1 < len)
      val |= buf[offset + 1]
  }
  return val
}

Buffer.prototype.readUInt16LE = function (offset, noAssert) {
  return _readUInt16(this, offset, true, noAssert)
}

Buffer.prototype.readUInt16BE = function (offset, noAssert) {
  return _readUInt16(this, offset, false, noAssert)
}

function _readUInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    if (offset + 2 < len)
      val = buf[offset + 2] << 16
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
    val |= buf[offset]
    if (offset + 3 < len)
      val = val + (buf[offset + 3] << 24 >>> 0)
  } else {
    if (offset + 1 < len)
      val = buf[offset + 1] << 16
    if (offset + 2 < len)
      val |= buf[offset + 2] << 8
    if (offset + 3 < len)
      val |= buf[offset + 3]
    val = val + (buf[offset] << 24 >>> 0)
  }
  return val
}

Buffer.prototype.readUInt32LE = function (offset, noAssert) {
  return _readUInt32(this, offset, true, noAssert)
}

Buffer.prototype.readUInt32BE = function (offset, noAssert) {
  return _readUInt32(this, offset, false, noAssert)
}

Buffer.prototype.readInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null,
        'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  var neg = this[offset] & 0x80
  if (neg)
    return (0xff - this[offset] + 1) * -1
  else
    return this[offset]
}

function _readInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt16(buf, offset, littleEndian, true)
  var neg = val & 0x8000
  if (neg)
    return (0xffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt16LE = function (offset, noAssert) {
  return _readInt16(this, offset, true, noAssert)
}

Buffer.prototype.readInt16BE = function (offset, noAssert) {
  return _readInt16(this, offset, false, noAssert)
}

function _readInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt32(buf, offset, littleEndian, true)
  var neg = val & 0x80000000
  if (neg)
    return (0xffffffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt32LE = function (offset, noAssert) {
  return _readInt32(this, offset, true, noAssert)
}

Buffer.prototype.readInt32BE = function (offset, noAssert) {
  return _readInt32(this, offset, false, noAssert)
}

function _readFloat (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 23, 4)
}

Buffer.prototype.readFloatLE = function (offset, noAssert) {
  return _readFloat(this, offset, true, noAssert)
}

Buffer.prototype.readFloatBE = function (offset, noAssert) {
  return _readFloat(this, offset, false, noAssert)
}

function _readDouble (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 7 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 52, 8)
}

Buffer.prototype.readDoubleLE = function (offset, noAssert) {
  return _readDouble(this, offset, true, noAssert)
}

Buffer.prototype.readDoubleBE = function (offset, noAssert) {
  return _readDouble(this, offset, false, noAssert)
}

Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'trying to write beyond buffer length')
    verifuint(value, 0xff)
  }

  if (offset >= this.length) return

  this[offset] = value
}

function _writeUInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 2); i < j; i++) {
    buf[offset + i] =
        (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
            (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, false, noAssert)
}

function _writeUInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffffffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 4); i < j; i++) {
    buf[offset + i] =
        (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, false, noAssert)
}

Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7f, -0x80)
  }

  if (offset >= this.length)
    return

  if (value >= 0)
    this.writeUInt8(value, offset, noAssert)
  else
    this.writeUInt8(0xff + value + 1, offset, noAssert)
}

function _writeInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fff, -0x8000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt16(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt16(buf, 0xffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, false, noAssert)
}

function _writeInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fffffff, -0x80000000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt32(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt32(buf, 0xffffffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, false, noAssert)
}

function _writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 23, 4)
}

Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, false, noAssert)
}

function _writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 7 < buf.length,
        'Trying to write beyond buffer length')
    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 52, 8)
}

Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, false, noAssert)
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (typeof value === 'string') {
    value = value.charCodeAt(0)
  }

  assert(typeof value === 'number' && !isNaN(value), 'value is not a number')
  assert(end >= start, 'end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  assert(start >= 0 && start < this.length, 'start out of bounds')
  assert(end >= 0 && end <= this.length, 'end out of bounds')

  for (var i = start; i < end; i++) {
    this[i] = value
  }
}

Buffer.prototype.inspect = function () {
  var out = []
  var len = this.length
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i])
    if (i === exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...'
      break
    }
  }
  return '<Buffer ' + out.join(' ') + '>'
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function () {
  if (typeof Uint8Array === 'function') {
    if (Buffer._useTypedArrays) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1)
        buf[i] = this[i]
      return buf.buffer
    }
  } else {
    throw new Error('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

var BP = Buffer.prototype

/**
 * Augment the Uint8Array *instance* (not the class!) with Buffer methods
 */
function augment (arr) {
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

// slice(start, end)
function clamp (index, len, defaultValue) {
  if (typeof index !== 'number') return defaultValue
  index = ~~index;  // Coerce to integer.
  if (index >= len) return len
  if (index >= 0) return index
  index += len
  if (index >= 0) return index
  return 0
}

function coerce (length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length)
  return length < 0 ? 0 : length
}

function isArray (subject) {
  return (Array.isArray || function (subject) {
    return Object.prototype.toString.call(subject) === '[object Array]'
  })(subject)
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    var b = str.charCodeAt(i)
    if (b <= 0x7F)
      byteArray.push(str.charCodeAt(i))
    else {
      var start = i
      if (b >= 0xD800 && b <= 0xDFFF) i++
      var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16))
    }
  }
  return byteArray
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(str)
}

function blitBuffer (src, dst, offset, length) {
  var pos
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

/*
 * We have to make sure that the value is a valid integer. This means that it
 * is non-negative. It has no fractional component and that it does not
 * exceed the maximum allowed value.
 */
function verifuint (value, max) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value >= 0, 'specified a negative value for writing an unsigned value')
  assert(value <= max, 'value is larger than maximum value for type')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifsint (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifIEEE754 (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
}

function assert (test, message) {
  if (!test) throw new Error(message || 'Failed assertion')
}

},{"base64-js":42,"ieee754":43}],42:[function(require,module,exports){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var ZERO   = '0'.charCodeAt(0)
	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS)
			return 62 // '+'
		if (code === SLASH)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	module.exports.toByteArray = b64ToByteArray
	module.exports.fromByteArray = uint8ToBase64
}())

},{}],43:[function(require,module,exports){
exports.read = function(buffer, offset, isLE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isLE ? (nBytes - 1) : 0,
      d = isLE ? -1 : 1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isLE ? 0 : (nBytes - 1),
      d = isLE ? 1 : -1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

},{}],44:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        throw TypeError('Uncaught, unspecified "error" event.');
      }
      return false;
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      console.trace();
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],45:[function(require,module,exports){
var http = module.exports;
var EventEmitter = require('events').EventEmitter;
var Request = require('./lib/request');
var url = require('url')

http.request = function (params, cb) {
    if (typeof params === 'string') {
        params = url.parse(params)
    }
    if (!params) params = {};
    if (!params.host && !params.port) {
        params.port = parseInt(window.location.port, 10);
    }
    if (!params.host && params.hostname) {
        params.host = params.hostname;
    }
    
    if (!params.scheme) params.scheme = window.location.protocol.split(':')[0];
    if (!params.host) {
        params.host = window.location.hostname || window.location.host;
    }
    if (/:/.test(params.host)) {
        if (!params.port) {
            params.port = params.host.split(':')[1];
        }
        params.host = params.host.split(':')[0];
    }
    if (!params.port) params.port = params.scheme == 'https' ? 443 : 80;
    
    var req = new Request(new xhrHttp, params);
    if (cb) req.on('response', cb);
    return req;
};

http.get = function (params, cb) {
    params.method = 'GET';
    var req = http.request(params, cb);
    req.end();
    return req;
};

http.Agent = function () {};
http.Agent.defaultMaxSockets = 4;

var xhrHttp = (function () {
    if (typeof window === 'undefined') {
        throw new Error('no window object present');
    }
    else if (window.XMLHttpRequest) {
        return window.XMLHttpRequest;
    }
    else if (window.ActiveXObject) {
        var axs = [
            'Msxml2.XMLHTTP.6.0',
            'Msxml2.XMLHTTP.3.0',
            'Microsoft.XMLHTTP'
        ];
        for (var i = 0; i < axs.length; i++) {
            try {
                var ax = new(window.ActiveXObject)(axs[i]);
                return function () {
                    if (ax) {
                        var ax_ = ax;
                        ax = null;
                        return ax_;
                    }
                    else {
                        return new(window.ActiveXObject)(axs[i]);
                    }
                };
            }
            catch (e) {}
        }
        throw new Error('ajax not supported in this browser')
    }
    else {
        throw new Error('ajax not supported in this browser');
    }
})();

http.STATUS_CODES = {
    100 : 'Continue',
    101 : 'Switching Protocols',
    102 : 'Processing',                 // RFC 2518, obsoleted by RFC 4918
    200 : 'OK',
    201 : 'Created',
    202 : 'Accepted',
    203 : 'Non-Authoritative Information',
    204 : 'No Content',
    205 : 'Reset Content',
    206 : 'Partial Content',
    207 : 'Multi-Status',               // RFC 4918
    300 : 'Multiple Choices',
    301 : 'Moved Permanently',
    302 : 'Moved Temporarily',
    303 : 'See Other',
    304 : 'Not Modified',
    305 : 'Use Proxy',
    307 : 'Temporary Redirect',
    400 : 'Bad Request',
    401 : 'Unauthorized',
    402 : 'Payment Required',
    403 : 'Forbidden',
    404 : 'Not Found',
    405 : 'Method Not Allowed',
    406 : 'Not Acceptable',
    407 : 'Proxy Authentication Required',
    408 : 'Request Time-out',
    409 : 'Conflict',
    410 : 'Gone',
    411 : 'Length Required',
    412 : 'Precondition Failed',
    413 : 'Request Entity Too Large',
    414 : 'Request-URI Too Large',
    415 : 'Unsupported Media Type',
    416 : 'Requested Range Not Satisfiable',
    417 : 'Expectation Failed',
    418 : 'I\'m a teapot',              // RFC 2324
    422 : 'Unprocessable Entity',       // RFC 4918
    423 : 'Locked',                     // RFC 4918
    424 : 'Failed Dependency',          // RFC 4918
    425 : 'Unordered Collection',       // RFC 4918
    426 : 'Upgrade Required',           // RFC 2817
    428 : 'Precondition Required',      // RFC 6585
    429 : 'Too Many Requests',          // RFC 6585
    431 : 'Request Header Fields Too Large',// RFC 6585
    500 : 'Internal Server Error',
    501 : 'Not Implemented',
    502 : 'Bad Gateway',
    503 : 'Service Unavailable',
    504 : 'Gateway Time-out',
    505 : 'HTTP Version Not Supported',
    506 : 'Variant Also Negotiates',    // RFC 2295
    507 : 'Insufficient Storage',       // RFC 4918
    509 : 'Bandwidth Limit Exceeded',
    510 : 'Not Extended',               // RFC 2774
    511 : 'Network Authentication Required' // RFC 6585
};
},{"./lib/request":46,"events":44,"url":64}],46:[function(require,module,exports){
var Stream = require('stream');
var Response = require('./response');
var Base64 = require('Base64');
var inherits = require('inherits');

var Request = module.exports = function (xhr, params) {
    var self = this;
    self.writable = true;
    self.xhr = xhr;
    self.body = [];
    
    self.uri = (params.scheme || 'http') + '://'
        + params.host
        + (params.port ? ':' + params.port : '')
        + (params.path || '/')
    ;
    
    if (typeof params.withCredentials === 'undefined') {
        params.withCredentials = true;
    }

    try { xhr.withCredentials = params.withCredentials }
    catch (e) {}
    
    xhr.open(
        params.method || 'GET',
        self.uri,
        true
    );

    self._headers = {};
    
    if (params.headers) {
        var keys = objectKeys(params.headers);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            if (!self.isSafeRequestHeader(key)) continue;
            var value = params.headers[key];
            self.setHeader(key, value);
        }
    }
    
    if (params.auth) {
        //basic auth
        this.setHeader('Authorization', 'Basic ' + Base64.btoa(params.auth));
    }

    var res = new Response;
    res.on('close', function () {
        self.emit('close');
    });
    
    res.on('ready', function () {
        self.emit('response', res);
    });
    
    xhr.onreadystatechange = function () {
        // Fix for IE9 bug
        // SCRIPT575: Could not complete the operation due to error c00c023f
        // It happens when a request is aborted, calling the success callback anyway with readyState === 4
        if (xhr.__aborted) return;
        res.handle(xhr);
    };
};

inherits(Request, Stream);

Request.prototype.setHeader = function (key, value) {
    this._headers[key.toLowerCase()] = value
};

Request.prototype.getHeader = function (key) {
    return this._headers[key.toLowerCase()]
};

Request.prototype.removeHeader = function (key) {
    delete this._headers[key.toLowerCase()]
};

Request.prototype.write = function (s) {
    this.body.push(s);
};

Request.prototype.destroy = function (s) {
    this.xhr.__aborted = true;
    this.xhr.abort();
    this.emit('close');
};

Request.prototype.end = function (s) {
    if (s !== undefined) this.body.push(s);

    var keys = objectKeys(this._headers);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var value = this._headers[key];
        if (isArray(value)) {
            for (var j = 0; j < value.length; j++) {
                this.xhr.setRequestHeader(key, value[j]);
            }
        }
        else this.xhr.setRequestHeader(key, value)
    }

    if (this.body.length === 0) {
        this.xhr.send('');
    }
    else if (typeof this.body[0] === 'string') {
        this.xhr.send(this.body.join(''));
    }
    else if (isArray(this.body[0])) {
        var body = [];
        for (var i = 0; i < this.body.length; i++) {
            body.push.apply(body, this.body[i]);
        }
        this.xhr.send(body);
    }
    else if (/Array/.test(Object.prototype.toString.call(this.body[0]))) {
        var len = 0;
        for (var i = 0; i < this.body.length; i++) {
            len += this.body[i].length;
        }
        var body = new(this.body[0].constructor)(len);
        var k = 0;
        
        for (var i = 0; i < this.body.length; i++) {
            var b = this.body[i];
            for (var j = 0; j < b.length; j++) {
                body[k++] = b[j];
            }
        }
        this.xhr.send(body);
    }
    else {
        var body = '';
        for (var i = 0; i < this.body.length; i++) {
            body += this.body[i].toString();
        }
        this.xhr.send(body);
    }
};

// Taken from http://dxr.mozilla.org/mozilla/mozilla-central/content/base/src/nsXMLHttpRequest.cpp.html
Request.unsafeHeaders = [
    "accept-charset",
    "accept-encoding",
    "access-control-request-headers",
    "access-control-request-method",
    "connection",
    "content-length",
    "cookie",
    "cookie2",
    "content-transfer-encoding",
    "date",
    "expect",
    "host",
    "keep-alive",
    "origin",
    "referer",
    "te",
    "trailer",
    "transfer-encoding",
    "upgrade",
    "user-agent",
    "via"
];

Request.prototype.isSafeRequestHeader = function (headerName) {
    if (!headerName) return false;
    return indexOf(Request.unsafeHeaders, headerName.toLowerCase()) === -1;
};

var objectKeys = Object.keys || function (obj) {
    var keys = [];
    for (var key in obj) keys.push(key);
    return keys;
};

var isArray = Array.isArray || function (xs) {
    return Object.prototype.toString.call(xs) === '[object Array]';
};

var indexOf = function (xs, x) {
    if (xs.indexOf) return xs.indexOf(x);
    for (var i = 0; i < xs.length; i++) {
        if (xs[i] === x) return i;
    }
    return -1;
};

},{"./response":47,"Base64":48,"inherits":50,"stream":57}],47:[function(require,module,exports){
var Stream = require('stream');
var util = require('util');

var Response = module.exports = function (res) {
    this.offset = 0;
    this.readable = true;
};

util.inherits(Response, Stream);

var capable = {
    streaming : true,
    status2 : true
};

function parseHeaders (res) {
    var lines = res.getAllResponseHeaders().split(/\r?\n/);
    var headers = {};
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (line === '') continue;
        
        var m = line.match(/^([^:]+):\s*(.*)/);
        if (m) {
            var key = m[1].toLowerCase(), value = m[2];
            
            if (headers[key] !== undefined) {
            
                if (isArray(headers[key])) {
                    headers[key].push(value);
                }
                else {
                    headers[key] = [ headers[key], value ];
                }
            }
            else {
                headers[key] = value;
            }
        }
        else {
            headers[line] = true;
        }
    }
    return headers;
}

Response.prototype.getResponse = function (xhr) {
    var respType = String(xhr.responseType).toLowerCase();
    if (respType === 'blob') return xhr.responseBlob || xhr.response;
    if (respType === 'arraybuffer') return xhr.response;
    return xhr.responseText;
}

Response.prototype.getHeader = function (key) {
    return this.headers[key.toLowerCase()];
};

Response.prototype.handle = function (res) {
    if (res.readyState === 2 && capable.status2) {
        try {
            this.statusCode = res.status;
            this.headers = parseHeaders(res);
        }
        catch (err) {
            capable.status2 = false;
        }
        
        if (capable.status2) {
            this.emit('ready');
        }
    }
    else if (capable.streaming && res.readyState === 3) {
        try {
            if (!this.statusCode) {
                this.statusCode = res.status;
                this.headers = parseHeaders(res);
                this.emit('ready');
            }
        }
        catch (err) {}
        
        try {
            this._emitData(res);
        }
        catch (err) {
            capable.streaming = false;
        }
    }
    else if (res.readyState === 4) {
        if (!this.statusCode) {
            this.statusCode = res.status;
            this.emit('ready');
        }
        this._emitData(res);
        
        if (res.error) {
            this.emit('error', this.getResponse(res));
        }
        else this.emit('end');
        
        this.emit('close');
    }
};

Response.prototype._emitData = function (res) {
    var respBody = this.getResponse(res);
    if (respBody.toString().match(/ArrayBuffer/)) {
        this.emit('data', new Uint8Array(respBody, this.offset));
        this.offset = respBody.byteLength;
        return;
    }
    if (respBody.length > this.offset) {
        this.emit('data', respBody.slice(this.offset));
        this.offset = respBody.length;
    }
};

var isArray = Array.isArray || function (xs) {
    return Object.prototype.toString.call(xs) === '[object Array]';
};

},{"stream":57,"util":66}],48:[function(require,module,exports){
;(function () {

  var object = typeof exports != 'undefined' ? exports : this; // #8: web workers
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

  function InvalidCharacterError(message) {
    this.message = message;
  }
  InvalidCharacterError.prototype = new Error;
  InvalidCharacterError.prototype.name = 'InvalidCharacterError';

  // encoder
  // [https://gist.github.com/999166] by [https://github.com/nignag]
  object.btoa || (
  object.btoa = function (input) {
    for (
      // initialize result and counter
      var block, charCode, idx = 0, map = chars, output = '';
      // if the next input index does not exist:
      //   change the mapping table to "="
      //   check if d has no fractional digits
      input.charAt(idx | 0) || (map = '=', idx % 1);
      // "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
      output += map.charAt(63 & block >> 8 - idx % 1 * 8)
    ) {
      charCode = input.charCodeAt(idx += 3/4);
      if (charCode > 0xFF) {
        throw new InvalidCharacterError("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
      }
      block = block << 8 | charCode;
    }
    return output;
  });

  // decoder
  // [https://gist.github.com/1020396] by [https://github.com/atk]
  object.atob || (
  object.atob = function (input) {
    input = input.replace(/=+$/, '')
    if (input.length % 4 == 1) {
      throw new InvalidCharacterError("'atob' failed: The string to be decoded is not correctly encoded.");
    }
    for (
      // initialize result and counters
      var bc = 0, bs, buffer, idx = 0, output = '';
      // get next character
      buffer = input.charAt(idx++);
      // character found in table? initialize bit storage and add its ascii value;
      ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
        // and if not first of each 4 characters,
        // convert the first 8 bits to one ascii character
        bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
    ) {
      // try to find character in table (0-63, not found => -1)
      buffer = chars.indexOf(buffer);
    }
    return output;
  });

}());

},{}],49:[function(require,module,exports){
var http = require('http');

var https = module.exports;

for (var key in http) {
    if (http.hasOwnProperty(key)) https[key] = http[key];
};

https.request = function (params, cb) {
    if (!params) params = {};
    params.scheme = 'https';
    return http.request.call(this, params, cb);
}

},{"http":45}],50:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],51:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],52:[function(require,module,exports){
(function (global){
/*! http://mths.be/punycode v1.2.4 by @mathias */
;(function(root) {

	/** Detect free variables */
	var freeExports = typeof exports == 'object' && exports;
	var freeModule = typeof module == 'object' && module &&
		module.exports == freeExports && module;
	var freeGlobal = typeof global == 'object' && global;
	if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
		root = freeGlobal;
	}

	/**
	 * The `punycode` object.
	 * @name punycode
	 * @type Object
	 */
	var punycode,

	/** Highest positive signed 32-bit float value */
	maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	tMin = 1,
	tMax = 26,
	skew = 38,
	damp = 700,
	initialBias = 72,
	initialN = 128, // 0x80
	delimiter = '-', // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	regexNonASCII = /[^ -~]/, // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /\x2E|\u3002|\uFF0E|\uFF61/g, // RFC 3490 separators

	/** Error messages */
	errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},

	/** Convenience shortcuts */
	baseMinusTMin = base - tMin,
	floor = Math.floor,
	stringFromCharCode = String.fromCharCode,

	/** Temporary variable */
	key;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
		throw RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
		var length = array.length;
		while (length--) {
			array[length] = fn(array[length]);
		}
		return array;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings.
	 * @private
	 * @param {String} domain The domain name.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
		return map(string.split(regexSeparators), fn).join('.');
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <http://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function ucs2encode(array) {
		return map(array, function(value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `base - 1`, or `base` if
	 * the code point does not represent a value.
	 */
	function basicToDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return base;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * http://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
			delta = floor(delta / baseMinusTMin);
		}
		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decode(input) {
		// Don't use UCS-2
		var output = [],
		    inputLength = input.length,
		    out,
		    i = 0,
		    n = initialN,
		    bias = initialBias,
		    basic,
		    j,
		    index,
		    oldi,
		    w,
		    k,
		    digit,
		    t,
		    /** Cached calculation results */
		    baseMinusT;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		basic = input.lastIndexOf(delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

				if (digit < t) {
					break;
				}

				baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) {
					error('overflow');
				}

				w *= baseMinusT;

			}

			out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (floor(i / out) > maxInt - n) {
				error('overflow');
			}

			n += floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output
			output.splice(i++, 0, n);

		}

		return ucs2encode(output);
	}

	/**
	 * Converts a string of Unicode symbols to a Punycode string of ASCII-only
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode(input) {
		var n,
		    delta,
		    handledCPCount,
		    basicLength,
		    bias,
		    j,
		    m,
		    q,
		    k,
		    t,
		    currentValue,
		    output = [],
		    /** `inputLength` will hold the number of code points in `input`. */
		    inputLength,
		    /** Cached calculation results */
		    handledCPCountPlusOne,
		    baseMinusT,
		    qMinusT;

		// Convert the input in UCS-2 to Unicode
		input = ucs2decode(input);

		// Cache the length
		inputLength = input.length;

		// Initialize the state
		n = initialN;
		delta = 0;
		bias = initialBias;

		// Handle the basic code points
		for (j = 0; j < inputLength; ++j) {
			currentValue = input[j];
			if (currentValue < 0x80) {
				output.push(stringFromCharCode(currentValue));
			}
		}

		handledCPCount = basicLength = output.length;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string - if it is not empty - with a delimiter
		if (basicLength) {
			output.push(delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			for (m = maxInt, j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow
			handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
				error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];

				if (currentValue < n && ++delta > maxInt) {
					error('overflow');
				}

				if (currentValue == n) {
					// Represent delta as a generalized variable-length integer
					for (q = delta, k = base; /* no condition */; k += base) {
						t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(
							stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
						);
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;

		}
		return output.join('');
	}

	/**
	 * Converts a Punycode string representing a domain name to Unicode. Only the
	 * Punycoded parts of the domain name will be converted, i.e. it doesn't
	 * matter if you call it on a string that has already been converted to
	 * Unicode.
	 * @memberOf punycode
	 * @param {String} domain The Punycode domain name to convert to Unicode.
	 * @returns {String} The Unicode representation of the given Punycode
	 * string.
	 */
	function toUnicode(domain) {
		return mapDomain(domain, function(string) {
			return regexPunycode.test(string)
				? decode(string.slice(4).toLowerCase())
				: string;
		});
	}

	/**
	 * Converts a Unicode string representing a domain name to Punycode. Only the
	 * non-ASCII parts of the domain name will be converted, i.e. it doesn't
	 * matter if you call it with a domain that's already in ASCII.
	 * @memberOf punycode
	 * @param {String} domain The domain name to convert, as a Unicode string.
	 * @returns {String} The Punycode representation of the given domain name.
	 */
	function toASCII(domain) {
		return mapDomain(domain, function(string) {
			return regexNonASCII.test(string)
				? 'xn--' + encode(string)
				: string;
		});
	}

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	punycode = {
		/**
		 * A string representing the current Punycode.js version number.
		 * @memberOf punycode
		 * @type String
		 */
		'version': '1.2.4',
		/**
		 * An object of methods to convert from JavaScript's internal character
		 * representation (UCS-2) to Unicode code points, and back.
		 * @see <http://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode
		 * @type Object
		 */
		'ucs2': {
			'decode': ucs2decode,
			'encode': ucs2encode
		},
		'decode': decode,
		'encode': encode,
		'toASCII': toASCII,
		'toUnicode': toUnicode
	};

	/** Expose `punycode` */
	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define('punycode', function() {
			return punycode;
		});
	} else if (freeExports && !freeExports.nodeType) {
		if (freeModule) { // in Node.js or RingoJS v0.8.0+
			freeModule.exports = punycode;
		} else { // in Narwhal or RingoJS v0.7.0-
			for (key in punycode) {
				punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
			}
		}
	} else { // in Rhino or a web browser
		root.punycode = punycode;
	}

}(this));

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],53:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

},{}],54:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return obj[k].map(function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};

},{}],55:[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":53,"./encode":54}],56:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a duplex stream is just a stream that is both readable and writable.
// Since JS doesn't have multiple prototypal inheritance, this class
// prototypally inherits from Readable, and then parasitically from
// Writable.

module.exports = Duplex;
var inherits = require('inherits');
var setImmediate = require('process/browser.js').nextTick;
var Readable = require('./readable.js');
var Writable = require('./writable.js');

inherits(Duplex, Readable);

Duplex.prototype.write = Writable.prototype.write;
Duplex.prototype.end = Writable.prototype.end;
Duplex.prototype._write = Writable.prototype._write;

function Duplex(options) {
  if (!(this instanceof Duplex))
    return new Duplex(options);

  Readable.call(this, options);
  Writable.call(this, options);

  if (options && options.readable === false)
    this.readable = false;

  if (options && options.writable === false)
    this.writable = false;

  this.allowHalfOpen = true;
  if (options && options.allowHalfOpen === false)
    this.allowHalfOpen = false;

  this.once('end', onend);
}

// the no-half-open enforcer
function onend() {
  // if we allow half-open state, or if the writable side ended,
  // then we're ok.
  if (this.allowHalfOpen || this._writableState.ended)
    return;

  // no more data can be written.
  // But allow more writes to happen in this tick.
  var self = this;
  setImmediate(function () {
    self.end();
  });
}

},{"./readable.js":60,"./writable.js":62,"inherits":50,"process/browser.js":58}],57:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

module.exports = Stream;

var EE = require('events').EventEmitter;
var inherits = require('inherits');

inherits(Stream, EE);
Stream.Readable = require('./readable.js');
Stream.Writable = require('./writable.js');
Stream.Duplex = require('./duplex.js');
Stream.Transform = require('./transform.js');
Stream.PassThrough = require('./passthrough.js');

// Backwards-compat with node 0.4.x
Stream.Stream = Stream;



// old-style streams.  Note that the pipe method (the only relevant
// part of this class) is overridden in the Readable class.

function Stream() {
  EE.call(this);
}

Stream.prototype.pipe = function(dest, options) {
  var source = this;

  function ondata(chunk) {
    if (dest.writable) {
      if (false === dest.write(chunk) && source.pause) {
        source.pause();
      }
    }
  }

  source.on('data', ondata);

  function ondrain() {
    if (source.readable && source.resume) {
      source.resume();
    }
  }

  dest.on('drain', ondrain);

  // If the 'end' option is not supplied, dest.end() will be called when
  // source gets the 'end' or 'close' events.  Only dest.end() once.
  if (!dest._isStdio && (!options || options.end !== false)) {
    source.on('end', onend);
    source.on('close', onclose);
  }

  var didOnEnd = false;
  function onend() {
    if (didOnEnd) return;
    didOnEnd = true;

    dest.end();
  }


  function onclose() {
    if (didOnEnd) return;
    didOnEnd = true;

    if (typeof dest.destroy === 'function') dest.destroy();
  }

  // don't leave dangling pipes when there are errors.
  function onerror(er) {
    cleanup();
    if (EE.listenerCount(this, 'error') === 0) {
      throw er; // Unhandled stream error in pipe.
    }
  }

  source.on('error', onerror);
  dest.on('error', onerror);

  // remove all the event listeners that were added.
  function cleanup() {
    source.removeListener('data', ondata);
    dest.removeListener('drain', ondrain);

    source.removeListener('end', onend);
    source.removeListener('close', onclose);

    source.removeListener('error', onerror);
    dest.removeListener('error', onerror);

    source.removeListener('end', cleanup);
    source.removeListener('close', cleanup);

    dest.removeListener('close', cleanup);
  }

  source.on('end', cleanup);
  source.on('close', cleanup);

  dest.on('close', cleanup);

  dest.emit('pipe', source);

  // Allow for unix-like usage: A.pipe(B).pipe(C)
  return dest;
};

},{"./duplex.js":56,"./passthrough.js":59,"./readable.js":60,"./transform.js":61,"./writable.js":62,"events":44,"inherits":50}],58:[function(require,module,exports){
module.exports=require(51)
},{}],59:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a passthrough stream.
// basically just the most minimal sort of Transform stream.
// Every written chunk gets output as-is.

module.exports = PassThrough;

var Transform = require('./transform.js');
var inherits = require('inherits');
inherits(PassThrough, Transform);

function PassThrough(options) {
  if (!(this instanceof PassThrough))
    return new PassThrough(options);

  Transform.call(this, options);
}

PassThrough.prototype._transform = function(chunk, encoding, cb) {
  cb(null, chunk);
};

},{"./transform.js":61,"inherits":50}],60:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

module.exports = Readable;
Readable.ReadableState = ReadableState;

var EE = require('events').EventEmitter;
var Stream = require('./index.js');
var Buffer = require('buffer').Buffer;
var setImmediate = require('process/browser.js').nextTick;
var StringDecoder;

var inherits = require('inherits');
inherits(Readable, Stream);

function ReadableState(options, stream) {
  options = options || {};

  // the point at which it stops calling _read() to fill the buffer
  // Note: 0 is a valid value, means "don't call _read preemptively ever"
  var hwm = options.highWaterMark;
  this.highWaterMark = (hwm || hwm === 0) ? hwm : 16 * 1024;

  // cast to ints.
  this.highWaterMark = ~~this.highWaterMark;

  this.buffer = [];
  this.length = 0;
  this.pipes = null;
  this.pipesCount = 0;
  this.flowing = false;
  this.ended = false;
  this.endEmitted = false;
  this.reading = false;

  // In streams that never have any data, and do push(null) right away,
  // the consumer can miss the 'end' event if they do some I/O before
  // consuming the stream.  So, we don't emit('end') until some reading
  // happens.
  this.calledRead = false;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, becuase any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // whenever we return null, then we set a flag to say
  // that we're awaiting a 'readable' event emission.
  this.needReadable = false;
  this.emittedReadable = false;
  this.readableListening = false;


  // object stream flag. Used to make read(n) ignore n and to
  // make all the buffer merging and length checks go away
  this.objectMode = !!options.objectMode;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // when piping, we only care about 'readable' events that happen
  // after read()ing all the bytes and not getting any pushback.
  this.ranOut = false;

  // the number of writers that are awaiting a drain event in .pipe()s
  this.awaitDrain = 0;

  // if true, a maybeReadMore has been scheduled
  this.readingMore = false;

  this.decoder = null;
  this.encoding = null;
  if (options.encoding) {
    if (!StringDecoder)
      StringDecoder = require('string_decoder').StringDecoder;
    this.decoder = new StringDecoder(options.encoding);
    this.encoding = options.encoding;
  }
}

function Readable(options) {
  if (!(this instanceof Readable))
    return new Readable(options);

  this._readableState = new ReadableState(options, this);

  // legacy
  this.readable = true;

  Stream.call(this);
}

// Manually shove something into the read() buffer.
// This returns true if the highWaterMark has not been hit yet,
// similar to how Writable.write() returns true if you should
// write() some more.
Readable.prototype.push = function(chunk, encoding) {
  var state = this._readableState;

  if (typeof chunk === 'string' && !state.objectMode) {
    encoding = encoding || state.defaultEncoding;
    if (encoding !== state.encoding) {
      chunk = new Buffer(chunk, encoding);
      encoding = '';
    }
  }

  return readableAddChunk(this, state, chunk, encoding, false);
};

// Unshift should *always* be something directly out of read()
Readable.prototype.unshift = function(chunk) {
  var state = this._readableState;
  return readableAddChunk(this, state, chunk, '', true);
};

function readableAddChunk(stream, state, chunk, encoding, addToFront) {
  var er = chunkInvalid(state, chunk);
  if (er) {
    stream.emit('error', er);
  } else if (chunk === null || chunk === undefined) {
    state.reading = false;
    if (!state.ended)
      onEofChunk(stream, state);
  } else if (state.objectMode || chunk && chunk.length > 0) {
    if (state.ended && !addToFront) {
      var e = new Error('stream.push() after EOF');
      stream.emit('error', e);
    } else if (state.endEmitted && addToFront) {
      var e = new Error('stream.unshift() after end event');
      stream.emit('error', e);
    } else {
      if (state.decoder && !addToFront && !encoding)
        chunk = state.decoder.write(chunk);

      // update the buffer info.
      state.length += state.objectMode ? 1 : chunk.length;
      if (addToFront) {
        state.buffer.unshift(chunk);
      } else {
        state.reading = false;
        state.buffer.push(chunk);
      }

      if (state.needReadable)
        emitReadable(stream);

      maybeReadMore(stream, state);
    }
  } else if (!addToFront) {
    state.reading = false;
  }

  return needMoreData(state);
}



// if it's past the high water mark, we can push in some more.
// Also, if we have no data yet, we can stand some
// more bytes.  This is to work around cases where hwm=0,
// such as the repl.  Also, if the push() triggered a
// readable event, and the user called read(largeNumber) such that
// needReadable was set, then we ought to push more, so that another
// 'readable' event will be triggered.
function needMoreData(state) {
  return !state.ended &&
         (state.needReadable ||
          state.length < state.highWaterMark ||
          state.length === 0);
}

// backwards compatibility.
Readable.prototype.setEncoding = function(enc) {
  if (!StringDecoder)
    StringDecoder = require('string_decoder').StringDecoder;
  this._readableState.decoder = new StringDecoder(enc);
  this._readableState.encoding = enc;
};

// Don't raise the hwm > 128MB
var MAX_HWM = 0x800000;
function roundUpToNextPowerOf2(n) {
  if (n >= MAX_HWM) {
    n = MAX_HWM;
  } else {
    // Get the next highest power of 2
    n--;
    for (var p = 1; p < 32; p <<= 1) n |= n >> p;
    n++;
  }
  return n;
}

function howMuchToRead(n, state) {
  if (state.length === 0 && state.ended)
    return 0;

  if (state.objectMode)
    return n === 0 ? 0 : 1;

  if (isNaN(n) || n === null) {
    // only flow one buffer at a time
    if (state.flowing && state.buffer.length)
      return state.buffer[0].length;
    else
      return state.length;
  }

  if (n <= 0)
    return 0;

  // If we're asking for more than the target buffer level,
  // then raise the water mark.  Bump up to the next highest
  // power of 2, to prevent increasing it excessively in tiny
  // amounts.
  if (n > state.highWaterMark)
    state.highWaterMark = roundUpToNextPowerOf2(n);

  // don't have that much.  return null, unless we've ended.
  if (n > state.length) {
    if (!state.ended) {
      state.needReadable = true;
      return 0;
    } else
      return state.length;
  }

  return n;
}

// you can override either this method, or the async _read(n) below.
Readable.prototype.read = function(n) {
  var state = this._readableState;
  state.calledRead = true;
  var nOrig = n;

  if (typeof n !== 'number' || n > 0)
    state.emittedReadable = false;

  // if we're doing read(0) to trigger a readable event, but we
  // already have a bunch of data in the buffer, then just trigger
  // the 'readable' event and move on.
  if (n === 0 &&
      state.needReadable &&
      (state.length >= state.highWaterMark || state.ended)) {
    emitReadable(this);
    return null;
  }

  n = howMuchToRead(n, state);

  // if we've ended, and we're now clear, then finish it up.
  if (n === 0 && state.ended) {
    if (state.length === 0)
      endReadable(this);
    return null;
  }

  // All the actual chunk generation logic needs to be
  // *below* the call to _read.  The reason is that in certain
  // synthetic stream cases, such as passthrough streams, _read
  // may be a completely synchronous operation which may change
  // the state of the read buffer, providing enough data when
  // before there was *not* enough.
  //
  // So, the steps are:
  // 1. Figure out what the state of things will be after we do
  // a read from the buffer.
  //
  // 2. If that resulting state will trigger a _read, then call _read.
  // Note that this may be asynchronous, or synchronous.  Yes, it is
  // deeply ugly to write APIs this way, but that still doesn't mean
  // that the Readable class should behave improperly, as streams are
  // designed to be sync/async agnostic.
  // Take note if the _read call is sync or async (ie, if the read call
  // has returned yet), so that we know whether or not it's safe to emit
  // 'readable' etc.
  //
  // 3. Actually pull the requested chunks out of the buffer and return.

  // if we need a readable event, then we need to do some reading.
  var doRead = state.needReadable;

  // if we currently have less than the highWaterMark, then also read some
  if (state.length - n <= state.highWaterMark)
    doRead = true;

  // however, if we've ended, then there's no point, and if we're already
  // reading, then it's unnecessary.
  if (state.ended || state.reading)
    doRead = false;

  if (doRead) {
    state.reading = true;
    state.sync = true;
    // if the length is currently zero, then we *need* a readable event.
    if (state.length === 0)
      state.needReadable = true;
    // call internal read method
    this._read(state.highWaterMark);
    state.sync = false;
  }

  // If _read called its callback synchronously, then `reading`
  // will be false, and we need to re-evaluate how much data we
  // can return to the user.
  if (doRead && !state.reading)
    n = howMuchToRead(nOrig, state);

  var ret;
  if (n > 0)
    ret = fromList(n, state);
  else
    ret = null;

  if (ret === null) {
    state.needReadable = true;
    n = 0;
  }

  state.length -= n;

  // If we have nothing in the buffer, then we want to know
  // as soon as we *do* get something into the buffer.
  if (state.length === 0 && !state.ended)
    state.needReadable = true;

  // If we happened to read() exactly the remaining amount in the
  // buffer, and the EOF has been seen at this point, then make sure
  // that we emit 'end' on the very next tick.
  if (state.ended && !state.endEmitted && state.length === 0)
    endReadable(this);

  return ret;
};

function chunkInvalid(state, chunk) {
  var er = null;
  if (!Buffer.isBuffer(chunk) &&
      'string' !== typeof chunk &&
      chunk !== null &&
      chunk !== undefined &&
      !state.objectMode &&
      !er) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  return er;
}


function onEofChunk(stream, state) {
  if (state.decoder && !state.ended) {
    var chunk = state.decoder.end();
    if (chunk && chunk.length) {
      state.buffer.push(chunk);
      state.length += state.objectMode ? 1 : chunk.length;
    }
  }
  state.ended = true;

  // if we've ended and we have some data left, then emit
  // 'readable' now to make sure it gets picked up.
  if (state.length > 0)
    emitReadable(stream);
  else
    endReadable(stream);
}

// Don't emit readable right away in sync mode, because this can trigger
// another read() call => stack overflow.  This way, it might trigger
// a nextTick recursion warning, but that's not so bad.
function emitReadable(stream) {
  var state = stream._readableState;
  state.needReadable = false;
  if (state.emittedReadable)
    return;

  state.emittedReadable = true;
  if (state.sync)
    setImmediate(function() {
      emitReadable_(stream);
    });
  else
    emitReadable_(stream);
}

function emitReadable_(stream) {
  stream.emit('readable');
}


// at this point, the user has presumably seen the 'readable' event,
// and called read() to consume some data.  that may have triggered
// in turn another _read(n) call, in which case reading = true if
// it's in progress.
// However, if we're not ended, or reading, and the length < hwm,
// then go ahead and try to read some more preemptively.
function maybeReadMore(stream, state) {
  if (!state.readingMore) {
    state.readingMore = true;
    setImmediate(function() {
      maybeReadMore_(stream, state);
    });
  }
}

function maybeReadMore_(stream, state) {
  var len = state.length;
  while (!state.reading && !state.flowing && !state.ended &&
         state.length < state.highWaterMark) {
    stream.read(0);
    if (len === state.length)
      // didn't get any data, stop spinning.
      break;
    else
      len = state.length;
  }
  state.readingMore = false;
}

// abstract method.  to be overridden in specific implementation classes.
// call cb(er, data) where data is <= n in length.
// for virtual (non-string, non-buffer) streams, "length" is somewhat
// arbitrary, and perhaps not very meaningful.
Readable.prototype._read = function(n) {
  this.emit('error', new Error('not implemented'));
};

Readable.prototype.pipe = function(dest, pipeOpts) {
  var src = this;
  var state = this._readableState;

  switch (state.pipesCount) {
    case 0:
      state.pipes = dest;
      break;
    case 1:
      state.pipes = [state.pipes, dest];
      break;
    default:
      state.pipes.push(dest);
      break;
  }
  state.pipesCount += 1;

  var doEnd = (!pipeOpts || pipeOpts.end !== false) &&
              dest !== process.stdout &&
              dest !== process.stderr;

  var endFn = doEnd ? onend : cleanup;
  if (state.endEmitted)
    setImmediate(endFn);
  else
    src.once('end', endFn);

  dest.on('unpipe', onunpipe);
  function onunpipe(readable) {
    if (readable !== src) return;
    cleanup();
  }

  function onend() {
    dest.end();
  }

  // when the dest drains, it reduces the awaitDrain counter
  // on the source.  This would be more elegant with a .once()
  // handler in flow(), but adding and removing repeatedly is
  // too slow.
  var ondrain = pipeOnDrain(src);
  dest.on('drain', ondrain);

  function cleanup() {
    // cleanup event handlers once the pipe is broken
    dest.removeListener('close', onclose);
    dest.removeListener('finish', onfinish);
    dest.removeListener('drain', ondrain);
    dest.removeListener('error', onerror);
    dest.removeListener('unpipe', onunpipe);
    src.removeListener('end', onend);
    src.removeListener('end', cleanup);

    // if the reader is waiting for a drain event from this
    // specific writer, then it would cause it to never start
    // flowing again.
    // So, if this is awaiting a drain, then we just call it now.
    // If we don't know, then assume that we are waiting for one.
    if (!dest._writableState || dest._writableState.needDrain)
      ondrain();
  }

  // if the dest has an error, then stop piping into it.
  // however, don't suppress the throwing behavior for this.
  // check for listeners before emit removes one-time listeners.
  var errListeners = EE.listenerCount(dest, 'error');
  function onerror(er) {
    unpipe();
    if (errListeners === 0 && EE.listenerCount(dest, 'error') === 0)
      dest.emit('error', er);
  }
  dest.once('error', onerror);

  // Both close and finish should trigger unpipe, but only once.
  function onclose() {
    dest.removeListener('finish', onfinish);
    unpipe();
  }
  dest.once('close', onclose);
  function onfinish() {
    dest.removeListener('close', onclose);
    unpipe();
  }
  dest.once('finish', onfinish);

  function unpipe() {
    src.unpipe(dest);
  }

  // tell the dest that it's being piped to
  dest.emit('pipe', src);

  // start the flow if it hasn't been started already.
  if (!state.flowing) {
    // the handler that waits for readable events after all
    // the data gets sucked out in flow.
    // This would be easier to follow with a .once() handler
    // in flow(), but that is too slow.
    this.on('readable', pipeOnReadable);

    state.flowing = true;
    setImmediate(function() {
      flow(src);
    });
  }

  return dest;
};

function pipeOnDrain(src) {
  return function() {
    var dest = this;
    var state = src._readableState;
    state.awaitDrain--;
    if (state.awaitDrain === 0)
      flow(src);
  };
}

function flow(src) {
  var state = src._readableState;
  var chunk;
  state.awaitDrain = 0;

  function write(dest, i, list) {
    var written = dest.write(chunk);
    if (false === written) {
      state.awaitDrain++;
    }
  }

  while (state.pipesCount && null !== (chunk = src.read())) {

    if (state.pipesCount === 1)
      write(state.pipes, 0, null);
    else
      forEach(state.pipes, write);

    src.emit('data', chunk);

    // if anyone needs a drain, then we have to wait for that.
    if (state.awaitDrain > 0)
      return;
  }

  // if every destination was unpiped, either before entering this
  // function, or in the while loop, then stop flowing.
  //
  // NB: This is a pretty rare edge case.
  if (state.pipesCount === 0) {
    state.flowing = false;

    // if there were data event listeners added, then switch to old mode.
    if (EE.listenerCount(src, 'data') > 0)
      emitDataEvents(src);
    return;
  }

  // at this point, no one needed a drain, so we just ran out of data
  // on the next readable event, start it over again.
  state.ranOut = true;
}

function pipeOnReadable() {
  if (this._readableState.ranOut) {
    this._readableState.ranOut = false;
    flow(this);
  }
}


Readable.prototype.unpipe = function(dest) {
  var state = this._readableState;

  // if we're not piping anywhere, then do nothing.
  if (state.pipesCount === 0)
    return this;

  // just one destination.  most common case.
  if (state.pipesCount === 1) {
    // passed in one, but it's not the right one.
    if (dest && dest !== state.pipes)
      return this;

    if (!dest)
      dest = state.pipes;

    // got a match.
    state.pipes = null;
    state.pipesCount = 0;
    this.removeListener('readable', pipeOnReadable);
    state.flowing = false;
    if (dest)
      dest.emit('unpipe', this);
    return this;
  }

  // slow case. multiple pipe destinations.

  if (!dest) {
    // remove all.
    var dests = state.pipes;
    var len = state.pipesCount;
    state.pipes = null;
    state.pipesCount = 0;
    this.removeListener('readable', pipeOnReadable);
    state.flowing = false;

    for (var i = 0; i < len; i++)
      dests[i].emit('unpipe', this);
    return this;
  }

  // try to find the right one.
  var i = indexOf(state.pipes, dest);
  if (i === -1)
    return this;

  state.pipes.splice(i, 1);
  state.pipesCount -= 1;
  if (state.pipesCount === 1)
    state.pipes = state.pipes[0];

  dest.emit('unpipe', this);

  return this;
};

// set up data events if they are asked for
// Ensure readable listeners eventually get something
Readable.prototype.on = function(ev, fn) {
  var res = Stream.prototype.on.call(this, ev, fn);

  if (ev === 'data' && !this._readableState.flowing)
    emitDataEvents(this);

  if (ev === 'readable' && this.readable) {
    var state = this._readableState;
    if (!state.readableListening) {
      state.readableListening = true;
      state.emittedReadable = false;
      state.needReadable = true;
      if (!state.reading) {
        this.read(0);
      } else if (state.length) {
        emitReadable(this, state);
      }
    }
  }

  return res;
};
Readable.prototype.addListener = Readable.prototype.on;

// pause() and resume() are remnants of the legacy readable stream API
// If the user uses them, then switch into old mode.
Readable.prototype.resume = function() {
  emitDataEvents(this);
  this.read(0);
  this.emit('resume');
};

Readable.prototype.pause = function() {
  emitDataEvents(this, true);
  this.emit('pause');
};

function emitDataEvents(stream, startPaused) {
  var state = stream._readableState;

  if (state.flowing) {
    // https://github.com/isaacs/readable-stream/issues/16
    throw new Error('Cannot switch to old mode now.');
  }

  var paused = startPaused || false;
  var readable = false;

  // convert to an old-style stream.
  stream.readable = true;
  stream.pipe = Stream.prototype.pipe;
  stream.on = stream.addListener = Stream.prototype.on;

  stream.on('readable', function() {
    readable = true;

    var c;
    while (!paused && (null !== (c = stream.read())))
      stream.emit('data', c);

    if (c === null) {
      readable = false;
      stream._readableState.needReadable = true;
    }
  });

  stream.pause = function() {
    paused = true;
    this.emit('pause');
  };

  stream.resume = function() {
    paused = false;
    if (readable)
      setImmediate(function() {
        stream.emit('readable');
      });
    else
      this.read(0);
    this.emit('resume');
  };

  // now make it start, just in case it hadn't already.
  stream.emit('readable');
}

// wrap an old-style stream as the async data source.
// This is *not* part of the readable stream interface.
// It is an ugly unfortunate mess of history.
Readable.prototype.wrap = function(stream) {
  var state = this._readableState;
  var paused = false;

  var self = this;
  stream.on('end', function() {
    if (state.decoder && !state.ended) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length)
        self.push(chunk);
    }

    self.push(null);
  });

  stream.on('data', function(chunk) {
    if (state.decoder)
      chunk = state.decoder.write(chunk);
    if (!chunk || !state.objectMode && !chunk.length)
      return;

    var ret = self.push(chunk);
    if (!ret) {
      paused = true;
      stream.pause();
    }
  });

  // proxy all the other methods.
  // important when wrapping filters and duplexes.
  for (var i in stream) {
    if (typeof stream[i] === 'function' &&
        typeof this[i] === 'undefined') {
      this[i] = function(method) { return function() {
        return stream[method].apply(stream, arguments);
      }}(i);
    }
  }

  // proxy certain important events.
  var events = ['error', 'close', 'destroy', 'pause', 'resume'];
  forEach(events, function(ev) {
    stream.on(ev, function (x) {
      return self.emit.apply(self, ev, x);
    });
  });

  // when we try to consume some more bytes, simply unpause the
  // underlying stream.
  self._read = function(n) {
    if (paused) {
      paused = false;
      stream.resume();
    }
  };

  return self;
};



// exposed for testing purposes only.
Readable._fromList = fromList;

// Pluck off n bytes from an array of buffers.
// Length is the combined lengths of all the buffers in the list.
function fromList(n, state) {
  var list = state.buffer;
  var length = state.length;
  var stringMode = !!state.decoder;
  var objectMode = !!state.objectMode;
  var ret;

  // nothing in the list, definitely empty.
  if (list.length === 0)
    return null;

  if (length === 0)
    ret = null;
  else if (objectMode)
    ret = list.shift();
  else if (!n || n >= length) {
    // read it all, truncate the array.
    if (stringMode)
      ret = list.join('');
    else
      ret = Buffer.concat(list, length);
    list.length = 0;
  } else {
    // read just some of it.
    if (n < list[0].length) {
      // just take a part of the first list item.
      // slice is the same for buffers and strings.
      var buf = list[0];
      ret = buf.slice(0, n);
      list[0] = buf.slice(n);
    } else if (n === list[0].length) {
      // first list is a perfect match
      ret = list.shift();
    } else {
      // complex case.
      // we have enough to cover it, but it spans past the first buffer.
      if (stringMode)
        ret = '';
      else
        ret = new Buffer(n);

      var c = 0;
      for (var i = 0, l = list.length; i < l && c < n; i++) {
        var buf = list[0];
        var cpy = Math.min(n - c, buf.length);

        if (stringMode)
          ret += buf.slice(0, cpy);
        else
          buf.copy(ret, c, 0, cpy);

        if (cpy < buf.length)
          list[0] = buf.slice(cpy);
        else
          list.shift();

        c += cpy;
      }
    }
  }

  return ret;
}

function endReadable(stream) {
  var state = stream._readableState;

  // If we get here before consuming all the bytes, then that is a
  // bug in node.  Should never happen.
  if (state.length > 0)
    throw new Error('endReadable called on non-empty stream');

  if (!state.endEmitted && state.calledRead) {
    state.ended = true;
    setImmediate(function() {
      // Check that we didn't get one last unshift.
      if (!state.endEmitted && state.length === 0) {
        state.endEmitted = true;
        stream.readable = false;
        stream.emit('end');
      }
    });
  }
}

function forEach (xs, f) {
  for (var i = 0, l = xs.length; i < l; i++) {
    f(xs[i], i);
  }
}

function indexOf (xs, x) {
  for (var i = 0, l = xs.length; i < l; i++) {
    if (xs[i] === x) return i;
  }
  return -1;
}

}).call(this,require("/usr/local/share/npm/lib/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js"))
},{"./index.js":57,"/usr/local/share/npm/lib/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js":51,"buffer":41,"events":44,"inherits":50,"process/browser.js":58,"string_decoder":63}],61:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a transform stream is a readable/writable stream where you do
// something with the data.  Sometimes it's called a "filter",
// but that's not a great name for it, since that implies a thing where
// some bits pass through, and others are simply ignored.  (That would
// be a valid example of a transform, of course.)
//
// While the output is causally related to the input, it's not a
// necessarily symmetric or synchronous transformation.  For example,
// a zlib stream might take multiple plain-text writes(), and then
// emit a single compressed chunk some time in the future.
//
// Here's how this works:
//
// The Transform stream has all the aspects of the readable and writable
// stream classes.  When you write(chunk), that calls _write(chunk,cb)
// internally, and returns false if there's a lot of pending writes
// buffered up.  When you call read(), that calls _read(n) until
// there's enough pending readable data buffered up.
//
// In a transform stream, the written data is placed in a buffer.  When
// _read(n) is called, it transforms the queued up data, calling the
// buffered _write cb's as it consumes chunks.  If consuming a single
// written chunk would result in multiple output chunks, then the first
// outputted bit calls the readcb, and subsequent chunks just go into
// the read buffer, and will cause it to emit 'readable' if necessary.
//
// This way, back-pressure is actually determined by the reading side,
// since _read has to be called to start processing a new chunk.  However,
// a pathological inflate type of transform can cause excessive buffering
// here.  For example, imagine a stream where every byte of input is
// interpreted as an integer from 0-255, and then results in that many
// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
// 1kb of data being output.  In this case, you could write a very small
// amount of input, and end up with a very large amount of output.  In
// such a pathological inflating mechanism, there'd be no way to tell
// the system to stop doing the transform.  A single 4MB write could
// cause the system to run out of memory.
//
// However, even in such a pathological case, only a single written chunk
// would be consumed, and then the rest would wait (un-transformed) until
// the results of the previous transformed chunk were consumed.

module.exports = Transform;

var Duplex = require('./duplex.js');
var inherits = require('inherits');
inherits(Transform, Duplex);


function TransformState(options, stream) {
  this.afterTransform = function(er, data) {
    return afterTransform(stream, er, data);
  };

  this.needTransform = false;
  this.transforming = false;
  this.writecb = null;
  this.writechunk = null;
}

function afterTransform(stream, er, data) {
  var ts = stream._transformState;
  ts.transforming = false;

  var cb = ts.writecb;

  if (!cb)
    return stream.emit('error', new Error('no writecb in Transform class'));

  ts.writechunk = null;
  ts.writecb = null;

  if (data !== null && data !== undefined)
    stream.push(data);

  if (cb)
    cb(er);

  var rs = stream._readableState;
  rs.reading = false;
  if (rs.needReadable || rs.length < rs.highWaterMark) {
    stream._read(rs.highWaterMark);
  }
}


function Transform(options) {
  if (!(this instanceof Transform))
    return new Transform(options);

  Duplex.call(this, options);

  var ts = this._transformState = new TransformState(options, this);

  // when the writable side finishes, then flush out anything remaining.
  var stream = this;

  // start out asking for a readable event once data is transformed.
  this._readableState.needReadable = true;

  // we have implemented the _read method, and done the other things
  // that Readable wants before the first _read call, so unset the
  // sync guard flag.
  this._readableState.sync = false;

  this.once('finish', function() {
    if ('function' === typeof this._flush)
      this._flush(function(er) {
        done(stream, er);
      });
    else
      done(stream);
  });
}

Transform.prototype.push = function(chunk, encoding) {
  this._transformState.needTransform = false;
  return Duplex.prototype.push.call(this, chunk, encoding);
};

// This is the part where you do stuff!
// override this function in implementation classes.
// 'chunk' is an input chunk.
//
// Call `push(newChunk)` to pass along transformed output
// to the readable side.  You may call 'push' zero or more times.
//
// Call `cb(err)` when you are done with this chunk.  If you pass
// an error, then that'll put the hurt on the whole operation.  If you
// never call cb(), then you'll never get another chunk.
Transform.prototype._transform = function(chunk, encoding, cb) {
  throw new Error('not implemented');
};

Transform.prototype._write = function(chunk, encoding, cb) {
  var ts = this._transformState;
  ts.writecb = cb;
  ts.writechunk = chunk;
  ts.writeencoding = encoding;
  if (!ts.transforming) {
    var rs = this._readableState;
    if (ts.needTransform ||
        rs.needReadable ||
        rs.length < rs.highWaterMark)
      this._read(rs.highWaterMark);
  }
};

// Doesn't matter what the args are here.
// _transform does all the work.
// That we got here means that the readable side wants more data.
Transform.prototype._read = function(n) {
  var ts = this._transformState;

  if (ts.writechunk && ts.writecb && !ts.transforming) {
    ts.transforming = true;
    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
  } else {
    // mark that we need a transform, so that any data that comes in
    // will get processed, now that we've asked for it.
    ts.needTransform = true;
  }
};


function done(stream, er) {
  if (er)
    return stream.emit('error', er);

  // if there's nothing in the write buffer, then that means
  // that nothing more will ever be provided
  var ws = stream._writableState;
  var rs = stream._readableState;
  var ts = stream._transformState;

  if (ws.length)
    throw new Error('calling transform done when ws.length != 0');

  if (ts.transforming)
    throw new Error('calling transform done when still transforming');

  return stream.push(null);
}

},{"./duplex.js":56,"inherits":50}],62:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// A bit simpler than readable streams.
// Implement an async ._write(chunk, cb), and it'll handle all
// the drain event emission and buffering.

module.exports = Writable;
Writable.WritableState = WritableState;

var isUint8Array = typeof Uint8Array !== 'undefined'
  ? function (x) { return x instanceof Uint8Array }
  : function (x) {
    return x && x.constructor && x.constructor.name === 'Uint8Array'
  }
;
var isArrayBuffer = typeof ArrayBuffer !== 'undefined'
  ? function (x) { return x instanceof ArrayBuffer }
  : function (x) {
    return x && x.constructor && x.constructor.name === 'ArrayBuffer'
  }
;

var inherits = require('inherits');
var Stream = require('./index.js');
var setImmediate = require('process/browser.js').nextTick;
var Buffer = require('buffer').Buffer;

inherits(Writable, Stream);

function WriteReq(chunk, encoding, cb) {
  this.chunk = chunk;
  this.encoding = encoding;
  this.callback = cb;
}

function WritableState(options, stream) {
  options = options || {};

  // the point at which write() starts returning false
  // Note: 0 is a valid value, means that we always return false if
  // the entire buffer is not flushed immediately on write()
  var hwm = options.highWaterMark;
  this.highWaterMark = (hwm || hwm === 0) ? hwm : 16 * 1024;

  // object stream flag to indicate whether or not this stream
  // contains buffers or objects.
  this.objectMode = !!options.objectMode;

  // cast to ints.
  this.highWaterMark = ~~this.highWaterMark;

  this.needDrain = false;
  // at the start of calling end()
  this.ending = false;
  // when end() has been called, and returned
  this.ended = false;
  // when 'finish' is emitted
  this.finished = false;

  // should we decode strings into buffers before passing to _write?
  // this is here so that some node-core streams can optimize string
  // handling at a lower level.
  var noDecode = options.decodeStrings === false;
  this.decodeStrings = !noDecode;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // not an actual buffer we keep track of, but a measurement
  // of how much we're waiting to get pushed to some underlying
  // socket or file.
  this.length = 0;

  // a flag to see when we're in the middle of a write.
  this.writing = false;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, becuase any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // a flag to know if we're processing previously buffered items, which
  // may call the _write() callback in the same tick, so that we don't
  // end up in an overlapped onwrite situation.
  this.bufferProcessing = false;

  // the callback that's passed to _write(chunk,cb)
  this.onwrite = function(er) {
    onwrite(stream, er);
  };

  // the callback that the user supplies to write(chunk,encoding,cb)
  this.writecb = null;

  // the amount that is being written when _write is called.
  this.writelen = 0;

  this.buffer = [];
}

function Writable(options) {
  // Writable ctor is applied to Duplexes, though they're not
  // instanceof Writable, they're instanceof Readable.
  if (!(this instanceof Writable) && !(this instanceof Stream.Duplex))
    return new Writable(options);

  this._writableState = new WritableState(options, this);

  // legacy.
  this.writable = true;

  Stream.call(this);
}

// Otherwise people can pipe Writable streams, which is just wrong.
Writable.prototype.pipe = function() {
  this.emit('error', new Error('Cannot pipe. Not readable.'));
};


function writeAfterEnd(stream, state, cb) {
  var er = new Error('write after end');
  // TODO: defer error events consistently everywhere, not just the cb
  stream.emit('error', er);
  setImmediate(function() {
    cb(er);
  });
}

// If we get something that is not a buffer, string, null, or undefined,
// and we're not in objectMode, then that's an error.
// Otherwise stream chunks are all considered to be of length=1, and the
// watermarks determine how many objects to keep in the buffer, rather than
// how many bytes or characters.
function validChunk(stream, state, chunk, cb) {
  var valid = true;
  if (!Buffer.isBuffer(chunk) &&
      'string' !== typeof chunk &&
      chunk !== null &&
      chunk !== undefined &&
      !state.objectMode) {
    var er = new TypeError('Invalid non-string/buffer chunk');
    stream.emit('error', er);
    setImmediate(function() {
      cb(er);
    });
    valid = false;
  }
  return valid;
}

Writable.prototype.write = function(chunk, encoding, cb) {
  var state = this._writableState;
  var ret = false;

  if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (!Buffer.isBuffer(chunk) && isUint8Array(chunk))
    chunk = new Buffer(chunk);
  if (isArrayBuffer(chunk) && typeof Uint8Array !== 'undefined')
    chunk = new Buffer(new Uint8Array(chunk));
  
  if (Buffer.isBuffer(chunk))
    encoding = 'buffer';
  else if (!encoding)
    encoding = state.defaultEncoding;

  if (typeof cb !== 'function')
    cb = function() {};

  if (state.ended)
    writeAfterEnd(this, state, cb);
  else if (validChunk(this, state, chunk, cb))
    ret = writeOrBuffer(this, state, chunk, encoding, cb);

  return ret;
};

function decodeChunk(state, chunk, encoding) {
  if (!state.objectMode &&
      state.decodeStrings !== false &&
      typeof chunk === 'string') {
    chunk = new Buffer(chunk, encoding);
  }
  return chunk;
}

// if we're already writing something, then just put this
// in the queue, and wait our turn.  Otherwise, call _write
// If we return false, then we need a drain event, so set that flag.
function writeOrBuffer(stream, state, chunk, encoding, cb) {
  chunk = decodeChunk(state, chunk, encoding);
  var len = state.objectMode ? 1 : chunk.length;

  state.length += len;

  var ret = state.length < state.highWaterMark;
  state.needDrain = !ret;

  if (state.writing)
    state.buffer.push(new WriteReq(chunk, encoding, cb));
  else
    doWrite(stream, state, len, chunk, encoding, cb);

  return ret;
}

function doWrite(stream, state, len, chunk, encoding, cb) {
  state.writelen = len;
  state.writecb = cb;
  state.writing = true;
  state.sync = true;
  stream._write(chunk, encoding, state.onwrite);
  state.sync = false;
}

function onwriteError(stream, state, sync, er, cb) {
  if (sync)
    setImmediate(function() {
      cb(er);
    });
  else
    cb(er);

  stream.emit('error', er);
}

function onwriteStateUpdate(state) {
  state.writing = false;
  state.writecb = null;
  state.length -= state.writelen;
  state.writelen = 0;
}

function onwrite(stream, er) {
  var state = stream._writableState;
  var sync = state.sync;
  var cb = state.writecb;

  onwriteStateUpdate(state);

  if (er)
    onwriteError(stream, state, sync, er, cb);
  else {
    // Check if we're actually ready to finish, but don't emit yet
    var finished = needFinish(stream, state);

    if (!finished && !state.bufferProcessing && state.buffer.length)
      clearBuffer(stream, state);

    if (sync) {
      setImmediate(function() {
        afterWrite(stream, state, finished, cb);
      });
    } else {
      afterWrite(stream, state, finished, cb);
    }
  }
}

function afterWrite(stream, state, finished, cb) {
  if (!finished)
    onwriteDrain(stream, state);
  cb();
  if (finished)
    finishMaybe(stream, state);
}

// Must force callback to be called on nextTick, so that we don't
// emit 'drain' before the write() consumer gets the 'false' return
// value, and has a chance to attach a 'drain' listener.
function onwriteDrain(stream, state) {
  if (state.length === 0 && state.needDrain) {
    state.needDrain = false;
    stream.emit('drain');
  }
}


// if there's something in the buffer waiting, then process it
function clearBuffer(stream, state) {
  state.bufferProcessing = true;

  for (var c = 0; c < state.buffer.length; c++) {
    var entry = state.buffer[c];
    var chunk = entry.chunk;
    var encoding = entry.encoding;
    var cb = entry.callback;
    var len = state.objectMode ? 1 : chunk.length;

    doWrite(stream, state, len, chunk, encoding, cb);

    // if we didn't call the onwrite immediately, then
    // it means that we need to wait until it does.
    // also, that means that the chunk and cb are currently
    // being processed, so move the buffer counter past them.
    if (state.writing) {
      c++;
      break;
    }
  }

  state.bufferProcessing = false;
  if (c < state.buffer.length)
    state.buffer = state.buffer.slice(c);
  else
    state.buffer.length = 0;
}

Writable.prototype._write = function(chunk, encoding, cb) {
  cb(new Error('not implemented'));
};

Writable.prototype.end = function(chunk, encoding, cb) {
  var state = this._writableState;

  if (typeof chunk === 'function') {
    cb = chunk;
    chunk = null;
    encoding = null;
  } else if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (typeof chunk !== 'undefined' && chunk !== null)
    this.write(chunk, encoding);

  // ignore unnecessary end() calls.
  if (!state.ending && !state.finished)
    endWritable(this, state, cb);
};


function needFinish(stream, state) {
  return (state.ending &&
          state.length === 0 &&
          !state.finished &&
          !state.writing);
}

function finishMaybe(stream, state) {
  var need = needFinish(stream, state);
  if (need) {
    state.finished = true;
    stream.emit('finish');
  }
  return need;
}

function endWritable(stream, state, cb) {
  state.ending = true;
  finishMaybe(stream, state);
  if (cb) {
    if (state.finished)
      setImmediate(cb);
    else
      stream.once('finish', cb);
  }
  state.ended = true;
}

},{"./index.js":57,"buffer":41,"inherits":50,"process/browser.js":58}],63:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var Buffer = require('buffer').Buffer;

function assertEncoding(encoding) {
  if (encoding && !Buffer.isEncoding(encoding)) {
    throw new Error('Unknown encoding: ' + encoding);
  }
}

var StringDecoder = exports.StringDecoder = function(encoding) {
  this.encoding = (encoding || 'utf8').toLowerCase().replace(/[-_]/, '');
  assertEncoding(encoding);
  switch (this.encoding) {
    case 'utf8':
      // CESU-8 represents each of Surrogate Pair by 3-bytes
      this.surrogateSize = 3;
      break;
    case 'ucs2':
    case 'utf16le':
      // UTF-16 represents each of Surrogate Pair by 2-bytes
      this.surrogateSize = 2;
      this.detectIncompleteChar = utf16DetectIncompleteChar;
      break;
    case 'base64':
      // Base-64 stores 3 bytes in 4 chars, and pads the remainder.
      this.surrogateSize = 3;
      this.detectIncompleteChar = base64DetectIncompleteChar;
      break;
    default:
      this.write = passThroughWrite;
      return;
  }

  this.charBuffer = new Buffer(6);
  this.charReceived = 0;
  this.charLength = 0;
};


StringDecoder.prototype.write = function(buffer) {
  var charStr = '';
  var offset = 0;

  // if our last write ended with an incomplete multibyte character
  while (this.charLength) {
    // determine how many remaining bytes this buffer has to offer for this char
    var i = (buffer.length >= this.charLength - this.charReceived) ?
                this.charLength - this.charReceived :
                buffer.length;

    // add the new bytes to the char buffer
    buffer.copy(this.charBuffer, this.charReceived, offset, i);
    this.charReceived += (i - offset);
    offset = i;

    if (this.charReceived < this.charLength) {
      // still not enough chars in this buffer? wait for more ...
      return '';
    }

    // get the character that was split
    charStr = this.charBuffer.slice(0, this.charLength).toString(this.encoding);

    // lead surrogate (D800-DBFF) is also the incomplete character
    var charCode = charStr.charCodeAt(charStr.length - 1);
    if (charCode >= 0xD800 && charCode <= 0xDBFF) {
      this.charLength += this.surrogateSize;
      charStr = '';
      continue;
    }
    this.charReceived = this.charLength = 0;

    // if there are no more bytes in this buffer, just emit our char
    if (i == buffer.length) return charStr;

    // otherwise cut off the characters end from the beginning of this buffer
    buffer = buffer.slice(i, buffer.length);
    break;
  }

  var lenIncomplete = this.detectIncompleteChar(buffer);

  var end = buffer.length;
  if (this.charLength) {
    // buffer the incomplete character bytes we got
    buffer.copy(this.charBuffer, 0, buffer.length - lenIncomplete, end);
    this.charReceived = lenIncomplete;
    end -= lenIncomplete;
  }

  charStr += buffer.toString(this.encoding, 0, end);

  var end = charStr.length - 1;
  var charCode = charStr.charCodeAt(end);
  // lead surrogate (D800-DBFF) is also the incomplete character
  if (charCode >= 0xD800 && charCode <= 0xDBFF) {
    var size = this.surrogateSize;
    this.charLength += size;
    this.charReceived += size;
    this.charBuffer.copy(this.charBuffer, size, 0, size);
    this.charBuffer.write(charStr.charAt(charStr.length - 1), this.encoding);
    return charStr.substring(0, end);
  }

  // or just emit the charStr
  return charStr;
};

StringDecoder.prototype.detectIncompleteChar = function(buffer) {
  // determine how many bytes we have to check at the end of this buffer
  var i = (buffer.length >= 3) ? 3 : buffer.length;

  // Figure out if one of the last i bytes of our buffer announces an
  // incomplete char.
  for (; i > 0; i--) {
    var c = buffer[buffer.length - i];

    // See http://en.wikipedia.org/wiki/UTF-8#Description

    // 110XXXXX
    if (i == 1 && c >> 5 == 0x06) {
      this.charLength = 2;
      break;
    }

    // 1110XXXX
    if (i <= 2 && c >> 4 == 0x0E) {
      this.charLength = 3;
      break;
    }

    // 11110XXX
    if (i <= 3 && c >> 3 == 0x1E) {
      this.charLength = 4;
      break;
    }
  }

  return i;
};

StringDecoder.prototype.end = function(buffer) {
  var res = '';
  if (buffer && buffer.length)
    res = this.write(buffer);

  if (this.charReceived) {
    var cr = this.charReceived;
    var buf = this.charBuffer;
    var enc = this.encoding;
    res += buf.slice(0, cr).toString(enc);
  }

  return res;
};

function passThroughWrite(buffer) {
  return buffer.toString(this.encoding);
}

function utf16DetectIncompleteChar(buffer) {
  var incomplete = this.charReceived = buffer.length % 2;
  this.charLength = incomplete ? 2 : 0;
  return incomplete;
}

function base64DetectIncompleteChar(buffer) {
  var incomplete = this.charReceived = buffer.length % 3;
  this.charLength = incomplete ? 3 : 0;
  return incomplete;
}

},{"buffer":41}],64:[function(require,module,exports){
/*jshint strict:true node:true es5:true onevar:true laxcomma:true laxbreak:true eqeqeq:true immed:true latedef:true*/
(function () {
  "use strict";

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var punycode = require('punycode');

exports.parse = urlParse;
exports.resolve = urlResolve;
exports.resolveObject = urlResolveObject;
exports.format = urlFormat;

// Reference: RFC 3986, RFC 1808, RFC 2396

// define these here so at least they only have to be
// compiled once on the first module load.
var protocolPattern = /^([a-z0-9.+-]+:)/i,
    portPattern = /:[0-9]*$/,

    // RFC 2396: characters reserved for delimiting URLs.
    // We actually just auto-escape these.
    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],

    // RFC 2396: characters not allowed for various reasons.
    unwise = ['{', '}', '|', '\\', '^', '~', '`'].concat(delims),

    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
    autoEscape = ['\''].concat(delims),
    // Characters that are never ever allowed in a hostname.
    // Note that any invalid chars are also handled, but these
    // are the ones that are *expected* to be seen, so we fast-path
    // them.
    nonHostChars = ['%', '/', '?', ';', '#']
      .concat(unwise).concat(autoEscape),
    nonAuthChars = ['/', '@', '?', '#'].concat(delims),
    hostnameMaxLen = 255,
    hostnamePartPattern = /^[a-zA-Z0-9][a-z0-9A-Z_-]{0,62}$/,
    hostnamePartStart = /^([a-zA-Z0-9][a-z0-9A-Z_-]{0,62})(.*)$/,
    // protocols that can allow "unsafe" and "unwise" chars.
    unsafeProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that never have a hostname.
    hostlessProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that always have a path component.
    pathedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    },
    // protocols that always contain a // bit.
    slashedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'https:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    },
    querystring = require('querystring');

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && typeof(url) === 'object' && url.href) return url;

  if (typeof url !== 'string') {
    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
  }

  var out = {},
      rest = url;

  // trim before proceeding.
  // This is to support parse stuff like "  http://foo.com  \n"
  rest = rest.trim();

  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    var lowerProto = proto.toLowerCase();
    out.protocol = lowerProto;
    rest = rest.substr(proto.length);
  }

  // figure out if it's got a host
  // user@server is *always* interpreted as a hostname, and url
  // resolution will treat //foo/bar as host=foo,path=bar because that's
  // how the browser resolves relative URLs.
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    var slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      out.slashes = true;
    }
  }

  if (!hostlessProtocol[proto] &&
      (slashes || (proto && !slashedProtocol[proto]))) {
    // there's a hostname.
    // the first instance of /, ?, ;, or # ends the host.
    // don't enforce full RFC correctness, just be unstupid about it.

    // If there is an @ in the hostname, then non-host chars *are* allowed
    // to the left of the first @ sign, unless some non-auth character
    // comes *before* the @-sign.
    // URLs are obnoxious.
    var atSign = rest.indexOf('@');
    if (atSign !== -1) {
      var auth = rest.slice(0, atSign);

      // there *may be* an auth
      var hasAuth = true;
      for (var i = 0, l = nonAuthChars.length; i < l; i++) {
        if (auth.indexOf(nonAuthChars[i]) !== -1) {
          // not a valid auth.  Something like http://foo.com/bar@baz/
          hasAuth = false;
          break;
        }
      }

      if (hasAuth) {
        // pluck off the auth portion.
        out.auth = decodeURIComponent(auth);
        rest = rest.substr(atSign + 1);
      }
    }

    var firstNonHost = -1;
    for (var i = 0, l = nonHostChars.length; i < l; i++) {
      var index = rest.indexOf(nonHostChars[i]);
      if (index !== -1 &&
          (firstNonHost < 0 || index < firstNonHost)) firstNonHost = index;
    }

    if (firstNonHost !== -1) {
      out.host = rest.substr(0, firstNonHost);
      rest = rest.substr(firstNonHost);
    } else {
      out.host = rest;
      rest = '';
    }

    // pull out port.
    var p = parseHost(out.host);
    var keys = Object.keys(p);
    for (var i = 0, l = keys.length; i < l; i++) {
      var key = keys[i];
      out[key] = p[key];
    }

    // we've indicated that there is a hostname,
    // so even if it's empty, it has to be present.
    out.hostname = out.hostname || '';

    // if hostname begins with [ and ends with ]
    // assume that it's an IPv6 address.
    var ipv6Hostname = out.hostname[0] === '[' &&
        out.hostname[out.hostname.length - 1] === ']';

    // validate a little.
    if (out.hostname.length > hostnameMaxLen) {
      out.hostname = '';
    } else if (!ipv6Hostname) {
      var hostparts = out.hostname.split(/\./);
      for (var i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part) continue;
        if (!part.match(hostnamePartPattern)) {
          var newpart = '';
          for (var j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              // we replace non-ASCII char with a temporary placeholder
              // we need this to make sure size of hostname is not
              // broken by replacing non-ASCII by nothing
              newpart += 'x';
            } else {
              newpart += part[j];
            }
          }
          // we test again with ASCII char only
          if (!newpart.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = '/' + notHost.join('.') + rest;
            }
            out.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    // hostnames are always lower case.
    out.hostname = out.hostname.toLowerCase();

    if (!ipv6Hostname) {
      // IDNA Support: Returns a puny coded representation of "domain".
      // It only converts the part of the domain name that
      // has non ASCII characters. I.e. it dosent matter if
      // you call it with a domain that already is in ASCII.
      var domainArray = out.hostname.split('.');
      var newOut = [];
      for (var i = 0; i < domainArray.length; ++i) {
        var s = domainArray[i];
        newOut.push(s.match(/[^A-Za-z0-9_-]/) ?
            'xn--' + punycode.encode(s) : s);
      }
      out.hostname = newOut.join('.');
    }

    out.host = (out.hostname || '') +
        ((out.port) ? ':' + out.port : '');
    out.href += out.host;

    // strip [ and ] from the hostname
    if (ipv6Hostname) {
      out.hostname = out.hostname.substr(1, out.hostname.length - 2);
      if (rest[0] !== '/') {
        rest = '/' + rest;
      }
    }
  }

  // now rest is set to the post-host stuff.
  // chop off any delim chars.
  if (!unsafeProtocol[lowerProto]) {

    // First, make 100% sure that any "autoEscape" chars get
    // escaped, even if encodeURIComponent doesn't think they
    // need to be.
    for (var i = 0, l = autoEscape.length; i < l; i++) {
      var ae = autoEscape[i];
      var esc = encodeURIComponent(ae);
      if (esc === ae) {
        esc = escape(ae);
      }
      rest = rest.split(ae).join(esc);
    }
  }


  // chop off from the tail first.
  var hash = rest.indexOf('#');
  if (hash !== -1) {
    // got a fragment string.
    out.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = rest.indexOf('?');
  if (qm !== -1) {
    out.search = rest.substr(qm);
    out.query = rest.substr(qm + 1);
    if (parseQueryString) {
      out.query = querystring.parse(out.query);
    }
    rest = rest.slice(0, qm);
  } else if (parseQueryString) {
    // no query string, but parseQueryString still requested
    out.search = '';
    out.query = {};
  }
  if (rest) out.pathname = rest;
  if (slashedProtocol[proto] &&
      out.hostname && !out.pathname) {
    out.pathname = '/';
  }

  //to support http.request
  if (out.pathname || out.search) {
    out.path = (out.pathname ? out.pathname : '') +
               (out.search ? out.search : '');
  }

  // finally, reconstruct the href based on what has been validated.
  out.href = urlFormat(out);
  return out;
}

// format a parsed object into a url string
function urlFormat(obj) {
  // ensure it's an object, and not a string url.
  // If it's an obj, this is a no-op.
  // this way, you can call url_format() on strings
  // to clean up potentially wonky urls.
  if (typeof(obj) === 'string') obj = urlParse(obj);

  var auth = obj.auth || '';
  if (auth) {
    auth = encodeURIComponent(auth);
    auth = auth.replace(/%3A/i, ':');
    auth += '@';
  }

  var protocol = obj.protocol || '',
      pathname = obj.pathname || '',
      hash = obj.hash || '',
      host = false,
      query = '';

  if (obj.host !== undefined) {
    host = auth + obj.host;
  } else if (obj.hostname !== undefined) {
    host = auth + (obj.hostname.indexOf(':') === -1 ?
        obj.hostname :
        '[' + obj.hostname + ']');
    if (obj.port) {
      host += ':' + obj.port;
    }
  }

  if (obj.query && typeof obj.query === 'object' &&
      Object.keys(obj.query).length) {
    query = querystring.stringify(obj.query);
  }

  var search = obj.search || (query && ('?' + query)) || '';

  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
  // unless they had them to begin with.
  if (obj.slashes ||
      (!protocol || slashedProtocol[protocol]) && host !== false) {
    host = '//' + (host || '');
    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
  } else if (!host) {
    host = '';
  }

  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
  if (search && search.charAt(0) !== '?') search = '?' + search;

  return protocol + host + pathname + search + hash;
}

function urlResolve(source, relative) {
  return urlFormat(urlResolveObject(source, relative));
}

function urlResolveObject(source, relative) {
  if (!source) return relative;

  source = urlParse(urlFormat(source), false, true);
  relative = urlParse(urlFormat(relative), false, true);

  // hash is always overridden, no matter what.
  source.hash = relative.hash;

  if (relative.href === '') {
    source.href = urlFormat(source);
    return source;
  }

  // hrefs like //foo/bar always cut to the protocol.
  if (relative.slashes && !relative.protocol) {
    relative.protocol = source.protocol;
    //urlParse appends trailing / to urls like http://www.example.com
    if (slashedProtocol[relative.protocol] &&
        relative.hostname && !relative.pathname) {
      relative.path = relative.pathname = '/';
    }
    relative.href = urlFormat(relative);
    return relative;
  }

  if (relative.protocol && relative.protocol !== source.protocol) {
    // if it's a known url protocol, then changing
    // the protocol does weird things
    // first, if it's not file:, then we MUST have a host,
    // and if there was a path
    // to begin with, then we MUST have a path.
    // if it is file:, then the host is dropped,
    // because that's known to be hostless.
    // anything else is assumed to be absolute.
    if (!slashedProtocol[relative.protocol]) {
      relative.href = urlFormat(relative);
      return relative;
    }
    source.protocol = relative.protocol;
    if (!relative.host && !hostlessProtocol[relative.protocol]) {
      var relPath = (relative.pathname || '').split('/');
      while (relPath.length && !(relative.host = relPath.shift()));
      if (!relative.host) relative.host = '';
      if (!relative.hostname) relative.hostname = '';
      if (relPath[0] !== '') relPath.unshift('');
      if (relPath.length < 2) relPath.unshift('');
      relative.pathname = relPath.join('/');
    }
    source.pathname = relative.pathname;
    source.search = relative.search;
    source.query = relative.query;
    source.host = relative.host || '';
    source.auth = relative.auth;
    source.hostname = relative.hostname || relative.host;
    source.port = relative.port;
    //to support http.request
    if (source.pathname !== undefined || source.search !== undefined) {
      source.path = (source.pathname ? source.pathname : '') +
                    (source.search ? source.search : '');
    }
    source.slashes = source.slashes || relative.slashes;
    source.href = urlFormat(source);
    return source;
  }

  var isSourceAbs = (source.pathname && source.pathname.charAt(0) === '/'),
      isRelAbs = (
          relative.host !== undefined ||
          relative.pathname && relative.pathname.charAt(0) === '/'
      ),
      mustEndAbs = (isRelAbs || isSourceAbs ||
                    (source.host && relative.pathname)),
      removeAllDots = mustEndAbs,
      srcPath = source.pathname && source.pathname.split('/') || [],
      relPath = relative.pathname && relative.pathname.split('/') || [],
      psychotic = source.protocol &&
          !slashedProtocol[source.protocol];

  // if the url is a non-slashed url, then relative
  // links like ../.. should be able
  // to crawl up to the hostname, as well.  This is strange.
  // source.protocol has already been set by now.
  // Later on, put the first path part into the host field.
  if (psychotic) {

    delete source.hostname;
    delete source.port;
    if (source.host) {
      if (srcPath[0] === '') srcPath[0] = source.host;
      else srcPath.unshift(source.host);
    }
    delete source.host;
    if (relative.protocol) {
      delete relative.hostname;
      delete relative.port;
      if (relative.host) {
        if (relPath[0] === '') relPath[0] = relative.host;
        else relPath.unshift(relative.host);
      }
      delete relative.host;
    }
    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
  }

  if (isRelAbs) {
    // it's absolute.
    source.host = (relative.host || relative.host === '') ?
                      relative.host : source.host;
    source.hostname = (relative.hostname || relative.hostname === '') ?
                      relative.hostname : source.hostname;
    source.search = relative.search;
    source.query = relative.query;
    srcPath = relPath;
    // fall through to the dot-handling below.
  } else if (relPath.length) {
    // it's relative
    // throw away the existing file, and take the new path instead.
    if (!srcPath) srcPath = [];
    srcPath.pop();
    srcPath = srcPath.concat(relPath);
    source.search = relative.search;
    source.query = relative.query;
  } else if ('search' in relative) {
    // just pull out the search.
    // like href='?foo'.
    // Put this after the other two cases because it simplifies the booleans
    if (psychotic) {
      source.hostname = source.host = srcPath.shift();
      //occationaly the auth can get stuck only in host
      //this especialy happens in cases like
      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
      var authInHost = source.host && source.host.indexOf('@') > 0 ?
                       source.host.split('@') : false;
      if (authInHost) {
        source.auth = authInHost.shift();
        source.host = source.hostname = authInHost.shift();
      }
    }
    source.search = relative.search;
    source.query = relative.query;
    //to support http.request
    if (source.pathname !== undefined || source.search !== undefined) {
      source.path = (source.pathname ? source.pathname : '') +
                    (source.search ? source.search : '');
    }
    source.href = urlFormat(source);
    return source;
  }
  if (!srcPath.length) {
    // no path at all.  easy.
    // we've already handled the other stuff above.
    delete source.pathname;
    //to support http.request
    if (!source.search) {
      source.path = '/' + source.search;
    } else {
      delete source.path;
    }
    source.href = urlFormat(source);
    return source;
  }
  // if a url ENDs in . or .., then it must get a trailing slash.
  // however, if it ends in anything else non-slashy,
  // then it must NOT get a trailing slash.
  var last = srcPath.slice(-1)[0];
  var hasTrailingSlash = (
      (source.host || relative.host) && (last === '.' || last === '..') ||
      last === '');

  // strip single dots, resolve double dots to parent dir
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = srcPath.length; i >= 0; i--) {
    last = srcPath[i];
    if (last == '.') {
      srcPath.splice(i, 1);
    } else if (last === '..') {
      srcPath.splice(i, 1);
      up++;
    } else if (up) {
      srcPath.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (!mustEndAbs && !removeAllDots) {
    for (; up--; up) {
      srcPath.unshift('..');
    }
  }

  if (mustEndAbs && srcPath[0] !== '' &&
      (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
    srcPath.unshift('');
  }

  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
    srcPath.push('');
  }

  var isAbsolute = srcPath[0] === '' ||
      (srcPath[0] && srcPath[0].charAt(0) === '/');

  // put the host back
  if (psychotic) {
    source.hostname = source.host = isAbsolute ? '' :
                                    srcPath.length ? srcPath.shift() : '';
    //occationaly the auth can get stuck only in host
    //this especialy happens in cases like
    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
    var authInHost = source.host && source.host.indexOf('@') > 0 ?
                     source.host.split('@') : false;
    if (authInHost) {
      source.auth = authInHost.shift();
      source.host = source.hostname = authInHost.shift();
    }
  }

  mustEndAbs = mustEndAbs || (source.host && srcPath.length);

  if (mustEndAbs && !isAbsolute) {
    srcPath.unshift('');
  }

  source.pathname = srcPath.join('/');
  //to support request.http
  if (source.pathname !== undefined || source.search !== undefined) {
    source.path = (source.pathname ? source.pathname : '') +
                  (source.search ? source.search : '');
  }
  source.auth = relative.auth || source.auth;
  source.slashes = source.slashes || relative.slashes;
  source.href = urlFormat(source);
  return source;
}

function parseHost(host) {
  var out = {};
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ':') {
      out.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host) out.hostname = host;
  return out;
}

}());

},{"punycode":52,"querystring":55}],65:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],66:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require("/usr/local/share/npm/lib/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":65,"/usr/local/share/npm/lib/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js":51,"inherits":50}]},{},[1])
(1)
});