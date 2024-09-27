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

// MIDI notification callback function
func midiNotifyProc(message: UnsafePointer<MIDINotification>, refCon: UnsafeMutableRawPointer?) {
    let viewController = Unmanaged<ViewController>.fromOpaque(refCon!).takeUnretainedValue()
    viewController.midiNotification(message: message)
}

class ViewController: UIViewController, WKScriptMessageHandler {
    
    var midiClient = MIDIClientRef()
    var inputPort = MIDIPortRef()
    var connectedSources = [MIDIEndpointRef]()
    
    var webView: WKWebView?
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        MIDIClientCreate("MIDI Client" as CFString, midiNotifyProc, UnsafeMutableRawPointer(Unmanaged.passUnretained(self).toOpaque()), &midiClient)
        
        MIDIInputPortCreateWithBlock(midiClient, "Input Port" as CFString, &inputPort) { [weak self] (packetList, srcConnRefCon) in
            self?.handleMIDIPacketList(packetList: packetList)
        }
        
        connectToMIDISources()
        
    }
    
    func midiNotification(message: UnsafePointer<MIDINotification>) {
        let notification = message.pointee
        print("MIDI Notification: \(notification.messageID)")
        if notification.messageID == .msgObjectAdded {
            let addRemoveNotification = message.withMemoryRebound(to: MIDIObjectAddRemoveNotification.self, capacity: 1) { $0.pointee }
            if addRemoveNotification.childType == .source {
                print("New MIDI source added")
                DispatchQueue.main.async {
                    self.connectToMIDISources()
                }
            }
        }
    }
    
    func setupWebView() {
        if self.webView != nil { return }
        
        let contentController = WKUserContentController()
        contentController.add(self, name: "midiHandler")
        contentController.add(self, name: "consoleHandler")

        // Disable pinch to zoom & read console log messages
        if let disablePinchToZoomPath = Bundle.main.path(forResource: "Setup", ofType: "js"),
           let jsString = try? String(contentsOfFile: disablePinchToZoomPath, encoding: .utf8)
        {
            let userScript = WKUserScript(source: jsString, injectionTime: .atDocumentStart, forMainFrameOnly: false)
            contentController.addUserScript(userScript)
        } else {
            print("Failed to insert setup script")
        }
        
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
        
        // if let url = URL(string: "https://mflash.riker.tech/") {
        if let url = URL(string: "http://sd-mbpr.local:5173/") {
            let request = URLRequest(url: url)
            webView.load(request)
        }
        
        self.webView = webView
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
    
    func handleMIDIPacketList(packetList: UnsafePointer<MIDIPacketList>) {
        var packet = packetList.pointee.packet
        for _ in 0..<packetList.pointee.numPackets {
            let packetLength = Int(packet.length)
            let data = Mirror(reflecting: packet.data).children
            var bytes = [UInt8]()
            for i in 0..<packetLength {
                if let byte = data.dropFirst(i).first?.value as? UInt8 {
                    bytes.append(byte)
                }
            }
            
            sendMIDIMessageToWebView(data: bytes)
            packet = MIDIPacketNext(&packet).pointee
        }
    }
    
    func connectToMIDISources() {
        let sourceCount = MIDIGetNumberOfSources()
        for index in 0..<sourceCount {
            let src = MIDIGetSource(index)
            if !connectedSources.contains(src) {
                // Get the name of the MIDI source
                var name: Unmanaged<CFString>?
                let statusName = MIDIObjectGetStringProperty(src, kMIDIPropertyName, &name)
                
                if let name = name?.takeRetainedValue(), statusName == noErr {
                    if String(name) == "Session 1" {
                        // Idk what "Session 1" is but it's annoying and confusing me
                        continue
                    }
                    print("MIDI Source Name: \(name)")
                } else {
                    print("Could not retrieve MIDI source name, error: \(statusName)")
                }
                
                
                let status = MIDIPortConnectSource(inputPort, src, nil)
                if status == noErr {
                    print("Connected to new midi source: \(src)")
                    connectedSources.append(src)
                } else {
                    print("Error connecting to source: \(status)")
                }
            }
        }
        
        if connectedSources.count > 0 {
            setupWebView()
        }
    }
    
    @IBAction func openBluetoothMIDICentral(_ sender: Any) {
        let btMidiVC = CABTMIDICentralViewController()
        self.present(btMidiVC, animated: true, completion: nil)
    }
    
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        if message.name == "consoleHandler", let consoleMessage = message.body as? String {
            print("[JS] \(consoleMessage)")
        } else {
            print("[MFflash] Recieved unknown message: \(message)")
        }
    }

}
