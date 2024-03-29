(function () {
    window.isArray = function (val) {
      return Object.prototype.toString.call(val) === '[object Array]';
    };
    window.isString = function (val) {
      return typeof val === 'string';
    };

    window.hasEvent = function (event) {
      return 'on'.concat(event) in window.document;
    };

    window.isOverallScroller = function (node) {
      return node === document.documentElement || node === document.body || node === window;
    };

    window.isFormElement = function (node) {
      var tagName = node.tagName;
      return tagName === 'INPUT' || tagName === 'SELECT' || tagName === 'TEXTAREA';
    };

    window.pageLoad = (function () {
      var loaded = false, cbs = [];
      window.addEventListener('load', function () {
        var i;
        loaded = true;
        if (cbs.length > 0) {
          for (i = 0; i < cbs.length; i++) {
            cbs[i]();
          }
        }
      });
      return {
        then: function (cb) {
          cb && (loaded ? cb() : (cbs.push(cb)));
        }
      };
    })();
  })();
  (function () {
    window.throttle = function (func, wait) {
      var args, result, thisArg, timeoutId, lastCalled = 0;

      function trailingCall() {
        lastCalled = new Date;
        timeoutId = null;
        result = func.apply(thisArg, args);
      }
      return function () {
        var now = new Date,
          remaining = wait - (now - lastCalled);

        args = arguments;
        thisArg = this;

        if (remaining <= 0) {
          clearTimeout(timeoutId);
          timeoutId = null;
          lastCalled = now;
          result = func.apply(thisArg, args);
        } else if (!timeoutId) {
          timeoutId = setTimeout(trailingCall, remaining);
        }
        return result;
      };
    };
  })();
  (function () {
    var Set = (function () {
      var add = function (item) {
        var i, data = this._data;
        for (i = 0; i < data.length; i++) {
          if (data[i] === item) {
            return;
          }
        }
        this.size++;
        data.push(item);
        return data;
      };

      var Set = function (data) {
        this.size = 0;
        this._data = [];
        var i;
        if (data.length > 0) {
          for (i = 0; i < data.length; i++) {
            add.call(this, data[i]);
          }
        }
      };
      Set.prototype.add = add;
      Set.prototype.get = function (index) { return this._data[index]; };
      Set.prototype.has = function (item) {
        var i, data = this._data;
        for (i = 0; i < data.length; i++) {
          if (this.get(i) === item) {
            return true;
          }
        }
        return false;
      };
      Set.prototype.is = function (map) {
        if (map._data.length !== this._data.length) { return false; }
        var i, j, flag, tData = this._data, mData = map._data;
        for (i = 0; i < tData.length; i++) {
          for (flag = false, j = 0; j < mData.length; j++) {
            if (tData[i] === mData[j]) {
              flag = true;
              break;
            }
          }
          if (!flag) { return false; }
        }
        return true;
      };
      Set.prototype.values = function () {
        return this._data;
      };
      return Set;
    })();

    window.Lazyload = (function (doc) {
      var queue = { js: [], css: [] }, sources = { js: {}, css: {} }, context = this;
      var createNode = function (name, attrs) {
        var node = doc.createElement(name), attr;
        for (attr in attrs) {
          if (attrs.hasOwnProperty(attr)) {
            node.setAttribute(attr, attrs[attr]);
          }
        }
        return node;
      };
      var end = function (type, url) {
        var s, q, qi, cbs, i, j, cur, val, flag;
        if (type === 'js' || type === 'css') {
          s = sources[type], q = queue[type];
          s[url] = true;
          for (i = 0; i < q.length; i++) {
            cur = q[i];
            if (cur.urls.has(url)) {
              qi = cur, val = qi.urls.values();
              qi && (cbs = qi.callbacks);
              for (flag = true, j = 0; j < val.length; j++) {
                cur = val[j];
                if (!s[cur]) {
                  flag = false;
                }
              }
              if (flag && cbs && cbs.length > 0) {
                for (j = 0; j < cbs.length; j++) {
                  cbs[j].call(context);
                }
                qi.load = true;
              }
            }
          }
        }
      };
      var load = function (type, urls, callback) {
        var s, q, qi, node, i, cur,
          _urls = typeof urls === 'string' ? new Set([urls]) : new Set(urls), val, url;
        if (type === 'js' || type === 'css') {
          s = sources[type], q = queue[type];
          for (i = 0; i < q.length; i++) {
            cur = q[i];
            if (_urls.is(cur.urls)) {
              qi = cur;
              break;
            }
          }
          val = _urls.values();
          if (qi) {
            callback && (qi.load || qi.callbacks.push(callback));
            callback && (qi.load && callback());
          } else {
            q.push({
              urls: _urls,
              callbacks: callback ? [callback] : [],
              load: false
            });
            for (i = 0; i < val.length; i++) {
              node = null, url = val[i];
              if (s[url] === undefined) {
                (type === 'js') && (node = createNode('script', { src: url }));
                (type === 'css') && (node = createNode('link', { rel: 'stylesheet', href: url }));
                if (node) {
                  node.onload = (function (type, url) {
                    return function () {
                      end(type, url);
                    };
                  })(type, url);
                  (doc.head || doc.body).appendChild(node);
                  s[url] = false;
                }
              }
            }
          }
        }
      };
      return {
        js: function (url, callback) {
          load('js', url, callback);
        },
        css: function (url, callback) {
          load('css', url, callback);
        }
      };
    })(this.document);
  })();

  (function () {
    function errorHandler(error, callback) {
      if (error) {
        callback && callback(error);
        throw error;
      }
    }

    function pageview(_AV, options) {
      var AV = _AV;
      var appId, appKey, appClass;
      appId = options.appId;
      appKey = options.appKey;
      appClass = options.appClass;
      AV.init({
        serverURLs: 'https://avoscloud.com/',
        appId: appId,
        appKey: appKey
      });
      return {
        get: get,
        increase: increase
      };

      function searchKey(key) {
        var query = new AV.Query(appClass);
        query.equalTo('key', key);
        return query.first();
      }

      function insert(key, title) {
        var Blog = AV.Object.extend(appClass);
        var blog = new Blog();
        blog.set('title', title);
        blog.set('key', key);
        blog.set('views', 0);
        return blog.save();
      }

      function increment(result) {
        result.increment('views', 1);
        return result.save(null, {
          fetchWhenSave: true
        });
      }

      function get(key, callback) {
        searchKey(key).then(function (result) {
          if (result) {
            callback && callback(result.attributes.views);
          }
        }, errorHandler);
      }

      function increase(key, title, callback) {
        searchKey(key).then(function (result) {
          if (result) {
            increment(result).then(function (result) {
              callback && callback(result.attributes.views);
            });
          } else {
            insert(key, title).then(function (result) {
              increment(result).then(function (result) {
                callback && callback(result.attributes.views);
              });
            }, errorHandler);
          }
        }, errorHandler);
      }
    }
    window.pageview = pageview;
  })();