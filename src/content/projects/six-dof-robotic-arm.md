---
title: "6-DOF Robotic Arm with 3D-Printed Cycloidal Gearboxes"
summary: "A low-cost 6-axis robotic arm with 3D-printed cycloidal gearboxes at the high-load joints, running C++/ROS motion code on an ESP32."
date: "2024–2025"
sortDate: 2025-06-01
status: ongoing
featured: true
draft: false
role: "Personal project — design, fabrication, and software"
tags: ["Robotics", "C++", "ROS", "ESP32", "3D Printing", "Mechanism Design", "Onshape"]
highlights:
  - "Designed 3D-printable cycloidal gearboxes to increase torque at the high-load joints"
  - "Movement algorithms in C++ and ROS on an ESP32, currently supporting edge tracking and drawing on a plane"
  - "One person, whole stack: mechanism design, fabrication, electronics, and motion software"
cad:
  - kind: stl
    src: /models/cycloidal-disc-sample.stl
    title: "Cycloidal gearbox disc"
    caption: "Sample disc geometry from the gearbox design. Drag to orbit, scroll to zoom."
---

An ongoing personal project to build a capable 6-axis arm without the cost of commercial servo gearboxes. I do everything on it myself: mechanism design, fabrication, electronics, and software.

## Gearboxes

The high-load joints need more torque than hobby motors provide directly, and machined gearboxes with usable ratings cost more than the rest of the arm combined. I designed cycloidal gearboxes that print reliably on a desktop printer instead. Cycloidal drives tolerate shock loads well and don't depend on fine tooth geometry, which makes them a good match for FDM printing.

## Software

Motion code is written in C++ with ROS, running on an ESP32. The arm currently supports edge tracking and drawing on a plane.

## CAD

The viewer below shows the disc geometry at the center of the gearbox design. The assembly models live in Onshape, and I'll add embed links once the document is cleaned up for public sharing.
