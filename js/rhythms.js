/* Rhythm library: data only. Criteria, generator settings, teaching text, sources.
   Every clinical statement cites ids from docs/sources.md. review: "pending" until the
   nurse checks it; a checked card gets reviewed: { by: "a telemetry RN", date: "Dec 2026" }
   (a role and a month, never a name) and review becomes "reviewed". Normal generator ranges keep a margin from every cutoff; "edge"
   ranges are the borderline strips (just inside a cutoff, on purpose). */
(function (root) {
  "use strict";

  // Criteria are feature sets. Every value is an array of allowed values; rate is
  // [min, max] /min (inclusive) or null (any). The generator reports the same features
  // for each strip, and quiz.js compares them.
  //   reg:    regular | phasic | pause | early | dropped | irregular | none
  //   atrial: sinus (one upright P per QRS) | more (more P than QRS) | none | fib | flutter | retro
  //   pr:     normal | long | lengthens | variable | short | none
  //   qrs:    narrow | wide | none
  //   ectopy: none | pac | pvc-uni | pvc-multi | bigeminy | couplet
  //   shape:  organized | mono | twist | chaotic | flat
  const D = { ectopy: ["none"], shape: ["organized"] };
  function rh(o) {
    o.review = o.reviewed && o.reviewed.by && o.reviewed.date ? "reviewed" : "pending";
    o.lethal = !!o.lethal;
    o.criteria = Object.assign({}, D, o.criteria);
    return o;
  }

  const groups = [
    { id: "sinus", name: "Sinus" },
    { id: "atrial", name: "Atrial" },
    { id: "junctional", name: "Junctional" },
    { id: "ventricular", name: "Ventricular" },
    { id: "blocks", name: "AV blocks" }
  ];

  const SINUS = { reg: ["regular"], atrial: ["sinus"], pr: ["normal"], qrs: ["narrow"] };
  const NARROW_EDGE = [[0.100, 0.110]];

  const rhythms = [
    // ---------------- Sinus ----------------
    rh({
      id: "nsr", group: "sinus", core: true,
      name: "Normal sinus rhythm", short: "NSR",
      criteria: Object.assign({ rate: [60, 100] }, SINUS),
      gen: { kind: "sinus", rate: [62, 98], pr: [0.13, 0.19], qrs: [0.07, 0.10], jitter: 0.012,
        edge: { rate: [[61, 65], [95, 99]], pr: [[0.185, 0.197]], qrs: NARROW_EDGE } },
      teach: { rate: "60 to 100/min", regularity: "Regular", p: "Upright in lead II, one before every QRS, all alike", pr: "0.12 to 0.20 s and constant", qrs: "Narrow, under 0.12 s" },
      lookalikes: ["brady", "tach", "sarr", "first"],
      tellApart: "Same shape as sinus brady and sinus tach. Rate is the only difference, so measure it. A PR over 0.20 s makes it 1st degree block.",
      sources: ["S2", "S1"]
    }),
    rh({
      id: "brady", group: "sinus", core: true,
      name: "Sinus bradycardia", short: "Sinus brady",
      criteria: Object.assign({ rate: [0, 59] }, SINUS),
      gen: { kind: "sinus", rate: [40, 54], pr: [0.13, 0.19], qrs: [0.07, 0.10], jitter: 0.015,
        edge: { rate: [[54, 58]], qrs: NARROW_EDGE } },
      teach: { rate: "Under 60/min", regularity: "Regular", p: "Upright in lead II, one before every QRS", pr: "0.12 to 0.20 s and constant", qrs: "Narrow, under 0.12 s" },
      lookalikes: ["nsr", "junc", "first", "third"],
      tellApart: "Everything looks like NSR except the rate. No P waves, or inverted ones, means junctional. More P waves than QRS means a block.",
      note: "Exams and most nursing references use under 60. The 2018 ACC/AHA/HRS bradycardia guideline uses under 50 for its own definition, so don't be thrown if you see that number.",
      sources: ["S3", "S1", "S9"]
    }),
    rh({
      id: "tach", group: "sinus", core: true,
      name: "Sinus tachycardia", short: "Sinus tach",
      criteria: Object.assign({ rate: [101, 400] }, SINUS),
      gen: { kind: "sinus", rate: [106, 148], pr: [0.12, 0.17], qrs: [0.07, 0.10], jitter: 0.01,
        edge: { rate: [[104, 110]], qrs: NARROW_EDGE } },
      teach: { rate: "Over 100/min", regularity: "Regular", p: "Upright, one before every QRS (at fast rates the P can sit on the end of the T wave)", pr: "0.12 to 0.20 s and constant", qrs: "Narrow, under 0.12 s" },
      lookalikes: ["svt", "flutter", "jtach", "nsr"],
      tellApart: "Narrow and regular with an upright P in front of each QRS. No visible P at all suggests SVT; a sawtooth baseline suggests flutter with 2:1 conduction.",
      sources: ["S4", "S1"]
    }),
    rh({
      id: "sarr", group: "sinus",
      name: "Sinus arrhythmia", short: "Sinus arrhythmia",
      criteria: { rate: null, reg: ["phasic"], atrial: ["sinus"], pr: ["normal"], qrs: ["narrow"] },
      gen: { kind: "sarr", rate: [64, 88], pr: [0.13, 0.19], qrs: [0.07, 0.10] },
      teach: { rate: "Usually normal; count the 6-second strip × 10", regularity: "P-P gradually lengthens and shortens in cycles (usually with breathing); varies by more than 0.12 s", p: "Normal sinus P waves, all the same shape", pr: "Constant", qrs: "Narrow" },
      lookalikes: ["nsr", "afib", "pac", "wenck"],
      tellApart: "The spacing changes smoothly, not suddenly. Every beat still has the same P wave and the same PR. A different-looking early P is a PAC; a PR that grows until a beat drops is Wenckebach.",
      sources: ["S26"]
    }),
    rh({
      id: "pause", group: "sinus",
      name: "Sinus pause / arrest", short: "Sinus pause",
      criteria: { rate: null, reg: ["pause"], atrial: ["sinus"], pr: ["normal"], qrs: ["narrow"] },
      gen: { kind: "pause", rate: [62, 88], pr: [0.13, 0.19], qrs: [0.07, 0.10], jitter: 0.01 },
      teach: { rate: "Underlying sinus rate, with a gap", regularity: "Regular, then a sudden pause with no P wave", p: "Normal sinus P before every QRS; the P is missing during the pause", pr: "Normal and constant", qrs: "Narrow" },
      lookalikes: ["mobitz2", "pac", "sarr", "wenck"],
      tellApart: "In the pause there is no P wave at all. A P wave with no QRS after it is an AV block, not a sinus pause. A pause that is exactly twice the P-P suggests SA exit block instead.",
      sources: ["S27"]
    }),

    // ---------------- Atrial ----------------
    rh({
      id: "pac", group: "atrial",
      name: "Sinus rhythm with PACs", short: "PACs",
      criteria: { rate: null, reg: ["early"], atrial: ["sinus"], pr: ["normal"], qrs: ["narrow"], ectopy: ["pac"] },
      gen: { kind: "pac", rate: [62, 92], pr: [0.13, 0.19], qrs: [0.07, 0.10], jitter: 0.01 },
      teach: { rate: "Underlying rate, usually normal", regularity: "Regular with early beats; the pause after a PAC is not a full compensatory pause (less than double the R-R)", p: "The early beat has its own P wave that looks different (it can hide in the T wave before it)", pr: "Normal (0.12 s or more)", qrs: "Narrow, same as the sinus beats" },
      lookalikes: ["pvc_uni", "sarr", "pause", "afib"],
      tellApart: "Early beat with a P wave and a narrow QRS: PAC. Early beat that is wide with no P: PVC.",
      sources: ["S20"]
    }),
    rh({
      id: "flutter", group: "atrial",
      name: "Atrial flutter", short: "Flutter",
      criteria: { rate: null, reg: ["regular", "irregular"], atrial: ["flutter"], pr: ["none"], qrs: ["narrow"] },
      gen: { kind: "flutter", atrialRate: [260, 320], ratios: [2, 3, 4], qrs: [0.07, 0.10] },
      teach: { rate: "Atrial about 300/min. Ventricular rate depends on conduction: 2:1 ≈ 150, 3:1 ≈ 100, 4:1 ≈ 75", regularity: "Regular with a fixed ratio; irregular with variable conduction", p: "No P waves. Sawtooth flutter waves, inverted in lead II, no flat baseline", pr: "None to measure", qrs: "Narrow" },
      lookalikes: ["afib", "tach", "svt"],
      tellApart: "Look between the QRS complexes for a repeating sawtooth. A regular narrow rhythm near 150 should make you hunt for flutter waves. Variable conduction can look like AFib, but flutter waves are regular.",
      sources: ["S16"]
    }),
    rh({
      id: "afib", group: "atrial", core: true,
      name: "Atrial fibrillation", short: "AFib",
      criteria: { rate: null, reg: ["irregular"], atrial: ["fib"], pr: ["none"], qrs: ["narrow"] },
      gen: { kind: "fib", rate: [70, 145], qrs: [0.07, 0.10], irregularity: [0.16, 0.26] },
      teach: { rate: "Any. Over 100/min is called AFib with RVR (rapid ventricular response)", regularity: "Irregularly irregular: no pattern to the R-R intervals", p: "None. Wavy or flat baseline (fibrillatory waves, fine or coarse)", pr: "None to measure", qrs: "Usually narrow, under 0.12 s" },
      lookalikes: ["flutter", "sarr", "pvc_multi", "pac"],
      tellApart: "Check the R-R intervals first. Truly random spacing with no P waves is AFib. Don't mistake the bumpy baseline for P waves, and don't mistake an organized sawtooth for fibrillation.",
      sources: ["S5", "S6"]
    }),
    rh({
      id: "svt", group: "atrial",
      name: "Supraventricular tachycardia (SVT)", short: "SVT",
      criteria: { rate: [140, 280], reg: ["regular"], atrial: ["none"], pr: ["none"], qrs: ["narrow"] },
      gen: { kind: "svt", rate: [155, 220], qrs: [0.06, 0.09], jitter: 0.004 },
      teach: { rate: "Typically 140 to 280/min (AVNRT)", regularity: "Regular", p: "Usually hidden in the QRS; if seen, inverted and right after the QRS", pr: "None to measure", qrs: "Narrow (unless bundle branch block or aberrancy)" },
      lookalikes: ["tach", "flutter", "jtach", "vt"],
      tellApart: "Very fast, regular, narrow, and no P waves you can find. Sinus tach has an upright P before each QRS; flutter has sawtooth waves; VT is wide.",
      note: "SVT is an umbrella term; in this app it means the common regular re-entry type (AVNRT) with P waves hidden.",
      sources: ["S17"]
    }),

    // ---------------- Junctional ----------------
    rh({
      id: "junc", group: "junctional",
      name: "Junctional (escape) rhythm", short: "Junctional",
      criteria: { rate: [40, 60], reg: ["regular"], atrial: ["retro", "none"], pr: ["short", "none"], qrs: ["narrow"] },
      gen: { kind: "junc", rate: [44, 56], qrs: [0.07, 0.10], jitter: 0.01, pModes: ["before", "after", "hidden"],
        edge: { rate: [[41, 44], [56, 59]], qrs: NARROW_EDGE } },
      teach: { rate: "40 to 60/min", regularity: "Regular", p: "None, or inverted in lead II just before or just after the QRS", pr: "Under 0.12 s if a P comes first", qrs: "Narrow, under 0.12 s" },
      lookalikes: ["brady", "ajr", "idio", "third"],
      tellApart: "Slow and narrow like sinus brady, but the P waves are missing or upside down. A wide QRS at 20 to 40 is ventricular escape.",
      note: "Naming by rate: under 40 junctional brady, 40 to 60 junctional escape, 60 to 100 accelerated junctional, over 100 junctional tach.",
      sources: ["S18", "S19"]
    }),
    rh({
      id: "ajr", group: "junctional",
      name: "Accelerated junctional rhythm", short: "Accel. junctional",
      criteria: { rate: [61, 100], reg: ["regular"], atrial: ["retro", "none"], pr: ["short", "none"], qrs: ["narrow"] },
      gen: { kind: "junc", rate: [66, 94], qrs: [0.07, 0.10], jitter: 0.01, pModes: ["before", "after", "hidden"],
        edge: { rate: [[62, 66], [95, 99]], qrs: NARROW_EDGE } },
      teach: { rate: "60 to 100/min", regularity: "Regular", p: "None, or inverted just before, during or after the QRS", pr: "Under 0.12 s if a P comes first", qrs: "Narrow, under 0.12 s" },
      lookalikes: ["junc", "nsr", "jtach"],
      tellApart: "Normal-looking rate, but the P waves are inverted or missing. Upright P waves with a normal PR make it sinus.",
      sources: ["S19"]
    }),
    rh({
      id: "jtach", group: "junctional",
      name: "Junctional tachycardia", short: "Junctional tach",
      criteria: { rate: [101, 400], reg: ["regular"], atrial: ["retro"], pr: ["short", "none"], qrs: ["narrow"] },
      gen: { kind: "junc", rate: [106, 140], qrs: [0.07, 0.10], jitter: 0.008, pModes: ["before", "after"],
        edge: { rate: [[103, 109]] } },
      teach: { rate: "Over 100/min", regularity: "Regular", p: "Inverted in lead II, before or after the QRS", pr: "Under 0.12 s if the P comes first", qrs: "Narrow" },
      lookalikes: ["svt", "tach", "ajr"],
      tellApart: "Fast and narrow with inverted P waves close to the QRS. Upright P waves with a normal PR are sinus tach.",
      note: "Fast junctional rhythms and re-entry SVT can look alike. Here junctional tach always shows its inverted P waves and SVT shows none.",
      sources: ["S19", "S18"]
    }),

    // ---------------- Ventricular ----------------
    rh({
      id: "pvc_uni", group: "ventricular",
      name: "Sinus rhythm with unifocal PVCs", short: "Unifocal PVCs",
      criteria: { rate: null, reg: ["early"], atrial: ["sinus"], pr: ["normal"], qrs: ["narrow"], ectopy: ["pvc-uni"] },
      gen: { kind: "pvc", pattern: "uni", rate: [62, 90], pr: [0.13, 0.19], qrs: [0.07, 0.10], jitter: 0.01 },
      teach: { rate: "Underlying rate, usually normal", regularity: "Regular with early beats, usually followed by a full compensatory pause", p: "Sinus P before the normal beats; no P before the PVC", pr: "Normal in the sinus beats", qrs: "Sinus beats narrow; PVCs wide (0.12 s or more), bizarre, T wave opposite the QRS, all PVCs the same shape" },
      lookalikes: ["pvc_multi", "pac", "bigeminy", "couplet"],
      tellApart: "Wide early beat with no P wave in front and a T wave pointing the other way. All the PVCs look alike: unifocal.",
      sources: ["S21"]
    }),
    rh({
      id: "pvc_multi", group: "ventricular",
      name: "Sinus rhythm with multifocal PVCs", short: "Multifocal PVCs",
      criteria: { rate: null, reg: ["early"], atrial: ["sinus"], pr: ["normal"], qrs: ["narrow"], ectopy: ["pvc-multi"] },
      gen: { kind: "pvc", pattern: "multi", rate: [62, 90], pr: [0.13, 0.19], qrs: [0.07, 0.10], jitter: 0.01 },
      teach: { rate: "Underlying rate, usually normal", regularity: "Regular with early beats", p: "Sinus P before the normal beats only", pr: "Normal in the sinus beats", qrs: "PVCs wide with two or more different shapes" },
      lookalikes: ["pvc_uni", "couplet", "afib", "torsades"],
      tellApart: "Compare the PVCs with each other. Different shapes mean more than one focus: multifocal.",
      sources: ["S21"]
    }),
    rh({
      id: "bigeminy", group: "ventricular",
      name: "Ventricular bigeminy", short: "Bigeminy",
      criteria: { rate: null, reg: ["early"], atrial: ["sinus"], pr: ["normal"], qrs: ["narrow"], ectopy: ["bigeminy"] },
      gen: { kind: "pvc", pattern: "bigeminy", rate: [62, 86], pr: [0.13, 0.19], qrs: [0.07, 0.10], jitter: 0.01 },
      teach: { rate: "Count all complexes", regularity: "Pairs: sinus beat, early PVC, pause, repeat", p: "Before every sinus beat", pr: "Normal in the sinus beats", qrs: "Every other beat is a wide PVC" },
      lookalikes: ["pvc_uni", "couplet", "pac"],
      tellApart: "Every other beat is a PVC. Two PVCs back to back is a couplet, not bigeminy.",
      sources: ["S21"]
    }),
    rh({
      id: "couplet", group: "ventricular",
      name: "Sinus rhythm with a PVC couplet", short: "PVC couplet",
      criteria: { rate: null, reg: ["early"], atrial: ["sinus"], pr: ["normal"], qrs: ["narrow"], ectopy: ["couplet"] },
      gen: { kind: "pvc", pattern: "couplet", rate: [62, 86], pr: [0.13, 0.19], qrs: [0.07, 0.10], jitter: 0.01 },
      teach: { rate: "Underlying rate, usually normal", regularity: "Regular, interrupted by two early wide beats in a row", p: "None before the PVCs", pr: "Normal in the sinus beats", qrs: "Two consecutive wide PVCs" },
      lookalikes: ["bigeminy", "pvc_uni", "vt", "pvc_multi"],
      tellApart: "Two PVCs in a row is a couplet. Three to 30 in a row is a run of non-sustained VT (NSVT).",
      sources: ["S21"]
    }),
    rh({
      id: "idio", group: "ventricular",
      name: "Idioventricular (ventricular escape) rhythm", short: "Idioventricular",
      criteria: { rate: [0, 49], reg: ["regular"], atrial: ["none"], pr: ["none"], qrs: ["wide"], shape: ["mono"] },
      gen: { kind: "vent", rate: [30, 39], qrs: [0.14, 0.18], jitter: 0.01 },
      teach: { rate: "20 to 40/min", regularity: "Regular", p: "None", pr: "None to measure", qrs: "Wide (0.12 s or more)" },
      lookalikes: ["aivr", "junc", "third", "asystole"],
      tellApart: "Slow and wide with no P waves. Narrow at 40 to 60 is junctional; wide at 50 to 100 is AIVR.",
      sources: ["S25", "S24"]
    }),
    rh({
      id: "aivr", group: "ventricular",
      name: "Accelerated idioventricular rhythm (AIVR)", short: "AIVR",
      criteria: { rate: [50, 100], reg: ["regular"], atrial: ["none"], pr: ["none"], qrs: ["wide"], shape: ["mono"] },
      gen: { kind: "vent", rate: [56, 94], qrs: [0.14, 0.18], jitter: 0.01,
        edge: { rate: [[51, 56], [94, 99]] } },
      teach: { rate: "About 50 to 100/min (LITFL: typically 50 to 120; under 50 is escape, over 110 is VT)", regularity: "Regular", p: "None (or unrelated)", pr: "None to measure", qrs: "Wide (over 0.12 s)" },
      lookalikes: ["idio", "vt", "ajr"],
      tellApart: "Looks like slow VT. The rate decides: under 50 idioventricular, over 100 VT. Classic after reperfusion of a heart attack.",
      note: "Rate cutoffs differ between references (LITFL AIVR page: 50 to 120, VT over 110; StatPearls VT: over 100). The app uses 50 to 100 for AIVR and avoids generating 100 to 110.",
      sources: ["S24", "S7"]
    }),
    rh({
      id: "vt", group: "ventricular", core: true, lethal: true,
      name: "Ventricular tachycardia (monomorphic)", short: "VT",
      criteria: { rate: [101, 400], reg: ["regular"], atrial: ["none"], pr: ["none"], qrs: ["wide"], shape: ["mono"] },
      gen: { kind: "vent", rate: [140, 210], qrs: [0.14, 0.18], jitter: 0.01,
        edge: { qrs: [[0.125, 0.135]] } },
      teach: { rate: "Over 100/min (3 or more beats in a row)", regularity: "Usually regular", p: "Not seen, or not related to the QRS", pr: "None to measure", qrs: "Wide, 0.12 s or more, all the same shape" },
      lookalikes: ["aivr", "svt", "torsades", "vf"],
      tellApart: "Wide and fast with every complex the same shape. If the shapes twist and change, think torsades. A lethal rhythm on exams: never miss it. Check the patient first in real life.",
      sources: ["S7", "S8", "S28"]
    }),
    rh({
      id: "torsades", group: "ventricular", lethal: true,
      name: "Torsades de pointes", short: "Torsades",
      criteria: { rate: null, reg: ["irregular", "regular"], atrial: ["none"], pr: ["none"], qrs: ["wide"], shape: ["twist"] },
      gen: { kind: "torsades", rate: [190, 250], qrs: [0.12, 0.16] },
      teach: { rate: "Fast (polymorphic VT)", regularity: "Roughly regular to irregular", p: "None", pr: "None to measure", qrs: "Wide, constantly changing; complexes grow and shrink and twist around the baseline" },
      lookalikes: ["vt", "vf", "pvc_multi"],
      tellApart: "Polymorphic VT with a twisting, spindle look. Monomorphic VT keeps one shape; VF has no real QRS at all.",
      note: "Diagnosing torsades needs polymorphic VT plus a prolonged QT (usually seen on the beats before the run).",
      sources: ["S23"]
    }),
    rh({
      id: "vf", group: "ventricular", lethal: true,
      name: "Ventricular fibrillation", short: "VF",
      criteria: { rate: null, reg: ["none"], atrial: ["none"], pr: ["none"], qrs: ["none"], shape: ["chaotic"] },
      gen: { kind: "vf" },
      teach: { rate: "No rate to count (chaotic activity about 150 to 500/min)", regularity: "Chaotic", p: "None", pr: "None", qrs: "No identifiable QRS or T waves. Coarse or fine (amplitude falls over time)" },
      lookalikes: ["asystole", "torsades", "vt"],
      tellApart: "Irregular deflections of varying height with no QRS. Fine VF can look almost flat; it is still VF, not asystole.",
      sources: ["S22", "S29"]
    }),
    rh({
      id: "asystole", group: "ventricular", lethal: true,
      name: "Asystole", short: "Asystole",
      criteria: { rate: null, reg: ["none"], atrial: ["none"], pr: ["none"], qrs: ["none"], shape: ["flat"] },
      gen: { kind: "asystole" },
      teach: { rate: "None", regularity: "None", p: "None", pr: "None", qrs: "None. Flat (isoelectric) line, only slight drift" },
      lookalikes: ["vf", "idio"],
      tellApart: "A flat line with no P, QRS or T waves. Fine VF still wiggles: tell the two apart before calling asystole.",
      sources: ["S29", "S22"]
    }),

    // ---------------- AV blocks ----------------
    rh({
      id: "first", group: "blocks",
      name: "1st degree AV block", short: "1st degree",
      criteria: { rate: null, reg: ["regular"], atrial: ["sinus"], pr: ["long"], qrs: ["narrow"] },
      gen: { kind: "sinus", rate: [58, 92], pr: [0.24, 0.32], qrs: [0.07, 0.10], jitter: 0.012,
        edge: { pr: [[0.207, 0.225]] } },
      teach: { rate: "Underlying sinus rate", regularity: "Regular", p: "One before every QRS", pr: "Over 0.20 s (more than 5 small boxes), the same every beat", qrs: "Narrow" },
      lookalikes: ["nsr", "wenck", "brady"],
      tellApart: "Like sinus rhythm, but the PR is long and stays long. Nothing drops. If the PR keeps growing until a beat drops, it's Wenckebach.",
      sources: ["S11", "S1"]
    }),
    rh({
      id: "wenck", group: "blocks",
      name: "2nd degree AV block type I (Wenckebach)", short: "Type I",
      criteria: { rate: null, reg: ["dropped"], atrial: ["more"], pr: ["lengthens"], qrs: ["narrow"] },
      gen: { kind: "wenck", atrialRate: [66, 96], pr0: [0.16, 0.21], qrs: [0.07, 0.10], groups: [3, 5] },
      teach: { rate: "Atrial rate normal; ventricular rate a little slower", regularity: "Grouped beating: R-R shortens through the group, then a pause", p: "Regular P waves; one P at the end of each group has no QRS", pr: "Gets longer each beat until a P is not conducted; shortest right after the drop", qrs: "Usually narrow" },
      lookalikes: ["mobitz2", "first", "sarr", "pac"],
      tellApart: "Compare the PR just before and just after the dropped beat. Longer before, shorter after: type I. Same PR every time: type II.",
      note: "With 2:1 conduction you can't tell type I from type II on one strip, so this app doesn't ask you to.",
      sources: ["S12", "S14"]
    }),
    rh({
      id: "mobitz2", group: "blocks",
      name: "2nd degree AV block type II (Mobitz II)", short: "Type II",
      criteria: { rate: null, reg: ["dropped"], atrial: ["more"], pr: ["normal", "long"], qrs: ["narrow", "wide"] },
      gen: { kind: "mobitz2", atrialRate: [66, 96], pr: [0.14, 0.20], qrs: [0.07, 0.10], qrsWide: [0.13, 0.16], wideChance: 0.75, runs: [2, 4] },
      teach: { rate: "Atrial rate normal; ventricular rate slower", regularity: "Irregular from dropped beats; the pause is exactly two P-P intervals", p: "Regular P waves that march through; some have no QRS", pr: "Constant in every conducted beat", qrs: "Often wide (about 75%), can be narrow" },
      lookalikes: ["wenck", "third", "pause"],
      tellApart: "P waves march on time, the PR never changes, then a QRS is suddenly missing. Higher risk than type I: it can progress to complete heart block.",
      sources: ["S13", "S14"]
    }),
    rh({
      id: "third", group: "blocks",
      name: "3rd degree (complete) AV block", short: "3rd degree",
      criteria: { rate: [0, 60], reg: ["regular"], atrial: ["more"], pr: ["variable"], qrs: ["narrow", "wide"] },
      gen: { kind: "third", atrialRate: [68, 100], junc: [40, 52], vent: [30, 39], qrs: [0.07, 0.10], qrsWide: [0.14, 0.18] },
      teach: { rate: "Slow escape rate: junctional 40 to 60 (narrow) or ventricular 20 to 40 (wide)", regularity: "Regular P-P and regular R-R, at different rates", p: "More P waves than QRS, marching through at their own rate", pr: "No relationship: the PR changes every beat (AV dissociation)", qrs: "Narrow with a junctional escape, wide with a ventricular escape" },
      lookalikes: ["mobitz2", "wenck", "junc", "idio"],
      tellApart: "Map out the P waves: they're regular, the QRS complexes are regular, and the two ignore each other. In type II the PR before each QRS is constant.",
      sources: ["S15"]
    })
  ];

  const byId = {};
  rhythms.forEach(function (r) { byId[r.id] = r; });

  const L = "LITFL ECG Library: ";
  const sources = {
    S1: { label: "StatPearls: Electrocardiogram (NCBI Bookshelf)", url: "https://www.ncbi.nlm.nih.gov/books/NBK549803/" },
    S2: { label: L + "Normal Sinus Rhythm", url: "https://litfl.com/normal-sinus-rhythm-ecg-library/" },
    S3: { label: L + "Sinus Bradycardia", url: "https://litfl.com/sinus-bradycardia-ecg-library/" },
    S4: { label: L + "Sinus Tachycardia", url: "https://litfl.com/sinus-tachycardia-ecg-library/" },
    S5: { label: "2023 ACC/AHA/ACCP/HRS Atrial Fibrillation Guideline (ACC summary)", url: "https://www.acc.org/latest-in-cardiology/ten-points-to-remember/2023/11/27/19/46/2023-acc-guideline-for-af-gl-af" },
    S6: { label: L + "Atrial Fibrillation", url: "https://litfl.com/atrial-fibrillation-ecg-library/" },
    S7: { label: "StatPearls: Ventricular Tachycardia (NCBI Bookshelf)", url: "https://www.ncbi.nlm.nih.gov/books/NBK532954/" },
    S8: { label: "Diagnosis and management of ventricular tachycardia (PMC review)", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10541285/" },
    S9: { label: "2018 ACC/AHA/HRS Bradycardia Guideline (PubMed)", url: "https://pubmed.ncbi.nlm.nih.gov/30412709/" },
    S10: { label: "McSharry et al. 2003, synthetic ECG model (PhysioNet ECGSYN)", url: "https://physionet.org/content/ecgsyn/1.0.0/" },
    S11: { label: L + "First Degree Heart Block", url: "https://litfl.com/first-degree-heart-block-ecg-library/" },
    S12: { label: L + "AV Block 2nd degree, Mobitz I (Wenckebach)", url: "https://litfl.com/av-block-2nd-degree-mobitz-i-wenckebach-phenomenon/" },
    S13: { label: L + "AV Block 2nd degree, Mobitz II (Hay block)", url: "https://litfl.com/av-block-2nd-degree-mobitz-ii-hay-block/" },
    S14: { label: L + "AV Block 2nd degree, fixed ratio blocks", url: "https://litfl.com/av-block-2nd-degree-fixed-ratio-blocks/" },
    S15: { label: L + "AV Block 3rd degree (complete heart block)", url: "https://litfl.com/av-block-3rd-degree-complete-heart-block/" },
    S16: { label: L + "Atrial Flutter", url: "https://litfl.com/atrial-flutter-ecg-library/" },
    S17: { label: L + "Supraventricular Tachycardia (SVT)", url: "https://litfl.com/supraventricular-tachycardia-svt-ecg-library/" },
    S18: { label: L + "Junctional Escape Rhythm", url: "https://litfl.com/junctional-escape-rhythm-ecg-library/" },
    S19: { label: L + "Accelerated Junctional Rhythm", url: "https://litfl.com/accelerated-junctional-rhythm-ajr/" },
    S20: { label: L + "Premature Atrial Complex (PAC)", url: "https://litfl.com/premature-atrial-complex-pac/" },
    S21: { label: L + "Premature Ventricular Complex (PVC)", url: "https://litfl.com/premature-ventricular-complex-pvc-ecg-library/" },
    S22: { label: L + "Ventricular Fibrillation (VF)", url: "https://litfl.com/ventricular-fibrillation-vf-ecg-library/" },
    S23: { label: L + "Polymorphic VT and Torsades de Pointes", url: "https://litfl.com/polymorphic-vt-and-torsades-de-pointes-tdp/" },
    S24: { label: L + "Accelerated Idioventricular Rhythm (AIVR)", url: "https://litfl.com/accelerated-idioventricular-rhythm-aivr/" },
    S25: { label: L + "Ventricular Escape Rhythm", url: "https://litfl.com/ventricular-escape-rhythm-ecg-library/" },
    S26: { label: L + "Sinus Arrhythmia", url: "https://litfl.com/sinus-arrhythmia-ecg-library/" },
    S27: { label: L + "Sinoatrial Exit Block (sinus pause and arrest)", url: "https://litfl.com/sinoatrial-exit-block-ecg-library/" },
    S28: { label: L + "Ventricular Tachycardia, monomorphic", url: "https://litfl.com/ventricular-tachycardia-monomorphic-ecg-library/" },
    S29: { label: "StatPearls: Asystole (NCBI Bookshelf)", url: "https://www.ncbi.nlm.nih.gov/books/NBK430866/" },
    // Evidence behind the app's design (the "How this was built" screen), not rhythm criteria.
    S30: { label: "AHA 2017 scientific statement: Practice Standards for ECG Monitoring in Hospital Settings (PubMed)", url: "https://pubmed.ncbi.nlm.nih.gov/28974521/" },
    S31: { label: "PULSE trial 2017: ECG monitoring education, nurses' knowledge and patient outcomes (PubMed)", url: "https://pubmed.ncbi.nlm.nih.gov/28174175/" },
    S32: { label: "Cepeda et al. 2006: distributed practice meta-analysis (PubMed)", url: "https://pubmed.ncbi.nlm.nih.gov/16719566/" },
    S33: { label: "Roediger and Karpicke 2006: test-enhanced learning (PubMed)", url: "https://pubmed.ncbi.nlm.nih.gov/16507066/" }
  };

  const approach = [
    ["Rate", "Regular: 1500 ÷ small boxes between two R waves. Irregular: count QRS in 6 seconds × 10."],
    ["Regularity", "Are the R-R intervals the same? Early beats, pauses, groups, or no pattern at all?"],
    ["P waves", "One upright P before every QRS, all the same? Extra P waves, none, sawtooth or wavy?"],
    ["PR interval", "0.12 to 0.20 s (3 to 5 small boxes)? Constant, getting longer, or unrelated?"],
    ["QRS", "Narrow is under 0.12 s (under 3 small boxes). Wide is 0.12 s or more. All the same shape?"]
  ];

  const sets = [
    { id: "all", name: "All 26 rhythms", ids: rhythms.map(function (r) { return r.id; }) },
    { id: "core", name: "Core 5 (start here)", ids: rhythms.filter(function (r) { return r.core; }).map(function (r) { return r.id; }) }
  ].concat(groups.map(function (g) {
    return { id: g.id, name: g.name, ids: rhythms.filter(function (r) { return r.group === g.id; }).map(function (r) { return r.id; }) };
  })).concat([{ id: "lethal", name: "Lethal only", ids: rhythms.filter(function (r) { return r.lethal; }).map(function (r) { return r.id; }) }]);

  const api = { list: rhythms, byId: byId, sources: sources, approach: approach, groups: groups, sets: sets };
  root.EKG = root.EKG || {};
  root.EKG.rhythms = api;
})(typeof window !== "undefined" ? window : globalThis);
