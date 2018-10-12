(function (win, doc) {
    if (!win['String']['prototype']['trim']) {
        win['String']['prototype']['trim'] = function () {
            return this.replace(/^\s+|\s+$/g, '');
        };
    }
    var constants = {
        ACCESS_TOKEN_KEY: 'xups-github-comments-token', // access_token key
        USER_INFO_KEY: 'xups-github-user-info', // 登录用户信息 key
        PER_PAGE: 5, // 每页的评论数
        API_HOST: 'https://api.github.com/'
    };
    var tools = {
        $: function (selector) {
            return /^(\[object HTML)[a-zA-Z]*(Element\])$/.test(Object.prototype.toString.call(selector)) ? selector : doc.querySelector(selector);
        },
        queryUrl: function (key, url, uncode) {
            url = url || location.href;
            var reg = new RegExp('(\\?|&|#|&amp;)' + key + '=([^?&#]*)');
            var result = url.match(reg);
            if (uncode) {
                return result ? result[2] : '';
            }
            return result ? decodeURIComponent(result[2]) : '';
        },
        addClass: function (elem, className) {
            if (!elem) return;
            var classNames;
            var setClass;
            var i, l, cl;
            if (elem instanceof Array) {
                for (i = 0, l = elem.length; i < l; i++) {
                    elem[i] = arguments.callee.call(this, elem[i], className);
                }
            } else if (typeof elem.item === 'function') {
                var result = [];
                for (i = 0, l = elem.length; i < l; i++) {
                    result.push(arguments.callee.call(this, elem.item(i), className));
                }
                elem = result;
            } else {
                if (className && typeof className === 'string') {
                    classNames = className.split(/\s+/);
                    if (elem.nodeType === 1) {
                        if (!elem.className && classNames.length === 1) {
                            elem.className = className;
                        } else {
                            setClass = ' ' + elem.className + ' ';
                            for (i = 0, cl = classNames.length; i < cl; i++) {
                                if (setClass.indexOf(' ' + classNames[i] + ' ') < 0) {
                                    setClass += classNames[i] + ' ';
                                }
                            }
                            elem.className = setClass.trim();
                        }
                    }
                }
            }
        },
        removeClass: function (elem, className) {
            if (!elem) return;
            var classNames, i, l, c, cl;
            if (elem instanceof Array) {
                for (i = 0, l = elem.length; i < l; i++) {
                    elem[i] = arguments.callee.call(this, elem[i], className);
                }
            } else if (typeof elem.item === 'function') {
                var result = [];
                for (i = 0, l = elem.length; i < l; i++) {
                    result.push(arguments.callee.call(this, elem.item(i), className));
                }
                elem = result;
            } else {
                if ((className && typeof className === 'string') || className === undefined) {
                    classNames = (className || '').split(/\s+/);
                    if (elem.nodeType === 1 && elem.className) {
                        if (className) {
                            className = (' ' + elem.className + ' ').replace(/[\n\t\r]/g, ' ');
                            for (c = 0, cl = classNames.length; c < cl; c++) {
                                className = className.replace(' ' + classNames[c] + ' ', ' ');
                            }
                            elem.className = className.trim();
                        } else {
                            elem.className = '';
                        }
                    }
                }
            }
        },
        /**
         * 格式化日期文本，如 yyyy-MM-dd hh:mm:ss
         */
        formatDate: function (format, date) {
            if (!date) return '';
            if (typeof date === 'number') date = new Date(date * 1000);
            var o = {
                'M+': date.getMonth() + 1,
                'd+': date.getDate(),
                'h+': date.getHours(),
                'm+': date.getMinutes(),
                's+': date.getSeconds(),
                'q+': Math.floor((date.getMonth() + 3) / 3),
                'S': date.getMilliseconds(),
                'w': '日一二三四五六'.charAt(date.getDay())
            };
            format = format.replace(/y{4}/, date.getFullYear()).replace(/y{2}/, date.getFullYear().toString().substring(2));
            for (var k in o) {
                var reg = new RegExp(k);
                format = format.replace(reg, match);
            }

            function match (m) {
                return m.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length);
            }
            return format;
        },
        htmlEncode: function (str) {
            if (typeof str !== 'string') return;
            str = str.replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                // .replace(/>/g, '&gt;')
                .replace(/\"/g, '&quot;')
                .replace(/\'/g, '&#39;')
                .replace(/ /g, '&nbsp;');
            return str;
        },
        /* 封装ajax函数
         * @param {string}opts.method http连接的方式，包括POST和GET两种方式
         * @param {string}opt.url 发送请求的url
         * @param {boolean}opts.async 是否为异步请求，true为异步的，false为同步的
         * @param {object}opts.data 发送的参数，格式为对象类型
         * @param {function}opts.success ajax发送并接收成功调用的回调函数
         * @param {function}opts.error ajax发送并接收成功调用的回调函数
         */
        ajax: function (opts) {
            opts = opts || {};
            // 请求方法
            opts.method = (opts.method && opts.method.toLocaleUpperCase()) || 'POST';
            // 请求路径
            opts.url = /^http(s)?:\/\//.test(opts.url) ? opts.url : (constants.API_HOST + opts.url);
            // 异步还是同步
            opts.async = opts.async || true;
            // 请求数据
            opts.data = opts.data || {};
            // 头部
            // opts.headers = Object.assign({}, {'Accept': '*/*', 'Content-Type': 'application/x-www-form-urlencoded'}, opts.headers || {});
            // 成功后回调
            opts.success = opts.success || function () {};
            // 错误后回调
            opts.error = opts.error || function () {};
            var spin = opts.spin === undefined ? true : opts.spin; // 是否显示loading，默认不显示
            var errorToast = opts.errorToast === undefined ? true : opts.errorToast; // 是否显示错误警告，默认弹出
            // var successToast = opts.successToast; // 是否显示成功警告
            var xhr = null;
            // 兼容IE可不做处理
            if (XMLHttpRequest) {
                xhr = new XMLHttpRequest();
            } else {
                xhr = new ActiveXObject('Microsoft.XMLHTTP');
            }
            var params = [];
            for (var key in opts.data) {
                if (opts.data[key]) {
                    params.push(key + '=' + opts.data[key]);
                }
            }
            var postData = params.join('&');
            var token = window.localStorage.getItem(constants.ACCESS_TOKEN_KEY);
            if (spin && Toast) {
                if (win.responseCount === undefined) win.responseCount = 0;
                if (!win.responseCount++) Toast.loading();
            }
            // 设置xhr请求的超时时间
            xhr.timeout = 20000;
            if (opts.method === 'POST') {
                xhr.open(opts.method, opts.url, opts.async);
                if (window.JSON) {
                    postData = JSON.stringify(opts.data);
                    xhr.setRequestHeader('Content-Type', 'application/json;charset=utf-8');
                } else {
                    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');
                }
                if (opts.headers && opts.headers['Accept']) {
                    xhr.setRequestHeader('Accept', opts.headers['Accept']);
                } else {
                    xhr.setRequestHeader('Accept', 'application/vnd.github.squirrel-girl-preview, application/vnd.github.html+json');
                }
                // 登录校验
                if (token) {
                    xhr.setRequestHeader('Authorization', 'token ' + token);
                }
                xhr.send(postData);
            } else if (opts.method === 'GET') {
                xhr.open(opts.method, opts.url + '?' + postData, opts.async);
                xhr.setRequestHeader('Accept', 'application/vnd.github.squirrel-girl-preview, application/vnd.github.html+json');
                // 登录校验
                if (token) {
                    xhr.setRequestHeader('Authorization', 'token ' + token);
                }
                xhr.send(null);
            }
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (spin && Toast) {
                        if (!win.responseCount || !--win.responseCount) Toast.closeLoading();
                    }
                    var response;
                    if (xhr.status >= 200 && xhr.status < 400) {
                        try {
                            response = JSON.parse(xhr.responseText);
                            opts.success(response);
                        } catch (e) {
                            response = xhr.responseText;
                            opts.success(response);
                        }
                    } else {
                        response = {
                            message: xhr.statusText || '服务器请求失败！'
                        };
                        errorToast && Toast.info(response.message);
                        opts.error(response);
                    }
                }
            };
            xhr.onerror = function () {
                errorToast && Toast.info('请求错误！');
                opts.error({message: '请求错误！'});
            };
        },
        flashTitle: function (title) {
            var counter = 0;
            document.title = title + '...';
            setInterval(function () {
                counter++;
                if (counter % 3 === 0) {
                    document.title = title + '...';
                } else if (counter % 3 === 1) {
                    document.title = title + '..';
                } else if (counter % 3 === 2) {
                    document.title = title + '.';
                }
            }, 100);
        },
    };
    var CommentUtils = {
        // 存放数据
        options: {},
        init: function (options) {
            this.options = options || {};
            var _this = this;
            _this.updateUserInfo();
            _this.updateEditBox();
            var code = tools.queryUrl('code');
            // if code，继续GitHub 授权
            if (code) {
                tools.flashTitle('登录中');
                tools.ajax({
                    url: 'https://cors-anywhere.herokuapp.com/https://github.com/login/oauth/access_token',
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json'
                    },
                    data: {
                        client_id: _this.options.clientId,
                        client_secret: _this.options.clientSecret,
                        code,
                    },
                    success: function (res) {
                        if (res.access_token || res.data) {
                            if (res.data) {
                                res.access_token = res.data.access_token;
                            }
                            win.localStorage.setItem(constants.ACCESS_TOKEN_KEY, res.access_token); // 保存 access_token 至 localStorage
                            tools.ajax({
                                url: 'user',
                                method: 'GET',
                                data: {
                                    access_token: res.access_token
                                },
                                success: function (data) {
                                    if (data.login) {
                                        win.localStorage.setItem(constants.USER_INFO_KEY, JSON.stringify(data)); // 保存用户信息到 localStorage
                                        win.location.href = win.location.href.substring(0, win.location.href.indexOf('?'));
                                    }
                                }
                            });
                        } else {
                            // 登录失败
                            win.location.href = win.location.href.substring(0, win.location.href.indexOf('?'));
                        }
                    },
                    error: function (error) {
                        win.location.href = win.location.href.substring(0, win.location.href.indexOf('?'));
                    }
                });
            } else {
                tools.ajax({
                    url: 'repos/' + _this.options.owner + '/' + _this.options.repo + '/issues',
                    method: 'GET',
                    data: {
                        labels: [_this.options.label],
                        rnd: Math.random()
                    },
                    success: function (res) {
                        if (res.length > 0) {
                            var number = res[0].number;
                            var comments = res[0].comments; // 该 issue 下所有评论数
                            _this.issueNumber = number;
                            _this.issueComments = comments;
                            if (number && comments) {
                                tools.ajax({
                                    url: 'repos/' + _this.options.owner + '/' + _this.options.repo + '/issues/' + number + '/comments',
                                    method: 'GET',
                                    data: {
                                        page: 1,
                                        per_page: constants.PER_PAGE
                                    },
                                    success: function (list) {
                                        _this.updateList(1, comments, list, function () {
                                            for (var i = 0, len = list.length; i < len; i++) {
                                                (function (commentId) {
                                                    tools.ajax({
                                                        url: 'repos/' + _this.options.owner + '/' + _this.options.repo + '/issues/comments/' + commentId + '/reactions',
                                                        method: 'GET',
                                                        data: {
                                                            content: 'heart'
                                                        },
                                                        success: function (reactions) {
                                                            _this.reactionUpdate(commentId, reactions);
                                                        },
                                                        error: function (err) {
                                                            console.log(err);
                                                        }
                                                    });
                                                }(list[i].id));
                                            }
                                        });
                                    },
                                    error: function (err) {
                                        console.log(err);
                                    }
                                });
                            } else {
                                _this.updateList(1, 0, []);
                                _this.updateTips();
                            }
                        } else {
                            // 授权码失效
                            if (typeof res !== 'object') {
                                win.localStorage.removeItem(constants.ACCESS_TOKEN_KEY);
                                win.localStorage.removeItem(constants.USER_INFO_KEY);
                                _this.updateUserInfo();
                                _this.updateEditBox();
                            } else {
                                _this.updateList(1, 0, []);
                                _this.updateTips();
                            }
                        }
                    },
                    error: function (err) {
                        console.log(err);
                    }
                });
            }
            // 编辑
            this.editSwitcher();
            // 预览
            this.previewSwitcher();
            // 登出
            this.signOut();
            // createIssue
            this.createIssue();
            // 提交评论
            this.postComment();
        },
        // 更新用户信息
        updateUserInfo: function () {
            var token = win.localStorage.getItem(constants.ACCESS_TOKEN_KEY);
            var userInfo = win.localStorage.getItem(constants.USER_INFO_KEY);
            var html = '';
            if (token && userInfo) {
                userInfo = JSON.parse(userInfo);
                html = '<span class="sign-txt" title="' + userInfo.login + '">GitHub 已登录!</span>' +
                    '<span class="sign-link" id="signOut">退出</span>';
            } else {
                html = '<span class="sign-txt">GitHub 未登录?</span>' +
                    '<a href="https://github.com/login/oauth/authorize?scope=public_repo&redirect_uri=' + (win.location.href.indexOf('?') !== -1 ? encodeURIComponent(win.location.href.substring(0, win.location.href.indexOf('?'))) : encodeURIComponent(win.location.href) + '&client_id=' + this.options.clientId + '&client_secret=' + this.options.clientSecret) + '" class="sign-link">' +
                        '登录' +
                    '</a>';
            }
            tools.$('#commentSignBar').innerHTML = html;
        },
        // 更新提交评论区域
        updateEditBox: function () {
            var userInfo = win.localStorage.getItem(constants.USER_INFO_KEY);
            if (userInfo) {
                userInfo = JSON.parse(userInfo);
            } else {
                userInfo = {};
            }
            tools.$('#loginAvatar').src = userInfo.avatar_url || '/img/unsigned_avatar.jpg';
        },
        updateTips: function () {
            var userInfo = win.localStorage.getItem(constants.USER_INFO_KEY);
            var handler = '';
            // 如果文章还没关联 issue 并且登录账号是自己时
            if (userInfo && JSON.parse(userInfo).login === this.options.owner && this.issueNumber === 0) {
                handler = '<a id="createIssue" class="init" title="文章关联 issue">初始化评论</a>';
            }
            tools.$('#commentTips').innerHTML = handler + '注：评论支持 markdown 语法！';
        },
        /**
         * 评论列表模块视图更新
         * @param  {Number}    page      评论列表当前页码
         * @param  {Number}    comments  当前文章下所有评论总数
         * @param  {Number}    list      当前列表下评论列表数据
         * @param  {Function}  callback  回调
         * @return void(0)
         */
        updateList: function (page, comments, list, callback) {
            var perNavPageMaxSize = 5;
            var html = '';
            var htmlList = '';
            var pageList = '';
            var _this = this;
            // 页数
            var allPages = Math.ceil(comments / constants.PER_PAGE);
            if (comments === 0) {
                html = '<div class="text-center">暂无评论</div>';
            } else {
                var item = '';
                var pageItem = '';
                // 循环评论列表
                for (var i = 0, len = list.length; i < len; i++) {
                    item = '<li class="item">' +
                                '<div class="user-avatar">' +
                                    '<a target="_blank" href="' + list[i].user.html_url + '">' +
                                        '<img src="' + list[i].user.avatar_url + '" alt="user-avatar">' +
                                    '</a>' +
                                '</div>' +
                                '<div class="user-comment">' +
                                    '<div class="user-comment-header" id="comment_' + list[i].id + '_reactions">' +
                                        '<span class="post-name">' + list[i].user.login + '</span>' +
                                        '<span class="post-time">' + tools.formatDate('yyyy-MM-dd hh:mm', new Date(list[i].created_at)) + '</span>' +
                                        '<span class="like" onclick="CommentUtils.like(' + list[i].id + ')">点赞</span>' +
                                        '<span class="like-num">' + list[i].reactions.heart + '</span>' +
                                        '<span class="reply" onclick="CommentUtils.reply(\'' + list[i].user.login + '\', \'' + (list[i].body_html || list[i].body).replace(/<[^>]+>|\s|[\r\n]/g, ' ') + '\')">回复</span>' +
                                    '</div>' +
                                    '<div class="user-comment-body">' + (list[i].body_html || list[i].body) + '</div>' +
                                '</div>' +
                            '</li>';
                    htmlList += item;
                }
                // 评论页码
                if (allPages === 1) {
                    pageItem = '<a href="javascript: void(0);" class="item current">' + page + '</a>';
                    pageList += pageItem;
                } else if (allPages <= perNavPageMaxSize) {
                    // 添加上页
                    if (page !== 1) {
                        pageList += '<a href="javascript: CommentUtils.pageJump(' + (page - 1) + ');" data-page="' + (page - 1) + '" class="item">上页</a>';
                    }
                    for (var i = 1; i <= allPages; i++) {
                        if (i === page) {
                            pageItem = '<a href="javascript: void(0);" class="item current">' + page + '</a>';
                        } else {
                            pageItem = '<a href="javascript: CommentUtils.pageJump(' + i + ');" data-page="' + i + '" class="item">' + i + '</a>';
                        }
                        pageList += pageItem;
                    }
                    // 下页
                    if (page !== allPages) {
                        pageList += '<a href="javascript: CommentUtils.pageJump(' + (page + 1) + ');" data-page="' + (page + 1) + '" class="item">下页</a>';
                    }
                } else if (allPages > perNavPageMaxSize) {
                    if (page <= perNavPageMaxSize) {
                        if (page !== 1) {
                            pageList += '<a href="javascript: CommentUtils.pageJump(' + (page - 1) + ');" data-page="' + (page - 1) + '" class="item">上页</a>';
                        }
                        for (var i = 1; i <= perNavPageMaxSize; i++) {
                            if (i === page) {
                                pageItem = '<a href="javascript: void(0);" class="item current">' + page + '</a>';
                            } else {
                                pageItem = '<a href="javascript: CommentUtils.pageJump(' + i + ');" data-page="' + i + '" class="item">' + i + '</a>';
                            }
                            pageList += pageItem;
                        }

                        pageList += '<span class="more">...</span>';
                        pageList += '<a href="javascript: CommentUtils.pageJump(' + (page + 1) + ');" data-page="' + (page + 1) + '" class="item">下页</a>';
                        pageList += '<a href="javascript: CommentUtils.pageJump(' + allPages + ');" data-page="' + allPages + '" class="item">末页</a>';
                    } else if (page > perNavPageMaxSize && page <= allPages - perNavPageMaxSize) {
                        var mod = page % perNavPageMaxSize;
                        var start = Math.floor(page / perNavPageMaxSize) * perNavPageMaxSize + 1;
                        var end = Math.ceil(page / perNavPageMaxSize) * perNavPageMaxSize;
                        pageList += '<a href="javascript: CommentUtils.pageJump(' + 1 + ');" data-page="' + 1 + '" class="item">首页</a>';
                        pageList += '<a href="javascript: CommentUtils.pageJump(' + (page - 1) + ');" data-page="' + (page - 1) + '" class="item">上页</a>';
                        for (var i = start; i <= end; i++) {
                            if (i === page) {
                                pageItem = '<a href="javascript: void(0);" class="item current">' + page + '</a>';
                            } else {
                                pageItem = '<a href="javascript: CommentUtils.pageJump(' + i + ');" data-page="' + i + '" class="item">' + i + '</a>';
                            }
                            pageList += pageItem;
                        }

                        pageList += '<span class="more">...</span>';
                        pageList += '<a href="javascript: CommentUtils.pageJump(' + (page + 1) + ');" data-page="' + (page + 1) + '" class="item">下页</a>';
                        pageList += '<a href="javascript: CommentUtils.pageJump(' + allPages + ');" data-page="' + allPages + '" class="item">末页</a>';
                    } else if (page > perNavPageMaxSize && page > allPages - perNavPageMaxSize) {
                        var start = allPages - perNavPageMaxSize + 1;
                        var end = allPages;
                        pageList += '<a href="javascript: CommentUtils.pageJump(' + 1 + ');" data-page="' + 1 + '" class="item">首页</a>';
                        pageList += '<a href="javascript: CommentUtils.pageJump(' + (page - 1) + ');" data-page="' + (page - 1) + '" class="item">上页</a>';
                        for (var i = start; i <= end; i++) {
                            if (i === page) {
                                pageItem = '<a href="javascript: void(0);" class="item current">' + page + '</a>';
                            } else {
                                pageItem = '<a href="javascript: CommentUtils.pageJump(' + i + ');" data-page="' + i + '" class="item">' + i + '</a>';
                            }
                            pageList += pageItem;
                        }
                        if (page !== allPages) {
                            pageList += '<a href="javascript: CommentUtils.pageJump(' + (page + 1) + ');" data-page="' + (page + 1) + '" class="item">下页</a>';
                        }
                    }
                }
                html = '<header class="list-header">总共 <span class="comments-num" id="commentsNum">' + _this.issueComments + '</span> 条评论</header>' +
                        '<ul class="list">' +
                            htmlList +
                        '</ul>' +
                        '<div class="page-nav" id="pageJump">' +
                            pageList +
                        '</div>';
            }
            tools.$('#commentList').innerHTML = html;
            if (win.localStorage.getItem(constants.USER_INFO_KEY)) {
                callback && callback();
            }
        },
        // 点赞详情
        reactionUpdate: function (commentId, reactions) {
            var userInfo = win.localStorage.getItem(constants.USER_INFO_KEY);
            if (userInfo) {
                userInfo = JSON.parse(userInfo);
            } else {
                return;
            }
            var userId = userInfo.id;
            for (var i = 0, len = reactions.length; i < len; i++) {
                if (userId === reactions[i].user.id) {
                    var reactions = tools.$('#comment_' + commentId + '_reactions');
                    tools.addClass(reactions.getElementsByClassName('like')[0], 'liked');
                    reactions.getElementsByClassName('like')[0].innerHTML = '已赞';
                    break;
                }
            }
        },
        // 增加一个
        addOne: function (data) {
            var oLi = document.createElement('li');
            oLi.className = 'item';
            var item = '<div class="user-avatar">' +
                            '<a target="_blank" href="' + data.user.html_url + '">' +
                                '<img src="' + data.user.avatar_url + '" alt="user-avatar">' +
                            '</a>' +
                        '</div>' +
                        '<div class="user-comment">' +
                            '<div class="user-comment-header" id="comment_' + data.id + '_reactions">' +
                                '<span class="post-name">' + data.user.login + '</span>' +
                                '<span class="post-time">' + tools.formatDate('yyyy-MM-dd hh:mm', new Date(data.created_at)) + '</span>' +
                                '<span class="like" onclick="CommentUtils.like(' + data.id + ')">点赞</span>' +
                                '<span class="like-num">' + data.reactions.heart + '</span>' +
                                '<span class="reply" onclick="CommentUtils.reply(\'' + data.user.login + '\', \'' + (data.body_html || data.body).replace(/<[^>]+>|\s|[\r\n]/g, ' ') + '\')">回复</span>' +
                            '</div>' +
                            '<div class="user-comment-body">' + (data.body_html || data.body) + '</div>' +
                        '</div>';
            oLi.innerHTML = item;
            var oUl = tools.$('#commentList').getElementsByTagName('ul')[0];
            if (oUl) {
                oUl.insertBefore(oLi, oUl.firstChild);
                tools.$('#commentsNum').innerHTML = this.issueComments + 1;
            } else {
                tools.$('#commentList').innerHTML = '<header class="list-header">总共 <span class="comments-num" id="commentsNum">' + (this.issueComments + 1) + '</span> 条评论</header>' +
                                                    '<ul class="list">' +
                                                        '<li class="item">' +
                                                            item +
                                                        '</li>' +
                                                    '</ul>';
            }
        },
        // 编辑和预览
        editPreviewSwitch: function (flag) {
            var previewSwitcher = tools.$('#previewSwitcher');
            var editSwitcher = tools.$('#editSwitcher');
            var previewBox = tools.$('#previewBox');
            var editBox = tools.$('#editBox');
            if (flag === 'edit') {
                tools.removeClass(previewSwitcher, 'on');
                tools.addClass(editSwitcher, 'on');
                tools.removeClass(previewBox, 'show');
                tools.addClass(editBox, 'show');
            } else {
                tools.removeClass(editSwitcher, 'on');
                tools.addClass(previewSwitcher, 'on');
                tools.removeClass(editBox, 'show');
                tools.addClass(previewBox, 'show');
                var text = editBox.value.trim();
                // 安全转义
                text = tools.htmlEncode(text);
                if (text) {
                    tools.ajax({
                        url: 'markdown',
                        method: 'POST',
                        data: {
                            text: text,
                            mode: 'markdown',
                            context: 'github/gollum'
                        },
                        success: function (res) {
                            previewBox.innerHTML = res;
                        },
                        error: function (err) {
                            console.log(err);
                        }
                    });
                } else {
                    previewBox.innerHTML = '';
                }
            }
        },
        // 编辑
        editSwitcher: function () {
            var editSwitcher = tools.$('#editSwitcher');
            var _this = this;
            editSwitcher && editSwitcher.addEventListener('click', function (e) {
                _this.editPreviewSwitch('edit');
            });
        },
        // 预览
        previewSwitcher: function () {
            var previewSwitcher = tools.$('#previewSwitcher');
            var _this = this;
            previewSwitcher && previewSwitcher.addEventListener('click', function (e) {
                _this.editPreviewSwitch('preview');
            });
        },
        // 登出
        signOut: function () {
            var signOut = tools.$('#signOut');
            var _this = this;
            signOut && signOut.addEventListener('click', function () {
                localStorage.removeItem(constants.ACCESS_TOKEN_KEY);
                localStorage.removeItem(constants.USER_INFO_KEY);
                _this.updateUserInfo();
                _this.updateEditBox();
            });
        },
        // 创建createIssue
        createIssue: function () {
            var createIssue = tools.$('#createIssue');
            var _this = this;
            createIssue && createIssue.addEventListener('click', function () {
                tools.ajax({
                    url: 'repos/' + _this.options.owner + '/' + _this.options.repo + '/issues',
                    method: 'POST',
                    data: {
                        title: doc.title,
                        body: win.location.href,
                        labels: [(_this.options.label || win.location.href)]
                    },
                    success: function (res) {
                        if (res.number) {
                            _this.issueNumber = res.number;
                            _this.updateTips();
                        }
                    },
                    error: function (error) {
                        console.log(error);
                    }
                });
            });
        },
        // 页面跳转
        pageJump: function (page) {
            var _this = this;
            if (page) {
                tools.ajax({
                    url: 'repos/' + _this.options.owner + '/' + _this.options.repo + '/issues/' + _this.issueNumber + '/comments',
                    method: 'GET',
                    data: {
                        page: Number(page),
                        per_page: constants.PER_PAGE
                    },
                    success: function (list) {
                        _this.updateList(page, _this.issueComments, list, function () {
                            for (var i = 0, len = list.length; i < len; i++) {
                                (function (commentId) {
                                    tools.ajax({
                                        url: 'repos/' + _this.options.owner + '/' + _this.options.repo + '/issues/comments/' + commentId + '/reactions',
                                        method: 'GET',
                                        data: {
                                            content: 'heart'
                                        },
                                        success: function (reactions) {
                                            _this.reactionUpdate(commentId, reactions);
                                        },
                                        error: function (error) {
                                            console.log(error);
                                        }
                                    });
                                }(list[i].id));
                            }
                        });
                    },
                    error: function (error) {
                        console.log(error);
                    }
                });
            }
        },
        // 提交
        postComment: function () {
            var postComment = tools.$('#postComment');
            var _this = this;
            postComment && postComment.addEventListener('click', function (e) {
                var accessToken = win.localStorage.getItem(constants.ACCESS_TOKEN_KEY);
                var userInfo = win.localStorage.getItem(constants.USER_INFO_KEY);
                if (!accessToken || !userInfo) {
                    Dialog.open({
                        title: '温馨提示',
                        msg: '需要登录，是否跳转github登陆',
                        buttons: [
                            {title: '取消'},
                            {
                                title: '确定',
                                click: function () {
                                    win.location.replace('https://github.com/login/oauth/authorize?scope=public_repo&redirect_uri=' + (win.location.href.indexOf('?') !== -1 ? encodeURIComponent(win.location.href.substring(0, win.location.href.indexOf('?'))) : encodeURIComponent(win.location.href) + '&client_id=' + _this.options.clientId + '&client_secret=' + _this.options.clientSecret));
                                    Dialog.close();
                                }
                            }
                        ]
                    });
                    return;
                }
                var body = tools.$('#editBox').value.trim();
                // 安全转义
                body = tools.htmlEncode(body);
                if (body) {
                    if (_this.issueNumber && _this.issueNumber !== 0) {
                        tools.ajax({
                            url: 'repos/' + _this.options.owner + '/' + _this.options.repo + '/issues/' + _this.issueNumber + '/comments',
                            method: 'POST',
                            data: {
                                body: body
                            },
                            success: function (res) {
                                if (res.id) {
                                    _this.addOne(res);
                                    _this.issueComments++;
                                    tools.$('#editBox').value = '';
                                    tools.$('#previewBox').innerHTML = '';
                                }
                            },
                            error: function (err) {
                                console.log(err);
                            }
                        });
                    } else {
                        // 如果还没有创建 issue，先创建 issue
                        tools.ajax({
                            url: 'repos/' + _this.options.owner + '/' + _this.options.repo + '/issues',
                            method: 'POST',
                            data: {
                                title: document.title,
                                body: win.location.href,
                                labels: [(_this.options.label || win.location.href)]
                            },
                            success: function (res) {
                                if (res.number) {
                                    _this.issueNumber = res.number;
                                    tools.ajax({
                                        url: 'repos/' + _this.options.owner + '/' + _this.options.repo + '/issues/' + _this.issueNumber + '/comments',
                                        method: 'POST',
                                        data: {
                                            body: body
                                        },
                                        success: function (json) {
                                            if (res.id) {
                                                _this.addOne(json);
                                                _this.issueComments++;
                                                tools.$('#editBox').value = '';
                                                tools.$('#previewBox').innerHTML = '';
                                            }
                                        },
                                        error: function (err) {
                                            console.log(err);
                                        }
                                    });
                                }
                            },
                            error: function (err) {
                                console.log(err);
                            }
                        });
                    }
                }
            });
        },
        // 喜欢
        like: function (commentId) {
            var reactions = tools.$('#comment_' + commentId + '_reactions');
            var oLiked = reactions.getElementsByClassName('liked');
            var oLike = reactions.getElementsByClassName('like')[0];
            var oNum = reactions.getElementsByClassName('like-num')[0];
            var accessToken = win.localStorage.getItem(constants.ACCESS_TOKEN_KEY);
            var userInfo = win.localStorage.getItem(constants.USER_INFO_KEY);
            var _this = this;
            if (oLiked.length) {
                return false;
            } else {
                if (accessToken && userInfo) {
                    tools.ajax({
                        url: 'repos/' + _this.options.owner + '/' + _this.options.repo + '/issues/comments/' + commentId + '/reactions',
                        method: 'POST',
                        data: {
                            content: 'heart'
                        },
                        success: function (res) {
                            if (res.content === 'heart') {
                                tools.addClass(oLike, 'liked');
                                oLike.innerHTML = '已赞';
                                oNum.innerHTML = Number(oNum.innerHTML) + 1;
                            }
                        },
                        error: function (err) {
                            console.log(err);
                        }
                    });
                } else {
                    Dialog.open({
                        title: '温馨提示',
                        msg: '需要登录，是否跳转github登陆',
                        buttons: [
                            {title: '取消'},
                            {
                                title: '确定',
                                click: function () {
                                    win.location.replace('https://github.com/login/oauth/authorize?scope=public_repo&redirect_uri=' + (win.location.href.indexOf('?') !== -1 ? encodeURIComponent(win.location.href.substring(0, win.location.href.indexOf('?'))) : encodeURIComponent(win.location.href) + '&client_id=' + _this.options.clientId + '&client_secret=' + _this.options.clientSecret));
                                    Dialog.close();
                                }
                            }
                        ]
                    });
                }
            }
        },
        // 回复
        reply: function (people, content) {
            var accessToken = win.localStorage.getItem(constants.ACCESS_TOKEN_KEY);
            var userInfo = win.localStorage.getItem(constants.USER_INFO_KEY);
            var previewBox = tools.$('#previewBox');
            var editBox = tools.$('#editBox');
            if (!accessToken || !userInfo) {
                Dialog.open({
                    title: '温馨提示',
                    msg: '需要登录，是否跳转github登陆',
                    buttons: [
                        {title: '取消'},
                        {
                            title: '确定',
                            click: function () {
                                win.location.replace('https://github.com/login/oauth/authorize?scope=public_repo&redirect_uri=' + (win.location.href.indexOf('?') !== -1 ? encodeURIComponent(win.location.href.substring(0, win.location.href.indexOf('?'))) : encodeURIComponent(win.location.href) + '&client_id=' + _this.options.clientId + '&client_secret=' + _this.options.clientSecret));
                                Dialog.close();
                            }
                        }
                    ]
                });
                return;
            }
            this.editPreviewSwitch('edit');
            editBox.value = '';
            editBox.focus();
            editBox.value = [
                '@' + people + '\n',
                '> ' + content + '\n',
                '\n'
            ].join('');
            previewBox.innerHTML = '';
        }
    };
    win.CommentUtils = CommentUtils;
})(window, document);
