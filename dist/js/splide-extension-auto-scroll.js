/*!
 * @splidejs/splide-extension-auto-scroll
 * Version  : 0.5.2
 * License  : MIT
 * Copyright: 2022 Naotoshi Fujita
 */
(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) : factory();
})(function () {
  'use strict';

  function empty(array) {
    array.length = 0;
  }

  function slice$1(arrayLike, start, end) {
    return Array.prototype.slice.call(arrayLike, start, end);
  }

  function apply$1(func) {
    return func.bind.apply(func, [null].concat(slice$1(arguments, 1)));
  }

  function raf(func) {
    return requestAnimationFrame(func);
  }

  function typeOf$1(type, subject) {
    return typeof subject === type;
  }

  var isArray$1 = Array.isArray;
  apply$1(typeOf$1, "function");
  apply$1(typeOf$1, "string");
  apply$1(typeOf$1, "undefined");

  function toArray$1(value) {
    return isArray$1(value) ? value : [value];
  }

  function forEach$1(values, iteratee) {
    toArray$1(values).forEach(iteratee);
  }

  var ownKeys$1 = Object.keys;

  function forOwn$1(object, iteratee, right) {
    if (object) {
      var keys = ownKeys$1(object);
      keys = right ? keys.reverse() : keys;

      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];

        if (key !== "__proto__") {
          if (iteratee(object[key], key) === false) {
            break;
          }
        }
      }
    }

    return object;
  }

  function assign$1(object) {
    slice$1(arguments, 1).forEach(function (source) {
      forOwn$1(source, function (value, key) {
        object[key] = source[key];
      });
    });
    return object;
  }

  var min$1 = Math.min;

  function EventBinder() {
    var listeners = [];

    function bind(targets, events, callback, options) {
      forEachEvent(targets, events, function (target, event, namespace) {
        var isEventTarget = ("addEventListener" in target);
        var remover = isEventTarget ? target.removeEventListener.bind(target, event, callback, options) : target["removeListener"].bind(target, callback);
        isEventTarget ? target.addEventListener(event, callback, options) : target["addListener"](callback);
        listeners.push([target, event, namespace, callback, remover]);
      });
    }

    function unbind(targets, events, callback) {
      forEachEvent(targets, events, function (target, event, namespace) {
        listeners = listeners.filter(function (listener) {
          if (listener[0] === target && listener[1] === event && listener[2] === namespace && (!callback || listener[3] === callback)) {
            listener[4]();
            return false;
          }

          return true;
        });
      });
    }

    function dispatch(target, type, detail) {
      var e;
      var bubbles = true;

      if (typeof CustomEvent === "function") {
        e = new CustomEvent(type, {
          bubbles: bubbles,
          detail: detail
        });
      } else {
        e = document.createEvent("CustomEvent");
        e.initCustomEvent(type, bubbles, false, detail);
      }

      target.dispatchEvent(e);
      return e;
    }

    function forEachEvent(targets, events, iteratee) {
      forEach$1(targets, function (target) {
        target && forEach$1(events, function (events2) {
          events2.split(" ").forEach(function (eventNS) {
            var fragment = eventNS.split(".");
            iteratee(target, fragment[0], fragment[1]);
          });
        });
      });
    }

    function destroy() {
      listeners.forEach(function (data) {
        data[4]();
      });
      empty(listeners);
    }

    return {
      bind: bind,
      unbind: unbind,
      dispatch: dispatch,
      destroy: destroy
    };
  }

  var EVENT_MOVE = "move";
  var EVENT_MOVED = "moved";
  var EVENT_UPDATED = "updated";
  var EVENT_DRAG = "drag";
  var EVENT_DRAGGED = "dragged";
  var EVENT_SCROLL = "scroll";
  var EVENT_SCROLLED = "scrolled";
  var EVENT_DESTROY = "destroy";

  function EventInterface(Splide2) {
    var bus = Splide2 ? Splide2.event.bus : document.createDocumentFragment();
    var binder = EventBinder();

    function on(events, callback) {
      binder.bind(bus, toArray$1(events).join(" "), function (e) {
        callback.apply(callback, isArray$1(e.detail) ? e.detail : []);
      });
    }

    function emit(event) {
      binder.dispatch(bus, event, slice$1(arguments, 1));
    }

    if (Splide2) {
      Splide2.event.on(EVENT_DESTROY, binder.destroy);
    }

    return assign$1(binder, {
      bus: bus,
      on: on,
      off: apply$1(binder.unbind, bus),
      emit: emit
    });
  }

  function RequestInterval(interval, onInterval, onUpdate, limit) {
    var now = Date.now;
    var startTime;
    var rate = 0;
    var id;
    var paused = true;
    var count = 0;

    function update() {
      if (!paused) {
        rate = interval ? min$1((now() - startTime) / interval, 1) : 1;
        onUpdate && onUpdate(rate);

        if (rate >= 1) {
          onInterval();
          startTime = now();

          if (limit && ++count >= limit) {
            return pause();
          }
        }

        raf(update);
      }
    }

    function start(resume) {
      !resume && cancel();
      startTime = now() - (resume ? rate * interval : 0);
      paused = false;
      raf(update);
    }

    function pause() {
      paused = true;
    }

    function rewind() {
      startTime = now();
      rate = 0;

      if (onUpdate) {
        onUpdate(rate);
      }
    }

    function cancel() {
      id && cancelAnimationFrame(id);
      rate = 0;
      id = 0;
      paused = true;
    }

    function set(time) {
      interval = time;
    }

    function isPaused() {
      return paused;
    }

    return {
      start: start,
      rewind: rewind,
      pause: pause,
      cancel: cancel,
      set: set,
      isPaused: isPaused
    };
  }

  function Throttle(func, duration) {
    var interval;

    function throttled() {
      if (!interval) {
        interval = RequestInterval(duration || 0, function () {
          func();
          interval = null;
        }, null, 1);
        interval.start();
      }
    }

    return throttled;
  }

  var CLASS_ACTIVE = "is-active";
  var SLIDE = "slide";
  var FADE = "fade";

  function slice(arrayLike, start, end) {
    return Array.prototype.slice.call(arrayLike, start, end);
  }

  function apply(func) {
    return func.bind.apply(func, [null].concat(slice(arguments, 1)));
  }

  function typeOf(type, subject) {
    return typeof subject === type;
  }

  function isObject(subject) {
    return !isNull(subject) && typeOf("object", subject);
  }

  var isArray = Array.isArray;
  apply(typeOf, "function");
  apply(typeOf, "string");
  var isUndefined = apply(typeOf, "undefined");

  function isNull(subject) {
    return subject === null;
  }

  function toArray(value) {
    return isArray(value) ? value : [value];
  }

  function forEach(values, iteratee) {
    toArray(values).forEach(iteratee);
  }

  function toggleClass(elm, classes, add) {
    if (elm) {
      forEach(classes, function (name) {
        if (name) {
          elm.classList[add ? "add" : "remove"](name);
        }
      });
    }
  }

  var ownKeys = Object.keys;

  function forOwn(object, iteratee, right) {
    if (object) {
      var keys = ownKeys(object);
      keys = right ? keys.reverse() : keys;

      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];

        if (key !== "__proto__") {
          if (iteratee(object[key], key) === false) {
            break;
          }
        }
      }
    }

    return object;
  }

  function assign(object) {
    slice(arguments, 1).forEach(function (source) {
      forOwn(source, function (value, key) {
        object[key] = source[key];
      });
    });
    return object;
  }

  function removeAttribute(elms, attrs) {
    forEach(elms, function (elm) {
      forEach(attrs, function (attr) {
        elm && elm.removeAttribute(attr);
      });
    });
  }

  function setAttribute(elms, attrs, value) {
    if (isObject(attrs)) {
      forOwn(attrs, function (value2, name) {
        setAttribute(elms, name, value2);
      });
    } else {
      forEach(elms, function (elm) {
        isNull(value) || value === "" ? removeAttribute(elm, attrs) : elm.setAttribute(attrs, String(value));
      });
    }
  }

  var min = Math.min,
      max = Math.max,
      floor = Math.floor,
      ceil = Math.ceil,
      abs = Math.abs;

  function clamp(number, x, y) {
    var minimum = min(x, y);
    var maximum = max(x, y);
    return min(max(minimum, number), maximum);
  }

  var DEFAULTS = {
    speed: 1,
    autoStart: true,
    pauseOnHover: true,
    pauseOnFocus: true
  };
  var I18N = {
    startScroll: "Start auto scroll",
    pauseScroll: "Pause auto scroll"
  };

  function AutoScroll(Splide2, Components2, options) {
    var _EventInterface = EventInterface(Splide2),
        on = _EventInterface.on,
        off = _EventInterface.off,
        bind = _EventInterface.bind,
        unbind = _EventInterface.unbind;

    var _Components2$Move = Components2.Move,
        translate = _Components2$Move.translate,
        getPosition = _Components2$Move.getPosition,
        toIndex = _Components2$Move.toIndex,
        getLimit = _Components2$Move.getLimit;
    var _Components2$Controll = Components2.Controller,
        setIndex = _Components2$Controll.setIndex,
        getIndex = _Components2$Controll.getIndex;
    var orient = Components2.Direction.orient;
    var toggle = Components2.Elements.toggle;
    var Live = Components2.Live;
    var root = Splide2.root;
    var throttledUpdateArrows = Throttle(Components2.Arrows.update, 500);
    var autoScrollOptions = {};
    var interval;
    var stopped;
    var hovered;
    var focused;
    var busy;
    var currPosition;

    function setup() {
      var autoScroll = options.autoScroll;
      autoScrollOptions = assign({}, DEFAULTS, isObject(autoScroll) ? autoScroll : {});
    }

    function mount() {
      if (!Splide2.is(FADE)) {
        if (!interval && options.autoScroll !== false) {
          interval = RequestInterval(0, move);
          listen();
          autoStart();
        }
      }
    }

    function destroy() {
      if (interval) {
        interval.cancel();
        interval = null;
        currPosition = void 0;
        off([EVENT_MOVE, EVENT_DRAG, EVENT_SCROLL, EVENT_MOVED, EVENT_SCROLLED]);
        unbind(root, "mouseenter mouseleave focusin focusout");
        unbind(toggle, "click");
      }
    }

    function listen() {
      if (autoScrollOptions.pauseOnHover) {
        bind(root, "mouseenter mouseleave", function (e) {
          hovered = e.type === "mouseenter";
          autoToggle();
        });
      }

      if (autoScrollOptions.pauseOnFocus) {
        bind(root, "focusin focusout", function (e) {
          focused = e.type === "focusin";
          autoToggle();
        });
      }

      if (autoScrollOptions.useToggleButton) {
        bind(toggle, "click", function () {
          stopped ? play() : pause();
        });
      }

      on(EVENT_UPDATED, update);
      on([EVENT_MOVE, EVENT_DRAG, EVENT_SCROLL], function () {
        busy = true;
        pause(false);
      });
      on([EVENT_MOVED, EVENT_DRAGGED, EVENT_SCROLLED], function () {
        busy = false;
        autoToggle();
      });
    }

    function update() {
      var autoScroll = options.autoScroll;

      if (autoScroll !== false) {
        autoScrollOptions = assign({}, autoScrollOptions, isObject(autoScroll) ? autoScroll : {});
        mount();
      } else {
        destroy();
      }

      if (interval && !isUndefined(currPosition)) {
        translate(currPosition);
      }
    }

    function autoStart() {
      if (autoScrollOptions.autoStart) {
        if (document.readyState === "complete") {
          play();
        } else {
          bind(window, "load", play);
        }
      }
    }

    function play() {
      if (isPaused()) {
        interval.start(true);
        Live.disable(true);
        focused = hovered = stopped = false;
        updateButton();
      }
    }

    function pause(stop) {
      if (stop === void 0) {
        stop = true;
      }

      if (!stopped) {
        stopped = stop;
        updateButton();

        if (!isPaused()) {
          interval.pause();
          Live.disable(false);
        }
      }
    }

    function autoToggle() {
      if (!stopped) {
        hovered || focused || busy ? pause(false) : play();
      }
    }

    function move() {
      var position = getPosition();
      var destination = computeDestination(position);

      if (position !== destination) {
        translate(destination);
        updateIndex(currPosition = getPosition());
      } else {
        pause(false);

        if (autoScrollOptions.rewind) {
          Splide2.go(autoScrollOptions.speed > 0 ? 0 : Components2.Controller.getEnd());
        }
      }

      throttledUpdateArrows();
    }

    function computeDestination(position) {
      var speed = autoScrollOptions.speed || 1;
      position += orient(speed);

      if (Splide2.is(SLIDE)) {
        position = clamp(position, getLimit(false), getLimit(true));
      }

      return position;
    }

    function updateIndex(position) {
      var length = Splide2.length;
      var index = (toIndex(position) + length) % length;

      if (index !== getIndex()) {
        setIndex(index);
        Components2.Slides.update();
        Components2.Pagination.update();
        options.lazyLoad === "nearby" && Components2.LazyLoad.check();
      }
    }

    function updateButton() {
      if (toggle) {
        var key = stopped ? "startScroll" : "pauseScroll";
        toggleClass(toggle, CLASS_ACTIVE, !stopped);
        setAttribute(toggle, "aria-label", options.i18n[key] || I18N[key]);
      }
    }

    function isPaused() {
      return !interval || interval.isPaused();
    }

    return {
      setup: setup,
      mount: mount,
      destroy: destroy,
      play: play,
      pause: pause,
      isPaused: isPaused
    };
  }

  if (typeof window !== "undefined") {
    window.splide = window.splide || {};
    window.splide.Extensions = window.splide.Extensions || {};
    window.splide.Extensions.AutoScroll = AutoScroll;
  }
});
//# sourceMappingURL=splide-extension-auto-scroll.js.map
