//
//  ViewController.swift
//  MemoryFlashiOS
//
//  Created by Sam Bender on 9/25/24.
//

import UIKit
import CoreMIDI
import CoreAudioKit
import WebKit

class ViewController: UIViewController, WKScriptMessageHandler {

    var midiManager: MIDIManager!

    var webView: WKWebView?

    @IBOutlet weak var settingsButton: UIButton?
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        midiManager = MIDIManager(delegate: self)
    }
    
    override var prefersHomeIndicatorAutoHidden: Bool {
        return true
    }
    
    func setupWebView() {
        if self.webView != nil { return }
        
        let contentController = WKUserContentController()
        contentController.add(self, name: "midiHandler")
        contentController.add(self, name: "consoleHandler")
        contentController.add(self, name: "openSettings")

        // Disable pinch to zoom & read console log messages
        if let disablePinchToZoomPath = Bundle.main.path(forResource: "Setup", ofType: "js"),
           let jsString = try? String(contentsOfFile: disablePinchToZoomPath, encoding: .utf8)
        {
            let userScript = WKUserScript(source: jsString, injectionTime: .atDocumentStart, forMainFrameOnly: false)
            contentController.addUserScript(userScript)
        } else {
            print("Failed to insert setup script")
        }

#if DEBUG
        if let debugPath = Bundle.main.path(forResource: "SetupDebug", ofType: "js"),
           let debugString = try? String(contentsOfFile: debugPath, encoding: .utf8)
        {
            let debugScript = WKUserScript(source: debugString, injectionTime: .atDocumentStart, forMainFrameOnly: false)
            contentController.addUserScript(debugScript)
        }
#endif
        
        // Load the MIDI polyfill
        if let polyfillPath = Bundle.main.path(forResource: "WebMIDIPolyfill", ofType: "js"),
           let polyfillString = try? String(contentsOfFile: polyfillPath, encoding: .utf8)
        {
            let userScript = WKUserScript(source: polyfillString, injectionTime: .atDocumentStart, forMainFrameOnly: false)
            contentController.addUserScript(userScript)
        } else {
            print("Failed to load WebMIDIPolyfill.js")
        }
        

        let config = WKWebViewConfiguration()
        config.userContentController = contentController
        
        let webView = WKWebView(frame: .zero, configuration: config)
        webView.backgroundColor = .clear
        #if DEBUG
        webView.isInspectable = true
        #endif
        
        Autolayout.addAsSubview(webView, toParent: self.view, pinToParent: true)

        if let url = URL(string: WEB_APP_URL) {
            let request = URLRequest(url: url)
            webView.load(request)
        }
        
        self.webView = webView
    }

    func reloadWebView() {
        if let url = URL(string: WEB_APP_URL) {
            let request = URLRequest(url: url)
            webView?.load(request)
        }
    }
    
    func sendMIDIMessageToWebView(data: [UInt8]) {
        let dataString = data.map { String($0) }.joined(separator: ",")
        let script = "_receiveMIDIMessage([\(dataString)])"
        // print("Sending message from swift: \(script)")
        
        DispatchQueue.main.async {
            self.webView?.evaluateJavaScript(script, completionHandler: { (result, error) in
                if let error = error {
                    print("Error evaluating JavaScript: \(error)")
                }
            })
        }
    }
    
    @IBAction func openBluetoothMIDICentral(_ sender: Any) {
        midiManager.presentBluetoothMIDICentral(from: self)
    }

    @IBAction func openSettings(_ sender: Any) {
        let settingsVC = SettingsViewController()
        settingsVC.midiManager = midiManager
#if DEBUG
        settingsVC.onServerChange = { [weak self] in
            self?.reloadWebView()
        }
#endif
        settingsVC.modalPresentationStyle = .formSheet
        present(settingsVC, animated: true, completion: nil)
    }
    
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        if message.name == "consoleHandler", let consoleMessage = message.body as? String {
            print("[JS] \(consoleMessage)")
        } else if message.name == "openSettings" {
            openSettings(self)
        } else {
            print("[MFflash] Recieved unknown message: \(message)")
        }
    }

}

// MARK: MIDIManagerDelegate

extension ViewController: MIDIManagerDelegate {
    func midiManager(_ manager: MIDIManager, didReceive data: [UInt8]) {
        sendMIDIMessageToWebView(data: data)
    }
    
    func midiManagerDidConnectToSources(_ manager: MIDIManager) {
        setupWebView()
    }
}
