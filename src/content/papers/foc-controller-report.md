---
title: "Field-Oriented Control with Custom Inline Current Sensing: Design and Validation"
summary: "Technical report covering the analog front-end design, real-time firmware architecture, calibration methodology, and measured performance of a from-scratch FOC motor controller."
venue: "ECE course project report, UC Santa Cruz"
date: "Winter 2026"
sortDate: 2026-03-15
draft: true
pdf: ""
tags: ["FOC", "Motor Control", "Analog Design", "STM32"]
---

*Draft — attach the final PDF via the dashboard (Papers → edit → PDF path), then unpublish this note and flip `draft` off.*

Planned structure:

1. High-side bidirectional current sensing: topology selection and common-mode analysis
2. Three-stage analog front end: in-amp, gain/filtering, level shifting
3. PWM-synchronized injected ADC sampling at 20 kHz
4. Cascaded PI architecture and tuning methodology
5. Calibration: least-squares current calibration, encoder LUT correction
6. Measured results vs. encoder-only baseline
