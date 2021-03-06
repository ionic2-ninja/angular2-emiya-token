'use strict';
var Utils_1 = require("emiya-utils/Utils");
var Event_1 = require("angular2-emiya-event/Event");
var LocalToken = (function () {
    function LocalToken() {
    }
    LocalToken.getObj = function (key) {
        if (!key) {
            if (typeof window.localStorage['TokenMaps'] === 'undefined')
                return [];
            else {
                var result = [];
                window.localStorage['TokenMaps'].split(",").forEach(function (e) {
                    result.push({
                        'key': e.split(':')[0],
                        'token': e.split(':')[1],
                        'timestamp': e.split(':')[2],
                        'expiry_time': e.split(':')[3],
                        'can_refresh': e.split(':')[4],
                        'disabled': e.split(':')[5]
                    });
                });
            }
            return result;
        }
        var list;
        if (typeof window.localStorage['TokenMaps'] === 'undefined') {
            return {};
        }
        else {
            list = window.localStorage['TokenMaps'].split(",");
        }
        for (var i in list) {
            if (list[i].substr(0, list[i].indexOf(":")) === key) {
                return {
                    'key': list[i].split(':')[0],
                    'token': list[i].split(':')[1],
                    'timestamp': list[i].split(':')[2],
                    'expiry_time': list[i].split(':')[3],
                    'can_refresh': list[i].split(':')[4],
                    'disabled': list[i].split(':')[5]
                };
            }
        }
        return {};
    };
    LocalToken.set = function (key, token, expiry_time, can_refresh, disabled) {
        if (expiry_time === void 0) { expiry_time = null; }
        if (can_refresh === void 0) { can_refresh = null; }
        if (disabled === void 0) { disabled = null; }
        token = token.toString();
        var list;
        if (typeof window.localStorage['TokenMaps'] === 'undefined') {
            list = [];
        }
        else {
            list = window.localStorage['TokenMaps'].split(",");
        }
        var token_expiry_time, can_refresh_flag;
        if (LocalToken.utils.notNull(expiry_time)) {
            token_expiry_time = typeof expiry_time != 'string' ? expiry_time.toString() : expiry_time;
            if (token_expiry_time.indexOf('[') >= 0) {
                token_expiry_time = token_expiry_time.replace('[', '').replace(']', '');
                can_refresh_flag = 0;
            }
            else if (token_expiry_time.indexOf('{') >= 0) {
                token_expiry_time = token_expiry_time.replace('{', '').replace('}', '');
                can_refresh_flag = 1;
            }
            if (LocalToken.utils.notNull(can_refresh))
                can_refresh_flag = can_refresh;
            else if (!LocalToken.utils.notNull(can_refresh_flag))
                can_refresh_flag = 1;
        }
        else {
            token_expiry_time = 86400 * 365;
            if (token.indexOf(':') >= 0) {
                token_expiry_time = token.split(':')[1];
                token = token.split(':')[0];
                if (token_expiry_time.indexOf('[') >= 0) {
                    token_expiry_time = token_expiry_time.replace('[', '').replace(']', '');
                    can_refresh_flag = 0;
                }
                else if (token_expiry_time.indexOf('{') >= 0) {
                    token_expiry_time = token_expiry_time.replace('{', '').replace('}', '');
                    can_refresh_flag = 1;
                }
            }
            if (LocalToken.utils.notNull(can_refresh))
                can_refresh_flag = can_refresh;
            else if (!LocalToken.utils.notNull(can_refresh_flag))
                can_refresh_flag = 1;
        }
        var str, old;
        //console.log(JSON.stringify(window.localStorage['TokenMaps']));
        for (var i in list) {
            str = list[i].substr(0, list[i].indexOf(":"));
            old = LocalToken.getObj(key);
            if (str === key /*&& old.disabled == '0' && new Date().getTime() - old.timestamp <= expiry_time*/) {
                str = key + ":" + token + ":" + new Date().getTime() + ":" + token_expiry_time + ":" + can_refresh_flag + ":" + (disabled == true ? '1' : '0');
                //str = key + ":" + token + ":" + (can_refresh_flag == 1 ? new Date().getTime() : old.timestamp) + ":" + token_expiry_time + ":" + can_refresh_flag + ":" + (disabled == true ? '1' : '0');
                list[i] = str;
                window.localStorage['TokenMaps'] = list.join(',');
                LocalToken.$event.emit('tokenChanged', { action: 'renew', location: 'local', "new": LocalToken.getObj(key), old: old });
                LocalToken.$event.emit('tokenChanged:renew', { location: 'local', "new": LocalToken.getObj(key), old: old });
                return;
            }
        }
        list.push(key + ":" + token + ":" + new Date().getTime() + ":" + token_expiry_time + ":" + can_refresh_flag + ":" + (disabled == true ? '1' : '0'));
        window.localStorage['TokenMaps'] = list.join(',').replace(/,{2,}/g, ',');
        if (window.localStorage['TokenMaps'].substr(0, 1) === ',')
            window.localStorage['TokenMaps'] = window.localStorage['TokenMaps'].substr(1);
        if (window.localStorage['TokenMaps'].substr(window.localStorage['TokenMaps'].length - 1) === ',')
            window.localStorage['TokenMaps'] = window.localStorage['TokenMaps'].substr(0, window.localStorage['TokenMaps'].length - 1);
        LocalToken.$event.emit('tokenChanged', { action: 'add', location: 'local', "new": LocalToken.getObj(key) });
        LocalToken.$event.emit('tokenChanged:add', { location: 'local', "new": LocalToken.getObj(key) });
    };
    LocalToken.updateTimestamp = function (key) {
        var list;
        if (typeof window.localStorage['TokenMaps'] === 'undefined') {
            return;
        }
        else {
            list = window.localStorage['TokenMaps'].split(",");
        }
        if (key)
            for (var i in list) {
                if (list[i].split(':')[0] === key && list[i].split(':')[4] == 1 && list[i].split(':')[5] == 0) {
                    LocalToken.set(list[i].split(':')[0], list[i].split(':')[1], list[i].split(':')[3], list[i].split(':')[4], list[i].split(':')[5]);
                }
            }
        else
            for (var i in list) {
                if (list[i].split(':')[4] == 1 && list[i].split(':')[5] == 0)
                    LocalToken.set(list[i].split(':')[0], list[i].split(':')[1], list[i].split(':')[3], list[i].split(':')[4], list[i].split(':')[5]);
            }
    };
    LocalToken.get = function (key) {
        if (!key)
            return typeof window.localStorage['TokenMaps'] === 'undefined' ? '' : window.localStorage['TokenMaps'];
        var list;
        if (typeof window.localStorage['TokenMaps'] === 'undefined') {
            return '';
        }
        else {
            list = window.localStorage['TokenMaps'].split(",");
        }
        for (var i in list) {
            if (list[i].split(':')[0] === key && list[i].split(':')[5] == 0 && (parseInt(list[i].split(':')[3]) == -1 || (new Date().getTime() - list[i].split(':')[2]) <= parseInt(list[i].split(':')[3]) * 1000)) {
                //console.log(key + "=" + parseInt(list[i].split(':')[3]))
                if (list[i].split(':')[4] == 1)
                    LocalToken.set(list[i].split(':')[0], list[i].split(':')[1], list[i].split(':')[3], list[i].split(':')[4], list[i].split(':')[5]);
                return list[i].split(':')[1];
            }
        }
        return '';
    };
    LocalToken.has = function (key) {
        if (!LocalToken.utils.notNull(key))
            return false;
        var list;
        if (typeof window.localStorage['TokenMaps'] === 'undefined') {
            return false;
        }
        else {
            list = window.localStorage['TokenMaps'].split(",");
        }
        for (var i in list) {
            if (list[i].split(':')[0] === key && list[i].split(':')[5] == 0 && (parseInt(list[i].split(':')[3]) == -1 || (new Date().getTime() - list[i].split(':')[2]) <= parseInt(list[i].split(':')[3]) * 1000)) {
                return true;
            }
        }
        return false;
    };
    LocalToken["delete"] = function (key) {
        if (!LocalToken.utils.notNull(key))
            return;
        var list;
        if (typeof window.localStorage['TokenMaps'] === 'undefined') {
            return;
        }
        else {
            list = window.localStorage['TokenMaps'].split(",");
        }
        var str, result = '', target = LocalToken.getObj(key);
        for (var i in list) {
            str = list[i].substr(0, list[i].indexOf(":"));
            if (str !== key) {
                result = result + "," + list[i];
            }
        }
        window.localStorage['TokenMaps'] = result.substr(1);
        if (LocalToken.utils.notNullStrAndObj(target)) {
            LocalToken.$event.emit('tokenChanged', { action: 'delete', location: 'local', target: target });
            LocalToken.$event.emit('tokenChanged:delete', { location: 'local', target: target });
        }
    };
    LocalToken.clear = function () {
        delete window.localStorage['TokenMaps'];
        LocalToken.$event.emit('tokenChanged', { action: 'clear', location: 'local' });
        LocalToken.$event.emit('tokenChanged:clear', { location: 'local' });
    };
    LocalToken.disable = function (key) {
        var list;
        if (typeof window.localStorage['TokenMaps'] === 'undefined') {
            return;
        }
        else {
            list = window.localStorage['TokenMaps'].split(",");
        }
        var str, result = '', flag = false, old;
        if (key) {
            for (var i in list) {
                str = list[i].substr(0, list[i].indexOf(":"));
                if (str !== key) {
                    result = result + "," + list[i];
                }
                else {
                    flag = true;
                    result = result + "," + list[i].split(':')[0] + ':' + list[i].split(':')[1] + ':' + list[i].split(':')[2] + ':' + list[i].split(':')[3] + ':' + list[i].split(':')[4] + ':1';
                }
            }
            if (flag)
                old = LocalToken.getObj(key);
            window.localStorage['TokenMaps'] = result.substr(1);
            if (flag) {
                LocalToken.$event.emit('tokenChanged', { action: 'renew', location: 'local', "new": LocalToken.getObj(key), old: old });
                LocalToken.$event.emit('tokenChanged:renew', { location: 'local', "new": LocalToken.getObj(key), old: old });
            }
        }
        else {
            for (var i in list) {
                result = result + "," + list[i].split(':')[0] + ':' + list[i].split(':')[1] + ':' + list[i].split(':')[2] + ':' + list[i].split(':')[3] + ':' + list[i].split(':')[4] + ':1';
                old = LocalToken.getObj(key);
                old.disabled = '1';
                LocalToken.$event.emit('tokenChanged', {
                    action: 'renew',
                    location: 'local',
                    "new": old,
                    old: LocalToken.getObj(key)
                });
                LocalToken.$event.emit('tokenChanged:renew', { location: 'local', "new": old, old: LocalToken.getObj(key) });
            }
            window.localStorage['TokenMaps'] = result.substr(1);
        }
    };
    LocalToken.enable = function (key) {
        var list;
        if (typeof window.localStorage['TokenMaps'] === 'undefined') {
            return;
        }
        else {
            list = window.localStorage['TokenMaps'].split(",");
        }
        var str, result = '', flag = false, old;
        if (key) {
            for (var i in list) {
                str = list[i].substr(0, list[i].indexOf(":"));
                if (str !== key) {
                    result = result + "," + list[i];
                }
                else {
                    result = result + "," + list[i].split(':')[0] + ':' + list[i].split(':')[1] + ':' + list[i].split(':')[2] + ':' + list[i].split(':')[3] + ':' + list[i].split(':')[4] + ':0';
                }
            }
            if (flag)
                old = LocalToken.getObj(key);
            window.localStorage['TokenMaps'] = result.substr(1);
            if (flag) {
                LocalToken.$event.emit('tokenChanged', { action: 'renew', location: 'local', "new": LocalToken.getObj(key), old: old });
                LocalToken.$event.emit('tokenChanged:renew', { location: 'local', "new": LocalToken.getObj(key), old: old });
            }
        }
        else {
            for (var i in list) {
                result = result + "," + list[i].split(':')[0] + ':' + list[i].split(':')[1] + ':' + list[i].split(':')[2] + ':' + list[i].split(':')[3] + ':' + list[i].split(':')[4] + ':0';
                old = LocalToken.getObj(key);
                old.disabled = '0';
                LocalToken.$event.emit('tokenChanged', {
                    action: 'renew',
                    location: 'local',
                    "new": old,
                    old: LocalToken.getObj(key)
                });
                LocalToken.$event.emit('tokenChanged:renew', { location: 'local', "new": old, old: LocalToken.getObj(key) });
            }
            window.localStorage['TokenMaps'] = result.substr(1);
        }
    };
    return LocalToken;
}());
LocalToken.utils = Utils_1.Utils;
LocalToken.$event = Event_1.Event;
exports.LocalToken = LocalToken;
