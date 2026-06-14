---
title: "Field-Oriented BLDC Motor Controller with Custom Inline Current Sensing"
summary: "Field-oriented control for a brushless DC motor, written from scratch in C on a bare-metal STM32, with a custom analog front end for high-side current sensing."
date: "Winter 2026"
sortDate: 2026-03-01
status: completed
featured: true
draft: false
role: "Partner project (team of 2) — ECE course project, UC Santa Cruz"
tags: ["STM32", "Bare-metal C", "FOC", "Analog Design", "Control Systems", "PlatformIO"]
highlights:
  - "20 kHz inner current loop (Id/Iq PI regulation) with a 500 Hz outer position loop, speed damping, and integral action"
  - "Three-stage high-side bidirectional current-sense amplifier: instrumentation amp, gain/low-pass stage, buffered level shifter into the STM32 ADC's 0–3.3 V range"
  - "Current sampling synchronized to the PWM carrier via TIM1-triggered injected ADC conversions at 20 kHz"
  - "Held a 200 mL load at 9.5 in vs. 7.5 in for the encoder-only baseline"
cad: []
---

We built a field-oriented controller for a brushless DC motor as a two-person course project, writing the full pipeline in C on a bare-metal STM32 Nucleo F411RE: Clarke/Park transforms, cascaded PI position and current loops, and software space-vector PWM. We evaluated the Arduino-based SimpleFOC library early on and decided against it over timing reliability, which meant owning every layer ourselves.

## Current sensing

Our DRV8313 driver board gave us no access to the low-side current path, so current had to be measured on the high side, where a differential signal of a few millivolts rides on a 12 V common-mode swing. This is widely considered the hardest sensing topology to get right. We designed and breadboarded a three-stage front end for it:

1. An instrumentation amplifier to reject the common-mode voltage
2. A combined gain and low-pass filter stage, with cutoffs around 5 kHz and 10 kHz
3. A buffered level shifter to center the signal in the STM32 ADC's 0–3.3 V range

We also made the 0.1 Ω shunt resistors ourselves, trimming wire length under a 1 A test current and reading the drop with a DMM in voltage mode. (We worked out beforehand that voltage mode gave roughly 10× better measurement accuracy than resistance mode.) Folding the wire in half before coiling it cancels most of the self-inductance.

For what it's worth, the high-side design wasn't the original plan. An earlier low-cost driver board caught fire during testing from poor heat dissipation, and working through the replacement DRV8313 board's schematic to understand why low-side sensing was inaccessible is what forced the harder topology.

## Control architecture

Current sampling is synchronized to the PWM carrier: TIM1 triggers injected ADC conversions at 20 kHz, timed to the midpoint of each PWM cycle so measurements land at a repeatable point during switching. The inner current loop runs at 20 kHz with PI controllers regulating Id and Iq, holding Id at zero. A 500 Hz outer position loop adds speed damping and integral action.

The real-time loop uses a sine lookup table with interpolation instead of library trig. Telemetry streams over UART as CSV into MATLAB scripts we wrote for loop tuning and diagnostics.

## Calibration and characterization

The motor was undocumented, so we measured what we needed: 7.25 Ω phase resistance (Wye model) and 7 pole pairs, found by current-injection lock-in testing. The current-sense channels were calibrated against a bench supply using a least-squares fit of ADC counts to known currents, and the AS5600 magnetic encoder got a full-rotation lookup-table correction plus IIR filtering on the angle measurements.

## Results

Compared against an encoder-only baseline on the same hardware, the current-sensing controller held a 200 mL load at 9.5 in versus 7.5 in, a measurable improvement in holding stiffness.
