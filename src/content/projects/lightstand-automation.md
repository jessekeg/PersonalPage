---
title: "Lightstand Automation"
summary: "A wireless pan/tilt fixture for studio lights, built with stepper motors and an ESP-NOW link between ESP32 boards."
date: "2024"
sortDate: 2024-06-01
status: completed
featured: false
draft: false
role: "Personal project"
tags: ["ESP32", "ESP-NOW", "Stepper Motors", "3D Printing", "Machining"]
highlights:
  - "Remote pan/tilt control of studio lights, no ladder required"
  - "ESP-NOW peer-to-peer link between ESP32 boards, so there's no Wi-Fi network or pairing process on set"
  - "3D-printed structure with manually machined load-bearing parts"
cad: []
---

Adjusting studio lights on tall stands normally means climbing up to each one between shots. This fixture mounts between the stand and the light and lets a photographer re-aim it from a remote instead.

Stepper motors drive the adjustment axes. The remote and the fixture each use an ESP32, communicating over ESP-NOW, which keeps latency low and avoids needing a Wi-Fi network or any pairing process on set. The structure is mostly 3D printed, with the load-bearing parts machined manually.
