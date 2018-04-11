(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as anonymous module.
        define(['ChineseDistricts'], factory);
    } else if (typeof exports === 'object') {
        // Node / CommonJS
        factory(require('ChineseDistricts'));
    } else {
        // Browser globals.
        factory(ChineseDistricts);
    }
})(function (ChineseDistricts) {
    'use strict';
    function CityStore(data, topKey) {
        var da = data[topKey],
            key,
            _dict = {};

        var emptyDict = {
            "86": {
                "86": "中国",
                "0": "-请选择-"
            }
        }

        var dict = emptyDict[topKey];

        for (var pk in data) {
            var da = data[pk]
            for (var k in da) {
                dict[k] = da[k]
            }
        }

        this.data = data;
        this.dict = dict
    }

    CityStore.prototype = {
        constructor: CityStore,
        getAddressByCode: function (code) {
            return this.dict[code]
        },
        getDictByCode: function (code) {
            return this.data[code]
        }
    }
    function CityPicker(store, list) {
        var domNode = document.createElement('div')
        domNode.className = "lk-address-overlay";
        domNode.innerHTML = '<div class="lk-address-select"><div class="lk-address-head"><h3>所在地区</h3><button class="close">X</button></div><div class="lk-address-tabs"><ul class="pic-tool"></ul></div><div class="lk-address-body"><ul class="pic-list slideLeft"></ul></div><div class="lk-address-footer">确 定</div></div>';
        document.body.appendChild(domNode);
        this.domNode = domNode;
        this.store = store;
        this.__selectedCode = "";
        this.toolDomNode = domNode.querySelector('.pic-tool');
        this.listDomNode = domNode.querySelector('.pic-list');
        this.closeBtn = domNode.querySelector('.close');
        this.okBtn = domNode.querySelector('.lk-address-footer');
        this.hide();
        var _this = this;
        function handler(e) {
            if (e.target.tagName === "LI") {
                var codes = e.target.getAttribute("data-code"),
                    isEnd = e.target.getAttribute("data-end"),
                    lastCode = codes.split(",").pop();
                e.preventDefault();
                _this.show({ codes: codes, selectedCode: lastCode });
                _this.__selectedCode = codes;

                if (isEnd) {
                    var arr = codes.split(",");
                    var addressList = [];

                    arr.forEach(function (code, i, array) {
                        var nextCode = array[i + 1];
                        var address = _this.store.getAddressByCode(nextCode);// || "-&nbsp;&nbsp;-";
                        address && addressList.push(address);
                    }, this);
                    _this.callback && _this.callback({ codes: arr, address: addressList });
                    _this.onResult({ codes: arr, address: addressList });
                    _this.hide();
                    return
                } else {
                    _this.listDomNode.classList.remove("slideLeft");
                    setTimeout(function () {
                        _this.listDomNode.classList.add("slideLeft");
                    }, 0);
                }
            } else if (e.target === _this.domNode) {
                _this.hide();
            }
        };
        this.domNode.addEventListener("click", function (e) {
            handler(e);
        }, false);
        this.okBtn.addEventListener("click", function () {
            var arr = _this.__selectedCode.split(",");
            if (arr.length) {
                var addressList = [];

                arr.forEach(function (code, i, array) {
                    var nextCode = array[i + 1];
                    var address = _this.store.getAddressByCode(nextCode);// || "-&nbsp;&nbsp;-";
                    address && addressList.push(address);
                }, this);
                _this.callback && _this.callback({ codes: arr, address: addressList });
                _this.onResult.call(_this, { codes: arr, address: addressList });
                _this.hide();
            }

        }, false);
        this.closeBtn.addEventListener("click", function () {
            _this.__selectedCode = "";
            _this.hide()
        }, false);
    }
    CityPicker.prototype = {
        constructor: CityPicker,
        show: function (options) {
            this.init(options);
            var codes, selectedCode;

            if (Object.prototype.toString.call(options) === "[object Object]") {
                codes = options.codes || "86";
                selectedCode = options.selectedCode || null;
            } else {
                codes = "86";
            }
            var arr = codes.split(",");
            this.okBtn.classList[arr.length < 2 ? "add" : "remove"]("hidden");
            arr.forEach(function (code, i, array) {
                var nextCode = array[i + 1];
                var address = this.store.getAddressByCode(nextCode);// || "-&nbsp;&nbsp;-";
                if (address && address.length > 6) {
                    address = address.substr(0, 2) + '...' + address.substr(address.length - 3, 3);
                }
                address && (this.toolDomNode.innerHTML += '<li data-code="' + array.slice(0, i + 1).join(",") + '"> ' + address + '</li>')
            }, this);

            this.toolDomNode.lastChild && (this.toolDomNode.lastChild.className = "selected");

            var parentCodes = arr.join(","),
                lastCode = arr.pop();

            if (lastCode) {
                var dict = this.store.getDictByCode(lastCode);
                if (!dict && selectedCode) {
                    parentCodes = arr.join(",");
                    lastCode = arr.pop();
                }
                this.showOptions(lastCode, parentCodes, selectedCode);
            }

        },
        init: function (options) {
            var _this = this;
            if (options.success && Object.prototype.toString.call(options.success) === "[object Function]") {
                this.callback = options.success;
            }
            this.listDomNode.classList.add("slideLeft");
            this.domNode.style.display = "";
            this.domNode.style.visibility = "visible";
            this.domNode.style.visibility = "";
            this.listDomNode.innerHTML = this.toolDomNode.innerHTML = "";
            setTimeout(function () {
                _this.domNode.firstChild.classList.add("slideIn");
            }, 0);
        },
        showOptions: function (code, parentCodes, selectedCode) {
            var dict = dict = this.store.getDictByCode(code),
                html = "",
                isEnd = false;

            for (var k in dict) {
                if (!isEnd) {
                    isEnd = !this.store.getDictByCode(k);
                }
                var address = dict[k];
                if (address && address.length > 13) {
                    address = address.substr(0, 4) + '...' + address.substr(address.length - 4, 4);
                }
                html += '<li ' + (selectedCode === k ? 'class="selected"' : '') + (isEnd ? ' data-end="1"' : '') + ' data-code="' + (parentCodes + "," + k) + '">' + address + '</li>'
            }
            this.listDomNode.innerHTML = html;
            var _this = this;

        },
        hide: function () {
            this.domNode.style.display = "none";
            this.domNode.style.visibility = "hidden";
            this.domNode.firstChild.classList.remove("slideIn");
            this.listDomNode.classList.remove("slideLeft");
        },
        onResult: function () {

        }

    }

    var CityPicker = new CityPicker(new CityStore(ChineseDistricts, 86));

    if (typeof window !== 'undefined') {
        window.CityPicker = CityPicker;
    }
    return CityPicker;
})