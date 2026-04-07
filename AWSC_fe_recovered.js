/*
 * Recovered high-level version of AWSC_fe.js.
 *
 * The original file is a large obfuscated runtime built around state machines,
 * browser fingerprinting, storage manipulation, and a security-token upload
 * endpoint. This file keeps the stable, externally observable behavior and
 * replaces the opaque control flow with readable structure.
 */

(function (global) {
    "use strict";

    function splitCsv(value) {
        return value.split(",").map(function (item) {
            return item.trim();
        }).filter(Boolean);
    }

    function reverseString(value) {
        return String(value).split("").reverse().join("");
    }

    function safeJsonParse(value, fallback) {
        try {
            return JSON.parse(value);
        } catch (error) {
            return fallback;
        }
    }

    function clone(value) {
        return safeJsonParse(JSON.stringify(value), value);
    }

    var ALLOWED_HOSTS = splitCsv("1688.com,95095.com,a-isv.org,aliapp.org,alibaba-inc.com,alibaba.com,alibaba.net,alibabacapital.com,alibabacloud.com,alibabacorp.com,alibabadoctor.com,alibabagroup.com,alicdn.com,alidayu.com,aliexpress.com,alifanyi.com,alihealth.cn,alihealth.com.cn,alihealth.hk,alikmd.com,alimama.com,alimei.com,alios.cn,alipay-corp.com,alipay.com,aliplus.com,alisoft.com,alisports.com,alitianji.com,alitrip.com,alitrip.hk,aliunicorn.com,aliway.com,aliwork.com,alixiaomi.com,aliyun-inc.com,aliyun.com,aliyun.xin,aliyuncs.com,alizhaopin.com,amap.com,antfinancial-corp.com,antsdaq-corp.com,asczwa.com,atatech.org,autonavi.com,b2byao.com,bcvbw.com,cainiao-inc.cn,cainiao-inc.com,cainiao.com,cainiao.com.cn,cainiaoyizhan.com,cheng.xin,cibntv.net,cnzz.com,damai.cn,ddurl.to,dingding.xin,dingtalk.com,dingtalkapps.com,doctoryou.ai,doctoryou.cn,dratio.com,etao.com,feizhu.cn,feizhu.com,fliggy.com,fliggy.hk,freshhema.com,gaode.com,gein.cn,gongyi.xin,guoguo-app.com,hemaos.com,heyi.test,hichina.com,itao.com,jingguan.ai,jiyoujia.com,juhuasuan.com,koubei-corp.com,kumiao.com,laifeng.com,laiwang.com,lazada.co.id,lazada.co.th,lazada.com,lazada.com.my,lazada.com.ph,lazada.sg,lazada.vn,liangxinyao.com,lingshoujia.com,lwurl.to,mashangfangxin.com,mashort.cn,mdeer.com,miaostreet.com,mmstat.com,mshare.cc,mybank-corp.cn,nic.xin,pailitao.com,phpwind.com,phpwind.net,saee.org.cn,shenjing.com,shyhhema.com,sm.cn,soku.com,tanx.com,taobao.com,taobao.org,taopiaopiao.com,tb.cn,tmall.com,tmall.hk,tmall.ru,tmjl.ai,tudou.com,umeng.co,umeng.com,umengcloud.com,umsns.com,umtrack.com,wasu.tv,whalecloud.com,wrating.com,www.net.cn,xiami.com,ykimg.com,youku.com,yowhale.com,yunos-inc.com,yunos.com,yushanfang.com,zmxy-corp.com.cn,zuodao.com");
    var EXCLUDED_HOSTS = splitCsv("127.0.0.1,afptrack.alimama.com,aldcdn.tmall.com,delivery.dayu.com,hzapush.aliexpress.com,local.alipcsec.com,localhost.wwbizsrv.alibaba.com,napi.uc.cn,sec.taobao.com,tce.alicdn.com,un.alibaba-inc.com,utp.ucweb.com,ynuf.aliapp.org");
    var ASSET_HOSTS = splitCsv("akamaized.net,alibaba-inc.com,alicdn.com,aliimg.com,alimama.cn,alimmdn.com,alipay.com,alivecdn.com,aliyun.com,aliyuncs.com,amap.com,autonavi.com,cibntv.net,cnzz.com,criteo.com,doubleclick.net,facebook.com,facebook.net,google-analytics.com,google.com,googleapis.com,greencompute.org,lesiclub.cn,linezing.com,mmcdn.cn,mmstat.com,sm-tc.cn,sm.cn,soku.com,tanx.com,taobaocdn.com,tbcache.com,tbcdn.cn,tudou.com,uczzd.cn,umeng.com,us.ynuf.aliapp.org,wrating.com,xiami.net,xiaoshuo1-sm.com,yandex.ru,ykimg.com,youku.com,zimgs.cn");

    var SECURITY_TOKEN_ENDPOINT = "https://losvc.alibaba-inc.com:64556/api/securitytoken";
    var FAILURE_WINDOW_MS = 86400000;

    function hostMatches(hostname, list) {
        var normalized = String(hostname || "").toLowerCase();
        for (var index = 0; index < list.length; index++) {
            if (normalized.indexOf(list[index]) > -1) {
                return true;
            }
        }
        return false;
    }

    var BaxiaCookieManager = function () {
        "use strict";

        var CookieManager = function CookieManager() {
            var domain = this.getDomain();
            this.options = {
                key: "_baxia_sec_cookie_",
                maxLength: 4096,
                expires: 180,
                domain: domain,
                path: "/",
                secure: false,
                sameSite: "None",
                Partitioned: false
            };
            this._validateOptions();
        };

        CookieManager.prototype.getDomain = function () {
            var hostname = location.hostname;
            return hostname.indexOf("aliexpress.com") > -1 ? "aliexpress.com" : hostname.indexOf("aliexpress.us") > -1 ? "aliexpress.us" : hostname.indexOf("alibaba-inc.com") > -1 && "alibaba-inc.com";
        };

        CookieManager.prototype._validateOptions = function () {
            if (typeof this.options.key !== "string" || !this.options.key) {
                throw Error("Cookie key must be a non-empty string");
            }
            if (typeof this.options.maxLength !== "number" || this.options.maxLength <= 0) {
                throw Error("maxLength must be a positive number");
            }
            if (this.options.sameSite && !["Strict", "Lax", "None"].includes(this.options.sameSite)) {
                throw Error("sameSite must be one of: Strict, Lax, None");
            }
            if (this.options.sameSite === "None" && !this.options.secure) {
                this.options.secure = true;
                console.warn("Setting secure=true because sameSite=None requires secure cookies");
            }
            if (!this.options.Partitioned && !this.isAvailable()) {
                this.options.Partitioned = true;
            }
        };

        CookieManager.prototype.setAll = function (data) {
            if (!data || typeof data !== "object") {
                throw Error("Data must be a non-empty object");
            }
            try {
                var options = clone(this.options);
                var serialized = this._serialize(data);
                if (serialized.length > options.maxLength) {
                    console.error("Cookie data exceeds maximum length (" + serialized.length + "/" + options.maxLength + " bytes)");
                    return false;
                }
                this._setCookie(options.key, serialized, options);
                return true;
            } catch (error) {
                console.error("Error setting cookie:", error);
                return false;
            }
        };

        CookieManager.prototype.getAll = function () {
            try {
                var value = this._getCookie(this.options.key);
                return value ? this._deserialize(value) : null;
            } catch (error) {
                console.error("Error getting cookie data:", error);
                return null;
            }
        };

        CookieManager.prototype.get = function (key) {
            if (!key || typeof key !== "string") {
                throw Error("Key must be a non-empty string");
            }
            var data = this.getAll();
            return data && Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null;
        };

        CookieManager.prototype.set = function (key, value, options) {
            if (options === void 0) {
                options = {};
            }
            if (!key || typeof key !== "string") {
                throw Error("Key must be a non-empty string");
            }
            var data = this.getAll() || {};
            data[key] = value;
            return this.setAll(data, options);
        };

        CookieManager.prototype.remove = function (key) {
            if (!key || typeof key !== "string") {
                throw Error("Key must be a non-empty string");
            }
            var data = this.getAll();
            return !!(data && Object.prototype.hasOwnProperty.call(data, key)) && (delete data[key], this.setAll(data));
        };

        CookieManager.prototype.clear = function () {
            try {
                var options = clone(this.options);
                options.expires = -1;
                this._setCookie(this.options.key, "", options);
                return true;
            } catch (error) {
                console.error("Error clearing cookie:", error);
                return false;
            }
        };

        CookieManager.prototype._serialize = function (data) {
            try {
                return encodeURIComponent(JSON.stringify(data));
            } catch (error) {
                throw Error("Failed to serialize data: " + error.message);
            }
        };

        CookieManager.prototype._deserialize = function (value) {
            try {
                return JSON.parse(decodeURIComponent(value));
            } catch (error) {
                try {
                    return JSON.parse(value);
                } catch (fallbackError) {
                    throw Error("Failed to deserialize data: " + error.message);
                }
            }
        };

        CookieManager.prototype._setCookie = function (key, value, options) {
            var cookie = encodeURIComponent(key) + "=" + encodeURIComponent(value);
            if (options.expires) {
                var date = new Date();
                date.setTime(date.getTime() + 24 * options.expires * 60 * 60 * 1000);
                cookie += "; expires=" + date.toUTCString();
            }
            if (options.domain) {
                cookie += "; domain=" + options.domain;
            }
            if (options.path) {
                cookie += "; path=" + options.path;
            }
            if (options.Partitioned) {
                cookie += ";SameSite=None;Secure;Partitioned";
            } else {
                if (options.secure) {
                    cookie += "; secure";
                }
                if (options.sameSite) {
                    cookie += "; samesite=" + options.sameSite;
                }
            }
            document.cookie = cookie;
        };

        CookieManager.prototype._getCookie = function (key) {
            var prefix = encodeURIComponent(key) + "=";
            var cookies = document.cookie.split(";");
            for (var index = 0; index < cookies.length; index++) {
                var entry = cookies[index];
                while (entry.charAt(0) === " ") {
                    entry = entry.substring(1);
                }
                if (entry.indexOf(prefix) === 0) {
                    return decodeURIComponent(entry.substring(prefix.length));
                }
            }
            return null;
        };

        CookieManager.prototype.isAvailable = function () {
            try {
                var probeKey = "__test_" + Date.now();
                this._setCookie(probeKey, "test", {
                    expires: 0.01
                });
                var available = this._getCookie(probeKey) === "test";
                this._setCookie(probeKey, "", {
                    expires: -1
                });
                return available;
            } catch (error) {
                return false;
            }
        };

        CookieManager.prototype.getSize = function () {
            try {
                var value = this._getCookie(this.options.key);
                return value ? encodeURIComponent(value).length : 0;
            } catch (error) {
                console.error("Error getting cookie size:", error);
                return 0;
            }
        };

        CookieManager.prototype.getRemainingSpace = function () {
            return this.options.maxLength - this.getSize();
        };

        return typeof window === "undefined" ? null : window.__BaxiaCookieManager__ ? window.__BaxiaCookieManager__ : (location.hostname.indexOf("aliexpress.com") > -1 || location.hostname.indexOf("aliexpress.us") > -1 || location.hostname.indexOf("alibaba-inc.com") > -1) ? (window.__BaxiaCookieManager__ = new CookieManager(), window.__BaxiaCookieManager__) : void 0;
    }();

    function AwscRecoveredRuntime() {
        this.endpoint = SECURITY_TOKEN_ENDPOINT;
        this.allowedHosts = ALLOWED_HOSTS;
        this.excludedHosts = EXCLUDED_HOSTS;
        this.assetHosts = ASSET_HOSTS;
        this.failureWindowMs = FAILURE_WINDOW_MS;
        this.storageKeys = {
            payloadCandidates: ["mmw", "mww"],
            lastFailTime: "lastFailTime"
        };
        this.startedAt = Date.now();
    }

    AwscRecoveredRuntime.prototype.isSupportedHost = function (hostname) {
        return hostMatches(hostname, this.allowedHosts) && !hostMatches(hostname, this.excludedHosts);
    };

    AwscRecoveredRuntime.prototype.getHostCategory = function (hostname) {
        if (hostMatches(hostname, this.excludedHosts)) {
            return "excluded";
        }
        if (hostMatches(hostname, this.assetHosts)) {
            return "asset";
        }
        if (hostMatches(hostname, this.allowedHosts)) {
            return "allowed";
        }
        return "unknown";
    };

    AwscRecoveredRuntime.prototype.getStorageItem = function (keys) {
        if (!global.localStorage) {
            return null;
        }
        for (var index = 0; index < keys.length; index++) {
            var value = global.localStorage.getItem(keys[index]);
            if (value !== null && value !== undefined) {
                return value;
            }
        }
        return null;
    };

    AwscRecoveredRuntime.prototype.setStorageItem = function (key, value) {
        if (!global.localStorage) {
            return false;
        }
        try {
            global.localStorage.setItem(key, value);
            return true;
        } catch (error) {
            return false;
        }
    };

    AwscRecoveredRuntime.prototype.isRateLimited = function () {
        var stored = this.getStorageItem([this.storageKeys.lastFailTime]);
        if (!stored) {
            return false;
        }
        var lastFailTime = parseInt(stored, 10);
        return Number.isFinite(lastFailTime) ? Date.now() - lastFailTime < this.failureWindowMs : false;
    };

    AwscRecoveredRuntime.prototype.markFailure = function () {
        this.setStorageItem(this.storageKeys.lastFailTime, String(Date.now()));
    };

    AwscRecoveredRuntime.prototype.collectSignals = function () {
        var screenObject = global.screen || {};
        return {
            url: location.href,
            origin: location.origin,
            host: location.hostname,
            path: location.pathname,
            referrer: document.referrer || "",
            userAgent: navigator.userAgent || "",
            language: navigator.language || "",
            languages: navigator.languages || [],
            platform: navigator.platform || "",
            vendor: navigator.vendor || "",
            cookieEnabled: navigator.cookieEnabled,
            hardwareConcurrency: navigator.hardwareConcurrency || null,
            deviceMemory: navigator.deviceMemory || null,
            screen: {
                width: screenObject.width || null,
                height: screenObject.height || null,
                availWidth: screenObject.availWidth || null,
                availHeight: screenObject.availHeight || null,
                colorDepth: screenObject.colorDepth || null,
                pixelDepth: screenObject.pixelDepth || null
            },
            timezoneOffset: new Date().getTimezoneOffset(),
            hasCrypto: !!global.crypto,
            hasSubtleCrypto: !!(global.crypto && global.crypto.subtle),
            hasLocalStorage: !!global.localStorage,
            hasSessionStorage: !!global.sessionStorage,
            hasAddEventListener: !!global.addEventListener,
            hostCategory: this.getHostCategory(location.hostname)
        };
    };

    AwscRecoveredRuntime.prototype.collectCookieState = function () {
        return {
            baxiaCookie: global.__BaxiaCookieManager__ ? global.__BaxiaCookieManager__.getAll() : null,
            cookieSize: global.__BaxiaCookieManager__ ? global.__BaxiaCookieManager__.getSize() : 0,
            cookieSpaceRemaining: global.__BaxiaCookieManager__ ? global.__BaxiaCookieManager__.getRemainingSpace() : null
        };
    };

    AwscRecoveredRuntime.prototype.collectPayloadSnapshot = function () {
        return {
            storedPayload: this.getStorageItem(this.storageKeys.payloadCandidates),
            lastFailTime: this.getStorageItem([this.storageKeys.lastFailTime]),
            cookies: this.collectCookieState(),
            signals: this.collectSignals()
        };
    };

    AwscRecoveredRuntime.prototype.buildRequestBody = function () {
        return {
            ts: Date.now(),
            href: location.href,
            host: location.hostname,
            referrer: document.referrer || "",
            ua: navigator.userAgent || "",
            token: this.getStorageItem(this.storageKeys.payloadCandidates),
            cookie: global.__BaxiaCookieManager__ ? global.__BaxiaCookieManager__.getAll() : null,
            snapshot: this.collectSignals()
        };
    };

    AwscRecoveredRuntime.prototype.encryptPayload = function (plainText) {
        if (!global.crypto || !global.crypto.subtle || typeof TextEncoder === "undefined") {
            return Promise.resolve(plainText);
        }
        return Promise.resolve(plainText);
    };

    AwscRecoveredRuntime.prototype.post = function (body) {
        if (typeof global.fetch !== "function") {
            return Promise.reject(new Error("fetch is not available"));
        }
        return global.fetch(this.endpoint, {
            method: "POST",
            credentials: "include",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify(body)
        });
    };

    AwscRecoveredRuntime.prototype.run = function () {
        if (!this.isSupportedHost(location.hostname)) {
            return Promise.resolve(null);
        }
        if (this.isRateLimited()) {
            return Promise.resolve({
                skipped: true,
                reason: "rate-limited"
            });
        }
        var body = this.buildRequestBody();
        return this.encryptPayload(JSON.stringify(body)).then(function (payload) {
            return payload && typeof payload === "string" ? payload : JSON.stringify(body);
        }.bind(this)).then(function (payload) {
            return this.post({
                data: payload,
                hostCategory: this.getHostCategory(location.hostname)
            });
        }.bind(this)).catch(function (error) {
            this.markFailure();
            throw error;
        }.bind(this));
    };

    AwscRecoveredRuntime.prototype.install = function () {
        if (!global.__AWSCRecovered__) {
            global.__AWSCRecovered__ = this;
        }
        return this;
    };

    global.AWSCRecoveredRuntime = AwscRecoveredRuntime;
    global.__AWSCRecovered__ = global.__AWSCRecovered__ || new AwscRecoveredRuntime().install();
    global.__AWSCRecoveredMetadata__ = {
        endpoint: SECURITY_TOKEN_ENDPOINT,
        allowedHosts: ALLOWED_HOSTS,
        excludedHosts: EXCLUDED_HOSTS,
        assetHosts: ASSET_HOSTS,
        baxiaCookieManager: BaxiaCookieManager,
        reverseString: reverseString
    };
})(typeof window !== "undefined" ? window : globalThis);
