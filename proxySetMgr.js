'use strict'

const child_process = require('child_process');

const macProxyManager = {};
macProxyManager.networks = () => {
    const result = child_process.spawnSync("networksetup", ["-listallhardwareports"])
    const regex = /Hardware Port: (.+)\nDevice: (.+)\n/g;
    const matches = result.stdout.toLocaleString().matchAll(regex)
    const list = []
    for (const match of matches) {
        list.push({
            hp: match[1],
            device: match[2]
        })
    }
    return list
}
macProxyManager.networkMain = () => {
    const result = child_process.spawnSync("route", ["get", "default"])
    const regex = /interface:\s+(\w+)/;
    const match = regex.exec(result.stdout.toLocaleString());
    const int = match ? match[1] : ""
    for (const intElement of macProxyManager.networks()) {
        if (intElement.device === int) {
            return intElement.hp
        }
    }
    return ""
}
//自动发现代理
macProxyManager.automaticDiscoveryAgent = (state = true) => {
    const result = child_process.spawnSync("networksetup", ["-setproxyautodiscovery", state ? "on" : "off"])
    return result.stdout.toLocaleString()
}
//自动配置代理
macProxyManager.automaticConfigurationAgent = (url) => {
    const result = child_process.spawnSync("networksetup", ["-setautoproxyurl", url])
    return result.stdout.toLocaleString()
}
//网页代理(HTTP)
macProxyManager.webAgent = (ip, port) => {
    if (!ip || !port) {
        console.log('failed to set global proxy server.\n ip and port are required.');
        return;
    }
    const network = macProxyManager.networkMain() || "Wi-Fi"
    const result = child_process.spawnSync("networksetup", ["-setwebproxy", network, ip, port])
    return result.stdout.toLocaleString()
}
//安全网页代理(HTTPS)
macProxyManager.secureWebAgent = (ip, port) => {
    if (!ip || !port) {
        console.log('failed to set global proxy server.\n ip and port are required.');
        return;
    }
    const network = macProxyManager.networkMain() || "Wi-Fi"
    const result = child_process.spawnSync("networksetup", ["-setsecurewebproxy", network, ip, port])
    return result.stdout.toLocaleString()
}
//SOCKS代理
macProxyManager.socksAgent = (ip, port) => {
    if (!ip || !port) {
        console.log('failed to set global proxy server.\n ip and port are required.');
        return;
    }
    const network = macProxyManager.networkMain() || "Wi-Fi"
    const result = child_process.spawnSync("networksetup", ["-setsocksfirewallproxy", network, ip, port])
    return result.stdout.toLocaleString()
}

macProxyManager.enableGlobalProxy = (ip, port) => {
    macProxyManager.webAgent(ip, port)
    macProxyManager.secureWebAgent(ip, port)
}

macProxyManager.disableGlobalProxy = () => {
    const network = macProxyManager.networkMain() || "Wi-Fi"
    child_process.spawnSync("networksetup", ["-setwebproxystate", network, "off"])
    child_process.spawnSync("networksetup", ["-setsecurewebproxystate", network, "off"])
}

const winProxyManager = {}

winProxyManager.enableGlobalProxy = (ip, port) => {
    child_process.spawnSync("reg", ["add", "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings", "/v", "ProxyServer", "/t", "REG_SZ", "/d", `${ip}:${port}`, "/f"])
    child_process.spawnSync("reg", ["add", "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings", "/v", "ProxyEnable", "/t", "REG_DWORD", "/d", "1", "/f"])
}

winProxyManager.disableGlobalProxy = () => {
    child_process.spawnSync("reg", ["add", "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings", "/v", "ProxyEnable", "/t", "REG_DWORD", "/d", "0", "/f"])
}

module.exports = /^win/.test(process.platform) ? winProxyManager : macProxyManager;