/*! echo-js v1.7.3 | (c) 2016 @toddmotto | https://github.com/toddmotto/echo */
(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(function() {
            return factory(root);
        });
    } else if (typeof exports === 'object') {
        module.exports = factory;
    } else {
        root.echo = factory(root);
    }
})(this, function(root) {
    'use strict';
    var echo = {};
    var callback = function() {};
    var offset, poll, delay, useDebounce, unload;
    var isHidden = function(element) {
        return (element.offsetParent === null);
    };
    var inView = function(element, view) {
        if (isHidden(element)) {
            return false;
        }
        var box = element.getBoundingClientRect();
        return (box.right >= view.l && box.bottom >= view.t && box.left <= view.r && box.top <= view.b);
    };
    var debounceOrThrottle = function() {
        if (!useDebounce && !!poll) {
            return;
        }
        clearTimeout(poll);
        poll = setTimeout(function() {
            echo.render();
            poll = null;
        }, delay);
    };

    echo.init = function(opts) {
        opts = opts || {};
        var offsetAll = opts.offset || 0;
        var offsetVertical = opts.offsetVertical || offsetAll;
        var offsetHorizontal = opts.offsetHorizontal || offsetAll;
        var optionToInt = function(opt, fallback) {
            return parseInt(opt || fallback, 10);
        };
        offset = {
            t: optionToInt(opts.offsetTop, offsetVertical),
            b: optionToInt(opts.offsetBottom, offsetVertical),
            l: optionToInt(opts.offsetLeft, offsetHorizontal),
            r: optionToInt(opts.offsetRight, offsetHorizontal)
        };
        delay = optionToInt(opts.throttle, 250);
        useDebounce = opts.debounce !== false;
        unload = !!opts.unload;
        callback = opts.callback || callback;
        echo.render();
        if (document.addEventListener) {
            root.addEventListener('scroll', debounceOrThrottle, false);
            root.addEventListener('load', debounceOrThrottle, false);
        } else {
            root.attachEvent('onscroll', debounceOrThrottle);
            root.attachEvent('onload', debounceOrThrottle);
        }
    };

    echo.render = function() {
        var nodes = document.querySelectorAll('img[data-echo], [data-echo-background]');
        var length = nodes.length;
        var src, elem;
        var view = {
            l: 0 - offset.l,
            t: 0 - offset.t,
            b: (root.innerHeight || document.documentElement.clientHeight) + offset.b,
            r: (root.innerWidth || document.documentElement.clientWidth) + offset.r
        };
        for (var i = 0; i < length; i++) {
            elem = nodes[i];
            if (inView(elem, view)) {

                if (unload) {
                    elem.setAttribute('data-echo-placeholder', elem.src);
                }

                if (elem.getAttribute('data-echo-background') !== null) {
                    elem.style.backgroundImage = "url(" + elem.getAttribute('data-echo-background') + ")";
                } else {
                    elem.src = elem.getAttribute('data-echo');
                }

                if (!unload) {
                    elem.removeAttribute('data-echo');
                    elem.removeAttribute('data-echo-background');
                }

                callback(elem, 'load');
            } else if (unload && !!(src = elem.getAttribute('data-echo-placeholder'))) {

                if (elem.getAttribute('data-echo-background') !== null) {
                    elem.style.backgroundImage = "url(" + src + ")";
                } else {
                    elem.src = src;
                }

                elem.removeAttribute('data-echo-placeholder');
                callback(elem, 'unload');
            }
        }
        if (!length) {
            echo.detach();
        }
    };
    echo.detach = function() {
        if (document.removeEventListener) {
            root.removeEventListener('scroll', debounceOrThrottle);
        } else {
            root.detachEvent('onscroll', debounceOrThrottle);
        }
        clearTimeout(poll);
    };
    return echo;
});

(function (win, doc) {
    var utils = {
        name: 'sunny',
        version: '1.0.0',
        init: function () {
            this.backToTop();
            this.toggleMenu();
            echo.init({
                offset: 50,
                throttle: 250,
                unload: false,
                callback: function(element, op) {
                    // console.log(element, 'has been', op + 'ed')
                }
            });
        },
        // 原生js选择器
        $: function(selector) {
            return /^(\[object HTML)[a-zA-Z]*(Element\])$/.test(Object.prototype.toString.call(selector)) ? selector : doc.querySelector(selector);
        },
        // 切换菜单
        toggleMenu: function() {
            var menu = this.$('#menu');
            var btnDropNav = this.$('#btnDropNav');
            btnDropNav && btnDropNav.addEventListener('click', function () {
                if (menu.className.indexOf('hidden') === -1) {
                    menu.className += ' hidden';
                } else {
                    menu.className = menu.className.replace(/\s*hidden\s*/, '');
                }
            })
        },
        // 返回顶部
        backToTop: function() {
            var _this = this;
            if (typeof this.$('#backToTop') === 'undefined') return;
            var backToTop = this.$('#backToTop');
            win.onscroll = win.onresize = function() {
                if (doc.documentElement.scrollTop + doc.body.scrollTop > 0) {
                    backToTop.style.display = 'block';
                } else {
                    backToTop.style.display = 'none';
                }
            };
            backToTop.addEventListener('click', function () {
                var Timer = setInterval(GoTop, 10);
                function GoTop() {
                    if (doc.documentElement.scrollTop + doc.body.scrollTop < 1) {
                        clearInterval(Timer)
                    } else {
                        doc.documentElement.scrollTop /= 1.1;
                        doc.body.scrollTop /= 1.1
                    }
                }
            })
        }
    }
    utils.init();
    win.utils = utils;
})(window, document);
