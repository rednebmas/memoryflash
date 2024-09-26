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
        
        setupWebView()
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
        
        let config = WKWebViewConfiguration()
        config.userContentController = contentController
        
        let rect = CGRect(origin: CGPointMake(50, 50), size: CGSize(width: 200, height: 200))
        let webView = WKWebView(frame: rect, configuration: config)
        
        Autolayout.addAsSubview(webView, toParent: self.view, pinToParent: true)
        
        if let url = URL(string: "https://mflash.riker.tech/") {
            let request = URLRequest(url: url)
            webView.load(request)
            webView.backgroundColor = .red
        }
        
        self.webView = webView
    }
    
    func sendMIDIMessageToWebView(message: String) {
        print("Sending MIDI message: \(message)")
        let script = "handleMIDIMessage('\(message)')"
        webView?.evaluateJavaScript(script, completionHandler: nil)
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
            
            parseMIDIMessages(bytes: bytes)
            packet = MIDIPacketNext(&packet).pointee
        }
    }
    
    func parseMIDIMessages(bytes: [UInt8]) {
        var index = 0
        while index < bytes.count {
            let statusByte = bytes[index]
            let messageType = statusByte & 0xF0
            let channel = statusByte & 0x0F
            
            if messageType == 0x90 && index + 2 < bytes.count {
                // Note On
                let note = bytes[index + 1]
                let velocity = bytes[index + 2]
                let midiMessage = "Note On - Channel: \(channel + 1), Note: \(note), Velocity: \(velocity)"
                DispatchQueue.main.async {
                    self.sendMIDIMessageToWebView(message: midiMessage)
                }
                index += 3
            } else if messageType == 0x80 && index + 2 < bytes.count {
                // Note Off
                let note = bytes[index + 1]
                let velocity = bytes[index + 2]
                let midiMessage = "Note Off - Channel: \(channel + 1), Note: \(note), Velocity: \(velocity)"
                DispatchQueue.main.async {
                    self.sendMIDIMessageToWebView(message: midiMessage)
                }
                index += 3
            } else {
                index += 1
            }
        }
    }
    
    func connectToMIDISources() {
        let sourceCount = MIDIGetNumberOfSources()
        for index in 0..<sourceCount {
            let src = MIDIGetSource(index)
            if !connectedSources.contains(src) {
                let status = MIDIPortConnectSource(inputPort, src, nil)
                if status == noErr {
                    print("Connected to new midi source: \(src)")
                    connectedSources.append(src)
                } else {
                    print("Error connecting to source: \(status)")
                }
            }
        }
    }
    
    @IBAction func openBluetoothMIDICentral(_ sender: Any) {
        let btMidiVC = CABTMIDICentralViewController()
        self.present(btMidiVC, animated: true, completion: nil)
    }
    
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        print("Did receive message from userContentController")
    }
    
}
