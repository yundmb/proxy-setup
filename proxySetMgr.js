'use strict'

const child_process = require('child_process');

const macProxyManager = {};
macProxyManager.networks = () => {
    const result = child_process.spawnSync("networksetup", ["-listallhardwareports"])
    const regex = /Device:\s+(\S+)/g;
    const matches = result.stdout.toLocaleString().matchAll(regex)
    const list = []
    for (const match of matches) {
        list.push(match[1])
    }
    return list
}
macProxyManager.networkMain = () => {
    const result = child_process.spawnSync("route", ["get", "default"])
    const regex = /interface:\s+(\w+)/;
    const match = regex.exec(result.stdout.toLocaleString());
    return match ? match[1] : ""
}
//自动发现代理
macProxyManager.automaticDiscoveryAgent = () => {

}
//自动配置代理
macProxyManager.automaticConfigurationAgent = () => {

}
//网页代理(HTTP)
macProxyManager.webAgent = () => {

}
//安全网页代理(HTTPS)
macProxyManager.secureWebAgent = () => {

}
//SOCKS代理
macProxyManager.socksAgent = () => {

}
//不包括简单主机名
macProxyManager.simpleHostNamesAreNotIncluded = () => {

}
macProxyManager.ignoreSetting = () => {

}


const winProxyManager = {}

module.exports = /^win/.test(process.platform) ? winProxyManager : macProxyManager;