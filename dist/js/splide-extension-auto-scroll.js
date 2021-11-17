/*!
 * @splidejs/splide-extension-auto-scroll
 * Version  : 0.1.0
 * License  : MIT
 * Copyright: 2021 Naotoshi Fujita
 */
(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) : factory();
})(function () {
  'use strict';

  function isArray(subject) {
    return Array.isArray(subject);
  }

  function toArray(value) {
    return isArray(value) ? value : [value];
  }

  function forEach(values, iteratee) {
    toArray(values).forEach(iteratee);
  }

  function raf(func) {
    return requestAnimationFrame(func);
  }

  var EVENT_MOVE = "move";
  var EVENT_MOVED = "moved";
  var EVENT_DRAG = "drag";
  var EVENT_DRAGGED = "dragged";
  var EVENT_SCROLL = "scroll";
  var EVENT_SCROLLED = "scrolled";
  var EVENT_DESTROY = "destroy";

  function EventInterface(Splide22) {
    var event = Splide22.event;
    var key = {};
    var listeners = [];

    function on(events, callback, priority) {
      event.on(events, callback, key, priority);
    }

    function off(events) {
      event.off(events, key);
    }

    function bind(targets, events, callback, options) {
      forEachEvent(targets, events, function (target, event2) {
        listeners.push([target, event2, callback, options]);
        target.addEventListener(event2, callback, options);
      });
    }

    function unbind(targets, events, callback) {
      forEachEvent(targets, events, function (target, event2) {
        listeners = listeners.filter(function (listener) {
          if (listener[0] === target && listener[1] === event2 && (!callback || listener[2] === callback)) {
            target.removeEventListener(event2, listener[2], listener[3]);
            return false;
          }

          return true;
        });
      });
    }

    function forEachEvent(targets, events, iteratee) {
      forEach(targets, function (target) {
        if (target) {
          events.split(" ").forEach(iteratee.bind(null, target));
        }
      });
    }

    function destroy() {
      listeners = listeners.filter(function (data) {
        return unbind(data[0], data[1]);
      });
      event.offBy(key);
    }

    event.on(EVENT_DESTROY, destroy, key);
    return {
      on: on,
      off: off,
      emit: event.emit,
      bind: bind,
      unbind: unbind,
      destroy: destroy
    };
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
        var elapsed = now() - startTime;

        if (elapsed >= interval) {
          rate = 1;
          startTime = now();
        } else {
          rate = elapsed / interval;
        }

        if (onUpdate) {
          onUpdate(rate);
        }

        if (rate === 1) {
          onInterval();

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
      cancelAnimationFrame(id);
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

  var SLIDE2 = "slide";
  var arrayProto2 = Array.prototype;

  function slice2(arrayLike, start, end) {
    return arrayProto2.slice.call(arrayLike, start, end);
  }

  function forOwn2(object, iteratee, right) {
    if (object) {
      var keys = Object.keys(object);
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

  function assign2(object) {
    slice2(arguments, 1).forEach(function (source) {
      forOwn2(source, function (value, key) {
        object[key] = source[key];
      });
    });
    return object;
  }

  var min2 = Math.min,
      max2 = Math.max,
      floor2 = Math.floor,
      ceil2 = Math.ceil,
      abs2 = Math.abs;

  function clamp2(number, x, y) {
    var minimum = min2(x, y);
    var maximum = max2(x, y);
    return min2(max2(minimum, number), maximum);
  }

  var DEFAULTS2 = {
    speed: 1,
    pauseOnHover: true,
    pauseOnFocus: true
  };

  function AutoScroll(Splide3, Components2, options) {
    var _EventInterface = EventInterface(Splide3),
        on = _EventInterface.on,
        bind = _EventInterface.bind,
        emit = _EventInterface.emit;

    var _Components2$Move = Components2.Move,
        translate = _Components2$Move.translate,
        getPosition = _Components2$Move.getPosition,
        toIndex = _Components2$Move.toIndex,
        getLimit = _Components2$Move.getLimit;
    var _Components2$Controll = Components2.Controller,
        setIndex = _Components2$Controll.setIndex,
        getIndex = _Components2$Controll.getIndex;
    var orient = Components2.Direction.orient;
    var interval = RequestInterval(Infinity, null, update);
    var isPaused = interval.isPaused;
    var autoScrollOptions = assign2({}, DEFAULTS2, options.autoScroll || {});
    var paused;
    var hovered;
    var focused;

    function mount() {
      listen();
      play();
    }

    function listen() {
      var root = Splide3.root;

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

      on([EVENT_MOVE, EVENT_MOVED, EVENT_DRAG, EVENT_DRAGGED, EVENT_SCROLL, EVENT_SCROLLED], autoToggle);
    }

    function play() {
      if (isPaused()) {
        interval.start(true);
        emit(EVENT_SCROLL);
      }
    }

    function pause(manual) {
      if (manual === void 0) {
        manual = true;
      }

      if (!isPaused()) {
        interval.pause();
        emit(EVENT_SCROLLED);
      }

      paused = manual;
    }

    function autoToggle() {
      if (!paused) {
        if (!hovered && !focused) {
          play();
        } else {
          pause(false);
        }
      }
    }

    function update() {
      var position = getPosition();
      var destination = computeDestination(position);

      if (position !== destination) {
        translate(destination);
        updateIndex(destination);
      }
    }

    function computeDestination(position) {
      var _a;

      var speed = ((_a = options.autoScroll) == null ? void 0 : _a.speed) || 1;
      position += orient(speed);

      if (Splide3.is(SLIDE2)) {
        position = clamp2(position, getLimit(false), getLimit(true));
      }

      return position;
    }

    function updateIndex(position) {
      var length = Splide3.length;
      var index = (toIndex(position) + length) % length;

      if (index !== getIndex()) {
        setIndex(index);
        emit(EVENT_SCROLLED);
        emit(EVENT_SCROLL);
      }
    }

    return {
      mount: mount,
      play: play,
      pause: pause
    };
  }

  if (typeof window !== "undefined") {
    window.splide = window.splide || {};
    window.splide.Extensions = window.splide.Extensions || {};
    window.splide.Extensions.AutoScroll = AutoScroll;
  }
  /*!
   * Splide.js
   * Version  : 3.5.0
   * License  : MIT
   * Copyright: 2021 Naotoshi Fujita
   */

});
//# sourceMappingURL=splide-extension-auto-scroll.js.map
