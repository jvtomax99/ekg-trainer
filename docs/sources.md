# Clinical sources

Every rhythm criterion in the app cites one of these ids (see `js/rhythms.js`). Add a
source here before using it. Verified 2026-11-19 through search results quoting each page;
direct page fetches were blocked by the build environment's network, so re-read the pages
themselves when the nurse reviews.

| Id | Source | Verified for |
|---|---|---|
| S1 | StatPearls: Electrocardiogram, https://www.ncbi.nlm.nih.gov/books/NBK549803/ | PR 120 to 200 ms (3 to 5 small squares); QRS under 120 ms (under 3 small squares), typically 60 to 100 ms |
| S2 | LITFL: Normal Sinus Rhythm, https://litfl.com/normal-sinus-rhythm-ecg-library/ | 60 to 100 bpm, regular, narrow; P before every QRS, upright in I and II; constant PR |
| S3 | LITFL: Sinus Bradycardia, https://litfl.com/sinus-bradycardia-ecg-library/ | Sinus rhythm under 60 bpm in adults |
| S4 | LITFL: Sinus Tachycardia, https://litfl.com/sinus-tachycardia-ecg-library/ | Sinus rhythm over 100 bpm in adults; at fast rates P may hide in the preceding T |
| S5 | 2023 ACC/AHA/ACCP/HRS AF guideline (ACC summary), https://www.acc.org/latest-in-cardiology/ten-points-to-remember/2023/11/27/19/46/2023-acc-guideline-for-af-gl-af | ECG: irregular R-R (when AV conduction present), no distinct P waves, irregular atrial activity (fibrillatory waves) |
| S6 | LITFL: Atrial Fibrillation, https://litfl.com/atrial-fibrillation-ecg-library/ | Irregularly irregular, no P waves, fine (<0.5 mm) or coarse (>0.5 mm) f-waves; no pattern in R-R |
| S7 | StatPearls: Ventricular Tachycardia, https://www.ncbi.nlm.nih.gov/books/NBK532954/ | Wide complex tachycardia, 3 or more consecutive beats over 100/min |
| S8 | Diagnosis and management of VT (PMC review), https://pmc.ncbi.nlm.nih.gov/articles/PMC10541285/ | QRS over 120 ms, at least 3 beats over 100 bpm, usually regular |
| S9 | 2018 ACC/AHA/HRS Bradycardia Guideline, https://pubmed.ncbi.nlm.nih.gov/30412709/ | Uses sinus bradycardia under 50 bpm (seen in secondary summaries; confirm in the guideline's definitions) |
| S10 | McSharry et al. 2003, IEEE TBME 50(3):289-294; ECGSYN, https://physionet.org/content/ecgsyn/1.0.0/ | Sum-of-Gaussians P-QRS-T morphology approach used by the generator |

| S11 | LITFL: First Degree Heart Block, https://litfl.com/first-degree-heart-block-ecg-library/ | PR > 200 ms (five small squares), delay without interruption |
| S12 | LITFL: AV block 2nd degree Mobitz I, https://litfl.com/av-block-2nd-degree-mobitz-i-wenckebach-phenomenon/ | Progressive PR prolongation to a non-conducted P; PR longest before and shortest after the drop; P-P relatively constant; R-R shortens through the cycle; ratios 3:2, 4:3, 5:4 |
| S13 | LITFL: AV block 2nd degree Mobitz II, https://litfl.com/av-block-2nd-degree-mobitz-ii-hay-block/ | Intermittent non-conducted P without PR prolongation; constant PR; P waves march through; R-R around the drop an exact multiple; about 75% broad QRS, 25% narrow; higher risk of progression |
| S14 | LITFL: AV block fixed ratio blocks, https://litfl.com/av-block-2nd-degree-fixed-ratio-blocks/ | 2:1 / 3:1 can be Mobitz I or II; not always possible to tell |
| S15 | LITFL: AV block 3rd degree, https://litfl.com/av-block-3rd-degree-complete-heart-block/ | Complete AV dissociation, independent atrial and ventricular rates; junctional or ventricular escape |
| S16 | LITFL: Atrial Flutter, https://litfl.com/atrial-flutter-ecg-library/ | Atrial ~300 (200 to 400); inverted sawtooth in II, III, aVF (90% anticlockwise); 2:1 = 150, 3:1 = 100, 4:1 = 75; variable ratio irregular and may mimic AF |
| S17 | LITFL: SVT, https://litfl.com/supraventricular-tachycardia-svt-ecg-library/ | Umbrella term, often used for AVNRT; narrow unless aberrancy; AVNRT 140 to 280 bpm, regular; P waves often hidden, else inverted after the QRS |
| S18 | LITFL: Junctional Escape Rhythm, https://litfl.com/junctional-escape-rhythm-ecg-library/ | 40 to 60 bpm, narrow; naming: <40 junctional brady, 40 to 60 escape, 60 to 100 accelerated, >100 tach; ventricles 20 to 40 |
| S19 | LITFL: Accelerated Junctional Rhythm, https://litfl.com/accelerated-junctional-rhythm-ajr/ | 60 to 100 bpm, narrow; retrograde P inverted in II, before, during or after the QRS; PR < 120 ms = junctional |
| S20 | LITFL: PAC, https://litfl.com/premature-atrial-complex-pac/ | Abnormal P, usually normal QRS; post-ectopic pause not double the R-R; low atrial P inverted with PR >= 120 ms |
| S21 | LITFL: PVC, https://litfl.com/premature-ventricular-complex-pvc-ecg-library/ | Broad QRS >= 120 ms, premature, discordant ST/T, usually full compensatory pause; unifocal/multifocal; bigeminy, couplet, NSVT 3 to 30 |
| S22 | LITFL: Ventricular Fibrillation, https://litfl.com/ventricular-fibrillation-vf-ecg-library/ | Chaotic deflections of varying amplitude, no P/QRS/T, 150 to 500/min, coarse to fine with time, then asystole |
| S23 | LITFL: Polymorphic VT and TdP, https://litfl.com/polymorphic-vt-and-torsades-de-pointes-tdp/ | TdP = polymorphic VT with QT prolongation, QRS twisting around the baseline |
| S24 | LITFL: AIVR, https://litfl.com/accelerated-idioventricular-rhythm-aivr/ | Regular, wide, rate typically 50 to 120; <50 = ventricular escape, >110 = VT; reperfusion |
| S25 | LITFL: Ventricular Escape Rhythm, https://litfl.com/ventricular-escape-rhythm-ecg-library/ | 20 to 40 bpm, QRS >= 120 ms |
| S26 | LITFL: Sinus Arrhythmia, https://litfl.com/sinus-arrhythmia-ecg-library/ | P-P varies > 120 ms, cyclical with breathing; constant P morphology and PR |
| S27 | LITFL: Sinoatrial Exit Block, https://litfl.com/sinoatrial-exit-block-ecg-library/ | Sinus pause/arrest = failure of impulse generation; SA exit block type II = pause an exact multiple of P-P |
| S28 | LITFL: Monomorphic VT, https://litfl.com/ventricular-tachycardia-monomorphic-ecg-library/ | Regular broad complex tachycardia, uniform QRS |
| S29 | StatPearls: Asystole, https://www.ncbi.nlm.nih.gov/books/NBK430866/ | No waveform, only an isoelectric line, no P, QRS or T; distinguish from fine VF; non-shockable. **Read from a search-result excerpt only**: the page itself showed a reCAPTCHA to this environment |

S11 to S28 were fetched and read directly from litfl.com on 2026-11-19. NCBI Bookshelf,
PMC and AHA Journals returned bot checks to the build environment that day.

## Evidence behind the app's design (Evidence screen, not rhythm criteria)
Read 2026-11-19 from the PubMed abstracts, fetched through NCBI E-utilities (the PubMed
web pages show a cookie check to this environment). **Abstracts only**: re-read the full
text before quoting anything past what is listed here.

| Id | Source | Verified for |
|---|---|---|
| S30 | Sandau KE, Funk M, et al. Update to Practice Standards for Electrocardiographic Monitoring in Hospital Settings: A Scientific Statement From the American Heart Association. Circulation 2017;136(19):e273-e344. doi:10.1161/CIR.0000000000000527, https://pubmed.ncbi.nlm.nih.gov/28974521/ | AHA-commissioned, interprofessional review of continuous ECG monitoring of hospitalized patients; 5 sections, one of them "Organizational Aspects: Alarm Management, Education of Staff, and Documentation"; the authors say many recommendations rest on limited data. AACN endorsement seen in secondary sources only |
| S31 | Funk M, et al. PULSE Trial. Circ Cardiovasc Qual Outcomes 2017;10(2):e003132. doi:10.1161/CIRCOUTCOMES.116.003132, https://pubmed.ncbi.nlm.nih.gov/28174175/ | Randomized trial with crossover, 65 cardiac units in 17 hospitals, 3,013 nurses tested with a validated 20-item online test; online ECG monitoring education plus practice-change strategies. Nurses' knowledge rose right after the intervention but **was not sustained 15 months later**; accurate rhythm interpretation (observed quality of care) improved and was sustained |
| S32 | Cepeda NJ, et al. Distributed practice in verbal recall tasks: a review and quantitative synthesis. Psychol Bull 2006;132(3):354-380. https://pubmed.ncbi.nlm.nih.gov/16719566/ | Meta-analysis, 839 assessments in 317 experiments; spaced study sessions and their timing affect retention, and the best gap grows with how long it must be remembered. Verbal recall, not ECG |
| S33 | Roediger HL, Karpicke JD. Test-enhanced learning. Psychol Sci 2006;17(3):249-255. https://pubmed.ncbi.nlm.nih.gov/16507066/ | Recall testing gave substantially better retention at 2 days and 1 week than restudying, while restudying raised confidence more. Prose passages, not ECG |

Use: S30 frames why staff ECG education matters, S31 is the reason missed rhythms come
back over months, S32 and S33 are the design reasons for spaced, recall-based sessions.
None of them tested this app or ECG strip reading with spacing; never say they did.

## Generator choices that are not shown to the user as facts
- AFib f-wave frequency 6 to 9 Hz (360 to 540/min): inside the commonly taught 350 to
  600/min, not verified against a primary source this session.
- QT scaled with rate using the Bazett form, QTc 0.38 to 0.43 s.
- Normal strips keep a margin from cutoffs; borderline ("edge") strips sit just inside one,
  and the generator re-draws until the exact rate, the 1500 rule and the rounded numbers
  on screen all agree with the category.
- Phase 2 choices: flutter waves 260 to 320/min; SVT 155 to 220; torsades 190 to 250 with a
  3.6 to 5 s twist cycle; VF components 4 to 7 Hz; "fine" vs "coarse" VF and the asystole
  amplitude are drawing choices, no numeric cutoff is shown to the user; Wenckebach PR
  starts 0.16 to 0.21 s and grows by shrinking steps; PVC coupling 0.56 to 0.68 of the R-R;
  PAC coupling 0.62 to 0.74 of the P-P; sinus pause 1.6 to 1.85 or 2.3 to 2.7 P-P (never an
  exact multiple, so it can't be SA exit block); AIVR generated 56 to 94 and never 100 to 110
  because references disagree there.

## Still to add
- AHA ACLS adult algorithms (phase 5 "what now").
- AACN Practice Alert "Accurate Dysrhythmia Monitoring in Adults" (published 2016-12-01,
  evidence update 2018-05-17), https://www.aacn.org/clinical-resources/practice-alerts/dysrhythmia-monitoring.
  Full text needs a free AACN login and the page timed out from this environment; only
  secondary summaries read so far. Not cited until someone reads it.
- Temporary epicardial pacing and post-op AFib reviews (phase 6).
