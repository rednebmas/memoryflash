//
//  Autolayout.swift
//
//  Created by Sam Bender on 3/18/18.
//  Copyright © 2018 Sam Bender. All rights reserved.
//

import UIKit

public extension NSLayoutConstraint {
    @discardableResult
    func activate(_ activate: Bool = true) -> NSLayoutConstraint {
        self.isActive = activate
        return self
    }
}


public class Autolayout {
    
    @discardableResult public static func pinToSuperView(view: UIView, margin: CGFloat) -> [NSLayoutConstraint] {
        return pinToSuperView(view: view, top: margin, bottom: -margin, left: margin, right: margin)
    }
    
    @discardableResult public static func pinToSuperView(view: UIView,
                                                         top: CGFloat = 0.0,
                                                         bottom: CGFloat = 0.0,
                                                         left: CGFloat = 0.0,
                                                         right: CGFloat = 0.0) -> [NSLayoutConstraint] {
        guard let superview = view.superview else {
            assert(false, "<SBCore.Autolayout.pinToSuperView> view \(view) did not have superview")
            return []
        }
        view.translatesAutoresizingMaskIntoConstraints = false
        
        let leading = NSLayoutConstraint(item: superview,
                                         attribute: .leading,
                                         relatedBy: .equal,
                                         toItem: view,
                                         attribute: .leading,
                                         multiplier: 1,
                                         constant: -left)
        
        let trailing = NSLayoutConstraint(item: superview,
                                          attribute: .trailing,
                                          relatedBy: .equal,
                                          toItem: view,
                                          attribute: .trailing,
                                          multiplier: 1,
                                          constant: right)
        
        let top = view.topAnchor.constraint(equalTo: superview.topAnchor, constant: top)
        let bottom = view.bottomAnchor.constraint(equalTo: superview.bottomAnchor, constant: bottom)
        
        let constraints = [leading, trailing, top, bottom]
        NSLayoutConstraint.activate(constraints)
        return constraints
    }
    
    public static func addAsSubview(_ subview: UIView, toParent parent: UIView, pinToParent: Bool = false) {
        subview.translatesAutoresizingMaskIntoConstraints = false
        parent.addSubview(subview)
        if pinToParent {
            self.pinToSuperView(view: subview)
        }
    }
    
    @discardableResult public static func w(view: UIView, w: CGFloat) -> NSLayoutConstraint {
        return view.widthAnchor.constraint(equalToConstant: w).activate()
    }
    
    @discardableResult public static func h(view: UIView, h: CGFloat) -> NSLayoutConstraint {
        return view.heightAnchor.constraint(equalToConstant: h).activate()
    }
    
    public static func wh(view: UIView, width: CGFloat, height: CGFloat) {
        view.widthAnchor.constraint(equalToConstant: width).activate()
        view.heightAnchor.constraint(equalToConstant: height).activate()
    }
    
    public static func pinViewToBottomOfSuperview(view: UIView, bottomSpacing: CGFloat = 0.0) {
        guard let superview = view.superview else { return }
        view.translatesAutoresizingMaskIntoConstraints = false
        
        view.bottomAnchor.constraint(equalTo: superview.bottomAnchor, constant: -bottomSpacing).isActive = true
        NSLayoutConstraint(item: superview,
                           attribute: .leading,
                           relatedBy: .equal,
                           toItem: view,
                           attribute: .leading,
                           multiplier: 1,
                           constant: 0).isActive = true
        
        NSLayoutConstraint(item: superview,
                           attribute: .trailing,
                           relatedBy: .equal,
                           toItem: view,
                           attribute: .trailing,
                           multiplier: 1,
                           constant: 0).isActive = true
    }
    
    public static func pinViewToTopOfSuperview(view: UIView, topSpacing: CGFloat = 0.0)
    {
        guard let superview = view.superview else { return }
        view.translatesAutoresizingMaskIntoConstraints = false
        
        view.topAnchor.constraint(equalTo: superview.bottomAnchor, constant: topSpacing).isActive = true
        NSLayoutConstraint(item: superview,
                           attribute: .leading,
                           relatedBy: .equal,
                           toItem: view,
                           attribute: .leading,
                           multiplier: 1,
                           constant: 0).isActive = true
        
        NSLayoutConstraint(item: superview,
                           attribute: .trailing,
                           relatedBy: .equal,
                           toItem: view,
                           attribute: .trailing,
                           multiplier: 1,
                           constant: 0).isActive = true
    }
    
    public static func make(view: UIView, theSameSizeAndCenteredOnView otherView: UIView) {
        center(view: view, on: otherView)
        view.widthAnchor.constraint(equalTo: otherView.widthAnchor).isActive = true
        view.heightAnchor.constraint(equalTo: otherView.heightAnchor).isActive = true
    }
    
    public static func center(view view1: UIView, on view2: UIView) {
        view1.centerXAnchor.constraint(equalTo: view2.centerXAnchor).isActive = true
        view1.centerYAnchor.constraint(equalTo: view2.centerYAnchor).isActive = true
    }
    
    public static func centerHorizontally(view view1: UIView, on view2: UIView) {
        view1.centerXAnchor.constraint(equalTo: view2.centerXAnchor).isActive = true
    }
    
    public static func centerVertically(view view1: UIView, on view2: UIView) {
        view1.centerYAnchor.constraint(equalTo: view2.centerYAnchor).isActive = true
    }
    
    @discardableResult public static func equalWidths(view1: UIView, view2: UIView) -> NSLayoutConstraint {
        let widthConstraint = view1.widthAnchor.constraint(equalTo: view2.widthAnchor, multiplier: 1.0, constant: 0)
        return widthConstraint.activate()
    }
    
    @discardableResult public static func equalHeights(view1: UIView, view2: UIView) -> NSLayoutConstraint {
        let heightConstraint = view1.heightAnchor.constraint(equalTo: view2.heightAnchor)
        heightConstraint.activate()
        return heightConstraint
    }
    
    @discardableResult public static func leading(v1: UIView, v2: UIView, constant c: CGFloat = 0) -> NSLayoutConstraint {
        return v1.leadingAnchor.constraint(equalTo: v2.leadingAnchor, constant: c).activate()
    }
    
    @discardableResult public static func trailing(v1: UIView, v2: UIView, constant c: CGFloat = 0) -> NSLayoutConstraint {
        return v1.trailingAnchor.constraint(equalTo: v2.trailingAnchor, constant: c).activate()
    }
    
    public static func animateConstraint(containerView: UIView,
                                         animations: @escaping () -> Void,
                                         completion: ((Bool) -> Void)?,
                                         options: UIView.AnimationOptions = [],
                                         duration: TimeInterval = 0.25)
    {
        containerView.layoutIfNeeded()
        animations()
        UIView.animate(withDuration: duration,
                       delay: 0.0,
                       options: options,
                       animations: {
            containerView.layoutIfNeeded()
        }, completion: completion)
    }
    
    public static func animateSpringDampingConstraint(containerView: UIView,
                                                      animations: @escaping () -> Void,
                                                      completion: ((Bool) -> Void)?,
                                                      options: UIView.AnimationOptions = [],
                                                      duration: TimeInterval = 0.25)
    {
        containerView.layoutIfNeeded()
        animations()
        UIView.animate(withDuration: duration,
                       delay: 0.0,
                       usingSpringWithDamping: 1.0,
                       initialSpringVelocity: 7,
                       options: options,
                       animations: {
            containerView.layoutIfNeeded()
        }, completion: completion)
    }
    
}
