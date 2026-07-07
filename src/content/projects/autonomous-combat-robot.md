---
title: "ECE118 Robot"
summary: "An autonomous robot that finds opposing robots by their IR beacons and shoots ping-pong balls at them, built for ECE118, a mechatronics course."
date: "Spring 2026"
sortDate: 2026-06-01
status: in-progress
featured: true
draft: false
role: "Mechanical and Electrical"
tags: ["Mechatronics", "Embedded C", "Sensors", "Autonomy", "Analog Filters", "KiCad", "State Machines"]
highlights:
  - "Seven channel lensed IR detector array tracked the 2 kHz enemy beacon landing accurate shots from under 1 ft to 16 ft, while rejecting 1.5 kHz and 2.5 kHz decoy beacons"
  - "Fully autonomous robot after startup within match constraints"
  - "Whole robot built for $122.36 of a $150 budget, heavy on salvage and laser-cut plywood"
cad: []
---

In ECE118 (Intro to Mechatronics, a capstone style robotics course at UCSC), we spent five weeks designing, and building a robot in order to compete in a tournament-style competition at the end of finals week. Our final bot passed the minimum specification for the competition, and made it to semi-finals in the competition. 

![Assembled robot on the bench](/images/robot/bot-assembled.jpg)

*The assembled robot: differential drive base, laser-cut plywood layers, stepper-driven turret with flywheel cannon and the IR detector array on top.*

The robot navigates by following the field's middle tape line to the shooting zone — harder logic than the side-tape route most teams took — using four IR reflectance modules for tape detection and two microswitch bumpers behind a laser-cut whisker for collision recovery. The interesting engineering, though, is in how it finds the other robot.

## Beacon detection

Each robot carries a 2 kHz IR beacon, and the course adds obstacle beacons at 1.5 kHz and 2.5 kHz that have to be ignored. Our answer was an eight-channel phototransistor array on the turret, multiplexed through a single analog filter chain so the whole thing reads out over three digital pins.

Getting the optics right took three iterations. A 3D-printed PLA housing leaked IR straight through its walls and lit up every channel at close range. Bare aluminum tubes fixed the crosstalk but had a field of view that changed drastically with distance. The final design press-fits a convex lens into each machined aluminum tube, focusing light onto the phototransistor with enough margin to absorb assembly tolerances.

![Exploded CAD of the detector optics](/images/robot/detector-optics-exploded.jpg)

*Exploded view of the final detector array: machined aluminum tubes, press-fit lenses, and 3D-printed shrouds in a common housing.*

We characterized every sensor on a purpose-built test stand, sweeping angle and distance and reading amplitude on an oscilloscope. The data caught a badly seated lens in one sensor — reseating it roughly tripled long-range performance.

![Lens reseat before/after data](/images/robot/lens-reseat-improvement.jpg)

*Test-stand data for one sensor before and after reseating its lens.*

The analog chain — 30× pre-amplification, a fourth-order Chebyshev bandpass centered at 2 kHz with a 200 Hz passband, post-gain, peak detector, and a comparator with hysteresis — was designed in KiCad and built on perfboard.

![Filter chain schematic](/images/robot/filter-chain-schematic.jpg)

*The full per-channel signal path: pre-amp, bandpass filter, post-gain, peak detection, and comparator.*

![Multiplexer and counter boards](/images/robot/mux-counter-perfboard.jpg)

*The boards as built. A counter IC drives the mux select lines, so eight channels sample through one filter using three digital pins.*

With seven active sensors spaced 7.33° apart (44° total field of view), the assembled array detected the beacon from under 1 ft out to 16 ft with no dead zones between channels.

## Turret and shooter

The cannon and detector ride on a stepper-driven turret — a TMC2209 driver salvaged from a 3D printer, a laser-cut plywood gear reduction for holding torque, and a lazy Susan bearing gluing the whole rotating mass to the chassis with low friction. Decoupling aiming from driving means the robot shoots accurately regardless of chassis orientation.

![Turret rotating subassembly CAD](/images/robot/turret-subassembly-cad.jpg)

*CAD of the turret rotating subassembly: stepper pinion, plywood ring gear, and lazy Susan bearing.*

The shooter is two flywheel assemblies clamped onto a PVC barrel whose inner diameter happens to fit a ping-pong ball snugly. A servo-driven rack-and-pinion trigger feeds balls in, with ball bearings salvaged from a drill gearbox pressed into the rack to kill slop and friction.

## Software, briefly

A hierarchical state machine on the Uno32 ties everything together: a scan phase finds the opponent and fixes the robot's orientation, then it follows the middle tape to the shooting zone — handling bump recovery and tape corrections as nested sub-states — before entering the shooting routine. Because aiming runs independently of the drivetrain, a bumped chassis never throws off a shot.

The one place the firmware got fussy was the stepper. Step pulses run off a dedicated timer interrupt at tenth-of-a-degree resolution, since the framework's 1 kHz tick would have capped step rate and added visible jitter. Firing is event-driven for the same reason it matters mechanically: the flywheels spin up the instant any detector first sees the beacon, so the shot is ready by the time the turret finishes centering.

## Budget

The whole robot came in at $122.36 against a $150 cap — laser-cut plywood structure, salvaged stepper and driver, and a free IKEA drill that donated its gearbox bearings.

The full report is still being finished; competition results and the complete writeup will land here when it's done.
