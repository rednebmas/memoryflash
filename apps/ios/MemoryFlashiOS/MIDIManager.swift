//
//  MIDIManager.swift
//  WebMIDI
//
//  Created by Sam Bender on 9/27/24.
//

import Foundation
import CoreMIDI
import CoreAudioKit

protocol MIDIManagerDelegate: AnyObject {
    func midiManager(_ manager: MIDIManager, didReceive data: [UInt8])
    func midiManagerDidConnectToSources(_ manager: MIDIManager)
}

// MIDI notification callback function
func midiNotifyProc(message: UnsafePointer<MIDINotification>, refCon: UnsafeMutableRawPointer?) {
    let midiManager = Unmanaged<MIDIManager>.fromOpaque(refCon!).takeUnretainedValue()
    midiManager.midiNotification(message: message)
}

class MIDIManager {
    var midiClient = MIDIClientRef()
    var inputPort = MIDIPortRef()
    var connectedSources = [MIDIEndpointRef]()
    weak var delegate: MIDIManagerDelegate?
    
    init(delegate: MIDIManagerDelegate) {
        self.delegate = delegate
        MIDIClientCreate(
            "MIDI Client" as CFString,
            midiNotifyProc,
            UnsafeMutableRawPointer(Unmanaged.passUnretained(self).toOpaque()),
            &midiClient
        )
        
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
            // Notify delegate
            delegate?.midiManager(self, didReceive: bytes)
            packet = MIDIPacketNext(&packet).pointee
        }
    }
    
    func connectToMIDISources() {
        let sourceCount = MIDIGetNumberOfSources()
        for index in 0..<sourceCount {
            let src = MIDIGetSource(index)
            if !connectedSources.contains(src) {
                var name: Unmanaged<CFString>?
                let statusName = MIDIObjectGetStringProperty(src, kMIDIPropertyName, &name)
                
                if let name = name?.takeRetainedValue(), statusName == noErr {
                    if String(name) == "Session 1" {
                        // Skip "Session 1"
                        continue
                    }
                    print("MIDI Source Name: \(name)")
                } else {
                    print("Could not retrieve MIDI source name, error: \(statusName)")
                }
                
                let status = MIDIPortConnectSource(inputPort, src, nil)
                if status == noErr {
                    print("Connected to new MIDI source: \(src)")
                    connectedSources.append(src)
                } else {
                    print("Error connecting to source: \(status)")
                }
            }
        }
        
        if connectedSources.count > 0 {
            delegate?.midiManagerDidConnectToSources(self)
        }
    }
    
    func presentBluetoothMIDICentral(from viewController: UIViewController) {
        let btMidiVC = CABTMIDICentralViewController()
        viewController.present(btMidiVC, animated: true, completion: nil)
    }
}
