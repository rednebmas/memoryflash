import UIKit
import CoreMIDI

class SettingsViewController: UIViewController {
    var midiManager: MIDIManager?
#if DEBUG
    var serverLabel: UILabel?
    var onServerChange: (() -> Void)?
#endif

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .systemBackground
        setupUI()
    }

    func setupUI() {
        let stack = UIStackView()
        stack.axis = .vertical
        stack.alignment = .center
        stack.spacing = 12
        stack.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(stack)
        NSLayoutConstraint.activate([
            stack.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            stack.centerYAnchor.constraint(equalTo: view.centerYAnchor),
        ])

        if let manager = midiManager {
            let devices = manager.connectedSourceNames()
            let deviceLabel = UILabel()
            deviceLabel.numberOfLines = 0
            deviceLabel.textAlignment = .center
            deviceLabel.text = devices.isEmpty ? "No MIDI devices" : "Connected: \(devices.joined(separator: ", "))"
            stack.addArrangedSubview(deviceLabel)
        }

        let version = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "unknown"
        let versionLabel = UILabel()
        versionLabel.text = "Version: \(version)"
        stack.addArrangedSubview(versionLabel)

        #if DEBUG
        let label = UILabel()
        label.text = "Server: \(WEB_APP_URL)"
        stack.addArrangedSubview(label)
        serverLabel = label

        let selector = UISegmentedControl(items: ["Dev", "Prod"])
        selector.selectedSegmentIndex = WEB_APP_URL == Server.production.rawValue ? 1 : 0
        selector.addTarget(self, action: #selector(changeServer), for: .valueChanged)
        stack.addArrangedSubview(selector)
        #endif

        let midiButton = UIButton(type: .system)
        midiButton.setTitle("Bluetooth MIDI Settings", for: .normal)
        midiButton.addTarget(self, action: #selector(openBluetooth), for: .touchUpInside)
        stack.addArrangedSubview(midiButton)
    }

    @objc func openBluetooth() {
        if let viewController = presentingViewController as? ViewController {
            dismiss(animated: true) {
                viewController.openBluetoothMIDICentral(self)
            }
        } else {
            dismiss(animated: true, completion: nil)
        }
    }

#if DEBUG
    @objc func changeServer(_ sender: UISegmentedControl) {
        let server: Server = sender.selectedSegmentIndex == 0 ? .development : .production
        WEB_APP_URL = server.rawValue
        serverLabel?.text = "Server: \(WEB_APP_URL)"
        onServerChange?()
    }
#endif
}
