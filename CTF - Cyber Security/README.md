 GEMASTIK prep.

https://riskyprsty.me/blog/Writeup-CTF-Gemastik-2024

https://patarisac.github.io/gemastik16-crypto-writeup/

## GEMASTIK real writeups / soal

| Priority | Real writeup / repo                                             | Category                           | Why read it                                                                                                                                                                                       |
| -------: | --------------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|        1 | **GEMASTIK 2024 Web & Forensics — Baby XSS, Baby Structured**   | Web, Forensics                     | Very good beginner-realistic GEMASTIK writeup. Shows XSS admin bot flow, cookie exfiltration, simple HTTP listener, and PNG structure recovery. ([riskyprsty portofolio][1])                      |
|        2 | **GEMASTIK XVI 2023 Cryptography — easy AES, k-1, naughty-boy** | Crypto                             | Real GEMASTIK crypto. The page says the 2023 qualifier had three crypto challenges and shows full solution style, including `chall.py` analysis and solver code. ([Patarisac][2])                 |
|        3 | **GEMASTIK XV 2022 Cryptography — doublesteg, Relation**        | Crypto                             | Older but still valuable. Covers double AES-CBC meet-in-the-middle and RSA related-message attack style. ([Patarisac][3])                                                                         |
|        4 | **GEMASTIK 17/XVII QUAL CTF 2024 — nopedawn**                   | Mixed: crypto, forensics, rev, web | Good multi-category example. The author says they solved 5 challenges: 1 crypto, 2 forensics, 1 reverse engineering, and 1 web exploitation. ([nopedawn][4])                                      |
|        5 | **Gemastik 2024 Warm-up — Homebrew UPI HackMD**                 | Forensics/stego, misc, warm-up     | Good for beginner-friendly Indonesian-style writeup. Includes stego/LSB and QR manipulation examples. ([HackMD][5])                                                                               |
|        6 | **SandWithCheese CTF writeups repo**                            | Huge mixed archive                 | Very useful because it has folders for **Gemastik 2023**, **Gemastik 2024**, **Gemastik 2025 Final**, and **Gemastik 2025 Penyisihan/Forensics/iri**, plus tons of Indonesian CTFs. ([GitHub][6]) |
|        7 | **daffainfo/ctf-writeup**                                       | Huge mixed archive                 | Big Indonesian/English writeup repo. It says it contains **558 CTF writeups** and includes local/global competitions, including “Final Gemastik 2024” listed as available. ([GitHub][7])          |
|        8 | **GEMASTIK 2023 Final — burvesigner**                           | Attack-Defense / Crypto            | Extremely important for final prep. Shows real GEMASTIK final style: tick-based Attack-Defense, service exploitation, automation, and defense thinking. ([vicevirus’ Blog][8])                    |

## Other Indonesian / local CTF writeups worth reading

| Real writeup / repo                                                   | Why it matters                                                                                                                                                                                                        |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Siber Siaga I-Hack 2024 Semi-Final Attack Defense**                 | This is not GEMASTIK, but it is very relevant to GEMASTIK final. It discusses Attack-Defense priorities: find exploit, plant/clean backdoors, patch, monitor, and retrieve flags. ([vicevirus’ Blog][8])              |
| **Cyber Jawara 2024 writeups inside daffainfo repo**                  | Cyber Jawara is one of the stronger Indonesian CTF ecosystems; useful for harder local-style web/crypto/pwn/rev. The daffainfo repo lists Cyber Jawara CTF International 2024 among its writeup events. ([GitHub][7]) |
| **Compfest / HackToday / ARA / SlashRoot inside SandWithCheese repo** | This repo has folders for Compfest, Cyber Jawara, HackToday, ARA, SlashRoot, FindIT, NETCOMP, TechnoFair, and more. Good for Indonesian CTF “flavor.” ([GitHub][6])                                                   |
| **Backdoor CTF 2023 Writeups**                                        | Not Indonesian, but good beginner-to-intermediate structure. Repo contains Beginner, Forensics, Rev, and Web folders. ([GitHub][9])                                                                                   |

## International “good writeup style” examples

Read these to learn how stronger players explain solves.

| Real writeup / repo                                  | Category / use                                                                                                                                                                             |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **OfficialCyberSpace/CSCTF-2024**                    | Official source code and writeups. Has beginner, crypto, forensics, jail, misc, pwn, rev, sponsor, and web categories. Great because it includes source + writeup together. ([GitHub][10]) |
| **Google CTF repo**                                  | Official Google CTF archive. Good for real challenge source, especially web/crypto/pwn/rev. ([GitHub][11])                                                                                 |
| **Google CTF 2023 writeup — web/under-construction** | Good web example involving Flask/PHP app interaction and authorization logic. ([Andy Liu][12])                                                                                             |
| **CryptoCat 2024 CTF writeups**                      | Very readable web/pwn/rev/crypto/forensics writeups across many competitions like CSAW, CyberSpace, UIU, Wani, HTB Cyber Apocalypse. ([cryptocat.me][13])                                  |
| **UIUCTF 2024 PWN writeup**                          | Good pwn-heavy example. Covers challenges like Backup Power, pwnymalloc, Rusty Pointers, Syscalls, and Syscalls 2. ([Gist][14])                                                            |
| **DEF CON CTF 2024 writeup by NTT Security**         | Higher-level pwn/reversing style; useful once you are past beginner. ([jp.security.ntt][15])                                                                                               |
| **theori-io/ctf**                                    | Strong-team writeups. The repo lists Codegate, LINE CTF, Paradigm CTF, SSTF, and other top events. ([GitHub][16])                                                                          |
| **Balsn CTF writeups**                               | Strong Asian CTF team writeups; good for advanced web/crypto/pwn/rev taste. ([GitHub][16])                                                                                                 |

## Attack-Defense / final-style resources

For GEMASTIK final, this matters a lot.

| Resource                                    | What to learn                                                                                                                                               |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **GEMASTIK 2023 final burvesigner writeup** | Tick-based exploitation, why exploit must be scriptable, and how a crypto bug becomes an Attack-Defense service bug. ([vicevirus’ Blog][8])                 |
| **Siber Siaga I-Hack 2024 A&D writeup**     | Real Indonesian A&D mindset: exploit, patch, clean backdoors, monitor logs, get flags. ([vicevirus’ Blog][8])                                               |
| **ForcAD**                                  | Attack-Defense platform. README explains setup, teams/tasks config, flag receiver, checker config, and scoreboard. ([GitHub][17])                           |
| **CTF Cup 2023 AD repo**                    | Real A&D repo with `services`, `checkers`, `sploits`, scoreboard, and ForcAD config. ([GitHub][18])                                                         |
| **BRICS+ CTF 2023 Stage 2 AD repo**         | Another real A&D repo with service source, checkers, exploits, and writeups for services like `notify`, `restmenu`, `leakless`, and `notes`. ([GitHub][19]) |
| **ECSC 2024 CTF AD repo**                   | Real European Cyber Security Challenge A/D service repository; useful for seeing final-level service structure. ([GitHub][20])                              |

## Read order I recommend

Do it like this:

1. **Riskyprsty GEMASTIK 2024 Baby XSS + Baby Structured**
   Learn how a simple real GEMASTIK writeup is structured: description → analysis → exploit strategy → command/script → flag. ([riskyprsty portofolio][1])

2. **Patarisac GEMASTIK 2022 + 2023 crypto**
   Learn source-code-reading crypto style: `chall.py`, identify weakness, build solver. ([Patarisac][3])

3. **Nopedawn GEMASTIK 2024 mixed writeup**
   Learn multi-category triage from one actual qualifier. ([nopedawn][4])

4. **SandWithCheese GEMASTIK folders**
   Go through Gemastik 2023, 2024, 2025 Final, and 2025 Penyisihan/Forensics/iri. ([GitHub][6])

5. **Zakigeyan / A&D style writeups**
   Learn the final mode: automate exploit, patch service, monitor, write report. ([vicevirus’ Blog][8])

6. **CSCTF 2024 official repo + Google CTF repo**
   Move to international-quality source+writeup practice. ([GitHub][10])

## What a “good real writeup” looks like

When you read them, don’t just copy payload. Check whether the writeup has these parts:

```txt
Challenge name:
Category:
Difficulty / points:
Given files:
Initial observation:
Vulnerability / bug:
Exploit idea:
Step-by-step solve:
Solver script / command:
Flag:
Mitigation / patch:
What I learned:
```

The GEMASTIK 2024 Baby XSS writeup is a good example because it has challenge description, initial analysis, payload testing, target/admin-bot discovery, exploit strategy, HTTP server setup, payload delivery, and flag capture. ([riskyprsty portofolio][1])

[1]: https://riskyprsty.me/blog/Writeup-CTF-Gemastik-2024?utm_source=chatgpt.com "Writeup CTF Gemastik 2024 - Web & Forensics Writeup"
[2]: https://patarisac.github.io/gemastik16-crypto-writeup/?utm_source=chatgpt.com "CTF writeup : Gemastik XVI Cryptography Challenges - patarisac"
[3]: https://patarisac.github.io/gemastik15-crypto-writeup/?utm_source=chatgpt.com "CTF writeup : Gemastik XV Cryptography Challenges - patarisac"
[4]: https://nopedawn.github.io/posts/ctfs/2024/gemastik-17-xvii-qual-ctf-2024/?utm_source=chatgpt.com "GEMASTIK 17 XVII QUAL CTF 2024 | nopedawn"
[5]: https://hackmd.io/%40homebrew-upi/Gemastik24_WarmUp?utm_source=chatgpt.com "Gemastik'24 Warmup - HackMD"
[6]: https://github.com/SandWithCheese/ctf-writeups?utm_source=chatgpt.com "GitHub - SandWithCheese/ctf-writeups: CTF Writeups Repository"
[7]: https://github.com/daffainfo/ctf-writeup?utm_source=chatgpt.com "GitHub - daffainfo/ctf-writeup: CTF Writeups"
[8]: https://vicevirus.github.io/posts/ihack-2024-semi-final-writeup/?utm_source=chatgpt.com "Siber Siaga I-Hack 2024 Semi-Final Attack Defense CTF Write-up - vicevirus’ Blog"
[9]: https://github.com/Lyther/Backdoor-CTF-2023-Writeups?utm_source=chatgpt.com "GitHub - Lyther/Backdoor-CTF-2023-Writeups: This repository is a collection of my personal writeups for the challenges I tackled during the Backdoor CTF 2023. The event showcased a wide array of high-quality challenges that provided a great learning experience. I hope that these writeups will be useful for others who are interested in CTFs and cybersecurity."
[10]: https://github.com/OfficialCyberSpace/CSCTF-2024?utm_source=chatgpt.com "GitHub - OfficialCyberSpace/CSCTF-2024: Source code and writeups for CSCTF'24! · GitHub"
[11]: https://github.com/google/google-ctf?utm_source=chatgpt.com "GitHub - google/google-ctf: Google CTF · GitHub"
[12]: https://aliu.dev/2023/06/26/google-ctf-2023-writeup/?utm_source=chatgpt.com "Google CTF 2023 Writeup · Andy Liu"
[13]: https://cryptocat.me/blog/ctf/2024?utm_source=chatgpt.com "2024 CTF Writeups - CryptoCat's Blog"
[14]: https://gist.github.com/BeaCox/693563583377a778ba5b5fc98387b2d4?utm_source=chatgpt.com "uiuctf2024_pwn_wp.md · GitHub"
[15]: https://jp.security.ntt/tech_blog/defcon-ctf-2024-writeup?utm_source=chatgpt.com "DEFCON CTF 2024 Writeup | セキュリティナレッジ | NTTセキュリティ・ジャパン株式会社"
[16]: https://github.com/theori-io/ctf?utm_source=chatgpt.com "GitHub - theori-io/ctf: writeup from some ctfs"
[17]: https://github.com/pomo-mondreganto/ForcAD?utm_source=chatgpt.com "GitHub - pomo-mondreganto/ForcAD: Pure-python distributable Attack-Defence CTF platform, created to be easily set up."
[18]: https://github.com/C4T-BuT-S4D/ctfcup-2023-ad?utm_source=chatgpt.com "GitHub - C4T-BuT-S4D/ctfcup-2023-ad: Attack & Defence CTF by C4T BuT S4D"
[19]: https://github.com/C4T-BuT-S4D/bricsctf-2023-stage2?utm_source=chatgpt.com "GitHub - C4T-BuT-S4D/bricsctf-2023-stage2: BRICS CTF 2023, Stage 2, Attack Defence"
[20]: https://github.com/ECSC2024?utm_source=chatgpt.com "ECSC2024 · GitHub"
