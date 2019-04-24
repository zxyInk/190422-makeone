/**
 * Created by Administrator on 2019/4/24.
 * 首先设置cookie的属性并获取cookie的值
 *然后定义需要采集的字段,便于维护和更改
 */
(function(){
    /*
    负责读取浏览器cookie数据
     */
    var cookieUtils ={
        /*
        向浏览器写入cookie数据
         */
        set :function (cookieName, cookieValue) {
            var cookieText = encodeURIComponent(cookieName)+ "="+encodeURIComponent(cookieValue);
            var date = new Date();
            var currentTime = date.getTime();
            var tenYearLongTime = 10 * 365 * 24 * 60 * 60 * 1000 ;
            var tenYearAfter =currentTime + tenYearLongTimer ;
            date.setTime(tenYearAfter);
            cookieText += ";expires="+date.toUTCString();
            document.cookie = cookieText

        },
        /*
        向浏览器获取cookie数据
        document.cookie
         */
        get:function (cookieName) {
            var cookieValue = null
            var cookieText = document.cookie;
            if (cookieText.indexOf(encodeURIComponent(cookieName))>-1){
                var itmes =cookieText.split(";")
                for (index in itmes){
                    var kv =itmes[index].split("=")
                    var  key = kv[0].trim();
                    var value = kv[1].trim();
                    if (key == encodeURIComponent(cookieName)){
                        cookieValue=decodeURIComponent(value)
                    }
                }
            }
            return cookieValue;
        }
    };
    /*
    采集用户行为事件数据
     */
    var tracker = {
        clientConfig: {
            logServerUrl: "http://minil/log.gif",
            sessionTimeOut: 2 * 60 * 1000,
            logVersion: "1.0"
        },
        cookieKeys: {
            uuid: "uid",
            sid: "sid",
            previsitTime: "pre_visit_time"
        },
        events: {
            launchEvent: "e_l",
            pageVeiwEvent: "e_pv",
            addCartEvent: "e_ad",
            searchEvent: "e_s"
        },
        /*
         定义需要采集的字段
         */
        columns: {
            eventName: "en",
            version: "ver",
            platform: "pl",
            sdk: "sdk",
            uuid: "uid",
            sessionId: "sid",
            resolution: "b_rst",
            userAgent: "b_usa",
            language: "l",
            clientTime: "ct",
            currentUrl: "url",
            referrerUrl: "ref",
            title: "tt",
            keyword: "kw",
            goodsId: "gid"
        },
        /*
         设置uuid到cookie
         */
        setUuid: function (uuid) {
            cookieUtils.set(this.cookieKeys.uuid, uuid)

        },
        getUuid: function () {
            return cookieUtils.get(this.cookieKeys.uuid)

        },
        /*
         设置会话ID
         */
        setSid: function (sid) {
            cookieUtils.set(this.cookieKeys.sid, sid)
        },
        getSid: function () {
            return cookieUtils.get(this.cookieKeys.sid)

        },
        /*
         todo 会话开始
         */
        sessionStart: function () {
            if (!this.getSid()) {
                this.createNewSession();
            } else {
                if (this.isSessionTimeOut()) {
                    this.createNewSession();
                } else {
                    this.updatePreVisitTime();
                }
            }
            this.pageviewEvent();
        },
        createNewSession: function () {
            var sid = this.guid();
            this.setSid(sid);
            if (!this.getUuid()) {
                var uuid = this.guid();
                this.setUuid(uuid);
                this.launchEvent();
            }
        },
        launchEvent: function () {
            var data = {};
            data[this.columns.eventName] = this.events.launchEvent;
            this.setCommonColumns(data);
            this.sendDataToLogServer(data);

        },
        pageViewEvent: function () {
            var data = {};
            data[this.columns.eventName] = this.events.pageVeiwEvent;
            this.setCommonColumns(data);
            data[this.columns.currentUrl] = window.location.href;
            data[this.columns.title] = document.title;
            data[this.columns.referrerUrl] = document.referrer;
            this.sendDataToLogServer(data)
        },
        searchEvent: function (keyword) {
            var data = {};
            data[this.columns.eventName] = this.events.searchEvent;
            this.setCommonColumns(data);
            data[this.columns.keyword] = keyword;
            this.sendDataToLogServer(data);

        },
        addCartEvent: function (goodsId) {
            var data = [];
            data[this.columns.eventName] = this.events.addCartEvent;
            this.setCommonColumons(data);
            data[this.columns.goodsId] = goodsId;
            this.sendDataToLogServer(data);

        },
        isSessionTimeOut: function () {
            var currenTime = new Date().getTime();
            var preVisitTime = cookieUtils.get(this.cookieKeys.sessionTimeOut)
        },
        sendDataToLogServer: function (data) {
            var paramsText = "";
            for (key in data) {
                if (key && data[key]) {
                    paramsText += encodeURIComponent(key) + "=" + encodeURIComponent(data[key]) + "&"
                }
                if (paramsText)
                    paramsText = paramsText.substring(0, paramsText.length - 1);

                var url = this.clientConfig.logServerUrl + "?" + paramsText;
                var i = new Image(1, 1);
                i.src = url;
                this.updatePreVisiTime();
            }
        },
        updatePreVisiTime: function () {
            cookieUtils.set(this.cookieKeys.previsitTime, new Date().getTime());
            Date().getTime();
        },
        setCommonColumons: function (data) {
            data[this.columns.version] = this.clientConfig.logVersion;
            var userAgent = window.navigator.userAgent.toLowerCase();
            data[this.columns.userAgent] = userAgent;
            if (userAgent.indexOf("android") > -1) {
                data[this.columns.platform] = "android";
            } else if (userAgent.indexOf("ios") > -1) {
                data[this.columns.platform] = "ios";
            } else {
                data[this.columns.platform] = "pc";
            }
            data[this.columns.sdk] = "js";
            data[this.columns.uuid] = this.getUuid();
            data[this.columns.sessionId] = this.getSid();
            data[this.columns.resolution] = window.screen.width + "*" + window.screen.height;
            data[this.columns.language] = window.navigator.language;
            data[this.columns.clientTime] = new Date().getTime();

        },
        guid: function () {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
    };
            tracker.sessionStart();
window.__AX__={
    sessionStart:function () {
      tracker.sessionStart();
    },
    searchEvent:function (keyword) {
        tracker.searchEvent(keyword);
    },
    addCartEvent:function (goodsId) {
        tracker.addCartEvent(goodsId);
    }
}

})();
