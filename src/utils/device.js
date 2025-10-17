class DeviceDetector {
  constructor() {
    this.ua = navigator.userAgent.toLowerCase()
  }

  get isIOS() {
    return /iphone|ipad|ipod/.test(this.ua)
  }

  get isAndroid() {
    return /android/.test(this.ua)
  }

  get isWindowsPhone() {
    return /windows phone/.test(this.ua)
  }

  get isWindows() {
    return /windows/.test(this.ua) && !this.isWindowsPhone
  }

  get isMac() {
    return /macintosh|mac os x/.test(this.ua)
  }

  get isLinux() {
    return /linux/.test(this.ua) && !this.isAndroid
  }

  get isMobile() {
    return this.isIOS || this.isAndroid || this.isWindowsPhone
  }

  get isDesktop() {
    return !this.isMobile
  }

  get osType() {
    if (this.isIOS) return 'IOS'
    if (this.isAndroid) return 'ANDROID'
    if (this.isWindowsPhone) return 'WINDOWS_PHONE'
    if (this.isWindows) return 'WIN'
    if (this.isMac) return 'MAC'
    if (this.isLinux) return 'LINUX'
    return 'UNKNOWN'
  }

  // 获取详细版本信息
  get iosVersion() {
    if (!this.isIOS) return null
    const match = this.ua.match(/os (\d+)_(\d+)_?(\d+)?/)
    return match ? `${match[1]}.${match[2]}.${match[3] || 0}` : null
  }

  get androidVersion() {
    if (!this.isAndroid) return null
    const match = this.ua.match(/android (\d+(\.\d+)*)/)
    return match ? match[1] : null
  }
}

// 导出单例
export const device = new DeviceDetector()

