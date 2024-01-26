/*popper.js
 Copyright (C) Federico Zivolo 2018
 Distributed under the MIT License (license terms are at http://opensource.org/licenses/MIT).
 */
(function (e, t) {
    'object' == typeof exports && 'undefined' != typeof module ? module.exports = t() : 'function' == typeof define && define.amd ? define(t) : e.Popper = t()
})(this, function () {
    'use strict';

    function e(e) {
        return e && '[object Function]' === {}.toString.call(e)
    }

    function t(e, t) {
        if (1 !== e.nodeType) return [];
        var o = e.ownerDocument.defaultView,
            n = o.getComputedStyle(e, null);
        return t ? n[t] : n
    }

    function o(e) {
        return 'HTML' === e.nodeName ? e : e.parentNode || e.host
    }

    function n(e) {
        if (!e) return document.body;
        switch (e.nodeName) {
            case 'HTML':
            case 'BODY':
                return e.ownerDocument.body;
            case '#document':
                return e.body;
        }
        var i = t(e),
            r = i.overflow,
            p = i.overflowX,
            s = i.overflowY;
        return /(auto|scroll|overlay)/.test(r + s + p) ? e : n(o(e))
    }

    function r(e) {
        return 11 === e ? re : 10 === e ? pe : re || pe
    }

    function p(e) {
        if (!e) return document.documentElement;
        for (var o = r(10) ? document.body : null, n = e.offsetParent || null; n === o && e.nextElementSibling;) n = (e = e.nextElementSibling).offsetParent;
        var i = n && n.nodeName;
        return i && 'BODY' !== i && 'HTML' !== i ? -1 !== ['TH', 'TD', 'TABLE'].indexOf(n.nodeName) && 'static' === t(n, 'position') ? p(n) : n : e ? e.ownerDocument.documentElement : document.documentElement
    }

    function s(e) {
        var t = e.nodeName;
        return 'BODY' !== t && ('HTML' === t || p(e.firstElementChild) === e)
    }

    function d(e) {
        return null === e.parentNode ? e : d(e.parentNode)
    }

    function a(e, t) {
        if (!e || !e.nodeType || !t || !t.nodeType) return document.documentElement;
        var o = e.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_FOLLOWING,
            n = o ? e : t,
            i = o ? t : e,
            r = document.createRange();
        r.setStart(n, 0), r.setEnd(i, 0);
        var l = r.commonAncestorContainer;
        if (e !== l && t !== l || n.contains(i)) return s(l) ? l : p(l);
        var f = d(e);
        return f.host ? a(f.host, t) : a(e, d(t).host)
    }

    function l(e) {
        var t = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : 'top',
            o = 'top' === t ? 'scrollTop' : 'scrollLeft',
            n = e.nodeName;
        if ('BODY' === n || 'HTML' === n) {
            var i = e.ownerDocument.documentElement,
                r = e.ownerDocument.scrollingElement || i;
            return r[o]
        }
        return e[o]
    }

    function f(e, t) {
        var o = 2 < arguments.length && void 0 !== arguments[2] && arguments[2],
            n = l(t, 'top'),
            i = l(t, 'left'),
            r = o ? -1 : 1;
        return e.top += n * r, e.bottom += n * r, e.left += i * r, e.right += i * r, e
    }

    function m(e, t) {
        var o = 'x' === t ? 'Left' : 'Top',
            n = 'Left' == o ? 'Right' : 'Bottom';
        return parseFloat(e['border' + o + 'Width'], 10) + parseFloat(e['border' + n + 'Width'], 10)
    }

    function h(e, t, o, n) {
        return J(t['offset' + e], t['scroll' + e], o['client' + e], o['offset' + e], o['scroll' + e], r(10) ? parseInt(o['offset' + e]) + parseInt(n['margin' + ('Height' === e ? 'Top' : 'Left')]) + parseInt(n['margin' + ('Height' === e ? 'Bottom' : 'Right')]) : 0)
    }

    function c(e) {
        var t = e.body,
            o = e.documentElement,
            n = r(10) && getComputedStyle(o);
        return {
            height: h('Height', t, o, n),
            width: h('Width', t, o, n)
        }
    }

    function g(e) {
        return le({}, e, {
            right: e.left + e.width,
            bottom: e.top + e.height
        })
    }

    function u(e) {
        var o = {};
        try {
            if (r(10)) {
                o = e.getBoundingClientRect();
                var n = l(e, 'top'),
                    i = l(e, 'left');
                o.top += n, o.left += i, o.bottom += n, o.right += i
            } else o = e.getBoundingClientRect()
        } catch (t) {}
        var p = {
                left: o.left,
                top: o.top,
                width: o.right - o.left,
                height: o.bottom - o.top
            },
            s = 'HTML' === e.nodeName ? c(e.ownerDocument) : {},
            d = s.width || e.clientWidth || p.right - p.left,
            a = s.height || e.clientHeight || p.bottom - p.top,
            f = e.offsetWidth - d,
            h = e.offsetHeight - a;
        if (f || h) {
            var u = t(e);
            f -= m(u, 'x'), h -= m(u, 'y'), p.width -= f, p.height -= h
        }
        return g(p)
    }

    function b(e, o) {
        var i = 2 < arguments.length && void 0 !== arguments[2] && arguments[2],
            p = r(10),
            s = 'HTML' === o.nodeName,
            d = u(e),
            a = u(o),
            l = n(e),
            m = t(o),
            h = parseFloat(m.borderTopWidth, 10),
            c = parseFloat(m.borderLeftWidth, 10);
        i && s && (a.top = J(a.top, 0), a.left = J(a.left, 0));
        var b = g({
            top: d.top - a.top - h,
            left: d.left - a.left - c,
            width: d.width,
            height: d.height
        });
        if (b.marginTop = 0, b.marginLeft = 0, !p && s) {
            var y = parseFloat(m.marginTop, 10),
                w = parseFloat(m.marginLeft, 10);
            b.top -= h - y, b.bottom -= h - y, b.left -= c - w, b.right -= c - w, b.marginTop = y, b.marginLeft = w
        }
        return (p && !i ? o.contains(l) : o === l && 'BODY' !== l.nodeName) && (b = f(b, o)), b
    }

    function y(e) {
        var t = 1 < arguments.length && void 0 !== arguments[1] && arguments[1],
            o = e.ownerDocument.documentElement,
            n = b(e, o),
            i = J(o.clientWidth, window.innerWidth || 0),
            r = J(o.clientHeight, window.innerHeight || 0),
            p = t ? 0 : l(o),
            s = t ? 0 : l(o, 'left'),
            d = {
                top: p - n.top + n.marginTop,
                left: s - n.left + n.marginLeft,
                width: i,
                height: r
            };
        return g(d)
    }

    function w(e) {
        var n = e.nodeName;
        return 'BODY' === n || 'HTML' === n ? !1 : 'fixed' === t(e, 'position') || w(o(e))
    }

    function E(e) {
        if (!e || !e.parentElement || r()) return document.documentElement;
        for (var o = e.parentElement; o && 'none' === t(o, 'transform');) o = o.parentElement;
        return o || document.documentElement
    }

    function v(e, t, i, r) {
        var p = 4 < arguments.length && void 0 !== arguments[4] && arguments[4],
            s = {
                top: 0,
                left: 0
            },
            d = p ? E(e) : a(e, t);
        if ('viewport' === r) s = y(d, p);
        else {
            var l;
            'scrollParent' === r ? (l = n(o(t)), 'BODY' === l.nodeName && (l = e.ownerDocument.documentElement)) : 'window' === r ? l = e.ownerDocument.documentElement : l = r;
            var f = b(l, d, p);
            if ('HTML' === l.nodeName && !w(d)) {
                var m = c(e.ownerDocument),
                    h = m.height,
                    g = m.width;
                s.top += f.top - f.marginTop, s.bottom = h + f.top, s.left += f.left - f.marginLeft, s.right = g + f.left
            } else s = f
        }
        i = i || 0;
        var u = 'number' == typeof i;
        return s.left += u ? i : i.left || 0, s.top += u ? i : i.top || 0, s.right -= u ? i : i.right || 0, s.bottom -= u ? i : i.bottom || 0, s
    }

    function x(e) {
        var t = e.width,
            o = e.height;
        return t * o
    }

    function O(e, t, o, n, i) {
        var r = 5 < arguments.length && void 0 !== arguments[5] ? arguments[5] : 0;
        if (-1 === e.indexOf('auto')) return e;
        var p = v(o, n, r, i),
            s = {
                top: {
                    width: p.width,
                    height: t.top - p.top
                },
                right: {
                    width: p.right - t.right,
                    height: p.height
                },
                bottom: {
                    width: p.width,
                    height: p.bottom - t.bottom
                },
                left: {
                    width: t.left - p.left,
                    height: p.height
                }
            },
            d = Object.keys(s).map(function (e) {
                return le({
                    key: e
                }, s[e], {
                    area: x(s[e])
                })
            }).sort(function (e, t) {
                return t.area - e.area
            }),
            a = d.filter(function (e) {
                var t = e.width,
                    n = e.height;
                return t >= o.clientWidth && n >= o.clientHeight
            }),
            l = 0 < a.length ? a[0].key : d[0].key,
            f = e.split('-')[1];
        return l + (f ? '-' + f : '')
    }

    function L(e, t, o) {
        var n = 3 < arguments.length && void 0 !== arguments[3] ? arguments[3] : null,
            i = n ? E(t) : a(t, o);
        return b(o, i, n)
    }

    function S(e) {
        var t = e.ownerDocument.defaultView,
            o = t.getComputedStyle(e),
            n = parseFloat(o.marginTop) + parseFloat(o.marginBottom),
            i = parseFloat(o.marginLeft) + parseFloat(o.marginRight),
            r = {
                width: e.offsetWidth + i,
                height: e.offsetHeight + n
            };
        return r
    }

    function T(e) {
        var t = {
            left: 'right',
            right: 'left',
            bottom: 'top',
            top: 'bottom'
        };
        return e.replace(/left|right|bottom|top/g, function (e) {
            return t[e]
        })
    }

    function D(e, t, o) {
        o = o.split('-')[0];
        var n = S(e),
            i = {
                width: n.width,
                height: n.height
            },
            r = -1 !== ['right', 'left'].indexOf(o),
            p = r ? 'top' : 'left',
            s = r ? 'left' : 'top',
            d = r ? 'height' : 'width',
            a = r ? 'width' : 'height';
        return i[p] = t[p] + t[d] / 2 - n[d] / 2, i[s] = o === s ? t[s] - n[a] : t[T(s)], i
    }

    function C(e, t) {
        return Array.prototype.find ? e.find(t) : e.filter(t)[0]
    }

    function N(e, t, o) {
        if (Array.prototype.findIndex) return e.findIndex(function (e) {
            return e[t] === o
        });
        var n = C(e, function (e) {
            return e[t] === o
        });
        return e.indexOf(n)
    }

    function P(t, o, n) {
        var i = void 0 === n ? t : t.slice(0, N(t, 'name', n));
        return i.forEach(function (t) {
            t['function'] && console.warn('`modifier.function` is deprecated, use `modifier.fn`!');
            var n = t['function'] || t.fn;
            t.enabled && e(n) && (o.offsets.popper = g(o.offsets.popper), o.offsets.reference = g(o.offsets.reference), o = n(o, t))
        }), o
    }

    function k() {
        if (!this.state.isDestroyed) {
            var e = {
                instance: this,
                styles: {},
                arrowStyles: {},
                attributes: {},
                flipped: !1,
                offsets: {}
            };
            e.offsets.reference = L(this.state, this.popper, this.reference, this.options.positionFixed), e.placement = O(this.options.placement, e.offsets.reference, this.popper, this.reference, this.options.modifiers.flip.boundariesElement, this.options.modifiers.flip.padding), e.originalPlacement = e.placement, e.positionFixed = this.options.positionFixed, e.offsets.popper = D(this.popper, e.offsets.reference, e.placement), e.offsets.popper.position = this.options.positionFixed ? 'fixed' : 'absolute', e = P(this.modifiers, e), this.state.isCreated ? this.options.onUpdate(e) : (this.state.isCreated = !0, this.options.onCreate(e))
        }
    }

    function W(e, t) {
        return e.some(function (e) {
            var o = e.name,
                n = e.enabled;
            return n && o === t
        })
    }

    function H(e) {
        for (var t = [!1, 'ms', 'Webkit', 'Moz', 'O'], o = e.charAt(0).toUpperCase() + e.slice(1), n = 0; n < t.length; n++) {
            var i = t[n],
                r = i ? '' + i + o : e;
            if ('undefined' != typeof document.body.style[r]) return r
        }
        return null
    }

    function B() {
        return this.state.isDestroyed = !0, W(this.modifiers, 'applyStyle') && (this.popper.removeAttribute('x-placement'), this.popper.style.position = '', this.popper.style.top = '', this.popper.style.left = '', this.popper.style.right = '', this.popper.style.bottom = '', this.popper.style.willChange = '', this.popper.style[H('transform')] = ''), this.disableEventListeners(), this.options.removeOnDestroy && this.popper.parentNode.removeChild(this.popper), this
    }

    function A(e) {
        var t = e.ownerDocument;
        return t ? t.defaultView : window
    }

    function M(e, t, o, i) {
        var r = 'BODY' === e.nodeName,
            p = r ? e.ownerDocument.defaultView : e;
        p.addEventListener(t, o, {
            passive: !0
        }), r || M(n(p.parentNode), t, o, i), i.push(p)
    }

    function F(e, t, o, i) {
        o.updateBound = i, A(e).addEventListener('resize', o.updateBound, {
            passive: !0
        });
        var r = n(e);
        return M(r, 'scroll', o.updateBound, o.scrollParents), o.scrollElement = r, o.eventsEnabled = !0, o
    }

    function I() {
        this.state.eventsEnabled || (this.state = F(this.reference, this.options, this.state, this.scheduleUpdate))
    }

    function R(e, t) {
        return A(e).removeEventListener('resize', t.updateBound), t.scrollParents.forEach(function (e) {
            e.removeEventListener('scroll', t.updateBound)
        }), t.updateBound = null, t.scrollParents = [], t.scrollElement = null, t.eventsEnabled = !1, t
    }

    function U() {
        this.state.eventsEnabled && (cancelAnimationFrame(this.scheduleUpdate), this.state = R(this.reference, this.state))
    }

    function Y(e) {
        return '' !== e && !isNaN(parseFloat(e)) && isFinite(e)
    }

    function V(e, t) {
        Object.keys(t).forEach(function (o) {
            var n = ''; - 1 !== ['width', 'height', 'top', 'right', 'bottom', 'left'].indexOf(o) && Y(t[o]) && (n = 'px'), e.style[o] = t[o] + n
        })
    }

    function j(e, t) {
        Object.keys(t).forEach(function (o) {
            var n = t[o];
            !1 === n ? e.removeAttribute(o) : e.setAttribute(o, t[o])
        })
    }

    function q(e, t, o) {
        var n = C(e, function (e) {
                var o = e.name;
                return o === t
            }),
            i = !!n && e.some(function (e) {
                return e.name === o && e.enabled && e.order < n.order
            });
        if (!i) {
            var r = '`' + t + '`';
            console.warn('`' + o + '`' + ' modifier is required by ' + r + ' modifier in order to work, be sure to include it before ' + r + '!')
        }
        return i
    }

    function K(e) {
        return 'end' === e ? 'start' : 'start' === e ? 'end' : e
    }

    function G(e) {
        var t = 1 < arguments.length && void 0 !== arguments[1] && arguments[1],
            o = me.indexOf(e),
            n = me.slice(o + 1).concat(me.slice(0, o));
        return t ? n.reverse() : n
    }

    function z(e, t, o, n) {
        var i = e.match(/((?:\-|\+)?\d*\.?\d*)(.*)/),
            r = +i[1],
            p = i[2];
        if (!r) return e;
        if (0 === p.indexOf('%')) {
            var s;
            switch (p) {
                case '%p':
                    s = o;
                    break;
                case '%':
                case '%r':
                default:
                    s = n;
            }
            var d = g(s);
            return d[t] / 100 * r
        }
        if ('vh' === p || 'vw' === p) {
            var a;
            return a = 'vh' === p ? J(document.documentElement.clientHeight, window.innerHeight || 0) : J(document.documentElement.clientWidth, window.innerWidth || 0), a / 100 * r
        }
        return r
    }

    function _(e, t, o, n) {
        var i = [0, 0],
            r = -1 !== ['right', 'left'].indexOf(n),
            p = e.split(/(\+|\-)/).map(function (e) {
                return e.trim()
            }),
            s = p.indexOf(C(p, function (e) {
                return -1 !== e.search(/,|\s/)
            }));
        p[s] && -1 === p[s].indexOf(',') && console.warn('Offsets separated by white space(s) are deprecated, use a comma (,) instead.');
        var d = /\s*,\s*|\s+/,
            a = -1 === s ? [p] : [p.slice(0, s).concat([p[s].split(d)[0]]), [p[s].split(d)[1]].concat(p.slice(s + 1))];
        return a = a.map(function (e, n) {
            var i = (1 === n ? !r : r) ? 'height' : 'width',
                p = !1;
            return e.reduce(function (e, t) {
                return '' === e[e.length - 1] && -1 !== ['+', '-'].indexOf(t) ? (e[e.length - 1] = t, p = !0, e) : p ? (e[e.length - 1] += t, p = !1, e) : e.concat(t)
            }, []).map(function (e) {
                return z(e, i, t, o)
            })
        }), a.forEach(function (e, t) {
            e.forEach(function (o, n) {
                Y(o) && (i[t] += o * ('-' === e[n - 1] ? -1 : 1))
            })
        }), i
    }

    function X(e, t) {
        var o, n = t.offset,
            i = e.placement,
            r = e.offsets,
            p = r.popper,
            s = r.reference,
            d = i.split('-')[0];
        return o = Y(+n) ? [+n, 0] : _(n, p, s, d), 'left' === d ? (p.top += o[0], p.left -= o[1]) : 'right' === d ? (p.top += o[0], p.left += o[1]) : 'top' === d ? (p.left += o[0], p.top -= o[1]) : 'bottom' === d && (p.left += o[0], p.top += o[1]), e.popper = p, e
    }
    for (var Q = Math.min, Z = Math.round, $ = Math.floor, J = Math.max, ee = 'undefined' != typeof window && 'undefined' != typeof document, te = ['Edge', 'Trident', 'Firefox'], oe = 0, ne = 0; ne < te.length; ne += 1)
        if (ee && 0 <= navigator.userAgent.indexOf(te[ne])) {
            oe = 1;
            break
        } var i = ee && window.Promise,
        ie = i ? function (e) {
            var t = !1;
            return function () {
                t || (t = !0, window.Promise.resolve().then(function () {
                    t = !1, e()
                }))
            }
        } : function (e) {
            var t = !1;
            return function () {
                t || (t = !0, setTimeout(function () {
                    t = !1, e()
                }, oe))
            }
        },
        re = ee && !!(window.MSInputMethodContext && document.documentMode),
        pe = ee && /MSIE 10/.test(navigator.userAgent),
        se = function (e, t) {
            if (!(e instanceof t)) throw new TypeError('Cannot call a class as a function')
        },
        de = function () {
            function e(e, t) {
                for (var o, n = 0; n < t.length; n++) o = t[n], o.enumerable = o.enumerable || !1, o.configurable = !0, 'value' in o && (o.writable = !0), Object.defineProperty(e, o.key, o)
            }
            return function (t, o, n) {
                return o && e(t.prototype, o), n && e(t, n), t
            }
        }(),
        ae = function (e, t, o) {
            return t in e ? Object.defineProperty(e, t, {
                value: o,
                enumerable: !0,
                configurable: !0,
                writable: !0
            }) : e[t] = o, e
        },
        le = Object.assign || function (e) {
            for (var t, o = 1; o < arguments.length; o++)
                for (var n in t = arguments[o], t) Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
            return e
        },
        fe = ['auto-start', 'auto', 'auto-end', 'top-start', 'top', 'top-end', 'right-start', 'right', 'right-end', 'bottom-end', 'bottom', 'bottom-start', 'left-end', 'left', 'left-start'],
        me = fe.slice(3),
        he = {
            FLIP: 'flip',
            CLOCKWISE: 'clockwise',
            COUNTERCLOCKWISE: 'counterclockwise'
        },
        ce = function () {
            function t(o, n) {
                var i = this,
                    r = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : {};
                se(this, t), this.scheduleUpdate = function () {
                    return requestAnimationFrame(i.update)
                }, this.update = ie(this.update.bind(this)), this.options = le({}, t.Defaults, r), this.state = {
                    isDestroyed: !1,
                    isCreated: !1,
                    scrollParents: []
                }, this.reference = o && o.jquery ? o[0] : o, this.popper = n && n.jquery ? n[0] : n, this.options.modifiers = {}, Object.keys(le({}, t.Defaults.modifiers, r.modifiers)).forEach(function (e) {
                    i.options.modifiers[e] = le({}, t.Defaults.modifiers[e] || {}, r.modifiers ? r.modifiers[e] : {})
                }), this.modifiers = Object.keys(this.options.modifiers).map(function (e) {
                    return le({
                        name: e
                    }, i.options.modifiers[e])
                }).sort(function (e, t) {
                    return e.order - t.order
                }), this.modifiers.forEach(function (t) {
                    t.enabled && e(t.onLoad) && t.onLoad(i.reference, i.popper, i.options, t, i.state)
                }), this.update();
                var p = this.options.eventsEnabled;
                p && this.enableEventListeners(), this.state.eventsEnabled = p
            }
            return de(t, [{
                key: 'update',
                value: function () {
                    return k.call(this)
                }
            }, {
                key: 'destroy',
                value: function () {
                    return B.call(this)
                }
            }, {
                key: 'enableEventListeners',
                value: function () {
                    return I.call(this)
                }
            }, {
                key: 'disableEventListeners',
                value: function () {
                    return U.call(this)
                }
            }]), t
        }();
    return ce.Utils = ('undefined' == typeof window ? global : window).PopperUtils, ce.placements = fe, ce.Defaults = {
        placement: 'bottom',
        positionFixed: !1,
        eventsEnabled: !0,
        removeOnDestroy: !1,
        onCreate: function () {},
        onUpdate: function () {},
        modifiers: {
            shift: {
                order: 100,
                enabled: !0,
                fn: function (e) {
                    var t = e.placement,
                        o = t.split('-')[0],
                        n = t.split('-')[1];
                    if (n) {
                        var i = e.offsets,
                            r = i.reference,
                            p = i.popper,
                            s = -1 !== ['bottom', 'top'].indexOf(o),
                            d = s ? 'left' : 'top',
                            a = s ? 'width' : 'height',
                            l = {
                                start: ae({}, d, r[d]),
                                end: ae({}, d, r[d] + r[a] - p[a])
                            };
                        e.offsets.popper = le({}, p, l[n])
                    }
                    return e
                }
            },
            offset: {
                order: 200,
                enabled: !0,
                fn: X,
                offset: 0
            },
            preventOverflow: {
                order: 300,
                enabled: !0,
                fn: function (e, t) {
                    var o = t.boundariesElement || p(e.instance.popper);
                    e.instance.reference === o && (o = p(o));
                    var n = H('transform'),
                        i = e.instance.popper.style,
                        r = i.top,
                        s = i.left,
                        d = i[n];
                    i.top = '', i.left = '', i[n] = '';
                    var a = v(e.instance.popper, e.instance.reference, t.padding, o, e.positionFixed);
                    i.top = r, i.left = s, i[n] = d, t.boundaries = a;
                    var l = t.priority,
                        f = e.offsets.popper,
                        m = {
                            primary: function (e) {
                                var o = f[e];
                                return f[e] < a[e] && !t.escapeWithReference && (o = J(f[e], a[e])), ae({}, e, o)
                            },
                            secondary: function (e) {
                                var o = 'right' === e ? 'left' : 'top',
                                    n = f[o];
                                return f[e] > a[e] && !t.escapeWithReference && (n = Q(f[o], a[e] - ('right' === e ? f.width : f.height))), ae({}, o, n)
                            }
                        };
                    return l.forEach(function (e) {
                        var t = -1 === ['left', 'top'].indexOf(e) ? 'secondary' : 'primary';
                        f = le({}, f, m[t](e))
                    }), e.offsets.popper = f, e
                },
                priority: ['left', 'right', 'top', 'bottom'],
                padding: 5,
                boundariesElement: 'scrollParent'
            },
            keepTogether: {
                order: 400,
                enabled: !0,
                fn: function (e) {
                    var t = e.offsets,
                        o = t.popper,
                        n = t.reference,
                        i = e.placement.split('-')[0],
                        r = $,
                        p = -1 !== ['top', 'bottom'].indexOf(i),
                        s = p ? 'right' : 'bottom',
                        d = p ? 'left' : 'top',
                        a = p ? 'width' : 'height';
                    return o[s] < r(n[d]) && (e.offsets.popper[d] = r(n[d]) - o[a]), o[d] > r(n[s]) && (e.offsets.popper[d] = r(n[s])), e
                }
            },
            arrow: {
                order: 500,
                enabled: !0,
                fn: function (e, o) {
                    var n;
                    if (!q(e.instance.modifiers, 'arrow', 'keepTogether')) return e;
                    var i = o.element;
                    if ('string' == typeof i) {
                        if (i = e.instance.popper.querySelector(i), !i) return e;
                    } else if (!e.instance.popper.contains(i)) return console.warn('WARNING: `arrow.element` must be child of its popper element!'), e;
                    var r = e.placement.split('-')[0],
                        p = e.offsets,
                        s = p.popper,
                        d = p.reference,
                        a = -1 !== ['left', 'right'].indexOf(r),
                        l = a ? 'height' : 'width',
                        f = a ? 'Top' : 'Left',
                        m = f.toLowerCase(),
                        h = a ? 'left' : 'top',
                        c = a ? 'bottom' : 'right',
                        u = S(i)[l];
                    d[c] - u < s[m] && (e.offsets.popper[m] -= s[m] - (d[c] - u)), d[m] + u > s[c] && (e.offsets.popper[m] += d[m] + u - s[c]), e.offsets.popper = g(e.offsets.popper);
                    var b = d[m] + d[l] / 2 - u / 2,
                        y = t(e.instance.popper),
                        w = parseFloat(y['margin' + f], 10),
                        E = parseFloat(y['border' + f + 'Width'], 10),
                        v = b - e.offsets.popper[m] - w - E;
                    return v = J(Q(s[l] - u, v), 0), e.arrowElement = i, e.offsets.arrow = (n = {}, ae(n, m, Z(v)), ae(n, h, ''), n), e
                },
                element: '[x-arrow]'
            },
            flip: {
                order: 600,
                enabled: !0,
                fn: function (e, t) {
                    if (W(e.instance.modifiers, 'inner')) return e;
                    if (e.flipped && e.placement === e.originalPlacement) return e;
                    var o = v(e.instance.popper, e.instance.reference, t.padding, t.boundariesElement, e.positionFixed),
                        n = e.placement.split('-')[0],
                        i = T(n),
                        r = e.placement.split('-')[1] || '',
                        p = [];
                    switch (t.behavior) {
                        case he.FLIP:
                            p = [n, i];
                            break;
                        case he.CLOCKWISE:
                            p = G(n);
                            break;
                        case he.COUNTERCLOCKWISE:
                            p = G(n, !0);
                            break;
                        default:
                            p = t.behavior;
                    }
                    return p.forEach(function (s, d) {
                        if (n !== s || p.length === d + 1) return e;
                        n = e.placement.split('-')[0], i = T(n);
                        var a = e.offsets.popper,
                            l = e.offsets.reference,
                            f = $,
                            m = 'left' === n && f(a.right) > f(l.left) || 'right' === n && f(a.left) < f(l.right) || 'top' === n && f(a.bottom) > f(l.top) || 'bottom' === n && f(a.top) < f(l.bottom),
                            h = f(a.left) < f(o.left),
                            c = f(a.right) > f(o.right),
                            g = f(a.top) < f(o.top),
                            u = f(a.bottom) > f(o.bottom),
                            b = 'left' === n && h || 'right' === n && c || 'top' === n && g || 'bottom' === n && u,
                            y = -1 !== ['top', 'bottom'].indexOf(n),
                            w = !!t.flipVariations && (y && 'start' === r && h || y && 'end' === r && c || !y && 'start' === r && g || !y && 'end' === r && u);
                        (m || b || w) && (e.flipped = !0, (m || b) && (n = p[d + 1]), w && (r = K(r)), e.placement = n + (r ? '-' + r : ''), e.offsets.popper = le({}, e.offsets.popper, D(e.instance.popper, e.offsets.reference, e.placement)), e = P(e.instance.modifiers, e, 'flip'))
                    }), e
                },
                behavior: 'flip',
                padding: 5,
                boundariesElement: 'viewport'
            },
            inner: {
                order: 700,
                enabled: !1,
                fn: function (e) {
                    var t = e.placement,
                        o = t.split('-')[0],
                        n = e.offsets,
                        i = n.popper,
                        r = n.reference,
                        p = -1 !== ['left', 'right'].indexOf(o),
                        s = -1 === ['top', 'left'].indexOf(o);
                    return i[p ? 'left' : 'top'] = r[o] - (s ? i[p ? 'width' : 'height'] : 0), e.placement = T(t), e.offsets.popper = g(i), e
                }
            },
            hide: {
                order: 800,
                enabled: !0,
                fn: function (e) {
                    if (!q(e.instance.modifiers, 'hide', 'preventOverflow')) return e;
                    var t = e.offsets.reference,
                        o = C(e.instance.modifiers, function (e) {
                            return 'preventOverflow' === e.name
                        }).boundaries;
                    if (t.bottom < o.top || t.left > o.right || t.top > o.bottom || t.right < o.left) {
                        if (!0 === e.hide) return e;
                        e.hide = !0, e.attributes['x-out-of-boundaries'] = ''
                    } else {
                        if (!1 === e.hide) return e;
                        e.hide = !1, e.attributes['x-out-of-boundaries'] = !1
                    }
                    return e
                }
            },
            computeStyle: {
                order: 850,
                enabled: !0,
                fn: function (e, t) {
                    var o = t.x,
                        n = t.y,
                        i = e.offsets.popper,
                        r = C(e.instance.modifiers, function (e) {
                            return 'applyStyle' === e.name
                        }).gpuAcceleration;
                    void 0 !== r && console.warn('WARNING: `gpuAcceleration` option moved to `computeStyle` modifier and will not be supported in future versions of Popper.js!');
                    var s, d, a = void 0 === r ? t.gpuAcceleration : r,
                        l = p(e.instance.popper),
                        f = u(l),
                        m = {
                            position: i.position
                        },
                        h = {
                            left: $(i.left),
                            top: Z(i.top),
                            bottom: Z(i.bottom),
                            right: $(i.right)
                        },
                        c = 'bottom' === o ? 'top' : 'bottom',
                        g = 'right' === n ? 'left' : 'right',
                        b = H('transform');
                    if (d = 'bottom' == c ? 'HTML' === l.nodeName ? -l.clientHeight + h.bottom : -f.height + h.bottom : h.top, s = 'right' == g ? 'HTML' === l.nodeName ? -l.clientWidth + h.right : -f.width + h.right : h.left, a && b) m[b] = 'translate3d(' + s + 'px, ' + d + 'px, 0)', m[c] = 0, m[g] = 0, m.willChange = 'transform';
                    else {
                        var y = 'bottom' == c ? -1 : 1,
                            w = 'right' == g ? -1 : 1;
                        m[c] = d * y, m[g] = s * w, m.willChange = c + ', ' + g
                    }
                    var E = {
                        "x-placement": e.placement
                    };
                    return e.attributes = le({}, E, e.attributes), e.styles = le({}, m, e.styles), e.arrowStyles = le({}, e.offsets.arrow, e.arrowStyles), e
                },
                gpuAcceleration: !0,
                x: 'bottom',
                y: 'right'
            },
            applyStyle: {
                order: 900,
                enabled: !0,
                fn: function (e) {
                    return V(e.instance.popper, e.styles), j(e.instance.popper, e.attributes), e.arrowElement && Object.keys(e.arrowStyles).length && V(e.arrowElement, e.arrowStyles), e
                },
                onLoad: function (e, t, o, n, i) {
                    var r = L(i, t, e, o.positionFixed),
                        p = O(o.placement, r, t, e, o.modifiers.flip.boundariesElement, o.modifiers.flip.padding);
                    return t.setAttribute('x-placement', p), V(t, {
                        position: o.positionFixed ? 'fixed' : 'absolute'
                    }), o
                },
                gpuAcceleration: void 0
            }
        }
    }, ce
});
//# sourceMappingURL=popper.min.js.map

/*!
 * Bootstrap v4.0.0 (https://getbootstrap.com)
 * Copyright 2011-2018 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 */
! function (t, e) {
    "object" == typeof exports && "undefined" != typeof module ? e(exports, require("jquery"), require("popper.js")) : "function" == typeof define && define.amd ? define(["exports", "jquery", "popper.js"], e) : e(t.bootstrap = {}, t.jQuery, t.Popper)
}(this, function (t, e, n) {
    "use strict";

    function i(t, e) {
        for (var n = 0; n < e.length; n++) {
            var i = e[n];
            i.enumerable = i.enumerable || !1, i.configurable = !0, "value" in i && (i.writable = !0), Object.defineProperty(t, i.key, i)
        }
    }

    function s(t, e, n) {
        return e && i(t.prototype, e), n && i(t, n), t
    }

    function r() {
        return (r = Object.assign || function (t) {
            for (var e = 1; e < arguments.length; e++) {
                var n = arguments[e];
                for (var i in n) Object.prototype.hasOwnProperty.call(n, i) && (t[i] = n[i])
            }
            return t
        }).apply(this, arguments)
    }
    e = e && e.hasOwnProperty("default") ? e.default : e, n = n && n.hasOwnProperty("default") ? n.default : n;
    var o, a, l, h, c, u, f, d, _, g, p, m, v, E, T, y, C, I, A, b, D, S, w, N, O, k, P = function (t) {
            var e = !1;

            function n(e) {
                var n = this,
                    s = !1;
                return t(this).one(i.TRANSITION_END, function () {
                    s = !0
                }), setTimeout(function () {
                    s || i.triggerTransitionEnd(n)
                }, e), this
            }
            var i = {
                TRANSITION_END: "bsTransitionEnd",
                getUID: function (t) {
                    do {
                        t += ~~(1e6 * Math.random())
                    } while (document.getElementById(t));
                    return t
                },
                getSelectorFromElement: function (e) {
                    var n, i = e.getAttribute("data-target");
                    i && "#" !== i || (i = e.getAttribute("href") || ""), "#" === i.charAt(0) && (n = i, i = n = "function" == typeof t.escapeSelector ? t.escapeSelector(n).substr(1) : n.replace(/(:|\.|\[|\]|,|=|@)/g, "\\$1"));
                    try {
                        return t(document).find(i).length > 0 ? i : null
                    } catch (t) {
                        return null
                    }
                },
                reflow: function (t) {
                    return t.offsetHeight
                },
                triggerTransitionEnd: function (n) {
                    t(n).trigger(e.end)
                },
                supportsTransitionEnd: function () {
                    return Boolean(e)
                },
                isElement: function (t) {
                    return (t[0] || t).nodeType
                },
                typeCheckConfig: function (t, e, n) {
                    for (var s in n)
                        if (Object.prototype.hasOwnProperty.call(n, s)) {
                            var r = n[s],
                                o = e[s],
                                a = o && i.isElement(o) ? "element" : (l = o, {}.toString.call(l).match(/\s([a-zA-Z]+)/)[1].toLowerCase());
                            if (!new RegExp(r).test(a)) throw new Error(t.toUpperCase() + ': Option "' + s + '" provided type "' + a + '" but expected type "' + r + '".')
                        } var l
                }
            };
            return e = ("undefined" == typeof window || !window.QUnit) && {
                end: "transitionend"
            }, t.fn.emulateTransitionEnd = n, i.supportsTransitionEnd() && (t.event.special[i.TRANSITION_END] = {
                bindType: e.end,
                delegateType: e.end,
                handle: function (e) {
                    if (t(e.target).is(this)) return e.handleObj.handler.apply(this, arguments)
                }
            }), i
        }(e),
        L = (a = "alert", h = "." + (l = "bs.alert"), c = (o = e).fn[a], u = {
            CLOSE: "close" + h,
            CLOSED: "closed" + h,
            CLICK_DATA_API: "click" + h + ".data-api"
        }, f = "alert", d = "fade", _ = "show", g = function () {
            function t(t) {
                this._element = t
            }
            var e = t.prototype;
            return e.close = function (t) {
                t = t || this._element;
                var e = this._getRootElement(t);
                this._triggerCloseEvent(e).isDefaultPrevented() || this._removeElement(e)
            }, e.dispose = function () {
                o.removeData(this._element, l), this._element = null
            }, e._getRootElement = function (t) {
                var e = P.getSelectorFromElement(t),
                    n = !1;
                return e && (n = o(e)[0]), n || (n = o(t).closest("." + f)[0]), n
            }, e._triggerCloseEvent = function (t) {
                var e = o.Event(u.CLOSE);
                return o(t).trigger(e), e
            }, e._removeElement = function (t) {
                var e = this;
                o(t).removeClass(_), P.supportsTransitionEnd() && o(t).hasClass(d) ? o(t).one(P.TRANSITION_END, function (n) {
                    return e._destroyElement(t, n)
                }).emulateTransitionEnd(150) : this._destroyElement(t)
            }, e._destroyElement = function (t) {
                o(t).detach().trigger(u.CLOSED).remove()
            }, t._jQueryInterface = function (e) {
                return this.each(function () {
                    var n = o(this),
                        i = n.data(l);
                    i || (i = new t(this), n.data(l, i)), "close" === e && i[e](this)
                })
            }, t._handleDismiss = function (t) {
                return function (e) {
                    e && e.preventDefault(), t.close(this)
                }
            }, s(t, null, [{
                key: "VERSION",
                get: function () {
                    return "4.0.0"
                }
            }]), t
        }(), o(document).on(u.CLICK_DATA_API, '[data-dismiss="alert"]', g._handleDismiss(new g)), o.fn[a] = g._jQueryInterface, o.fn[a].Constructor = g, o.fn[a].noConflict = function () {
            return o.fn[a] = c, g._jQueryInterface
        }, g),
        R = (m = "button", E = "." + (v = "bs.button"), T = ".data-api", y = (p = e).fn[m], C = "active", I = "btn", A = "focus", b = '[data-toggle^="button"]', D = '[data-toggle="buttons"]', S = "input", w = ".active", N = ".btn", O = {
            CLICK_DATA_API: "click" + E + T,
            FOCUS_BLUR_DATA_API: "focus" + E + T + " blur" + E + T
        }, k = function () {
            function t(t) {
                this._element = t
            }
            var e = t.prototype;
            return e.toggle = function () {
                var t = !0,
                    e = !0,
                    n = p(this._element).closest(D)[0];
                if (n) {
                    var i = p(this._element).find(S)[0];
                    if (i) {
                        if ("radio" === i.type)
                            if (i.checked && p(this._element).hasClass(C)) t = !1;
                            else {
                                var s = p(n).find(w)[0];
                                s && p(s).removeClass(C)
                            } if (t) {
                            if (i.hasAttribute("disabled") || n.hasAttribute("disabled") || i.classList.contains("disabled") || n.classList.contains("disabled")) return;
                            i.checked = !p(this._element).hasClass(C), p(i).trigger("change")
                        }
                        i.focus(), e = !1
                    }
                }
                e && this._element.setAttribute("aria-pressed", !p(this._element).hasClass(C)), t && p(this._element).toggleClass(C)
            }, e.dispose = function () {
                p.removeData(this._element, v), this._element = null
            }, t._jQueryInterface = function (e) {
                return this.each(function () {
                    var n = p(this).data(v);
                    n || (n = new t(this), p(this).data(v, n)), "toggle" === e && n[e]()
                })
            }, s(t, null, [{
                key: "VERSION",
                get: function () {
                    return "4.0.0"
                }
            }]), t
        }(), p(document).on(O.CLICK_DATA_API, b, function (t) {
            t.preventDefault();
            var e = t.target;
            p(e).hasClass(I) || (e = p(e).closest(N)), k._jQueryInterface.call(p(e), "toggle")
        }).on(O.FOCUS_BLUR_DATA_API, b, function (t) {
            var e = p(t.target).closest(N)[0];
            p(e).toggleClass(A, /^focus(in)?$/.test(t.type))
        }), p.fn[m] = k._jQueryInterface, p.fn[m].Constructor = k, p.fn[m].noConflict = function () {
            return p.fn[m] = y, k._jQueryInterface
        }, k),
        j = function (t) {
            var e = "carousel",
                n = "bs.carousel",
                i = "." + n,
                o = t.fn[e],
                a = {
                    interval: 5e3,
                    keyboard: !0,
                    slide: !1,
                    pause: "hover",
                    wrap: !0
                },
                l = {
                    interval: "(number|boolean)",
                    keyboard: "boolean",
                    slide: "(boolean|string)",
                    pause: "(string|boolean)",
                    wrap: "boolean"
                },
                h = "next",
                c = "prev",
                u = "left",
                f = "right",
                d = {
                    SLIDE: "slide" + i,
                    SLID: "slid" + i,
                    KEYDOWN: "keydown" + i,
                    MOUSEENTER: "mouseenter" + i,
                    MOUSELEAVE: "mouseleave" + i,
                    TOUCHEND: "touchend" + i,
                    LOAD_DATA_API: "load" + i + ".data-api",
                    CLICK_DATA_API: "click" + i + ".data-api"
                },
                _ = "carousel",
                g = "active",
                p = "slide",
                m = "carousel-item-right",
                v = "carousel-item-left",
                E = "carousel-item-next",
                T = "carousel-item-prev",
                y = {
                    ACTIVE: ".active",
                    ACTIVE_ITEM: ".active.carousel-item",
                    ITEM: ".carousel-item",
                    NEXT_PREV: ".carousel-item-next, .carousel-item-prev",
                    INDICATORS: ".carousel-indicators",
                    DATA_SLIDE: "[data-slide], [data-slide-to]",
                    DATA_RIDE: '[data-ride="carousel"]'
                },
                C = function () {
                    function o(e, n) {
                        this._items = null, this._interval = null, this._activeElement = null, this._isPaused = !1, this._isSliding = !1, this.touchTimeout = null, this._config = this._getConfig(n), this._element = t(e)[0], this._indicatorsElement = t(this._element).find(y.INDICATORS)[0], this._addEventListeners()
                    }
                    var C = o.prototype;
                    return C.next = function () {
                        this._isSliding || this._slide(h)
                    }, C.nextWhenVisible = function () {
                        !document.hidden && t(this._element).is(":visible") && "hidden" !== t(this._element).css("visibility") && this.next()
                    }, C.prev = function () {
                        this._isSliding || this._slide(c)
                    }, C.pause = function (e) {
                        e || (this._isPaused = !0), t(this._element).find(y.NEXT_PREV)[0] && P.supportsTransitionEnd() && (P.triggerTransitionEnd(this._element), this.cycle(!0)), clearInterval(this._interval), this._interval = null
                    }, C.cycle = function (t) {
                        t || (this._isPaused = !1), this._interval && (clearInterval(this._interval), this._interval = null), this._config.interval && !this._isPaused && (this._interval = setInterval((document.visibilityState ? this.nextWhenVisible : this.next).bind(this), this._config.interval))
                    }, C.to = function (e) {
                        var n = this;
                        this._activeElement = t(this._element).find(y.ACTIVE_ITEM)[0];
                        var i = this._getItemIndex(this._activeElement);
                        if (!(e > this._items.length - 1 || e < 0))
                            if (this._isSliding) t(this._element).one(d.SLID, function () {
                                return n.to(e)
                            });
                            else {
                                if (i === e) return this.pause(), void this.cycle();
                                var s = e > i ? h : c;
                                this._slide(s, this._items[e])
                            }
                    }, C.dispose = function () {
                        t(this._element).off(i), t.removeData(this._element, n), this._items = null, this._config = null, this._element = null, this._interval = null, this._isPaused = null, this._isSliding = null, this._activeElement = null, this._indicatorsElement = null
                    }, C._getConfig = function (t) {
                        return t = r({}, a, t), P.typeCheckConfig(e, t, l), t
                    }, C._addEventListeners = function () {
                        var e = this;
                        this._config.keyboard && t(this._element).on(d.KEYDOWN, function (t) {
                            return e._keydown(t)
                        }), "hover" === this._config.pause && (t(this._element).on(d.MOUSEENTER, function (t) {
                            return e.pause(t)
                        }).on(d.MOUSELEAVE, function (t) {
                            return e.cycle(t)
                        }), "ontouchstart" in document.documentElement && t(this._element).on(d.TOUCHEND, function () {
                            e.pause(), e.touchTimeout && clearTimeout(e.touchTimeout), e.touchTimeout = setTimeout(function (t) {
                                return e.cycle(t)
                            }, 500 + e._config.interval)
                        }))
                    }, C._keydown = function (t) {
                        if (!/input|textarea/i.test(t.target.tagName)) switch (t.which) {
                            case 37:
                                t.preventDefault(), this.prev();
                                break;
                            case 39:
                                t.preventDefault(), this.next()
                        }
                    }, C._getItemIndex = function (e) {
                        return this._items = t.makeArray(t(e).parent().find(y.ITEM)), this._items.indexOf(e)
                    }, C._getItemByDirection = function (t, e) {
                        var n = t === h,
                            i = t === c,
                            s = this._getItemIndex(e),
                            r = this._items.length - 1;
                        if ((i && 0 === s || n && s === r) && !this._config.wrap) return e;
                        var o = (s + (t === c ? -1 : 1)) % this._items.length;
                        return -1 === o ? this._items[this._items.length - 1] : this._items[o]
                    }, C._triggerSlideEvent = function (e, n) {
                        var i = this._getItemIndex(e),
                            s = this._getItemIndex(t(this._element).find(y.ACTIVE_ITEM)[0]),
                            r = t.Event(d.SLIDE, {
                                relatedTarget: e,
                                direction: n,
                                from: s,
                                to: i
                            });
                        return t(this._element).trigger(r), r
                    }, C._setActiveIndicatorElement = function (e) {
                        if (this._indicatorsElement) {
                            t(this._indicatorsElement).find(y.ACTIVE).removeClass(g);
                            var n = this._indicatorsElement.children[this._getItemIndex(e)];
                            n && t(n).addClass(g)
                        }
                    }, C._slide = function (e, n) {
                        var i, s, r, o = this,
                            a = t(this._element).find(y.ACTIVE_ITEM)[0],
                            l = this._getItemIndex(a),
                            c = n || a && this._getItemByDirection(e, a),
                            _ = this._getItemIndex(c),
                            C = Boolean(this._interval);
                        if (e === h ? (i = v, s = E, r = u) : (i = m, s = T, r = f), c && t(c).hasClass(g)) this._isSliding = !1;
                        else if (!this._triggerSlideEvent(c, r).isDefaultPrevented() && a && c) {
                            this._isSliding = !0, C && this.pause(), this._setActiveIndicatorElement(c);
                            var I = t.Event(d.SLID, {
                                relatedTarget: c,
                                direction: r,
                                from: l,
                                to: _
                            });
                            P.supportsTransitionEnd() && t(this._element).hasClass(p) ? (t(c).addClass(s), P.reflow(c), t(a).addClass(i), t(c).addClass(i), t(a).one(P.TRANSITION_END, function () {
                                t(c).removeClass(i + " " + s).addClass(g), t(a).removeClass(g + " " + s + " " + i), o._isSliding = !1, setTimeout(function () {
                                    return t(o._element).trigger(I)
                                }, 0)
                            }).emulateTransitionEnd(600)) : (t(a).removeClass(g), t(c).addClass(g), this._isSliding = !1, t(this._element).trigger(I)), C && this.cycle()
                        }
                    }, o._jQueryInterface = function (e) {
                        return this.each(function () {
                            var i = t(this).data(n),
                                s = r({}, a, t(this).data());
                            "object" == typeof e && (s = r({}, s, e));
                            var l = "string" == typeof e ? e : s.slide;
                            if (i || (i = new o(this, s), t(this).data(n, i)), "number" == typeof e) i.to(e);
                            else if ("string" == typeof l) {
                                if ("undefined" == typeof i[l]) throw new TypeError('No method named "' + l + '"');
                                i[l]()
                            } else s.interval && (i.pause(), i.cycle())
                        })
                    }, o._dataApiClickHandler = function (e) {
                        var i = P.getSelectorFromElement(this);
                        if (i) {
                            var s = t(i)[0];
                            if (s && t(s).hasClass(_)) {
                                var a = r({}, t(s).data(), t(this).data()),
                                    l = this.getAttribute("data-slide-to");
                                l && (a.interval = !1), o._jQueryInterface.call(t(s), a), l && t(s).data(n).to(l), e.preventDefault()
                            }
                        }
                    }, s(o, null, [{
                        key: "VERSION",
                        get: function () {
                            return "4.0.0"
                        }
                    }, {
                        key: "Default",
                        get: function () {
                            return a
                        }
                    }]), o
                }();
            return t(document).on(d.CLICK_DATA_API, y.DATA_SLIDE, C._dataApiClickHandler), t(window).on(d.LOAD_DATA_API, function () {
                t(y.DATA_RIDE).each(function () {
                    var e = t(this);
                    C._jQueryInterface.call(e, e.data())
                })
            }), t.fn[e] = C._jQueryInterface, t.fn[e].Constructor = C, t.fn[e].noConflict = function () {
                return t.fn[e] = o, C._jQueryInterface
            }, C
        }(e),
        H = function (t) {
            var e = "collapse",
                n = "bs.collapse",
                i = "." + n,
                o = t.fn[e],
                a = {
                    toggle: !0,
                    parent: ""
                },
                l = {
                    toggle: "boolean",
                    parent: "(string|element)"
                },
                h = {
                    SHOW: "show" + i,
                    SHOWN: "shown" + i,
                    HIDE: "hide" + i,
                    HIDDEN: "hidden" + i,
                    CLICK_DATA_API: "click" + i + ".data-api"
                },
                c = "show",
                u = "collapse",
                f = "collapsing",
                d = "collapsed",
                _ = "width",
                g = "height",
                p = {
                    ACTIVES: ".show, .collapsing",
                    DATA_TOGGLE: '[data-toggle="collapse"]'
                },
                m = function () {
                    function i(e, n) {
                        this._isTransitioning = !1, this._element = e, this._config = this._getConfig(n), this._triggerArray = t.makeArray(t('[data-toggle="collapse"][href="#' + e.id + '"],[data-toggle="collapse"][data-target="#' + e.id + '"]'));
                        for (var i = t(p.DATA_TOGGLE), s = 0; s < i.length; s++) {
                            var r = i[s],
                                o = P.getSelectorFromElement(r);
                            null !== o && t(o).filter(e).length > 0 && (this._selector = o, this._triggerArray.push(r))
                        }
                        this._parent = this._config.parent ? this._getParent() : null, this._config.parent || this._addAriaAndCollapsedClass(this._element, this._triggerArray), this._config.toggle && this.toggle()
                    }
                    var o = i.prototype;
                    return o.toggle = function () {
                        t(this._element).hasClass(c) ? this.hide() : this.show()
                    }, o.show = function () {
                        var e, s, r = this;
                        if (!this._isTransitioning && !t(this._element).hasClass(c) && (this._parent && 0 === (e = t.makeArray(t(this._parent).find(p.ACTIVES).filter('[data-parent="' + this._config.parent + '"]'))).length && (e = null), !(e && (s = t(e).not(this._selector).data(n)) && s._isTransitioning))) {
                            var o = t.Event(h.SHOW);
                            if (t(this._element).trigger(o), !o.isDefaultPrevented()) {
                                e && (i._jQueryInterface.call(t(e).not(this._selector), "hide"), s || t(e).data(n, null));
                                var a = this._getDimension();
                                t(this._element).removeClass(u).addClass(f), this._element.style[a] = 0, this._triggerArray.length > 0 && t(this._triggerArray).removeClass(d).attr("aria-expanded", !0), this.setTransitioning(!0);
                                var l = function () {
                                    t(r._element).removeClass(f).addClass(u).addClass(c), r._element.style[a] = "", r.setTransitioning(!1), t(r._element).trigger(h.SHOWN)
                                };
                                if (P.supportsTransitionEnd()) {
                                    var _ = "scroll" + (a[0].toUpperCase() + a.slice(1));
                                    t(this._element).one(P.TRANSITION_END, l).emulateTransitionEnd(600), this._element.style[a] = this._element[_] + "px"
                                } else l()
                            }
                        }
                    }, o.hide = function () {
                        var e = this;
                        if (!this._isTransitioning && t(this._element).hasClass(c)) {
                            var n = t.Event(h.HIDE);
                            if (t(this._element).trigger(n), !n.isDefaultPrevented()) {
                                var i = this._getDimension();
                                if (this._element.style[i] = this._element.getBoundingClientRect()[i] + "px", P.reflow(this._element), t(this._element).addClass(f).removeClass(u).removeClass(c), this._triggerArray.length > 0)
                                    for (var s = 0; s < this._triggerArray.length; s++) {
                                        var r = this._triggerArray[s],
                                            o = P.getSelectorFromElement(r);
                                        if (null !== o) t(o).hasClass(c) || t(r).addClass(d).attr("aria-expanded", !1)
                                    }
                                this.setTransitioning(!0);
                                var a = function () {
                                    e.setTransitioning(!1), t(e._element).removeClass(f).addClass(u).trigger(h.HIDDEN)
                                };
                                this._element.style[i] = "", P.supportsTransitionEnd() ? t(this._element).one(P.TRANSITION_END, a).emulateTransitionEnd(600) : a()
                            }
                        }
                    }, o.setTransitioning = function (t) {
                        this._isTransitioning = t
                    }, o.dispose = function () {
                        t.removeData(this._element, n), this._config = null, this._parent = null, this._element = null, this._triggerArray = null, this._isTransitioning = null
                    }, o._getConfig = function (t) {
                        return (t = r({}, a, t)).toggle = Boolean(t.toggle), P.typeCheckConfig(e, t, l), t
                    }, o._getDimension = function () {
                        return t(this._element).hasClass(_) ? _ : g
                    }, o._getParent = function () {
                        var e = this,
                            n = null;
                        P.isElement(this._config.parent) ? (n = this._config.parent, "undefined" != typeof this._config.parent.jquery && (n = this._config.parent[0])) : n = t(this._config.parent)[0];
                        var s = '[data-toggle="collapse"][data-parent="' + this._config.parent + '"]';
                        return t(n).find(s).each(function (t, n) {
                            e._addAriaAndCollapsedClass(i._getTargetFromElement(n), [n])
                        }), n
                    }, o._addAriaAndCollapsedClass = function (e, n) {
                        if (e) {
                            var i = t(e).hasClass(c);
                            n.length > 0 && t(n).toggleClass(d, !i).attr("aria-expanded", i)
                        }
                    }, i._getTargetFromElement = function (e) {
                        var n = P.getSelectorFromElement(e);
                        return n ? t(n)[0] : null
                    }, i._jQueryInterface = function (e) {
                        return this.each(function () {
                            var s = t(this),
                                o = s.data(n),
                                l = r({}, a, s.data(), "object" == typeof e && e);
                            if (!o && l.toggle && /show|hide/.test(e) && (l.toggle = !1), o || (o = new i(this, l), s.data(n, o)), "string" == typeof e) {
                                if ("undefined" == typeof o[e]) throw new TypeError('No method named "' + e + '"');
                                o[e]()
                            }
                        })
                    }, s(i, null, [{
                        key: "VERSION",
                        get: function () {
                            return "4.0.0"
                        }
                    }, {
                        key: "Default",
                        get: function () {
                            return a
                        }
                    }]), i
                }();
            return t(document).on(h.CLICK_DATA_API, p.DATA_TOGGLE, function (e) {
                "A" === e.currentTarget.tagName && e.preventDefault();
                var i = t(this),
                    s = P.getSelectorFromElement(this);
                t(s).each(function () {
                    var e = t(this),
                        s = e.data(n) ? "toggle" : i.data();
                    m._jQueryInterface.call(e, s)
                })
            }), t.fn[e] = m._jQueryInterface, t.fn[e].Constructor = m, t.fn[e].noConflict = function () {
                return t.fn[e] = o, m._jQueryInterface
            }, m
        }(e),
        W = function (t) {
            var e = "dropdown",
                i = "bs.dropdown",
                o = "." + i,
                a = ".data-api",
                l = t.fn[e],
                h = new RegExp("38|40|27"),
                c = {
                    HIDE: "hide" + o,
                    HIDDEN: "hidden" + o,
                    SHOW: "show" + o,
                    SHOWN: "shown" + o,
                    CLICK: "click" + o,
                    CLICK_DATA_API: "click" + o + a,
                    KEYDOWN_DATA_API: "keydown" + o + a,
                    KEYUP_DATA_API: "keyup" + o + a
                },
                u = "disabled",
                f = "show",
                d = "dropup",
                _ = "dropright",
                g = "dropleft",
                p = "dropdown-menu-right",
                m = "dropdown-menu-left",
                v = "position-static",
                E = '[data-toggle="dropdown"]',
                T = ".dropdown form",
                y = ".dropdown-menu",
                C = ".navbar-nav",
                I = ".dropdown-menu .dropdown-item:not(.disabled)",
                A = "top-start",
                b = "top-end",
                D = "bottom-start",
                S = "bottom-end",
                w = "right-start",
                N = "left-start",
                O = {
                    offset: 0,
                    flip: !0,
                    boundary: "scrollParent"
                },
                k = {
                    offset: "(number|string|function)",
                    flip: "boolean",
                    boundary: "(string|element)"
                },
                L = function () {
                    function a(t, e) {
                        this._element = t, this._popper = null, this._config = this._getConfig(e), this._menu = this._getMenuElement(), this._inNavbar = this._detectNavbar(), this._addEventListeners()
                    }
                    var l = a.prototype;
                    return l.toggle = function () {
                        if (!this._element.disabled && !t(this._element).hasClass(u)) {
                            var e = a._getParentFromElement(this._element),
                                i = t(this._menu).hasClass(f);
                            if (a._clearMenus(), !i) {
                                var s = {
                                        relatedTarget: this._element
                                    },
                                    r = t.Event(c.SHOW, s);
                                if (t(e).trigger(r), !r.isDefaultPrevented()) {
                                    if (!this._inNavbar) {
                                        if ("undefined" == typeof n) throw new TypeError("Bootstrap dropdown require Popper.js (https://popper.js.org)");
                                        var o = this._element;
                                        t(e).hasClass(d) && (t(this._menu).hasClass(m) || t(this._menu).hasClass(p)) && (o = e), "scrollParent" !== this._config.boundary && t(e).addClass(v), this._popper = new n(o, this._menu, this._getPopperConfig())
                                    }
                                    "ontouchstart" in document.documentElement && 0 === t(e).closest(C).length && t("body").children().on("mouseover", null, t.noop), this._element.focus(), this._element.setAttribute("aria-expanded", !0), t(this._menu).toggleClass(f), t(e).toggleClass(f).trigger(t.Event(c.SHOWN, s))
                                }
                            }
                        }
                    }, l.dispose = function () {
                        t.removeData(this._element, i), t(this._element).off(o), this._element = null, this._menu = null, null !== this._popper && (this._popper.destroy(), this._popper = null)
                    }, l.update = function () {
                        this._inNavbar = this._detectNavbar(), null !== this._popper && this._popper.scheduleUpdate()
                    }, l._addEventListeners = function () {
                        var e = this;
                        t(this._element).on(c.CLICK, function (t) {
                            t.preventDefault(), t.stopPropagation(), e.toggle()
                        })
                    }, l._getConfig = function (n) {
                        return n = r({}, this.constructor.Default, t(this._element).data(), n), P.typeCheckConfig(e, n, this.constructor.DefaultType), n
                    }, l._getMenuElement = function () {
                        if (!this._menu) {
                            var e = a._getParentFromElement(this._element);
                            this._menu = t(e).find(y)[0]
                        }
                        return this._menu
                    }, l._getPlacement = function () {
                        var e = t(this._element).parent(),
                            n = D;
                        return e.hasClass(d) ? (n = A, t(this._menu).hasClass(p) && (n = b)) : e.hasClass(_) ? n = w : e.hasClass(g) ? n = N : t(this._menu).hasClass(p) && (n = S), n
                    }, l._detectNavbar = function () {
                        return t(this._element).closest(".navbar").length > 0
                    }, l._getPopperConfig = function () {
                        var t = this,
                            e = {};
                        return "function" == typeof this._config.offset ? e.fn = function (e) {
                            return e.offsets = r({}, e.offsets, t._config.offset(e.offsets) || {}), e
                        } : e.offset = this._config.offset, {
                            placement: this._getPlacement(),
                            modifiers: {
                                offset: e,
                                flip: {
                                    enabled: this._config.flip
                                },
                                preventOverflow: {
                                    boundariesElement: this._config.boundary
                                }
                            }
                        }
                    }, a._jQueryInterface = function (e) {
                        return this.each(function () {
                            var n = t(this).data(i);
                            if (n || (n = new a(this, "object" == typeof e ? e : null), t(this).data(i, n)), "string" == typeof e) {
                                if ("undefined" == typeof n[e]) throw new TypeError('No method named "' + e + '"');
                                n[e]()
                            }
                        })
                    }, a._clearMenus = function (e) {
                        if (!e || 3 !== e.which && ("keyup" !== e.type || 9 === e.which))
                            for (var n = t.makeArray(t(E)), s = 0; s < n.length; s++) {
                                var r = a._getParentFromElement(n[s]),
                                    o = t(n[s]).data(i),
                                    l = {
                                        relatedTarget: n[s]
                                    };
                                if (o) {
                                    var h = o._menu;
                                    if (t(r).hasClass(f) && !(e && ("click" === e.type && /input|textarea/i.test(e.target.tagName) || "keyup" === e.type && 9 === e.which) && t.contains(r, e.target))) {
                                        var u = t.Event(c.HIDE, l);
                                        t(r).trigger(u), u.isDefaultPrevented() || ("ontouchstart" in document.documentElement && t("body").children().off("mouseover", null, t.noop), n[s].setAttribute("aria-expanded", "false"), t(h).removeClass(f), t(r).removeClass(f).trigger(t.Event(c.HIDDEN, l)))
                                    }
                                }
                            }
                    }, a._getParentFromElement = function (e) {
                        var n, i = P.getSelectorFromElement(e);
                        return i && (n = t(i)[0]), n || e.parentNode
                    }, a._dataApiKeydownHandler = function (e) {
                        if ((/input|textarea/i.test(e.target.tagName) ? !(32 === e.which || 27 !== e.which && (40 !== e.which && 38 !== e.which || t(e.target).closest(y).length)) : h.test(e.which)) && (e.preventDefault(), e.stopPropagation(), !this.disabled && !t(this).hasClass(u))) {
                            var n = a._getParentFromElement(this),
                                i = t(n).hasClass(f);
                            if ((i || 27 === e.which && 32 === e.which) && (!i || 27 !== e.which && 32 !== e.which)) {
                                var s = t(n).find(I).get();
                                if (0 !== s.length) {
                                    var r = s.indexOf(e.target);
                                    38 === e.which && r > 0 && r--, 40 === e.which && r < s.length - 1 && r++, r < 0 && (r = 0), s[r].focus()
                                }
                            } else {
                                if (27 === e.which) {
                                    var o = t(n).find(E)[0];
                                    t(o).trigger("focus")
                                }
                                t(this).trigger("click")
                            }
                        }
                    }, s(a, null, [{
                        key: "VERSION",
                        get: function () {
                            return "4.0.0"
                        }
                    }, {
                        key: "Default",
                        get: function () {
                            return O
                        }
                    }, {
                        key: "DefaultType",
                        get: function () {
                            return k
                        }
                    }]), a
                }();
            return t(document).on(c.KEYDOWN_DATA_API, E, L._dataApiKeydownHandler).on(c.KEYDOWN_DATA_API, y, L._dataApiKeydownHandler).on(c.CLICK_DATA_API + " " + c.KEYUP_DATA_API, L._clearMenus).on(c.CLICK_DATA_API, E, function (e) {
                e.preventDefault(), e.stopPropagation(), L._jQueryInterface.call(t(this), "toggle")
            }).on(c.CLICK_DATA_API, T, function (t) {
                t.stopPropagation()
            }), t.fn[e] = L._jQueryInterface, t.fn[e].Constructor = L, t.fn[e].noConflict = function () {
                return t.fn[e] = l, L._jQueryInterface
            }, L
        }(e),
        M = function (t) {
            var e = "modal",
                n = "bs.modal",
                i = "." + n,
                o = t.fn.modal,
                a = {
                    backdrop: !0,
                    keyboard: !0,
                    focus: !0,
                    show: !0
                },
                l = {
                    backdrop: "(boolean|string)",
                    keyboard: "boolean",
                    focus: "boolean",
                    show: "boolean"
                },
                h = {
                    HIDE: "hide" + i,
                    HIDDEN: "hidden" + i,
                    SHOW: "show" + i,
                    SHOWN: "shown" + i,
                    FOCUSIN: "focusin" + i,
                    RESIZE: "resize" + i,
                    CLICK_DISMISS: "click.dismiss" + i,
                    KEYDOWN_DISMISS: "keydown.dismiss" + i,
                    MOUSEUP_DISMISS: "mouseup.dismiss" + i,
                    MOUSEDOWN_DISMISS: "mousedown.dismiss" + i,
                    CLICK_DATA_API: "click" + i + ".data-api"
                },
                c = "modal-scrollbar-measure",
                u = "modal-backdrop",
                f = "modal-open",
                d = "fade",
                _ = "show",
                g = {
                    DIALOG: ".modal-dialog",
                    DATA_TOGGLE: '[data-toggle="modal"]',
                    DATA_DISMISS: '[data-dismiss="modal"]',
                    FIXED_CONTENT: ".fixed-top, .fixed-bottom, .is-fixed, .sticky-top",
                    STICKY_CONTENT: ".sticky-top",
                    NAVBAR_TOGGLER: ".navbar-toggler"
                },
                p = function () {
                    function o(e, n) {
                        this._config = this._getConfig(n), this._element = e, this._dialog = t(e).find(g.DIALOG)[0], this._backdrop = null, this._isShown = !1, this._isBodyOverflowing = !1, this._ignoreBackdropClick = !1, this._originalBodyPadding = 0, this._scrollbarWidth = 0
                    }
                    var p = o.prototype;
                    return p.toggle = function (t) {
                        return this._isShown ? this.hide() : this.show(t)
                    }, p.show = function (e) {
                        var n = this;
                        if (!this._isTransitioning && !this._isShown) {
                            P.supportsTransitionEnd() && t(this._element).hasClass(d) && (this._isTransitioning = !0);
                            var i = t.Event(h.SHOW, {
                                relatedTarget: e
                            });
                            t(this._element).trigger(i), this._isShown || i.isDefaultPrevented() || (this._isShown = !0, this._checkScrollbar(), this._setScrollbar(), this._adjustDialog(), t(document.body).addClass(f), this._setEscapeEvent(), this._setResizeEvent(), t(this._element).on(h.CLICK_DISMISS, g.DATA_DISMISS, function (t) {
                                return n.hide(t)
                            }), t(this._dialog).on(h.MOUSEDOWN_DISMISS, function () {
                                t(n._element).one(h.MOUSEUP_DISMISS, function (e) {
                                    t(e.target).is(n._element) && (n._ignoreBackdropClick = !0)
                                })
                            }), this._showBackdrop(function () {
                                return n._showElement(e)
                            }))
                        }
                    }, p.hide = function (e) {
                        var n = this;
                        if (e && e.preventDefault(), !this._isTransitioning && this._isShown) {
                            var i = t.Event(h.HIDE);
                            if (t(this._element).trigger(i), this._isShown && !i.isDefaultPrevented()) {
                                this._isShown = !1;
                                var s = P.supportsTransitionEnd() && t(this._element).hasClass(d);
                                s && (this._isTransitioning = !0), this._setEscapeEvent(), this._setResizeEvent(), t(document).off(h.FOCUSIN), t(this._element).removeClass(_), t(this._element).off(h.CLICK_DISMISS), t(this._dialog).off(h.MOUSEDOWN_DISMISS), s ? t(this._element).one(P.TRANSITION_END, function (t) {
                                    return n._hideModal(t)
                                }).emulateTransitionEnd(300) : this._hideModal()
                            }
                        }
                    }, p.dispose = function () {
                        t.removeData(this._element, n), t(window, document, this._element, this._backdrop).off(i), this._config = null, this._element = null, this._dialog = null, this._backdrop = null, this._isShown = null, this._isBodyOverflowing = null, this._ignoreBackdropClick = null, this._scrollbarWidth = null
                    }, p.handleUpdate = function () {
                        this._adjustDialog()
                    }, p._getConfig = function (t) {
                        return t = r({}, a, t), P.typeCheckConfig(e, t, l), t
                    }, p._showElement = function (e) {
                        var n = this,
                            i = P.supportsTransitionEnd() && t(this._element).hasClass(d);
                        this._element.parentNode && this._element.parentNode.nodeType === Node.ELEMENT_NODE || document.body.appendChild(this._element), this._element.style.display = "block", this._element.removeAttribute("aria-hidden"), this._element.scrollTop = 0, i && P.reflow(this._element), t(this._element).addClass(_), this._config.focus && this._enforceFocus();
                        var s = t.Event(h.SHOWN, {
                                relatedTarget: e
                            }),
                            r = function () {
                                n._config.focus && n._element.focus(), n._isTransitioning = !1, t(n._element).trigger(s)
                            };
                        i ? t(this._dialog).one(P.TRANSITION_END, r).emulateTransitionEnd(300) : r()
                    }, p._enforceFocus = function () {
                        var e = this;
                        t(document).off(h.FOCUSIN).on(h.FOCUSIN, function (n) {
                            document !== n.target && e._element !== n.target && 0 === t(e._element).has(n.target).length && e._element.focus()
                        })
                    }, p._setEscapeEvent = function () {
                        var e = this;
                        this._isShown && this._config.keyboard ? t(this._element).on(h.KEYDOWN_DISMISS, function (t) {
                            27 === t.which && (t.preventDefault(), e.hide())
                        }) : this._isShown || t(this._element).off(h.KEYDOWN_DISMISS)
                    }, p._setResizeEvent = function () {
                        var e = this;
                        this._isShown ? t(window).on(h.RESIZE, function (t) {
                            return e.handleUpdate(t)
                        }) : t(window).off(h.RESIZE)
                    }, p._hideModal = function () {
                        var e = this;
                        this._element.style.display = "none", this._element.setAttribute("aria-hidden", !0), this._isTransitioning = !1, this._showBackdrop(function () {
                            t(document.body).removeClass(f), e._resetAdjustments(), e._resetScrollbar(), t(e._element).trigger(h.HIDDEN)
                        })
                    }, p._removeBackdrop = function () {
                        this._backdrop && (t(this._backdrop).remove(), this._backdrop = null)
                    }, p._showBackdrop = function (e) {
                        var n = this,
                            i = t(this._element).hasClass(d) ? d : "";
                        if (this._isShown && this._config.backdrop) {
                            var s = P.supportsTransitionEnd() && i;
                            if (this._backdrop = document.createElement("div"), this._backdrop.className = u, i && t(this._backdrop).addClass(i), t(this._backdrop).appendTo(document.body), t(this._element).on(h.CLICK_DISMISS, function (t) {
                                    n._ignoreBackdropClick ? n._ignoreBackdropClick = !1 : t.target === t.currentTarget && ("static" === n._config.backdrop ? n._element.focus() : n.hide())
                                }), s && P.reflow(this._backdrop), t(this._backdrop).addClass(_), !e) return;
                            if (!s) return void e();
                            t(this._backdrop).one(P.TRANSITION_END, e).emulateTransitionEnd(150)
                        } else if (!this._isShown && this._backdrop) {
                            t(this._backdrop).removeClass(_);
                            var r = function () {
                                n._removeBackdrop(), e && e()
                            };
                            P.supportsTransitionEnd() && t(this._element).hasClass(d) ? t(this._backdrop).one(P.TRANSITION_END, r).emulateTransitionEnd(150) : r()
                        } else e && e()
                    }, p._adjustDialog = function () {
                        var t = this._element.scrollHeight > document.documentElement.clientHeight;
                        !this._isBodyOverflowing && t && (this._element.style.paddingLeft = this._scrollbarWidth + "px"), this._isBodyOverflowing && !t && (this._element.style.paddingRight = this._scrollbarWidth + "px")
                    }, p._resetAdjustments = function () {
                        this._element.style.paddingLeft = "", this._element.style.paddingRight = ""
                    }, p._checkScrollbar = function () {
                        var t = document.body.getBoundingClientRect();
                        this._isBodyOverflowing = t.left + t.right < window.innerWidth, this._scrollbarWidth = this._getScrollbarWidth()
                    }, p._setScrollbar = function () {
                        var e = this;
                        if (this._isBodyOverflowing) {
                            t(g.FIXED_CONTENT).each(function (n, i) {
                                var s = t(i)[0].style.paddingRight,
                                    r = t(i).css("padding-right");
                                t(i).data("padding-right", s).css("padding-right", parseFloat(r) + e._scrollbarWidth + "px")
                            }), t(g.STICKY_CONTENT).each(function (n, i) {
                                var s = t(i)[0].style.marginRight,
                                    r = t(i).css("margin-right");
                                t(i).data("margin-right", s).css("margin-right", parseFloat(r) - e._scrollbarWidth + "px")
                            }), t(g.NAVBAR_TOGGLER).each(function (n, i) {
                                var s = t(i)[0].style.marginRight,
                                    r = t(i).css("margin-right");
                                t(i).data("margin-right", s).css("margin-right", parseFloat(r) + e._scrollbarWidth + "px")
                            });
                            var n = document.body.style.paddingRight,
                                i = t("body").css("padding-right");
                            t("body").data("padding-right", n).css("padding-right", parseFloat(i) + this._scrollbarWidth + "px")
                        }
                    }, p._resetScrollbar = function () {
                        t(g.FIXED_CONTENT).each(function (e, n) {
                            var i = t(n).data("padding-right");
                            "undefined" != typeof i && t(n).css("padding-right", i).removeData("padding-right")
                        }), t(g.STICKY_CONTENT + ", " + g.NAVBAR_TOGGLER).each(function (e, n) {
                            var i = t(n).data("margin-right");
                            "undefined" != typeof i && t(n).css("margin-right", i).removeData("margin-right")
                        });
                        var e = t("body").data("padding-right");
                        "undefined" != typeof e && t("body").css("padding-right", e).removeData("padding-right")
                    }, p._getScrollbarWidth = function () {
                        var t = document.createElement("div");
                        t.className = c, document.body.appendChild(t);
                        var e = t.getBoundingClientRect().width - t.clientWidth;
                        return document.body.removeChild(t), e
                    }, o._jQueryInterface = function (e, i) {
                        return this.each(function () {
                            var s = t(this).data(n),
                                a = r({}, o.Default, t(this).data(), "object" == typeof e && e);
                            if (s || (s = new o(this, a), t(this).data(n, s)), "string" == typeof e) {
                                if ("undefined" == typeof s[e]) throw new TypeError('No method named "' + e + '"');
                                s[e](i)
                            } else a.show && s.show(i)
                        })
                    }, s(o, null, [{
                        key: "VERSION",
                        get: function () {
                            return "4.0.0"
                        }
                    }, {
                        key: "Default",
                        get: function () {
                            return a
                        }
                    }]), o
                }();
            return t(document).on(h.CLICK_DATA_API, g.DATA_TOGGLE, function (e) {
                var i, s = this,
                    o = P.getSelectorFromElement(this);
                o && (i = t(o)[0]);
                var a = t(i).data(n) ? "toggle" : r({}, t(i).data(), t(this).data());
                "A" !== this.tagName && "AREA" !== this.tagName || e.preventDefault();
                var l = t(i).one(h.SHOW, function (e) {
                    e.isDefaultPrevented() || l.one(h.HIDDEN, function () {
                        t(s).is(":visible") && s.focus()
                    })
                });
                p._jQueryInterface.call(t(i), a, this)
            }), t.fn.modal = p._jQueryInterface, t.fn.modal.Constructor = p, t.fn.modal.noConflict = function () {
                return t.fn.modal = o, p._jQueryInterface
            }, p
        }(e),
        U = function (t) {
            var e = "tooltip",
                i = "bs.tooltip",
                o = "." + i,
                a = t.fn[e],
                l = new RegExp("(^|\\s)bs-tooltip\\S+", "g"),
                h = {
                    animation: "boolean",
                    template: "string",
                    title: "(string|element|function)",
                    trigger: "string",
                    delay: "(number|object)",
                    html: "boolean",
                    selector: "(string|boolean)",
                    placement: "(string|function)",
                    offset: "(number|string)",
                    container: "(string|element|boolean)",
                    fallbackPlacement: "(string|array)",
                    boundary: "(string|element)"
                },
                c = {
                    AUTO: "auto",
                    TOP: "top",
                    RIGHT: "right",
                    BOTTOM: "bottom",
                    LEFT: "left"
                },
                u = {
                    animation: !0,
                    template: '<div class="tooltip" role="tooltip"><div class="arrow"></div><div class="tooltip-inner"></div></div>',
                    trigger: "hover focus",
                    title: "",
                    delay: 0,
                    html: !1,
                    selector: !1,
                    placement: "top",
                    offset: 0,
                    container: !1,
                    fallbackPlacement: "flip",
                    boundary: "scrollParent"
                },
                f = "show",
                d = "out",
                _ = {
                    HIDE: "hide" + o,
                    HIDDEN: "hidden" + o,
                    SHOW: "show" + o,
                    SHOWN: "shown" + o,
                    INSERTED: "inserted" + o,
                    CLICK: "click" + o,
                    FOCUSIN: "focusin" + o,
                    FOCUSOUT: "focusout" + o,
                    MOUSEENTER: "mouseenter" + o,
                    MOUSELEAVE: "mouseleave" + o
                },
                g = "fade",
                p = "show",
                m = ".tooltip-inner",
                v = ".arrow",
                E = "hover",
                T = "focus",
                y = "click",
                C = "manual",
                I = function () {
                    function a(t, e) {
                        if ("undefined" == typeof n) throw new TypeError("Bootstrap tooltips require Popper.js (https://popper.js.org)");
                        this._isEnabled = !0, this._timeout = 0, this._hoverState = "", this._activeTrigger = {}, this._popper = null, this.element = t, this.config = this._getConfig(e), this.tip = null, this._setListeners()
                    }
                    var I = a.prototype;
                    return I.enable = function () {
                        this._isEnabled = !0
                    }, I.disable = function () {
                        this._isEnabled = !1
                    }, I.toggleEnabled = function () {
                        this._isEnabled = !this._isEnabled
                    }, I.toggle = function (e) {
                        if (this._isEnabled)
                            if (e) {
                                var n = this.constructor.DATA_KEY,
                                    i = t(e.currentTarget).data(n);
                                i || (i = new this.constructor(e.currentTarget, this._getDelegateConfig()), t(e.currentTarget).data(n, i)), i._activeTrigger.click = !i._activeTrigger.click, i._isWithActiveTrigger() ? i._enter(null, i) : i._leave(null, i)
                            } else {
                                if (t(this.getTipElement()).hasClass(p)) return void this._leave(null, this);
                                this._enter(null, this)
                            }
                    }, I.dispose = function () {
                        clearTimeout(this._timeout), t.removeData(this.element, this.constructor.DATA_KEY), t(this.element).off(this.constructor.EVENT_KEY), t(this.element).closest(".modal").off("hide.bs.modal"), this.tip && t(this.tip).remove(), this._isEnabled = null, this._timeout = null, this._hoverState = null, this._activeTrigger = null, null !== this._popper && this._popper.destroy(), this._popper = null, this.element = null, this.config = null, this.tip = null
                    }, I.show = function () {
                        var e = this;
                        if ("none" === t(this.element).css("display")) throw new Error("Please use show on visible elements");
                        var i = t.Event(this.constructor.Event.SHOW);
                        if (this.isWithContent() && this._isEnabled) {
                            t(this.element).trigger(i);
                            var s = t.contains(this.element.ownerDocument.documentElement, this.element);
                            if (i.isDefaultPrevented() || !s) return;
                            var r = this.getTipElement(),
                                o = P.getUID(this.constructor.NAME);
                            r.setAttribute("id", o), this.element.setAttribute("aria-describedby", o), this.setContent(), this.config.animation && t(r).addClass(g);
                            var l = "function" == typeof this.config.placement ? this.config.placement.call(this, r, this.element) : this.config.placement,
                                h = this._getAttachment(l);
                            this.addAttachmentClass(h);
                            var c = !1 === this.config.container ? document.body : t(this.config.container);
                            t(r).data(this.constructor.DATA_KEY, this), t.contains(this.element.ownerDocument.documentElement, this.tip) || t(r).appendTo(c), t(this.element).trigger(this.constructor.Event.INSERTED), this._popper = new n(this.element, r, {
                                placement: h,
                                modifiers: {
                                    offset: {
                                        offset: this.config.offset
                                    },
                                    flip: {
                                        behavior: this.config.fallbackPlacement
                                    },
                                    arrow: {
                                        element: v
                                    },
                                    preventOverflow: {
                                        boundariesElement: this.config.boundary
                                    }
                                },
                                onCreate: function (t) {
                                    t.originalPlacement !== t.placement && e._handlePopperPlacementChange(t)
                                },
                                onUpdate: function (t) {
                                    e._handlePopperPlacementChange(t)
                                }
                            }), t(r).addClass(p), "ontouchstart" in document.documentElement && t("body").children().on("mouseover", null, t.noop);
                            var u = function () {
                                e.config.animation && e._fixTransition();
                                var n = e._hoverState;
                                e._hoverState = null, t(e.element).trigger(e.constructor.Event.SHOWN), n === d && e._leave(null, e)
                            };
                            P.supportsTransitionEnd() && t(this.tip).hasClass(g) ? t(this.tip).one(P.TRANSITION_END, u).emulateTransitionEnd(a._TRANSITION_DURATION) : u()
                        }
                    }, I.hide = function (e) {
                        var n = this,
                            i = this.getTipElement(),
                            s = t.Event(this.constructor.Event.HIDE),
                            r = function () {
                                n._hoverState !== f && i.parentNode && i.parentNode.removeChild(i), n._cleanTipClass(), n.element.removeAttribute("aria-describedby"), t(n.element).trigger(n.constructor.Event.HIDDEN), null !== n._popper && n._popper.destroy(), e && e()
                            };
                        t(this.element).trigger(s), s.isDefaultPrevented() || (t(i).removeClass(p), "ontouchstart" in document.documentElement && t("body").children().off("mouseover", null, t.noop), this._activeTrigger[y] = !1, this._activeTrigger[T] = !1, this._activeTrigger[E] = !1, P.supportsTransitionEnd() && t(this.tip).hasClass(g) ? t(i).one(P.TRANSITION_END, r).emulateTransitionEnd(150) : r(), this._hoverState = "")
                    }, I.update = function () {
                        null !== this._popper && this._popper.scheduleUpdate()
                    }, I.isWithContent = function () {
                        return Boolean(this.getTitle())
                    }, I.addAttachmentClass = function (e) {
                        t(this.getTipElement()).addClass("bs-tooltip-" + e)
                    }, I.getTipElement = function () {
                        return this.tip = this.tip || t(this.config.template)[0], this.tip
                    }, I.setContent = function () {
                        var e = t(this.getTipElement());
                        this.setElementContent(e.find(m), this.getTitle()), e.removeClass(g + " " + p)
                    }, I.setElementContent = function (e, n) {
                        var i = this.config.html;
                        "object" == typeof n && (n.nodeType || n.jquery) ? i ? t(n).parent().is(e) || e.empty().append(n) : e.text(t(n).text()) : e[i ? "html" : "text"](n)
                    }, I.getTitle = function () {
                        var t = this.element.getAttribute("data-original-title");
                        return t || (t = "function" == typeof this.config.title ? this.config.title.call(this.element) : this.config.title), t
                    }, I._getAttachment = function (t) {
                        return c[t.toUpperCase()]
                    }, I._setListeners = function () {
                        var e = this;
                        this.config.trigger.split(" ").forEach(function (n) {
                            if ("click" === n) t(e.element).on(e.constructor.Event.CLICK, e.config.selector, function (t) {
                                return e.toggle(t)
                            });
                            else if (n !== C) {
                                var i = n === E ? e.constructor.Event.MOUSEENTER : e.constructor.Event.FOCUSIN,
                                    s = n === E ? e.constructor.Event.MOUSELEAVE : e.constructor.Event.FOCUSOUT;
                                t(e.element).on(i, e.config.selector, function (t) {
                                    return e._enter(t)
                                }).on(s, e.config.selector, function (t) {
                                    return e._leave(t)
                                })
                            }
                            t(e.element).closest(".modal").on("hide.bs.modal", function () {
                                return e.hide()
                            })
                        }), this.config.selector ? this.config = r({}, this.config, {
                            trigger: "manual",
                            selector: ""
                        }) : this._fixTitle()
                    }, I._fixTitle = function () {
                        var t = typeof this.element.getAttribute("data-original-title");
                        (this.element.getAttribute("title") || "string" !== t) && (this.element.setAttribute("data-original-title", this.element.getAttribute("title") || ""), this.element.setAttribute("title", ""))
                    }, I._enter = function (e, n) {
                        var i = this.constructor.DATA_KEY;
                        (n = n || t(e.currentTarget).data(i)) || (n = new this.constructor(e.currentTarget, this._getDelegateConfig()), t(e.currentTarget).data(i, n)), e && (n._activeTrigger["focusin" === e.type ? T : E] = !0), t(n.getTipElement()).hasClass(p) || n._hoverState === f ? n._hoverState = f : (clearTimeout(n._timeout), n._hoverState = f, n.config.delay && n.config.delay.show ? n._timeout = setTimeout(function () {
                            n._hoverState === f && n.show()
                        }, n.config.delay.show) : n.show())
                    }, I._leave = function (e, n) {
                        var i = this.constructor.DATA_KEY;
                        (n = n || t(e.currentTarget).data(i)) || (n = new this.constructor(e.currentTarget, this._getDelegateConfig()), t(e.currentTarget).data(i, n)), e && (n._activeTrigger["focusout" === e.type ? T : E] = !1), n._isWithActiveTrigger() || (clearTimeout(n._timeout), n._hoverState = d, n.config.delay && n.config.delay.hide ? n._timeout = setTimeout(function () {
                            n._hoverState === d && n.hide()
                        }, n.config.delay.hide) : n.hide())
                    }, I._isWithActiveTrigger = function () {
                        for (var t in this._activeTrigger)
                            if (this._activeTrigger[t]) return !0;
                        return !1
                    }, I._getConfig = function (n) {
                        return "number" == typeof (n = r({}, this.constructor.Default, t(this.element).data(), n)).delay && (n.delay = {
                            show: n.delay,
                            hide: n.delay
                        }), "number" == typeof n.title && (n.title = n.title.toString()), "number" == typeof n.content && (n.content = n.content.toString()), P.typeCheckConfig(e, n, this.constructor.DefaultType), n
                    }, I._getDelegateConfig = function () {
                        var t = {};
                        if (this.config)
                            for (var e in this.config) this.constructor.Default[e] !== this.config[e] && (t[e] = this.config[e]);
                        return t
                    }, I._cleanTipClass = function () {
                        var e = t(this.getTipElement()),
                            n = e.attr("class").match(l);
                        null !== n && n.length > 0 && e.removeClass(n.join(""))
                    }, I._handlePopperPlacementChange = function (t) {
                        this._cleanTipClass(), this.addAttachmentClass(this._getAttachment(t.placement))
                    }, I._fixTransition = function () {
                        var e = this.getTipElement(),
                            n = this.config.animation;
                        null === e.getAttribute("x-placement") && (t(e).removeClass(g), this.config.animation = !1, this.hide(), this.show(), this.config.animation = n)
                    }, a._jQueryInterface = function (e) {
                        return this.each(function () {
                            var n = t(this).data(i),
                                s = "object" == typeof e && e;
                            if ((n || !/dispose|hide/.test(e)) && (n || (n = new a(this, s), t(this).data(i, n)), "string" == typeof e)) {
                                if ("undefined" == typeof n[e]) throw new TypeError('No method named "' + e + '"');
                                n[e]()
                            }
                        })
                    }, s(a, null, [{
                        key: "VERSION",
                        get: function () {
                            return "4.0.0"
                        }
                    }, {
                        key: "Default",
                        get: function () {
                            return u
                        }
                    }, {
                        key: "NAME",
                        get: function () {
                            return e
                        }
                    }, {
                        key: "DATA_KEY",
                        get: function () {
                            return i
                        }
                    }, {
                        key: "Event",
                        get: function () {
                            return _
                        }
                    }, {
                        key: "EVENT_KEY",
                        get: function () {
                            return o
                        }
                    }, {
                        key: "DefaultType",
                        get: function () {
                            return h
                        }
                    }]), a
                }();
            return t.fn[e] = I._jQueryInterface, t.fn[e].Constructor = I, t.fn[e].noConflict = function () {
                return t.fn[e] = a, I._jQueryInterface
            }, I
        }(e),
        x = function (t) {
            var e = "popover",
                n = "bs.popover",
                i = "." + n,
                o = t.fn[e],
                a = new RegExp("(^|\\s)bs-popover\\S+", "g"),
                l = r({}, U.Default, {
                    placement: "right",
                    trigger: "click",
                    content: "",
                    template: '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-header"></h3><div class="popover-body"></div></div>'
                }),
                h = r({}, U.DefaultType, {
                    content: "(string|element|function)"
                }),
                c = "fade",
                u = "show",
                f = ".popover-header",
                d = ".popover-body",
                _ = {
                    HIDE: "hide" + i,
                    HIDDEN: "hidden" + i,
                    SHOW: "show" + i,
                    SHOWN: "shown" + i,
                    INSERTED: "inserted" + i,
                    CLICK: "click" + i,
                    FOCUSIN: "focusin" + i,
                    FOCUSOUT: "focusout" + i,
                    MOUSEENTER: "mouseenter" + i,
                    MOUSELEAVE: "mouseleave" + i
                },
                g = function (r) {
                    var o, g;

                    function p() {
                        return r.apply(this, arguments) || this
                    }
                    g = r, (o = p).prototype = Object.create(g.prototype), o.prototype.constructor = o, o.__proto__ = g;
                    var m = p.prototype;
                    return m.isWithContent = function () {
                        return this.getTitle() || this._getContent()
                    }, m.addAttachmentClass = function (e) {
                        t(this.getTipElement()).addClass("bs-popover-" + e)
                    }, m.getTipElement = function () {
                        return this.tip = this.tip || t(this.config.template)[0], this.tip
                    }, m.setContent = function () {
                        var e = t(this.getTipElement());
                        this.setElementContent(e.find(f), this.getTitle());
                        var n = this._getContent();
                        "function" == typeof n && (n = n.call(this.element)), this.setElementContent(e.find(d), n), e.removeClass(c + " " + u)
                    }, m._getContent = function () {
                        return this.element.getAttribute("data-content") || this.config.content
                    }, m._cleanTipClass = function () {
                        var e = t(this.getTipElement()),
                            n = e.attr("class").match(a);
                        null !== n && n.length > 0 && e.removeClass(n.join(""))
                    }, p._jQueryInterface = function (e) {
                        return this.each(function () {
                            var i = t(this).data(n),
                                s = "object" == typeof e ? e : null;
                            if ((i || !/destroy|hide/.test(e)) && (i || (i = new p(this, s), t(this).data(n, i)), "string" == typeof e)) {
                                if ("undefined" == typeof i[e]) throw new TypeError('No method named "' + e + '"');
                                i[e]()
                            }
                        })
                    }, s(p, null, [{
                        key: "VERSION",
                        get: function () {
                            return "4.0.0"
                        }
                    }, {
                        key: "Default",
                        get: function () {
                            return l
                        }
                    }, {
                        key: "NAME",
                        get: function () {
                            return e
                        }
                    }, {
                        key: "DATA_KEY",
                        get: function () {
                            return n
                        }
                    }, {
                        key: "Event",
                        get: function () {
                            return _
                        }
                    }, {
                        key: "EVENT_KEY",
                        get: function () {
                            return i
                        }
                    }, {
                        key: "DefaultType",
                        get: function () {
                            return h
                        }
                    }]), p
                }(U);
            return t.fn[e] = g._jQueryInterface, t.fn[e].Constructor = g, t.fn[e].noConflict = function () {
                return t.fn[e] = o, g._jQueryInterface
            }, g
        }(e),
        K = function (t) {
            var e = "scrollspy",
                n = "bs.scrollspy",
                i = "." + n,
                o = t.fn[e],
                a = {
                    offset: 10,
                    method: "auto",
                    target: ""
                },
                l = {
                    offset: "number",
                    method: "string",
                    target: "(string|element)"
                },
                h = {
                    ACTIVATE: "activate" + i,
                    SCROLL: "scroll" + i,
                    LOAD_DATA_API: "load" + i + ".data-api"
                },
                c = "dropdown-item",
                u = "active",
                f = {
                    DATA_SPY: '[data-spy="scroll"]',
                    ACTIVE: ".active",
                    NAV_LIST_GROUP: ".nav, .list-group",
                    NAV_LINKS: ".nav-link",
                    NAV_ITEMS: ".nav-item",
                    LIST_ITEMS: ".list-group-item",
                    DROPDOWN: ".dropdown",
                    DROPDOWN_ITEMS: ".dropdown-item",
                    DROPDOWN_TOGGLE: ".dropdown-toggle"
                },
                d = "offset",
                _ = "position",
                g = function () {
                    function o(e, n) {
                        var i = this;
                        this._element = e, this._scrollElement = "BODY" === e.tagName ? window : e, this._config = this._getConfig(n), this._selector = this._config.target + " " + f.NAV_LINKS + "," + this._config.target + " " + f.LIST_ITEMS + "," + this._config.target + " " + f.DROPDOWN_ITEMS, this._offsets = [], this._targets = [], this._activeTarget = null, this._scrollHeight = 0, t(this._scrollElement).on(h.SCROLL, function (t) {
                            return i._process(t)
                        }), this.refresh(), this._process()
                    }
                    var g = o.prototype;
                    return g.refresh = function () {
                        var e = this,
                            n = this._scrollElement === this._scrollElement.window ? d : _,
                            i = "auto" === this._config.method ? n : this._config.method,
                            s = i === _ ? this._getScrollTop() : 0;
                        this._offsets = [], this._targets = [], this._scrollHeight = this._getScrollHeight(), t.makeArray(t(this._selector)).map(function (e) {
                            var n, r = P.getSelectorFromElement(e);
                            if (r && (n = t(r)[0]), n) {
                                var o = n.getBoundingClientRect();
                                if (o.width || o.height) return [t(n)[i]().top + s, r]
                            }
                            return null
                        }).filter(function (t) {
                            return t
                        }).sort(function (t, e) {
                            return t[0] - e[0]
                        }).forEach(function (t) {
                            e._offsets.push(t[0]), e._targets.push(t[1])
                        })
                    }, g.dispose = function () {
                        t.removeData(this._element, n), t(this._scrollElement).off(i), this._element = null, this._scrollElement = null, this._config = null, this._selector = null, this._offsets = null, this._targets = null, this._activeTarget = null, this._scrollHeight = null
                    }, g._getConfig = function (n) {
                        if ("string" != typeof (n = r({}, a, n)).target) {
                            var i = t(n.target).attr("id");
                            i || (i = P.getUID(e), t(n.target).attr("id", i)), n.target = "#" + i
                        }
                        return P.typeCheckConfig(e, n, l), n
                    }, g._getScrollTop = function () {
                        return this._scrollElement === window ? this._scrollElement.pageYOffset : this._scrollElement.scrollTop
                    }, g._getScrollHeight = function () {
                        return this._scrollElement.scrollHeight || Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)
                    }, g._getOffsetHeight = function () {
                        return this._scrollElement === window ? window.innerHeight : this._scrollElement.getBoundingClientRect().height
                    }, g._process = function () {
                        var t = this._getScrollTop() + this._config.offset,
                            e = this._getScrollHeight(),
                            n = this._config.offset + e - this._getOffsetHeight();
                        if (this._scrollHeight !== e && this.refresh(), t >= n) {
                            var i = this._targets[this._targets.length - 1];
                            this._activeTarget !== i && this._activate(i)
                        } else {
                            if (this._activeTarget && t < this._offsets[0] && this._offsets[0] > 0) return this._activeTarget = null, void this._clear();
                            for (var s = this._offsets.length; s--;) {
                                this._activeTarget !== this._targets[s] && t >= this._offsets[s] && ("undefined" == typeof this._offsets[s + 1] || t < this._offsets[s + 1]) && this._activate(this._targets[s])
                            }
                        }
                    }, g._activate = function (e) {
                        this._activeTarget = e, this._clear();
                        var n = this._selector.split(",");
                        n = n.map(function (t) {
                            return t + '[data-target="' + e + '"],' + t + '[href="' + e + '"]'
                        });
                        var i = t(n.join(","));
                        i.hasClass(c) ? (i.closest(f.DROPDOWN).find(f.DROPDOWN_TOGGLE).addClass(u), i.addClass(u)) : (i.addClass(u), i.parents(f.NAV_LIST_GROUP).prev(f.NAV_LINKS + ", " + f.LIST_ITEMS).addClass(u), i.parents(f.NAV_LIST_GROUP).prev(f.NAV_ITEMS).children(f.NAV_LINKS).addClass(u)), t(this._scrollElement).trigger(h.ACTIVATE, {
                            relatedTarget: e
                        })
                    }, g._clear = function () {
                        t(this._selector).filter(f.ACTIVE).removeClass(u)
                    }, o._jQueryInterface = function (e) {
                        return this.each(function () {
                            var i = t(this).data(n);
                            if (i || (i = new o(this, "object" == typeof e && e), t(this).data(n, i)), "string" == typeof e) {
                                if ("undefined" == typeof i[e]) throw new TypeError('No method named "' + e + '"');
                                i[e]()
                            }
                        })
                    }, s(o, null, [{
                        key: "VERSION",
                        get: function () {
                            return "4.0.0"
                        }
                    }, {
                        key: "Default",
                        get: function () {
                            return a
                        }
                    }]), o
                }();
            return t(window).on(h.LOAD_DATA_API, function () {
                for (var e = t.makeArray(t(f.DATA_SPY)), n = e.length; n--;) {
                    var i = t(e[n]);
                    g._jQueryInterface.call(i, i.data())
                }
            }), t.fn[e] = g._jQueryInterface, t.fn[e].Constructor = g, t.fn[e].noConflict = function () {
                return t.fn[e] = o, g._jQueryInterface
            }, g
        }(e),
        V = function (t) {
            var e = "bs.tab",
                n = "." + e,
                i = t.fn.tab,
                r = {
                    HIDE: "hide" + n,
                    HIDDEN: "hidden" + n,
                    SHOW: "show" + n,
                    SHOWN: "shown" + n,
                    CLICK_DATA_API: "click.bs.tab.data-api"
                },
                o = "dropdown-menu",
                a = "active",
                l = "disabled",
                h = "fade",
                c = "show",
                u = ".dropdown",
                f = ".nav, .list-group",
                d = ".active",
                _ = "> li > .active",
                g = '[data-toggle="tab"], [data-toggle="pill"], [data-toggle="list"]',
                p = ".dropdown-toggle",
                m = "> .dropdown-menu .active",
                v = function () {
                    function n(t) {
                        this._element = t
                    }
                    var i = n.prototype;
                    return i.show = function () {
                        var e = this;
                        if (!(this._element.parentNode && this._element.parentNode.nodeType === Node.ELEMENT_NODE && t(this._element).hasClass(a) || t(this._element).hasClass(l))) {
                            var n, i, s = t(this._element).closest(f)[0],
                                o = P.getSelectorFromElement(this._element);
                            if (s) {
                                var h = "UL" === s.nodeName ? _ : d;
                                i = (i = t.makeArray(t(s).find(h)))[i.length - 1]
                            }
                            var c = t.Event(r.HIDE, {
                                    relatedTarget: this._element
                                }),
                                u = t.Event(r.SHOW, {
                                    relatedTarget: i
                                });
                            if (i && t(i).trigger(c), t(this._element).trigger(u), !u.isDefaultPrevented() && !c.isDefaultPrevented()) {
                                o && (n = t(o)[0]), this._activate(this._element, s);
                                var g = function () {
                                    var n = t.Event(r.HIDDEN, {
                                            relatedTarget: e._element
                                        }),
                                        s = t.Event(r.SHOWN, {
                                            relatedTarget: i
                                        });
                                    t(i).trigger(n), t(e._element).trigger(s)
                                };
                                n ? this._activate(n, n.parentNode, g) : g()
                            }
                        }
                    }, i.dispose = function () {
                        t.removeData(this._element, e), this._element = null
                    }, i._activate = function (e, n, i) {
                        var s = this,
                            r = ("UL" === n.nodeName ? t(n).find(_) : t(n).children(d))[0],
                            o = i && P.supportsTransitionEnd() && r && t(r).hasClass(h),
                            a = function () {
                                return s._transitionComplete(e, r, i)
                            };
                        r && o ? t(r).one(P.TRANSITION_END, a).emulateTransitionEnd(150) : a()
                    }, i._transitionComplete = function (e, n, i) {
                        if (n) {
                            t(n).removeClass(c + " " + a);
                            var s = t(n.parentNode).find(m)[0];
                            s && t(s).removeClass(a), "tab" === n.getAttribute("role") && n.setAttribute("aria-selected", !1)
                        }
                        if (t(e).addClass(a), "tab" === e.getAttribute("role") && e.setAttribute("aria-selected", !0), P.reflow(e), t(e).addClass(c), e.parentNode && t(e.parentNode).hasClass(o)) {
                            var r = t(e).closest(u)[0];
                            r && t(r).find(p).addClass(a), e.setAttribute("aria-expanded", !0)
                        }
                        i && i()
                    }, n._jQueryInterface = function (i) {
                        return this.each(function () {
                            var s = t(this),
                                r = s.data(e);
                            if (r || (r = new n(this), s.data(e, r)), "string" == typeof i) {
                                if ("undefined" == typeof r[i]) throw new TypeError('No method named "' + i + '"');
                                r[i]()
                            }
                        })
                    }, s(n, null, [{
                        key: "VERSION",
                        get: function () {
                            return "4.0.0"
                        }
                    }]), n
                }();
            return t(document).on(r.CLICK_DATA_API, g, function (e) {
                e.preventDefault(), v._jQueryInterface.call(t(this), "show")
            }), t.fn.tab = v._jQueryInterface, t.fn.tab.Constructor = v, t.fn.tab.noConflict = function () {
                return t.fn.tab = i, v._jQueryInterface
            }, v
        }(e);
    ! function (t) {
        if ("undefined" == typeof t) throw new TypeError("Bootstrap's JavaScript requires jQuery. jQuery must be included before Bootstrap's JavaScript.");
        var e = t.fn.jquery.split(" ")[0].split(".");
        if (e[0] < 2 && e[1] < 9 || 1 === e[0] && 9 === e[1] && e[2] < 1 || e[0] >= 4) throw new Error("Bootstrap's JavaScript requires at least jQuery v1.9.1 but less than v4.0.0")
    }(e), t.Util = P, t.Alert = L, t.Button = R, t.Carousel = j, t.Collapse = H, t.Dropdown = W, t.Modal = M, t.Popover = x, t.Scrollspy = K, t.Tab = V, t.Tooltip = U, Object.defineProperty(t, "__esModule", {
        value: !0
    })
});
//# sourceMappingURL=bootstrap.min.js.map

/*! Magnific Popup - v1.1.0 - 2016-02-20
 * http://dimsemenov.com/plugins/magnific-popup/
 * Copyright (c) 2016 Dmitry Semenov; */
! function (a) {
    "function" == typeof define && define.amd ? define(["jquery"], a) : a("object" == typeof exports ? require("jquery") : window.jQuery || window.Zepto)
}(function (a) {
    var b, c, d, e, f, g, h = "Close",
        i = "BeforeClose",
        j = "AfterClose",
        k = "BeforeAppend",
        l = "MarkupParse",
        m = "Open",
        n = "Change",
        o = "mfp",
        p = "." + o,
        q = "mfp-ready",
        r = "mfp-removing",
        s = "mfp-prevent-close",
        t = function () {},
        u = !!window.jQuery,
        v = a(window),
        w = function (a, c) {
            b.ev.on(o + a + p, c)
        },
        x = function (b, c, d, e) {
            var f = document.createElement("div");
            return f.className = "mfp-" + b, d && (f.innerHTML = d), e ? c && c.appendChild(f) : (f = a(f), c && f.appendTo(c)), f
        },
        y = function (c, d) {
            b.ev.triggerHandler(o + c, d), b.st.callbacks && (c = c.charAt(0).toLowerCase() + c.slice(1), b.st.callbacks[c] && b.st.callbacks[c].apply(b, a.isArray(d) ? d : [d]))
        },
        z = function (c) {
            return c === g && b.currTemplate.closeBtn || (b.currTemplate.closeBtn = a(b.st.closeMarkup.replace("%title%", b.st.tClose)), g = c), b.currTemplate.closeBtn
        },
        A = function () {
            a.magnificPopup.instance || (b = new t, b.init(), a.magnificPopup.instance = b)
        },
        B = function () {
            var a = document.createElement("p").style,
                b = ["ms", "O", "Moz", "Webkit"];
            if (void 0 !== a.transition) return !0;
            for (; b.length;)
                if (b.pop() + "Transition" in a) return !0;
            return !1
        };
    t.prototype = {
        constructor: t,
        init: function () {
            var c = navigator.appVersion;
            b.isLowIE = b.isIE8 = document.all && !document.addEventListener, b.isAndroid = /android/gi.test(c), b.isIOS = /iphone|ipad|ipod/gi.test(c), b.supportsTransition = B(), b.probablyMobile = b.isAndroid || b.isIOS || /(Opera Mini)|Kindle|webOS|BlackBerry|(Opera Mobi)|(Windows Phone)|IEMobile/i.test(navigator.userAgent), d = a(document), b.popupsCache = {}
        },
        open: function (c) {
            var e;
            if (c.isObj === !1) {
                b.items = c.items.toArray(), b.index = 0;
                var g, h = c.items;
                for (e = 0; e < h.length; e++)
                    if (g = h[e], g.parsed && (g = g.el[0]), g === c.el[0]) {
                        b.index = e;
                        break
                    }
            } else b.items = a.isArray(c.items) ? c.items : [c.items], b.index = c.index || 0;
            if (b.isOpen) return void b.updateItemHTML();
            b.types = [], f = "", c.mainEl && c.mainEl.length ? b.ev = c.mainEl.eq(0) : b.ev = d, c.key ? (b.popupsCache[c.key] || (b.popupsCache[c.key] = {}), b.currTemplate = b.popupsCache[c.key]) : b.currTemplate = {}, b.st = a.extend(!0, {}, a.magnificPopup.defaults, c), b.fixedContentPos = "auto" === b.st.fixedContentPos ? !b.probablyMobile : b.st.fixedContentPos, b.st.modal && (b.st.closeOnContentClick = !1, b.st.closeOnBgClick = !1, b.st.showCloseBtn = !1, b.st.enableEscapeKey = !1), b.bgOverlay || (b.bgOverlay = x("bg").on("click" + p, function () {
                b.close()
            }), b.wrap = x("wrap").attr("tabindex", -1).on("click" + p, function (a) {
                b._checkIfClose(a.target) && b.close()
            }), b.container = x("container", b.wrap)), b.contentContainer = x("content"), b.st.preloader && (b.preloader = x("preloader", b.container, b.st.tLoading));
            var i = a.magnificPopup.modules;
            for (e = 0; e < i.length; e++) {
                var j = i[e];
                j = j.charAt(0).toUpperCase() + j.slice(1), b["init" + j].call(b)
            }
            y("BeforeOpen"), b.st.showCloseBtn && (b.st.closeBtnInside ? (w(l, function (a, b, c, d) {
                c.close_replaceWith = z(d.type)
            }), f += " mfp-close-btn-in") : b.wrap.append(z())), b.st.alignTop && (f += " mfp-align-top"), b.fixedContentPos ? b.wrap.css({
                overflow: b.st.overflowY,
                overflowX: "hidden",
                overflowY: b.st.overflowY
            }) : b.wrap.css({
                top: v.scrollTop(),
                position: "absolute"
            }), (b.st.fixedBgPos === !1 || "auto" === b.st.fixedBgPos && !b.fixedContentPos) && b.bgOverlay.css({
                height: d.height(),
                position: "absolute"
            }), b.st.enableEscapeKey && d.on("keyup" + p, function (a) {
                27 === a.keyCode && b.close()
            }), v.on("resize" + p, function () {
                b.updateSize()
            }), b.st.closeOnContentClick || (f += " mfp-auto-cursor"), f && b.wrap.addClass(f);
            var k = b.wH = v.height(),
                n = {};
            if (b.fixedContentPos && b._hasScrollBar(k)) {
                var o = b._getScrollbarSize();
                o && (n.marginRight = o)
            }
            b.fixedContentPos && (b.isIE7 ? a("body, html").css("overflow", "hidden") : n.overflow = "hidden");
            var r = b.st.mainClass;
            return b.isIE7 && (r += " mfp-ie7"), r && b._addClassToMFP(r), b.updateItemHTML(), y("BuildControls"), a("html").css(n), b.bgOverlay.add(b.wrap).prependTo(b.st.prependTo || a(document.body)), b._lastFocusedEl = document.activeElement, setTimeout(function () {
                b.content ? (b._addClassToMFP(q), b._setFocus()) : b.bgOverlay.addClass(q), d.on("focusin" + p, b._onFocusIn)
            }, 16), b.isOpen = !0, b.updateSize(k), y(m), c
        },
        close: function () {
            b.isOpen && (y(i), b.isOpen = !1, b.st.removalDelay && !b.isLowIE && b.supportsTransition ? (b._addClassToMFP(r), setTimeout(function () {
                b._close()
            }, b.st.removalDelay)) : b._close())
        },
        _close: function () {
            y(h);
            var c = r + " " + q + " ";
            if (b.bgOverlay.detach(), b.wrap.detach(), b.container.empty(), b.st.mainClass && (c += b.st.mainClass + " "), b._removeClassFromMFP(c), b.fixedContentPos) {
                var e = {
                    marginRight: ""
                };
                b.isIE7 ? a("body, html").css("overflow", "") : e.overflow = "", a("html").css(e)
            }
            d.off("keyup" + p + " focusin" + p), b.ev.off(p), b.wrap.attr("class", "mfp-wrap").removeAttr("style"), b.bgOverlay.attr("class", "mfp-bg"), b.container.attr("class", "mfp-container"), !b.st.showCloseBtn || b.st.closeBtnInside && b.currTemplate[b.currItem.type] !== !0 || b.currTemplate.closeBtn && b.currTemplate.closeBtn.detach(), b.st.autoFocusLast && b._lastFocusedEl && a(b._lastFocusedEl).focus(), b.currItem = null, b.content = null, b.currTemplate = null, b.prevHeight = 0, y(j)
        },
        updateSize: function (a) {
            if (b.isIOS) {
                var c = document.documentElement.clientWidth / window.innerWidth,
                    d = window.innerHeight * c;
                b.wrap.css("height", d), b.wH = d
            } else b.wH = a || v.height();
            b.fixedContentPos || b.wrap.css("height", b.wH), y("Resize")
        },
        updateItemHTML: function () {
            var c = b.items[b.index];
            b.contentContainer.detach(), b.content && b.content.detach(), c.parsed || (c = b.parseEl(b.index));
            var d = c.type;
            if (y("BeforeChange", [b.currItem ? b.currItem.type : "", d]), b.currItem = c, !b.currTemplate[d]) {
                var f = b.st[d] ? b.st[d].markup : !1;
                y("FirstMarkupParse", f), f ? b.currTemplate[d] = a(f) : b.currTemplate[d] = !0
            }
            e && e !== c.type && b.container.removeClass("mfp-" + e + "-holder");
            var g = b["get" + d.charAt(0).toUpperCase() + d.slice(1)](c, b.currTemplate[d]);
            b.appendContent(g, d), c.preloaded = !0, y(n, c), e = c.type, b.container.prepend(b.contentContainer), y("AfterChange")
        },
        appendContent: function (a, c) {
            b.content = a, a ? b.st.showCloseBtn && b.st.closeBtnInside && b.currTemplate[c] === !0 ? b.content.find(".mfp-close").length || b.content.append(z()) : b.content = a : b.content = "", y(k), b.container.addClass("mfp-" + c + "-holder"), b.contentContainer.append(b.content)
        },
        parseEl: function (c) {
            var d, e = b.items[c];
            if (e.tagName ? e = {
                    el: a(e)
                } : (d = e.type, e = {
                    data: e,
                    src: e.src
                }), e.el) {
                for (var f = b.types, g = 0; g < f.length; g++)
                    if (e.el.hasClass("mfp-" + f[g])) {
                        d = f[g];
                        break
                    } e.src = e.el.attr("data-mfp-src"), e.src || (e.src = e.el.attr("href"))
            }
            return e.type = d || b.st.type || "inline", e.index = c, e.parsed = !0, b.items[c] = e, y("ElementParse", e), b.items[c]
        },
        addGroup: function (a, c) {
            var d = function (d) {
                d.mfpEl = this, b._openClick(d, a, c)
            };
            c || (c = {});
            var e = "click.magnificPopup";
            c.mainEl = a, c.items ? (c.isObj = !0, a.off(e).on(e, d)) : (c.isObj = !1, c.delegate ? a.off(e).on(e, c.delegate, d) : (c.items = a, a.off(e).on(e, d)))
        },
        _openClick: function (c, d, e) {
            var f = void 0 !== e.midClick ? e.midClick : a.magnificPopup.defaults.midClick;
            if (f || !(2 === c.which || c.ctrlKey || c.metaKey || c.altKey || c.shiftKey)) {
                var g = void 0 !== e.disableOn ? e.disableOn : a.magnificPopup.defaults.disableOn;
                if (g)
                    if (a.isFunction(g)) {
                        if (!g.call(b)) return !0
                    } else if (v.width() < g) return !0;
                c.type && (c.preventDefault(), b.isOpen && c.stopPropagation()), e.el = a(c.mfpEl), e.delegate && (e.items = d.find(e.delegate)), b.open(e)
            }
        },
        updateStatus: function (a, d) {
            if (b.preloader) {
                c !== a && b.container.removeClass("mfp-s-" + c), d || "loading" !== a || (d = b.st.tLoading);
                var e = {
                    status: a,
                    text: d
                };
                y("UpdateStatus", e), a = e.status, d = e.text, b.preloader.html(d), b.preloader.find("a").on("click", function (a) {
                    a.stopImmediatePropagation()
                }), b.container.addClass("mfp-s-" + a), c = a
            }
        },
        _checkIfClose: function (c) {
            if (!a(c).hasClass(s)) {
                var d = b.st.closeOnContentClick,
                    e = b.st.closeOnBgClick;
                if (d && e) return !0;
                if (!b.content || a(c).hasClass("mfp-close") || b.preloader && c === b.preloader[0]) return !0;
                if (c === b.content[0] || a.contains(b.content[0], c)) {
                    if (d) return !0
                } else if (e && a.contains(document, c)) return !0;
                return !1
            }
        },
        _addClassToMFP: function (a) {
            b.bgOverlay.addClass(a), b.wrap.addClass(a)
        },
        _removeClassFromMFP: function (a) {
            this.bgOverlay.removeClass(a), b.wrap.removeClass(a)
        },
        _hasScrollBar: function (a) {
            return (b.isIE7 ? d.height() : document.body.scrollHeight) > (a || v.height())
        },
        _setFocus: function () {
            (b.st.focus ? b.content.find(b.st.focus).eq(0) : b.wrap).focus()
        },
        _onFocusIn: function (c) {
            return c.target === b.wrap[0] || a.contains(b.wrap[0], c.target) ? void 0 : (b._setFocus(), !1)
        },
        _parseMarkup: function (b, c, d) {
            var e;
            d.data && (c = a.extend(d.data, c)), y(l, [b, c, d]), a.each(c, function (c, d) {
                if (void 0 === d || d === !1) return !0;
                if (e = c.split("_"), e.length > 1) {
                    var f = b.find(p + "-" + e[0]);
                    if (f.length > 0) {
                        var g = e[1];
                        "replaceWith" === g ? f[0] !== d[0] && f.replaceWith(d) : "img" === g ? f.is("img") ? f.attr("src", d) : f.replaceWith(a("<img>").attr("src", d).attr("class", f.attr("class"))) : f.attr(e[1], d)
                    }
                } else b.find(p + "-" + c).html(d)
            })
        },
        _getScrollbarSize: function () {
            if (void 0 === b.scrollbarSize) {
                var a = document.createElement("div");
                a.style.cssText = "width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;", document.body.appendChild(a), b.scrollbarSize = a.offsetWidth - a.clientWidth, document.body.removeChild(a)
            }
            return b.scrollbarSize
        }
    }, a.magnificPopup = {
        instance: null,
        proto: t.prototype,
        modules: [],
        open: function (b, c) {
            return A(), b = b ? a.extend(!0, {}, b) : {}, b.isObj = !0, b.index = c || 0, this.instance.open(b)
        },
        close: function () {
            return a.magnificPopup.instance && a.magnificPopup.instance.close()
        },
        registerModule: function (b, c) {
            c.options && (a.magnificPopup.defaults[b] = c.options), a.extend(this.proto, c.proto), this.modules.push(b)
        },
        defaults: {
            disableOn: 0,
            key: null,
            midClick: !1,
            mainClass: "",
            preloader: !0,
            focus: "",
            closeOnContentClick: !1,
            closeOnBgClick: !0,
            closeBtnInside: !0,
            showCloseBtn: !0,
            enableEscapeKey: !0,
            modal: !1,
            alignTop: !1,
            removalDelay: 0,
            prependTo: null,
            fixedContentPos: "auto",
            fixedBgPos: "auto",
            overflowY: "auto",
            closeMarkup: '<button title="%title%" type="button" class="mfp-close">&#215;</button>',
            tClose: "Close (Esc)",
            tLoading: "Loading...",
            autoFocusLast: !0
        }
    }, a.fn.magnificPopup = function (c) {
        A();
        var d = a(this);
        if ("string" == typeof c)
            if ("open" === c) {
                var e, f = u ? d.data("magnificPopup") : d[0].magnificPopup,
                    g = parseInt(arguments[1], 10) || 0;
                f.items ? e = f.items[g] : (e = d, f.delegate && (e = e.find(f.delegate)), e = e.eq(g)), b._openClick({
                    mfpEl: e
                }, d, f)
            } else b.isOpen && b[c].apply(b, Array.prototype.slice.call(arguments, 1));
        else c = a.extend(!0, {}, c), u ? d.data("magnificPopup", c) : d[0].magnificPopup = c, b.addGroup(d, c);
        return d
    };
    var C, D, E, F = "inline",
        G = function () {
            E && (D.after(E.addClass(C)).detach(), E = null)
        };
    a.magnificPopup.registerModule(F, {
        options: {
            hiddenClass: "hide",
            markup: "",
            tNotFound: "Content not found"
        },
        proto: {
            initInline: function () {
                b.types.push(F), w(h + "." + F, function () {
                    G()
                })
            },
            getInline: function (c, d) {
                if (G(), c.src) {
                    var e = b.st.inline,
                        f = a(c.src);
                    if (f.length) {
                        var g = f[0].parentNode;
                        g && g.tagName && (D || (C = e.hiddenClass, D = x(C), C = "mfp-" + C), E = f.after(D).detach().removeClass(C)), b.updateStatus("ready")
                    } else b.updateStatus("error", e.tNotFound), f = a("<div>");
                    return c.inlineElement = f, f
                }
                return b.updateStatus("ready"), b._parseMarkup(d, {}, c), d
            }
        }
    });
    var H, I = "ajax",
        J = function () {
            H && a(document.body).removeClass(H)
        },
        K = function () {
            J(), b.req && b.req.abort()
        };
    a.magnificPopup.registerModule(I, {
        options: {
            settings: null,
            cursor: "mfp-ajax-cur",
            tError: '<a href="%url%">The content</a> could not be loaded.'
        },
        proto: {
            initAjax: function () {
                b.types.push(I), H = b.st.ajax.cursor, w(h + "." + I, K), w("BeforeChange." + I, K)
            },
            getAjax: function (c) {
                H && a(document.body).addClass(H), b.updateStatus("loading");
                var d = a.extend({
                    url: c.src,
                    success: function (d, e, f) {
                        var g = {
                            data: d,
                            xhr: f
                        };
                        y("ParseAjax", g), b.appendContent(a(g.data), I), c.finished = !0, J(), b._setFocus(), setTimeout(function () {
                            b.wrap.addClass(q)
                        }, 16), b.updateStatus("ready"), y("AjaxContentAdded")
                    },
                    error: function () {
                        J(), c.finished = c.loadError = !0, b.updateStatus("error", b.st.ajax.tError.replace("%url%", c.src))
                    }
                }, b.st.ajax.settings);
                return b.req = a.ajax(d), ""
            }
        }
    });
    var L, M = function (c) {
        if (c.data && void 0 !== c.data.title) return c.data.title;
        var d = b.st.image.titleSrc;
        if (d) {
            if (a.isFunction(d)) return d.call(b, c);
            if (c.el) return c.el.attr(d) || ""
        }
        return ""
    };
    a.magnificPopup.registerModule("image", {
        options: {
            markup: '<div class="mfp-figure"><div class="mfp-close"></div><figure><div class="mfp-img"></div><figcaption><div class="mfp-bottom-bar"><div class="mfp-title"></div><div class="mfp-counter"></div></div></figcaption></figure></div>',
            cursor: "mfp-zoom-out-cur",
            titleSrc: "title",
            verticalFit: !0,
            tError: '<a href="%url%">The image</a> could not be loaded.'
        },
        proto: {
            initImage: function () {
                var c = b.st.image,
                    d = ".image";
                b.types.push("image"), w(m + d, function () {
                    "image" === b.currItem.type && c.cursor && a(document.body).addClass(c.cursor)
                }), w(h + d, function () {
                    c.cursor && a(document.body).removeClass(c.cursor), v.off("resize" + p)
                }), w("Resize" + d, b.resizeImage), b.isLowIE && w("AfterChange", b.resizeImage)
            },
            resizeImage: function () {
                var a = b.currItem;
                if (a && a.img && b.st.image.verticalFit) {
                    var c = 0;
                    b.isLowIE && (c = parseInt(a.img.css("padding-top"), 10) + parseInt(a.img.css("padding-bottom"), 10)), a.img.css("max-height", b.wH - c)
                }
            },
            _onImageHasSize: function (a) {
                a.img && (a.hasSize = !0, L && clearInterval(L), a.isCheckingImgSize = !1, y("ImageHasSize", a), a.imgHidden && (b.content && b.content.removeClass("mfp-loading"), a.imgHidden = !1))
            },
            findImageSize: function (a) {
                var c = 0,
                    d = a.img[0],
                    e = function (f) {
                        L && clearInterval(L), L = setInterval(function () {
                            return d.naturalWidth > 0 ? void b._onImageHasSize(a) : (c > 200 && clearInterval(L), c++, void(3 === c ? e(10) : 40 === c ? e(50) : 100 === c && e(500)))
                        }, f)
                    };
                e(1)
            },
            getImage: function (c, d) {
                var e = 0,
                    f = function () {
                        c && (c.img[0].complete ? (c.img.off(".mfploader"), c === b.currItem && (b._onImageHasSize(c), b.updateStatus("ready")), c.hasSize = !0, c.loaded = !0, y("ImageLoadComplete")) : (e++, 200 > e ? setTimeout(f, 100) : g()))
                    },
                    g = function () {
                        c && (c.img.off(".mfploader"), c === b.currItem && (b._onImageHasSize(c), b.updateStatus("error", h.tError.replace("%url%", c.src))), c.hasSize = !0, c.loaded = !0, c.loadError = !0)
                    },
                    h = b.st.image,
                    i = d.find(".mfp-img");
                if (i.length) {
                    var j = document.createElement("img");
                    j.className = "mfp-img", c.el && c.el.find("img").length && (j.alt = c.el.find("img").attr("alt")), c.img = a(j).on("load.mfploader", f).on("error.mfploader", g), j.src = c.src, i.is("img") && (c.img = c.img.clone()), j = c.img[0], j.naturalWidth > 0 ? c.hasSize = !0 : j.width || (c.hasSize = !1)
                }
                return b._parseMarkup(d, {
                    title: M(c),
                    img_replaceWith: c.img
                }, c), b.resizeImage(), c.hasSize ? (L && clearInterval(L), c.loadError ? (d.addClass("mfp-loading"), b.updateStatus("error", h.tError.replace("%url%", c.src))) : (d.removeClass("mfp-loading"), b.updateStatus("ready")), d) : (b.updateStatus("loading"), c.loading = !0, c.hasSize || (c.imgHidden = !0, d.addClass("mfp-loading"), b.findImageSize(c)), d)
            }
        }
    });
    var N, O = function () {
        return void 0 === N && (N = void 0 !== document.createElement("p").style.MozTransform), N
    };
    a.magnificPopup.registerModule("zoom", {
        options: {
            enabled: !1,
            easing: "ease-in-out",
            duration: 300,
            opener: function (a) {
                return a.is("img") ? a : a.find("img")
            }
        },
        proto: {
            initZoom: function () {
                var a, c = b.st.zoom,
                    d = ".zoom";
                if (c.enabled && b.supportsTransition) {
                    var e, f, g = c.duration,
                        j = function (a) {
                            var b = a.clone().removeAttr("style").removeAttr("class").addClass("mfp-animated-image"),
                                d = "all " + c.duration / 1e3 + "s " + c.easing,
                                e = {
                                    position: "fixed",
                                    zIndex: 9999,
                                    left: 0,
                                    top: 0,
                                    "-webkit-backface-visibility": "hidden"
                                },
                                f = "transition";
                            return e["-webkit-" + f] = e["-moz-" + f] = e["-o-" + f] = e[f] = d, b.css(e), b
                        },
                        k = function () {
                            b.content.css("visibility", "visible")
                        };
                    w("BuildControls" + d, function () {
                        if (b._allowZoom()) {
                            if (clearTimeout(e), b.content.css("visibility", "hidden"), a = b._getItemToZoom(), !a) return void k();
                            f = j(a), f.css(b._getOffset()), b.wrap.append(f), e = setTimeout(function () {
                                f.css(b._getOffset(!0)), e = setTimeout(function () {
                                    k(), setTimeout(function () {
                                        f.remove(), a = f = null, y("ZoomAnimationEnded")
                                    }, 16)
                                }, g)
                            }, 16)
                        }
                    }), w(i + d, function () {
                        if (b._allowZoom()) {
                            if (clearTimeout(e), b.st.removalDelay = g, !a) {
                                if (a = b._getItemToZoom(), !a) return;
                                f = j(a)
                            }
                            f.css(b._getOffset(!0)), b.wrap.append(f), b.content.css("visibility", "hidden"), setTimeout(function () {
                                f.css(b._getOffset())
                            }, 16)
                        }
                    }), w(h + d, function () {
                        b._allowZoom() && (k(), f && f.remove(), a = null)
                    })
                }
            },
            _allowZoom: function () {
                return "image" === b.currItem.type
            },
            _getItemToZoom: function () {
                return b.currItem.hasSize ? b.currItem.img : !1
            },
            _getOffset: function (c) {
                var d;
                d = c ? b.currItem.img : b.st.zoom.opener(b.currItem.el || b.currItem);
                var e = d.offset(),
                    f = parseInt(d.css("padding-top"), 10),
                    g = parseInt(d.css("padding-bottom"), 10);
                e.top -= a(window).scrollTop() - f;
                var h = {
                    width: d.width(),
                    height: (u ? d.innerHeight() : d[0].offsetHeight) - g - f
                };
                return O() ? h["-moz-transform"] = h.transform = "translate(" + e.left + "px," + e.top + "px)" : (h.left = e.left, h.top = e.top), h
            }
        }
    });
    var P = "iframe",
        Q = "//about:blank",
        R = function (a) {
            if (b.currTemplate[P]) {
                var c = b.currTemplate[P].find("iframe");
                c.length && (a || (c[0].src = Q), b.isIE8 && c.css("display", a ? "block" : "none"))
            }
        };
    a.magnificPopup.registerModule(P, {
        options: {
            markup: '<div class="mfp-iframe-scaler"><div class="mfp-close"></div><iframe class="mfp-iframe" src="//about:blank" frameborder="0" allowfullscreen></iframe></div>',
            srcAction: "iframe_src",
            patterns: {
                youtube: {
                    index: "youtube.com",
                    id: "v=",
                    src: "//www.youtube.com/embed/%id%?autoplay=1"
                },
                vimeo: {
                    index: "vimeo.com/",
                    id: "/",
                    src: "//player.vimeo.com/video/%id%?autoplay=1"
                },
                gmaps: {
                    index: "//maps.google.",
                    src: "%id%&output=embed"
                }
            }
        },
        proto: {
            initIframe: function () {
                b.types.push(P), w("BeforeChange", function (a, b, c) {
                    b !== c && (b === P ? R() : c === P && R(!0))
                }), w(h + "." + P, function () {
                    R()
                })
            },
            getIframe: function (c, d) {
                var e = c.src,
                    f = b.st.iframe;
                a.each(f.patterns, function () {
                    return e.indexOf(this.index) > -1 ? (this.id && (e = "string" == typeof this.id ? e.substr(e.lastIndexOf(this.id) + this.id.length, e.length) : this.id.call(this, e)), e = this.src.replace("%id%", e), !1) : void 0
                });
                var g = {};
                return f.srcAction && (g[f.srcAction] = e), b._parseMarkup(d, g, c), b.updateStatus("ready"), d
            }
        }
    });
    var S = function (a) {
            var c = b.items.length;
            return a > c - 1 ? a - c : 0 > a ? c + a : a
        },
        T = function (a, b, c) {
            return a.replace(/%curr%/gi, b + 1).replace(/%total%/gi, c)
        };
    a.magnificPopup.registerModule("gallery", {
        options: {
            enabled: !1,
            arrowMarkup: '<button title="%title%" type="button" class="mfp-arrow mfp-arrow-%dir%"></button>',
            preload: [0, 2],
            navigateByImgClick: !0,
            arrows: !0,
            tPrev: "Previous (Left arrow key)",
            tNext: "Next (Right arrow key)",
            tCounter: "%curr% of %total%"
        },
        proto: {
            initGallery: function () {
                var c = b.st.gallery,
                    e = ".mfp-gallery";
                return b.direction = !0, c && c.enabled ? (f += " mfp-gallery", w(m + e, function () {
                    c.navigateByImgClick && b.wrap.on("click" + e, ".mfp-img", function () {
                        return b.items.length > 1 ? (b.next(), !1) : void 0
                    }), d.on("keydown" + e, function (a) {
                        37 === a.keyCode ? b.prev() : 39 === a.keyCode && b.next()
                    })
                }), w("UpdateStatus" + e, function (a, c) {
                    c.text && (c.text = T(c.text, b.currItem.index, b.items.length))
                }), w(l + e, function (a, d, e, f) {
                    var g = b.items.length;
                    e.counter = g > 1 ? T(c.tCounter, f.index, g) : ""
                }), w("BuildControls" + e, function () {
                    if (b.items.length > 1 && c.arrows && !b.arrowLeft) {
                        var d = c.arrowMarkup,
                            e = b.arrowLeft = a(d.replace(/%title%/gi, c.tPrev).replace(/%dir%/gi, "left")).addClass(s),
                            f = b.arrowRight = a(d.replace(/%title%/gi, c.tNext).replace(/%dir%/gi, "right")).addClass(s);
                        e.click(function () {
                            b.prev()
                        }), f.click(function () {
                            b.next()
                        }), b.container.append(e.add(f))
                    }
                }), w(n + e, function () {
                    b._preloadTimeout && clearTimeout(b._preloadTimeout), b._preloadTimeout = setTimeout(function () {
                        b.preloadNearbyImages(), b._preloadTimeout = null
                    }, 16)
                }), void w(h + e, function () {
                    d.off(e), b.wrap.off("click" + e), b.arrowRight = b.arrowLeft = null
                })) : !1
            },
            next: function () {
                b.direction = !0, b.index = S(b.index + 1), b.updateItemHTML()
            },
            prev: function () {
                b.direction = !1, b.index = S(b.index - 1), b.updateItemHTML()
            },
            goTo: function (a) {
                b.direction = a >= b.index, b.index = a, b.updateItemHTML()
            },
            preloadNearbyImages: function () {
                var a, c = b.st.gallery.preload,
                    d = Math.min(c[0], b.items.length),
                    e = Math.min(c[1], b.items.length);
                for (a = 1; a <= (b.direction ? e : d); a++) b._preloadItem(b.index + a);
                for (a = 1; a <= (b.direction ? d : e); a++) b._preloadItem(b.index - a)
            },
            _preloadItem: function (c) {
                if (c = S(c), !b.items[c].preloaded) {
                    var d = b.items[c];
                    d.parsed || (d = b.parseEl(c)), y("LazyLoad", d), "image" === d.type && (d.img = a('<img class="mfp-img" />').on("load.mfploader", function () {
                        d.hasSize = !0
                    }).on("error.mfploader", function () {
                        d.hasSize = !0, d.loadError = !0, y("LazyLoadError", d)
                    }).attr("src", d.src)), d.preloaded = !0
                }
            }
        }
    });
    var U = "retina";
    a.magnificPopup.registerModule(U, {
        options: {
            replaceSrc: function (a) {
                return a.src.replace(/\.\w+$/, function (a) {
                    return "@2x" + a
                })
            },
            ratio: 1
        },
        proto: {
            initRetina: function () {
                if (window.devicePixelRatio > 1) {
                    var a = b.st.retina,
                        c = a.ratio;
                    c = isNaN(c) ? c() : c, c > 1 && (w("ImageHasSize." + U, function (a, b) {
                        b.img.css({
                            "max-width": b.img[0].naturalWidth / c,
                            width: "100%"
                        })
                    }), w("ElementParse." + U, function (b, d) {
                        d.src = a.replaceSrc(d, c)
                    }))
                }
            }
        }
    }), A()
});

/*!
 * Chart.js v2.9.3
 * https://www.chartjs.org
 * (c) 2019 Chart.js Contributors
 * Released under the MIT License
 */
! function (t, e) {
    "object" == typeof exports && "undefined" != typeof module ? module.exports = e(function () {
        try {
            return require("moment")
        } catch (t) {}
    }()) : "function" == typeof define && define.amd ? define(["require"], (function (t) {
        return e(function () {
            try {
                return t("moment")
            } catch (t) {}
        }())
    })) : (t = t || self).Chart = e(t.moment)
}(this, (function (t) {
    "use strict";
    t = t && t.hasOwnProperty("default") ? t.default : t;
    var e = {
            aliceblue: [240, 248, 255],
            antiquewhite: [250, 235, 215],
            aqua: [0, 255, 255],
            aquamarine: [127, 255, 212],
            azure: [240, 255, 255],
            beige: [245, 245, 220],
            bisque: [255, 228, 196],
            black: [0, 0, 0],
            blanchedalmond: [255, 235, 205],
            blue: [0, 0, 255],
            blueviolet: [138, 43, 226],
            brown: [165, 42, 42],
            burlywood: [222, 184, 135],
            cadetblue: [95, 158, 160],
            chartreuse: [127, 255, 0],
            chocolate: [210, 105, 30],
            coral: [255, 127, 80],
            cornflowerblue: [100, 149, 237],
            cornsilk: [255, 248, 220],
            crimson: [220, 20, 60],
            cyan: [0, 255, 255],
            darkblue: [0, 0, 139],
            darkcyan: [0, 139, 139],
            darkgoldenrod: [184, 134, 11],
            darkgray: [169, 169, 169],
            darkgreen: [0, 100, 0],
            darkgrey: [169, 169, 169],
            darkkhaki: [189, 183, 107],
            darkmagenta: [139, 0, 139],
            darkolivegreen: [85, 107, 47],
            darkorange: [255, 140, 0],
            darkorchid: [153, 50, 204],
            darkred: [139, 0, 0],
            darksalmon: [233, 150, 122],
            darkseagreen: [143, 188, 143],
            darkslateblue: [72, 61, 139],
            darkslategray: [47, 79, 79],
            darkslategrey: [47, 79, 79],
            darkturquoise: [0, 206, 209],
            darkviolet: [148, 0, 211],
            deeppink: [255, 20, 147],
            deepskyblue: [0, 191, 255],
            dimgray: [105, 105, 105],
            dimgrey: [105, 105, 105],
            dodgerblue: [30, 144, 255],
            firebrick: [178, 34, 34],
            floralwhite: [255, 250, 240],
            forestgreen: [34, 139, 34],
            fuchsia: [255, 0, 255],
            gainsboro: [220, 220, 220],
            ghostwhite: [248, 248, 255],
            gold: [255, 215, 0],
            goldenrod: [218, 165, 32],
            gray: [128, 128, 128],
            green: [0, 128, 0],
            greenyellow: [173, 255, 47],
            grey: [128, 128, 128],
            honeydew: [240, 255, 240],
            hotpink: [255, 105, 180],
            indianred: [205, 92, 92],
            indigo: [75, 0, 130],
            ivory: [255, 255, 240],
            khaki: [240, 230, 140],
            lavender: [230, 230, 250],
            lavenderblush: [255, 240, 245],
            lawngreen: [124, 252, 0],
            lemonchiffon: [255, 250, 205],
            lightblue: [173, 216, 230],
            lightcoral: [240, 128, 128],
            lightcyan: [224, 255, 255],
            lightgoldenrodyellow: [250, 250, 210],
            lightgray: [211, 211, 211],
            lightgreen: [144, 238, 144],
            lightgrey: [211, 211, 211],
            lightpink: [255, 182, 193],
            lightsalmon: [255, 160, 122],
            lightseagreen: [32, 178, 170],
            lightskyblue: [135, 206, 250],
            lightslategray: [119, 136, 153],
            lightslategrey: [119, 136, 153],
            lightsteelblue: [176, 196, 222],
            lightyellow: [255, 255, 224],
            lime: [0, 255, 0],
            limegreen: [50, 205, 50],
            linen: [250, 240, 230],
            magenta: [255, 0, 255],
            maroon: [128, 0, 0],
            mediumaquamarine: [102, 205, 170],
            mediumblue: [0, 0, 205],
            mediumorchid: [186, 85, 211],
            mediumpurple: [147, 112, 219],
            mediumseagreen: [60, 179, 113],
            mediumslateblue: [123, 104, 238],
            mediumspringgreen: [0, 250, 154],
            mediumturquoise: [72, 209, 204],
            mediumvioletred: [199, 21, 133],
            midnightblue: [25, 25, 112],
            mintcream: [245, 255, 250],
            mistyrose: [255, 228, 225],
            moccasin: [255, 228, 181],
            navajowhite: [255, 222, 173],
            navy: [0, 0, 128],
            oldlace: [253, 245, 230],
            olive: [128, 128, 0],
            olivedrab: [107, 142, 35],
            orange: [255, 165, 0],
            orangered: [255, 69, 0],
            orchid: [218, 112, 214],
            palegoldenrod: [238, 232, 170],
            palegreen: [152, 251, 152],
            paleturquoise: [175, 238, 238],
            palevioletred: [219, 112, 147],
            papayawhip: [255, 239, 213],
            peachpuff: [255, 218, 185],
            peru: [205, 133, 63],
            pink: [255, 192, 203],
            plum: [221, 160, 221],
            powderblue: [176, 224, 230],
            purple: [128, 0, 128],
            rebeccapurple: [102, 51, 153],
            red: [255, 0, 0],
            rosybrown: [188, 143, 143],
            royalblue: [65, 105, 225],
            saddlebrown: [139, 69, 19],
            salmon: [250, 128, 114],
            sandybrown: [244, 164, 96],
            seagreen: [46, 139, 87],
            seashell: [255, 245, 238],
            sienna: [160, 82, 45],
            silver: [192, 192, 192],
            skyblue: [135, 206, 235],
            slateblue: [106, 90, 205],
            slategray: [112, 128, 144],
            slategrey: [112, 128, 144],
            snow: [255, 250, 250],
            springgreen: [0, 255, 127],
            steelblue: [70, 130, 180],
            tan: [210, 180, 140],
            teal: [0, 128, 128],
            thistle: [216, 191, 216],
            tomato: [255, 99, 71],
            turquoise: [64, 224, 208],
            violet: [238, 130, 238],
            wheat: [245, 222, 179],
            white: [255, 255, 255],
            whitesmoke: [245, 245, 245],
            yellow: [255, 255, 0],
            yellowgreen: [154, 205, 50]
        },
        n = function (t, e) {
            return t(e = {
                exports: {}
            }, e.exports), e.exports
        }((function (t) {
            var n = {};
            for (var i in e) e.hasOwnProperty(i) && (n[e[i]] = i);
            var a = t.exports = {
                rgb: {
                    channels: 3,
                    labels: "rgb"
                },
                hsl: {
                    channels: 3,
                    labels: "hsl"
                },
                hsv: {
                    channels: 3,
                    labels: "hsv"
                },
                hwb: {
                    channels: 3,
                    labels: "hwb"
                },
                cmyk: {
                    channels: 4,
                    labels: "cmyk"
                },
                xyz: {
                    channels: 3,
                    labels: "xyz"
                },
                lab: {
                    channels: 3,
                    labels: "lab"
                },
                lch: {
                    channels: 3,
                    labels: "lch"
                },
                hex: {
                    channels: 1,
                    labels: ["hex"]
                },
                keyword: {
                    channels: 1,
                    labels: ["keyword"]
                },
                ansi16: {
                    channels: 1,
                    labels: ["ansi16"]
                },
                ansi256: {
                    channels: 1,
                    labels: ["ansi256"]
                },
                hcg: {
                    channels: 3,
                    labels: ["h", "c", "g"]
                },
                apple: {
                    channels: 3,
                    labels: ["r16", "g16", "b16"]
                },
                gray: {
                    channels: 1,
                    labels: ["gray"]
                }
            };
            for (var r in a)
                if (a.hasOwnProperty(r)) {
                    if (!("channels" in a[r])) throw new Error("missing channels property: " + r);
                    if (!("labels" in a[r])) throw new Error("missing channel labels property: " + r);
                    if (a[r].labels.length !== a[r].channels) throw new Error("channel and label counts mismatch: " + r);
                    var o = a[r].channels,
                        s = a[r].labels;
                    delete a[r].channels, delete a[r].labels, Object.defineProperty(a[r], "channels", {
                        value: o
                    }), Object.defineProperty(a[r], "labels", {
                        value: s
                    })
                } a.rgb.hsl = function (t) {
                var e, n, i = t[0] / 255,
                    a = t[1] / 255,
                    r = t[2] / 255,
                    o = Math.min(i, a, r),
                    s = Math.max(i, a, r),
                    l = s - o;
                return s === o ? e = 0 : i === s ? e = (a - r) / l : a === s ? e = 2 + (r - i) / l : r === s && (e = 4 + (i - a) / l), (e = Math.min(60 * e, 360)) < 0 && (e += 360), n = (o + s) / 2, [e, 100 * (s === o ? 0 : n <= .5 ? l / (s + o) : l / (2 - s - o)), 100 * n]
            }, a.rgb.hsv = function (t) {
                var e, n, i, a, r, o = t[0] / 255,
                    s = t[1] / 255,
                    l = t[2] / 255,
                    u = Math.max(o, s, l),
                    d = u - Math.min(o, s, l),
                    h = function (t) {
                        return (u - t) / 6 / d + .5
                    };
                return 0 === d ? a = r = 0 : (r = d / u, e = h(o), n = h(s), i = h(l), o === u ? a = i - n : s === u ? a = 1 / 3 + e - i : l === u && (a = 2 / 3 + n - e), a < 0 ? a += 1 : a > 1 && (a -= 1)), [360 * a, 100 * r, 100 * u]
            }, a.rgb.hwb = function (t) {
                var e = t[0],
                    n = t[1],
                    i = t[2];
                return [a.rgb.hsl(t)[0], 100 * (1 / 255 * Math.min(e, Math.min(n, i))), 100 * (i = 1 - 1 / 255 * Math.max(e, Math.max(n, i)))]
            }, a.rgb.cmyk = function (t) {
                var e, n = t[0] / 255,
                    i = t[1] / 255,
                    a = t[2] / 255;
                return [100 * ((1 - n - (e = Math.min(1 - n, 1 - i, 1 - a))) / (1 - e) || 0), 100 * ((1 - i - e) / (1 - e) || 0), 100 * ((1 - a - e) / (1 - e) || 0), 100 * e]
            }, a.rgb.keyword = function (t) {
                var i = n[t];
                if (i) return i;
                var a, r, o, s = 1 / 0;
                for (var l in e)
                    if (e.hasOwnProperty(l)) {
                        var u = e[l],
                            d = (r = t, o = u, Math.pow(r[0] - o[0], 2) + Math.pow(r[1] - o[1], 2) + Math.pow(r[2] - o[2], 2));
                        d < s && (s = d, a = l)
                    } return a
            }, a.keyword.rgb = function (t) {
                return e[t]
            }, a.rgb.xyz = function (t) {
                var e = t[0] / 255,
                    n = t[1] / 255,
                    i = t[2] / 255;
                return [100 * (.4124 * (e = e > .04045 ? Math.pow((e + .055) / 1.055, 2.4) : e / 12.92) + .3576 * (n = n > .04045 ? Math.pow((n + .055) / 1.055, 2.4) : n / 12.92) + .1805 * (i = i > .04045 ? Math.pow((i + .055) / 1.055, 2.4) : i / 12.92)), 100 * (.2126 * e + .7152 * n + .0722 * i), 100 * (.0193 * e + .1192 * n + .9505 * i)]
            }, a.rgb.lab = function (t) {
                var e = a.rgb.xyz(t),
                    n = e[0],
                    i = e[1],
                    r = e[2];
                return i /= 100, r /= 108.883, n = (n /= 95.047) > .008856 ? Math.pow(n, 1 / 3) : 7.787 * n + 16 / 116, [116 * (i = i > .008856 ? Math.pow(i, 1 / 3) : 7.787 * i + 16 / 116) - 16, 500 * (n - i), 200 * (i - (r = r > .008856 ? Math.pow(r, 1 / 3) : 7.787 * r + 16 / 116))]
            }, a.hsl.rgb = function (t) {
                var e, n, i, a, r, o = t[0] / 360,
                    s = t[1] / 100,
                    l = t[2] / 100;
                if (0 === s) return [r = 255 * l, r, r];
                e = 2 * l - (n = l < .5 ? l * (1 + s) : l + s - l * s), a = [0, 0, 0];
                for (var u = 0; u < 3; u++)(i = o + 1 / 3 * -(u - 1)) < 0 && i++, i > 1 && i--, r = 6 * i < 1 ? e + 6 * (n - e) * i : 2 * i < 1 ? n : 3 * i < 2 ? e + (n - e) * (2 / 3 - i) * 6 : e, a[u] = 255 * r;
                return a
            }, a.hsl.hsv = function (t) {
                var e = t[0],
                    n = t[1] / 100,
                    i = t[2] / 100,
                    a = n,
                    r = Math.max(i, .01);
                return n *= (i *= 2) <= 1 ? i : 2 - i, a *= r <= 1 ? r : 2 - r, [e, 100 * (0 === i ? 2 * a / (r + a) : 2 * n / (i + n)), 100 * ((i + n) / 2)]
            }, a.hsv.rgb = function (t) {
                var e = t[0] / 60,
                    n = t[1] / 100,
                    i = t[2] / 100,
                    a = Math.floor(e) % 6,
                    r = e - Math.floor(e),
                    o = 255 * i * (1 - n),
                    s = 255 * i * (1 - n * r),
                    l = 255 * i * (1 - n * (1 - r));
                switch (i *= 255, a) {
                    case 0:
                        return [i, l, o];
                    case 1:
                        return [s, i, o];
                    case 2:
                        return [o, i, l];
                    case 3:
                        return [o, s, i];
                    case 4:
                        return [l, o, i];
                    case 5:
                        return [i, o, s]
                }
            }, a.hsv.hsl = function (t) {
                var e, n, i, a = t[0],
                    r = t[1] / 100,
                    o = t[2] / 100,
                    s = Math.max(o, .01);
                return i = (2 - r) * o, n = r * s, [a, 100 * (n = (n /= (e = (2 - r) * s) <= 1 ? e : 2 - e) || 0), 100 * (i /= 2)]
            }, a.hwb.rgb = function (t) {
                var e, n, i, a, r, o, s, l = t[0] / 360,
                    u = t[1] / 100,
                    d = t[2] / 100,
                    h = u + d;
                switch (h > 1 && (u /= h, d /= h), i = 6 * l - (e = Math.floor(6 * l)), 0 != (1 & e) && (i = 1 - i), a = u + i * ((n = 1 - d) - u), e) {
                    default:
                    case 6:
                    case 0:
                        r = n, o = a, s = u;
                        break;
                    case 1:
                        r = a, o = n, s = u;
                        break;
                    case 2:
                        r = u, o = n, s = a;
                        break;
                    case 3:
                        r = u, o = a, s = n;
                        break;
                    case 4:
                        r = a, o = u, s = n;
                        break;
                    case 5:
                        r = n, o = u, s = a
                }
                return [255 * r, 255 * o, 255 * s]
            }, a.cmyk.rgb = function (t) {
                var e = t[0] / 100,
                    n = t[1] / 100,
                    i = t[2] / 100,
                    a = t[3] / 100;
                return [255 * (1 - Math.min(1, e * (1 - a) + a)), 255 * (1 - Math.min(1, n * (1 - a) + a)), 255 * (1 - Math.min(1, i * (1 - a) + a))]
            }, a.xyz.rgb = function (t) {
                var e, n, i, a = t[0] / 100,
                    r = t[1] / 100,
                    o = t[2] / 100;
                return n = -.9689 * a + 1.8758 * r + .0415 * o, i = .0557 * a + -.204 * r + 1.057 * o, e = (e = 3.2406 * a + -1.5372 * r + -.4986 * o) > .0031308 ? 1.055 * Math.pow(e, 1 / 2.4) - .055 : 12.92 * e, n = n > .0031308 ? 1.055 * Math.pow(n, 1 / 2.4) - .055 : 12.92 * n, i = i > .0031308 ? 1.055 * Math.pow(i, 1 / 2.4) - .055 : 12.92 * i, [255 * (e = Math.min(Math.max(0, e), 1)), 255 * (n = Math.min(Math.max(0, n), 1)), 255 * (i = Math.min(Math.max(0, i), 1))]
            }, a.xyz.lab = function (t) {
                var e = t[0],
                    n = t[1],
                    i = t[2];
                return n /= 100, i /= 108.883, e = (e /= 95.047) > .008856 ? Math.pow(e, 1 / 3) : 7.787 * e + 16 / 116, [116 * (n = n > .008856 ? Math.pow(n, 1 / 3) : 7.787 * n + 16 / 116) - 16, 500 * (e - n), 200 * (n - (i = i > .008856 ? Math.pow(i, 1 / 3) : 7.787 * i + 16 / 116))]
            }, a.lab.xyz = function (t) {
                var e, n, i, a = t[0];
                e = t[1] / 500 + (n = (a + 16) / 116), i = n - t[2] / 200;
                var r = Math.pow(n, 3),
                    o = Math.pow(e, 3),
                    s = Math.pow(i, 3);
                return n = r > .008856 ? r : (n - 16 / 116) / 7.787, e = o > .008856 ? o : (e - 16 / 116) / 7.787, i = s > .008856 ? s : (i - 16 / 116) / 7.787, [e *= 95.047, n *= 100, i *= 108.883]
            }, a.lab.lch = function (t) {
                var e, n = t[0],
                    i = t[1],
                    a = t[2];
                return (e = 360 * Math.atan2(a, i) / 2 / Math.PI) < 0 && (e += 360), [n, Math.sqrt(i * i + a * a), e]
            }, a.lch.lab = function (t) {
                var e, n = t[0],
                    i = t[1];
                return e = t[2] / 360 * 2 * Math.PI, [n, i * Math.cos(e), i * Math.sin(e)]
            }, a.rgb.ansi16 = function (t) {
                var e = t[0],
                    n = t[1],
                    i = t[2],
                    r = 1 in arguments ? arguments[1] : a.rgb.hsv(t)[2];
                if (0 === (r = Math.round(r / 50))) return 30;
                var o = 30 + (Math.round(i / 255) << 2 | Math.round(n / 255) << 1 | Math.round(e / 255));
                return 2 === r && (o += 60), o
            }, a.hsv.ansi16 = function (t) {
                return a.rgb.ansi16(a.hsv.rgb(t), t[2])
            }, a.rgb.ansi256 = function (t) {
                var e = t[0],
                    n = t[1],
                    i = t[2];
                return e === n && n === i ? e < 8 ? 16 : e > 248 ? 231 : Math.round((e - 8) / 247 * 24) + 232 : 16 + 36 * Math.round(e / 255 * 5) + 6 * Math.round(n / 255 * 5) + Math.round(i / 255 * 5)
            }, a.ansi16.rgb = function (t) {
                var e = t % 10;
                if (0 === e || 7 === e) return t > 50 && (e += 3.5), [e = e / 10.5 * 255, e, e];
                var n = .5 * (1 + ~~(t > 50));
                return [(1 & e) * n * 255, (e >> 1 & 1) * n * 255, (e >> 2 & 1) * n * 255]
            }, a.ansi256.rgb = function (t) {
                if (t >= 232) {
                    var e = 10 * (t - 232) + 8;
                    return [e, e, e]
                }
                var n;
                return t -= 16, [Math.floor(t / 36) / 5 * 255, Math.floor((n = t % 36) / 6) / 5 * 255, n % 6 / 5 * 255]
            }, a.rgb.hex = function (t) {
                var e = (((255 & Math.round(t[0])) << 16) + ((255 & Math.round(t[1])) << 8) + (255 & Math.round(t[2]))).toString(16).toUpperCase();
                return "000000".substring(e.length) + e
            }, a.hex.rgb = function (t) {
                var e = t.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
                if (!e) return [0, 0, 0];
                var n = e[0];
                3 === e[0].length && (n = n.split("").map((function (t) {
                    return t + t
                })).join(""));
                var i = parseInt(n, 16);
                return [i >> 16 & 255, i >> 8 & 255, 255 & i]
            }, a.rgb.hcg = function (t) {
                var e, n = t[0] / 255,
                    i = t[1] / 255,
                    a = t[2] / 255,
                    r = Math.max(Math.max(n, i), a),
                    o = Math.min(Math.min(n, i), a),
                    s = r - o;
                return e = s <= 0 ? 0 : r === n ? (i - a) / s % 6 : r === i ? 2 + (a - n) / s : 4 + (n - i) / s + 4, e /= 6, [360 * (e %= 1), 100 * s, 100 * (s < 1 ? o / (1 - s) : 0)]
            }, a.hsl.hcg = function (t) {
                var e = t[1] / 100,
                    n = t[2] / 100,
                    i = 1,
                    a = 0;
                return (i = n < .5 ? 2 * e * n : 2 * e * (1 - n)) < 1 && (a = (n - .5 * i) / (1 - i)), [t[0], 100 * i, 100 * a]
            }, a.hsv.hcg = function (t) {
                var e = t[1] / 100,
                    n = t[2] / 100,
                    i = e * n,
                    a = 0;
                return i < 1 && (a = (n - i) / (1 - i)), [t[0], 100 * i, 100 * a]
            }, a.hcg.rgb = function (t) {
                var e = t[0] / 360,
                    n = t[1] / 100,
                    i = t[2] / 100;
                if (0 === n) return [255 * i, 255 * i, 255 * i];
                var a, r = [0, 0, 0],
                    o = e % 1 * 6,
                    s = o % 1,
                    l = 1 - s;
                switch (Math.floor(o)) {
                    case 0:
                        r[0] = 1, r[1] = s, r[2] = 0;
                        break;
                    case 1:
                        r[0] = l, r[1] = 1, r[2] = 0;
                        break;
                    case 2:
                        r[0] = 0, r[1] = 1, r[2] = s;
                        break;
                    case 3:
                        r[0] = 0, r[1] = l, r[2] = 1;
                        break;
                    case 4:
                        r[0] = s, r[1] = 0, r[2] = 1;
                        break;
                    default:
                        r[0] = 1, r[1] = 0, r[2] = l
                }
                return a = (1 - n) * i, [255 * (n * r[0] + a), 255 * (n * r[1] + a), 255 * (n * r[2] + a)]
            }, a.hcg.hsv = function (t) {
                var e = t[1] / 100,
                    n = e + t[2] / 100 * (1 - e),
                    i = 0;
                return n > 0 && (i = e / n), [t[0], 100 * i, 100 * n]
            }, a.hcg.hsl = function (t) {
                var e = t[1] / 100,
                    n = t[2] / 100 * (1 - e) + .5 * e,
                    i = 0;
                return n > 0 && n < .5 ? i = e / (2 * n) : n >= .5 && n < 1 && (i = e / (2 * (1 - n))), [t[0], 100 * i, 100 * n]
            }, a.hcg.hwb = function (t) {
                var e = t[1] / 100,
                    n = e + t[2] / 100 * (1 - e);
                return [t[0], 100 * (n - e), 100 * (1 - n)]
            }, a.hwb.hcg = function (t) {
                var e = t[1] / 100,
                    n = 1 - t[2] / 100,
                    i = n - e,
                    a = 0;
                return i < 1 && (a = (n - i) / (1 - i)), [t[0], 100 * i, 100 * a]
            }, a.apple.rgb = function (t) {
                return [t[0] / 65535 * 255, t[1] / 65535 * 255, t[2] / 65535 * 255]
            }, a.rgb.apple = function (t) {
                return [t[0] / 255 * 65535, t[1] / 255 * 65535, t[2] / 255 * 65535]
            }, a.gray.rgb = function (t) {
                return [t[0] / 100 * 255, t[0] / 100 * 255, t[0] / 100 * 255]
            }, a.gray.hsl = a.gray.hsv = function (t) {
                return [0, 0, t[0]]
            }, a.gray.hwb = function (t) {
                return [0, 100, t[0]]
            }, a.gray.cmyk = function (t) {
                return [0, 0, 0, t[0]]
            }, a.gray.lab = function (t) {
                return [t[0], 0, 0]
            }, a.gray.hex = function (t) {
                var e = 255 & Math.round(t[0] / 100 * 255),
                    n = ((e << 16) + (e << 8) + e).toString(16).toUpperCase();
                return "000000".substring(n.length) + n
            }, a.rgb.gray = function (t) {
                return [(t[0] + t[1] + t[2]) / 3 / 255 * 100]
            }
        }));
    n.rgb, n.hsl, n.hsv, n.hwb, n.cmyk, n.xyz, n.lab, n.lch, n.hex, n.keyword, n.ansi16, n.ansi256, n.hcg, n.apple, n.gray;

    function i(t) {
        var e = function () {
                for (var t = {}, e = Object.keys(n), i = e.length, a = 0; a < i; a++) t[e[a]] = {
                    distance: -1,
                    parent: null
                };
                return t
            }(),
            i = [t];
        for (e[t].distance = 0; i.length;)
            for (var a = i.pop(), r = Object.keys(n[a]), o = r.length, s = 0; s < o; s++) {
                var l = r[s],
                    u = e[l]; - 1 === u.distance && (u.distance = e[a].distance + 1, u.parent = a, i.unshift(l))
            }
        return e
    }

    function a(t, e) {
        return function (n) {
            return e(t(n))
        }
    }

    function r(t, e) {
        for (var i = [e[t].parent, t], r = n[e[t].parent][t], o = e[t].parent; e[o].parent;) i.unshift(e[o].parent), r = a(n[e[o].parent][o], r), o = e[o].parent;
        return r.conversion = i, r
    }
    var o = {};
    Object.keys(n).forEach((function (t) {
        o[t] = {}, Object.defineProperty(o[t], "channels", {
            value: n[t].channels
        }), Object.defineProperty(o[t], "labels", {
            value: n[t].labels
        });
        var e = function (t) {
            for (var e = i(t), n = {}, a = Object.keys(e), o = a.length, s = 0; s < o; s++) {
                var l = a[s];
                null !== e[l].parent && (n[l] = r(l, e))
            }
            return n
        }(t);
        Object.keys(e).forEach((function (n) {
            var i = e[n];
            o[t][n] = function (t) {
                var e = function (e) {
                    if (null == e) return e;
                    arguments.length > 1 && (e = Array.prototype.slice.call(arguments));
                    var n = t(e);
                    if ("object" == typeof n)
                        for (var i = n.length, a = 0; a < i; a++) n[a] = Math.round(n[a]);
                    return n
                };
                return "conversion" in t && (e.conversion = t.conversion), e
            }(i), o[t][n].raw = function (t) {
                var e = function (e) {
                    return null == e ? e : (arguments.length > 1 && (e = Array.prototype.slice.call(arguments)), t(e))
                };
                return "conversion" in t && (e.conversion = t.conversion), e
            }(i)
        }))
    }));
    var s = o,
        l = {
            aliceblue: [240, 248, 255],
            antiquewhite: [250, 235, 215],
            aqua: [0, 255, 255],
            aquamarine: [127, 255, 212],
            azure: [240, 255, 255],
            beige: [245, 245, 220],
            bisque: [255, 228, 196],
            black: [0, 0, 0],
            blanchedalmond: [255, 235, 205],
            blue: [0, 0, 255],
            blueviolet: [138, 43, 226],
            brown: [165, 42, 42],
            burlywood: [222, 184, 135],
            cadetblue: [95, 158, 160],
            chartreuse: [127, 255, 0],
            chocolate: [210, 105, 30],
            coral: [255, 127, 80],
            cornflowerblue: [100, 149, 237],
            cornsilk: [255, 248, 220],
            crimson: [220, 20, 60],
            cyan: [0, 255, 255],
            darkblue: [0, 0, 139],
            darkcyan: [0, 139, 139],
            darkgoldenrod: [184, 134, 11],
            darkgray: [169, 169, 169],
            darkgreen: [0, 100, 0],
            darkgrey: [169, 169, 169],
            darkkhaki: [189, 183, 107],
            darkmagenta: [139, 0, 139],
            darkolivegreen: [85, 107, 47],
            darkorange: [255, 140, 0],
            darkorchid: [153, 50, 204],
            darkred: [139, 0, 0],
            darksalmon: [233, 150, 122],
            darkseagreen: [143, 188, 143],
            darkslateblue: [72, 61, 139],
            darkslategray: [47, 79, 79],
            darkslategrey: [47, 79, 79],
            darkturquoise: [0, 206, 209],
            darkviolet: [148, 0, 211],
            deeppink: [255, 20, 147],
            deepskyblue: [0, 191, 255],
            dimgray: [105, 105, 105],
            dimgrey: [105, 105, 105],
            dodgerblue: [30, 144, 255],
            firebrick: [178, 34, 34],
            floralwhite: [255, 250, 240],
            forestgreen: [34, 139, 34],
            fuchsia: [255, 0, 255],
            gainsboro: [220, 220, 220],
            ghostwhite: [248, 248, 255],
            gold: [255, 215, 0],
            goldenrod: [218, 165, 32],
            gray: [128, 128, 128],
            green: [0, 128, 0],
            greenyellow: [173, 255, 47],
            grey: [128, 128, 128],
            honeydew: [240, 255, 240],
            hotpink: [255, 105, 180],
            indianred: [205, 92, 92],
            indigo: [75, 0, 130],
            ivory: [255, 255, 240],
            khaki: [240, 230, 140],
            lavender: [230, 230, 250],
            lavenderblush: [255, 240, 245],
            lawngreen: [124, 252, 0],
            lemonchiffon: [255, 250, 205],
            lightblue: [173, 216, 230],
            lightcoral: [240, 128, 128],
            lightcyan: [224, 255, 255],
            lightgoldenrodyellow: [250, 250, 210],
            lightgray: [211, 211, 211],
            lightgreen: [144, 238, 144],
            lightgrey: [211, 211, 211],
            lightpink: [255, 182, 193],
            lightsalmon: [255, 160, 122],
            lightseagreen: [32, 178, 170],
            lightskyblue: [135, 206, 250],
            lightslategray: [119, 136, 153],
            lightslategrey: [119, 136, 153],
            lightsteelblue: [176, 196, 222],
            lightyellow: [255, 255, 224],
            lime: [0, 255, 0],
            limegreen: [50, 205, 50],
            linen: [250, 240, 230],
            magenta: [255, 0, 255],
            maroon: [128, 0, 0],
            mediumaquamarine: [102, 205, 170],
            mediumblue: [0, 0, 205],
            mediumorchid: [186, 85, 211],
            mediumpurple: [147, 112, 219],
            mediumseagreen: [60, 179, 113],
            mediumslateblue: [123, 104, 238],
            mediumspringgreen: [0, 250, 154],
            mediumturquoise: [72, 209, 204],
            mediumvioletred: [199, 21, 133],
            midnightblue: [25, 25, 112],
            mintcream: [245, 255, 250],
            mistyrose: [255, 228, 225],
            moccasin: [255, 228, 181],
            navajowhite: [255, 222, 173],
            navy: [0, 0, 128],
            oldlace: [253, 245, 230],
            olive: [128, 128, 0],
            olivedrab: [107, 142, 35],
            orange: [255, 165, 0],
            orangered: [255, 69, 0],
            orchid: [218, 112, 214],
            palegoldenrod: [238, 232, 170],
            palegreen: [152, 251, 152],
            paleturquoise: [175, 238, 238],
            palevioletred: [219, 112, 147],
            papayawhip: [255, 239, 213],
            peachpuff: [255, 218, 185],
            peru: [205, 133, 63],
            pink: [255, 192, 203],
            plum: [221, 160, 221],
            powderblue: [176, 224, 230],
            purple: [128, 0, 128],
            rebeccapurple: [102, 51, 153],
            red: [255, 0, 0],
            rosybrown: [188, 143, 143],
            royalblue: [65, 105, 225],
            saddlebrown: [139, 69, 19],
            salmon: [250, 128, 114],
            sandybrown: [244, 164, 96],
            seagreen: [46, 139, 87],
            seashell: [255, 245, 238],
            sienna: [160, 82, 45],
            silver: [192, 192, 192],
            skyblue: [135, 206, 235],
            slateblue: [106, 90, 205],
            slategray: [112, 128, 144],
            slategrey: [112, 128, 144],
            snow: [255, 250, 250],
            springgreen: [0, 255, 127],
            steelblue: [70, 130, 180],
            tan: [210, 180, 140],
            teal: [0, 128, 128],
            thistle: [216, 191, 216],
            tomato: [255, 99, 71],
            turquoise: [64, 224, 208],
            violet: [238, 130, 238],
            wheat: [245, 222, 179],
            white: [255, 255, 255],
            whitesmoke: [245, 245, 245],
            yellow: [255, 255, 0],
            yellowgreen: [154, 205, 50]
        },
        u = {
            getRgba: d,
            getHsla: h,
            getRgb: function (t) {
                var e = d(t);
                return e && e.slice(0, 3)
            },
            getHsl: function (t) {
                var e = h(t);
                return e && e.slice(0, 3)
            },
            getHwb: c,
            getAlpha: function (t) {
                var e = d(t);
                if (e) return e[3];
                if (e = h(t)) return e[3];
                if (e = c(t)) return e[3]
            },
            hexString: function (t, e) {
                e = void 0 !== e && 3 === t.length ? e : t[3];
                return "#" + v(t[0]) + v(t[1]) + v(t[2]) + (e >= 0 && e < 1 ? v(Math.round(255 * e)) : "")
            },
            rgbString: function (t, e) {
                if (e < 1 || t[3] && t[3] < 1) return f(t, e);
                return "rgb(" + t[0] + ", " + t[1] + ", " + t[2] + ")"
            },
            rgbaString: f,
            percentString: function (t, e) {
                if (e < 1 || t[3] && t[3] < 1) return g(t, e);
                var n = Math.round(t[0] / 255 * 100),
                    i = Math.round(t[1] / 255 * 100),
                    a = Math.round(t[2] / 255 * 100);
                return "rgb(" + n + "%, " + i + "%, " + a + "%)"
            },
            percentaString: g,
            hslString: function (t, e) {
                if (e < 1 || t[3] && t[3] < 1) return p(t, e);
                return "hsl(" + t[0] + ", " + t[1] + "%, " + t[2] + "%)"
            },
            hslaString: p,
            hwbString: function (t, e) {
                void 0 === e && (e = void 0 !== t[3] ? t[3] : 1);
                return "hwb(" + t[0] + ", " + t[1] + "%, " + t[2] + "%" + (void 0 !== e && 1 !== e ? ", " + e : "") + ")"
            },
            keyword: function (t) {
                return b[t.slice(0, 3)]
            }
        };

    function d(t) {
        if (t) {
            var e = [0, 0, 0],
                n = 1,
                i = t.match(/^#([a-fA-F0-9]{3,4})$/i),
                a = "";
            if (i) {
                a = (i = i[1])[3];
                for (var r = 0; r < e.length; r++) e[r] = parseInt(i[r] + i[r], 16);
                a && (n = Math.round(parseInt(a + a, 16) / 255 * 100) / 100)
            } else if (i = t.match(/^#([a-fA-F0-9]{6}([a-fA-F0-9]{2})?)$/i)) {
                a = i[2], i = i[1];
                for (r = 0; r < e.length; r++) e[r] = parseInt(i.slice(2 * r, 2 * r + 2), 16);
                a && (n = Math.round(parseInt(a, 16) / 255 * 100) / 100)
            } else if (i = t.match(/^rgba?\(\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)$/i)) {
                for (r = 0; r < e.length; r++) e[r] = parseInt(i[r + 1]);
                n = parseFloat(i[4])
            } else if (i = t.match(/^rgba?\(\s*([+-]?[\d\.]+)\%\s*,\s*([+-]?[\d\.]+)\%\s*,\s*([+-]?[\d\.]+)\%\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)$/i)) {
                for (r = 0; r < e.length; r++) e[r] = Math.round(2.55 * parseFloat(i[r + 1]));
                n = parseFloat(i[4])
            } else if (i = t.match(/(\w+)/)) {
                if ("transparent" == i[1]) return [0, 0, 0, 0];
                if (!(e = l[i[1]])) return
            }
            for (r = 0; r < e.length; r++) e[r] = m(e[r], 0, 255);
            return n = n || 0 == n ? m(n, 0, 1) : 1, e[3] = n, e
        }
    }

    function h(t) {
        if (t) {
            var e = t.match(/^hsla?\(\s*([+-]?\d+)(?:deg)?\s*,\s*([+-]?[\d\.]+)%\s*,\s*([+-]?[\d\.]+)%\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)/);
            if (e) {
                var n = parseFloat(e[4]);
                return [m(parseInt(e[1]), 0, 360), m(parseFloat(e[2]), 0, 100), m(parseFloat(e[3]), 0, 100), m(isNaN(n) ? 1 : n, 0, 1)]
            }
        }
    }

    function c(t) {
        if (t) {
            var e = t.match(/^hwb\(\s*([+-]?\d+)(?:deg)?\s*,\s*([+-]?[\d\.]+)%\s*,\s*([+-]?[\d\.]+)%\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)/);
            if (e) {
                var n = parseFloat(e[4]);
                return [m(parseInt(e[1]), 0, 360), m(parseFloat(e[2]), 0, 100), m(parseFloat(e[3]), 0, 100), m(isNaN(n) ? 1 : n, 0, 1)]
            }
        }
    }

    function f(t, e) {
        return void 0 === e && (e = void 0 !== t[3] ? t[3] : 1), "rgba(" + t[0] + ", " + t[1] + ", " + t[2] + ", " + e + ")"
    }

    function g(t, e) {
        return "rgba(" + Math.round(t[0] / 255 * 100) + "%, " + Math.round(t[1] / 255 * 100) + "%, " + Math.round(t[2] / 255 * 100) + "%, " + (e || t[3] || 1) + ")"
    }

    function p(t, e) {
        return void 0 === e && (e = void 0 !== t[3] ? t[3] : 1), "hsla(" + t[0] + ", " + t[1] + "%, " + t[2] + "%, " + e + ")"
    }

    function m(t, e, n) {
        return Math.min(Math.max(e, t), n)
    }

    function v(t) {
        var e = t.toString(16).toUpperCase();
        return e.length < 2 ? "0" + e : e
    }
    var b = {};
    for (var x in l) b[l[x]] = x;
    var y = function (t) {
        return t instanceof y ? t : this instanceof y ? (this.valid = !1, this.values = {
            rgb: [0, 0, 0],
            hsl: [0, 0, 0],
            hsv: [0, 0, 0],
            hwb: [0, 0, 0],
            cmyk: [0, 0, 0, 0],
            alpha: 1
        }, void("string" == typeof t ? (e = u.getRgba(t)) ? this.setValues("rgb", e) : (e = u.getHsla(t)) ? this.setValues("hsl", e) : (e = u.getHwb(t)) && this.setValues("hwb", e) : "object" == typeof t && (void 0 !== (e = t).r || void 0 !== e.red ? this.setValues("rgb", e) : void 0 !== e.l || void 0 !== e.lightness ? this.setValues("hsl", e) : void 0 !== e.v || void 0 !== e.value ? this.setValues("hsv", e) : void 0 !== e.w || void 0 !== e.whiteness ? this.setValues("hwb", e) : void 0 === e.c && void 0 === e.cyan || this.setValues("cmyk", e)))) : new y(t);
        var e
    };
    y.prototype = {
        isValid: function () {
            return this.valid
        },
        rgb: function () {
            return this.setSpace("rgb", arguments)
        },
        hsl: function () {
            return this.setSpace("hsl", arguments)
        },
        hsv: function () {
            return this.setSpace("hsv", arguments)
        },
        hwb: function () {
            return this.setSpace("hwb", arguments)
        },
        cmyk: function () {
            return this.setSpace("cmyk", arguments)
        },
        rgbArray: function () {
            return this.values.rgb
        },
        hslArray: function () {
            return this.values.hsl
        },
        hsvArray: function () {
            return this.values.hsv
        },
        hwbArray: function () {
            var t = this.values;
            return 1 !== t.alpha ? t.hwb.concat([t.alpha]) : t.hwb
        },
        cmykArray: function () {
            return this.values.cmyk
        },
        rgbaArray: function () {
            var t = this.values;
            return t.rgb.concat([t.alpha])
        },
        hslaArray: function () {
            var t = this.values;
            return t.hsl.concat([t.alpha])
        },
        alpha: function (t) {
            return void 0 === t ? this.values.alpha : (this.setValues("alpha", t), this)
        },
        red: function (t) {
            return this.setChannel("rgb", 0, t)
        },
        green: function (t) {
            return this.setChannel("rgb", 1, t)
        },
        blue: function (t) {
            return this.setChannel("rgb", 2, t)
        },
        hue: function (t) {
            return t && (t = (t %= 360) < 0 ? 360 + t : t), this.setChannel("hsl", 0, t)
        },
        saturation: function (t) {
            return this.setChannel("hsl", 1, t)
        },
        lightness: function (t) {
            return this.setChannel("hsl", 2, t)
        },
        saturationv: function (t) {
            return this.setChannel("hsv", 1, t)
        },
        whiteness: function (t) {
            return this.setChannel("hwb", 1, t)
        },
        blackness: function (t) {
            return this.setChannel("hwb", 2, t)
        },
        value: function (t) {
            return this.setChannel("hsv", 2, t)
        },
        cyan: function (t) {
            return this.setChannel("cmyk", 0, t)
        },
        magenta: function (t) {
            return this.setChannel("cmyk", 1, t)
        },
        yellow: function (t) {
            return this.setChannel("cmyk", 2, t)
        },
        black: function (t) {
            return this.setChannel("cmyk", 3, t)
        },
        hexString: function () {
            return u.hexString(this.values.rgb)
        },
        rgbString: function () {
            return u.rgbString(this.values.rgb, this.values.alpha)
        },
        rgbaString: function () {
            return u.rgbaString(this.values.rgb, this.values.alpha)
        },
        percentString: function () {
            return u.percentString(this.values.rgb, this.values.alpha)
        },
        hslString: function () {
            return u.hslString(this.values.hsl, this.values.alpha)
        },
        hslaString: function () {
            return u.hslaString(this.values.hsl, this.values.alpha)
        },
        hwbString: function () {
            return u.hwbString(this.values.hwb, this.values.alpha)
        },
        keyword: function () {
            return u.keyword(this.values.rgb, this.values.alpha)
        },
        rgbNumber: function () {
            var t = this.values.rgb;
            return t[0] << 16 | t[1] << 8 | t[2]
        },
        luminosity: function () {
            for (var t = this.values.rgb, e = [], n = 0; n < t.length; n++) {
                var i = t[n] / 255;
                e[n] = i <= .03928 ? i / 12.92 : Math.pow((i + .055) / 1.055, 2.4)
            }
            return .2126 * e[0] + .7152 * e[1] + .0722 * e[2]
        },
        contrast: function (t) {
            var e = this.luminosity(),
                n = t.luminosity();
            return e > n ? (e + .05) / (n + .05) : (n + .05) / (e + .05)
        },
        level: function (t) {
            var e = this.contrast(t);
            return e >= 7.1 ? "AAA" : e >= 4.5 ? "AA" : ""
        },
        dark: function () {
            var t = this.values.rgb;
            return (299 * t[0] + 587 * t[1] + 114 * t[2]) / 1e3 < 128
        },
        light: function () {
            return !this.dark()
        },
        negate: function () {
            for (var t = [], e = 0; e < 3; e++) t[e] = 255 - this.values.rgb[e];
            return this.setValues("rgb", t), this
        },
        lighten: function (t) {
            var e = this.values.hsl;
            return e[2] += e[2] * t, this.setValues("hsl", e), this
        },
        darken: function (t) {
            var e = this.values.hsl;
            return e[2] -= e[2] * t, this.setValues("hsl", e), this
        },
        saturate: function (t) {
            var e = this.values.hsl;
            return e[1] += e[1] * t, this.setValues("hsl", e), this
        },
        desaturate: function (t) {
            var e = this.values.hsl;
            return e[1] -= e[1] * t, this.setValues("hsl", e), this
        },
        whiten: function (t) {
            var e = this.values.hwb;
            return e[1] += e[1] * t, this.setValues("hwb", e), this
        },
        blacken: function (t) {
            var e = this.values.hwb;
            return e[2] += e[2] * t, this.setValues("hwb", e), this
        },
        greyscale: function () {
            var t = this.values.rgb,
                e = .3 * t[0] + .59 * t[1] + .11 * t[2];
            return this.setValues("rgb", [e, e, e]), this
        },
        clearer: function (t) {
            var e = this.values.alpha;
            return this.setValues("alpha", e - e * t), this
        },
        opaquer: function (t) {
            var e = this.values.alpha;
            return this.setValues("alpha", e + e * t), this
        },
        rotate: function (t) {
            var e = this.values.hsl,
                n = (e[0] + t) % 360;
            return e[0] = n < 0 ? 360 + n : n, this.setValues("hsl", e), this
        },
        mix: function (t, e) {
            var n = t,
                i = void 0 === e ? .5 : e,
                a = 2 * i - 1,
                r = this.alpha() - n.alpha(),
                o = ((a * r == -1 ? a : (a + r) / (1 + a * r)) + 1) / 2,
                s = 1 - o;
            return this.rgb(o * this.red() + s * n.red(), o * this.green() + s * n.green(), o * this.blue() + s * n.blue()).alpha(this.alpha() * i + n.alpha() * (1 - i))
        },
        toJSON: function () {
            return this.rgb()
        },
        clone: function () {
            var t, e, n = new y,
                i = this.values,
                a = n.values;
            for (var r in i) i.hasOwnProperty(r) && (t = i[r], "[object Array]" === (e = {}.toString.call(t)) ? a[r] = t.slice(0) : "[object Number]" === e ? a[r] = t : console.error("unexpected color value:", t));
            return n
        }
    }, y.prototype.spaces = {
        rgb: ["red", "green", "blue"],
        hsl: ["hue", "saturation", "lightness"],
        hsv: ["hue", "saturation", "value"],
        hwb: ["hue", "whiteness", "blackness"],
        cmyk: ["cyan", "magenta", "yellow", "black"]
    }, y.prototype.maxes = {
        rgb: [255, 255, 255],
        hsl: [360, 100, 100],
        hsv: [360, 100, 100],
        hwb: [360, 100, 100],
        cmyk: [100, 100, 100, 100]
    }, y.prototype.getValues = function (t) {
        for (var e = this.values, n = {}, i = 0; i < t.length; i++) n[t.charAt(i)] = e[t][i];
        return 1 !== e.alpha && (n.a = e.alpha), n
    }, y.prototype.setValues = function (t, e) {
        var n, i, a = this.values,
            r = this.spaces,
            o = this.maxes,
            l = 1;
        if (this.valid = !0, "alpha" === t) l = e;
        else if (e.length) a[t] = e.slice(0, t.length), l = e[t.length];
        else if (void 0 !== e[t.charAt(0)]) {
            for (n = 0; n < t.length; n++) a[t][n] = e[t.charAt(n)];
            l = e.a
        } else if (void 0 !== e[r[t][0]]) {
            var u = r[t];
            for (n = 0; n < t.length; n++) a[t][n] = e[u[n]];
            l = e.alpha
        }
        if (a.alpha = Math.max(0, Math.min(1, void 0 === l ? a.alpha : l)), "alpha" === t) return !1;
        for (n = 0; n < t.length; n++) i = Math.max(0, Math.min(o[t][n], a[t][n])), a[t][n] = Math.round(i);
        for (var d in r) d !== t && (a[d] = s[t][d](a[t]));
        return !0
    }, y.prototype.setSpace = function (t, e) {
        var n = e[0];
        return void 0 === n ? this.getValues(t) : ("number" == typeof n && (n = Array.prototype.slice.call(e)), this.setValues(t, n), this)
    }, y.prototype.setChannel = function (t, e, n) {
        var i = this.values[t];
        return void 0 === n ? i[e] : n === i[e] ? this : (i[e] = n, this.setValues(t, i), this)
    }, "undefined" != typeof window && (window.Color = y);
    var _, k = y,
        w = {
            noop: function () {},
            uid: (_ = 0, function () {
                return _++
            }),
            isNullOrUndef: function (t) {
                return null == t
            },
            isArray: function (t) {
                if (Array.isArray && Array.isArray(t)) return !0;
                var e = Object.prototype.toString.call(t);
                return "[object" === e.substr(0, 7) && "Array]" === e.substr(-6)
            },
            isObject: function (t) {
                return null !== t && "[object Object]" === Object.prototype.toString.call(t)
            },
            isFinite: function (t) {
                return ("number" == typeof t || t instanceof Number) && isFinite(t)
            },
            valueOrDefault: function (t, e) {
                return void 0 === t ? e : t
            },
            valueAtIndexOrDefault: function (t, e, n) {
                return w.valueOrDefault(w.isArray(t) ? t[e] : t, n)
            },
            callback: function (t, e, n) {
                if (t && "function" == typeof t.call) return t.apply(n, e)
            },
            each: function (t, e, n, i) {
                var a, r, o;
                if (w.isArray(t))
                    if (r = t.length, i)
                        for (a = r - 1; a >= 0; a--) e.call(n, t[a], a);
                    else
                        for (a = 0; a < r; a++) e.call(n, t[a], a);
                else if (w.isObject(t))
                    for (r = (o = Object.keys(t)).length, a = 0; a < r; a++) e.call(n, t[o[a]], o[a])
            },
            arrayEquals: function (t, e) {
                var n, i, a, r;
                if (!t || !e || t.length !== e.length) return !1;
                for (n = 0, i = t.length; n < i; ++n)
                    if (a = t[n], r = e[n], a instanceof Array && r instanceof Array) {
                        if (!w.arrayEquals(a, r)) return !1
                    } else if (a !== r) return !1;
                return !0
            },
            clone: function (t) {
                if (w.isArray(t)) return t.map(w.clone);
                if (w.isObject(t)) {
                    for (var e = {}, n = Object.keys(t), i = n.length, a = 0; a < i; ++a) e[n[a]] = w.clone(t[n[a]]);
                    return e
                }
                return t
            },
            _merger: function (t, e, n, i) {
                var a = e[t],
                    r = n[t];
                w.isObject(a) && w.isObject(r) ? w.merge(a, r, i) : e[t] = w.clone(r)
            },
            _mergerIf: function (t, e, n) {
                var i = e[t],
                    a = n[t];
                w.isObject(i) && w.isObject(a) ? w.mergeIf(i, a) : e.hasOwnProperty(t) || (e[t] = w.clone(a))
            },
            merge: function (t, e, n) {
                var i, a, r, o, s, l = w.isArray(e) ? e : [e],
                    u = l.length;
                if (!w.isObject(t)) return t;
                for (i = (n = n || {}).merger || w._merger, a = 0; a < u; ++a)
                    if (e = l[a], w.isObject(e))
                        for (s = 0, o = (r = Object.keys(e)).length; s < o; ++s) i(r[s], t, e, n);
                return t
            },
            mergeIf: function (t, e) {
                return w.merge(t, e, {
                    merger: w._mergerIf
                })
            },
            extend: Object.assign || function (t) {
                return w.merge(t, [].slice.call(arguments, 1), {
                    merger: function (t, e, n) {
                        e[t] = n[t]
                    }
                })
            },
            inherits: function (t) {
                var e = this,
                    n = t && t.hasOwnProperty("constructor") ? t.constructor : function () {
                        return e.apply(this, arguments)
                    },
                    i = function () {
                        this.constructor = n
                    };
                return i.prototype = e.prototype, n.prototype = new i, n.extend = w.inherits, t && w.extend(n.prototype, t), n.__super__ = e.prototype, n
            },
            _deprecated: function (t, e, n, i) {
                void 0 !== e && console.warn(t + ': "' + n + '" is deprecated. Please use "' + i + '" instead')
            }
        },
        M = w;
    w.callCallback = w.callback, w.indexOf = function (t, e, n) {
        return Array.prototype.indexOf.call(t, e, n)
    }, w.getValueOrDefault = w.valueOrDefault, w.getValueAtIndexOrDefault = w.valueAtIndexOrDefault;
    var S = {
            linear: function (t) {
                return t
            },
            easeInQuad: function (t) {
                return t * t
            },
            easeOutQuad: function (t) {
                return -t * (t - 2)
            },
            easeInOutQuad: function (t) {
                return (t /= .5) < 1 ? .5 * t * t : -.5 * (--t * (t - 2) - 1)
            },
            easeInCubic: function (t) {
                return t * t * t
            },
            easeOutCubic: function (t) {
                return (t -= 1) * t * t + 1
            },
            easeInOutCubic: function (t) {
                return (t /= .5) < 1 ? .5 * t * t * t : .5 * ((t -= 2) * t * t + 2)
            },
            easeInQuart: function (t) {
                return t * t * t * t
            },
            easeOutQuart: function (t) {
                return -((t -= 1) * t * t * t - 1)
            },
            easeInOutQuart: function (t) {
                return (t /= .5) < 1 ? .5 * t * t * t * t : -.5 * ((t -= 2) * t * t * t - 2)
            },
            easeInQuint: function (t) {
                return t * t * t * t * t
            },
            easeOutQuint: function (t) {
                return (t -= 1) * t * t * t * t + 1
            },
            easeInOutQuint: function (t) {
                return (t /= .5) < 1 ? .5 * t * t * t * t * t : .5 * ((t -= 2) * t * t * t * t + 2)
            },
            easeInSine: function (t) {
                return 1 - Math.cos(t * (Math.PI / 2))
            },
            easeOutSine: function (t) {
                return Math.sin(t * (Math.PI / 2))
            },
            easeInOutSine: function (t) {
                return -.5 * (Math.cos(Math.PI * t) - 1)
            },
            easeInExpo: function (t) {
                return 0 === t ? 0 : Math.pow(2, 10 * (t - 1))
            },
            easeOutExpo: function (t) {
                return 1 === t ? 1 : 1 - Math.pow(2, -10 * t)
            },
            easeInOutExpo: function (t) {
                return 0 === t ? 0 : 1 === t ? 1 : (t /= .5) < 1 ? .5 * Math.pow(2, 10 * (t - 1)) : .5 * (2 - Math.pow(2, -10 * --t))
            },
            easeInCirc: function (t) {
                return t >= 1 ? t : -(Math.sqrt(1 - t * t) - 1)
            },
            easeOutCirc: function (t) {
                return Math.sqrt(1 - (t -= 1) * t)
            },
            easeInOutCirc: function (t) {
                return (t /= .5) < 1 ? -.5 * (Math.sqrt(1 - t * t) - 1) : .5 * (Math.sqrt(1 - (t -= 2) * t) + 1)
            },
            easeInElastic: function (t) {
                var e = 1.70158,
                    n = 0,
                    i = 1;
                return 0 === t ? 0 : 1 === t ? 1 : (n || (n = .3), i < 1 ? (i = 1, e = n / 4) : e = n / (2 * Math.PI) * Math.asin(1 / i), -i * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - e) * (2 * Math.PI) / n))
            },
            easeOutElastic: function (t) {
                var e = 1.70158,
                    n = 0,
                    i = 1;
                return 0 === t ? 0 : 1 === t ? 1 : (n || (n = .3), i < 1 ? (i = 1, e = n / 4) : e = n / (2 * Math.PI) * Math.asin(1 / i), i * Math.pow(2, -10 * t) * Math.sin((t - e) * (2 * Math.PI) / n) + 1)
            },
            easeInOutElastic: function (t) {
                var e = 1.70158,
                    n = 0,
                    i = 1;
                return 0 === t ? 0 : 2 == (t /= .5) ? 1 : (n || (n = .45), i < 1 ? (i = 1, e = n / 4) : e = n / (2 * Math.PI) * Math.asin(1 / i), t < 1 ? i * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - e) * (2 * Math.PI) / n) * -.5 : i * Math.pow(2, -10 * (t -= 1)) * Math.sin((t - e) * (2 * Math.PI) / n) * .5 + 1)
            },
            easeInBack: function (t) {
                var e = 1.70158;
                return t * t * ((e + 1) * t - e)
            },
            easeOutBack: function (t) {
                var e = 1.70158;
                return (t -= 1) * t * ((e + 1) * t + e) + 1
            },
            easeInOutBack: function (t) {
                var e = 1.70158;
                return (t /= .5) < 1 ? t * t * ((1 + (e *= 1.525)) * t - e) * .5 : .5 * ((t -= 2) * t * ((1 + (e *= 1.525)) * t + e) + 2)
            },
            easeInBounce: function (t) {
                return 1 - S.easeOutBounce(1 - t)
            },
            easeOutBounce: function (t) {
                return t < 1 / 2.75 ? 7.5625 * t * t : t < 2 / 2.75 ? 7.5625 * (t -= 1.5 / 2.75) * t + .75 : t < 2.5 / 2.75 ? 7.5625 * (t -= 2.25 / 2.75) * t + .9375 : 7.5625 * (t -= 2.625 / 2.75) * t + .984375
            },
            easeInOutBounce: function (t) {
                return t < .5 ? .5 * S.easeInBounce(2 * t) : .5 * S.easeOutBounce(2 * t - 1) + .5
            }
        },
        C = {
            effects: S
        };
    M.easingEffects = S;
    var P = Math.PI,
        A = P / 180,
        D = 2 * P,
        T = P / 2,
        I = P / 4,
        F = 2 * P / 3,
        L = {
            clear: function (t) {
                t.ctx.clearRect(0, 0, t.width, t.height)
            },
            roundedRect: function (t, e, n, i, a, r) {
                if (r) {
                    var o = Math.min(r, a / 2, i / 2),
                        s = e + o,
                        l = n + o,
                        u = e + i - o,
                        d = n + a - o;
                    t.moveTo(e, l), s < u && l < d ? (t.arc(s, l, o, -P, -T), t.arc(u, l, o, -T, 0), t.arc(u, d, o, 0, T), t.arc(s, d, o, T, P)) : s < u ? (t.moveTo(s, n), t.arc(u, l, o, -T, T), t.arc(s, l, o, T, P + T)) : l < d ? (t.arc(s, l, o, -P, 0), t.arc(s, d, o, 0, P)) : t.arc(s, l, o, -P, P), t.closePath(), t.moveTo(e, n)
                } else t.rect(e, n, i, a)
            },
            drawPoint: function (t, e, n, i, a, r) {
                var o, s, l, u, d, h = (r || 0) * A;
                if (e && "object" == typeof e && ("[object HTMLImageElement]" === (o = e.toString()) || "[object HTMLCanvasElement]" === o)) return t.save(), t.translate(i, a), t.rotate(h), t.drawImage(e, -e.width / 2, -e.height / 2, e.width, e.height), void t.restore();
                if (!(isNaN(n) || n <= 0)) {
                    switch (t.beginPath(), e) {
                        default:
                            t.arc(i, a, n, 0, D), t.closePath();
                            break;
                        case "triangle":
                            t.moveTo(i + Math.sin(h) * n, a - Math.cos(h) * n), h += F, t.lineTo(i + Math.sin(h) * n, a - Math.cos(h) * n), h += F, t.lineTo(i + Math.sin(h) * n, a - Math.cos(h) * n), t.closePath();
                            break;
                        case "rectRounded":
                            u = n - (d = .516 * n), s = Math.cos(h + I) * u, l = Math.sin(h + I) * u, t.arc(i - s, a - l, d, h - P, h - T), t.arc(i + l, a - s, d, h - T, h), t.arc(i + s, a + l, d, h, h + T), t.arc(i - l, a + s, d, h + T, h + P), t.closePath();
                            break;
                        case "rect":
                            if (!r) {
                                u = Math.SQRT1_2 * n, t.rect(i - u, a - u, 2 * u, 2 * u);
                                break
                            }
                            h += I;
                        case "rectRot":
                            s = Math.cos(h) * n, l = Math.sin(h) * n, t.moveTo(i - s, a - l), t.lineTo(i + l, a - s), t.lineTo(i + s, a + l), t.lineTo(i - l, a + s), t.closePath();
                            break;
                        case "crossRot":
                            h += I;
                        case "cross":
                            s = Math.cos(h) * n, l = Math.sin(h) * n, t.moveTo(i - s, a - l), t.lineTo(i + s, a + l), t.moveTo(i + l, a - s), t.lineTo(i - l, a + s);
                            break;
                        case "star":
                            s = Math.cos(h) * n, l = Math.sin(h) * n, t.moveTo(i - s, a - l), t.lineTo(i + s, a + l), t.moveTo(i + l, a - s), t.lineTo(i - l, a + s), h += I, s = Math.cos(h) * n, l = Math.sin(h) * n, t.moveTo(i - s, a - l), t.lineTo(i + s, a + l), t.moveTo(i + l, a - s), t.lineTo(i - l, a + s);
                            break;
                        case "line":
                            s = Math.cos(h) * n, l = Math.sin(h) * n, t.moveTo(i - s, a - l), t.lineTo(i + s, a + l);
                            break;
                        case "dash":
                            t.moveTo(i, a), t.lineTo(i + Math.cos(h) * n, a + Math.sin(h) * n)
                    }
                    t.fill(), t.stroke()
                }
            },
            _isPointInArea: function (t, e) {
                return t.x > e.left - 1e-6 && t.x < e.right + 1e-6 && t.y > e.top - 1e-6 && t.y < e.bottom + 1e-6
            },
            clipArea: function (t, e) {
                t.save(), t.beginPath(), t.rect(e.left, e.top, e.right - e.left, e.bottom - e.top), t.clip()
            },
            unclipArea: function (t) {
                t.restore()
            },
            lineTo: function (t, e, n, i) {
                var a = n.steppedLine;
                if (a) {
                    if ("middle" === a) {
                        var r = (e.x + n.x) / 2;
                        t.lineTo(r, i ? n.y : e.y), t.lineTo(r, i ? e.y : n.y)
                    } else "after" === a && !i || "after" !== a && i ? t.lineTo(e.x, n.y) : t.lineTo(n.x, e.y);
                    t.lineTo(n.x, n.y)
                } else n.tension ? t.bezierCurveTo(i ? e.controlPointPreviousX : e.controlPointNextX, i ? e.controlPointPreviousY : e.controlPointNextY, i ? n.controlPointNextX : n.controlPointPreviousX, i ? n.controlPointNextY : n.controlPointPreviousY, n.x, n.y) : t.lineTo(n.x, n.y)
            }
        },
        O = L;
    M.clear = L.clear, M.drawRoundedRectangle = function (t) {
        t.beginPath(), L.roundedRect.apply(L, arguments)
    };
    var R = {
        _set: function (t, e) {
            return M.merge(this[t] || (this[t] = {}), e)
        }
    };
    R._set("global", {
        defaultColor: "rgba(0,0,0,0.1)",
        defaultFontColor: "#666",
        defaultFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
        defaultFontSize: 12,
        defaultFontStyle: "normal",
        defaultLineHeight: 1.2,
        showLines: !0
    });
    var z = R,
        N = M.valueOrDefault;
    var B = {
            toLineHeight: function (t, e) {
                var n = ("" + t).match(/^(normal|(\d+(?:\.\d+)?)(px|em|%)?)$/);
                if (!n || "normal" === n[1]) return 1.2 * e;
                switch (t = +n[2], n[3]) {
                    case "px":
                        return t;
                    case "%":
                        t /= 100
                }
                return e * t
            },
            toPadding: function (t) {
                var e, n, i, a;
                return M.isObject(t) ? (e = +t.top || 0, n = +t.right || 0, i = +t.bottom || 0, a = +t.left || 0) : e = n = i = a = +t || 0, {
                    top: e,
                    right: n,
                    bottom: i,
                    left: a,
                    height: e + i,
                    width: a + n
                }
            },
            _parseFont: function (t) {
                var e = z.global,
                    n = N(t.fontSize, e.defaultFontSize),
                    i = {
                        family: N(t.fontFamily, e.defaultFontFamily),
                        lineHeight: M.options.toLineHeight(N(t.lineHeight, e.defaultLineHeight), n),
                        size: n,
                        style: N(t.fontStyle, e.defaultFontStyle),
                        weight: null,
                        string: ""
                    };
                return i.string = function (t) {
                    return !t || M.isNullOrUndef(t.size) || M.isNullOrUndef(t.family) ? null : (t.style ? t.style + " " : "") + (t.weight ? t.weight + " " : "") + t.size + "px " + t.family
                }(i), i
            },
            resolve: function (t, e, n, i) {
                var a, r, o, s = !0;
                for (a = 0, r = t.length; a < r; ++a)
                    if (void 0 !== (o = t[a]) && (void 0 !== e && "function" == typeof o && (o = o(e), s = !1), void 0 !== n && M.isArray(o) && (o = o[n], s = !1), void 0 !== o)) return i && !s && (i.cacheable = !1), o
            }
        },
        E = {
            _factorize: function (t) {
                var e, n = [],
                    i = Math.sqrt(t);
                for (e = 1; e < i; e++) t % e == 0 && (n.push(e), n.push(t / e));
                return i === (0 | i) && n.push(i), n.sort((function (t, e) {
                    return t - e
                })).pop(), n
            },
            log10: Math.log10 || function (t) {
                var e = Math.log(t) * Math.LOG10E,
                    n = Math.round(e);
                return t === Math.pow(10, n) ? n : e
            }
        },
        W = E;
    M.log10 = E.log10;
    var V = M,
        H = C,
        j = O,
        q = B,
        U = W,
        Y = {
            getRtlAdapter: function (t, e, n) {
                return t ? function (t, e) {
                    return {
                        x: function (n) {
                            return t + t + e - n
                        },
                        setWidth: function (t) {
                            e = t
                        },
                        textAlign: function (t) {
                            return "center" === t ? t : "right" === t ? "left" : "right"
                        },
                        xPlus: function (t, e) {
                            return t - e
                        },
                        leftForLtr: function (t, e) {
                            return t - e
                        }
                    }
                }(e, n) : {
                    x: function (t) {
                        return t
                    },
                    setWidth: function (t) {},
                    textAlign: function (t) {
                        return t
                    },
                    xPlus: function (t, e) {
                        return t + e
                    },
                    leftForLtr: function (t, e) {
                        return t
                    }
                }
            },
            overrideTextDirection: function (t, e) {
                var n, i;
                "ltr" !== e && "rtl" !== e || (i = [(n = t.canvas.style).getPropertyValue("direction"), n.getPropertyPriority("direction")], n.setProperty("direction", e, "important"), t.prevTextDirection = i)
            },
            restoreTextDirection: function (t) {
                var e = t.prevTextDirection;
                void 0 !== e && (delete t.prevTextDirection, t.canvas.style.setProperty("direction", e[0], e[1]))
            }
        };
    V.easing = H, V.canvas = j, V.options = q, V.math = U, V.rtl = Y;
    var G = function (t) {
        V.extend(this, t), this.initialize.apply(this, arguments)
    };
    V.extend(G.prototype, {
        _type: void 0,
        initialize: function () {
            this.hidden = !1
        },
        pivot: function () {
            var t = this;
            return t._view || (t._view = V.extend({}, t._model)), t._start = {}, t
        },
        transition: function (t) {
            var e = this,
                n = e._model,
                i = e._start,
                a = e._view;
            return n && 1 !== t ? (a || (a = e._view = {}), i || (i = e._start = {}), function (t, e, n, i) {
                var a, r, o, s, l, u, d, h, c, f = Object.keys(n);
                for (a = 0, r = f.length; a < r; ++a)
                    if (u = n[o = f[a]], e.hasOwnProperty(o) || (e[o] = u), (s = e[o]) !== u && "_" !== o[0]) {
                        if (t.hasOwnProperty(o) || (t[o] = s), (d = typeof u) === typeof (l = t[o]))
                            if ("string" === d) {
                                if ((h = k(l)).valid && (c = k(u)).valid) {
                                    e[o] = c.mix(h, i).rgbString();
                                    continue
                                }
                            } else if (V.isFinite(l) && V.isFinite(u)) {
                            e[o] = l + (u - l) * i;
                            continue
                        }
                        e[o] = u
                    }
            }(i, a, n, t), e) : (e._view = V.extend({}, n), e._start = null, e)
        },
        tooltipPosition: function () {
            return {
                x: this._model.x,
                y: this._model.y
            }
        },
        hasValue: function () {
            return V.isNumber(this._model.x) && V.isNumber(this._model.y)
        }
    }), G.extend = V.inherits;
    var X = G,
        K = X.extend({
            chart: null,
            currentStep: 0,
            numSteps: 60,
            easing: "",
            render: null,
            onAnimationProgress: null,
            onAnimationComplete: null
        }),
        Z = K;
    Object.defineProperty(K.prototype, "animationObject", {
        get: function () {
            return this
        }
    }), Object.defineProperty(K.prototype, "chartInstance", {
        get: function () {
            return this.chart
        },
        set: function (t) {
            this.chart = t
        }
    }), z._set("global", {
        animation: {
            duration: 1e3,
            easing: "easeOutQuart",
            onProgress: V.noop,
            onComplete: V.noop
        }
    });
    var $ = {
            animations: [],
            request: null,
            addAnimation: function (t, e, n, i) {
                var a, r, o = this.animations;
                for (e.chart = t, e.startTime = Date.now(), e.duration = n, i || (t.animating = !0), a = 0, r = o.length; a < r; ++a)
                    if (o[a].chart === t) return void(o[a] = e);
                o.push(e), 1 === o.length && this.requestAnimationFrame()
            },
            cancelAnimation: function (t) {
                var e = V.findIndex(this.animations, (function (e) {
                    return e.chart === t
                })); - 1 !== e && (this.animations.splice(e, 1), t.animating = !1)
            },
            requestAnimationFrame: function () {
                var t = this;
                null === t.request && (t.request = V.requestAnimFrame.call(window, (function () {
                    t.request = null, t.startDigest()
                })))
            },
            startDigest: function () {
                this.advance(), this.animations.length > 0 && this.requestAnimationFrame()
            },
            advance: function () {
                for (var t, e, n, i, a = this.animations, r = 0; r < a.length;) e = (t = a[r]).chart, n = t.numSteps, i = Math.floor((Date.now() - t.startTime) / t.duration * n) + 1, t.currentStep = Math.min(i, n), V.callback(t.render, [e, t], e), V.callback(t.onAnimationProgress, [t], e), t.currentStep >= n ? (V.callback(t.onAnimationComplete, [t], e), e.animating = !1, a.splice(r, 1)) : ++r
            }
        },
        J = V.options.resolve,
        Q = ["push", "pop", "shift", "splice", "unshift"];

    function tt(t, e) {
        var n = t._chartjs;
        if (n) {
            var i = n.listeners,
                a = i.indexOf(e); - 1 !== a && i.splice(a, 1), i.length > 0 || (Q.forEach((function (e) {
                delete t[e]
            })), delete t._chartjs)
        }
    }
    var et = function (t, e) {
        this.initialize(t, e)
    };
    V.extend(et.prototype, {
        datasetElementType: null,
        dataElementType: null,
        _datasetElementOptions: ["backgroundColor", "borderCapStyle", "borderColor", "borderDash", "borderDashOffset", "borderJoinStyle", "borderWidth"],
        _dataElementOptions: ["backgroundColor", "borderColor", "borderWidth", "pointStyle"],
        initialize: function (t, e) {
            var n = this;
            n.chart = t, n.index = e, n.linkScales(), n.addElements(), n._type = n.getMeta().type
        },
        updateIndex: function (t) {
            this.index = t
        },
        linkScales: function () {
            var t = this.getMeta(),
                e = this.chart,
                n = e.scales,
                i = this.getDataset(),
                a = e.options.scales;
            null !== t.xAxisID && t.xAxisID in n && !i.xAxisID || (t.xAxisID = i.xAxisID || a.xAxes[0].id), null !== t.yAxisID && t.yAxisID in n && !i.yAxisID || (t.yAxisID = i.yAxisID || a.yAxes[0].id)
        },
        getDataset: function () {
            return this.chart.data.datasets[this.index]
        },
        getMeta: function () {
            return this.chart.getDatasetMeta(this.index)
        },
        getScaleForId: function (t) {
            return this.chart.scales[t]
        },
        _getValueScaleId: function () {
            return this.getMeta().yAxisID
        },
        _getIndexScaleId: function () {
            return this.getMeta().xAxisID
        },
        _getValueScale: function () {
            return this.getScaleForId(this._getValueScaleId())
        },
        _getIndexScale: function () {
            return this.getScaleForId(this._getIndexScaleId())
        },
        reset: function () {
            this._update(!0)
        },
        destroy: function () {
            this._data && tt(this._data, this)
        },
        createMetaDataset: function () {
            var t = this.datasetElementType;
            return t && new t({
                _chart: this.chart,
                _datasetIndex: this.index
            })
        },
        createMetaData: function (t) {
            var e = this.dataElementType;
            return e && new e({
                _chart: this.chart,
                _datasetIndex: this.index,
                _index: t
            })
        },
        addElements: function () {
            var t, e, n = this.getMeta(),
                i = this.getDataset().data || [],
                a = n.data;
            for (t = 0, e = i.length; t < e; ++t) a[t] = a[t] || this.createMetaData(t);
            n.dataset = n.dataset || this.createMetaDataset()
        },
        addElementAndReset: function (t) {
            var e = this.createMetaData(t);
            this.getMeta().data.splice(t, 0, e), this.updateElement(e, t, !0)
        },
        buildOrUpdateElements: function () {
            var t, e, n = this,
                i = n.getDataset(),
                a = i.data || (i.data = []);
            n._data !== a && (n._data && tt(n._data, n), a && Object.isExtensible(a) && (e = n, (t = a)._chartjs ? t._chartjs.listeners.push(e) : (Object.defineProperty(t, "_chartjs", {
                configurable: !0,
                enumerable: !1,
                value: {
                    listeners: [e]
                }
            }), Q.forEach((function (e) {
                var n = "onData" + e.charAt(0).toUpperCase() + e.slice(1),
                    i = t[e];
                Object.defineProperty(t, e, {
                    configurable: !0,
                    enumerable: !1,
                    value: function () {
                        var e = Array.prototype.slice.call(arguments),
                            a = i.apply(this, e);
                        return V.each(t._chartjs.listeners, (function (t) {
                            "function" == typeof t[n] && t[n].apply(t, e)
                        })), a
                    }
                })
            })))), n._data = a), n.resyncElements()
        },
        _configure: function () {
            this._config = V.merge({}, [this.chart.options.datasets[this._type], this.getDataset()], {
                merger: function (t, e, n) {
                    "_meta" !== t && "data" !== t && V._merger(t, e, n)
                }
            })
        },
        _update: function (t) {
            this._configure(), this._cachedDataOpts = null, this.update(t)
        },
        update: V.noop,
        transition: function (t) {
            for (var e = this.getMeta(), n = e.data || [], i = n.length, a = 0; a < i; ++a) n[a].transition(t);
            e.dataset && e.dataset.transition(t)
        },
        draw: function () {
            var t = this.getMeta(),
                e = t.data || [],
                n = e.length,
                i = 0;
            for (t.dataset && t.dataset.draw(); i < n; ++i) e[i].draw()
        },
        getStyle: function (t) {
            var e, n = this.getMeta(),
                i = n.dataset;
            return this._configure(), i && void 0 === t ? e = this._resolveDatasetElementOptions(i || {}) : (t = t || 0, e = this._resolveDataElementOptions(n.data[t] || {}, t)), !1 !== e.fill && null !== e.fill || (e.backgroundColor = e.borderColor), e
        },
        _resolveDatasetElementOptions: function (t, e) {
            var n, i, a, r, o = this,
                s = o.chart,
                l = o._config,
                u = t.custom || {},
                d = s.options.elements[o.datasetElementType.prototype._type] || {},
                h = o._datasetElementOptions,
                c = {},
                f = {
                    chart: s,
                    dataset: o.getDataset(),
                    datasetIndex: o.index,
                    hover: e
                };
            for (n = 0, i = h.length; n < i; ++n) a = h[n], r = e ? "hover" + a.charAt(0).toUpperCase() + a.slice(1) : a, c[a] = J([u[r], l[r], d[r]], f);
            return c
        },
        _resolveDataElementOptions: function (t, e) {
            var n = this,
                i = t && t.custom,
                a = n._cachedDataOpts;
            if (a && !i) return a;
            var r, o, s, l, u = n.chart,
                d = n._config,
                h = u.options.elements[n.dataElementType.prototype._type] || {},
                c = n._dataElementOptions,
                f = {},
                g = {
                    chart: u,
                    dataIndex: e,
                    dataset: n.getDataset(),
                    datasetIndex: n.index
                },
                p = {
                    cacheable: !i
                };
            if (i = i || {}, V.isArray(c))
                for (o = 0, s = c.length; o < s; ++o) f[l = c[o]] = J([i[l], d[l], h[l]], g, e, p);
            else
                for (o = 0, s = (r = Object.keys(c)).length; o < s; ++o) f[l = r[o]] = J([i[l], d[c[l]], d[l], h[l]], g, e, p);
            return p.cacheable && (n._cachedDataOpts = Object.freeze(f)), f
        },
        removeHoverStyle: function (t) {
            V.merge(t._model, t.$previousStyle || {}), delete t.$previousStyle
        },
        setHoverStyle: function (t) {
            var e = this.chart.data.datasets[t._datasetIndex],
                n = t._index,
                i = t.custom || {},
                a = t._model,
                r = V.getHoverColor;
            t.$previousStyle = {
                backgroundColor: a.backgroundColor,
                borderColor: a.borderColor,
                borderWidth: a.borderWidth
            }, a.backgroundColor = J([i.hoverBackgroundColor, e.hoverBackgroundColor, r(a.backgroundColor)], void 0, n), a.borderColor = J([i.hoverBorderColor, e.hoverBorderColor, r(a.borderColor)], void 0, n), a.borderWidth = J([i.hoverBorderWidth, e.hoverBorderWidth, a.borderWidth], void 0, n)
        },
        _removeDatasetHoverStyle: function () {
            var t = this.getMeta().dataset;
            t && this.removeHoverStyle(t)
        },
        _setDatasetHoverStyle: function () {
            var t, e, n, i, a, r, o = this.getMeta().dataset,
                s = {};
            if (o) {
                for (r = o._model, a = this._resolveDatasetElementOptions(o, !0), t = 0, e = (i = Object.keys(a)).length; t < e; ++t) s[n = i[t]] = r[n], r[n] = a[n];
                o.$previousStyle = s
            }
        },
        resyncElements: function () {
            var t = this.getMeta(),
                e = this.getDataset().data,
                n = t.data.length,
                i = e.length;
            i < n ? t.data.splice(i, n - i) : i > n && this.insertElements(n, i - n)
        },
        insertElements: function (t, e) {
            for (var n = 0; n < e; ++n) this.addElementAndReset(t + n)
        },
        onDataPush: function () {
            var t = arguments.length;
            this.insertElements(this.getDataset().data.length - t, t)
        },
        onDataPop: function () {
            this.getMeta().data.pop()
        },
        onDataShift: function () {
            this.getMeta().data.shift()
        },
        onDataSplice: function (t, e) {
            this.getMeta().data.splice(t, e), this.insertElements(t, arguments.length - 2)
        },
        onDataUnshift: function () {
            this.insertElements(0, arguments.length)
        }
    }), et.extend = V.inherits;
    var nt = et,
        it = 2 * Math.PI;

    function at(t, e) {
        var n = e.startAngle,
            i = e.endAngle,
            a = e.pixelMargin,
            r = a / e.outerRadius,
            o = e.x,
            s = e.y;
        t.beginPath(), t.arc(o, s, e.outerRadius, n - r, i + r), e.innerRadius > a ? (r = a / e.innerRadius, t.arc(o, s, e.innerRadius - a, i + r, n - r, !0)) : t.arc(o, s, a, i + Math.PI / 2, n - Math.PI / 2), t.closePath(), t.clip()
    }

    function rt(t, e, n) {
        var i = "inner" === e.borderAlign;
        i ? (t.lineWidth = 2 * e.borderWidth, t.lineJoin = "round") : (t.lineWidth = e.borderWidth, t.lineJoin = "bevel"), n.fullCircles && function (t, e, n, i) {
            var a, r = n.endAngle;
            for (i && (n.endAngle = n.startAngle + it, at(t, n), n.endAngle = r, n.endAngle === n.startAngle && n.fullCircles && (n.endAngle += it, n.fullCircles--)), t.beginPath(), t.arc(n.x, n.y, n.innerRadius, n.startAngle + it, n.startAngle, !0), a = 0; a < n.fullCircles; ++a) t.stroke();
            for (t.beginPath(), t.arc(n.x, n.y, e.outerRadius, n.startAngle, n.startAngle + it), a = 0; a < n.fullCircles; ++a) t.stroke()
        }(t, e, n, i), i && at(t, n), t.beginPath(), t.arc(n.x, n.y, e.outerRadius, n.startAngle, n.endAngle), t.arc(n.x, n.y, n.innerRadius, n.endAngle, n.startAngle, !0), t.closePath(), t.stroke()
    }
    z._set("global", {
        elements: {
            arc: {
                backgroundColor: z.global.defaultColor,
                borderColor: "#fff",
                borderWidth: 2,
                borderAlign: "center"
            }
        }
    });
    var ot = X.extend({
            _type: "arc",
            inLabelRange: function (t) {
                var e = this._view;
                return !!e && Math.pow(t - e.x, 2) < Math.pow(e.radius + e.hoverRadius, 2)
            },
            inRange: function (t, e) {
                var n = this._view;
                if (n) {
                    for (var i = V.getAngleFromPoint(n, {
                            x: t,
                            y: e
                        }), a = i.angle, r = i.distance, o = n.startAngle, s = n.endAngle; s < o;) s += it;
                    for (; a > s;) a -= it;
                    for (; a < o;) a += it;
                    var l = a >= o && a <= s,
                        u = r >= n.innerRadius && r <= n.outerRadius;
                    return l && u
                }
                return !1
            },
            getCenterPoint: function () {
                var t = this._view,
                    e = (t.startAngle + t.endAngle) / 2,
                    n = (t.innerRadius + t.outerRadius) / 2;
                return {
                    x: t.x + Math.cos(e) * n,
                    y: t.y + Math.sin(e) * n
                }
            },
            getArea: function () {
                var t = this._view;
                return Math.PI * ((t.endAngle - t.startAngle) / (2 * Math.PI)) * (Math.pow(t.outerRadius, 2) - Math.pow(t.innerRadius, 2))
            },
            tooltipPosition: function () {
                var t = this._view,
                    e = t.startAngle + (t.endAngle - t.startAngle) / 2,
                    n = (t.outerRadius - t.innerRadius) / 2 + t.innerRadius;
                return {
                    x: t.x + Math.cos(e) * n,
                    y: t.y + Math.sin(e) * n
                }
            },
            draw: function () {
                var t, e = this._chart.ctx,
                    n = this._view,
                    i = "inner" === n.borderAlign ? .33 : 0,
                    a = {
                        x: n.x,
                        y: n.y,
                        innerRadius: n.innerRadius,
                        outerRadius: Math.max(n.outerRadius - i, 0),
                        pixelMargin: i,
                        startAngle: n.startAngle,
                        endAngle: n.endAngle,
                        fullCircles: Math.floor(n.circumference / it)
                    };
                if (e.save(), e.fillStyle = n.backgroundColor, e.strokeStyle = n.borderColor, a.fullCircles) {
                    for (a.endAngle = a.startAngle + it, e.beginPath(), e.arc(a.x, a.y, a.outerRadius, a.startAngle, a.endAngle), e.arc(a.x, a.y, a.innerRadius, a.endAngle, a.startAngle, !0), e.closePath(), t = 0; t < a.fullCircles; ++t) e.fill();
                    a.endAngle = a.startAngle + n.circumference % it
                }
                e.beginPath(), e.arc(a.x, a.y, a.outerRadius, a.startAngle, a.endAngle), e.arc(a.x, a.y, a.innerRadius, a.endAngle, a.startAngle, !0), e.closePath(), e.fill(), n.borderWidth && rt(e, n, a), e.restore()
            }
        }),
        st = V.valueOrDefault,
        lt = z.global.defaultColor;
    z._set("global", {
        elements: {
            line: {
                tension: .4,
                backgroundColor: lt,
                borderWidth: 3,
                borderColor: lt,
                borderCapStyle: "butt",
                borderDash: [],
                borderDashOffset: 0,
                borderJoinStyle: "miter",
                capBezierPoints: !0,
                fill: !0
            }
        }
    });
    var ut = X.extend({
            _type: "line",
            draw: function () {
                var t, e, n, i = this,
                    a = i._view,
                    r = i._chart.ctx,
                    o = a.spanGaps,
                    s = i._children.slice(),
                    l = z.global,
                    u = l.elements.line,
                    d = -1,
                    h = i._loop;
                if (s.length) {
                    if (i._loop) {
                        for (t = 0; t < s.length; ++t)
                            if (e = V.previousItem(s, t), !s[t]._view.skip && e._view.skip) {
                                s = s.slice(t).concat(s.slice(0, t)), h = o;
                                break
                            } h && s.push(s[0])
                    }
                    for (r.save(), r.lineCap = a.borderCapStyle || u.borderCapStyle, r.setLineDash && r.setLineDash(a.borderDash || u.borderDash), r.lineDashOffset = st(a.borderDashOffset, u.borderDashOffset), r.lineJoin = a.borderJoinStyle || u.borderJoinStyle, r.lineWidth = st(a.borderWidth, u.borderWidth), r.strokeStyle = a.borderColor || l.defaultColor, r.beginPath(), (n = s[0]._view).skip || (r.moveTo(n.x, n.y), d = 0), t = 1; t < s.length; ++t) n = s[t]._view, e = -1 === d ? V.previousItem(s, t) : s[d], n.skip || (d !== t - 1 && !o || -1 === d ? r.moveTo(n.x, n.y) : V.canvas.lineTo(r, e._view, n), d = t);
                    h && r.closePath(), r.stroke(), r.restore()
                }
            }
        }),
        dt = V.valueOrDefault,
        ht = z.global.defaultColor;

    function ct(t) {
        var e = this._view;
        return !!e && Math.abs(t - e.x) < e.radius + e.hitRadius
    }
    z._set("global", {
        elements: {
            point: {
                radius: 3,
                pointStyle: "circle",
                backgroundColor: ht,
                borderColor: ht,
                borderWidth: 1,
                hitRadius: 1,
                hoverRadius: 4,
                hoverBorderWidth: 1
            }
        }
    });
    var ft = X.extend({
            _type: "point",
            inRange: function (t, e) {
                var n = this._view;
                return !!n && Math.pow(t - n.x, 2) + Math.pow(e - n.y, 2) < Math.pow(n.hitRadius + n.radius, 2)
            },
            inLabelRange: ct,
            inXRange: ct,
            inYRange: function (t) {
                var e = this._view;
                return !!e && Math.abs(t - e.y) < e.radius + e.hitRadius
            },
            getCenterPoint: function () {
                var t = this._view;
                return {
                    x: t.x,
                    y: t.y
                }
            },
            getArea: function () {
                return Math.PI * Math.pow(this._view.radius, 2)
            },
            tooltipPosition: function () {
                var t = this._view;
                return {
                    x: t.x,
                    y: t.y,
                    padding: t.radius + t.borderWidth
                }
            },
            draw: function (t) {
                var e = this._view,
                    n = this._chart.ctx,
                    i = e.pointStyle,
                    a = e.rotation,
                    r = e.radius,
                    o = e.x,
                    s = e.y,
                    l = z.global,
                    u = l.defaultColor;
                e.skip || (void 0 === t || V.canvas._isPointInArea(e, t)) && (n.strokeStyle = e.borderColor || u, n.lineWidth = dt(e.borderWidth, l.elements.point.borderWidth), n.fillStyle = e.backgroundColor || u, V.canvas.drawPoint(n, i, r, o, s, a))
            }
        }),
        gt = z.global.defaultColor;

    function pt(t) {
        return t && void 0 !== t.width
    }

    function mt(t) {
        var e, n, i, a, r;
        return pt(t) ? (r = t.width / 2, e = t.x - r, n = t.x + r, i = Math.min(t.y, t.base), a = Math.max(t.y, t.base)) : (r = t.height / 2, e = Math.min(t.x, t.base), n = Math.max(t.x, t.base), i = t.y - r, a = t.y + r), {
            left: e,
            top: i,
            right: n,
            bottom: a
        }
    }

    function vt(t, e, n) {
        return t === e ? n : t === n ? e : t
    }

    function bt(t, e, n) {
        var i, a, r, o, s = t.borderWidth,
            l = function (t) {
                var e = t.borderSkipped,
                    n = {};
                return e ? (t.horizontal ? t.base > t.x && (e = vt(e, "left", "right")) : t.base < t.y && (e = vt(e, "bottom", "top")), n[e] = !0, n) : n
            }(t);
        return V.isObject(s) ? (i = +s.top || 0, a = +s.right || 0, r = +s.bottom || 0, o = +s.left || 0) : i = a = r = o = +s || 0, {
            t: l.top || i < 0 ? 0 : i > n ? n : i,
            r: l.right || a < 0 ? 0 : a > e ? e : a,
            b: l.bottom || r < 0 ? 0 : r > n ? n : r,
            l: l.left || o < 0 ? 0 : o > e ? e : o
        }
    }

    function xt(t, e, n) {
        var i = null === e,
            a = null === n,
            r = !(!t || i && a) && mt(t);
        return r && (i || e >= r.left && e <= r.right) && (a || n >= r.top && n <= r.bottom)
    }
    z._set("global", {
        elements: {
            rectangle: {
                backgroundColor: gt,
                borderColor: gt,
                borderSkipped: "bottom",
                borderWidth: 0
            }
        }
    });
    var yt = X.extend({
            _type: "rectangle",
            draw: function () {
                var t = this._chart.ctx,
                    e = this._view,
                    n = function (t) {
                        var e = mt(t),
                            n = e.right - e.left,
                            i = e.bottom - e.top,
                            a = bt(t, n / 2, i / 2);
                        return {
                            outer: {
                                x: e.left,
                                y: e.top,
                                w: n,
                                h: i
                            },
                            inner: {
                                x: e.left + a.l,
                                y: e.top + a.t,
                                w: n - a.l - a.r,
                                h: i - a.t - a.b
                            }
                        }
                    }(e),
                    i = n.outer,
                    a = n.inner;
                t.fillStyle = e.backgroundColor, t.fillRect(i.x, i.y, i.w, i.h), i.w === a.w && i.h === a.h || (t.save(), t.beginPath(), t.rect(i.x, i.y, i.w, i.h), t.clip(), t.fillStyle = e.borderColor, t.rect(a.x, a.y, a.w, a.h), t.fill("evenodd"), t.restore())
            },
            height: function () {
                var t = this._view;
                return t.base - t.y
            },
            inRange: function (t, e) {
                return xt(this._view, t, e)
            },
            inLabelRange: function (t, e) {
                var n = this._view;
                return pt(n) ? xt(n, t, null) : xt(n, null, e)
            },
            inXRange: function (t) {
                return xt(this._view, t, null)
            },
            inYRange: function (t) {
                return xt(this._view, null, t)
            },
            getCenterPoint: function () {
                var t, e, n = this._view;
                return pt(n) ? (t = n.x, e = (n.y + n.base) / 2) : (t = (n.x + n.base) / 2, e = n.y), {
                    x: t,
                    y: e
                }
            },
            getArea: function () {
                var t = this._view;
                return pt(t) ? t.width * Math.abs(t.y - t.base) : t.height * Math.abs(t.x - t.base)
            },
            tooltipPosition: function () {
                var t = this._view;
                return {
                    x: t.x,
                    y: t.y
                }
            }
        }),
        _t = {},
        kt = ot,
        wt = ut,
        Mt = ft,
        St = yt;
    _t.Arc = kt, _t.Line = wt, _t.Point = Mt, _t.Rectangle = St;
    var Ct = V._deprecated,
        Pt = V.valueOrDefault;

    function At(t, e, n) {
        var i, a, r = n.barThickness,
            o = e.stackCount,
            s = e.pixels[t],
            l = V.isNullOrUndef(r) ? function (t, e) {
                var n, i, a, r, o = t._length;
                for (a = 1, r = e.length; a < r; ++a) o = Math.min(o, Math.abs(e[a] - e[a - 1]));
                for (a = 0, r = t.getTicks().length; a < r; ++a) i = t.getPixelForTick(a), o = a > 0 ? Math.min(o, Math.abs(i - n)) : o, n = i;
                return o
            }(e.scale, e.pixels) : -1;
        return V.isNullOrUndef(r) ? (i = l * n.categoryPercentage, a = n.barPercentage) : (i = r * o, a = 1), {
            chunk: i / o,
            ratio: a,
            start: s - i / 2
        }
    }
    z._set("bar", {
        hover: {
            mode: "label"
        },
        scales: {
            xAxes: [{
                type: "category",
                offset: !0,
                gridLines: {
                    offsetGridLines: !0
                }
            }],
            yAxes: [{
                type: "linear"
            }]
        }
    }), z._set("global", {
        datasets: {
            bar: {
                categoryPercentage: .8,
                barPercentage: .9
            }
        }
    });
    var Dt = nt.extend({
            dataElementType: _t.Rectangle,
            _dataElementOptions: ["backgroundColor", "borderColor", "borderSkipped", "borderWidth", "barPercentage", "barThickness", "categoryPercentage", "maxBarThickness", "minBarLength"],
            initialize: function () {
                var t, e, n = this;
                nt.prototype.initialize.apply(n, arguments), (t = n.getMeta()).stack = n.getDataset().stack, t.bar = !0, e = n._getIndexScale().options, Ct("bar chart", e.barPercentage, "scales.[x/y]Axes.barPercentage", "dataset.barPercentage"), Ct("bar chart", e.barThickness, "scales.[x/y]Axes.barThickness", "dataset.barThickness"), Ct("bar chart", e.categoryPercentage, "scales.[x/y]Axes.categoryPercentage", "dataset.categoryPercentage"), Ct("bar chart", n._getValueScale().options.minBarLength, "scales.[x/y]Axes.minBarLength", "dataset.minBarLength"), Ct("bar chart", e.maxBarThickness, "scales.[x/y]Axes.maxBarThickness", "dataset.maxBarThickness")
            },
            update: function (t) {
                var e, n, i = this.getMeta().data;
                for (this._ruler = this.getRuler(), e = 0, n = i.length; e < n; ++e) this.updateElement(i[e], e, t)
            },
            updateElement: function (t, e, n) {
                var i = this,
                    a = i.getMeta(),
                    r = i.getDataset(),
                    o = i._resolveDataElementOptions(t, e);
                t._xScale = i.getScaleForId(a.xAxisID), t._yScale = i.getScaleForId(a.yAxisID), t._datasetIndex = i.index, t._index = e, t._model = {
                    backgroundColor: o.backgroundColor,
                    borderColor: o.borderColor,
                    borderSkipped: o.borderSkipped,
                    borderWidth: o.borderWidth,
                    datasetLabel: r.label,
                    label: i.chart.data.labels[e]
                }, V.isArray(r.data[e]) && (t._model.borderSkipped = null), i._updateElementGeometry(t, e, n, o), t.pivot()
            },
            _updateElementGeometry: function (t, e, n, i) {
                var a = this,
                    r = t._model,
                    o = a._getValueScale(),
                    s = o.getBasePixel(),
                    l = o.isHorizontal(),
                    u = a._ruler || a.getRuler(),
                    d = a.calculateBarValuePixels(a.index, e, i),
                    h = a.calculateBarIndexPixels(a.index, e, u, i);
                r.horizontal = l, r.base = n ? s : d.base, r.x = l ? n ? s : d.head : h.center, r.y = l ? h.center : n ? s : d.head, r.height = l ? h.size : void 0, r.width = l ? void 0 : h.size
            },
            _getStacks: function (t) {
                var e, n, i = this._getIndexScale(),
                    a = i._getMatchingVisibleMetas(this._type),
                    r = i.options.stacked,
                    o = a.length,
                    s = [];
                for (e = 0; e < o && (n = a[e], (!1 === r || -1 === s.indexOf(n.stack) || void 0 === r && void 0 === n.stack) && s.push(n.stack), n.index !== t); ++e);
                return s
            },
            getStackCount: function () {
                return this._getStacks().length
            },
            getStackIndex: function (t, e) {
                var n = this._getStacks(t),
                    i = void 0 !== e ? n.indexOf(e) : -1;
                return -1 === i ? n.length - 1 : i
            },
            getRuler: function () {
                var t, e, n = this._getIndexScale(),
                    i = [];
                for (t = 0, e = this.getMeta().data.length; t < e; ++t) i.push(n.getPixelForValue(null, t, this.index));
                return {
                    pixels: i,
                    start: n._startPixel,
                    end: n._endPixel,
                    stackCount: this.getStackCount(),
                    scale: n
                }
            },
            calculateBarValuePixels: function (t, e, n) {
                var i, a, r, o, s, l, u, d = this.chart,
                    h = this._getValueScale(),
                    c = h.isHorizontal(),
                    f = d.data.datasets,
                    g = h._getMatchingVisibleMetas(this._type),
                    p = h._parseValue(f[t].data[e]),
                    m = n.minBarLength,
                    v = h.options.stacked,
                    b = this.getMeta().stack,
                    x = void 0 === p.start ? 0 : p.max >= 0 && p.min >= 0 ? p.min : p.max,
                    y = void 0 === p.start ? p.end : p.max >= 0 && p.min >= 0 ? p.max - p.min : p.min - p.max,
                    _ = g.length;
                if (v || void 0 === v && void 0 !== b)
                    for (i = 0; i < _ && (a = g[i]).index !== t; ++i) a.stack === b && (r = void 0 === (u = h._parseValue(f[a.index].data[e])).start ? u.end : u.min >= 0 && u.max >= 0 ? u.max : u.min, (p.min < 0 && r < 0 || p.max >= 0 && r > 0) && (x += r));
                return o = h.getPixelForValue(x), l = (s = h.getPixelForValue(x + y)) - o, void 0 !== m && Math.abs(l) < m && (l = m, s = y >= 0 && !c || y < 0 && c ? o - m : o + m), {
                    size: l,
                    base: o,
                    head: s,
                    center: s + l / 2
                }
            },
            calculateBarIndexPixels: function (t, e, n, i) {
                var a = "flex" === i.barThickness ? function (t, e, n) {
                        var i, a = e.pixels,
                            r = a[t],
                            o = t > 0 ? a[t - 1] : null,
                            s = t < a.length - 1 ? a[t + 1] : null,
                            l = n.categoryPercentage;
                        return null === o && (o = r - (null === s ? e.end - e.start : s - r)), null === s && (s = r + r - o), i = r - (r - Math.min(o, s)) / 2 * l, {
                            chunk: Math.abs(s - o) / 2 * l / e.stackCount,
                            ratio: n.barPercentage,
                            start: i
                        }
                    }(e, n, i) : At(e, n, i),
                    r = this.getStackIndex(t, this.getMeta().stack),
                    o = a.start + a.chunk * r + a.chunk / 2,
                    s = Math.min(Pt(i.maxBarThickness, 1 / 0), a.chunk * a.ratio);
                return {
                    base: o - s / 2,
                    head: o + s / 2,
                    center: o,
                    size: s
                }
            },
            draw: function () {
                var t = this.chart,
                    e = this._getValueScale(),
                    n = this.getMeta().data,
                    i = this.getDataset(),
                    a = n.length,
                    r = 0;
                for (V.canvas.clipArea(t.ctx, t.chartArea); r < a; ++r) {
                    var o = e._parseValue(i.data[r]);
                    isNaN(o.min) || isNaN(o.max) || n[r].draw()
                }
                V.canvas.unclipArea(t.ctx)
            },
            _resolveDataElementOptions: function () {
                var t = this,
                    e = V.extend({}, nt.prototype._resolveDataElementOptions.apply(t, arguments)),
                    n = t._getIndexScale().options,
                    i = t._getValueScale().options;
                return e.barPercentage = Pt(n.barPercentage, e.barPercentage), e.barThickness = Pt(n.barThickness, e.barThickness), e.categoryPercentage = Pt(n.categoryPercentage, e.categoryPercentage), e.maxBarThickness = Pt(n.maxBarThickness, e.maxBarThickness), e.minBarLength = Pt(i.minBarLength, e.minBarLength), e
            }
        }),
        Tt = V.valueOrDefault,
        It = V.options.resolve;
    z._set("bubble", {
        hover: {
            mode: "single"
        },
        scales: {
            xAxes: [{
                type: "linear",
                position: "bottom",
                id: "x-axis-0"
            }],
            yAxes: [{
                type: "linear",
                position: "left",
                id: "y-axis-0"
            }]
        },
        tooltips: {
            callbacks: {
                title: function () {
                    return ""
                },
                label: function (t, e) {
                    var n = e.datasets[t.datasetIndex].label || "",
                        i = e.datasets[t.datasetIndex].data[t.index];
                    return n + ": (" + t.xLabel + ", " + t.yLabel + ", " + i.r + ")"
                }
            }
        }
    });
    var Ft = nt.extend({
            dataElementType: _t.Point,
            _dataElementOptions: ["backgroundColor", "borderColor", "borderWidth", "hoverBackgroundColor", "hoverBorderColor", "hoverBorderWidth", "hoverRadius", "hitRadius", "pointStyle", "rotation"],
            update: function (t) {
                var e = this,
                    n = e.getMeta().data;
                V.each(n, (function (n, i) {
                    e.updateElement(n, i, t)
                }))
            },
            updateElement: function (t, e, n) {
                var i = this,
                    a = i.getMeta(),
                    r = t.custom || {},
                    o = i.getScaleForId(a.xAxisID),
                    s = i.getScaleForId(a.yAxisID),
                    l = i._resolveDataElementOptions(t, e),
                    u = i.getDataset().data[e],
                    d = i.index,
                    h = n ? o.getPixelForDecimal(.5) : o.getPixelForValue("object" == typeof u ? u : NaN, e, d),
                    c = n ? s.getBasePixel() : s.getPixelForValue(u, e, d);
                t._xScale = o, t._yScale = s, t._options = l, t._datasetIndex = d, t._index = e, t._model = {
                    backgroundColor: l.backgroundColor,
                    borderColor: l.borderColor,
                    borderWidth: l.borderWidth,
                    hitRadius: l.hitRadius,
                    pointStyle: l.pointStyle,
                    rotation: l.rotation,
                    radius: n ? 0 : l.radius,
                    skip: r.skip || isNaN(h) || isNaN(c),
                    x: h,
                    y: c
                }, t.pivot()
            },
            setHoverStyle: function (t) {
                var e = t._model,
                    n = t._options,
                    i = V.getHoverColor;
                t.$previousStyle = {
                    backgroundColor: e.backgroundColor,
                    borderColor: e.borderColor,
                    borderWidth: e.borderWidth,
                    radius: e.radius
                }, e.backgroundColor = Tt(n.hoverBackgroundColor, i(n.backgroundColor)), e.borderColor = Tt(n.hoverBorderColor, i(n.borderColor)), e.borderWidth = Tt(n.hoverBorderWidth, n.borderWidth), e.radius = n.radius + n.hoverRadius
            },
            _resolveDataElementOptions: function (t, e) {
                var n = this,
                    i = n.chart,
                    a = n.getDataset(),
                    r = t.custom || {},
                    o = a.data[e] || {},
                    s = nt.prototype._resolveDataElementOptions.apply(n, arguments),
                    l = {
                        chart: i,
                        dataIndex: e,
                        dataset: a,
                        datasetIndex: n.index
                    };
                return n._cachedDataOpts === s && (s = V.extend({}, s)), s.radius = It([r.radius, o.r, n._config.radius, i.options.elements.point.radius], l, e), s
            }
        }),
        Lt = V.valueOrDefault,
        Ot = Math.PI,
        Rt = 2 * Ot,
        zt = Ot / 2;
    z._set("doughnut", {
        animation: {
            animateRotate: !0,
            animateScale: !1
        },
        hover: {
            mode: "single"
        },
        legendCallback: function (t) {
            var e, n, i, a = document.createElement("ul"),
                r = t.data,
                o = r.datasets,
                s = r.labels;
            if (a.setAttribute("class", t.id + "-legend"), o.length)
                for (e = 0, n = o[0].data.length; e < n; ++e)(i = a.appendChild(document.createElement("li"))).appendChild(document.createElement("span")).style.backgroundColor = o[0].backgroundColor[e], s[e] && i.appendChild(document.createTextNode(s[e]));
            return a.outerHTML
        },
        legend: {
            labels: {
                generateLabels: function (t) {
                    var e = t.data;
                    return e.labels.length && e.datasets.length ? e.labels.map((function (n, i) {
                        var a = t.getDatasetMeta(0),
                            r = a.controller.getStyle(i);
                        return {
                            text: n,
                            fillStyle: r.backgroundColor,
                            strokeStyle: r.borderColor,
                            lineWidth: r.borderWidth,
                            hidden: isNaN(e.datasets[0].data[i]) || a.data[i].hidden,
                            index: i
                        }
                    })) : []
                }
            },
            onClick: function (t, e) {
                var n, i, a, r = e.index,
                    o = this.chart;
                for (n = 0, i = (o.data.datasets || []).length; n < i; ++n)(a = o.getDatasetMeta(n)).data[r] && (a.data[r].hidden = !a.data[r].hidden);
                o.update()
            }
        },
        cutoutPercentage: 50,
        rotation: -zt,
        circumference: Rt,
        tooltips: {
            callbacks: {
                title: function () {
                    return ""
                },
                label: function (t, e) {
                    var n = e.labels[t.index],
                        i = ": " + e.datasets[t.datasetIndex].data[t.index];
                    return V.isArray(n) ? (n = n.slice())[0] += i : n += i, n
                }
            }
        }
    });
    var Nt = nt.extend({
        dataElementType: _t.Arc,
        linkScales: V.noop,
        _dataElementOptions: ["backgroundColor", "borderColor", "borderWidth", "borderAlign", "hoverBackgroundColor", "hoverBorderColor", "hoverBorderWidth"],
        getRingIndex: function (t) {
            for (var e = 0, n = 0; n < t; ++n) this.chart.isDatasetVisible(n) && ++e;
            return e
        },
        update: function (t) {
            var e, n, i, a, r = this,
                o = r.chart,
                s = o.chartArea,
                l = o.options,
                u = 1,
                d = 1,
                h = 0,
                c = 0,
                f = r.getMeta(),
                g = f.data,
                p = l.cutoutPercentage / 100 || 0,
                m = l.circumference,
                v = r._getRingWeight(r.index);
            if (m < Rt) {
                var b = l.rotation % Rt,
                    x = (b += b >= Ot ? -Rt : b < -Ot ? Rt : 0) + m,
                    y = Math.cos(b),
                    _ = Math.sin(b),
                    k = Math.cos(x),
                    w = Math.sin(x),
                    M = b <= 0 && x >= 0 || x >= Rt,
                    S = b <= zt && x >= zt || x >= Rt + zt,
                    C = b <= -zt && x >= -zt || x >= Ot + zt,
                    P = b === -Ot || x >= Ot ? -1 : Math.min(y, y * p, k, k * p),
                    A = C ? -1 : Math.min(_, _ * p, w, w * p),
                    D = M ? 1 : Math.max(y, y * p, k, k * p),
                    T = S ? 1 : Math.max(_, _ * p, w, w * p);
                u = (D - P) / 2, d = (T - A) / 2, h = -(D + P) / 2, c = -(T + A) / 2
            }
            for (i = 0, a = g.length; i < a; ++i) g[i]._options = r._resolveDataElementOptions(g[i], i);
            for (o.borderWidth = r.getMaxBorderWidth(), e = (s.right - s.left - o.borderWidth) / u, n = (s.bottom - s.top - o.borderWidth) / d, o.outerRadius = Math.max(Math.min(e, n) / 2, 0), o.innerRadius = Math.max(o.outerRadius * p, 0), o.radiusLength = (o.outerRadius - o.innerRadius) / (r._getVisibleDatasetWeightTotal() || 1), o.offsetX = h * o.outerRadius, o.offsetY = c * o.outerRadius, f.total = r.calculateTotal(), r.outerRadius = o.outerRadius - o.radiusLength * r._getRingWeightOffset(r.index), r.innerRadius = Math.max(r.outerRadius - o.radiusLength * v, 0), i = 0, a = g.length; i < a; ++i) r.updateElement(g[i], i, t)
        },
        updateElement: function (t, e, n) {
            var i = this,
                a = i.chart,
                r = a.chartArea,
                o = a.options,
                s = o.animation,
                l = (r.left + r.right) / 2,
                u = (r.top + r.bottom) / 2,
                d = o.rotation,
                h = o.rotation,
                c = i.getDataset(),
                f = n && s.animateRotate ? 0 : t.hidden ? 0 : i.calculateCircumference(c.data[e]) * (o.circumference / Rt),
                g = n && s.animateScale ? 0 : i.innerRadius,
                p = n && s.animateScale ? 0 : i.outerRadius,
                m = t._options || {};
            V.extend(t, {
                _datasetIndex: i.index,
                _index: e,
                _model: {
                    backgroundColor: m.backgroundColor,
                    borderColor: m.borderColor,
                    borderWidth: m.borderWidth,
                    borderAlign: m.borderAlign,
                    x: l + a.offsetX,
                    y: u + a.offsetY,
                    startAngle: d,
                    endAngle: h,
                    circumference: f,
                    outerRadius: p,
                    innerRadius: g,
                    label: V.valueAtIndexOrDefault(c.label, e, a.data.labels[e])
                }
            });
            var v = t._model;
            n && s.animateRotate || (v.startAngle = 0 === e ? o.rotation : i.getMeta().data[e - 1]._model.endAngle, v.endAngle = v.startAngle + v.circumference), t.pivot()
        },
        calculateTotal: function () {
            var t, e = this.getDataset(),
                n = this.getMeta(),
                i = 0;
            return V.each(n.data, (function (n, a) {
                t = e.data[a], isNaN(t) || n.hidden || (i += Math.abs(t))
            })), i
        },
        calculateCircumference: function (t) {
            var e = this.getMeta().total;
            return e > 0 && !isNaN(t) ? Rt * (Math.abs(t) / e) : 0
        },
        getMaxBorderWidth: function (t) {
            var e, n, i, a, r, o, s, l, u = 0,
                d = this.chart;
            if (!t)
                for (e = 0, n = d.data.datasets.length; e < n; ++e)
                    if (d.isDatasetVisible(e)) {
                        t = (i = d.getDatasetMeta(e)).data, e !== this.index && (r = i.controller);
                        break
                    } if (!t) return 0;
            for (e = 0, n = t.length; e < n; ++e) a = t[e], r ? (r._configure(), o = r._resolveDataElementOptions(a, e)) : o = a._options, "inner" !== o.borderAlign && (s = o.borderWidth, u = (l = o.hoverBorderWidth) > (u = s > u ? s : u) ? l : u);
            return u
        },
        setHoverStyle: function (t) {
            var e = t._model,
                n = t._options,
                i = V.getHoverColor;
            t.$previousStyle = {
                backgroundColor: e.backgroundColor,
                borderColor: e.borderColor,
                borderWidth: e.borderWidth
            }, e.backgroundColor = Lt(n.hoverBackgroundColor, i(n.backgroundColor)), e.borderColor = Lt(n.hoverBorderColor, i(n.borderColor)), e.borderWidth = Lt(n.hoverBorderWidth, n.borderWidth)
        },
        _getRingWeightOffset: function (t) {
            for (var e = 0, n = 0; n < t; ++n) this.chart.isDatasetVisible(n) && (e += this._getRingWeight(n));
            return e
        },
        _getRingWeight: function (t) {
            return Math.max(Lt(this.chart.data.datasets[t].weight, 1), 0)
        },
        _getVisibleDatasetWeightTotal: function () {
            return this._getRingWeightOffset(this.chart.data.datasets.length)
        }
    });
    z._set("horizontalBar", {
        hover: {
            mode: "index",
            axis: "y"
        },
        scales: {
            xAxes: [{
                type: "linear",
                position: "bottom"
            }],
            yAxes: [{
                type: "category",
                position: "left",
                offset: !0,
                gridLines: {
                    offsetGridLines: !0
                }
            }]
        },
        elements: {
            rectangle: {
                borderSkipped: "left"
            }
        },
        tooltips: {
            mode: "index",
            axis: "y"
        }
    }), z._set("global", {
        datasets: {
            horizontalBar: {
                categoryPercentage: .8,
                barPercentage: .9
            }
        }
    });
    var Bt = Dt.extend({
            _getValueScaleId: function () {
                return this.getMeta().xAxisID
            },
            _getIndexScaleId: function () {
                return this.getMeta().yAxisID
            }
        }),
        Et = V.valueOrDefault,
        Wt = V.options.resolve,
        Vt = V.canvas._isPointInArea;

    function Ht(t, e) {
        var n = t && t.options.ticks || {},
            i = n.reverse,
            a = void 0 === n.min ? e : 0,
            r = void 0 === n.max ? e : 0;
        return {
            start: i ? r : a,
            end: i ? a : r
        }
    }

    function jt(t, e, n) {
        var i = n / 2,
            a = Ht(t, i),
            r = Ht(e, i);
        return {
            top: r.end,
            right: a.end,
            bottom: r.start,
            left: a.start
        }
    }

    function qt(t) {
        var e, n, i, a;
        return V.isObject(t) ? (e = t.top, n = t.right, i = t.bottom, a = t.left) : e = n = i = a = t, {
            top: e,
            right: n,
            bottom: i,
            left: a
        }
    }
    z._set("line", {
        showLines: !0,
        spanGaps: !1,
        hover: {
            mode: "label"
        },
        scales: {
            xAxes: [{
                type: "category",
                id: "x-axis-0"
            }],
            yAxes: [{
                type: "linear",
                id: "y-axis-0"
            }]
        }
    });
    var Ut = nt.extend({
            datasetElementType: _t.Line,
            dataElementType: _t.Point,
            _datasetElementOptions: ["backgroundColor", "borderCapStyle", "borderColor", "borderDash", "borderDashOffset", "borderJoinStyle", "borderWidth", "cubicInterpolationMode", "fill"],
            _dataElementOptions: {
                backgroundColor: "pointBackgroundColor",
                borderColor: "pointBorderColor",
                borderWidth: "pointBorderWidth",
                hitRadius: "pointHitRadius",
                hoverBackgroundColor: "pointHoverBackgroundColor",
                hoverBorderColor: "pointHoverBorderColor",
                hoverBorderWidth: "pointHoverBorderWidth",
                hoverRadius: "pointHoverRadius",
                pointStyle: "pointStyle",
                radius: "pointRadius",
                rotation: "pointRotation"
            },
            update: function (t) {
                var e, n, i = this,
                    a = i.getMeta(),
                    r = a.dataset,
                    o = a.data || [],
                    s = i.chart.options,
                    l = i._config,
                    u = i._showLine = Et(l.showLine, s.showLines);
                for (i._xScale = i.getScaleForId(a.xAxisID), i._yScale = i.getScaleForId(a.yAxisID), u && (void 0 !== l.tension && void 0 === l.lineTension && (l.lineTension = l.tension), r._scale = i._yScale, r._datasetIndex = i.index, r._children = o, r._model = i._resolveDatasetElementOptions(r), r.pivot()), e = 0, n = o.length; e < n; ++e) i.updateElement(o[e], e, t);
                for (u && 0 !== r._model.tension && i.updateBezierControlPoints(), e = 0, n = o.length; e < n; ++e) o[e].pivot()
            },
            updateElement: function (t, e, n) {
                var i, a, r = this,
                    o = r.getMeta(),
                    s = t.custom || {},
                    l = r.getDataset(),
                    u = r.index,
                    d = l.data[e],
                    h = r._xScale,
                    c = r._yScale,
                    f = o.dataset._model,
                    g = r._resolveDataElementOptions(t, e);
                i = h.getPixelForValue("object" == typeof d ? d : NaN, e, u), a = n ? c.getBasePixel() : r.calculatePointY(d, e, u), t._xScale = h, t._yScale = c, t._options = g, t._datasetIndex = u, t._index = e, t._model = {
                    x: i,
                    y: a,
                    skip: s.skip || isNaN(i) || isNaN(a),
                    radius: g.radius,
                    pointStyle: g.pointStyle,
                    rotation: g.rotation,
                    backgroundColor: g.backgroundColor,
                    borderColor: g.borderColor,
                    borderWidth: g.borderWidth,
                    tension: Et(s.tension, f ? f.tension : 0),
                    steppedLine: !!f && f.steppedLine,
                    hitRadius: g.hitRadius
                }
            },
            _resolveDatasetElementOptions: function (t) {
                var e = this,
                    n = e._config,
                    i = t.custom || {},
                    a = e.chart.options,
                    r = a.elements.line,
                    o = nt.prototype._resolveDatasetElementOptions.apply(e, arguments);
                return o.spanGaps = Et(n.spanGaps, a.spanGaps), o.tension = Et(n.lineTension, r.tension), o.steppedLine = Wt([i.steppedLine, n.steppedLine, r.stepped]), o.clip = qt(Et(n.clip, jt(e._xScale, e._yScale, o.borderWidth))), o
            },
            calculatePointY: function (t, e, n) {
                var i, a, r, o, s, l, u, d = this.chart,
                    h = this._yScale,
                    c = 0,
                    f = 0;
                if (h.options.stacked) {
                    for (s = +h.getRightValue(t), u = (l = d._getSortedVisibleDatasetMetas()).length, i = 0; i < u && (r = l[i]).index !== n; ++i) a = d.data.datasets[r.index], "line" === r.type && r.yAxisID === h.id && ((o = +h.getRightValue(a.data[e])) < 0 ? f += o || 0 : c += o || 0);
                    return s < 0 ? h.getPixelForValue(f + s) : h.getPixelForValue(c + s)
                }
                return h.getPixelForValue(t)
            },
            updateBezierControlPoints: function () {
                var t, e, n, i, a = this.chart,
                    r = this.getMeta(),
                    o = r.dataset._model,
                    s = a.chartArea,
                    l = r.data || [];

                function u(t, e, n) {
                    return Math.max(Math.min(t, n), e)
                }
                if (o.spanGaps && (l = l.filter((function (t) {
                        return !t._model.skip
                    }))), "monotone" === o.cubicInterpolationMode) V.splineCurveMonotone(l);
                else
                    for (t = 0, e = l.length; t < e; ++t) n = l[t]._model, i = V.splineCurve(V.previousItem(l, t)._model, n, V.nextItem(l, t)._model, o.tension), n.controlPointPreviousX = i.previous.x, n.controlPointPreviousY = i.previous.y, n.controlPointNextX = i.next.x, n.controlPointNextY = i.next.y;
                if (a.options.elements.line.capBezierPoints)
                    for (t = 0, e = l.length; t < e; ++t) n = l[t]._model, Vt(n, s) && (t > 0 && Vt(l[t - 1]._model, s) && (n.controlPointPreviousX = u(n.controlPointPreviousX, s.left, s.right), n.controlPointPreviousY = u(n.controlPointPreviousY, s.top, s.bottom)), t < l.length - 1 && Vt(l[t + 1]._model, s) && (n.controlPointNextX = u(n.controlPointNextX, s.left, s.right), n.controlPointNextY = u(n.controlPointNextY, s.top, s.bottom)))
            },
            draw: function () {
                var t, e = this.chart,
                    n = this.getMeta(),
                    i = n.data || [],
                    a = e.chartArea,
                    r = e.canvas,
                    o = 0,
                    s = i.length;
                for (this._showLine && (t = n.dataset._model.clip, V.canvas.clipArea(e.ctx, {
                        left: !1 === t.left ? 0 : a.left - t.left,
                        right: !1 === t.right ? r.width : a.right + t.right,
                        top: !1 === t.top ? 0 : a.top - t.top,
                        bottom: !1 === t.bottom ? r.height : a.bottom + t.bottom
                    }), n.dataset.draw(), V.canvas.unclipArea(e.ctx)); o < s; ++o) i[o].draw(a)
            },
            setHoverStyle: function (t) {
                var e = t._model,
                    n = t._options,
                    i = V.getHoverColor;
                t.$previousStyle = {
                    backgroundColor: e.backgroundColor,
                    borderColor: e.borderColor,
                    borderWidth: e.borderWidth,
                    radius: e.radius
                }, e.backgroundColor = Et(n.hoverBackgroundColor, i(n.backgroundColor)), e.borderColor = Et(n.hoverBorderColor, i(n.borderColor)), e.borderWidth = Et(n.hoverBorderWidth, n.borderWidth), e.radius = Et(n.hoverRadius, n.radius)
            }
        }),
        Yt = V.options.resolve;
    z._set("polarArea", {
        scale: {
            type: "radialLinear",
            angleLines: {
                display: !1
            },
            gridLines: {
                circular: !0
            },
            pointLabels: {
                display: !1
            },
            ticks: {
                beginAtZero: !0
            }
        },
        animation: {
            animateRotate: !0,
            animateScale: !0
        },
        startAngle: -.5 * Math.PI,
        legendCallback: function (t) {
            var e, n, i, a = document.createElement("ul"),
                r = t.data,
                o = r.datasets,
                s = r.labels;
            if (a.setAttribute("class", t.id + "-legend"), o.length)
                for (e = 0, n = o[0].data.length; e < n; ++e)(i = a.appendChild(document.createElement("li"))).appendChild(document.createElement("span")).style.backgroundColor = o[0].backgroundColor[e], s[e] && i.appendChild(document.createTextNode(s[e]));
            return a.outerHTML
        },
        legend: {
            labels: {
                generateLabels: function (t) {
                    var e = t.data;
                    return e.labels.length && e.datasets.length ? e.labels.map((function (n, i) {
                        var a = t.getDatasetMeta(0),
                            r = a.controller.getStyle(i);
                        return {
                            text: n,
                            fillStyle: r.backgroundColor,
                            strokeStyle: r.borderColor,
                            lineWidth: r.borderWidth,
                            hidden: isNaN(e.datasets[0].data[i]) || a.data[i].hidden,
                            index: i
                        }
                    })) : []
                }
            },
            onClick: function (t, e) {
                var n, i, a, r = e.index,
                    o = this.chart;
                for (n = 0, i = (o.data.datasets || []).length; n < i; ++n)(a = o.getDatasetMeta(n)).data[r].hidden = !a.data[r].hidden;
                o.update()
            }
        },
        tooltips: {
            callbacks: {
                title: function () {
                    return ""
                },
                label: function (t, e) {
                    return e.labels[t.index] + ": " + t.yLabel
                }
            }
        }
    });
    var Gt = nt.extend({
        dataElementType: _t.Arc,
        linkScales: V.noop,
        _dataElementOptions: ["backgroundColor", "borderColor", "borderWidth", "borderAlign", "hoverBackgroundColor", "hoverBorderColor", "hoverBorderWidth"],
        _getIndexScaleId: function () {
            return this.chart.scale.id
        },
        _getValueScaleId: function () {
            return this.chart.scale.id
        },
        update: function (t) {
            var e, n, i, a = this,
                r = a.getDataset(),
                o = a.getMeta(),
                s = a.chart.options.startAngle || 0,
                l = a._starts = [],
                u = a._angles = [],
                d = o.data;
            for (a._updateRadius(), o.count = a.countVisibleElements(), e = 0, n = r.data.length; e < n; e++) l[e] = s, i = a._computeAngle(e), u[e] = i, s += i;
            for (e = 0, n = d.length; e < n; ++e) d[e]._options = a._resolveDataElementOptions(d[e], e), a.updateElement(d[e], e, t)
        },
        _updateRadius: function () {
            var t = this,
                e = t.chart,
                n = e.chartArea,
                i = e.options,
                a = Math.min(n.right - n.left, n.bottom - n.top);
            e.outerRadius = Math.max(a / 2, 0), e.innerRadius = Math.max(i.cutoutPercentage ? e.outerRadius / 100 * i.cutoutPercentage : 1, 0), e.radiusLength = (e.outerRadius - e.innerRadius) / e.getVisibleDatasetCount(), t.outerRadius = e.outerRadius - e.radiusLength * t.index, t.innerRadius = t.outerRadius - e.radiusLength
        },
        updateElement: function (t, e, n) {
            var i = this,
                a = i.chart,
                r = i.getDataset(),
                o = a.options,
                s = o.animation,
                l = a.scale,
                u = a.data.labels,
                d = l.xCenter,
                h = l.yCenter,
                c = o.startAngle,
                f = t.hidden ? 0 : l.getDistanceFromCenterForValue(r.data[e]),
                g = i._starts[e],
                p = g + (t.hidden ? 0 : i._angles[e]),
                m = s.animateScale ? 0 : l.getDistanceFromCenterForValue(r.data[e]),
                v = t._options || {};
            V.extend(t, {
                _datasetIndex: i.index,
                _index: e,
                _scale: l,
                _model: {
                    backgroundColor: v.backgroundColor,
                    borderColor: v.borderColor,
                    borderWidth: v.borderWidth,
                    borderAlign: v.borderAlign,
                    x: d,
                    y: h,
                    innerRadius: 0,
                    outerRadius: n ? m : f,
                    startAngle: n && s.animateRotate ? c : g,
                    endAngle: n && s.animateRotate ? c : p,
                    label: V.valueAtIndexOrDefault(u, e, u[e])
                }
            }), t.pivot()
        },
        countVisibleElements: function () {
            var t = this.getDataset(),
                e = this.getMeta(),
                n = 0;
            return V.each(e.data, (function (e, i) {
                isNaN(t.data[i]) || e.hidden || n++
            })), n
        },
        setHoverStyle: function (t) {
            var e = t._model,
                n = t._options,
                i = V.getHoverColor,
                a = V.valueOrDefault;
            t.$previousStyle = {
                backgroundColor: e.backgroundColor,
                borderColor: e.borderColor,
                borderWidth: e.borderWidth
            }, e.backgroundColor = a(n.hoverBackgroundColor, i(n.backgroundColor)), e.borderColor = a(n.hoverBorderColor, i(n.borderColor)), e.borderWidth = a(n.hoverBorderWidth, n.borderWidth)
        },
        _computeAngle: function (t) {
            var e = this,
                n = this.getMeta().count,
                i = e.getDataset(),
                a = e.getMeta();
            if (isNaN(i.data[t]) || a.data[t].hidden) return 0;
            var r = {
                chart: e.chart,
                dataIndex: t,
                dataset: i,
                datasetIndex: e.index
            };
            return Yt([e.chart.options.elements.arc.angle, 2 * Math.PI / n], r, t)
        }
    });
    z._set("pie", V.clone(z.doughnut)), z._set("pie", {
        cutoutPercentage: 0
    });
    var Xt = Nt,
        Kt = V.valueOrDefault;
    z._set("radar", {
        spanGaps: !1,
        scale: {
            type: "radialLinear"
        },
        elements: {
            line: {
                fill: "start",
                tension: 0
            }
        }
    });
    var Zt = nt.extend({
        datasetElementType: _t.Line,
        dataElementType: _t.Point,
        linkScales: V.noop,
        _datasetElementOptions: ["backgroundColor", "borderWidth", "borderColor", "borderCapStyle", "borderDash", "borderDashOffset", "borderJoinStyle", "fill"],
        _dataElementOptions: {
            backgroundColor: "pointBackgroundColor",
            borderColor: "pointBorderColor",
            borderWidth: "pointBorderWidth",
            hitRadius: "pointHitRadius",
            hoverBackgroundColor: "pointHoverBackgroundColor",
            hoverBorderColor: "pointHoverBorderColor",
            hoverBorderWidth: "pointHoverBorderWidth",
            hoverRadius: "pointHoverRadius",
            pointStyle: "pointStyle",
            radius: "pointRadius",
            rotation: "pointRotation"
        },
        _getIndexScaleId: function () {
            return this.chart.scale.id
        },
        _getValueScaleId: function () {
            return this.chart.scale.id
        },
        update: function (t) {
            var e, n, i = this,
                a = i.getMeta(),
                r = a.dataset,
                o = a.data || [],
                s = i.chart.scale,
                l = i._config;
            for (void 0 !== l.tension && void 0 === l.lineTension && (l.lineTension = l.tension), r._scale = s, r._datasetIndex = i.index, r._children = o, r._loop = !0, r._model = i._resolveDatasetElementOptions(r), r.pivot(), e = 0, n = o.length; e < n; ++e) i.updateElement(o[e], e, t);
            for (i.updateBezierControlPoints(), e = 0, n = o.length; e < n; ++e) o[e].pivot()
        },
        updateElement: function (t, e, n) {
            var i = this,
                a = t.custom || {},
                r = i.getDataset(),
                o = i.chart.scale,
                s = o.getPointPositionForValue(e, r.data[e]),
                l = i._resolveDataElementOptions(t, e),
                u = i.getMeta().dataset._model,
                d = n ? o.xCenter : s.x,
                h = n ? o.yCenter : s.y;
            t._scale = o, t._options = l, t._datasetIndex = i.index, t._index = e, t._model = {
                x: d,
                y: h,
                skip: a.skip || isNaN(d) || isNaN(h),
                radius: l.radius,
                pointStyle: l.pointStyle,
                rotation: l.rotation,
                backgroundColor: l.backgroundColor,
                borderColor: l.borderColor,
                borderWidth: l.borderWidth,
                tension: Kt(a.tension, u ? u.tension : 0),
                hitRadius: l.hitRadius
            }
        },
        _resolveDatasetElementOptions: function () {
            var t = this,
                e = t._config,
                n = t.chart.options,
                i = nt.prototype._resolveDatasetElementOptions.apply(t, arguments);
            return i.spanGaps = Kt(e.spanGaps, n.spanGaps), i.tension = Kt(e.lineTension, n.elements.line.tension), i
        },
        updateBezierControlPoints: function () {
            var t, e, n, i, a = this.getMeta(),
                r = this.chart.chartArea,
                o = a.data || [];

            function s(t, e, n) {
                return Math.max(Math.min(t, n), e)
            }
            for (a.dataset._model.spanGaps && (o = o.filter((function (t) {
                    return !t._model.skip
                }))), t = 0, e = o.length; t < e; ++t) n = o[t]._model, i = V.splineCurve(V.previousItem(o, t, !0)._model, n, V.nextItem(o, t, !0)._model, n.tension), n.controlPointPreviousX = s(i.previous.x, r.left, r.right), n.controlPointPreviousY = s(i.previous.y, r.top, r.bottom), n.controlPointNextX = s(i.next.x, r.left, r.right), n.controlPointNextY = s(i.next.y, r.top, r.bottom)
        },
        setHoverStyle: function (t) {
            var e = t._model,
                n = t._options,
                i = V.getHoverColor;
            t.$previousStyle = {
                backgroundColor: e.backgroundColor,
                borderColor: e.borderColor,
                borderWidth: e.borderWidth,
                radius: e.radius
            }, e.backgroundColor = Kt(n.hoverBackgroundColor, i(n.backgroundColor)), e.borderColor = Kt(n.hoverBorderColor, i(n.borderColor)), e.borderWidth = Kt(n.hoverBorderWidth, n.borderWidth), e.radius = Kt(n.hoverRadius, n.radius)
        }
    });
    z._set("scatter", {
        hover: {
            mode: "single"
        },
        scales: {
            xAxes: [{
                id: "x-axis-1",
                type: "linear",
                position: "bottom"
            }],
            yAxes: [{
                id: "y-axis-1",
                type: "linear",
                position: "left"
            }]
        },
        tooltips: {
            callbacks: {
                title: function () {
                    return ""
                },
                label: function (t) {
                    return "(" + t.xLabel + ", " + t.yLabel + ")"
                }
            }
        }
    }), z._set("global", {
        datasets: {
            scatter: {
                showLine: !1
            }
        }
    });
    var $t = {
        bar: Dt,
        bubble: Ft,
        doughnut: Nt,
        horizontalBar: Bt,
        line: Ut,
        polarArea: Gt,
        pie: Xt,
        radar: Zt,
        scatter: Ut
    };

    function Jt(t, e) {
        return t.native ? {
            x: t.x,
            y: t.y
        } : V.getRelativePosition(t, e)
    }

    function Qt(t, e) {
        var n, i, a, r, o, s, l = t._getSortedVisibleDatasetMetas();
        for (i = 0, r = l.length; i < r; ++i)
            for (a = 0, o = (n = l[i].data).length; a < o; ++a)(s = n[a])._view.skip || e(s)
    }

    function te(t, e) {
        var n = [];
        return Qt(t, (function (t) {
            t.inRange(e.x, e.y) && n.push(t)
        })), n
    }

    function ee(t, e, n, i) {
        var a = Number.POSITIVE_INFINITY,
            r = [];
        return Qt(t, (function (t) {
            if (!n || t.inRange(e.x, e.y)) {
                var o = t.getCenterPoint(),
                    s = i(e, o);
                s < a ? (r = [t], a = s) : s === a && r.push(t)
            }
        })), r
    }

    function ne(t) {
        var e = -1 !== t.indexOf("x"),
            n = -1 !== t.indexOf("y");
        return function (t, i) {
            var a = e ? Math.abs(t.x - i.x) : 0,
                r = n ? Math.abs(t.y - i.y) : 0;
            return Math.sqrt(Math.pow(a, 2) + Math.pow(r, 2))
        }
    }

    function ie(t, e, n) {
        var i = Jt(e, t);
        n.axis = n.axis || "x";
        var a = ne(n.axis),
            r = n.intersect ? te(t, i) : ee(t, i, !1, a),
            o = [];
        return r.length ? (t._getSortedVisibleDatasetMetas().forEach((function (t) {
            var e = t.data[r[0]._index];
            e && !e._view.skip && o.push(e)
        })), o) : []
    }
    var ae = {
            modes: {
                single: function (t, e) {
                    var n = Jt(e, t),
                        i = [];
                    return Qt(t, (function (t) {
                        if (t.inRange(n.x, n.y)) return i.push(t), i
                    })), i.slice(0, 1)
                },
                label: ie,
                index: ie,
                dataset: function (t, e, n) {
                    var i = Jt(e, t);
                    n.axis = n.axis || "xy";
                    var a = ne(n.axis),
                        r = n.intersect ? te(t, i) : ee(t, i, !1, a);
                    return r.length > 0 && (r = t.getDatasetMeta(r[0]._datasetIndex).data), r
                },
                "x-axis": function (t, e) {
                    return ie(t, e, {
                        intersect: !1
                    })
                },
                point: function (t, e) {
                    return te(t, Jt(e, t))
                },
                nearest: function (t, e, n) {
                    var i = Jt(e, t);
                    n.axis = n.axis || "xy";
                    var a = ne(n.axis);
                    return ee(t, i, n.intersect, a)
                },
                x: function (t, e, n) {
                    var i = Jt(e, t),
                        a = [],
                        r = !1;
                    return Qt(t, (function (t) {
                        t.inXRange(i.x) && a.push(t), t.inRange(i.x, i.y) && (r = !0)
                    })), n.intersect && !r && (a = []), a
                },
                y: function (t, e, n) {
                    var i = Jt(e, t),
                        a = [],
                        r = !1;
                    return Qt(t, (function (t) {
                        t.inYRange(i.y) && a.push(t), t.inRange(i.x, i.y) && (r = !0)
                    })), n.intersect && !r && (a = []), a
                }
            }
        },
        re = V.extend;

    function oe(t, e) {
        return V.where(t, (function (t) {
            return t.pos === e
        }))
    }

    function se(t, e) {
        return t.sort((function (t, n) {
            var i = e ? n : t,
                a = e ? t : n;
            return i.weight === a.weight ? i.index - a.index : i.weight - a.weight
        }))
    }

    function le(t, e, n, i) {
        return Math.max(t[n], e[n]) + Math.max(t[i], e[i])
    }

    function ue(t, e, n) {
        var i, a, r = n.box,
            o = t.maxPadding;
        if (n.size && (t[n.pos] -= n.size), n.size = n.horizontal ? r.height : r.width, t[n.pos] += n.size, r.getPadding) {
            var s = r.getPadding();
            o.top = Math.max(o.top, s.top), o.left = Math.max(o.left, s.left), o.bottom = Math.max(o.bottom, s.bottom), o.right = Math.max(o.right, s.right)
        }
        if (i = e.outerWidth - le(o, t, "left", "right"), a = e.outerHeight - le(o, t, "top", "bottom"), i !== t.w || a !== t.h) return t.w = i, t.h = a, n.horizontal ? i !== t.w : a !== t.h
    }

    function de(t, e) {
        var n = e.maxPadding;

        function i(t) {
            var i = {
                left: 0,
                top: 0,
                right: 0,
                bottom: 0
            };
            return t.forEach((function (t) {
                i[t] = Math.max(e[t], n[t])
            })), i
        }
        return i(t ? ["left", "right"] : ["top", "bottom"])
    }

    function he(t, e, n) {
        var i, a, r, o, s, l, u = [];
        for (i = 0, a = t.length; i < a; ++i)(o = (r = t[i]).box).update(r.width || e.w, r.height || e.h, de(r.horizontal, e)), ue(e, n, r) && (l = !0, u.length && (s = !0)), o.fullWidth || u.push(r);
        return s && he(u, e, n) || l
    }

    function ce(t, e, n) {
        var i, a, r, o, s = n.padding,
            l = e.x,
            u = e.y;
        for (i = 0, a = t.length; i < a; ++i) o = (r = t[i]).box, r.horizontal ? (o.left = o.fullWidth ? s.left : e.left, o.right = o.fullWidth ? n.outerWidth - s.right : e.left + e.w, o.top = u, o.bottom = u + o.height, o.width = o.right - o.left, u = o.bottom) : (o.left = l, o.right = l + o.width, o.top = e.top, o.bottom = e.top + e.h, o.height = o.bottom - o.top, l = o.right);
        e.x = l, e.y = u
    }
    z._set("global", {
        layout: {
            padding: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0
            }
        }
    });
    var fe, ge = {
            defaults: {},
            addBox: function (t, e) {
                t.boxes || (t.boxes = []), e.fullWidth = e.fullWidth || !1, e.position = e.position || "top", e.weight = e.weight || 0, e._layers = e._layers || function () {
                    return [{
                        z: 0,
                        draw: function () {
                            e.draw.apply(e, arguments)
                        }
                    }]
                }, t.boxes.push(e)
            },
            removeBox: function (t, e) {
                var n = t.boxes ? t.boxes.indexOf(e) : -1; - 1 !== n && t.boxes.splice(n, 1)
            },
            configure: function (t, e, n) {
                for (var i, a = ["fullWidth", "position", "weight"], r = a.length, o = 0; o < r; ++o) i = a[o], n.hasOwnProperty(i) && (e[i] = n[i])
            },
            update: function (t, e, n) {
                if (t) {
                    var i = t.options.layout || {},
                        a = V.options.toPadding(i.padding),
                        r = e - a.width,
                        o = n - a.height,
                        s = function (t) {
                            var e = function (t) {
                                    var e, n, i, a = [];
                                    for (e = 0, n = (t || []).length; e < n; ++e) i = t[e], a.push({
                                        index: e,
                                        box: i,
                                        pos: i.position,
                                        horizontal: i.isHorizontal(),
                                        weight: i.weight
                                    });
                                    return a
                                }(t),
                                n = se(oe(e, "left"), !0),
                                i = se(oe(e, "right")),
                                a = se(oe(e, "top"), !0),
                                r = se(oe(e, "bottom"));
                            return {
                                leftAndTop: n.concat(a),
                                rightAndBottom: i.concat(r),
                                chartArea: oe(e, "chartArea"),
                                vertical: n.concat(i),
                                horizontal: a.concat(r)
                            }
                        }(t.boxes),
                        l = s.vertical,
                        u = s.horizontal,
                        d = Object.freeze({
                            outerWidth: e,
                            outerHeight: n,
                            padding: a,
                            availableWidth: r,
                            vBoxMaxWidth: r / 2 / l.length,
                            hBoxMaxHeight: o / 2
                        }),
                        h = re({
                            maxPadding: re({}, a),
                            w: r,
                            h: o,
                            x: a.left,
                            y: a.top
                        }, a);
                    ! function (t, e) {
                        var n, i, a;
                        for (n = 0, i = t.length; n < i; ++n)(a = t[n]).width = a.horizontal ? a.box.fullWidth && e.availableWidth : e.vBoxMaxWidth, a.height = a.horizontal && e.hBoxMaxHeight
                    }(l.concat(u), d), he(l, h, d), he(u, h, d) && he(l, h, d),
                        function (t) {
                            var e = t.maxPadding;

                            function n(n) {
                                var i = Math.max(e[n] - t[n], 0);
                                return t[n] += i, i
                            }
                            t.y += n("top"), t.x += n("left"), n("right"), n("bottom")
                        }(h), ce(s.leftAndTop, h, d), h.x += h.w, h.y += h.h, ce(s.rightAndBottom, h, d), t.chartArea = {
                            left: h.left,
                            top: h.top,
                            right: h.left + h.w,
                            bottom: h.top + h.h
                        }, V.each(s.chartArea, (function (e) {
                            var n = e.box;
                            re(n, t.chartArea), n.update(h.w, h.h)
                        }))
                }
            }
        },
        pe = (fe = Object.freeze({
            __proto__: null,
            default: "@keyframes chartjs-render-animation{from{opacity:.99}to{opacity:1}}.chartjs-render-monitor{animation:chartjs-render-animation 1ms}.chartjs-size-monitor,.chartjs-size-monitor-expand,.chartjs-size-monitor-shrink{position:absolute;direction:ltr;left:0;top:0;right:0;bottom:0;overflow:hidden;pointer-events:none;visibility:hidden;z-index:-1}.chartjs-size-monitor-expand>div{position:absolute;width:1000000px;height:1000000px;left:0;top:0}.chartjs-size-monitor-shrink>div{position:absolute;width:200%;height:200%;left:0;top:0}"
        })) && fe.default || fe,
        me = "$chartjs",
        ve = "chartjs-size-monitor",
        be = "chartjs-render-monitor",
        xe = "chartjs-render-animation",
        ye = ["animationstart", "webkitAnimationStart"],
        _e = {
            touchstart: "mousedown",
            touchmove: "mousemove",
            touchend: "mouseup",
            pointerenter: "mouseenter",
            pointerdown: "mousedown",
            pointermove: "mousemove",
            pointerup: "mouseup",
            pointerleave: "mouseout",
            pointerout: "mouseout"
        };

    function ke(t, e) {
        var n = V.getStyle(t, e),
            i = n && n.match(/^(\d+)(\.\d+)?px$/);
        return i ? Number(i[1]) : void 0
    }
    var we = !! function () {
        var t = !1;
        try {
            var e = Object.defineProperty({}, "passive", {
                get: function () {
                    t = !0
                }
            });
            window.addEventListener("e", null, e)
        } catch (t) {}
        return t
    }() && {
        passive: !0
    };

    function Me(t, e, n) {
        t.addEventListener(e, n, we)
    }

    function Se(t, e, n) {
        t.removeEventListener(e, n, we)
    }

    function Ce(t, e, n, i, a) {
        return {
            type: t,
            chart: e,
            native: a || null,
            x: void 0 !== n ? n : null,
            y: void 0 !== i ? i : null
        }
    }

    function Pe(t) {
        var e = document.createElement("div");
        return e.className = t || "", e
    }

    function Ae(t, e, n) {
        var i, a, r, o, s = t[me] || (t[me] = {}),
            l = s.resizer = function (t) {
                var e = Pe(ve),
                    n = Pe(ve + "-expand"),
                    i = Pe(ve + "-shrink");
                n.appendChild(Pe()), i.appendChild(Pe()), e.appendChild(n), e.appendChild(i), e._reset = function () {
                    n.scrollLeft = 1e6, n.scrollTop = 1e6, i.scrollLeft = 1e6, i.scrollTop = 1e6
                };
                var a = function () {
                    e._reset(), t()
                };
                return Me(n, "scroll", a.bind(n, "expand")), Me(i, "scroll", a.bind(i, "shrink")), e
            }((i = function () {
                if (s.resizer) {
                    var i = n.options.maintainAspectRatio && t.parentNode,
                        a = i ? i.clientWidth : 0;
                    e(Ce("resize", n)), i && i.clientWidth < a && n.canvas && e(Ce("resize", n))
                }
            }, r = !1, o = [], function () {
                o = Array.prototype.slice.call(arguments), a = a || this, r || (r = !0, V.requestAnimFrame.call(window, (function () {
                    r = !1, i.apply(a, o)
                })))
            }));
        ! function (t, e) {
            var n = t[me] || (t[me] = {}),
                i = n.renderProxy = function (t) {
                    t.animationName === xe && e()
                };
            V.each(ye, (function (e) {
                Me(t, e, i)
            })), n.reflow = !!t.offsetParent, t.classList.add(be)
        }(t, (function () {
            if (s.resizer) {
                var e = t.parentNode;
                e && e !== l.parentNode && e.insertBefore(l, e.firstChild), l._reset()
            }
        }))
    }

    function De(t) {
        var e = t[me] || {},
            n = e.resizer;
        delete e.resizer,
            function (t) {
                var e = t[me] || {},
                    n = e.renderProxy;
                n && (V.each(ye, (function (e) {
                    Se(t, e, n)
                })), delete e.renderProxy), t.classList.remove(be)
            }(t), n && n.parentNode && n.parentNode.removeChild(n)
    }
    var Te = {
        disableCSSInjection: !1,
        _enabled: "undefined" != typeof window && "undefined" != typeof document,
        _ensureLoaded: function (t) {
            if (!this.disableCSSInjection) {
                var e = t.getRootNode ? t.getRootNode() : document;
                ! function (t, e) {
                    var n = t[me] || (t[me] = {});
                    if (!n.containsStyles) {
                        n.containsStyles = !0, e = "/* Chart.js */\n" + e;
                        var i = document.createElement("style");
                        i.setAttribute("type", "text/css"), i.appendChild(document.createTextNode(e)), t.appendChild(i)
                    }
                }(e.host ? e : document.head, pe)
            }
        },
        acquireContext: function (t, e) {
            "string" == typeof t ? t = document.getElementById(t) : t.length && (t = t[0]), t && t.canvas && (t = t.canvas);
            var n = t && t.getContext && t.getContext("2d");
            return n && n.canvas === t ? (this._ensureLoaded(t), function (t, e) {
                var n = t.style,
                    i = t.getAttribute("height"),
                    a = t.getAttribute("width");
                if (t[me] = {
                        initial: {
                            height: i,
                            width: a,
                            style: {
                                display: n.display,
                                height: n.height,
                                width: n.width
                            }
                        }
                    }, n.display = n.display || "block", null === a || "" === a) {
                    var r = ke(t, "width");
                    void 0 !== r && (t.width = r)
                }
                if (null === i || "" === i)
                    if ("" === t.style.height) t.height = t.width / (e.options.aspectRatio || 2);
                    else {
                        var o = ke(t, "height");
                        void 0 !== r && (t.height = o)
                    }
            }(t, e), n) : null
        },
        releaseContext: function (t) {
            var e = t.canvas;
            if (e[me]) {
                var n = e[me].initial;
                ["height", "width"].forEach((function (t) {
                    var i = n[t];
                    V.isNullOrUndef(i) ? e.removeAttribute(t) : e.setAttribute(t, i)
                })), V.each(n.style || {}, (function (t, n) {
                    e.style[n] = t
                })), e.width = e.width, delete e[me]
            }
        },
        addEventListener: function (t, e, n) {
            var i = t.canvas;
            if ("resize" !== e) {
                var a = n[me] || (n[me] = {});
                Me(i, e, (a.proxies || (a.proxies = {}))[t.id + "_" + e] = function (e) {
                    n(function (t, e) {
                        var n = _e[t.type] || t.type,
                            i = V.getRelativePosition(t, e);
                        return Ce(n, e, i.x, i.y, t)
                    }(e, t))
                })
            } else Ae(i, n, t)
        },
        removeEventListener: function (t, e, n) {
            var i = t.canvas;
            if ("resize" !== e) {
                var a = ((n[me] || {}).proxies || {})[t.id + "_" + e];
                a && Se(i, e, a)
            } else De(i)
        }
    };
    V.addEvent = Me, V.removeEvent = Se;
    var Ie = Te._enabled ? Te : {
            acquireContext: function (t) {
                return t && t.canvas && (t = t.canvas), t && t.getContext("2d") || null
            }
        },
        Fe = V.extend({
            initialize: function () {},
            acquireContext: function () {},
            releaseContext: function () {},
            addEventListener: function () {},
            removeEventListener: function () {}
        }, Ie);
    z._set("global", {
        plugins: {}
    });
    var Le = {
            _plugins: [],
            _cacheId: 0,
            register: function (t) {
                var e = this._plugins;
                [].concat(t).forEach((function (t) {
                    -1 === e.indexOf(t) && e.push(t)
                })), this._cacheId++
            },
            unregister: function (t) {
                var e = this._plugins;
                [].concat(t).forEach((function (t) {
                    var n = e.indexOf(t); - 1 !== n && e.splice(n, 1)
                })), this._cacheId++
            },
            clear: function () {
                this._plugins = [], this._cacheId++
            },
            count: function () {
                return this._plugins.length
            },
            getAll: function () {
                return this._plugins
            },
            notify: function (t, e, n) {
                var i, a, r, o, s, l = this.descriptors(t),
                    u = l.length;
                for (i = 0; i < u; ++i)
                    if ("function" == typeof (s = (r = (a = l[i]).plugin)[e]) && ((o = [t].concat(n || [])).push(a.options), !1 === s.apply(r, o))) return !1;
                return !0
            },
            descriptors: function (t) {
                var e = t.$plugins || (t.$plugins = {});
                if (e.id === this._cacheId) return e.descriptors;
                var n = [],
                    i = [],
                    a = t && t.config || {},
                    r = a.options && a.options.plugins || {};
                return this._plugins.concat(a.plugins || []).forEach((function (t) {
                    if (-1 === n.indexOf(t)) {
                        var e = t.id,
                            a = r[e];
                        !1 !== a && (!0 === a && (a = V.clone(z.global.plugins[e])), n.push(t), i.push({
                            plugin: t,
                            options: a || {}
                        }))
                    }
                })), e.descriptors = i, e.id = this._cacheId, i
            },
            _invalidate: function (t) {
                delete t.$plugins
            }
        },
        Oe = {
            constructors: {},
            defaults: {},
            registerScaleType: function (t, e, n) {
                this.constructors[t] = e, this.defaults[t] = V.clone(n)
            },
            getScaleConstructor: function (t) {
                return this.constructors.hasOwnProperty(t) ? this.constructors[t] : void 0
            },
            getScaleDefaults: function (t) {
                return this.defaults.hasOwnProperty(t) ? V.merge({}, [z.scale, this.defaults[t]]) : {}
            },
            updateScaleDefaults: function (t, e) {
                this.defaults.hasOwnProperty(t) && (this.defaults[t] = V.extend(this.defaults[t], e))
            },
            addScalesToLayout: function (t) {
                V.each(t.scales, (function (e) {
                    e.fullWidth = e.options.fullWidth, e.position = e.options.position, e.weight = e.options.weight, ge.addBox(t, e)
                }))
            }
        },
        Re = V.valueOrDefault,
        ze = V.rtl.getRtlAdapter;
    z._set("global", {
        tooltips: {
            enabled: !0,
            custom: null,
            mode: "nearest",
            position: "average",
            intersect: !0,
            backgroundColor: "rgba(0,0,0,0.8)",
            titleFontStyle: "bold",
            titleSpacing: 2,
            titleMarginBottom: 6,
            titleFontColor: "#fff",
            titleAlign: "left",
            bodySpacing: 2,
            bodyFontColor: "#fff",
            bodyAlign: "left",
            footerFontStyle: "bold",
            footerSpacing: 2,
            footerMarginTop: 6,
            footerFontColor: "#fff",
            footerAlign: "left",
            yPadding: 6,
            xPadding: 6,
            caretPadding: 2,
            caretSize: 5,
            cornerRadius: 6,
            multiKeyBackground: "#fff",
            displayColors: !0,
            borderColor: "rgba(0,0,0,0)",
            borderWidth: 0,
            callbacks: {
                beforeTitle: V.noop,
                title: function (t, e) {
                    var n = "",
                        i = e.labels,
                        a = i ? i.length : 0;
                    if (t.length > 0) {
                        var r = t[0];
                        r.label ? n = r.label : r.xLabel ? n = r.xLabel : a > 0 && r.index < a && (n = i[r.index])
                    }
                    return n
                },
                afterTitle: V.noop,
                beforeBody: V.noop,
                beforeLabel: V.noop,
                label: function (t, e) {
                    var n = e.datasets[t.datasetIndex].label || "";
                    return n && (n += ": "), V.isNullOrUndef(t.value) ? n += t.yLabel : n += t.value, n
                },
                labelColor: function (t, e) {
                    var n = e.getDatasetMeta(t.datasetIndex).data[t.index]._view;
                    return {
                        borderColor: n.borderColor,
                        backgroundColor: n.backgroundColor
                    }
                },
                labelTextColor: function () {
                    return this._options.bodyFontColor
                },
                afterLabel: V.noop,
                afterBody: V.noop,
                beforeFooter: V.noop,
                footer: V.noop,
                afterFooter: V.noop
            }
        }
    });
    var Ne = {
        average: function (t) {
            if (!t.length) return !1;
            var e, n, i = 0,
                a = 0,
                r = 0;
            for (e = 0, n = t.length; e < n; ++e) {
                var o = t[e];
                if (o && o.hasValue()) {
                    var s = o.tooltipPosition();
                    i += s.x, a += s.y, ++r
                }
            }
            return {
                x: i / r,
                y: a / r
            }
        },
        nearest: function (t, e) {
            var n, i, a, r = e.x,
                o = e.y,
                s = Number.POSITIVE_INFINITY;
            for (n = 0, i = t.length; n < i; ++n) {
                var l = t[n];
                if (l && l.hasValue()) {
                    var u = l.getCenterPoint(),
                        d = V.distanceBetweenPoints(e, u);
                    d < s && (s = d, a = l)
                }
            }
            if (a) {
                var h = a.tooltipPosition();
                r = h.x, o = h.y
            }
            return {
                x: r,
                y: o
            }
        }
    };

    function Be(t, e) {
        return e && (V.isArray(e) ? Array.prototype.push.apply(t, e) : t.push(e)), t
    }

    function Ee(t) {
        return ("string" == typeof t || t instanceof String) && t.indexOf("\n") > -1 ? t.split("\n") : t
    }

    function We(t) {
        var e = z.global;
        return {
            xPadding: t.xPadding,
            yPadding: t.yPadding,
            xAlign: t.xAlign,
            yAlign: t.yAlign,
            rtl: t.rtl,
            textDirection: t.textDirection,
            bodyFontColor: t.bodyFontColor,
            _bodyFontFamily: Re(t.bodyFontFamily, e.defaultFontFamily),
            _bodyFontStyle: Re(t.bodyFontStyle, e.defaultFontStyle),
            _bodyAlign: t.bodyAlign,
            bodyFontSize: Re(t.bodyFontSize, e.defaultFontSize),
            bodySpacing: t.bodySpacing,
            titleFontColor: t.titleFontColor,
            _titleFontFamily: Re(t.titleFontFamily, e.defaultFontFamily),
            _titleFontStyle: Re(t.titleFontStyle, e.defaultFontStyle),
            titleFontSize: Re(t.titleFontSize, e.defaultFontSize),
            _titleAlign: t.titleAlign,
            titleSpacing: t.titleSpacing,
            titleMarginBottom: t.titleMarginBottom,
            footerFontColor: t.footerFontColor,
            _footerFontFamily: Re(t.footerFontFamily, e.defaultFontFamily),
            _footerFontStyle: Re(t.footerFontStyle, e.defaultFontStyle),
            footerFontSize: Re(t.footerFontSize, e.defaultFontSize),
            _footerAlign: t.footerAlign,
            footerSpacing: t.footerSpacing,
            footerMarginTop: t.footerMarginTop,
            caretSize: t.caretSize,
            cornerRadius: t.cornerRadius,
            backgroundColor: t.backgroundColor,
            opacity: 0,
            legendColorBackground: t.multiKeyBackground,
            displayColors: t.displayColors,
            borderColor: t.borderColor,
            borderWidth: t.borderWidth
        }
    }

    function Ve(t, e) {
        return "center" === e ? t.x + t.width / 2 : "right" === e ? t.x + t.width - t.xPadding : t.x + t.xPadding
    }

    function He(t) {
        return Be([], Ee(t))
    }
    var je = X.extend({
            initialize: function () {
                this._model = We(this._options), this._lastActive = []
            },
            getTitle: function () {
                var t = this,
                    e = t._options,
                    n = e.callbacks,
                    i = n.beforeTitle.apply(t, arguments),
                    a = n.title.apply(t, arguments),
                    r = n.afterTitle.apply(t, arguments),
                    o = [];
                return o = Be(o, Ee(i)), o = Be(o, Ee(a)), o = Be(o, Ee(r))
            },
            getBeforeBody: function () {
                return He(this._options.callbacks.beforeBody.apply(this, arguments))
            },
            getBody: function (t, e) {
                var n = this,
                    i = n._options.callbacks,
                    a = [];
                return V.each(t, (function (t) {
                    var r = {
                        before: [],
                        lines: [],
                        after: []
                    };
                    Be(r.before, Ee(i.beforeLabel.call(n, t, e))), Be(r.lines, i.label.call(n, t, e)), Be(r.after, Ee(i.afterLabel.call(n, t, e))), a.push(r)
                })), a
            },
            getAfterBody: function () {
                return He(this._options.callbacks.afterBody.apply(this, arguments))
            },
            getFooter: function () {
                var t = this,
                    e = t._options.callbacks,
                    n = e.beforeFooter.apply(t, arguments),
                    i = e.footer.apply(t, arguments),
                    a = e.afterFooter.apply(t, arguments),
                    r = [];
                return r = Be(r, Ee(n)), r = Be(r, Ee(i)), r = Be(r, Ee(a))
            },
            update: function (t) {
                var e, n, i, a, r, o, s, l, u, d, h = this,
                    c = h._options,
                    f = h._model,
                    g = h._model = We(c),
                    p = h._active,
                    m = h._data,
                    v = {
                        xAlign: f.xAlign,
                        yAlign: f.yAlign
                    },
                    b = {
                        x: f.x,
                        y: f.y
                    },
                    x = {
                        width: f.width,
                        height: f.height
                    },
                    y = {
                        x: f.caretX,
                        y: f.caretY
                    };
                if (p.length) {
                    g.opacity = 1;
                    var _ = [],
                        k = [];
                    y = Ne[c.position].call(h, p, h._eventPosition);
                    var w = [];
                    for (e = 0, n = p.length; e < n; ++e) w.push((i = p[e], a = void 0, r = void 0, o = void 0, s = void 0, l = void 0, u = void 0, d = void 0, a = i._xScale, r = i._yScale || i._scale, o = i._index, s = i._datasetIndex, l = i._chart.getDatasetMeta(s).controller, u = l._getIndexScale(), d = l._getValueScale(), {
                        xLabel: a ? a.getLabelForIndex(o, s) : "",
                        yLabel: r ? r.getLabelForIndex(o, s) : "",
                        label: u ? "" + u.getLabelForIndex(o, s) : "",
                        value: d ? "" + d.getLabelForIndex(o, s) : "",
                        index: o,
                        datasetIndex: s,
                        x: i._model.x,
                        y: i._model.y
                    }));
                    c.filter && (w = w.filter((function (t) {
                        return c.filter(t, m)
                    }))), c.itemSort && (w = w.sort((function (t, e) {
                        return c.itemSort(t, e, m)
                    }))), V.each(w, (function (t) {
                        _.push(c.callbacks.labelColor.call(h, t, h._chart)), k.push(c.callbacks.labelTextColor.call(h, t, h._chart))
                    })), g.title = h.getTitle(w, m), g.beforeBody = h.getBeforeBody(w, m), g.body = h.getBody(w, m), g.afterBody = h.getAfterBody(w, m), g.footer = h.getFooter(w, m), g.x = y.x, g.y = y.y, g.caretPadding = c.caretPadding, g.labelColors = _, g.labelTextColors = k, g.dataPoints = w, x = function (t, e) {
                        var n = t._chart.ctx,
                            i = 2 * e.yPadding,
                            a = 0,
                            r = e.body,
                            o = r.reduce((function (t, e) {
                                return t + e.before.length + e.lines.length + e.after.length
                            }), 0);
                        o += e.beforeBody.length + e.afterBody.length;
                        var s = e.title.length,
                            l = e.footer.length,
                            u = e.titleFontSize,
                            d = e.bodyFontSize,
                            h = e.footerFontSize;
                        i += s * u, i += s ? (s - 1) * e.titleSpacing : 0, i += s ? e.titleMarginBottom : 0, i += o * d, i += o ? (o - 1) * e.bodySpacing : 0, i += l ? e.footerMarginTop : 0, i += l * h, i += l ? (l - 1) * e.footerSpacing : 0;
                        var c = 0,
                            f = function (t) {
                                a = Math.max(a, n.measureText(t).width + c)
                            };
                        return n.font = V.fontString(u, e._titleFontStyle, e._titleFontFamily), V.each(e.title, f), n.font = V.fontString(d, e._bodyFontStyle, e._bodyFontFamily), V.each(e.beforeBody.concat(e.afterBody), f), c = e.displayColors ? d + 2 : 0, V.each(r, (function (t) {
                            V.each(t.before, f), V.each(t.lines, f), V.each(t.after, f)
                        })), c = 0, n.font = V.fontString(h, e._footerFontStyle, e._footerFontFamily), V.each(e.footer, f), {
                            width: a += 2 * e.xPadding,
                            height: i
                        }
                    }(this, g), b = function (t, e, n, i) {
                        var a = t.x,
                            r = t.y,
                            o = t.caretSize,
                            s = t.caretPadding,
                            l = t.cornerRadius,
                            u = n.xAlign,
                            d = n.yAlign,
                            h = o + s,
                            c = l + s;
                        return "right" === u ? a -= e.width : "center" === u && ((a -= e.width / 2) + e.width > i.width && (a = i.width - e.width), a < 0 && (a = 0)), "top" === d ? r += h : r -= "bottom" === d ? e.height + h : e.height / 2, "center" === d ? "left" === u ? a += h : "right" === u && (a -= h) : "left" === u ? a -= c : "right" === u && (a += c), {
                            x: a,
                            y: r
                        }
                    }(g, x, v = function (t, e) {
                        var n, i, a, r, o, s = t._model,
                            l = t._chart,
                            u = t._chart.chartArea,
                            d = "center",
                            h = "center";
                        s.y < e.height ? h = "top" : s.y > l.height - e.height && (h = "bottom");
                        var c = (u.left + u.right) / 2,
                            f = (u.top + u.bottom) / 2;
                        "center" === h ? (n = function (t) {
                            return t <= c
                        }, i = function (t) {
                            return t > c
                        }) : (n = function (t) {
                            return t <= e.width / 2
                        }, i = function (t) {
                            return t >= l.width - e.width / 2
                        }), a = function (t) {
                            return t + e.width + s.caretSize + s.caretPadding > l.width
                        }, r = function (t) {
                            return t - e.width - s.caretSize - s.caretPadding < 0
                        }, o = function (t) {
                            return t <= f ? "top" : "bottom"
                        }, n(s.x) ? (d = "left", a(s.x) && (d = "center", h = o(s.y))) : i(s.x) && (d = "right", r(s.x) && (d = "center", h = o(s.y)));
                        var g = t._options;
                        return {
                            xAlign: g.xAlign ? g.xAlign : d,
                            yAlign: g.yAlign ? g.yAlign : h
                        }
                    }(this, x), h._chart)
                } else g.opacity = 0;
                return g.xAlign = v.xAlign, g.yAlign = v.yAlign, g.x = b.x, g.y = b.y, g.width = x.width, g.height = x.height, g.caretX = y.x, g.caretY = y.y, h._model = g, t && c.custom && c.custom.call(h, g), h
            },
            drawCaret: function (t, e) {
                var n = this._chart.ctx,
                    i = this._view,
                    a = this.getCaretPosition(t, e, i);
                n.lineTo(a.x1, a.y1), n.lineTo(a.x2, a.y2), n.lineTo(a.x3, a.y3)
            },
            getCaretPosition: function (t, e, n) {
                var i, a, r, o, s, l, u = n.caretSize,
                    d = n.cornerRadius,
                    h = n.xAlign,
                    c = n.yAlign,
                    f = t.x,
                    g = t.y,
                    p = e.width,
                    m = e.height;
                if ("center" === c) s = g + m / 2, "left" === h ? (a = (i = f) - u, r = i, o = s + u, l = s - u) : (a = (i = f + p) + u, r = i, o = s - u, l = s + u);
                else if ("left" === h ? (i = (a = f + d + u) - u, r = a + u) : "right" === h ? (i = (a = f + p - d - u) - u, r = a + u) : (i = (a = n.caretX) - u, r = a + u), "top" === c) s = (o = g) - u, l = o;
                else {
                    s = (o = g + m) + u, l = o;
                    var v = r;
                    r = i, i = v
                }
                return {
                    x1: i,
                    x2: a,
                    x3: r,
                    y1: o,
                    y2: s,
                    y3: l
                }
            },
            drawTitle: function (t, e, n) {
                var i, a, r, o = e.title,
                    s = o.length;
                if (s) {
                    var l = ze(e.rtl, e.x, e.width);
                    for (t.x = Ve(e, e._titleAlign), n.textAlign = l.textAlign(e._titleAlign), n.textBaseline = "middle", i = e.titleFontSize, a = e.titleSpacing, n.fillStyle = e.titleFontColor, n.font = V.fontString(i, e._titleFontStyle, e._titleFontFamily), r = 0; r < s; ++r) n.fillText(o[r], l.x(t.x), t.y + i / 2), t.y += i + a, r + 1 === s && (t.y += e.titleMarginBottom - a)
                }
            },
            drawBody: function (t, e, n) {
                var i, a, r, o, s, l, u, d, h = e.bodyFontSize,
                    c = e.bodySpacing,
                    f = e._bodyAlign,
                    g = e.body,
                    p = e.displayColors,
                    m = 0,
                    v = p ? Ve(e, "left") : 0,
                    b = ze(e.rtl, e.x, e.width),
                    x = function (e) {
                        n.fillText(e, b.x(t.x + m), t.y + h / 2), t.y += h + c
                    },
                    y = b.textAlign(f);
                for (n.textAlign = f, n.textBaseline = "middle", n.font = V.fontString(h, e._bodyFontStyle, e._bodyFontFamily), t.x = Ve(e, y), n.fillStyle = e.bodyFontColor, V.each(e.beforeBody, x), m = p && "right" !== y ? "center" === f ? h / 2 + 1 : h + 2 : 0, s = 0, u = g.length; s < u; ++s) {
                    for (i = g[s], a = e.labelTextColors[s], r = e.labelColors[s], n.fillStyle = a, V.each(i.before, x), l = 0, d = (o = i.lines).length; l < d; ++l) {
                        if (p) {
                            var _ = b.x(v);
                            n.fillStyle = e.legendColorBackground, n.fillRect(b.leftForLtr(_, h), t.y, h, h), n.lineWidth = 1, n.strokeStyle = r.borderColor, n.strokeRect(b.leftForLtr(_, h), t.y, h, h), n.fillStyle = r.backgroundColor, n.fillRect(b.leftForLtr(b.xPlus(_, 1), h - 2), t.y + 1, h - 2, h - 2), n.fillStyle = a
                        }
                        x(o[l])
                    }
                    V.each(i.after, x)
                }
                m = 0, V.each(e.afterBody, x), t.y -= c
            },
            drawFooter: function (t, e, n) {
                var i, a, r = e.footer,
                    o = r.length;
                if (o) {
                    var s = ze(e.rtl, e.x, e.width);
                    for (t.x = Ve(e, e._footerAlign), t.y += e.footerMarginTop, n.textAlign = s.textAlign(e._footerAlign), n.textBaseline = "middle", i = e.footerFontSize, n.fillStyle = e.footerFontColor, n.font = V.fontString(i, e._footerFontStyle, e._footerFontFamily), a = 0; a < o; ++a) n.fillText(r[a], s.x(t.x), t.y + i / 2), t.y += i + e.footerSpacing
                }
            },
            drawBackground: function (t, e, n, i) {
                n.fillStyle = e.backgroundColor, n.strokeStyle = e.borderColor, n.lineWidth = e.borderWidth;
                var a = e.xAlign,
                    r = e.yAlign,
                    o = t.x,
                    s = t.y,
                    l = i.width,
                    u = i.height,
                    d = e.cornerRadius;
                n.beginPath(), n.moveTo(o + d, s), "top" === r && this.drawCaret(t, i), n.lineTo(o + l - d, s), n.quadraticCurveTo(o + l, s, o + l, s + d), "center" === r && "right" === a && this.drawCaret(t, i), n.lineTo(o + l, s + u - d), n.quadraticCurveTo(o + l, s + u, o + l - d, s + u), "bottom" === r && this.drawCaret(t, i), n.lineTo(o + d, s + u), n.quadraticCurveTo(o, s + u, o, s + u - d), "center" === r && "left" === a && this.drawCaret(t, i), n.lineTo(o, s + d), n.quadraticCurveTo(o, s, o + d, s), n.closePath(), n.fill(), e.borderWidth > 0 && n.stroke()
            },
            draw: function () {
                var t = this._chart.ctx,
                    e = this._view;
                if (0 !== e.opacity) {
                    var n = {
                            width: e.width,
                            height: e.height
                        },
                        i = {
                            x: e.x,
                            y: e.y
                        },
                        a = Math.abs(e.opacity < .001) ? 0 : e.opacity,
                        r = e.title.length || e.beforeBody.length || e.body.length || e.afterBody.length || e.footer.length;
                    this._options.enabled && r && (t.save(), t.globalAlpha = a, this.drawBackground(i, e, t, n), i.y += e.yPadding, V.rtl.overrideTextDirection(t, e.textDirection), this.drawTitle(i, e, t), this.drawBody(i, e, t), this.drawFooter(i, e, t), V.rtl.restoreTextDirection(t, e.textDirection), t.restore())
                }
            },
            handleEvent: function (t) {
                var e, n = this,
                    i = n._options;
                return n._lastActive = n._lastActive || [], "mouseout" === t.type ? n._active = [] : (n._active = n._chart.getElementsAtEventForMode(t, i.mode, i), i.reverse && n._active.reverse()), (e = !V.arrayEquals(n._active, n._lastActive)) && (n._lastActive = n._active, (i.enabled || i.custom) && (n._eventPosition = {
                    x: t.x,
                    y: t.y
                }, n.update(!0), n.pivot())), e
            }
        }),
        qe = Ne,
        Ue = je;
    Ue.positioners = qe;
    var Ye = V.valueOrDefault;

    function Ge() {
        return V.merge({}, [].slice.call(arguments), {
            merger: function (t, e, n, i) {
                if ("xAxes" === t || "yAxes" === t) {
                    var a, r, o, s = n[t].length;
                    for (e[t] || (e[t] = []), a = 0; a < s; ++a) o = n[t][a], r = Ye(o.type, "xAxes" === t ? "category" : "linear"), a >= e[t].length && e[t].push({}), !e[t][a].type || o.type && o.type !== e[t][a].type ? V.merge(e[t][a], [Oe.getScaleDefaults(r), o]) : V.merge(e[t][a], o)
                } else V._merger(t, e, n, i)
            }
        })
    }

    function Xe() {
        return V.merge({}, [].slice.call(arguments), {
            merger: function (t, e, n, i) {
                var a = e[t] || {},
                    r = n[t];
                "scales" === t ? e[t] = Ge(a, r) : "scale" === t ? e[t] = V.merge(a, [Oe.getScaleDefaults(r.type), r]) : V._merger(t, e, n, i)
            }
        })
    }

    function Ke(t) {
        var e = t.options;
        V.each(t.scales, (function (e) {
            ge.removeBox(t, e)
        })), e = Xe(z.global, z[t.config.type], e), t.options = t.config.options = e, t.ensureScalesHaveIDs(), t.buildOrUpdateScales(), t.tooltip._options = e.tooltips, t.tooltip.initialize()
    }

    function Ze(t, e, n) {
        var i, a = function (t) {
            return t.id === i
        };
        do {
            i = e + n++
        } while (V.findIndex(t, a) >= 0);
        return i
    }

    function $e(t) {
        return "top" === t || "bottom" === t
    }

    function Je(t, e) {
        return function (n, i) {
            return n[t] === i[t] ? n[e] - i[e] : n[t] - i[t]
        }
    }
    z._set("global", {
        elements: {},
        events: ["mousemove", "mouseout", "click", "touchstart", "touchmove"],
        hover: {
            onHover: null,
            mode: "nearest",
            intersect: !0,
            animationDuration: 400
        },
        onClick: null,
        maintainAspectRatio: !0,
        responsive: !0,
        responsiveAnimationDuration: 0
    });
    var Qe = function (t, e) {
        return this.construct(t, e), this
    };
    V.extend(Qe.prototype, {
        construct: function (t, e) {
            var n = this;
            e = function (t) {
                var e = (t = t || {}).data = t.data || {};
                return e.datasets = e.datasets || [], e.labels = e.labels || [], t.options = Xe(z.global, z[t.type], t.options || {}), t
            }(e);
            var i = Fe.acquireContext(t, e),
                a = i && i.canvas,
                r = a && a.height,
                o = a && a.width;
            n.id = V.uid(), n.ctx = i, n.canvas = a, n.config = e, n.width = o, n.height = r, n.aspectRatio = r ? o / r : null, n.options = e.options, n._bufferedRender = !1, n._layers = [], n.chart = n, n.controller = n, Qe.instances[n.id] = n, Object.defineProperty(n, "data", {
                get: function () {
                    return n.config.data
                },
                set: function (t) {
                    n.config.data = t
                }
            }), i && a ? (n.initialize(), n.update()) : console.error("Failed to create chart: can't acquire context from the given item")
        },
        initialize: function () {
            var t = this;
            return Le.notify(t, "beforeInit"), V.retinaScale(t, t.options.devicePixelRatio), t.bindEvents(), t.options.responsive && t.resize(!0), t.initToolTip(), Le.notify(t, "afterInit"), t
        },
        clear: function () {
            return V.canvas.clear(this), this
        },
        stop: function () {
            return $.cancelAnimation(this), this
        },
        resize: function (t) {
            var e = this,
                n = e.options,
                i = e.canvas,
                a = n.maintainAspectRatio && e.aspectRatio || null,
                r = Math.max(0, Math.floor(V.getMaximumWidth(i))),
                o = Math.max(0, Math.floor(a ? r / a : V.getMaximumHeight(i)));
            if ((e.width !== r || e.height !== o) && (i.width = e.width = r, i.height = e.height = o, i.style.width = r + "px", i.style.height = o + "px", V.retinaScale(e, n.devicePixelRatio), !t)) {
                var s = {
                    width: r,
                    height: o
                };
                Le.notify(e, "resize", [s]), n.onResize && n.onResize(e, s), e.stop(), e.update({
                    duration: n.responsiveAnimationDuration
                })
            }
        },
        ensureScalesHaveIDs: function () {
            var t = this.options,
                e = t.scales || {},
                n = t.scale;
            V.each(e.xAxes, (function (t, n) {
                t.id || (t.id = Ze(e.xAxes, "x-axis-", n))
            })), V.each(e.yAxes, (function (t, n) {
                t.id || (t.id = Ze(e.yAxes, "y-axis-", n))
            })), n && (n.id = n.id || "scale")
        },
        buildOrUpdateScales: function () {
            var t = this,
                e = t.options,
                n = t.scales || {},
                i = [],
                a = Object.keys(n).reduce((function (t, e) {
                    return t[e] = !1, t
                }), {});
            e.scales && (i = i.concat((e.scales.xAxes || []).map((function (t) {
                return {
                    options: t,
                    dtype: "category",
                    dposition: "bottom"
                }
            })), (e.scales.yAxes || []).map((function (t) {
                return {
                    options: t,
                    dtype: "linear",
                    dposition: "left"
                }
            })))), e.scale && i.push({
                options: e.scale,
                dtype: "radialLinear",
                isDefault: !0,
                dposition: "chartArea"
            }), V.each(i, (function (e) {
                var i = e.options,
                    r = i.id,
                    o = Ye(i.type, e.dtype);
                $e(i.position) !== $e(e.dposition) && (i.position = e.dposition), a[r] = !0;
                var s = null;
                if (r in n && n[r].type === o)(s = n[r]).options = i, s.ctx = t.ctx, s.chart = t;
                else {
                    var l = Oe.getScaleConstructor(o);
                    if (!l) return;
                    s = new l({
                        id: r,
                        type: o,
                        options: i,
                        ctx: t.ctx,
                        chart: t
                    }), n[s.id] = s
                }
                s.mergeTicksOptions(), e.isDefault && (t.scale = s)
            })), V.each(a, (function (t, e) {
                t || delete n[e]
            })), t.scales = n, Oe.addScalesToLayout(this)
        },
        buildOrUpdateControllers: function () {
            var t, e, n = this,
                i = [],
                a = n.data.datasets;
            for (t = 0, e = a.length; t < e; t++) {
                var r = a[t],
                    o = n.getDatasetMeta(t),
                    s = r.type || n.config.type;
                if (o.type && o.type !== s && (n.destroyDatasetMeta(t), o = n.getDatasetMeta(t)), o.type = s, o.order = r.order || 0, o.index = t, o.controller) o.controller.updateIndex(t), o.controller.linkScales();
                else {
                    var l = $t[o.type];
                    if (void 0 === l) throw new Error('"' + o.type + '" is not a chart type.');
                    o.controller = new l(n, t), i.push(o.controller)
                }
            }
            return i
        },
        resetElements: function () {
            var t = this;
            V.each(t.data.datasets, (function (e, n) {
                t.getDatasetMeta(n).controller.reset()
            }), t)
        },
        reset: function () {
            this.resetElements(), this.tooltip.initialize()
        },
        update: function (t) {
            var e, n, i = this;
            if (t && "object" == typeof t || (t = {
                    duration: t,
                    lazy: arguments[1]
                }), Ke(i), Le._invalidate(i), !1 !== Le.notify(i, "beforeUpdate")) {
                i.tooltip._data = i.data;
                var a = i.buildOrUpdateControllers();
                for (e = 0, n = i.data.datasets.length; e < n; e++) i.getDatasetMeta(e).controller.buildOrUpdateElements();
                i.updateLayout(), i.options.animation && i.options.animation.duration && V.each(a, (function (t) {
                    t.reset()
                })), i.updateDatasets(), i.tooltip.initialize(), i.lastActive = [], Le.notify(i, "afterUpdate"), i._layers.sort(Je("z", "_idx")), i._bufferedRender ? i._bufferedRequest = {
                    duration: t.duration,
                    easing: t.easing,
                    lazy: t.lazy
                } : i.render(t)
            }
        },
        updateLayout: function () {
            var t = this;
            !1 !== Le.notify(t, "beforeLayout") && (ge.update(this, this.width, this.height), t._layers = [], V.each(t.boxes, (function (e) {
                e._configure && e._configure(), t._layers.push.apply(t._layers, e._layers())
            }), t), t._layers.forEach((function (t, e) {
                t._idx = e
            })), Le.notify(t, "afterScaleUpdate"), Le.notify(t, "afterLayout"))
        },
        updateDatasets: function () {
            if (!1 !== Le.notify(this, "beforeDatasetsUpdate")) {
                for (var t = 0, e = this.data.datasets.length; t < e; ++t) this.updateDataset(t);
                Le.notify(this, "afterDatasetsUpdate")
            }
        },
        updateDataset: function (t) {
            var e = this.getDatasetMeta(t),
                n = {
                    meta: e,
                    index: t
                };
            !1 !== Le.notify(this, "beforeDatasetUpdate", [n]) && (e.controller._update(), Le.notify(this, "afterDatasetUpdate", [n]))
        },
        render: function (t) {
            var e = this;
            t && "object" == typeof t || (t = {
                duration: t,
                lazy: arguments[1]
            });
            var n = e.options.animation,
                i = Ye(t.duration, n && n.duration),
                a = t.lazy;
            if (!1 !== Le.notify(e, "beforeRender")) {
                var r = function (t) {
                    Le.notify(e, "afterRender"), V.callback(n && n.onComplete, [t], e)
                };
                if (n && i) {
                    var o = new Z({
                        numSteps: i / 16.66,
                        easing: t.easing || n.easing,
                        render: function (t, e) {
                            var n = V.easing.effects[e.easing],
                                i = e.currentStep,
                                a = i / e.numSteps;
                            t.draw(n(a), a, i)
                        },
                        onAnimationProgress: n.onProgress,
                        onAnimationComplete: r
                    });
                    $.addAnimation(e, o, i, a)
                } else e.draw(), r(new Z({
                    numSteps: 0,
                    chart: e
                }));
                return e
            }
        },
        draw: function (t) {
            var e, n, i = this;
            if (i.clear(), V.isNullOrUndef(t) && (t = 1), i.transition(t), !(i.width <= 0 || i.height <= 0) && !1 !== Le.notify(i, "beforeDraw", [t])) {
                for (n = i._layers, e = 0; e < n.length && n[e].z <= 0; ++e) n[e].draw(i.chartArea);
                for (i.drawDatasets(t); e < n.length; ++e) n[e].draw(i.chartArea);
                i._drawTooltip(t), Le.notify(i, "afterDraw", [t])
            }
        },
        transition: function (t) {
            for (var e = 0, n = (this.data.datasets || []).length; e < n; ++e) this.isDatasetVisible(e) && this.getDatasetMeta(e).controller.transition(t);
            this.tooltip.transition(t)
        },
        _getSortedDatasetMetas: function (t) {
            var e, n, i = [];
            for (e = 0, n = (this.data.datasets || []).length; e < n; ++e) t && !this.isDatasetVisible(e) || i.push(this.getDatasetMeta(e));
            return i.sort(Je("order", "index")), i
        },
        _getSortedVisibleDatasetMetas: function () {
            return this._getSortedDatasetMetas(!0)
        },
        drawDatasets: function (t) {
            var e, n;
            if (!1 !== Le.notify(this, "beforeDatasetsDraw", [t])) {
                for (n = (e = this._getSortedVisibleDatasetMetas()).length - 1; n >= 0; --n) this.drawDataset(e[n], t);
                Le.notify(this, "afterDatasetsDraw", [t])
            }
        },
        drawDataset: function (t, e) {
            var n = {
                meta: t,
                index: t.index,
                easingValue: e
            };
            !1 !== Le.notify(this, "beforeDatasetDraw", [n]) && (t.controller.draw(e), Le.notify(this, "afterDatasetDraw", [n]))
        },
        _drawTooltip: function (t) {
            var e = this.tooltip,
                n = {
                    tooltip: e,
                    easingValue: t
                };
            !1 !== Le.notify(this, "beforeTooltipDraw", [n]) && (e.draw(), Le.notify(this, "afterTooltipDraw", [n]))
        },
        getElementAtEvent: function (t) {
            return ae.modes.single(this, t)
        },
        getElementsAtEvent: function (t) {
            return ae.modes.label(this, t, {
                intersect: !0
            })
        },
        getElementsAtXAxis: function (t) {
            return ae.modes["x-axis"](this, t, {
                intersect: !0
            })
        },
        getElementsAtEventForMode: function (t, e, n) {
            var i = ae.modes[e];
            return "function" == typeof i ? i(this, t, n) : []
        },
        getDatasetAtEvent: function (t) {
            return ae.modes.dataset(this, t, {
                intersect: !0
            })
        },
        getDatasetMeta: function (t) {
            var e = this.data.datasets[t];
            e._meta || (e._meta = {});
            var n = e._meta[this.id];
            return n || (n = e._meta[this.id] = {
                type: null,
                data: [],
                dataset: null,
                controller: null,
                hidden: null,
                xAxisID: null,
                yAxisID: null,
                order: e.order || 0,
                index: t
            }), n
        },
        getVisibleDatasetCount: function () {
            for (var t = 0, e = 0, n = this.data.datasets.length; e < n; ++e) this.isDatasetVisible(e) && t++;
            return t
        },
        isDatasetVisible: function (t) {
            var e = this.getDatasetMeta(t);
            return "boolean" == typeof e.hidden ? !e.hidden : !this.data.datasets[t].hidden
        },
        generateLegend: function () {
            return this.options.legendCallback(this)
        },
        destroyDatasetMeta: function (t) {
            var e = this.id,
                n = this.data.datasets[t],
                i = n._meta && n._meta[e];
            i && (i.controller.destroy(), delete n._meta[e])
        },
        destroy: function () {
            var t, e, n = this,
                i = n.canvas;
            for (n.stop(), t = 0, e = n.data.datasets.length; t < e; ++t) n.destroyDatasetMeta(t);
            i && (n.unbindEvents(), V.canvas.clear(n), Fe.releaseContext(n.ctx), n.canvas = null, n.ctx = null), Le.notify(n, "destroy"), delete Qe.instances[n.id]
        },
        toBase64Image: function () {
            return this.canvas.toDataURL.apply(this.canvas, arguments)
        },
        initToolTip: function () {
            var t = this;
            t.tooltip = new Ue({
                _chart: t,
                _chartInstance: t,
                _data: t.data,
                _options: t.options.tooltips
            }, t)
        },
        bindEvents: function () {
            var t = this,
                e = t._listeners = {},
                n = function () {
                    t.eventHandler.apply(t, arguments)
                };
            V.each(t.options.events, (function (i) {
                Fe.addEventListener(t, i, n), e[i] = n
            })), t.options.responsive && (n = function () {
                t.resize()
            }, Fe.addEventListener(t, "resize", n), e.resize = n)
        },
        unbindEvents: function () {
            var t = this,
                e = t._listeners;
            e && (delete t._listeners, V.each(e, (function (e, n) {
                Fe.removeEventListener(t, n, e)
            })))
        },
        updateHoverStyle: function (t, e, n) {
            var i, a, r, o = n ? "set" : "remove";
            for (a = 0, r = t.length; a < r; ++a)(i = t[a]) && this.getDatasetMeta(i._datasetIndex).controller[o + "HoverStyle"](i);
            "dataset" === e && this.getDatasetMeta(t[0]._datasetIndex).controller["_" + o + "DatasetHoverStyle"]()
        },
        eventHandler: function (t) {
            var e = this,
                n = e.tooltip;
            if (!1 !== Le.notify(e, "beforeEvent", [t])) {
                e._bufferedRender = !0, e._bufferedRequest = null;
                var i = e.handleEvent(t);
                n && (i = n._start ? n.handleEvent(t) : i | n.handleEvent(t)), Le.notify(e, "afterEvent", [t]);
                var a = e._bufferedRequest;
                return a ? e.render(a) : i && !e.animating && (e.stop(), e.render({
                    duration: e.options.hover.animationDuration,
                    lazy: !0
                })), e._bufferedRender = !1, e._bufferedRequest = null, e
            }
        },
        handleEvent: function (t) {
            var e, n = this,
                i = n.options || {},
                a = i.hover;
            return n.lastActive = n.lastActive || [], "mouseout" === t.type ? n.active = [] : n.active = n.getElementsAtEventForMode(t, a.mode, a), V.callback(i.onHover || i.hover.onHover, [t.native, n.active], n), "mouseup" !== t.type && "click" !== t.type || i.onClick && i.onClick.call(n, t.native, n.active), n.lastActive.length && n.updateHoverStyle(n.lastActive, a.mode, !1), n.active.length && a.mode && n.updateHoverStyle(n.active, a.mode, !0), e = !V.arrayEquals(n.active, n.lastActive), n.lastActive = n.active, e
        }
    }), Qe.instances = {};
    var tn = Qe;
    Qe.Controller = Qe, Qe.types = {}, V.configMerge = Xe, V.scaleMerge = Ge;

    function en() {
        throw new Error("This method is not implemented: either no adapter can be found or an incomplete integration was provided.")
    }

    function nn(t) {
        this.options = t || {}
    }
    V.extend(nn.prototype, {
        formats: en,
        parse: en,
        format: en,
        add: en,
        diff: en,
        startOf: en,
        endOf: en,
        _create: function (t) {
            return t
        }
    }), nn.override = function (t) {
        V.extend(nn.prototype, t)
    };
    var an = {
            _date: nn
        },
        rn = {
            formatters: {
                values: function (t) {
                    return V.isArray(t) ? t : "" + t
                },
                linear: function (t, e, n) {
                    var i = n.length > 3 ? n[2] - n[1] : n[1] - n[0];
                    Math.abs(i) > 1 && t !== Math.floor(t) && (i = t - Math.floor(t));
                    var a = V.log10(Math.abs(i)),
                        r = "";
                    if (0 !== t)
                        if (Math.max(Math.abs(n[0]), Math.abs(n[n.length - 1])) < 1e-4) {
                            var o = V.log10(Math.abs(t)),
                                s = Math.floor(o) - Math.floor(a);
                            s = Math.max(Math.min(s, 20), 0), r = t.toExponential(s)
                        } else {
                            var l = -1 * Math.floor(a);
                            l = Math.max(Math.min(l, 20), 0), r = t.toFixed(l)
                        }
                    else r = "0";
                    return r
                },
                logarithmic: function (t, e, n) {
                    var i = t / Math.pow(10, Math.floor(V.log10(t)));
                    return 0 === t ? "0" : 1 === i || 2 === i || 5 === i || 0 === e || e === n.length - 1 ? t.toExponential() : ""
                }
            }
        },
        on = V.isArray,
        sn = V.isNullOrUndef,
        ln = V.valueOrDefault,
        un = V.valueAtIndexOrDefault;

    function dn(t, e, n) {
        var i, a = t.getTicks().length,
            r = Math.min(e, a - 1),
            o = t.getPixelForTick(r),
            s = t._startPixel,
            l = t._endPixel;
        if (!(n && (i = 1 === a ? Math.max(o - s, l - o) : 0 === e ? (t.getPixelForTick(1) - o) / 2 : (o - t.getPixelForTick(r - 1)) / 2, (o += r < e ? i : -i) < s - 1e-6 || o > l + 1e-6))) return o
    }

    function hn(t, e, n, i) {
        var a, r, o, s, l, u, d, h, c, f, g, p, m, v = n.length,
            b = [],
            x = [],
            y = [];
        for (a = 0; a < v; ++a) {
            if (s = n[a].label, l = n[a].major ? e.major : e.minor, t.font = u = l.string, d = i[u] = i[u] || {
                    data: {},
                    gc: []
                }, h = l.lineHeight, c = f = 0, sn(s) || on(s)) {
                if (on(s))
                    for (r = 0, o = s.length; r < o; ++r) g = s[r], sn(g) || on(g) || (c = V.measureText(t, d.data, d.gc, c, g), f += h)
            } else c = V.measureText(t, d.data, d.gc, c, s), f = h;
            b.push(c), x.push(f), y.push(h / 2)
        }

        function _(t) {
            return {
                width: b[t] || 0,
                height: x[t] || 0,
                offset: y[t] || 0
            }
        }
        return function (t, e) {
            V.each(t, (function (t) {
                var n, i = t.gc,
                    a = i.length / 2;
                if (a > e) {
                    for (n = 0; n < a; ++n) delete t.data[i[n]];
                    i.splice(0, a)
                }
            }))
        }(i, v), p = b.indexOf(Math.max.apply(null, b)), m = x.indexOf(Math.max.apply(null, x)), {
            first: _(0),
            last: _(v - 1),
            widest: _(p),
            highest: _(m)
        }
    }

    function cn(t) {
        return t.drawTicks ? t.tickMarkLength : 0
    }

    function fn(t) {
        var e, n;
        return t.display ? (e = V.options._parseFont(t), n = V.options.toPadding(t.padding), e.lineHeight + n.height) : 0
    }

    function gn(t, e) {
        return V.extend(V.options._parseFont({
            fontFamily: ln(e.fontFamily, t.fontFamily),
            fontSize: ln(e.fontSize, t.fontSize),
            fontStyle: ln(e.fontStyle, t.fontStyle),
            lineHeight: ln(e.lineHeight, t.lineHeight)
        }), {
            color: V.options.resolve([e.fontColor, t.fontColor, z.global.defaultFontColor])
        })
    }

    function pn(t) {
        var e = gn(t, t.minor);
        return {
            minor: e,
            major: t.major.enabled ? gn(t, t.major) : e
        }
    }

    function mn(t) {
        var e, n, i, a = [];
        for (n = 0, i = t.length; n < i; ++n) void 0 !== (e = t[n])._index && a.push(e);
        return a
    }

    function vn(t, e, n, i) {
        var a, r, o, s, l = ln(n, 0),
            u = Math.min(ln(i, t.length), t.length),
            d = 0;
        for (e = Math.ceil(e), i && (e = (a = i - n) / Math.floor(a / e)), s = l; s < 0;) d++, s = Math.round(l + d * e);
        for (r = Math.max(l, 0); r < u; r++) o = t[r], r === s ? (o._index = r, d++, s = Math.round(l + d * e)) : delete o.label
    }
    z._set("scale", {
        display: !0,
        position: "left",
        offset: !1,
        gridLines: {
            display: !0,
            color: "rgba(0,0,0,0.1)",
            lineWidth: 1,
            drawBorder: !0,
            drawOnChartArea: !0,
            drawTicks: !0,
            tickMarkLength: 10,
            zeroLineWidth: 1,
            zeroLineColor: "rgba(0,0,0,0.25)",
            zeroLineBorderDash: [],
            zeroLineBorderDashOffset: 0,
            offsetGridLines: !1,
            borderDash: [],
            borderDashOffset: 0
        },
        scaleLabel: {
            display: !1,
            labelString: "",
            padding: {
                top: 4,
                bottom: 4
            }
        },
        ticks: {
            beginAtZero: !1,
            minRotation: 0,
            maxRotation: 50,
            mirror: !1,
            padding: 0,
            reverse: !1,
            display: !0,
            autoSkip: !0,
            autoSkipPadding: 0,
            labelOffset: 0,
            callback: rn.formatters.values,
            minor: {},
            major: {}
        }
    });
    var bn = X.extend({
        zeroLineIndex: 0,
        getPadding: function () {
            return {
                left: this.paddingLeft || 0,
                top: this.paddingTop || 0,
                right: this.paddingRight || 0,
                bottom: this.paddingBottom || 0
            }
        },
        getTicks: function () {
            return this._ticks
        },
        _getLabels: function () {
            var t = this.chart.data;
            return this.options.labels || (this.isHorizontal() ? t.xLabels : t.yLabels) || t.labels || []
        },
        mergeTicksOptions: function () {},
        beforeUpdate: function () {
            V.callback(this.options.beforeUpdate, [this])
        },
        update: function (t, e, n) {
            var i, a, r, o, s, l = this,
                u = l.options.ticks,
                d = u.sampleSize;
            if (l.beforeUpdate(), l.maxWidth = t, l.maxHeight = e, l.margins = V.extend({
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0
                }, n), l._ticks = null, l.ticks = null, l._labelSizes = null, l._maxLabelLines = 0, l.longestLabelWidth = 0, l.longestTextCache = l.longestTextCache || {}, l._gridLineItems = null, l._labelItems = null, l.beforeSetDimensions(), l.setDimensions(), l.afterSetDimensions(), l.beforeDataLimits(), l.determineDataLimits(), l.afterDataLimits(), l.beforeBuildTicks(), o = l.buildTicks() || [], (!(o = l.afterBuildTicks(o) || o) || !o.length) && l.ticks)
                for (o = [], i = 0, a = l.ticks.length; i < a; ++i) o.push({
                    value: l.ticks[i],
                    major: !1
                });
            return l._ticks = o, s = d < o.length, r = l._convertTicksToLabels(s ? function (t, e) {
                for (var n = [], i = t.length / e, a = 0, r = t.length; a < r; a += i) n.push(t[Math.floor(a)]);
                return n
            }(o, d) : o), l._configure(), l.beforeCalculateTickRotation(), l.calculateTickRotation(), l.afterCalculateTickRotation(), l.beforeFit(), l.fit(), l.afterFit(), l._ticksToDraw = u.display && (u.autoSkip || "auto" === u.source) ? l._autoSkip(o) : o, s && (r = l._convertTicksToLabels(l._ticksToDraw)), l.ticks = r, l.afterUpdate(), l.minSize
        },
        _configure: function () {
            var t, e, n = this,
                i = n.options.ticks.reverse;
            n.isHorizontal() ? (t = n.left, e = n.right) : (t = n.top, e = n.bottom, i = !i), n._startPixel = t, n._endPixel = e, n._reversePixels = i, n._length = e - t
        },
        afterUpdate: function () {
            V.callback(this.options.afterUpdate, [this])
        },
        beforeSetDimensions: function () {
            V.callback(this.options.beforeSetDimensions, [this])
        },
        setDimensions: function () {
            var t = this;
            t.isHorizontal() ? (t.width = t.maxWidth, t.left = 0, t.right = t.width) : (t.height = t.maxHeight, t.top = 0, t.bottom = t.height), t.paddingLeft = 0, t.paddingTop = 0, t.paddingRight = 0, t.paddingBottom = 0
        },
        afterSetDimensions: function () {
            V.callback(this.options.afterSetDimensions, [this])
        },
        beforeDataLimits: function () {
            V.callback(this.options.beforeDataLimits, [this])
        },
        determineDataLimits: V.noop,
        afterDataLimits: function () {
            V.callback(this.options.afterDataLimits, [this])
        },
        beforeBuildTicks: function () {
            V.callback(this.options.beforeBuildTicks, [this])
        },
        buildTicks: V.noop,
        afterBuildTicks: function (t) {
            var e = this;
            return on(t) && t.length ? V.callback(e.options.afterBuildTicks, [e, t]) : (e.ticks = V.callback(e.options.afterBuildTicks, [e, e.ticks]) || e.ticks, t)
        },
        beforeTickToLabelConversion: function () {
            V.callback(this.options.beforeTickToLabelConversion, [this])
        },
        convertTicksToLabels: function () {
            var t = this.options.ticks;
            this.ticks = this.ticks.map(t.userCallback || t.callback, this)
        },
        afterTickToLabelConversion: function () {
            V.callback(this.options.afterTickToLabelConversion, [this])
        },
        beforeCalculateTickRotation: function () {
            V.callback(this.options.beforeCalculateTickRotation, [this])
        },
        calculateTickRotation: function () {
            var t, e, n, i, a, r, o, s = this,
                l = s.options,
                u = l.ticks,
                d = s.getTicks().length,
                h = u.minRotation || 0,
                c = u.maxRotation,
                f = h;
            !s._isVisible() || !u.display || h >= c || d <= 1 || !s.isHorizontal() ? s.labelRotation = h : (e = (t = s._getLabelSizes()).widest.width, n = t.highest.height - t.highest.offset, i = Math.min(s.maxWidth, s.chart.width - e), e + 6 > (a = l.offset ? s.maxWidth / d : i / (d - 1)) && (a = i / (d - (l.offset ? .5 : 1)), r = s.maxHeight - cn(l.gridLines) - u.padding - fn(l.scaleLabel), o = Math.sqrt(e * e + n * n), f = V.toDegrees(Math.min(Math.asin(Math.min((t.highest.height + 6) / a, 1)), Math.asin(Math.min(r / o, 1)) - Math.asin(n / o))), f = Math.max(h, Math.min(c, f))), s.labelRotation = f)
        },
        afterCalculateTickRotation: function () {
            V.callback(this.options.afterCalculateTickRotation, [this])
        },
        beforeFit: function () {
            V.callback(this.options.beforeFit, [this])
        },
        fit: function () {
            var t = this,
                e = t.minSize = {
                    width: 0,
                    height: 0
                },
                n = t.chart,
                i = t.options,
                a = i.ticks,
                r = i.scaleLabel,
                o = i.gridLines,
                s = t._isVisible(),
                l = "bottom" === i.position,
                u = t.isHorizontal();
            if (u ? e.width = t.maxWidth : s && (e.width = cn(o) + fn(r)), u ? s && (e.height = cn(o) + fn(r)) : e.height = t.maxHeight, a.display && s) {
                var d = pn(a),
                    h = t._getLabelSizes(),
                    c = h.first,
                    f = h.last,
                    g = h.widest,
                    p = h.highest,
                    m = .4 * d.minor.lineHeight,
                    v = a.padding;
                if (u) {
                    var b = 0 !== t.labelRotation,
                        x = V.toRadians(t.labelRotation),
                        y = Math.cos(x),
                        _ = Math.sin(x),
                        k = _ * g.width + y * (p.height - (b ? p.offset : 0)) + (b ? 0 : m);
                    e.height = Math.min(t.maxHeight, e.height + k + v);
                    var w, M, S = t.getPixelForTick(0) - t.left,
                        C = t.right - t.getPixelForTick(t.getTicks().length - 1);
                    b ? (w = l ? y * c.width + _ * c.offset : _ * (c.height - c.offset), M = l ? _ * (f.height - f.offset) : y * f.width + _ * f.offset) : (w = c.width / 2, M = f.width / 2), t.paddingLeft = Math.max((w - S) * t.width / (t.width - S), 0) + 3, t.paddingRight = Math.max((M - C) * t.width / (t.width - C), 0) + 3
                } else {
                    var P = a.mirror ? 0 : g.width + v + m;
                    e.width = Math.min(t.maxWidth, e.width + P), t.paddingTop = c.height / 2, t.paddingBottom = f.height / 2
                }
            }
            t.handleMargins(), u ? (t.width = t._length = n.width - t.margins.left - t.margins.right, t.height = e.height) : (t.width = e.width, t.height = t._length = n.height - t.margins.top - t.margins.bottom)
        },
        handleMargins: function () {
            var t = this;
            t.margins && (t.margins.left = Math.max(t.paddingLeft, t.margins.left), t.margins.top = Math.max(t.paddingTop, t.margins.top), t.margins.right = Math.max(t.paddingRight, t.margins.right), t.margins.bottom = Math.max(t.paddingBottom, t.margins.bottom))
        },
        afterFit: function () {
            V.callback(this.options.afterFit, [this])
        },
        isHorizontal: function () {
            var t = this.options.position;
            return "top" === t || "bottom" === t
        },
        isFullWidth: function () {
            return this.options.fullWidth
        },
        getRightValue: function (t) {
            if (sn(t)) return NaN;
            if (("number" == typeof t || t instanceof Number) && !isFinite(t)) return NaN;
            if (t)
                if (this.isHorizontal()) {
                    if (void 0 !== t.x) return this.getRightValue(t.x)
                } else if (void 0 !== t.y) return this.getRightValue(t.y);
            return t
        },
        _convertTicksToLabels: function (t) {
            var e, n, i, a = this;
            for (a.ticks = t.map((function (t) {
                    return t.value
                })), a.beforeTickToLabelConversion(), e = a.convertTicksToLabels(t) || a.ticks, a.afterTickToLabelConversion(), n = 0, i = t.length; n < i; ++n) t[n].label = e[n];
            return e
        },
        _getLabelSizes: function () {
            var t = this,
                e = t._labelSizes;
            return e || (t._labelSizes = e = hn(t.ctx, pn(t.options.ticks), t.getTicks(), t.longestTextCache), t.longestLabelWidth = e.widest.width), e
        },
        _parseValue: function (t) {
            var e, n, i, a;
            return on(t) ? (e = +this.getRightValue(t[0]), n = +this.getRightValue(t[1]), i = Math.min(e, n), a = Math.max(e, n)) : (e = void 0, n = t = +this.getRightValue(t), i = t, a = t), {
                min: i,
                max: a,
                start: e,
                end: n
            }
        },
        _getScaleLabel: function (t) {
            var e = this._parseValue(t);
            return void 0 !== e.start ? "[" + e.start + ", " + e.end + "]" : +this.getRightValue(t)
        },
        getLabelForIndex: V.noop,
        getPixelForValue: V.noop,
        getValueForPixel: V.noop,
        getPixelForTick: function (t) {
            var e = this.options.offset,
                n = this._ticks.length,
                i = 1 / Math.max(n - (e ? 0 : 1), 1);
            return t < 0 || t > n - 1 ? null : this.getPixelForDecimal(t * i + (e ? i / 2 : 0))
        },
        getPixelForDecimal: function (t) {
            return this._reversePixels && (t = 1 - t), this._startPixel + t * this._length
        },
        getDecimalForPixel: function (t) {
            var e = (t - this._startPixel) / this._length;
            return this._reversePixels ? 1 - e : e
        },
        getBasePixel: function () {
            return this.getPixelForValue(this.getBaseValue())
        },
        getBaseValue: function () {
            var t = this.min,
                e = this.max;
            return this.beginAtZero ? 0 : t < 0 && e < 0 ? e : t > 0 && e > 0 ? t : 0
        },
        _autoSkip: function (t) {
            var e, n, i, a, r = this.options.ticks,
                o = this._length,
                s = r.maxTicksLimit || o / this._tickSize() + 1,
                l = r.major.enabled ? function (t) {
                    var e, n, i = [];
                    for (e = 0, n = t.length; e < n; e++) t[e].major && i.push(e);
                    return i
                }(t) : [],
                u = l.length,
                d = l[0],
                h = l[u - 1];
            if (u > s) return function (t, e, n) {
                var i, a, r = 0,
                    o = e[0];
                for (n = Math.ceil(n), i = 0; i < t.length; i++) a = t[i], i === o ? (a._index = i, o = e[++r * n]) : delete a.label
            }(t, l, u / s), mn(t);
            if (i = function (t, e, n, i) {
                    var a, r, o, s, l = function (t) {
                            var e, n, i = t.length;
                            if (i < 2) return !1;
                            for (n = t[0], e = 1; e < i; ++e)
                                if (t[e] - t[e - 1] !== n) return !1;
                            return n
                        }(t),
                        u = (e.length - 1) / i;
                    if (!l) return Math.max(u, 1);
                    for (o = 0, s = (a = V.math._factorize(l)).length - 1; o < s; o++)
                        if ((r = a[o]) > u) return r;
                    return Math.max(u, 1)
                }(l, t, 0, s), u > 0) {
                for (e = 0, n = u - 1; e < n; e++) vn(t, i, l[e], l[e + 1]);
                return a = u > 1 ? (h - d) / (u - 1) : null, vn(t, i, V.isNullOrUndef(a) ? 0 : d - a, d), vn(t, i, h, V.isNullOrUndef(a) ? t.length : h + a), mn(t)
            }
            return vn(t, i), mn(t)
        },
        _tickSize: function () {
            var t = this.options.ticks,
                e = V.toRadians(this.labelRotation),
                n = Math.abs(Math.cos(e)),
                i = Math.abs(Math.sin(e)),
                a = this._getLabelSizes(),
                r = t.autoSkipPadding || 0,
                o = a ? a.widest.width + r : 0,
                s = a ? a.highest.height + r : 0;
            return this.isHorizontal() ? s * n > o * i ? o / n : s / i : s * i < o * n ? s / n : o / i
        },
        _isVisible: function () {
            var t, e, n, i = this.chart,
                a = this.options.display;
            if ("auto" !== a) return !!a;
            for (t = 0, e = i.data.datasets.length; t < e; ++t)
                if (i.isDatasetVisible(t) && ((n = i.getDatasetMeta(t)).xAxisID === this.id || n.yAxisID === this.id)) return !0;
            return !1
        },
        _computeGridLineItems: function (t) {
            var e, n, i, a, r, o, s, l, u, d, h, c, f, g, p, m, v, b = this,
                x = b.chart,
                y = b.options,
                _ = y.gridLines,
                k = y.position,
                w = _.offsetGridLines,
                M = b.isHorizontal(),
                S = b._ticksToDraw,
                C = S.length + (w ? 1 : 0),
                P = cn(_),
                A = [],
                D = _.drawBorder ? un(_.lineWidth, 0, 0) : 0,
                T = D / 2,
                I = V._alignPixel,
                F = function (t) {
                    return I(x, t, D)
                };
            for ("top" === k ? (e = F(b.bottom), s = b.bottom - P, u = e - T, h = F(t.top) + T, f = t.bottom) : "bottom" === k ? (e = F(b.top), h = t.top, f = F(t.bottom) - T, s = e + T, u = b.top + P) : "left" === k ? (e = F(b.right), o = b.right - P, l = e - T, d = F(t.left) + T, c = t.right) : (e = F(b.left), d = t.left, c = F(t.right) - T, o = e + T, l = b.left + P), n = 0; n < C; ++n) i = S[n] || {}, sn(i.label) && n < S.length || (n === b.zeroLineIndex && y.offset === w ? (g = _.zeroLineWidth, p = _.zeroLineColor, m = _.zeroLineBorderDash || [], v = _.zeroLineBorderDashOffset || 0) : (g = un(_.lineWidth, n, 1), p = un(_.color, n, "rgba(0,0,0,0.1)"), m = _.borderDash || [], v = _.borderDashOffset || 0), void 0 !== (a = dn(b, i._index || n, w)) && (r = I(x, a, g), M ? o = l = d = c = r : s = u = h = f = r, A.push({
                tx1: o,
                ty1: s,
                tx2: l,
                ty2: u,
                x1: d,
                y1: h,
                x2: c,
                y2: f,
                width: g,
                color: p,
                borderDash: m,
                borderDashOffset: v
            })));
            return A.ticksLength = C, A.borderValue = e, A
        },
        _computeLabelItems: function () {
            var t, e, n, i, a, r, o, s, l, u, d, h, c = this,
                f = c.options,
                g = f.ticks,
                p = f.position,
                m = g.mirror,
                v = c.isHorizontal(),
                b = c._ticksToDraw,
                x = pn(g),
                y = g.padding,
                _ = cn(f.gridLines),
                k = -V.toRadians(c.labelRotation),
                w = [];
            for ("top" === p ? (r = c.bottom - _ - y, o = k ? "left" : "center") : "bottom" === p ? (r = c.top + _ + y, o = k ? "right" : "center") : "left" === p ? (a = c.right - (m ? 0 : _) - y, o = m ? "left" : "right") : (a = c.left + (m ? 0 : _) + y, o = m ? "right" : "left"), t = 0, e = b.length; t < e; ++t) i = (n = b[t]).label, sn(i) || (s = c.getPixelForTick(n._index || t) + g.labelOffset, u = (l = n.major ? x.major : x.minor).lineHeight, d = on(i) ? i.length : 1, v ? (a = s, h = "top" === p ? ((k ? 1 : .5) - d) * u : (k ? 0 : .5) * u) : (r = s, h = (1 - d) * u / 2), w.push({
                x: a,
                y: r,
                rotation: k,
                label: i,
                font: l,
                textOffset: h,
                textAlign: o
            }));
            return w
        },
        _drawGrid: function (t) {
            var e = this,
                n = e.options.gridLines;
            if (n.display) {
                var i, a, r, o, s, l = e.ctx,
                    u = e.chart,
                    d = V._alignPixel,
                    h = n.drawBorder ? un(n.lineWidth, 0, 0) : 0,
                    c = e._gridLineItems || (e._gridLineItems = e._computeGridLineItems(t));
                for (r = 0, o = c.length; r < o; ++r) i = (s = c[r]).width, a = s.color, i && a && (l.save(), l.lineWidth = i, l.strokeStyle = a, l.setLineDash && (l.setLineDash(s.borderDash), l.lineDashOffset = s.borderDashOffset), l.beginPath(), n.drawTicks && (l.moveTo(s.tx1, s.ty1), l.lineTo(s.tx2, s.ty2)), n.drawOnChartArea && (l.moveTo(s.x1, s.y1), l.lineTo(s.x2, s.y2)), l.stroke(), l.restore());
                if (h) {
                    var f, g, p, m, v = h,
                        b = un(n.lineWidth, c.ticksLength - 1, 1),
                        x = c.borderValue;
                    e.isHorizontal() ? (f = d(u, e.left, v) - v / 2, g = d(u, e.right, b) + b / 2, p = m = x) : (p = d(u, e.top, v) - v / 2, m = d(u, e.bottom, b) + b / 2, f = g = x), l.lineWidth = h, l.strokeStyle = un(n.color, 0), l.beginPath(), l.moveTo(f, p), l.lineTo(g, m), l.stroke()
                }
            }
        },
        _drawLabels: function () {
            var t = this;
            if (t.options.ticks.display) {
                var e, n, i, a, r, o, s, l, u = t.ctx,
                    d = t._labelItems || (t._labelItems = t._computeLabelItems());
                for (e = 0, i = d.length; e < i; ++e) {
                    if (o = (r = d[e]).font, u.save(), u.translate(r.x, r.y), u.rotate(r.rotation), u.font = o.string, u.fillStyle = o.color, u.textBaseline = "middle", u.textAlign = r.textAlign, s = r.label, l = r.textOffset, on(s))
                        for (n = 0, a = s.length; n < a; ++n) u.fillText("" + s[n], 0, l), l += o.lineHeight;
                    else u.fillText(s, 0, l);
                    u.restore()
                }
            }
        },
        _drawTitle: function () {
            var t = this,
                e = t.ctx,
                n = t.options,
                i = n.scaleLabel;
            if (i.display) {
                var a, r, o = ln(i.fontColor, z.global.defaultFontColor),
                    s = V.options._parseFont(i),
                    l = V.options.toPadding(i.padding),
                    u = s.lineHeight / 2,
                    d = n.position,
                    h = 0;
                if (t.isHorizontal()) a = t.left + t.width / 2, r = "bottom" === d ? t.bottom - u - l.bottom : t.top + u + l.top;
                else {
                    var c = "left" === d;
                    a = c ? t.left + u + l.top : t.right - u - l.top, r = t.top + t.height / 2, h = c ? -.5 * Math.PI : .5 * Math.PI
                }
                e.save(), e.translate(a, r), e.rotate(h), e.textAlign = "center", e.textBaseline = "middle", e.fillStyle = o, e.font = s.string, e.fillText(i.labelString, 0, 0), e.restore()
            }
        },
        draw: function (t) {
            this._isVisible() && (this._drawGrid(t), this._drawTitle(), this._drawLabels())
        },
        _layers: function () {
            var t = this,
                e = t.options,
                n = e.ticks && e.ticks.z || 0,
                i = e.gridLines && e.gridLines.z || 0;
            return t._isVisible() && n !== i && t.draw === t._draw ? [{
                z: i,
                draw: function () {
                    t._drawGrid.apply(t, arguments), t._drawTitle.apply(t, arguments)
                }
            }, {
                z: n,
                draw: function () {
                    t._drawLabels.apply(t, arguments)
                }
            }] : [{
                z: n,
                draw: function () {
                    t.draw.apply(t, arguments)
                }
            }]
        },
        _getMatchingVisibleMetas: function (t) {
            var e = this,
                n = e.isHorizontal();
            return e.chart._getSortedVisibleDatasetMetas().filter((function (i) {
                return (!t || i.type === t) && (n ? i.xAxisID === e.id : i.yAxisID === e.id)
            }))
        }
    });
    bn.prototype._draw = bn.prototype.draw;
    var xn = bn,
        yn = V.isNullOrUndef,
        _n = xn.extend({
            determineDataLimits: function () {
                var t, e = this,
                    n = e._getLabels(),
                    i = e.options.ticks,
                    a = i.min,
                    r = i.max,
                    o = 0,
                    s = n.length - 1;
                void 0 !== a && (t = n.indexOf(a)) >= 0 && (o = t), void 0 !== r && (t = n.indexOf(r)) >= 0 && (s = t), e.minIndex = o, e.maxIndex = s, e.min = n[o], e.max = n[s]
            },
            buildTicks: function () {
                var t = this._getLabels(),
                    e = this.minIndex,
                    n = this.maxIndex;
                this.ticks = 0 === e && n === t.length - 1 ? t : t.slice(e, n + 1)
            },
            getLabelForIndex: function (t, e) {
                var n = this.chart;
                return n.getDatasetMeta(e).controller._getValueScaleId() === this.id ? this.getRightValue(n.data.datasets[e].data[t]) : this._getLabels()[t]
            },
            _configure: function () {
                var t = this,
                    e = t.options.offset,
                    n = t.ticks;
                xn.prototype._configure.call(t), t.isHorizontal() || (t._reversePixels = !t._reversePixels), n && (t._startValue = t.minIndex - (e ? .5 : 0), t._valueRange = Math.max(n.length - (e ? 0 : 1), 1))
            },
            getPixelForValue: function (t, e, n) {
                var i, a, r, o = this;
                return yn(e) || yn(n) || (t = o.chart.data.datasets[n].data[e]), yn(t) || (i = o.isHorizontal() ? t.x : t.y), (void 0 !== i || void 0 !== t && isNaN(e)) && (a = o._getLabels(), t = V.valueOrDefault(i, t), e = -1 !== (r = a.indexOf(t)) ? r : e, isNaN(e) && (e = t)), o.getPixelForDecimal((e - o._startValue) / o._valueRange)
            },
            getPixelForTick: function (t) {
                var e = this.ticks;
                return t < 0 || t > e.length - 1 ? null : this.getPixelForValue(e[t], t + this.minIndex)
            },
            getValueForPixel: function (t) {
                var e = Math.round(this._startValue + this.getDecimalForPixel(t) * this._valueRange);
                return Math.min(Math.max(e, 0), this.ticks.length - 1)
            },
            getBasePixel: function () {
                return this.bottom
            }
        }),
        kn = {
            position: "bottom"
        };
    _n._defaults = kn;
    var wn = V.noop,
        Mn = V.isNullOrUndef;
    var Sn = xn.extend({
            getRightValue: function (t) {
                return "string" == typeof t ? +t : xn.prototype.getRightValue.call(this, t)
            },
            handleTickRangeOptions: function () {
                var t = this,
                    e = t.options.ticks;
                if (e.beginAtZero) {
                    var n = V.sign(t.min),
                        i = V.sign(t.max);
                    n < 0 && i < 0 ? t.max = 0 : n > 0 && i > 0 && (t.min = 0)
                }
                var a = void 0 !== e.min || void 0 !== e.suggestedMin,
                    r = void 0 !== e.max || void 0 !== e.suggestedMax;
                void 0 !== e.min ? t.min = e.min : void 0 !== e.suggestedMin && (null === t.min ? t.min = e.suggestedMin : t.min = Math.min(t.min, e.suggestedMin)), void 0 !== e.max ? t.max = e.max : void 0 !== e.suggestedMax && (null === t.max ? t.max = e.suggestedMax : t.max = Math.max(t.max, e.suggestedMax)), a !== r && t.min >= t.max && (a ? t.max = t.min + 1 : t.min = t.max - 1), t.min === t.max && (t.max++, e.beginAtZero || t.min--)
            },
            getTickLimit: function () {
                var t, e = this.options.ticks,
                    n = e.stepSize,
                    i = e.maxTicksLimit;
                return n ? t = Math.ceil(this.max / n) - Math.floor(this.min / n) + 1 : (t = this._computeTickLimit(), i = i || 11), i && (t = Math.min(i, t)), t
            },
            _computeTickLimit: function () {
                return Number.POSITIVE_INFINITY
            },
            handleDirectionalChanges: wn,
            buildTicks: function () {
                var t = this,
                    e = t.options.ticks,
                    n = t.getTickLimit(),
                    i = {
                        maxTicks: n = Math.max(2, n),
                        min: e.min,
                        max: e.max,
                        precision: e.precision,
                        stepSize: V.valueOrDefault(e.fixedStepSize, e.stepSize)
                    },
                    a = t.ticks = function (t, e) {
                        var n, i, a, r, o = [],
                            s = t.stepSize,
                            l = s || 1,
                            u = t.maxTicks - 1,
                            d = t.min,
                            h = t.max,
                            c = t.precision,
                            f = e.min,
                            g = e.max,
                            p = V.niceNum((g - f) / u / l) * l;
                        if (p < 1e-14 && Mn(d) && Mn(h)) return [f, g];
                        (r = Math.ceil(g / p) - Math.floor(f / p)) > u && (p = V.niceNum(r * p / u / l) * l), s || Mn(c) ? n = Math.pow(10, V._decimalPlaces(p)) : (n = Math.pow(10, c), p = Math.ceil(p * n) / n), i = Math.floor(f / p) * p, a = Math.ceil(g / p) * p, s && (!Mn(d) && V.almostWhole(d / p, p / 1e3) && (i = d), !Mn(h) && V.almostWhole(h / p, p / 1e3) && (a = h)), r = (a - i) / p, r = V.almostEquals(r, Math.round(r), p / 1e3) ? Math.round(r) : Math.ceil(r), i = Math.round(i * n) / n, a = Math.round(a * n) / n, o.push(Mn(d) ? i : d);
                        for (var m = 1; m < r; ++m) o.push(Math.round((i + m * p) * n) / n);
                        return o.push(Mn(h) ? a : h), o
                    }(i, t);
                t.handleDirectionalChanges(), t.max = V.max(a), t.min = V.min(a), e.reverse ? (a.reverse(), t.start = t.max, t.end = t.min) : (t.start = t.min, t.end = t.max)
            },
            convertTicksToLabels: function () {
                var t = this;
                t.ticksAsNumbers = t.ticks.slice(), t.zeroLineIndex = t.ticks.indexOf(0), xn.prototype.convertTicksToLabels.call(t)
            },
            _configure: function () {
                var t, e = this,
                    n = e.getTicks(),
                    i = e.min,
                    a = e.max;
                xn.prototype._configure.call(e), e.options.offset && n.length && (i -= t = (a - i) / Math.max(n.length - 1, 1) / 2, a += t), e._startValue = i, e._endValue = a, e._valueRange = a - i
            }
        }),
        Cn = {
            position: "left",
            ticks: {
                callback: rn.formatters.linear
            }
        };

    function Pn(t, e, n, i) {
        var a, r, o = t.options,
            s = function (t, e, n) {
                var i = [n.type, void 0 === e && void 0 === n.stack ? n.index : "", n.stack].join(".");
                return void 0 === t[i] && (t[i] = {
                    pos: [],
                    neg: []
                }), t[i]
            }(e, o.stacked, n),
            l = s.pos,
            u = s.neg,
            d = i.length;
        for (a = 0; a < d; ++a) r = t._parseValue(i[a]), isNaN(r.min) || isNaN(r.max) || n.data[a].hidden || (l[a] = l[a] || 0, u[a] = u[a] || 0, o.relativePoints ? l[a] = 100 : r.min < 0 || r.max < 0 ? u[a] += r.min : l[a] += r.max)
    }

    function An(t, e, n) {
        var i, a, r = n.length;
        for (i = 0; i < r; ++i) a = t._parseValue(n[i]), isNaN(a.min) || isNaN(a.max) || e.data[i].hidden || (t.min = Math.min(t.min, a.min), t.max = Math.max(t.max, a.max))
    }
    var Dn = Sn.extend({
            determineDataLimits: function () {
                var t, e, n, i, a = this,
                    r = a.options,
                    o = a.chart.data.datasets,
                    s = a._getMatchingVisibleMetas(),
                    l = r.stacked,
                    u = {},
                    d = s.length;
                if (a.min = Number.POSITIVE_INFINITY, a.max = Number.NEGATIVE_INFINITY, void 0 === l)
                    for (t = 0; !l && t < d; ++t) l = void 0 !== (e = s[t]).stack;
                for (t = 0; t < d; ++t) n = o[(e = s[t]).index].data, l ? Pn(a, u, e, n) : An(a, e, n);
                V.each(u, (function (t) {
                    i = t.pos.concat(t.neg), a.min = Math.min(a.min, V.min(i)), a.max = Math.max(a.max, V.max(i))
                })), a.min = V.isFinite(a.min) && !isNaN(a.min) ? a.min : 0, a.max = V.isFinite(a.max) && !isNaN(a.max) ? a.max : 1, a.handleTickRangeOptions()
            },
            _computeTickLimit: function () {
                var t;
                return this.isHorizontal() ? Math.ceil(this.width / 40) : (t = V.options._parseFont(this.options.ticks), Math.ceil(this.height / t.lineHeight))
            },
            handleDirectionalChanges: function () {
                this.isHorizontal() || this.ticks.reverse()
            },
            getLabelForIndex: function (t, e) {
                return this._getScaleLabel(this.chart.data.datasets[e].data[t])
            },
            getPixelForValue: function (t) {
                return this.getPixelForDecimal((+this.getRightValue(t) - this._startValue) / this._valueRange)
            },
            getValueForPixel: function (t) {
                return this._startValue + this.getDecimalForPixel(t) * this._valueRange
            },
            getPixelForTick: function (t) {
                var e = this.ticksAsNumbers;
                return t < 0 || t > e.length - 1 ? null : this.getPixelForValue(e[t])
            }
        }),
        Tn = Cn;
    Dn._defaults = Tn;
    var In = V.valueOrDefault,
        Fn = V.math.log10;
    var Ln = {
        position: "left",
        ticks: {
            callback: rn.formatters.logarithmic
        }
    };

    function On(t, e) {
        return V.isFinite(t) && t >= 0 ? t : e
    }
    var Rn = xn.extend({
            determineDataLimits: function () {
                var t, e, n, i, a, r, o = this,
                    s = o.options,
                    l = o.chart,
                    u = l.data.datasets,
                    d = o.isHorizontal();

                function h(t) {
                    return d ? t.xAxisID === o.id : t.yAxisID === o.id
                }
                o.min = Number.POSITIVE_INFINITY, o.max = Number.NEGATIVE_INFINITY, o.minNotZero = Number.POSITIVE_INFINITY;
                var c = s.stacked;
                if (void 0 === c)
                    for (t = 0; t < u.length; t++)
                        if (e = l.getDatasetMeta(t), l.isDatasetVisible(t) && h(e) && void 0 !== e.stack) {
                            c = !0;
                            break
                        } if (s.stacked || c) {
                    var f = {};
                    for (t = 0; t < u.length; t++) {
                        var g = [(e = l.getDatasetMeta(t)).type, void 0 === s.stacked && void 0 === e.stack ? t : "", e.stack].join(".");
                        if (l.isDatasetVisible(t) && h(e))
                            for (void 0 === f[g] && (f[g] = []), a = 0, r = (i = u[t].data).length; a < r; a++) {
                                var p = f[g];
                                n = o._parseValue(i[a]), isNaN(n.min) || isNaN(n.max) || e.data[a].hidden || n.min < 0 || n.max < 0 || (p[a] = p[a] || 0, p[a] += n.max)
                            }
                    }
                    V.each(f, (function (t) {
                        if (t.length > 0) {
                            var e = V.min(t),
                                n = V.max(t);
                            o.min = Math.min(o.min, e), o.max = Math.max(o.max, n)
                        }
                    }))
                } else
                    for (t = 0; t < u.length; t++)
                        if (e = l.getDatasetMeta(t), l.isDatasetVisible(t) && h(e))
                            for (a = 0, r = (i = u[t].data).length; a < r; a++) n = o._parseValue(i[a]), isNaN(n.min) || isNaN(n.max) || e.data[a].hidden || n.min < 0 || n.max < 0 || (o.min = Math.min(n.min, o.min), o.max = Math.max(n.max, o.max), 0 !== n.min && (o.minNotZero = Math.min(n.min, o.minNotZero)));
                o.min = V.isFinite(o.min) ? o.min : null, o.max = V.isFinite(o.max) ? o.max : null, o.minNotZero = V.isFinite(o.minNotZero) ? o.minNotZero : null, this.handleTickRangeOptions()
            },
            handleTickRangeOptions: function () {
                var t = this,
                    e = t.options.ticks;
                t.min = On(e.min, t.min), t.max = On(e.max, t.max), t.min === t.max && (0 !== t.min && null !== t.min ? (t.min = Math.pow(10, Math.floor(Fn(t.min)) - 1), t.max = Math.pow(10, Math.floor(Fn(t.max)) + 1)) : (t.min = 1, t.max = 10)), null === t.min && (t.min = Math.pow(10, Math.floor(Fn(t.max)) - 1)), null === t.max && (t.max = 0 !== t.min ? Math.pow(10, Math.floor(Fn(t.min)) + 1) : 10), null === t.minNotZero && (t.min > 0 ? t.minNotZero = t.min : t.max < 1 ? t.minNotZero = Math.pow(10, Math.floor(Fn(t.max))) : t.minNotZero = 1)
            },
            buildTicks: function () {
                var t = this,
                    e = t.options.ticks,
                    n = !t.isHorizontal(),
                    i = {
                        min: On(e.min),
                        max: On(e.max)
                    },
                    a = t.ticks = function (t, e) {
                        var n, i, a = [],
                            r = In(t.min, Math.pow(10, Math.floor(Fn(e.min)))),
                            o = Math.floor(Fn(e.max)),
                            s = Math.ceil(e.max / Math.pow(10, o));
                        0 === r ? (n = Math.floor(Fn(e.minNotZero)), i = Math.floor(e.minNotZero / Math.pow(10, n)), a.push(r), r = i * Math.pow(10, n)) : (n = Math.floor(Fn(r)), i = Math.floor(r / Math.pow(10, n)));
                        var l = n < 0 ? Math.pow(10, Math.abs(n)) : 1;
                        do {
                            a.push(r), 10 === ++i && (i = 1, l = ++n >= 0 ? 1 : l), r = Math.round(i * Math.pow(10, n) * l) / l
                        } while (n < o || n === o && i < s);
                        var u = In(t.max, r);
                        return a.push(u), a
                    }(i, t);
                t.max = V.max(a), t.min = V.min(a), e.reverse ? (n = !n, t.start = t.max, t.end = t.min) : (t.start = t.min, t.end = t.max), n && a.reverse()
            },
            convertTicksToLabels: function () {
                this.tickValues = this.ticks.slice(), xn.prototype.convertTicksToLabels.call(this)
            },
            getLabelForIndex: function (t, e) {
                return this._getScaleLabel(this.chart.data.datasets[e].data[t])
            },
            getPixelForTick: function (t) {
                var e = this.tickValues;
                return t < 0 || t > e.length - 1 ? null : this.getPixelForValue(e[t])
            },
            _getFirstTickValue: function (t) {
                var e = Math.floor(Fn(t));
                return Math.floor(t / Math.pow(10, e)) * Math.pow(10, e)
            },
            _configure: function () {
                var t = this,
                    e = t.min,
                    n = 0;
                xn.prototype._configure.call(t), 0 === e && (e = t._getFirstTickValue(t.minNotZero), n = In(t.options.ticks.fontSize, z.global.defaultFontSize) / t._length), t._startValue = Fn(e), t._valueOffset = n, t._valueRange = (Fn(t.max) - Fn(e)) / (1 - n)
            },
            getPixelForValue: function (t) {
                var e = this,
                    n = 0;
                return (t = +e.getRightValue(t)) > e.min && t > 0 && (n = (Fn(t) - e._startValue) / e._valueRange + e._valueOffset), e.getPixelForDecimal(n)
            },
            getValueForPixel: function (t) {
                var e = this,
                    n = e.getDecimalForPixel(t);
                return 0 === n && 0 === e.min ? 0 : Math.pow(10, e._startValue + (n - e._valueOffset) * e._valueRange)
            }
        }),
        zn = Ln;
    Rn._defaults = zn;
    var Nn = V.valueOrDefault,
        Bn = V.valueAtIndexOrDefault,
        En = V.options.resolve,
        Wn = {
            display: !0,
            animate: !0,
            position: "chartArea",
            angleLines: {
                display: !0,
                color: "rgba(0,0,0,0.1)",
                lineWidth: 1,
                borderDash: [],
                borderDashOffset: 0
            },
            gridLines: {
                circular: !1
            },
            ticks: {
                showLabelBackdrop: !0,
                backdropColor: "rgba(255,255,255,0.75)",
                backdropPaddingY: 2,
                backdropPaddingX: 2,
                callback: rn.formatters.linear
            },
            pointLabels: {
                display: !0,
                fontSize: 10,
                callback: function (t) {
                    return t
                }
            }
        };

    function Vn(t) {
        var e = t.ticks;
        return e.display && t.display ? Nn(e.fontSize, z.global.defaultFontSize) + 2 * e.backdropPaddingY : 0
    }

    function Hn(t, e, n, i, a) {
        return t === i || t === a ? {
            start: e - n / 2,
            end: e + n / 2
        } : t < i || t > a ? {
            start: e - n,
            end: e
        } : {
            start: e,
            end: e + n
        }
    }

    function jn(t) {
        return 0 === t || 180 === t ? "center" : t < 180 ? "left" : "right"
    }

    function qn(t, e, n, i) {
        var a, r, o = n.y + i / 2;
        if (V.isArray(e))
            for (a = 0, r = e.length; a < r; ++a) t.fillText(e[a], n.x, o), o += i;
        else t.fillText(e, n.x, o)
    }

    function Un(t, e, n) {
        90 === t || 270 === t ? n.y -= e.h / 2 : (t > 270 || t < 90) && (n.y -= e.h)
    }

    function Yn(t) {
        return V.isNumber(t) ? t : 0
    }
    var Gn = Sn.extend({
            setDimensions: function () {
                var t = this;
                t.width = t.maxWidth, t.height = t.maxHeight, t.paddingTop = Vn(t.options) / 2, t.xCenter = Math.floor(t.width / 2), t.yCenter = Math.floor((t.height - t.paddingTop) / 2), t.drawingArea = Math.min(t.height - t.paddingTop, t.width) / 2
            },
            determineDataLimits: function () {
                var t = this,
                    e = t.chart,
                    n = Number.POSITIVE_INFINITY,
                    i = Number.NEGATIVE_INFINITY;
                V.each(e.data.datasets, (function (a, r) {
                    if (e.isDatasetVisible(r)) {
                        var o = e.getDatasetMeta(r);
                        V.each(a.data, (function (e, a) {
                            var r = +t.getRightValue(e);
                            isNaN(r) || o.data[a].hidden || (n = Math.min(r, n), i = Math.max(r, i))
                        }))
                    }
                })), t.min = n === Number.POSITIVE_INFINITY ? 0 : n, t.max = i === Number.NEGATIVE_INFINITY ? 0 : i, t.handleTickRangeOptions()
            },
            _computeTickLimit: function () {
                return Math.ceil(this.drawingArea / Vn(this.options))
            },
            convertTicksToLabels: function () {
                var t = this;
                Sn.prototype.convertTicksToLabels.call(t), t.pointLabels = t.chart.data.labels.map((function () {
                    var e = V.callback(t.options.pointLabels.callback, arguments, t);
                    return e || 0 === e ? e : ""
                }))
            },
            getLabelForIndex: function (t, e) {
                return +this.getRightValue(this.chart.data.datasets[e].data[t])
            },
            fit: function () {
                var t = this.options;
                t.display && t.pointLabels.display ? function (t) {
                    var e, n, i, a = V.options._parseFont(t.options.pointLabels),
                        r = {
                            l: 0,
                            r: t.width,
                            t: 0,
                            b: t.height - t.paddingTop
                        },
                        o = {};
                    t.ctx.font = a.string, t._pointLabelSizes = [];
                    var s, l, u, d = t.chart.data.labels.length;
                    for (e = 0; e < d; e++) {
                        i = t.getPointPosition(e, t.drawingArea + 5), s = t.ctx, l = a.lineHeight, u = t.pointLabels[e], n = V.isArray(u) ? {
                            w: V.longestText(s, s.font, u),
                            h: u.length * l
                        } : {
                            w: s.measureText(u).width,
                            h: l
                        }, t._pointLabelSizes[e] = n;
                        var h = t.getIndexAngle(e),
                            c = V.toDegrees(h) % 360,
                            f = Hn(c, i.x, n.w, 0, 180),
                            g = Hn(c, i.y, n.h, 90, 270);
                        f.start < r.l && (r.l = f.start, o.l = h), f.end > r.r && (r.r = f.end, o.r = h), g.start < r.t && (r.t = g.start, o.t = h), g.end > r.b && (r.b = g.end, o.b = h)
                    }
                    t.setReductions(t.drawingArea, r, o)
                }(this) : this.setCenterPoint(0, 0, 0, 0)
            },
            setReductions: function (t, e, n) {
                var i = this,
                    a = e.l / Math.sin(n.l),
                    r = Math.max(e.r - i.width, 0) / Math.sin(n.r),
                    o = -e.t / Math.cos(n.t),
                    s = -Math.max(e.b - (i.height - i.paddingTop), 0) / Math.cos(n.b);
                a = Yn(a), r = Yn(r), o = Yn(o), s = Yn(s), i.drawingArea = Math.min(Math.floor(t - (a + r) / 2), Math.floor(t - (o + s) / 2)), i.setCenterPoint(a, r, o, s)
            },
            setCenterPoint: function (t, e, n, i) {
                var a = this,
                    r = a.width - e - a.drawingArea,
                    o = t + a.drawingArea,
                    s = n + a.drawingArea,
                    l = a.height - a.paddingTop - i - a.drawingArea;
                a.xCenter = Math.floor((o + r) / 2 + a.left), a.yCenter = Math.floor((s + l) / 2 + a.top + a.paddingTop)
            },
            getIndexAngle: function (t) {
                var e = this.chart,
                    n = (t * (360 / e.data.labels.length) + ((e.options || {}).startAngle || 0)) % 360;
                return (n < 0 ? n + 360 : n) * Math.PI * 2 / 360
            },
            getDistanceFromCenterForValue: function (t) {
                var e = this;
                if (V.isNullOrUndef(t)) return NaN;
                var n = e.drawingArea / (e.max - e.min);
                return e.options.ticks.reverse ? (e.max - t) * n : (t - e.min) * n
            },
            getPointPosition: function (t, e) {
                var n = this.getIndexAngle(t) - Math.PI / 2;
                return {
                    x: Math.cos(n) * e + this.xCenter,
                    y: Math.sin(n) * e + this.yCenter
                }
            },
            getPointPositionForValue: function (t, e) {
                return this.getPointPosition(t, this.getDistanceFromCenterForValue(e))
            },
            getBasePosition: function (t) {
                var e = this.min,
                    n = this.max;
                return this.getPointPositionForValue(t || 0, this.beginAtZero ? 0 : e < 0 && n < 0 ? n : e > 0 && n > 0 ? e : 0)
            },
            _drawGrid: function () {
                var t, e, n, i = this,
                    a = i.ctx,
                    r = i.options,
                    o = r.gridLines,
                    s = r.angleLines,
                    l = Nn(s.lineWidth, o.lineWidth),
                    u = Nn(s.color, o.color);
                if (r.pointLabels.display && function (t) {
                        var e = t.ctx,
                            n = t.options,
                            i = n.pointLabels,
                            a = Vn(n),
                            r = t.getDistanceFromCenterForValue(n.ticks.reverse ? t.min : t.max),
                            o = V.options._parseFont(i);
                        e.save(), e.font = o.string, e.textBaseline = "middle";
                        for (var s = t.chart.data.labels.length - 1; s >= 0; s--) {
                            var l = 0 === s ? a / 2 : 0,
                                u = t.getPointPosition(s, r + l + 5),
                                d = Bn(i.fontColor, s, z.global.defaultFontColor);
                            e.fillStyle = d;
                            var h = t.getIndexAngle(s),
                                c = V.toDegrees(h);
                            e.textAlign = jn(c), Un(c, t._pointLabelSizes[s], u), qn(e, t.pointLabels[s], u, o.lineHeight)
                        }
                        e.restore()
                    }(i), o.display && V.each(i.ticks, (function (t, n) {
                        0 !== n && (e = i.getDistanceFromCenterForValue(i.ticksAsNumbers[n]), function (t, e, n, i) {
                            var a, r = t.ctx,
                                o = e.circular,
                                s = t.chart.data.labels.length,
                                l = Bn(e.color, i - 1),
                                u = Bn(e.lineWidth, i - 1);
                            if ((o || s) && l && u) {
                                if (r.save(), r.strokeStyle = l, r.lineWidth = u, r.setLineDash && (r.setLineDash(e.borderDash || []), r.lineDashOffset = e.borderDashOffset || 0), r.beginPath(), o) r.arc(t.xCenter, t.yCenter, n, 0, 2 * Math.PI);
                                else {
                                    a = t.getPointPosition(0, n), r.moveTo(a.x, a.y);
                                    for (var d = 1; d < s; d++) a = t.getPointPosition(d, n), r.lineTo(a.x, a.y)
                                }
                                r.closePath(), r.stroke(), r.restore()
                            }
                        }(i, o, e, n))
                    })), s.display && l && u) {
                    for (a.save(), a.lineWidth = l, a.strokeStyle = u, a.setLineDash && (a.setLineDash(En([s.borderDash, o.borderDash, []])), a.lineDashOffset = En([s.borderDashOffset, o.borderDashOffset, 0])), t = i.chart.data.labels.length - 1; t >= 0; t--) e = i.getDistanceFromCenterForValue(r.ticks.reverse ? i.min : i.max), n = i.getPointPosition(t, e), a.beginPath(), a.moveTo(i.xCenter, i.yCenter), a.lineTo(n.x, n.y), a.stroke();
                    a.restore()
                }
            },
            _drawLabels: function () {
                var t = this,
                    e = t.ctx,
                    n = t.options.ticks;
                if (n.display) {
                    var i, a, r = t.getIndexAngle(0),
                        o = V.options._parseFont(n),
                        s = Nn(n.fontColor, z.global.defaultFontColor);
                    e.save(), e.font = o.string, e.translate(t.xCenter, t.yCenter), e.rotate(r), e.textAlign = "center", e.textBaseline = "middle", V.each(t.ticks, (function (r, l) {
                        (0 !== l || n.reverse) && (i = t.getDistanceFromCenterForValue(t.ticksAsNumbers[l]), n.showLabelBackdrop && (a = e.measureText(r).width, e.fillStyle = n.backdropColor, e.fillRect(-a / 2 - n.backdropPaddingX, -i - o.size / 2 - n.backdropPaddingY, a + 2 * n.backdropPaddingX, o.size + 2 * n.backdropPaddingY)), e.fillStyle = s, e.fillText(r, 0, -i))
                    })), e.restore()
                }
            },
            _drawTitle: V.noop
        }),
        Xn = Wn;
    Gn._defaults = Xn;
    var Kn = V._deprecated,
        Zn = V.options.resolve,
        $n = V.valueOrDefault,
        Jn = Number.MIN_SAFE_INTEGER || -9007199254740991,
        Qn = Number.MAX_SAFE_INTEGER || 9007199254740991,
        ti = {
            millisecond: {
                common: !0,
                size: 1,
                steps: 1e3
            },
            second: {
                common: !0,
                size: 1e3,
                steps: 60
            },
            minute: {
                common: !0,
                size: 6e4,
                steps: 60
            },
            hour: {
                common: !0,
                size: 36e5,
                steps: 24
            },
            day: {
                common: !0,
                size: 864e5,
                steps: 30
            },
            week: {
                common: !1,
                size: 6048e5,
                steps: 4
            },
            month: {
                common: !0,
                size: 2628e6,
                steps: 12
            },
            quarter: {
                common: !1,
                size: 7884e6,
                steps: 4
            },
            year: {
                common: !0,
                size: 3154e7
            }
        },
        ei = Object.keys(ti);

    function ni(t, e) {
        return t - e
    }

    function ii(t) {
        return V.valueOrDefault(t.time.min, t.ticks.min)
    }

    function ai(t) {
        return V.valueOrDefault(t.time.max, t.ticks.max)
    }

    function ri(t, e, n, i) {
        var a = function (t, e, n) {
                for (var i, a, r, o = 0, s = t.length - 1; o >= 0 && o <= s;) {
                    if (a = t[(i = o + s >> 1) - 1] || null, r = t[i], !a) return {
                        lo: null,
                        hi: r
                    };
                    if (r[e] < n) o = i + 1;
                    else {
                        if (!(a[e] > n)) return {
                            lo: a,
                            hi: r
                        };
                        s = i - 1
                    }
                }
                return {
                    lo: r,
                    hi: null
                }
            }(t, e, n),
            r = a.lo ? a.hi ? a.lo : t[t.length - 2] : t[0],
            o = a.lo ? a.hi ? a.hi : t[t.length - 1] : t[1],
            s = o[e] - r[e],
            l = s ? (n - r[e]) / s : 0,
            u = (o[i] - r[i]) * l;
        return r[i] + u
    }

    function oi(t, e) {
        var n = t._adapter,
            i = t.options.time,
            a = i.parser,
            r = a || i.format,
            o = e;
        return "function" == typeof a && (o = a(o)), V.isFinite(o) || (o = "string" == typeof r ? n.parse(o, r) : n.parse(o)), null !== o ? +o : (a || "function" != typeof r || (o = r(e), V.isFinite(o) || (o = n.parse(o))), o)
    }

    function si(t, e) {
        if (V.isNullOrUndef(e)) return null;
        var n = t.options.time,
            i = oi(t, t.getRightValue(e));
        return null === i ? i : (n.round && (i = +t._adapter.startOf(i, n.round)), i)
    }

    function li(t, e, n, i) {
        var a, r, o, s = ei.length;
        for (a = ei.indexOf(t); a < s - 1; ++a)
            if (o = (r = ti[ei[a]]).steps ? r.steps : Qn, r.common && Math.ceil((n - e) / (o * r.size)) <= i) return ei[a];
        return ei[s - 1]
    }

    function ui(t, e, n) {
        var i, a, r = [],
            o = {},
            s = e.length;
        for (i = 0; i < s; ++i) o[a = e[i]] = i, r.push({
            value: a,
            major: !1
        });
        return 0 !== s && n ? function (t, e, n, i) {
            var a, r, o = t._adapter,
                s = +o.startOf(e[0].value, i),
                l = e[e.length - 1].value;
            for (a = s; a <= l; a = +o.add(a, 1, i))(r = n[a]) >= 0 && (e[r].major = !0);
            return e
        }(t, r, o, n) : r
    }
    var di = xn.extend({
            initialize: function () {
                this.mergeTicksOptions(), xn.prototype.initialize.call(this)
            },
            update: function () {
                var t = this,
                    e = t.options,
                    n = e.time || (e.time = {}),
                    i = t._adapter = new an._date(e.adapters.date);
                return Kn("time scale", n.format, "time.format", "time.parser"), Kn("time scale", n.min, "time.min", "ticks.min"), Kn("time scale", n.max, "time.max", "ticks.max"), V.mergeIf(n.displayFormats, i.formats()), xn.prototype.update.apply(t, arguments)
            },
            getRightValue: function (t) {
                return t && void 0 !== t.t && (t = t.t), xn.prototype.getRightValue.call(this, t)
            },
            determineDataLimits: function () {
                var t, e, n, i, a, r, o, s = this,
                    l = s.chart,
                    u = s._adapter,
                    d = s.options,
                    h = d.time.unit || "day",
                    c = Qn,
                    f = Jn,
                    g = [],
                    p = [],
                    m = [],
                    v = s._getLabels();
                for (t = 0, n = v.length; t < n; ++t) m.push(si(s, v[t]));
                for (t = 0, n = (l.data.datasets || []).length; t < n; ++t)
                    if (l.isDatasetVisible(t))
                        if (a = l.data.datasets[t].data, V.isObject(a[0]))
                            for (p[t] = [], e = 0, i = a.length; e < i; ++e) r = si(s, a[e]), g.push(r), p[t][e] = r;
                        else p[t] = m.slice(0), o || (g = g.concat(m), o = !0);
                else p[t] = [];
                m.length && (c = Math.min(c, m[0]), f = Math.max(f, m[m.length - 1])), g.length && (g = n > 1 ? function (t) {
                    var e, n, i, a = {},
                        r = [];
                    for (e = 0, n = t.length; e < n; ++e) a[i = t[e]] || (a[i] = !0, r.push(i));
                    return r
                }(g).sort(ni) : g.sort(ni), c = Math.min(c, g[0]), f = Math.max(f, g[g.length - 1])), c = si(s, ii(d)) || c, f = si(s, ai(d)) || f, c = c === Qn ? +u.startOf(Date.now(), h) : c, f = f === Jn ? +u.endOf(Date.now(), h) + 1 : f, s.min = Math.min(c, f), s.max = Math.max(c + 1, f), s._table = [], s._timestamps = {
                    data: g,
                    datasets: p,
                    labels: m
                }
            },
            buildTicks: function () {
                var t, e, n, i = this,
                    a = i.min,
                    r = i.max,
                    o = i.options,
                    s = o.ticks,
                    l = o.time,
                    u = i._timestamps,
                    d = [],
                    h = i.getLabelCapacity(a),
                    c = s.source,
                    f = o.distribution;
                for (u = "data" === c || "auto" === c && "series" === f ? u.data : "labels" === c ? u.labels : function (t, e, n, i) {
                        var a, r = t._adapter,
                            o = t.options,
                            s = o.time,
                            l = s.unit || li(s.minUnit, e, n, i),
                            u = Zn([s.stepSize, s.unitStepSize, 1]),
                            d = "week" === l && s.isoWeekday,
                            h = e,
                            c = [];
                        if (d && (h = +r.startOf(h, "isoWeek", d)), h = +r.startOf(h, d ? "day" : l), r.diff(n, e, l) > 1e5 * u) throw e + " and " + n + " are too far apart with stepSize of " + u + " " + l;
                        for (a = h; a < n; a = +r.add(a, u, l)) c.push(a);
                        return a !== n && "ticks" !== o.bounds || c.push(a), c
                    }(i, a, r, h), "ticks" === o.bounds && u.length && (a = u[0], r = u[u.length - 1]), a = si(i, ii(o)) || a, r = si(i, ai(o)) || r, t = 0, e = u.length; t < e; ++t)(n = u[t]) >= a && n <= r && d.push(n);
                return i.min = a, i.max = r, i._unit = l.unit || (s.autoSkip ? li(l.minUnit, i.min, i.max, h) : function (t, e, n, i, a) {
                    var r, o;
                    for (r = ei.length - 1; r >= ei.indexOf(n); r--)
                        if (o = ei[r], ti[o].common && t._adapter.diff(a, i, o) >= e - 1) return o;
                    return ei[n ? ei.indexOf(n) : 0]
                }(i, d.length, l.minUnit, i.min, i.max)), i._majorUnit = s.major.enabled && "year" !== i._unit ? function (t) {
                    for (var e = ei.indexOf(t) + 1, n = ei.length; e < n; ++e)
                        if (ti[ei[e]].common) return ei[e]
                }(i._unit) : void 0, i._table = function (t, e, n, i) {
                    if ("linear" === i || !t.length) return [{
                        time: e,
                        pos: 0
                    }, {
                        time: n,
                        pos: 1
                    }];
                    var a, r, o, s, l, u = [],
                        d = [e];
                    for (a = 0, r = t.length; a < r; ++a)(s = t[a]) > e && s < n && d.push(s);
                    for (d.push(n), a = 0, r = d.length; a < r; ++a) l = d[a + 1], o = d[a - 1], s = d[a], void 0 !== o && void 0 !== l && Math.round((l + o) / 2) === s || u.push({
                        time: s,
                        pos: a / (r - 1)
                    });
                    return u
                }(i._timestamps.data, a, r, f), i._offsets = function (t, e, n, i, a) {
                    var r, o, s = 0,
                        l = 0;
                    return a.offset && e.length && (r = ri(t, "time", e[0], "pos"), s = 1 === e.length ? 1 - r : (ri(t, "time", e[1], "pos") - r) / 2, o = ri(t, "time", e[e.length - 1], "pos"), l = 1 === e.length ? o : (o - ri(t, "time", e[e.length - 2], "pos")) / 2), {
                        start: s,
                        end: l,
                        factor: 1 / (s + 1 + l)
                    }
                }(i._table, d, 0, 0, o), s.reverse && d.reverse(), ui(i, d, i._majorUnit)
            },
            getLabelForIndex: function (t, e) {
                var n = this,
                    i = n._adapter,
                    a = n.chart.data,
                    r = n.options.time,
                    o = a.labels && t < a.labels.length ? a.labels[t] : "",
                    s = a.datasets[e].data[t];
                return V.isObject(s) && (o = n.getRightValue(s)), r.tooltipFormat ? i.format(oi(n, o), r.tooltipFormat) : "string" == typeof o ? o : i.format(oi(n, o), r.displayFormats.datetime)
            },
            tickFormatFunction: function (t, e, n, i) {
                var a = this._adapter,
                    r = this.options,
                    o = r.time.displayFormats,
                    s = o[this._unit],
                    l = this._majorUnit,
                    u = o[l],
                    d = n[e],
                    h = r.ticks,
                    c = l && u && d && d.major,
                    f = a.format(t, i || (c ? u : s)),
                    g = c ? h.major : h.minor,
                    p = Zn([g.callback, g.userCallback, h.callback, h.userCallback]);
                return p ? p(f, e, n) : f
            },
            convertTicksToLabels: function (t) {
                var e, n, i = [];
                for (e = 0, n = t.length; e < n; ++e) i.push(this.tickFormatFunction(t[e].value, e, t));
                return i
            },
            getPixelForOffset: function (t) {
                var e = this._offsets,
                    n = ri(this._table, "time", t, "pos");
                return this.getPixelForDecimal((e.start + n) * e.factor)
            },
            getPixelForValue: function (t, e, n) {
                var i = null;
                if (void 0 !== e && void 0 !== n && (i = this._timestamps.datasets[n][e]), null === i && (i = si(this, t)), null !== i) return this.getPixelForOffset(i)
            },
            getPixelForTick: function (t) {
                var e = this.getTicks();
                return t >= 0 && t < e.length ? this.getPixelForOffset(e[t].value) : null
            },
            getValueForPixel: function (t) {
                var e = this._offsets,
                    n = this.getDecimalForPixel(t) / e.factor - e.end,
                    i = ri(this._table, "pos", n, "time");
                return this._adapter._create(i)
            },
            _getLabelSize: function (t) {
                var e = this.options.ticks,
                    n = this.ctx.measureText(t).width,
                    i = V.toRadians(this.isHorizontal() ? e.maxRotation : e.minRotation),
                    a = Math.cos(i),
                    r = Math.sin(i),
                    o = $n(e.fontSize, z.global.defaultFontSize);
                return {
                    w: n * a + o * r,
                    h: n * r + o * a
                }
            },
            getLabelWidth: function (t) {
                return this._getLabelSize(t).w
            },
            getLabelCapacity: function (t) {
                var e = this,
                    n = e.options.time,
                    i = n.displayFormats,
                    a = i[n.unit] || i.millisecond,
                    r = e.tickFormatFunction(t, 0, ui(e, [t], e._majorUnit), a),
                    o = e._getLabelSize(r),
                    s = Math.floor(e.isHorizontal() ? e.width / o.w : e.height / o.h);
                return e.options.offset && s--, s > 0 ? s : 1
            }
        }),
        hi = {
            position: "bottom",
            distribution: "linear",
            bounds: "data",
            adapters: {},
            time: {
                parser: !1,
                unit: !1,
                round: !1,
                displayFormat: !1,
                isoWeekday: !1,
                minUnit: "millisecond",
                displayFormats: {}
            },
            ticks: {
                autoSkip: !1,
                source: "auto",
                major: {
                    enabled: !1
                }
            }
        };
    di._defaults = hi;
    var ci = {
            category: _n,
            linear: Dn,
            logarithmic: Rn,
            radialLinear: Gn,
            time: di
        },
        fi = {
            datetime: "MMM D, YYYY, h:mm:ss a",
            millisecond: "h:mm:ss.SSS a",
            second: "h:mm:ss a",
            minute: "h:mm a",
            hour: "hA",
            day: "MMM D",
            week: "ll",
            month: "MMM YYYY",
            quarter: "[Q]Q - YYYY",
            year: "YYYY"
        };
    an._date.override("function" == typeof t ? {
        _id: "moment",
        formats: function () {
            return fi
        },
        parse: function (e, n) {
            return "string" == typeof e && "string" == typeof n ? e = t(e, n) : e instanceof t || (e = t(e)), e.isValid() ? e.valueOf() : null
        },
        format: function (e, n) {
            return t(e).format(n)
        },
        add: function (e, n, i) {
            return t(e).add(n, i).valueOf()
        },
        diff: function (e, n, i) {
            return t(e).diff(t(n), i)
        },
        startOf: function (e, n, i) {
            return e = t(e), "isoWeek" === n ? e.isoWeekday(i).valueOf() : e.startOf(n).valueOf()
        },
        endOf: function (e, n) {
            return t(e).endOf(n).valueOf()
        },
        _create: function (e) {
            return t(e)
        }
    } : {}), z._set("global", {
        plugins: {
            filler: {
                propagate: !0
            }
        }
    });
    var gi = {
        dataset: function (t) {
            var e = t.fill,
                n = t.chart,
                i = n.getDatasetMeta(e),
                a = i && n.isDatasetVisible(e) && i.dataset._children || [],
                r = a.length || 0;
            return r ? function (t, e) {
                return e < r && a[e]._view || null
            } : null
        },
        boundary: function (t) {
            var e = t.boundary,
                n = e ? e.x : null,
                i = e ? e.y : null;
            return V.isArray(e) ? function (t, n) {
                return e[n]
            } : function (t) {
                return {
                    x: null === n ? t.x : n,
                    y: null === i ? t.y : i
                }
            }
        }
    };

    function pi(t, e, n) {
        var i, a = t._model || {},
            r = a.fill;
        if (void 0 === r && (r = !!a.backgroundColor), !1 === r || null === r) return !1;
        if (!0 === r) return "origin";
        if (i = parseFloat(r, 10), isFinite(i) && Math.floor(i) === i) return "-" !== r[0] && "+" !== r[0] || (i = e + i), !(i === e || i < 0 || i >= n) && i;
        switch (r) {
            case "bottom":
                return "start";
            case "top":
                return "end";
            case "zero":
                return "origin";
            case "origin":
            case "start":
            case "end":
                return r;
            default:
                return !1
        }
    }

    function mi(t) {
        return (t.el._scale || {}).getPointPositionForValue ? function (t) {
            var e, n, i, a, r, o = t.el._scale,
                s = o.options,
                l = o.chart.data.labels.length,
                u = t.fill,
                d = [];
            if (!l) return null;
            for (e = s.ticks.reverse ? o.max : o.min, n = s.ticks.reverse ? o.min : o.max, i = o.getPointPositionForValue(0, e), a = 0; a < l; ++a) r = "start" === u || "end" === u ? o.getPointPositionForValue(a, "start" === u ? e : n) : o.getBasePosition(a), s.gridLines.circular && (r.cx = i.x, r.cy = i.y, r.angle = o.getIndexAngle(a) - Math.PI / 2), d.push(r);
            return d
        }(t) : function (t) {
            var e, n = t.el._model || {},
                i = t.el._scale || {},
                a = t.fill,
                r = null;
            if (isFinite(a)) return null;
            if ("start" === a ? r = void 0 === n.scaleBottom ? i.bottom : n.scaleBottom : "end" === a ? r = void 0 === n.scaleTop ? i.top : n.scaleTop : void 0 !== n.scaleZero ? r = n.scaleZero : i.getBasePixel && (r = i.getBasePixel()), null != r) {
                if (void 0 !== r.x && void 0 !== r.y) return r;
                if (V.isFinite(r)) return {
                    x: (e = i.isHorizontal()) ? r : null,
                    y: e ? null : r
                }
            }
            return null
        }(t)
    }

    function vi(t, e, n) {
        var i, a = t[e].fill,
            r = [e];
        if (!n) return a;
        for (; !1 !== a && -1 === r.indexOf(a);) {
            if (!isFinite(a)) return a;
            if (!(i = t[a])) return !1;
            if (i.visible) return a;
            r.push(a), a = i.fill
        }
        return !1
    }

    function bi(t) {
        var e = t.fill,
            n = "dataset";
        return !1 === e ? null : (isFinite(e) || (n = "boundary"), gi[n](t))
    }

    function xi(t) {
        return t && !t.skip
    }

    function yi(t, e, n, i, a) {
        var r, o, s, l;
        if (i && a) {
            for (t.moveTo(e[0].x, e[0].y), r = 1; r < i; ++r) V.canvas.lineTo(t, e[r - 1], e[r]);
            if (void 0 === n[0].angle)
                for (t.lineTo(n[a - 1].x, n[a - 1].y), r = a - 1; r > 0; --r) V.canvas.lineTo(t, n[r], n[r - 1], !0);
            else
                for (o = n[0].cx, s = n[0].cy, l = Math.sqrt(Math.pow(n[0].x - o, 2) + Math.pow(n[0].y - s, 2)), r = a - 1; r > 0; --r) t.arc(o, s, l, n[r].angle, n[r - 1].angle, !0)
        }
    }

    function _i(t, e, n, i, a, r) {
        var o, s, l, u, d, h, c, f, g = e.length,
            p = i.spanGaps,
            m = [],
            v = [],
            b = 0,
            x = 0;
        for (t.beginPath(), o = 0, s = g; o < s; ++o) d = n(u = e[l = o % g]._view, l, i), h = xi(u), c = xi(d), r && void 0 === f && h && (s = g + (f = o + 1)), h && c ? (b = m.push(u), x = v.push(d)) : b && x && (p ? (h && m.push(u), c && v.push(d)) : (yi(t, m, v, b, x), b = x = 0, m = [], v = []));
        yi(t, m, v, b, x), t.closePath(), t.fillStyle = a, t.fill()
    }
    var ki = {
            id: "filler",
            afterDatasetsUpdate: function (t, e) {
                var n, i, a, r, o = (t.data.datasets || []).length,
                    s = e.propagate,
                    l = [];
                for (i = 0; i < o; ++i) r = null, (a = (n = t.getDatasetMeta(i)).dataset) && a._model && a instanceof _t.Line && (r = {
                    visible: t.isDatasetVisible(i),
                    fill: pi(a, i, o),
                    chart: t,
                    el: a
                }), n.$filler = r, l.push(r);
                for (i = 0; i < o; ++i)(r = l[i]) && (r.fill = vi(l, i, s), r.boundary = mi(r), r.mapper = bi(r))
            },
            beforeDatasetsDraw: function (t) {
                var e, n, i, a, r, o, s, l = t._getSortedVisibleDatasetMetas(),
                    u = t.ctx;
                for (n = l.length - 1; n >= 0; --n)(e = l[n].$filler) && e.visible && (a = (i = e.el)._view, r = i._children || [], o = e.mapper, s = a.backgroundColor || z.global.defaultColor, o && s && r.length && (V.canvas.clipArea(u, t.chartArea), _i(u, r, o, a, s, i._loop), V.canvas.unclipArea(u)))
            }
        },
        wi = V.rtl.getRtlAdapter,
        Mi = V.noop,
        Si = V.valueOrDefault;

    function Ci(t, e) {
        return t.usePointStyle && t.boxWidth > e ? e : t.boxWidth
    }
    z._set("global", {
        legend: {
            display: !0,
            position: "top",
            align: "center",
            fullWidth: !0,
            reverse: !1,
            weight: 1e3,
            onClick: function (t, e) {
                var n = e.datasetIndex,
                    i = this.chart,
                    a = i.getDatasetMeta(n);
                a.hidden = null === a.hidden ? !i.data.datasets[n].hidden : null, i.update()
            },
            onHover: null,
            onLeave: null,
            labels: {
                boxWidth: 40,
                padding: 10,
                generateLabels: function (t) {
                    var e = t.data.datasets,
                        n = t.options.legend || {},
                        i = n.labels && n.labels.usePointStyle;
                    return t._getSortedDatasetMetas().map((function (n) {
                        var a = n.controller.getStyle(i ? 0 : void 0);
                        return {
                            text: e[n.index].label,
                            fillStyle: a.backgroundColor,
                            hidden: !t.isDatasetVisible(n.index),
                            lineCap: a.borderCapStyle,
                            lineDash: a.borderDash,
                            lineDashOffset: a.borderDashOffset,
                            lineJoin: a.borderJoinStyle,
                            lineWidth: a.borderWidth,
                            strokeStyle: a.borderColor,
                            pointStyle: a.pointStyle,
                            rotation: a.rotation,
                            datasetIndex: n.index
                        }
                    }), this)
                }
            }
        },
        legendCallback: function (t) {
            var e, n, i, a = document.createElement("ul"),
                r = t.data.datasets;
            for (a.setAttribute("class", t.id + "-legend"), e = 0, n = r.length; e < n; e++)(i = a.appendChild(document.createElement("li"))).appendChild(document.createElement("span")).style.backgroundColor = r[e].backgroundColor, r[e].label && i.appendChild(document.createTextNode(r[e].label));
            return a.outerHTML
        }
    });
    var Pi = X.extend({
        initialize: function (t) {
            V.extend(this, t), this.legendHitBoxes = [], this._hoveredItem = null, this.doughnutMode = !1
        },
        beforeUpdate: Mi,
        update: function (t, e, n) {
            var i = this;
            return i.beforeUpdate(), i.maxWidth = t, i.maxHeight = e, i.margins = n, i.beforeSetDimensions(), i.setDimensions(), i.afterSetDimensions(), i.beforeBuildLabels(), i.buildLabels(), i.afterBuildLabels(), i.beforeFit(), i.fit(), i.afterFit(), i.afterUpdate(), i.minSize
        },
        afterUpdate: Mi,
        beforeSetDimensions: Mi,
        setDimensions: function () {
            var t = this;
            t.isHorizontal() ? (t.width = t.maxWidth, t.left = 0, t.right = t.width) : (t.height = t.maxHeight, t.top = 0, t.bottom = t.height), t.paddingLeft = 0, t.paddingTop = 0, t.paddingRight = 0, t.paddingBottom = 0, t.minSize = {
                width: 0,
                height: 0
            }
        },
        afterSetDimensions: Mi,
        beforeBuildLabels: Mi,
        buildLabels: function () {
            var t = this,
                e = t.options.labels || {},
                n = V.callback(e.generateLabels, [t.chart], t) || [];
            e.filter && (n = n.filter((function (n) {
                return e.filter(n, t.chart.data)
            }))), t.options.reverse && n.reverse(), t.legendItems = n
        },
        afterBuildLabels: Mi,
        beforeFit: Mi,
        fit: function () {
            var t = this,
                e = t.options,
                n = e.labels,
                i = e.display,
                a = t.ctx,
                r = V.options._parseFont(n),
                o = r.size,
                s = t.legendHitBoxes = [],
                l = t.minSize,
                u = t.isHorizontal();
            if (u ? (l.width = t.maxWidth, l.height = i ? 10 : 0) : (l.width = i ? 10 : 0, l.height = t.maxHeight), i) {
                if (a.font = r.string, u) {
                    var d = t.lineWidths = [0],
                        h = 0;
                    a.textAlign = "left", a.textBaseline = "middle", V.each(t.legendItems, (function (t, e) {
                        var i = Ci(n, o) + o / 2 + a.measureText(t.text).width;
                        (0 === e || d[d.length - 1] + i + 2 * n.padding > l.width) && (h += o + n.padding, d[d.length - (e > 0 ? 0 : 1)] = 0), s[e] = {
                            left: 0,
                            top: 0,
                            width: i,
                            height: o
                        }, d[d.length - 1] += i + n.padding
                    })), l.height += h
                } else {
                    var c = n.padding,
                        f = t.columnWidths = [],
                        g = t.columnHeights = [],
                        p = n.padding,
                        m = 0,
                        v = 0;
                    V.each(t.legendItems, (function (t, e) {
                        var i = Ci(n, o) + o / 2 + a.measureText(t.text).width;
                        e > 0 && v + o + 2 * c > l.height && (p += m + n.padding, f.push(m), g.push(v), m = 0, v = 0), m = Math.max(m, i), v += o + c, s[e] = {
                            left: 0,
                            top: 0,
                            width: i,
                            height: o
                        }
                    })), p += m, f.push(m), g.push(v), l.width += p
                }
                t.width = l.width, t.height = l.height
            } else t.width = l.width = t.height = l.height = 0
        },
        afterFit: Mi,
        isHorizontal: function () {
            return "top" === this.options.position || "bottom" === this.options.position
        },
        draw: function () {
            var t = this,
                e = t.options,
                n = e.labels,
                i = z.global,
                a = i.defaultColor,
                r = i.elements.line,
                o = t.height,
                s = t.columnHeights,
                l = t.width,
                u = t.lineWidths;
            if (e.display) {
                var d, h = wi(e.rtl, t.left, t.minSize.width),
                    c = t.ctx,
                    f = Si(n.fontColor, i.defaultFontColor),
                    g = V.options._parseFont(n),
                    p = g.size;
                c.textAlign = h.textAlign("left"), c.textBaseline = "middle", c.lineWidth = .5, c.strokeStyle = f, c.fillStyle = f, c.font = g.string;
                var m = Ci(n, p),
                    v = t.legendHitBoxes,
                    b = function (t, i) {
                        switch (e.align) {
                            case "start":
                                return n.padding;
                            case "end":
                                return t - i;
                            default:
                                return (t - i + n.padding) / 2
                        }
                    },
                    x = t.isHorizontal();
                d = x ? {
                    x: t.left + b(l, u[0]),
                    y: t.top + n.padding,
                    line: 0
                } : {
                    x: t.left + n.padding,
                    y: t.top + b(o, s[0]),
                    line: 0
                }, V.rtl.overrideTextDirection(t.ctx, e.textDirection);
                var y = p + n.padding;
                V.each(t.legendItems, (function (e, i) {
                    var f = c.measureText(e.text).width,
                        g = m + p / 2 + f,
                        _ = d.x,
                        k = d.y;
                    h.setWidth(t.minSize.width), x ? i > 0 && _ + g + n.padding > t.left + t.minSize.width && (k = d.y += y, d.line++, _ = d.x = t.left + b(l, u[d.line])) : i > 0 && k + y > t.top + t.minSize.height && (_ = d.x = _ + t.columnWidths[d.line] + n.padding, d.line++, k = d.y = t.top + b(o, s[d.line]));
                    var w = h.x(_);
                    ! function (t, e, i) {
                        if (!(isNaN(m) || m <= 0)) {
                            c.save();
                            var o = Si(i.lineWidth, r.borderWidth);
                            if (c.fillStyle = Si(i.fillStyle, a), c.lineCap = Si(i.lineCap, r.borderCapStyle), c.lineDashOffset = Si(i.lineDashOffset, r.borderDashOffset), c.lineJoin = Si(i.lineJoin, r.borderJoinStyle), c.lineWidth = o, c.strokeStyle = Si(i.strokeStyle, a), c.setLineDash && c.setLineDash(Si(i.lineDash, r.borderDash)), n && n.usePointStyle) {
                                var s = m * Math.SQRT2 / 2,
                                    l = h.xPlus(t, m / 2),
                                    u = e + p / 2;
                                V.canvas.drawPoint(c, i.pointStyle, s, l, u, i.rotation)
                            } else c.fillRect(h.leftForLtr(t, m), e, m, p), 0 !== o && c.strokeRect(h.leftForLtr(t, m), e, m, p);
                            c.restore()
                        }
                    }(w, k, e), v[i].left = h.leftForLtr(w, v[i].width), v[i].top = k,
                        function (t, e, n, i) {
                            var a = p / 2,
                                r = h.xPlus(t, m + a),
                                o = e + a;
                            c.fillText(n.text, r, o), n.hidden && (c.beginPath(), c.lineWidth = 2, c.moveTo(r, o), c.lineTo(h.xPlus(r, i), o), c.stroke())
                        }(w, k, e, f), x ? d.x += g + n.padding : d.y += y
                })), V.rtl.restoreTextDirection(t.ctx, e.textDirection)
            }
        },
        _getLegendItemAt: function (t, e) {
            var n, i, a, r = this;
            if (t >= r.left && t <= r.right && e >= r.top && e <= r.bottom)
                for (a = r.legendHitBoxes, n = 0; n < a.length; ++n)
                    if (t >= (i = a[n]).left && t <= i.left + i.width && e >= i.top && e <= i.top + i.height) return r.legendItems[n];
            return null
        },
        handleEvent: function (t) {
            var e, n = this,
                i = n.options,
                a = "mouseup" === t.type ? "click" : t.type;
            if ("mousemove" === a) {
                if (!i.onHover && !i.onLeave) return
            } else {
                if ("click" !== a) return;
                if (!i.onClick) return
            }
            e = n._getLegendItemAt(t.x, t.y), "click" === a ? e && i.onClick && i.onClick.call(n, t.native, e) : (i.onLeave && e !== n._hoveredItem && (n._hoveredItem && i.onLeave.call(n, t.native, n._hoveredItem), n._hoveredItem = e), i.onHover && e && i.onHover.call(n, t.native, e))
        }
    });

    function Ai(t, e) {
        var n = new Pi({
            ctx: t.ctx,
            options: e,
            chart: t
        });
        ge.configure(t, n, e), ge.addBox(t, n), t.legend = n
    }
    var Di = {
            id: "legend",
            _element: Pi,
            beforeInit: function (t) {
                var e = t.options.legend;
                e && Ai(t, e)
            },
            beforeUpdate: function (t) {
                var e = t.options.legend,
                    n = t.legend;
                e ? (V.mergeIf(e, z.global.legend), n ? (ge.configure(t, n, e), n.options = e) : Ai(t, e)) : n && (ge.removeBox(t, n), delete t.legend)
            },
            afterEvent: function (t, e) {
                var n = t.legend;
                n && n.handleEvent(e)
            }
        },
        Ti = V.noop;
    z._set("global", {
        title: {
            display: !1,
            fontStyle: "bold",
            fullWidth: !0,
            padding: 10,
            position: "top",
            text: "",
            weight: 2e3
        }
    });
    var Ii = X.extend({
        initialize: function (t) {
            V.extend(this, t), this.legendHitBoxes = []
        },
        beforeUpdate: Ti,
        update: function (t, e, n) {
            var i = this;
            return i.beforeUpdate(), i.maxWidth = t, i.maxHeight = e, i.margins = n, i.beforeSetDimensions(), i.setDimensions(), i.afterSetDimensions(), i.beforeBuildLabels(), i.buildLabels(), i.afterBuildLabels(), i.beforeFit(), i.fit(), i.afterFit(), i.afterUpdate(), i.minSize
        },
        afterUpdate: Ti,
        beforeSetDimensions: Ti,
        setDimensions: function () {
            var t = this;
            t.isHorizontal() ? (t.width = t.maxWidth, t.left = 0, t.right = t.width) : (t.height = t.maxHeight, t.top = 0, t.bottom = t.height), t.paddingLeft = 0, t.paddingTop = 0, t.paddingRight = 0, t.paddingBottom = 0, t.minSize = {
                width: 0,
                height: 0
            }
        },
        afterSetDimensions: Ti,
        beforeBuildLabels: Ti,
        buildLabels: Ti,
        afterBuildLabels: Ti,
        beforeFit: Ti,
        fit: function () {
            var t, e = this,
                n = e.options,
                i = e.minSize = {},
                a = e.isHorizontal();
            n.display ? (t = (V.isArray(n.text) ? n.text.length : 1) * V.options._parseFont(n).lineHeight + 2 * n.padding, e.width = i.width = a ? e.maxWidth : t, e.height = i.height = a ? t : e.maxHeight) : e.width = i.width = e.height = i.height = 0
        },
        afterFit: Ti,
        isHorizontal: function () {
            var t = this.options.position;
            return "top" === t || "bottom" === t
        },
        draw: function () {
            var t = this,
                e = t.ctx,
                n = t.options;
            if (n.display) {
                var i, a, r, o = V.options._parseFont(n),
                    s = o.lineHeight,
                    l = s / 2 + n.padding,
                    u = 0,
                    d = t.top,
                    h = t.left,
                    c = t.bottom,
                    f = t.right;
                e.fillStyle = V.valueOrDefault(n.fontColor, z.global.defaultFontColor), e.font = o.string, t.isHorizontal() ? (a = h + (f - h) / 2, r = d + l, i = f - h) : (a = "left" === n.position ? h + l : f - l, r = d + (c - d) / 2, i = c - d, u = Math.PI * ("left" === n.position ? -.5 : .5)), e.save(), e.translate(a, r), e.rotate(u), e.textAlign = "center", e.textBaseline = "middle";
                var g = n.text;
                if (V.isArray(g))
                    for (var p = 0, m = 0; m < g.length; ++m) e.fillText(g[m], 0, p, i), p += s;
                else e.fillText(g, 0, 0, i);
                e.restore()
            }
        }
    });

    function Fi(t, e) {
        var n = new Ii({
            ctx: t.ctx,
            options: e,
            chart: t
        });
        ge.configure(t, n, e), ge.addBox(t, n), t.titleBlock = n
    }
    var Li = {},
        Oi = ki,
        Ri = Di,
        zi = {
            id: "title",
            _element: Ii,
            beforeInit: function (t) {
                var e = t.options.title;
                e && Fi(t, e)
            },
            beforeUpdate: function (t) {
                var e = t.options.title,
                    n = t.titleBlock;
                e ? (V.mergeIf(e, z.global.title), n ? (ge.configure(t, n, e), n.options = e) : Fi(t, e)) : n && (ge.removeBox(t, n), delete t.titleBlock)
            }
        };
    for (var Ni in Li.filler = Oi, Li.legend = Ri, Li.title = zi, tn.helpers = V,
            function () {
                function t(t, e, n) {
                    var i;
                    return "string" == typeof t ? (i = parseInt(t, 10), -1 !== t.indexOf("%") && (i = i / 100 * e.parentNode[n])) : i = t, i
                }

                function e(t) {
                    return null != t && "none" !== t
                }

                function n(n, i, a) {
                    var r = document.defaultView,
                        o = V._getParentNode(n),
                        s = r.getComputedStyle(n)[i],
                        l = r.getComputedStyle(o)[i],
                        u = e(s),
                        d = e(l),
                        h = Number.POSITIVE_INFINITY;
                    return u || d ? Math.min(u ? t(s, n, a) : h, d ? t(l, o, a) : h) : "none"
                }
                V.where = function (t, e) {
                    if (V.isArray(t) && Array.prototype.filter) return t.filter(e);
                    var n = [];
                    return V.each(t, (function (t) {
                        e(t) && n.push(t)
                    })), n
                }, V.findIndex = Array.prototype.findIndex ? function (t, e, n) {
                    return t.findIndex(e, n)
                } : function (t, e, n) {
                    n = void 0 === n ? t : n;
                    for (var i = 0, a = t.length; i < a; ++i)
                        if (e.call(n, t[i], i, t)) return i;
                    return -1
                }, V.findNextWhere = function (t, e, n) {
                    V.isNullOrUndef(n) && (n = -1);
                    for (var i = n + 1; i < t.length; i++) {
                        var a = t[i];
                        if (e(a)) return a
                    }
                }, V.findPreviousWhere = function (t, e, n) {
                    V.isNullOrUndef(n) && (n = t.length);
                    for (var i = n - 1; i >= 0; i--) {
                        var a = t[i];
                        if (e(a)) return a
                    }
                }, V.isNumber = function (t) {
                    return !isNaN(parseFloat(t)) && isFinite(t)
                }, V.almostEquals = function (t, e, n) {
                    return Math.abs(t - e) < n
                }, V.almostWhole = function (t, e) {
                    var n = Math.round(t);
                    return n - e <= t && n + e >= t
                }, V.max = function (t) {
                    return t.reduce((function (t, e) {
                        return isNaN(e) ? t : Math.max(t, e)
                    }), Number.NEGATIVE_INFINITY)
                }, V.min = function (t) {
                    return t.reduce((function (t, e) {
                        return isNaN(e) ? t : Math.min(t, e)
                    }), Number.POSITIVE_INFINITY)
                }, V.sign = Math.sign ? function (t) {
                    return Math.sign(t)
                } : function (t) {
                    return 0 === (t = +t) || isNaN(t) ? t : t > 0 ? 1 : -1
                }, V.toRadians = function (t) {
                    return t * (Math.PI / 180)
                }, V.toDegrees = function (t) {
                    return t * (180 / Math.PI)
                }, V._decimalPlaces = function (t) {
                    if (V.isFinite(t)) {
                        for (var e = 1, n = 0; Math.round(t * e) / e !== t;) e *= 10, n++;
                        return n
                    }
                }, V.getAngleFromPoint = function (t, e) {
                    var n = e.x - t.x,
                        i = e.y - t.y,
                        a = Math.sqrt(n * n + i * i),
                        r = Math.atan2(i, n);
                    return r < -.5 * Math.PI && (r += 2 * Math.PI), {
                        angle: r,
                        distance: a
                    }
                }, V.distanceBetweenPoints = function (t, e) {
                    return Math.sqrt(Math.pow(e.x - t.x, 2) + Math.pow(e.y - t.y, 2))
                }, V.aliasPixel = function (t) {
                    return t % 2 == 0 ? 0 : .5
                }, V._alignPixel = function (t, e, n) {
                    var i = t.currentDevicePixelRatio,
                        a = n / 2;
                    return Math.round((e - a) * i) / i + a
                }, V.splineCurve = function (t, e, n, i) {
                    var a = t.skip ? e : t,
                        r = e,
                        o = n.skip ? e : n,
                        s = Math.sqrt(Math.pow(r.x - a.x, 2) + Math.pow(r.y - a.y, 2)),
                        l = Math.sqrt(Math.pow(o.x - r.x, 2) + Math.pow(o.y - r.y, 2)),
                        u = s / (s + l),
                        d = l / (s + l),
                        h = i * (u = isNaN(u) ? 0 : u),
                        c = i * (d = isNaN(d) ? 0 : d);
                    return {
                        previous: {
                            x: r.x - h * (o.x - a.x),
                            y: r.y - h * (o.y - a.y)
                        },
                        next: {
                            x: r.x + c * (o.x - a.x),
                            y: r.y + c * (o.y - a.y)
                        }
                    }
                }, V.EPSILON = Number.EPSILON || 1e-14, V.splineCurveMonotone = function (t) {
                    var e, n, i, a, r, o, s, l, u, d = (t || []).map((function (t) {
                            return {
                                model: t._model,
                                deltaK: 0,
                                mK: 0
                            }
                        })),
                        h = d.length;
                    for (e = 0; e < h; ++e)
                        if (!(i = d[e]).model.skip) {
                            if (n = e > 0 ? d[e - 1] : null, (a = e < h - 1 ? d[e + 1] : null) && !a.model.skip) {
                                var c = a.model.x - i.model.x;
                                i.deltaK = 0 !== c ? (a.model.y - i.model.y) / c : 0
                            }!n || n.model.skip ? i.mK = i.deltaK : !a || a.model.skip ? i.mK = n.deltaK : this.sign(n.deltaK) !== this.sign(i.deltaK) ? i.mK = 0 : i.mK = (n.deltaK + i.deltaK) / 2
                        } for (e = 0; e < h - 1; ++e) i = d[e], a = d[e + 1], i.model.skip || a.model.skip || (V.almostEquals(i.deltaK, 0, this.EPSILON) ? i.mK = a.mK = 0 : (r = i.mK / i.deltaK, o = a.mK / i.deltaK, (l = Math.pow(r, 2) + Math.pow(o, 2)) <= 9 || (s = 3 / Math.sqrt(l), i.mK = r * s * i.deltaK, a.mK = o * s * i.deltaK)));
                    for (e = 0; e < h; ++e)(i = d[e]).model.skip || (n = e > 0 ? d[e - 1] : null, a = e < h - 1 ? d[e + 1] : null, n && !n.model.skip && (u = (i.model.x - n.model.x) / 3, i.model.controlPointPreviousX = i.model.x - u, i.model.controlPointPreviousY = i.model.y - u * i.mK), a && !a.model.skip && (u = (a.model.x - i.model.x) / 3, i.model.controlPointNextX = i.model.x + u, i.model.controlPointNextY = i.model.y + u * i.mK))
                }, V.nextItem = function (t, e, n) {
                    return n ? e >= t.length - 1 ? t[0] : t[e + 1] : e >= t.length - 1 ? t[t.length - 1] : t[e + 1]
                }, V.previousItem = function (t, e, n) {
                    return n ? e <= 0 ? t[t.length - 1] : t[e - 1] : e <= 0 ? t[0] : t[e - 1]
                }, V.niceNum = function (t, e) {
                    var n = Math.floor(V.log10(t)),
                        i = t / Math.pow(10, n);
                    return (e ? i < 1.5 ? 1 : i < 3 ? 2 : i < 7 ? 5 : 10 : i <= 1 ? 1 : i <= 2 ? 2 : i <= 5 ? 5 : 10) * Math.pow(10, n)
                }, V.requestAnimFrame = "undefined" == typeof window ? function (t) {
                    t()
                } : window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (t) {
                    return window.setTimeout(t, 1e3 / 60)
                }, V.getRelativePosition = function (t, e) {
                    var n, i, a = t.originalEvent || t,
                        r = t.target || t.srcElement,
                        o = r.getBoundingClientRect(),
                        s = a.touches;
                    s && s.length > 0 ? (n = s[0].clientX, i = s[0].clientY) : (n = a.clientX, i = a.clientY);
                    var l = parseFloat(V.getStyle(r, "padding-left")),
                        u = parseFloat(V.getStyle(r, "padding-top")),
                        d = parseFloat(V.getStyle(r, "padding-right")),
                        h = parseFloat(V.getStyle(r, "padding-bottom")),
                        c = o.right - o.left - l - d,
                        f = o.bottom - o.top - u - h;
                    return {
                        x: n = Math.round((n - o.left - l) / c * r.width / e.currentDevicePixelRatio),
                        y: i = Math.round((i - o.top - u) / f * r.height / e.currentDevicePixelRatio)
                    }
                }, V.getConstraintWidth = function (t) {
                    return n(t, "max-width", "clientWidth")
                }, V.getConstraintHeight = function (t) {
                    return n(t, "max-height", "clientHeight")
                }, V._calculatePadding = function (t, e, n) {
                    return (e = V.getStyle(t, e)).indexOf("%") > -1 ? n * parseInt(e, 10) / 100 : parseInt(e, 10)
                }, V._getParentNode = function (t) {
                    var e = t.parentNode;
                    return e && "[object ShadowRoot]" === e.toString() && (e = e.host), e
                }, V.getMaximumWidth = function (t) {
                    var e = V._getParentNode(t);
                    if (!e) return t.clientWidth;
                    var n = e.clientWidth,
                        i = n - V._calculatePadding(e, "padding-left", n) - V._calculatePadding(e, "padding-right", n),
                        a = V.getConstraintWidth(t);
                    return isNaN(a) ? i : Math.min(i, a)
                }, V.getMaximumHeight = function (t) {
                    var e = V._getParentNode(t);
                    if (!e) return t.clientHeight;
                    var n = e.clientHeight,
                        i = n - V._calculatePadding(e, "padding-top", n) - V._calculatePadding(e, "padding-bottom", n),
                        a = V.getConstraintHeight(t);
                    return isNaN(a) ? i : Math.min(i, a)
                }, V.getStyle = function (t, e) {
                    return t.currentStyle ? t.currentStyle[e] : document.defaultView.getComputedStyle(t, null).getPropertyValue(e)
                }, V.retinaScale = function (t, e) {
                    var n = t.currentDevicePixelRatio = e || "undefined" != typeof window && window.devicePixelRatio || 1;
                    if (1 !== n) {
                        var i = t.canvas,
                            a = t.height,
                            r = t.width;
                        i.height = a * n, i.width = r * n, t.ctx.scale(n, n), i.style.height || i.style.width || (i.style.height = a + "px", i.style.width = r + "px")
                    }
                }, V.fontString = function (t, e, n) {
                    return e + " " + t + "px " + n
                }, V.longestText = function (t, e, n, i) {
                    var a = (i = i || {}).data = i.data || {},
                        r = i.garbageCollect = i.garbageCollect || [];
                    i.font !== e && (a = i.data = {}, r = i.garbageCollect = [], i.font = e), t.font = e;
                    var o, s, l, u, d, h = 0,
                        c = n.length;
                    for (o = 0; o < c; o++)
                        if (null != (u = n[o]) && !0 !== V.isArray(u)) h = V.measureText(t, a, r, h, u);
                        else if (V.isArray(u))
                        for (s = 0, l = u.length; s < l; s++) null == (d = u[s]) || V.isArray(d) || (h = V.measureText(t, a, r, h, d));
                    var f = r.length / 2;
                    if (f > n.length) {
                        for (o = 0; o < f; o++) delete a[r[o]];
                        r.splice(0, f)
                    }
                    return h
                }, V.measureText = function (t, e, n, i, a) {
                    var r = e[a];
                    return r || (r = e[a] = t.measureText(a).width, n.push(a)), r > i && (i = r), i
                }, V.numberOfLabelLines = function (t) {
                    var e = 1;
                    return V.each(t, (function (t) {
                        V.isArray(t) && t.length > e && (e = t.length)
                    })), e
                }, V.color = k ? function (t) {
                    return t instanceof CanvasGradient && (t = z.global.defaultColor), k(t)
                } : function (t) {
                    return console.error("Color.js not found!"), t
                }, V.getHoverColor = function (t) {
                    return t instanceof CanvasPattern || t instanceof CanvasGradient ? t : V.color(t).saturate(.5).darken(.1).rgbString()
                }
            }(), tn._adapters = an, tn.Animation = Z, tn.animationService = $, tn.controllers = $t, tn.DatasetController = nt, tn.defaults = z, tn.Element = X, tn.elements = _t, tn.Interaction = ae, tn.layouts = ge, tn.platform = Fe, tn.plugins = Le, tn.Scale = xn, tn.scaleService = Oe, tn.Ticks = rn, tn.Tooltip = Ue, tn.helpers.each(ci, (function (t, e) {
                tn.scaleService.registerScaleType(e, t, t._defaults)
            })), Li) Li.hasOwnProperty(Ni) && tn.plugins.register(Li[Ni]);
    tn.platform.initialize();
    var Bi = tn;
    return "undefined" != typeof window && (window.Chart = tn), tn.Chart = tn, tn.Legend = Li.legend._element, tn.Title = Li.title._element, tn.pluginService = tn.plugins, tn.PluginBase = tn.Element.extend({}), tn.canvasHelpers = tn.helpers.canvas, tn.layoutService = tn.layouts, tn.LinearScaleBase = Sn, tn.helpers.each(["Bar", "Bubble", "Doughnut", "Line", "PolarArea", "Radar", "Scatter"], (function (t) {
        tn[t] = function (e, n) {
            return new tn(e, tn.helpers.merge(n || {}, {
                type: t.charAt(0).toLowerCase() + t.slice(1)
            }))
        }
    })), Bi
}));

$(document).ready(function () {
    /*! jQuery & Zepto Lazy v1.7.10 - http://jquery.eisbehr.de/lazy - MIT&GPL-2.0 license - Copyright 2012-2018 Daniel 'Eisbehr' Kern */
    ! function (t, e) {
        "use strict";

        function r(r, a, i, u, l) {
            function f() {
                L = t.devicePixelRatio > 1, i = c(i), a.delay >= 0 && setTimeout(function () {
                    s(!0)
                }, a.delay), (a.delay < 0 || a.combined) && (u.e = v(a.throttle, function (t) {
                    "resize" === t.type && (w = B = -1), s(t.all)
                }), u.a = function (t) {
                    t = c(t), i.push.apply(i, t)
                }, u.g = function () {
                    return i = n(i).filter(function () {
                        return !n(this).data(a.loadedName)
                    })
                }, u.f = function (t) {
                    for (var e = 0; e < t.length; e++) {
                        var r = i.filter(function () {
                            return this === t[e]
                        });
                        r.length && s(!1, r)
                    }
                }, s(), n(a.appendScroll).on("scroll." + l + " resize." + l, u.e))
            }

            function c(t) {
                var i = a.defaultImage,
                    o = a.placeholder,
                    u = a.imageBase,
                    l = a.srcsetAttribute,
                    f = a.loaderAttribute,
                    c = a._f || {};
                t = n(t).filter(function () {
                    var t = n(this),
                        r = m(this);
                    return !t.data(a.handledName) && (t.attr(a.attribute) || t.attr(l) || t.attr(f) || c[r] !== e)
                }).data("plugin_" + a.name, r);
                for (var s = 0, d = t.length; s < d; s++) {
                    var A = n(t[s]),
                        g = m(t[s]),
                        h = A.attr(a.imageBaseAttribute) || u;
                    g === N && h && A.attr(l) && A.attr(l, b(A.attr(l), h)), c[g] === e || A.attr(f) || A.attr(f, c[g]), g === N && i && !A.attr(E) ? A.attr(E, i) : g === N || !o || A.css(O) && "none" !== A.css(O) || A.css(O, "url('" + o + "')")
                }
                return t
            }

            function s(t, e) {
                if (!i.length) return void(a.autoDestroy && r.destroy());
                for (var o = e || i, u = !1, l = a.imageBase || "", f = a.srcsetAttribute, c = a.handledName, s = 0; s < o.length; s++)
                    if (t || e || A(o[s])) {
                        var g = n(o[s]),
                            h = m(o[s]),
                            b = g.attr(a.attribute),
                            v = g.attr(a.imageBaseAttribute) || l,
                            p = g.attr(a.loaderAttribute);
                        g.data(c) || a.visibleOnly && !g.is(":visible") || !((b || g.attr(f)) && (h === N && (v + b !== g.attr(E) || g.attr(f) !== g.attr(F)) || h !== N && v + b !== g.css(O)) || p) || (u = !0, g.data(c, !0), d(g, h, v, p))
                    } u && (i = n(i).filter(function () {
                    return !n(this).data(c)
                }))
            }

            function d(t, e, r, i) {
                ++z;
                var o = function () {
                    y("onError", t), p(), o = n.noop
                };
                y("beforeLoad", t);
                var u = a.attribute,
                    l = a.srcsetAttribute,
                    f = a.sizesAttribute,
                    c = a.retinaAttribute,
                    s = a.removeAttribute,
                    d = a.loadedName,
                    A = t.attr(c);
                if (i) {
                    var g = function () {
                        s && t.removeAttr(a.loaderAttribute), t.data(d, !0), y(T, t), setTimeout(p, 1), g = n.noop
                    };
                    t.off(I).one(I, o).one(D, g), y(i, t, function (e) {
                        e ? (t.off(D), g()) : (t.off(I), o())
                    }) || t.trigger(I)
                } else {
                    var h = n(new Image);
                    h.one(I, o).one(D, function () {
                        t.hide(), e === N ? t.attr(C, h.attr(C)).attr(F, h.attr(F)).attr(E, h.attr(E)) : t.css(O, "url('" + h.attr(E) + "')"), t[a.effect](a.effectTime), s && (t.removeAttr(u + " " + l + " " + c + " " + a.imageBaseAttribute), f !== C && t.removeAttr(f)), t.data(d, !0), y(T, t), h.remove(), p()
                    });
                    var m = (L && A ? A : t.attr(u)) || "";
                    h.attr(C, t.attr(f)).attr(F, t.attr(l)).attr(E, m ? r + m : null), h.complete && h.trigger(D)
                }
            }

            function A(t) {
                var e = t.getBoundingClientRect(),
                    r = a.scrollDirection,
                    n = a.threshold,
                    i = h() + n > e.top && -n < e.bottom,
                    o = g() + n > e.left && -n < e.right;
                return "vertical" === r ? i : "horizontal" === r ? o : i && o
            }

            function g() {
                return w >= 0 ? w : w = n(t).width()
            }

            function h() {
                return B >= 0 ? B : B = n(t).height()
            }

            function m(t) {
                return t.tagName.toLowerCase()
            }

            function b(t, e) {
                if (e) {
                    var r = t.split(",");
                    t = "";
                    for (var a = 0, n = r.length; a < n; a++) t += e + r[a].trim() + (a !== n - 1 ? "," : "")
                }
                return t
            }

            function v(t, e) {
                var n, i = 0;
                return function (o, u) {
                    function l() {
                        i = +new Date, e.call(r, o)
                    }
                    var f = +new Date - i;
                    n && clearTimeout(n), f > t || !a.enableThrottle || u ? l() : n = setTimeout(l, t - f)
                }
            }

            function p() {
                --z, i.length || z || y("onFinishedAll")
            }

            function y(t, e, n) {
                return !!(t = a[t]) && (t.apply(r, [].slice.call(arguments, 1)), !0)
            }
            var z = 0,
                w = -1,
                B = -1,
                L = !1,
                T = "afterLoad",
                D = "load",
                I = "error",
                N = "img",
                E = "src",
                F = "srcset",
                C = "sizes",
                O = "background-image";
            "event" === a.bind || o ? f() : n(t).on(D + "." + l, f)
        }

        function a(a, o) {
            var u = this,
                l = n.extend({}, u.config, o),
                f = {},
                c = l.name + "-" + ++i;
            return u.config = function (t, r) {
                return r === e ? l[t] : (l[t] = r, u)
            }, u.addItems = function (t) {
                return f.a && f.a("string" === n.type(t) ? n(t) : t), u
            }, u.getItems = function () {
                return f.g ? f.g() : {}
            }, u.update = function (t) {
                return f.e && f.e({}, !t), u
            }, u.force = function (t) {
                return f.f && f.f("string" === n.type(t) ? n(t) : t), u
            }, u.loadAll = function () {
                return f.e && f.e({
                    all: !0
                }, !0), u
            }, u.destroy = function () {
                return n(l.appendScroll).off("." + c, f.e), n(t).off("." + c), f = {}, e
            }, r(u, l, a, f, c), l.chainable ? a : u
        }
        var n = t.jQuery || t.Zepto,
            i = 0,
            o = !1;
        n.fn.Lazy = n.fn.lazy = function (t) {
            return new a(this, t)
        }, n.Lazy = n.lazy = function (t, r, i) {
            if (n.isFunction(r) && (i = r, r = []), n.isFunction(i)) {
                t = n.isArray(t) ? t : [t], r = n.isArray(r) ? r : [r];
                for (var o = a.prototype.config, u = o._f || (o._f = {}), l = 0, f = t.length; l < f; l++)(o[t[l]] === e || n.isFunction(o[t[l]])) && (o[t[l]] = i);
                for (var c = 0, s = r.length; c < s; c++) u[r[c]] = t[0]
            }
        }, a.prototype.config = {
            name: "lazy",
            chainable: !0,
            autoDestroy: !0,
            bind: "load",
            threshold: 500,
            visibleOnly: !1,
            appendScroll: t,
            scrollDirection: "both",
            imageBase: null,
            defaultImage: "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==",
            placeholder: null,
            delay: -1,
            combined: !1,
            attribute: "data-src",
            srcsetAttribute: "data-srcset",
            sizesAttribute: "data-sizes",
            retinaAttribute: "data-retina",
            loaderAttribute: "data-loader",
            imageBaseAttribute: "data-imagebase",
            removeAttribute: !0,
            handledName: "handled",
            loadedName: "loaded",
            effect: "show",
            effectTime: 0,
            enableThrottle: !0,
            throttle: 250,
            beforeLoad: e,
            afterLoad: e,
            onError: e,
            onFinishedAll: e
        }, n(t).on("load", function () {
            o = !0
        })
    }(window);
});

$(window).on('load', function () {
    /*slick.min.js*/
    ! function (a) {
        "use strict";
        "function" == typeof define && define.amd ? define(["jquery"], a) : "undefined" != typeof exports ? module.exports = a(require("jquery")) : a(jQuery)
    }(function (a) {
        "use strict";
        var b = window.Slick || {};
        b = function () {
            function c(c, d) {
                var f, e = this;
                e.defaults = {
                    accessibility: !0,
                    adaptiveHeight: !1,
                    appendArrows: a(c),
                    appendDots: a(c),
                    arrows: !0,
                    asNavFor: null,
                    prevArrow: '<button type="button" data-role="none" class="slick-prev" aria-label="Previous" tabindex="0" role="button">Previous</button>',
                    nextArrow: '<button type="button" data-role="none" class="slick-next" aria-label="Next" tabindex="0" role="button">Next</button>',
                    autoplay: !1,
                    autoplaySpeed: 3e3,
                    centerMode: !1,
                    centerPadding: "50px",
                    cssEase: "ease",
                    customPaging: function (a, b) {
                        return '<button type="button" data-role="none" role="button" aria-required="false" tabindex="0">' + (b + 1) + "</button>"
                    },
                    dots: !1,
                    dotsClass: "slick-dots",
                    draggable: !0,
                    easing: "linear",
                    edgeFriction: .35,
                    fade: !1,
                    focusOnSelect: !1,
                    infinite: !0,
                    initialSlide: 0,
                    lazyLoad: "ondemand",
                    mobileFirst: !1,
                    pauseOnHover: !0,
                    pauseOnDotsHover: !1,
                    respondTo: "window",
                    responsive: null,
                    rows: 1,
                    rtl: !1,
                    slide: "",
                    slidesPerRow: 1,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    speed: 500,
                    swipe: !0,
                    swipeToSlide: !1,
                    touchMove: !0,
                    touchThreshold: 5,
                    useCSS: !0,
                    variableWidth: !1,
                    vertical: !1,
                    verticalSwiping: !1,
                    waitForAnimate: !0,
                    zIndex: 1e3
                }, e.initials = {
                    animating: !1,
                    dragging: !1,
                    autoPlayTimer: null,
                    currentDirection: 0,
                    currentLeft: null,
                    currentSlide: 0,
                    direction: 1,
                    $dots: null,
                    listWidth: null,
                    listHeight: null,
                    loadIndex: 0,
                    $nextArrow: null,
                    $prevArrow: null,
                    slideCount: null,
                    slideWidth: null,
                    $slideTrack: null,
                    $slides: null,
                    sliding: !1,
                    slideOffset: 0,
                    swipeLeft: null,
                    $list: null,
                    touchObject: {},
                    transformsEnabled: !1,
                    unslicked: !1
                }, a.extend(e, e.initials), e.activeBreakpoint = null, e.animType = null, e.animProp = null, e.breakpoints = [], e.breakpointSettings = [], e.cssTransitions = !1, e.hidden = "hidden", e.paused = !1, e.positionProp = null, e.respondTo = null, e.rowCount = 1, e.shouldClick = !0, e.$slider = a(c), e.$slidesCache = null, e.transformType = null, e.transitionType = null, e.visibilityChange = "visibilitychange", e.windowWidth = 0, e.windowTimer = null, f = a(c).data("slick") || {}, e.options = a.extend({}, e.defaults, f, d), e.currentSlide = e.options.initialSlide, e.originalSettings = e.options, "undefined" != typeof document.mozHidden ? (e.hidden = "mozHidden", e.visibilityChange = "mozvisibilitychange") : "undefined" != typeof document.webkitHidden && (e.hidden = "webkitHidden", e.visibilityChange = "webkitvisibilitychange"), e.autoPlay = a.proxy(e.autoPlay, e), e.autoPlayClear = a.proxy(e.autoPlayClear, e), e.changeSlide = a.proxy(e.changeSlide, e), e.clickHandler = a.proxy(e.clickHandler, e), e.selectHandler = a.proxy(e.selectHandler, e), e.setPosition = a.proxy(e.setPosition, e), e.swipeHandler = a.proxy(e.swipeHandler, e), e.dragHandler = a.proxy(e.dragHandler, e), e.keyHandler = a.proxy(e.keyHandler, e), e.autoPlayIterator = a.proxy(e.autoPlayIterator, e), e.instanceUid = b++, e.htmlExpr = /^(?:\s*(<[\w\W]+>)[^>]*)$/, e.registerBreakpoints(), e.init(!0), e.checkResponsive(!0)
            }
            var b = 0;
            return c
        }(), b.prototype.addSlide = b.prototype.slickAdd = function (b, c, d) {
            var e = this;
            if ("boolean" == typeof c) d = c, c = null;
            else if (0 > c || c >= e.slideCount) return !1;
            e.unload(), "number" == typeof c ? 0 === c && 0 === e.$slides.length ? a(b).appendTo(e.$slideTrack) : d ? a(b).insertBefore(e.$slides.eq(c)) : a(b).insertAfter(e.$slides.eq(c)) : d === !0 ? a(b).prependTo(e.$slideTrack) : a(b).appendTo(e.$slideTrack), e.$slides = e.$slideTrack.children(this.options.slide), e.$slideTrack.children(this.options.slide).detach(), e.$slideTrack.append(e.$slides), e.$slides.each(function (b, c) {
                a(c).attr("data-slick-index", b)
            }), e.$slidesCache = e.$slides, e.reinit()
        }, b.prototype.animateHeight = function () {
            var a = this;
            if (1 === a.options.slidesToShow && a.options.adaptiveHeight === !0 && a.options.vertical === !1) {
                var b = a.$slides.eq(a.currentSlide).outerHeight(!0);
                a.$list.animate({
                    height: b
                }, a.options.speed)
            }
        }, b.prototype.animateSlide = function (b, c) {
            var d = {},
                e = this;
            e.animateHeight(), e.options.rtl === !0 && e.options.vertical === !1 && (b = -b), e.transformsEnabled === !1 ? e.options.vertical === !1 ? e.$slideTrack.animate({
                left: b
            }, e.options.speed, e.options.easing, c) : e.$slideTrack.animate({
                top: b
            }, e.options.speed, e.options.easing, c) : e.cssTransitions === !1 ? (e.options.rtl === !0 && (e.currentLeft = -e.currentLeft), a({
                animStart: e.currentLeft
            }).animate({
                animStart: b
            }, {
                duration: e.options.speed,
                easing: e.options.easing,
                step: function (a) {
                    a = Math.ceil(a), e.options.vertical === !1 ? (d[e.animType] = "translate(" + a + "px, 0px)", e.$slideTrack.css(d)) : (d[e.animType] = "translate(0px," + a + "px)", e.$slideTrack.css(d))
                },
                complete: function () {
                    c && c.call()
                }
            })) : (e.applyTransition(), b = Math.ceil(b), d[e.animType] = e.options.vertical === !1 ? "translate3d(" + b + "px, 0px, 0px)" : "translate3d(0px," + b + "px, 0px)", e.$slideTrack.css(d), c && setTimeout(function () {
                e.disableTransition(), c.call()
            }, e.options.speed))
        }, b.prototype.asNavFor = function (b) {
            var c = this,
                d = c.options.asNavFor;
            d && null !== d && (d = a(d).not(c.$slider)), null !== d && "object" == typeof d && d.each(function () {
                var c = a(this).slick("getSlick");
                c.unslicked || c.slideHandler(b, !0)
            })
        }, b.prototype.applyTransition = function (a) {
            var b = this,
                c = {};
            c[b.transitionType] = b.options.fade === !1 ? b.transformType + " " + b.options.speed + "ms " + b.options.cssEase : "opacity " + b.options.speed + "ms " + b.options.cssEase, b.options.fade === !1 ? b.$slideTrack.css(c) : b.$slides.eq(a).css(c)
        }, b.prototype.autoPlay = function () {
            var a = this;
            a.autoPlayTimer && clearInterval(a.autoPlayTimer), a.slideCount > a.options.slidesToShow && a.paused !== !0 && (a.autoPlayTimer = setInterval(a.autoPlayIterator, a.options.autoplaySpeed))
        }, b.prototype.autoPlayClear = function () {
            var a = this;
            a.autoPlayTimer && clearInterval(a.autoPlayTimer)
        }, b.prototype.autoPlayIterator = function () {
            var a = this;
            a.options.infinite === !1 ? 1 === a.direction ? (a.currentSlide + 1 === a.slideCount - 1 && (a.direction = 0), a.slideHandler(a.currentSlide + a.options.slidesToScroll)) : (0 === a.currentSlide - 1 && (a.direction = 1), a.slideHandler(a.currentSlide - a.options.slidesToScroll)) : a.slideHandler(a.currentSlide + a.options.slidesToScroll)
        }, b.prototype.buildArrows = function () {
            var b = this;
            b.options.arrows === !0 && (b.$prevArrow = a(b.options.prevArrow).addClass("slick-arrow"), b.$nextArrow = a(b.options.nextArrow).addClass("slick-arrow"), b.slideCount > b.options.slidesToShow ? (b.$prevArrow.removeClass("slick-hidden").removeAttr("aria-hidden tabindex"), b.$nextArrow.removeClass("slick-hidden").removeAttr("aria-hidden tabindex"), b.htmlExpr.test(b.options.prevArrow) && b.$prevArrow.prependTo(b.options.appendArrows), b.htmlExpr.test(b.options.nextArrow) && b.$nextArrow.appendTo(b.options.appendArrows), b.options.infinite !== !0 && b.$prevArrow.addClass("slick-disabled").attr("aria-disabled", "true")) : b.$prevArrow.add(b.$nextArrow).addClass("slick-hidden").attr({
                "aria-disabled": "true",
                tabindex: "-1"
            }))
        }, b.prototype.buildDots = function () {
            var c, d, b = this;
            if (b.options.dots === !0 && b.slideCount > b.options.slidesToShow) {
                for (d = '<ul class="' + b.options.dotsClass + '">', c = 0; c <= b.getDotCount(); c += 1) d += "<li>" + b.options.customPaging.call(this, b, c) + "</li>";
                d += "</ul>", b.$dots = a(d).appendTo(b.options.appendDots), b.$dots.find("li").first().addClass("slick-active").attr("aria-hidden", "false")
            }
        }, b.prototype.buildOut = function () {
            var b = this;
            b.$slides = b.$slider.children(b.options.slide + ":not(.slick-cloned)").addClass("slick-slide"), b.slideCount = b.$slides.length, b.$slides.each(function (b, c) {
                a(c).attr("data-slick-index", b).data("originalStyling", a(c).attr("style") || "")
            }), b.$slidesCache = b.$slides, b.$slider.addClass("slick-slider"), b.$slideTrack = 0 === b.slideCount ? a('<div class="slick-track"/>').appendTo(b.$slider) : b.$slides.wrapAll('<div class="slick-track"/>').parent(), b.$list = b.$slideTrack.wrap('<div aria-live="polite" class="slick-list"/>').parent(), b.$slideTrack.css("opacity", 0), (b.options.centerMode === !0 || b.options.swipeToSlide === !0) && (b.options.slidesToScroll = 1), a("img[data-lazy]", b.$slider).not("[src]").addClass("slick-loading"), b.setupInfinite(), b.buildArrows(), b.buildDots(), b.updateDots(), b.setSlideClasses("number" == typeof b.currentSlide ? b.currentSlide : 0), b.options.draggable === !0 && b.$list.addClass("draggable")
        }, b.prototype.buildRows = function () {
            var b, c, d, e, f, g, h, a = this;
            if (e = document.createDocumentFragment(), g = a.$slider.children(), a.options.rows > 1) {
                for (h = a.options.slidesPerRow * a.options.rows, f = Math.ceil(g.length / h), b = 0; f > b; b++) {
                    var i = document.createElement("div");
                    for (c = 0; c < a.options.rows; c++) {
                        var j = document.createElement("div");
                        for (d = 0; d < a.options.slidesPerRow; d++) {
                            var k = b * h + (c * a.options.slidesPerRow + d);
                            g.get(k) && j.appendChild(g.get(k))
                        }
                        i.appendChild(j)
                    }
                    e.appendChild(i)
                }
                a.$slider.html(e), a.$slider.children().children().children().css({
                    width: 100 / a.options.slidesPerRow + "%",
                    display: "inline-block"
                })
            }
        }, b.prototype.checkResponsive = function (b, c) {
            var e, f, g, d = this,
                h = !1,
                i = d.$slider.width(),
                j = window.innerWidth || a(window).width();
            if ("window" === d.respondTo ? g = j : "slider" === d.respondTo ? g = i : "min" === d.respondTo && (g = Math.min(j, i)), d.options.responsive && d.options.responsive.length && null !== d.options.responsive) {
                f = null;
                for (e in d.breakpoints) d.breakpoints.hasOwnProperty(e) && (d.originalSettings.mobileFirst === !1 ? g < d.breakpoints[e] && (f = d.breakpoints[e]) : g > d.breakpoints[e] && (f = d.breakpoints[e]));
                null !== f ? null !== d.activeBreakpoint ? (f !== d.activeBreakpoint || c) && (d.activeBreakpoint = f, "unslick" === d.breakpointSettings[f] ? d.unslick(f) : (d.options = a.extend({}, d.originalSettings, d.breakpointSettings[f]), b === !0 && (d.currentSlide = d.options.initialSlide), d.refresh(b)), h = f) : (d.activeBreakpoint = f, "unslick" === d.breakpointSettings[f] ? d.unslick(f) : (d.options = a.extend({}, d.originalSettings, d.breakpointSettings[f]), b === !0 && (d.currentSlide = d.options.initialSlide), d.refresh(b)), h = f) : null !== d.activeBreakpoint && (d.activeBreakpoint = null, d.options = d.originalSettings, b === !0 && (d.currentSlide = d.options.initialSlide), d.refresh(b), h = f), b || h === !1 || d.$slider.trigger("breakpoint", [d, h])
            }
        }, b.prototype.changeSlide = function (b, c) {
            var f, g, h, d = this,
                e = a(b.target);
            switch (e.is("a") && b.preventDefault(), e.is("li") || (e = e.closest("li")), h = 0 !== d.slideCount % d.options.slidesToScroll, f = h ? 0 : (d.slideCount - d.currentSlide) % d.options.slidesToScroll, b.data.message) {
                case "previous":
                    g = 0 === f ? d.options.slidesToScroll : d.options.slidesToShow - f, d.slideCount > d.options.slidesToShow && d.slideHandler(d.currentSlide - g, !1, c);
                    break;
                case "next":
                    g = 0 === f ? d.options.slidesToScroll : f, d.slideCount > d.options.slidesToShow && d.slideHandler(d.currentSlide + g, !1, c);
                    break;
                case "index":
                    var i = 0 === b.data.index ? 0 : b.data.index || e.index() * d.options.slidesToScroll;
                    d.slideHandler(d.checkNavigable(i), !1, c), e.children().trigger("focus");
                    break;
                default:
                    return
            }
        }, b.prototype.checkNavigable = function (a) {
            var c, d, b = this;
            if (c = b.getNavigableIndexes(), d = 0, a > c[c.length - 1]) a = c[c.length - 1];
            else
                for (var e in c) {
                    if (a < c[e]) {
                        a = d;
                        break
                    }
                    d = c[e]
                }
            return a
        }, b.prototype.cleanUpEvents = function () {
            var b = this;
            b.options.dots && null !== b.$dots && (a("li", b.$dots).off("click.slick", b.changeSlide), b.options.pauseOnDotsHover === !0 && b.options.autoplay === !0 && a("li", b.$dots).off("mouseenter.slick", a.proxy(b.setPaused, b, !0)).off("mouseleave.slick", a.proxy(b.setPaused, b, !1))), b.options.arrows === !0 && b.slideCount > b.options.slidesToShow && (b.$prevArrow && b.$prevArrow.off("click.slick", b.changeSlide), b.$nextArrow && b.$nextArrow.off("click.slick", b.changeSlide)), b.$list.off("touchstart.slick mousedown.slick", b.swipeHandler), b.$list.off("touchmove.slick mousemove.slick", b.swipeHandler), b.$list.off("touchend.slick mouseup.slick", b.swipeHandler), b.$list.off("touchcancel.slick mouseleave.slick", b.swipeHandler), b.$list.off("click.slick", b.clickHandler), a(document).off(b.visibilityChange, b.visibility), b.$list.off("mouseenter.slick", a.proxy(b.setPaused, b, !0)), b.$list.off("mouseleave.slick", a.proxy(b.setPaused, b, !1)), b.options.accessibility === !0 && b.$list.off("keydown.slick", b.keyHandler), b.options.focusOnSelect === !0 && a(b.$slideTrack).children().off("click.slick", b.selectHandler), a(window).off("orientationchange.slick.slick-" + b.instanceUid, b.orientationChange), a(window).off("resize.slick.slick-" + b.instanceUid, b.resize), a("[draggable!=true]", b.$slideTrack).off("dragstart", b.preventDefault), a(window).off("load.slick.slick-" + b.instanceUid, b.setPosition), a(document).off("ready.slick.slick-" + b.instanceUid, b.setPosition)
        }, b.prototype.cleanUpRows = function () {
            var b, a = this;
            a.options.rows > 1 && (b = a.$slides.children().children(), b.removeAttr("style"), a.$slider.html(b))
        }, b.prototype.clickHandler = function (a) {
            var b = this;
            b.shouldClick === !1 && (a.stopImmediatePropagation(), a.stopPropagation(), a.preventDefault())
        }, b.prototype.destroy = function (b) {
            var c = this;
            c.autoPlayClear(), c.touchObject = {}, c.cleanUpEvents(), a(".slick-cloned", c.$slider).detach(), c.$dots && c.$dots.remove(), c.options.arrows === !0 && (c.$prevArrow && c.$prevArrow.length && (c.$prevArrow.removeClass("slick-disabled slick-arrow slick-hidden").removeAttr("aria-hidden aria-disabled tabindex").css("display", ""), c.htmlExpr.test(c.options.prevArrow) && c.$prevArrow.remove()), c.$nextArrow && c.$nextArrow.length && (c.$nextArrow.removeClass("slick-disabled slick-arrow slick-hidden").removeAttr("aria-hidden aria-disabled tabindex").css("display", ""), c.htmlExpr.test(c.options.nextArrow) && c.$nextArrow.remove())), c.$slides && (c.$slides.removeClass("slick-slide slick-active slick-center slick-visible slick-current").removeAttr("aria-hidden").removeAttr("data-slick-index").each(function () {
                a(this).attr("style", a(this).data("originalStyling"))
            }), c.$slideTrack.children(this.options.slide).detach(), c.$slideTrack.detach(), c.$list.detach(), c.$slider.append(c.$slides)), c.cleanUpRows(), c.$slider.removeClass("slick-slider"), c.$slider.removeClass("slick-initialized"), c.unslicked = !0, b || c.$slider.trigger("destroy", [c])
        }, b.prototype.disableTransition = function (a) {
            var b = this,
                c = {};
            c[b.transitionType] = "", b.options.fade === !1 ? b.$slideTrack.css(c) : b.$slides.eq(a).css(c)
        }, b.prototype.fadeSlide = function (a, b) {
            var c = this;
            c.cssTransitions === !1 ? (c.$slides.eq(a).css({
                zIndex: c.options.zIndex
            }), c.$slides.eq(a).animate({
                opacity: 1
            }, c.options.speed, c.options.easing, b)) : (c.applyTransition(a), c.$slides.eq(a).css({
                opacity: 1,
                zIndex: c.options.zIndex
            }), b && setTimeout(function () {
                c.disableTransition(a), b.call()
            }, c.options.speed))
        }, b.prototype.fadeSlideOut = function (a) {
            var b = this;
            b.cssTransitions === !1 ? b.$slides.eq(a).animate({
                opacity: 0,
                zIndex: b.options.zIndex - 2
            }, b.options.speed, b.options.easing) : (b.applyTransition(a), b.$slides.eq(a).css({
                opacity: 0,
                zIndex: b.options.zIndex - 2
            }))
        }, b.prototype.filterSlides = b.prototype.slickFilter = function (a) {
            var b = this;
            null !== a && (b.unload(), b.$slideTrack.children(this.options.slide).detach(), b.$slidesCache.filter(a).appendTo(b.$slideTrack), b.reinit())
        }, b.prototype.getCurrent = b.prototype.slickCurrentSlide = function () {
            var a = this;
            return a.currentSlide
        }, b.prototype.getDotCount = function () {
            var a = this,
                b = 0,
                c = 0,
                d = 0;
            if (a.options.infinite === !0)
                for (; b < a.slideCount;) ++d, b = c + a.options.slidesToShow, c += a.options.slidesToScroll <= a.options.slidesToShow ? a.options.slidesToScroll : a.options.slidesToShow;
            else if (a.options.centerMode === !0) d = a.slideCount;
            else
                for (; b < a.slideCount;) ++d, b = c + a.options.slidesToShow, c += a.options.slidesToScroll <= a.options.slidesToShow ? a.options.slidesToScroll : a.options.slidesToShow;
            return d - 1
        }, b.prototype.getLeft = function (a) {
            var c, d, f, b = this,
                e = 0;
            return b.slideOffset = 0, d = b.$slides.first().outerHeight(!0), b.options.infinite === !0 ? (b.slideCount > b.options.slidesToShow && (b.slideOffset = -1 * b.slideWidth * b.options.slidesToShow, e = -1 * d * b.options.slidesToShow), 0 !== b.slideCount % b.options.slidesToScroll && a + b.options.slidesToScroll > b.slideCount && b.slideCount > b.options.slidesToShow && (a > b.slideCount ? (b.slideOffset = -1 * (b.options.slidesToShow - (a - b.slideCount)) * b.slideWidth, e = -1 * (b.options.slidesToShow - (a - b.slideCount)) * d) : (b.slideOffset = -1 * b.slideCount % b.options.slidesToScroll * b.slideWidth, e = -1 * b.slideCount % b.options.slidesToScroll * d))) : a + b.options.slidesToShow > b.slideCount && (b.slideOffset = (a + b.options.slidesToShow - b.slideCount) * b.slideWidth, e = (a + b.options.slidesToShow - b.slideCount) * d), b.slideCount <= b.options.slidesToShow && (b.slideOffset = 0, e = 0), b.options.centerMode === !0 && b.options.infinite === !0 ? b.slideOffset += b.slideWidth * Math.floor(b.options.slidesToShow / 2) - b.slideWidth : b.options.centerMode === !0 && (b.slideOffset = 0, b.slideOffset += b.slideWidth * Math.floor(b.options.slidesToShow / 2)), c = b.options.vertical === !1 ? -1 * a * b.slideWidth + b.slideOffset : -1 * a * d + e, b.options.variableWidth === !0 && (f = b.slideCount <= b.options.slidesToShow || b.options.infinite === !1 ? b.$slideTrack.children(".slick-slide").eq(a) : b.$slideTrack.children(".slick-slide").eq(a + b.options.slidesToShow), c = f[0] ? -1 * f[0].offsetLeft : 0, b.options.centerMode === !0 && (f = b.options.infinite === !1 ? b.$slideTrack.children(".slick-slide").eq(a) : b.$slideTrack.children(".slick-slide").eq(a + b.options.slidesToShow + 1), c = f[0] ? -1 * f[0].offsetLeft : 0, c += (b.$list.width() - f.outerWidth()) / 2)), c
        }, b.prototype.getOption = b.prototype.slickGetOption = function (a) {
            var b = this;
            return b.options[a]
        }, b.prototype.getNavigableIndexes = function () {
            var e, a = this,
                b = 0,
                c = 0,
                d = [];
            for (a.options.infinite === !1 ? e = a.slideCount : (b = -1 * a.options.slidesToScroll, c = -1 * a.options.slidesToScroll, e = 2 * a.slideCount); e > b;) d.push(b), b = c + a.options.slidesToScroll, c += a.options.slidesToScroll <= a.options.slidesToShow ? a.options.slidesToScroll : a.options.slidesToShow;
            return d
        }, b.prototype.getSlick = function () {
            return this
        }, b.prototype.getSlideCount = function () {
            var c, d, e, b = this;
            return e = b.options.centerMode === !0 ? b.slideWidth * Math.floor(b.options.slidesToShow / 2) : 0, b.options.swipeToSlide === !0 ? (b.$slideTrack.find(".slick-slide").each(function (c, f) {
                return f.offsetLeft - e + a(f).outerWidth() / 2 > -1 * b.swipeLeft ? (d = f, !1) : void 0
            }), c = Math.abs(a(d).attr("data-slick-index") - b.currentSlide) || 1) : b.options.slidesToScroll
        }, b.prototype.goTo = b.prototype.slickGoTo = function (a, b) {
            var c = this;
            c.changeSlide({
                data: {
                    message: "index",
                    index: parseInt(a)
                }
            }, b)
        }, b.prototype.init = function (b) {
            var c = this;
            a(c.$slider).hasClass("slick-initialized") || (a(c.$slider).addClass("slick-initialized"), c.buildRows(), c.buildOut(), c.setProps(), c.startLoad(), c.loadSlider(), c.initializeEvents(), c.updateArrows(), c.updateDots()), b && c.$slider.trigger("init", [c]), c.options.accessibility === !0 && c.initADA()
        }, b.prototype.initArrowEvents = function () {
            var a = this;
            a.options.arrows === !0 && a.slideCount > a.options.slidesToShow && (a.$prevArrow.on("click.slick", {
                message: "previous"
            }, a.changeSlide), a.$nextArrow.on("click.slick", {
                message: "next"
            }, a.changeSlide))
        }, b.prototype.initDotEvents = function () {
            var b = this;
            b.options.dots === !0 && b.slideCount > b.options.slidesToShow && a("li", b.$dots).on("click.slick", {
                message: "index"
            }, b.changeSlide), b.options.dots === !0 && b.options.pauseOnDotsHover === !0 && b.options.autoplay === !0 && a("li", b.$dots).on("mouseenter.slick", a.proxy(b.setPaused, b, !0)).on("mouseleave.slick", a.proxy(b.setPaused, b, !1))
        }, b.prototype.initializeEvents = function () {
            var b = this;
            b.initArrowEvents(), b.initDotEvents(), b.$list.on("touchstart.slick mousedown.slick", {
                action: "start"
            }, b.swipeHandler), b.$list.on("touchmove.slick mousemove.slick", {
                action: "move"
            }, b.swipeHandler), b.$list.on("touchend.slick mouseup.slick", {
                action: "end"
            }, b.swipeHandler), b.$list.on("touchcancel.slick mouseleave.slick", {
                action: "end"
            }, b.swipeHandler), b.$list.on("click.slick", b.clickHandler), a(document).on(b.visibilityChange, a.proxy(b.visibility, b)), b.$list.on("mouseenter.slick", a.proxy(b.setPaused, b, !0)), b.$list.on("mouseleave.slick", a.proxy(b.setPaused, b, !1)), b.options.accessibility === !0 && b.$list.on("keydown.slick", b.keyHandler), b.options.focusOnSelect === !0 && a(b.$slideTrack).children().on("click.slick", b.selectHandler), a(window).on("orientationchange.slick.slick-" + b.instanceUid, a.proxy(b.orientationChange, b)), a(window).on("resize.slick.slick-" + b.instanceUid, a.proxy(b.resize, b)), a("[draggable!=true]", b.$slideTrack).on("dragstart", b.preventDefault), a(window).on("load.slick.slick-" + b.instanceUid, b.setPosition), a(document).on("ready.slick.slick-" + b.instanceUid, b.setPosition)
        }, b.prototype.initUI = function () {
            var a = this;
            a.options.arrows === !0 && a.slideCount > a.options.slidesToShow && (a.$prevArrow.show(), a.$nextArrow.show()), a.options.dots === !0 && a.slideCount > a.options.slidesToShow && a.$dots.show(), a.options.autoplay === !0 && a.autoPlay()
        }, b.prototype.keyHandler = function (a) {
            var b = this;
            a.target.tagName.match("TEXTAREA|INPUT|SELECT") || (37 === a.keyCode && b.options.accessibility === !0 ? b.changeSlide({
                data: {
                    message: "previous"
                }
            }) : 39 === a.keyCode && b.options.accessibility === !0 && b.changeSlide({
                data: {
                    message: "next"
                }
            }))
        }, b.prototype.lazyLoad = function () {
            function g(b) {
                a("img[data-lazy]", b).each(function () {
                    var b = a(this),
                        c = a(this).attr("data-lazy"),
                        d = document.createElement("img");
                    d.onload = function () {
                        b.animate({
                            opacity: 0
                        }, 100, function () {
                            b.attr("src", c).animate({
                                opacity: 1
                            }, 200, function () {
                                b.removeAttr("data-lazy").removeClass("slick-loading")
                            })
                        })
                    }, d.src = c
                })
            }
            var c, d, e, f, b = this;
            b.options.centerMode === !0 ? b.options.infinite === !0 ? (e = b.currentSlide + (b.options.slidesToShow / 2 + 1), f = e + b.options.slidesToShow + 2) : (e = Math.max(0, b.currentSlide - (b.options.slidesToShow / 2 + 1)), f = 2 + (b.options.slidesToShow / 2 + 1) + b.currentSlide) : (e = b.options.infinite ? b.options.slidesToShow + b.currentSlide : b.currentSlide, f = e + b.options.slidesToShow, b.options.fade === !0 && (e > 0 && e--, f <= b.slideCount && f++)), c = b.$slider.find(".slick-slide").slice(e, f), g(c), b.slideCount <= b.options.slidesToShow ? (d = b.$slider.find(".slick-slide"), g(d)) : b.currentSlide >= b.slideCount - b.options.slidesToShow ? (d = b.$slider.find(".slick-cloned").slice(0, b.options.slidesToShow), g(d)) : 0 === b.currentSlide && (d = b.$slider.find(".slick-cloned").slice(-1 * b.options.slidesToShow), g(d))
        }, b.prototype.loadSlider = function () {
            var a = this;
            a.setPosition(), a.$slideTrack.css({
                opacity: 1
            }), a.$slider.removeClass("slick-loading"), a.initUI(), "progressive" === a.options.lazyLoad && a.progressiveLazyLoad()
        }, b.prototype.next = b.prototype.slickNext = function () {
            var a = this;
            a.changeSlide({
                data: {
                    message: "next"
                }
            })
        }, b.prototype.orientationChange = function () {
            var a = this;
            a.checkResponsive(), a.setPosition()
        }, b.prototype.pause = b.prototype.slickPause = function () {
            var a = this;
            a.autoPlayClear(), a.paused = !0
        }, b.prototype.play = b.prototype.slickPlay = function () {
            var a = this;
            a.paused = !1, a.autoPlay()
        }, b.prototype.postSlide = function (a) {
            var b = this;
            b.$slider.trigger("afterChange", [b, a]), b.animating = !1, b.setPosition(), b.swipeLeft = null, b.options.autoplay === !0 && b.paused === !1 && b.autoPlay(), b.options.accessibility === !0 && b.initADA()
        }, b.prototype.prev = b.prototype.slickPrev = function () {
            var a = this;
            a.changeSlide({
                data: {
                    message: "previous"
                }
            })
        }, b.prototype.preventDefault = function (a) {
            a.preventDefault()
        }, b.prototype.progressiveLazyLoad = function () {
            var c, d, b = this;
            c = a("img[data-lazy]", b.$slider).length, c > 0 && (d = a("img[data-lazy]", b.$slider).first(), d.attr("src", d.attr("data-lazy")).removeClass("slick-loading").load(function () {
                d.removeAttr("data-lazy"), b.progressiveLazyLoad(), b.options.adaptiveHeight === !0 && b.setPosition()
            }).error(function () {
                d.removeAttr("data-lazy"), b.progressiveLazyLoad()
            }))
        }, b.prototype.refresh = function (b) {
            var c = this,
                d = c.currentSlide;
            c.destroy(!0), a.extend(c, c.initials, {
                currentSlide: d
            }), c.init(), b || c.changeSlide({
                data: {
                    message: "index",
                    index: d
                }
            }, !1)
        }, b.prototype.registerBreakpoints = function () {
            var c, d, e, b = this,
                f = b.options.responsive || null;
            if ("array" === a.type(f) && f.length) {
                b.respondTo = b.options.respondTo || "window";
                for (c in f)
                    if (e = b.breakpoints.length - 1, d = f[c].breakpoint, f.hasOwnProperty(c)) {
                        for (; e >= 0;) b.breakpoints[e] && b.breakpoints[e] === d && b.breakpoints.splice(e, 1), e--;
                        b.breakpoints.push(d), b.breakpointSettings[d] = f[c].settings
                    } b.breakpoints.sort(function (a, c) {
                    return b.options.mobileFirst ? a - c : c - a
                })
            }
        }, b.prototype.reinit = function () {
            var b = this;
            b.$slides = b.$slideTrack.children(b.options.slide).addClass("slick-slide"), b.slideCount = b.$slides.length, b.currentSlide >= b.slideCount && 0 !== b.currentSlide && (b.currentSlide = b.currentSlide - b.options.slidesToScroll), b.slideCount <= b.options.slidesToShow && (b.currentSlide = 0), b.registerBreakpoints(), b.setProps(), b.setupInfinite(), b.buildArrows(), b.updateArrows(), b.initArrowEvents(), b.buildDots(), b.updateDots(), b.initDotEvents(), b.checkResponsive(!1, !0), b.options.focusOnSelect === !0 && a(b.$slideTrack).children().on("click.slick", b.selectHandler), b.setSlideClasses(0), b.setPosition(), b.$slider.trigger("reInit", [b]), b.options.autoplay === !0 && b.focusHandler()
        }, b.prototype.resize = function () {
            var b = this;
            a(window).width() !== b.windowWidth && (clearTimeout(b.windowDelay), b.windowDelay = window.setTimeout(function () {
                b.windowWidth = a(window).width(), b.checkResponsive(), b.unslicked || b.setPosition()
            }, 50))
        }, b.prototype.removeSlide = b.prototype.slickRemove = function (a, b, c) {
            var d = this;
            return "boolean" == typeof a ? (b = a, a = b === !0 ? 0 : d.slideCount - 1) : a = b === !0 ? --a : a, d.slideCount < 1 || 0 > a || a > d.slideCount - 1 ? !1 : (d.unload(), c === !0 ? d.$slideTrack.children().remove() : d.$slideTrack.children(this.options.slide).eq(a).remove(), d.$slides = d.$slideTrack.children(this.options.slide), d.$slideTrack.children(this.options.slide).detach(), d.$slideTrack.append(d.$slides), d.$slidesCache = d.$slides, d.reinit(), void 0)
        }, b.prototype.setCSS = function (a) {
            var d, e, b = this,
                c = {};
            b.options.rtl === !0 && (a = -a), d = "left" == b.positionProp ? Math.ceil(a) + "px" : "0px", e = "top" == b.positionProp ? Math.ceil(a) + "px" : "0px", c[b.positionProp] = a, b.transformsEnabled === !1 ? b.$slideTrack.css(c) : (c = {}, b.cssTransitions === !1 ? (c[b.animType] = "translate(" + d + ", " + e + ")", b.$slideTrack.css(c)) : (c[b.animType] = "translate3d(" + d + ", " + e + ", 0px)", b.$slideTrack.css(c)))
        }, b.prototype.setDimensions = function () {
            var a = this;
            a.options.vertical === !1 ? a.options.centerMode === !0 && a.$list.css({
                padding: "0px " + a.options.centerPadding
            }) : (a.$list.height(a.$slides.first().outerHeight(!0) * a.options.slidesToShow), a.options.centerMode === !0 && a.$list.css({
                padding: a.options.centerPadding + " 0px"
            })), a.listWidth = a.$list.width(), a.listHeight = a.$list.height(), a.options.vertical === !1 && a.options.variableWidth === !1 ? (a.slideWidth = Math.ceil(a.listWidth / a.options.slidesToShow), a.$slideTrack.width(Math.ceil(a.slideWidth * a.$slideTrack.children(".slick-slide").length))) : a.options.variableWidth === !0 ? a.$slideTrack.width(5e3 * a.slideCount) : (a.slideWidth = Math.ceil(a.listWidth), a.$slideTrack.height(Math.ceil(a.$slides.first().outerHeight(!0) * a.$slideTrack.children(".slick-slide").length)));
            var b = a.$slides.first().outerWidth(!0) - a.$slides.first().width();
            a.options.variableWidth === !1 && a.$slideTrack.children(".slick-slide").width(a.slideWidth - b)
        }, b.prototype.setFade = function () {
            var c, b = this;
            b.$slides.each(function (d, e) {
                c = -1 * b.slideWidth * d, b.options.rtl === !0 ? a(e).css({
                    position: "relative",
                    right: c,
                    top: 0,
                    zIndex: b.options.zIndex - 2,
                    opacity: 0
                }) : a(e).css({
                    position: "relative",
                    left: c,
                    top: 0,
                    zIndex: b.options.zIndex - 2,
                    opacity: 0
                })
            }), b.$slides.eq(b.currentSlide).css({
                zIndex: b.options.zIndex - 1,
                opacity: 1
            })
        }, b.prototype.setHeight = function () {
            var a = this;
            if (1 === a.options.slidesToShow && a.options.adaptiveHeight === !0 && a.options.vertical === !1) {
                var b = a.$slides.eq(a.currentSlide).outerHeight(!0);
                a.$list.css("height", b)
            }
        }, b.prototype.setOption = b.prototype.slickSetOption = function (b, c, d) {
            var f, g, e = this;
            if ("responsive" === b && "array" === a.type(c))
                for (g in c)
                    if ("array" !== a.type(e.options.responsive)) e.options.responsive = [c[g]];
                    else {
                        for (f = e.options.responsive.length - 1; f >= 0;) e.options.responsive[f].breakpoint === c[g].breakpoint && e.options.responsive.splice(f, 1), f--;
                        e.options.responsive.push(c[g])
                    }
            else e.options[b] = c;
            d === !0 && (e.unload(), e.reinit())
        }, b.prototype.setPosition = function () {
            var a = this;
            a.setDimensions(), a.setHeight(), a.options.fade === !1 ? a.setCSS(a.getLeft(a.currentSlide)) : a.setFade(), a.$slider.trigger("setPosition", [a])
        }, b.prototype.setProps = function () {
            var a = this,
                b = document.body.style;
            a.positionProp = a.options.vertical === !0 ? "top" : "left", "top" === a.positionProp ? a.$slider.addClass("slick-vertical") : a.$slider.removeClass("slick-vertical"), (void 0 !== b.WebkitTransition || void 0 !== b.MozTransition || void 0 !== b.msTransition) && a.options.useCSS === !0 && (a.cssTransitions = !0), a.options.fade && ("number" == typeof a.options.zIndex ? a.options.zIndex < 3 && (a.options.zIndex = 3) : a.options.zIndex = a.defaults.zIndex), void 0 !== b.OTransform && (a.animType = "OTransform", a.transformType = "-o-transform", a.transitionType = "OTransition", void 0 === b.perspectiveProperty && void 0 === b.webkitPerspective && (a.animType = !1)), void 0 !== b.MozTransform && (a.animType = "MozTransform", a.transformType = "-moz-transform", a.transitionType = "MozTransition", void 0 === b.perspectiveProperty && void 0 === b.MozPerspective && (a.animType = !1)), void 0 !== b.webkitTransform && (a.animType = "webkitTransform", a.transformType = "-webkit-transform", a.transitionType = "webkitTransition", void 0 === b.perspectiveProperty && void 0 === b.webkitPerspective && (a.animType = !1)), void 0 !== b.msTransform && (a.animType = "msTransform", a.transformType = "-ms-transform", a.transitionType = "msTransition", void 0 === b.msTransform && (a.animType = !1)), void 0 !== b.transform && a.animType !== !1 && (a.animType = "transform", a.transformType = "transform", a.transitionType = "transition"), a.transformsEnabled = null !== a.animType && a.animType !== !1
        }, b.prototype.setSlideClasses = function (a) {
            var c, d, e, f, b = this;
            d = b.$slider.find(".slick-slide").removeClass("slick-active slick-center slick-current").attr("aria-hidden", "true"), b.$slides.eq(a).addClass("slick-current"), b.options.centerMode === !0 ? (c = Math.floor(b.options.slidesToShow / 2), b.options.infinite === !0 && (a >= c && a <= b.slideCount - 1 - c ? b.$slides.slice(a - c, a + c + 1).addClass("slick-active").attr("aria-hidden", "false") : (e = b.options.slidesToShow + a, d.slice(e - c + 1, e + c + 2).addClass("slick-active").attr("aria-hidden", "false")), 0 === a ? d.eq(d.length - 1 - b.options.slidesToShow).addClass("slick-center") : a === b.slideCount - 1 && d.eq(b.options.slidesToShow).addClass("slick-center")), b.$slides.eq(a).addClass("slick-center")) : a >= 0 && a <= b.slideCount - b.options.slidesToShow ? b.$slides.slice(a, a + b.options.slidesToShow).addClass("slick-active").attr("aria-hidden", "false") : d.length <= b.options.slidesToShow ? d.addClass("slick-active").attr("aria-hidden", "false") : (f = b.slideCount % b.options.slidesToShow, e = b.options.infinite === !0 ? b.options.slidesToShow + a : a, b.options.slidesToShow == b.options.slidesToScroll && b.slideCount - a < b.options.slidesToShow ? d.slice(e - (b.options.slidesToShow - f), e + f).addClass("slick-active").attr("aria-hidden", "false") : d.slice(e, e + b.options.slidesToShow).addClass("slick-active").attr("aria-hidden", "false")), "ondemand" === b.options.lazyLoad && b.lazyLoad()
        }, b.prototype.setupInfinite = function () {
            var c, d, e, b = this;
            if (b.options.fade === !0 && (b.options.centerMode = !1), b.options.infinite === !0 && b.options.fade === !1 && (d = null, b.slideCount > b.options.slidesToShow)) {
                for (e = b.options.centerMode === !0 ? b.options.slidesToShow + 1 : b.options.slidesToShow, c = b.slideCount; c > b.slideCount - e; c -= 1) d = c - 1, a(b.$slides[d]).clone(!0).attr("id", "").attr("data-slick-index", d - b.slideCount).prependTo(b.$slideTrack).addClass("slick-cloned");
                for (c = 0; e > c; c += 1) d = c, a(b.$slides[d]).clone(!0).attr("id", "").attr("data-slick-index", d + b.slideCount).appendTo(b.$slideTrack).addClass("slick-cloned");
                b.$slideTrack.find(".slick-cloned").find("[id]").each(function () {
                    a(this).attr("id", "")
                })
            }
        }, b.prototype.setPaused = function (a) {
            var b = this;
            b.options.autoplay === !0 && b.options.pauseOnHover === !0 && (b.paused = a, a ? b.autoPlayClear() : b.autoPlay())
        }, b.prototype.selectHandler = function (b) {
            var c = this,
                d = a(b.target).is(".slick-slide") ? a(b.target) : a(b.target).parents(".slick-slide"),
                e = parseInt(d.attr("data-slick-index"));
            return e || (e = 0), c.slideCount <= c.options.slidesToShow ? (c.setSlideClasses(e), c.asNavFor(e), void 0) : (c.slideHandler(e), void 0)
        }, b.prototype.slideHandler = function (a, b, c) {
            var d, e, f, g, h = null,
                i = this;
            return b = b || !1, i.animating === !0 && i.options.waitForAnimate === !0 || i.options.fade === !0 && i.currentSlide === a || i.slideCount <= i.options.slidesToShow ? void 0 : (b === !1 && i.asNavFor(a), d = a, h = i.getLeft(d), g = i.getLeft(i.currentSlide), i.currentLeft = null === i.swipeLeft ? g : i.swipeLeft, i.options.infinite === !1 && i.options.centerMode === !1 && (0 > a || a > i.getDotCount() * i.options.slidesToScroll) ? (i.options.fade === !1 && (d = i.currentSlide, c !== !0 ? i.animateSlide(g, function () {
                i.postSlide(d)
            }) : i.postSlide(d)), void 0) : i.options.infinite === !1 && i.options.centerMode === !0 && (0 > a || a > i.slideCount - i.options.slidesToScroll) ? (i.options.fade === !1 && (d = i.currentSlide, c !== !0 ? i.animateSlide(g, function () {
                i.postSlide(d)
            }) : i.postSlide(d)), void 0) : (i.options.autoplay === !0 && clearInterval(i.autoPlayTimer), e = 0 > d ? 0 !== i.slideCount % i.options.slidesToScroll ? i.slideCount - i.slideCount % i.options.slidesToScroll : i.slideCount + d : d >= i.slideCount ? 0 !== i.slideCount % i.options.slidesToScroll ? 0 : d - i.slideCount : d, i.animating = !0, i.$slider.trigger("beforeChange", [i, i.currentSlide, e]), f = i.currentSlide, i.currentSlide = e, i.setSlideClasses(i.currentSlide), i.updateDots(), i.updateArrows(), i.options.fade === !0 ? (c !== !0 ? (i.fadeSlideOut(f), i.fadeSlide(e, function () {
                i.postSlide(e)
            })) : i.postSlide(e), i.animateHeight(), void 0) : (c !== !0 ? i.animateSlide(h, function () {
                i.postSlide(e)
            }) : i.postSlide(e), void 0)))
        }, b.prototype.startLoad = function () {
            var a = this;
            a.options.arrows === !0 && a.slideCount > a.options.slidesToShow && (a.$prevArrow.hide(), a.$nextArrow.hide()), a.options.dots === !0 && a.slideCount > a.options.slidesToShow && a.$dots.hide(), a.$slider.addClass("slick-loading")
        }, b.prototype.swipeDirection = function () {
            var a, b, c, d, e = this;
            return a = e.touchObject.startX - e.touchObject.curX, b = e.touchObject.startY - e.touchObject.curY, c = Math.atan2(b, a), d = Math.round(180 * c / Math.PI), 0 > d && (d = 360 - Math.abs(d)), 45 >= d && d >= 0 ? e.options.rtl === !1 ? "left" : "right" : 360 >= d && d >= 315 ? e.options.rtl === !1 ? "left" : "right" : d >= 135 && 225 >= d ? e.options.rtl === !1 ? "right" : "left" : e.options.verticalSwiping === !0 ? d >= 35 && 135 >= d ? "left" : "right" : "vertical"
        }, b.prototype.swipeEnd = function () {
            var c, b = this;
            if (b.dragging = !1, b.shouldClick = b.touchObject.swipeLength > 10 ? !1 : !0, void 0 === b.touchObject.curX) return !1;
            if (b.touchObject.edgeHit === !0 && b.$slider.trigger("edge", [b, b.swipeDirection()]), b.touchObject.swipeLength >= b.touchObject.minSwipe) switch (b.swipeDirection()) {
                case "left":
                    c = b.options.swipeToSlide ? b.checkNavigable(b.currentSlide + b.getSlideCount()) : b.currentSlide + b.getSlideCount(), b.slideHandler(c), b.currentDirection = 0, b.touchObject = {}, b.$slider.trigger("swipe", [b, "left"]);
                    break;
                case "right":
                    c = b.options.swipeToSlide ? b.checkNavigable(b.currentSlide - b.getSlideCount()) : b.currentSlide - b.getSlideCount(), b.slideHandler(c), b.currentDirection = 1, b.touchObject = {}, b.$slider.trigger("swipe", [b, "right"])
            } else b.touchObject.startX !== b.touchObject.curX && (b.slideHandler(b.currentSlide), b.touchObject = {})
        }, b.prototype.swipeHandler = function (a) {
            var b = this;
            if (!(b.options.swipe === !1 || "ontouchend" in document && b.options.swipe === !1 || b.options.draggable === !1 && -1 !== a.type.indexOf("mouse"))) switch (b.touchObject.fingerCount = a.originalEvent && void 0 !== a.originalEvent.touches ? a.originalEvent.touches.length : 1, b.touchObject.minSwipe = b.listWidth / b.options.touchThreshold, b.options.verticalSwiping === !0 && (b.touchObject.minSwipe = b.listHeight / b.options.touchThreshold), a.data.action) {
                case "start":
                    b.swipeStart(a);
                    break;
                case "move":
                    b.swipeMove(a);
                    break;
                case "end":
                    b.swipeEnd(a)
            }
        }, b.prototype.swipeMove = function (a) {
            var d, e, f, g, h, b = this;
            return h = void 0 !== a.originalEvent ? a.originalEvent.touches : null, !b.dragging || h && 1 !== h.length ? !1 : (d = b.getLeft(b.currentSlide), b.touchObject.curX = void 0 !== h ? h[0].pageX : a.clientX, b.touchObject.curY = void 0 !== h ? h[0].pageY : a.clientY, b.touchObject.swipeLength = Math.round(Math.sqrt(Math.pow(b.touchObject.curX - b.touchObject.startX, 2))), b.options.verticalSwiping === !0 && (b.touchObject.swipeLength = Math.round(Math.sqrt(Math.pow(b.touchObject.curY - b.touchObject.startY, 2)))), e = b.swipeDirection(), "vertical" !== e ? (void 0 !== a.originalEvent && b.touchObject.swipeLength > 4 && a.preventDefault(), g = (b.options.rtl === !1 ? 1 : -1) * (b.touchObject.curX > b.touchObject.startX ? 1 : -1), b.options.verticalSwiping === !0 && (g = b.touchObject.curY > b.touchObject.startY ? 1 : -1), f = b.touchObject.swipeLength, b.touchObject.edgeHit = !1, b.options.infinite === !1 && (0 === b.currentSlide && "right" === e || b.currentSlide >= b.getDotCount() && "left" === e) && (f = b.touchObject.swipeLength * b.options.edgeFriction, b.touchObject.edgeHit = !0), b.swipeLeft = b.options.vertical === !1 ? d + f * g : d + f * (b.$list.height() / b.listWidth) * g, b.options.verticalSwiping === !0 && (b.swipeLeft = d + f * g), b.options.fade === !0 || b.options.touchMove === !1 ? !1 : b.animating === !0 ? (b.swipeLeft = null, !1) : (b.setCSS(b.swipeLeft), void 0)) : void 0)
        }, b.prototype.swipeStart = function (a) {
            var c, b = this;
            return 1 !== b.touchObject.fingerCount || b.slideCount <= b.options.slidesToShow ? (b.touchObject = {}, !1) : (void 0 !== a.originalEvent && void 0 !== a.originalEvent.touches && (c = a.originalEvent.touches[0]), b.touchObject.startX = b.touchObject.curX = void 0 !== c ? c.pageX : a.clientX, b.touchObject.startY = b.touchObject.curY = void 0 !== c ? c.pageY : a.clientY, b.dragging = !0, void 0)
        }, b.prototype.unfilterSlides = b.prototype.slickUnfilter = function () {
            var a = this;
            null !== a.$slidesCache && (a.unload(), a.$slideTrack.children(this.options.slide).detach(), a.$slidesCache.appendTo(a.$slideTrack), a.reinit())
        }, b.prototype.unload = function () {
            var b = this;
            a(".slick-cloned", b.$slider).remove(), b.$dots && b.$dots.remove(), b.$prevArrow && b.htmlExpr.test(b.options.prevArrow) && b.$prevArrow.remove(), b.$nextArrow && b.htmlExpr.test(b.options.nextArrow) && b.$nextArrow.remove(), b.$slides.removeClass("slick-slide slick-active slick-visible slick-current").attr("aria-hidden", "true").css("width", "")
        }, b.prototype.unslick = function (a) {
            var b = this;
            b.$slider.trigger("unslick", [b, a]), b.destroy()
        }, b.prototype.updateArrows = function () {
            var b, a = this;
            b = Math.floor(a.options.slidesToShow / 2), a.options.arrows === !0 && a.slideCount > a.options.slidesToShow && !a.options.infinite && (a.$prevArrow.removeClass("slick-disabled").attr("aria-disabled", "false"), a.$nextArrow.removeClass("slick-disabled").attr("aria-disabled", "false"), 0 === a.currentSlide ? (a.$prevArrow.addClass("slick-disabled").attr("aria-disabled", "true"), a.$nextArrow.removeClass("slick-disabled").attr("aria-disabled", "false")) : a.currentSlide >= a.slideCount - a.options.slidesToShow && a.options.centerMode === !1 ? (a.$nextArrow.addClass("slick-disabled").attr("aria-disabled", "true"), a.$prevArrow.removeClass("slick-disabled").attr("aria-disabled", "false")) : a.currentSlide >= a.slideCount - 1 && a.options.centerMode === !0 && (a.$nextArrow.addClass("slick-disabled").attr("aria-disabled", "true"), a.$prevArrow.removeClass("slick-disabled").attr("aria-disabled", "false")))
        }, b.prototype.updateDots = function () {
            var a = this;
            null !== a.$dots && (a.$dots.find("li").removeClass("slick-active").attr("aria-hidden", "true"), a.$dots.find("li").eq(Math.floor(a.currentSlide / a.options.slidesToScroll)).addClass("slick-active").attr("aria-hidden", "false"))
        }, b.prototype.visibility = function () {
            var a = this;
            document[a.hidden] ? (a.paused = !0, a.autoPlayClear()) : a.options.autoplay === !0 && (a.paused = !1, a.autoPlay())
        }, b.prototype.initADA = function () {
            var b = this;
            b.$slides.add(b.$slideTrack.find(".slick-cloned")).attr({
                "aria-hidden": "true",
                tabindex: "-1"
            }).find("a, input, button, select").attr({
                tabindex: "-1"
            }), b.$slideTrack.attr("role", "listbox"), b.$slides.not(b.$slideTrack.find(".slick-cloned")).each(function (c) {
                a(this).attr({
                    role: "option",
                    "aria-describedby": "slick-slide" + b.instanceUid + c
                })
            }), null !== b.$dots && b.$dots.attr("role", "tablist").find("li").each(function (c) {
                a(this).attr({
                    role: "presentation",
                    "aria-selected": "false",
                    "aria-controls": "navigation" + b.instanceUid + c,
                    id: "slick-slide" + b.instanceUid + c
                })
            }).first().attr("aria-selected", "true").end().find("button").attr("role", "button").end().closest("div").attr("role", "toolbar"), b.activateADA()
        }, b.prototype.activateADA = function () {
            var a = this,
                b = a.$slider.find("*").is(":focus");
            a.$slideTrack.find(".slick-active").attr({
                "aria-hidden": "false",
                tabindex: "0"
            }).find("a, input, button, select").attr({
                tabindex: "0"
            }), b && a.$slideTrack.find(".slick-active").focus()
        }, b.prototype.focusHandler = function () {
            var b = this;
            b.$slider.on("focus.slick blur.slick", "*", function (c) {
                c.stopImmediatePropagation();
                var d = a(this);
                setTimeout(function () {
                    b.isPlay && (d.is(":focus") ? (b.autoPlayClear(), b.paused = !0) : (b.paused = !1, b.autoPlay()))
                }, 0)
            })
        }, a.fn.slick = function () {
            var g, a = this,
                c = arguments[0],
                d = Array.prototype.slice.call(arguments, 1),
                e = a.length,
                f = 0;
            for (f; e > f; f++)
                if ("object" == typeof c || "undefined" == typeof c ? a[f].slick = new b(a[f], c) : g = a[f].slick[c].apply(a[f].slick, d), "undefined" != typeof g) return g;
            return a
        }
    });
    /*end slick.min.js*/
});