import Foundation

enum Server: String {
    case development = "http://sd-mbpr.local:5173/"
    case production = "https://mflash.riker.tech/"
}

#if DEBUG
private let serverKey = "WEB_APP_SERVER"

var WEB_APP_URL: String {
    get { UserDefaults.standard.string(forKey: serverKey) ?? Server.development.rawValue }
    set { UserDefaults.standard.set(newValue, forKey: serverKey) }
}
#else
let WEB_APP_URL = Server.production.rawValue
#endif
