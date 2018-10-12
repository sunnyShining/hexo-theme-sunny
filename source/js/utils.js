// loading和toast
(function (win, doc) {
    var Toast = {
        // 引入toast样式
        importCss: function () {
            var hasStyle = doc.querySelector('.toast-css');
            if (hasStyle) {
                return;
            }
            var style = doc.createElement('style');
            style.type = 'text/css';
            style.className = 'toast-css';
            style.innerHTML = '.c-toast {' +
                    'position: fixed;' +
                    'top: 0;' +
                    'left: 0;' +
                    'display: flex;' +
                    'justify-content: center;' +
                    'align-items: center;' +
                    'width: 100%;' +
                    'height: 100%;' +
                    'z-index: 200;' +
                    'background: transparent;' +
                '}' +
                '.c-toast .toast-content {' +
                    'padding: 10px 15px;' +
                    'max-width: 50%;' +
                    'text-align: center;' +
                    'font-size: 15px;' +
                    'color: #fff;' +
                    'background-color: rgba(58, 58, 58, 0.9);' +
                    'border-radius: 3px;' +
                '}' +

                '.c-toast .toast-loading {' +
                    'display: flex;' +
                    'flex-direction: column;' +
                    'justify-content: center;' +
                    'align-items: center;' +
                    'border-radius: 5px;' +
                    'padding: 15px 15px;' +
                    'min-width: 60px;' +
                    'font-size: 13px;' +
                    'color: #fff;' +
                    'background-color: rgba(58, 58, 58, 0.9);' +
                    'line-height: 1.5;' +
                '}' +
                '@keyframes loading {' +
                    'from {' +
                        'transform: rotateZ(0deg)' +
                    '}' +
                    'to {' +
                        'transform: rotateZ(360deg);' +
                    '}' +
                '}' +
                '.c-toast .loading-img {' +
                    'animation-name: loading;' +
                    'animation-fill-mode: both;' +
                    'animation-duration: 1.5s;' +
                    'animation-timing-function: linear;' +
                    'animation-iteration-count: infinite;' +
                '}' +
                '.c-toast .toast-loading img {' +
                    'margin-bottom: 5px;' +
                    'width: 36px;' +
                    'height: 36px;' +
                '}' +

                '.c-toast-text-info{' +
                    'margin-top: 6px;' +
                '}' +

                '.c-toast-icon {' +
                    'fill: currentColor;' +
                    'background-size: cover;' +
                    'width: 22px;' +
                    'height: 22px;' +
                '}' +
                '.c-toast-icon-xxs {' +
                    'width: 15px;' +
                    'height: 15px;' +
                '}' +

                '.c-toast-icon-xs {' +
                    'width: 18px;' +
                    'height: 18px;' +
                '}' +

                '.c-toast-icon-sm {' +
                    'width: 21px;' +
                    'height: 21px;' +
                '}' +

                '.c-toast-icon-md {' +
                    'width: 22px;' +
                    'height: 22px;' +
                '}' +

                '.c-toast-icon-lg {' +
                    'width: 36px;' +
                    'height: 36px;' +
                '}' +

                '.c-toast-icon-loading {' +
                    '-webkit-animation: cirle-anim 1s linear infinite;' +
                    'animation: cirle-anim 1s linear infinite;' +
                '}' +

                '@-webkit-keyframes cirle-anim {' +
                    '100% {' +
                        '-webkit-transform: rotate(360deg);' +
                        'transform: rotate(360deg);' +
                    '}' +
                '}' +

                '@keyframes cirle-anim {' +
                    '100% {' +
                        '-webkit-transform: rotate(360deg);' +
                        'transform: rotate(360deg);' +
                    '}' +
                '}';
            doc.getElementsByTagName('HEAD').item(0).appendChild(style);
        },
        info: function (content, duration) {
            var options = {
                content: content || '系统错误',
                duration: duration || 1.5
            };
            var toastNode = doc.createElement('div');
            toastNode.className = 'c-toast';
            var toastContent = doc.createElement('div');
            toastContent.className = 'toast-content';
            toastContent.innerHTML = options.content;
            toastNode.appendChild(toastContent);
            doc.body.appendChild(toastNode);
            // 经过设置几秒自动关闭
            setTimeout(function () {
                toastNode && toastNode.remove();
            }, options.duration * 1000);
        },
        loading: function (content) {
            if (!doc.querySelector('.c-toast')) {
                content = content || '加载中...';
                var toastNode = doc.createElement('div');
                toastNode.className = 'c-toast';
                var toastLoading = doc.createElement('div');
                toastLoading.className = 'toast-loading';
                var span = doc.createElement('span');
                span.className = 'c-toast-text-info';
                var loadImg = '<svg class="c-toast-icon c-toast-icon-loading c-toast-icon-lg">' +
                    '<svg viewBox="0 -2 59.75 60.25">' +
                    '<path fill="#ccc" d="M29.69-.527C14.044-.527 1.36 12.158 1.36 27.806S14.043 56.14 29.69 56.14c15.65 0 28.334-12.686 28.334-28.334S45.34-.527 29.69-.527zm.185 53.75c-14.037 0-25.417-11.38-25.417-25.417S15.838 2.39 29.875 2.39s25.417 11.38 25.417 25.417-11.38 25.416-25.417 25.416z" />' +
                    '<path fill="none" stroke="#108ee9" stroke-width="3" stroke-linecap="round" stroke-miterlimit="10" d="M56.587 29.766c.37-7.438-1.658-14.7-6.393-19.552" />' +
                    '</svg>' +
                    '</svg>';
                span.innerHTML = content;
                toastLoading.innerHTML = loadImg;
                toastLoading.appendChild(span);
                toastNode.appendChild(toastLoading);
                doc.body.appendChild(toastNode);
            }
        },
        closeLoading: function () {
            var toastNode = doc.querySelector('.c-toast');
            toastNode && toastNode.remove();
        }
    };
    Toast.importCss();
    win.Toast = Toast;
})(window, document);
(function (win, doc) {
    var Dialog = {
        importCss: function () {
            var hasStyle = doc.querySelector('.dialog-css');
            if (hasStyle) {
                return;
            }
            var style = doc.createElement('style');
            style.type = 'text/css';
            style.className = 'dialog-css';
            style.innerHTML = '.popup-dialog-mask {' +
                                    'position: fixed;' +
                                    'z-index: 99;' +
                                    'top: 0;' +
                                    'left: 0;' +
                                    'right: 0;' +
                                    'bottom: 0;' +
                                    'width: 100%;' +
                                    'height: 100%;' +
                                    'background-color: rgba(0, 0, 0, 0.75);' +
                                    'display: table;' +
                                    'transition: opacity .3s ease;' +
                                    'overflow: hidden;' +
                                '}' +

                                '.popup-dialog-wraper {' +
                                    'vertical-align: middle;' +
                                    'display: table-cell;' +
                                '}' +

                                '.popup-dialog-container{' +
                                    'width: 270px;' +
                                    'margin: 0 auto;' +
                                    'background-color: #fff;' +
                                    'padding-top: 10px;' +
                                    'border-radius: 10px;' +
                                    'box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);' +
                                    'transition: all .3s ease;' +
                                '}' +

                                '.popup-dialog-header {' +
                                    'padding-top: 10px;' +
                                    'padding-bottom: 5px;' +
                                    'font-size: 17px;' +
                                    'text-align: center;' +
                                    'color: #000;' +
                                '}' +

                                '.popup-dialog-body {' +
                                    'display: flex;' +
                                    'flex-direction: column;' +
                                    'justify-content: center;' +
                                    'align-items: center;' +
                                    'padding: 15px 20px 25px 20px;' +
                                    'font-size: 13px;' +
                                '}' +

                                '.popup-dialog-btn {' +
                                    'border-top: 1px solid #e7e7e7;' +
                                    'display: flex;' +
                                    'width: 100%;' +
                                '}' +

                                '.popup-btn-a,' +
                                '.popup-btn-b {' +
                                    'flex: 1;' +
                                    'height: 44px;' +
                                    'font-size: 17px;' +
                                    'color: #007aff;' +
                                    'border: none;' +
                                    'background: none;' +
                                '}' +

                                '.popup-btn-c{' +
                                    'height: 44px;' +
                                    'font-size: 17px;' +
                                    'line-height: 44px;' +
                                    'color: #007aff;' +
                                    'border-top: 1px solid #e7e7e7;' +
                                    'background: none;' +
                                    'text-align: center;' +
                                '}' +
                                '.popup-b-right {' +
                                    'border-right: 1px solid #e7e7e7;' +
                                    'border-radius: initial;' +
                                '}' +

                                '.txt-center{' +
                                    'text-align: center;' +
                                '}';

            doc.getElementsByTagName('HEAD').item(0).appendChild(style);
        },
        open: function (options) {
            var _this = this;
            var defaults = {
                showMask: true,
                txtCenter: true,
                title: '',
                msg: '',
            };
            var settings = {};
            if (typeof options === 'string') {
                settings = defaults;
                settings.msg = options;
            } else if (typeof options === 'object') {
                settings = Object.assign(defaults, options);
            }
            if (!settings.buttons || settings.buttons.length === 0) {
                settings.buttons = [{ title: '知道了' }];
            }
            var dialogNode = doc.querySelector('.popup-dialog-mask');
            if (dialogNode) {
                _this.close();
            }
            var maskDialog = doc.createElement('div');
            maskDialog.className = 'popup-dialog-mask lodding-mask';
            var wraperDialog = doc.createElement('div');
            wraperDialog.className = 'popup-dialog-wraper lodding-wraper';
            var containerDialog = doc.createElement('div');
            containerDialog.className = 'popup-dialog-container lodding-container';
            if (settings.title) {
                var header = doc.createElement('div');
                header.className = 'popup-dialog-header';
                header.innerHTML = settings.title;
                containerDialog.appendChild(header);
            }
            var body = doc.createElement('div');
            body.className = 'popup-dialog-body' + (settings.txtCenter ? ' txt-center' : '');
            body.innerHTML = settings.msg;
            containerDialog.appendChild(body);
            var btnSize = settings.buttons.length;
            if (btnSize === 2) {
                var buttonGroup = doc.createElement('div');
                buttonGroup.className = 'popup-dialog-btn';
                settings.buttons.forEach(function (btnJson, i) {
                    var color = btnJson.color ? 'style="color:' + btnJson.color + '"' : '';
                    var button = doc.createElement('input');
                    button.className = 'popup-btn-' + (i === 0 ? 'a popup-b-right' : 'b') + color;
                    button.type = 'button';
                    button.value = btnJson.title;
                    _this.addBtnEvent(button, btnJson);
                    buttonGroup.appendChild(button);
                });
                containerDialog.appendChild(buttonGroup);
            } else {
                settings.buttons.forEach(function (btnJson) {
                    var color = btnJson.color ? 'style="color:' + btnJson.color + '"' : '';
                    var button = doc.createElement('div');
                    button.className = 'popup-btn-c' + color;
                    button.innerHTML = btnJson.title;
                    _this.addBtnEvent(button, btnJson);
                    containerDialog.appendChild(button);
                });
            }
            wraperDialog.appendChild(containerDialog);
            if (settings.showMask) {
                maskDialog.appendChild(wraperDialog);
                doc.body.appendChild(maskDialog);
            } else {
                doc.body.appendChild(wraperDialog);
            }
        },
        close: function () {
            var dialogNode = doc.querySelector('.popup-dialog-mask');
            dialogNode && dialogNode.remove();
        },
        addBtnEvent: function (btn, btnJson) {
            var _this = this;
            btn.addEventListener('click', function () {
                if (btnJson.click && typeof (btnJson.click) === 'function') {
                    btnJson.click();
                }
                // 如果点击的是确定按钮，则不自动调用关闭弹窗
                if (btnJson.title === '确定') {
                    return;
                }
                Dialog.closeView();
            });
        }
    };
    Dialog.importCss();
    window.Dialog = Dialog;
})(window, document);