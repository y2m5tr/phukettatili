#!/usr/bin/env python3
"""
Phuket Tatili - 1980/1990 Retro Karikatür / Çizgi Roman Tanıtım Videosu (Sıfır Fotoğraf - %100 Kod Çizimi)
1920x1080 Full HD @ 30 FPS, 36 Saniye Retro Çizgi Film Macerası
Akış: Havalimanı & Otel -> Bangla Road -> Phi Phi Adaları -> James Bond Kano -> Diğer Adalar (Coral/Similan) -> Fil Safari -> 80s Arcade Final
Pillow (Vektörel Karikatür Çizimi, Konuşma Balonları & Memphis Deseni) + Python Wave (80'ler Chiptune / Synthwave Ritim) + FFmpeg
"""

import os
import sys
import math
import wave
import struct
import random
import subprocess
from PIL import Image, ImageDraw, ImageFont

WIDTH = 1920
HEIGHT = 1080
FPS = 30
DURATION_SEC = 36
TOTAL_FRAMES = FPS * DURATION_SEC

ROOT_DIR = "/Users/ymg/Downloads/PhuketTatili2"
ASSETS_DIR = os.path.join(ROOT_DIR, "public/assets")
OUTPUT_VIDEO_PUBLIC = os.path.join(ASSETS_DIR, "phuket-retro-karikatur.mp4")
OUTPUT_VIDEO_ROOT = os.path.join(ROOT_DIR, "phuket-retro-karikatur.mp4")
OUTPUT_VIDEO_ALT = "/Users/ymg/PhuketTatili/phuket-retro-karikatur.mp4"
AUDIO_TEMP_PATH = "/tmp/phuket_retro_audio.wav"

FONT_BOLD_PATH = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
FONT_REG_PATH = "/System/Library/Fonts/Supplemental/Arial.ttf"

# Fonts
font_hero = ImageFont.truetype(FONT_BOLD_PATH, 64)
font_title = ImageFont.truetype(FONT_BOLD_PATH, 38)
font_burst = ImageFont.truetype(FONT_BOLD_PATH, 38)
font_bubble_speaker = ImageFont.truetype(FONT_BOLD_PATH, 22)
font_bubble_text = ImageFont.truetype(FONT_BOLD_PATH, 28)
font_bubble_sub = ImageFont.truetype(FONT_REG_PATH, 22)
font_step = ImageFont.truetype(FONT_BOLD_PATH, 16)
font_badge = ImageFont.truetype(FONT_BOLD_PATH, 20)
font_cta = ImageFont.truetype(FONT_BOLD_PATH, 44)

# 80s/90s Pop Art Palette
COLOR_INK = (20, 20, 35, 255)       # Kalın retro mürekkep çizgisi
COLOR_PAPER = (255, 246, 230, 255)  # Retro sarımtırak çizgi roman kağıdı
COLOR_RETRO_YELLOW = (255, 225, 0, 255)
COLOR_RETRO_CYAN = (0, 220, 255, 255)
COLOR_RETRO_PINK = (255, 50, 130, 255)
COLOR_RETRO_ORANGE = (255, 95, 30, 255)
COLOR_RETRO_GREEN = (40, 220, 110, 255)
COLOR_RETRO_PURPLE = (140, 60, 255, 255)
COLOR_WHITE = (255, 255, 255, 255)

# -------------------------------------------------------------
# 1. 1980-1990 RETRO SYNTHWAVE / CHIPTUNE SES MOTORU
# -------------------------------------------------------------
def generate_retro_soundtrack(output_path, duration_sec=DURATION_SEC, sample_rate=44100):
    print("🕹️ 1980-1990 retro çizgi film ve synthwave müziği sentezleniyor...")
    num_samples = int(duration_sec * sample_rate)
    left_channel = [0.0] * num_samples
    right_channel = [0.0] * num_samples

    def note_freq(midi_note):
        return 440.0 * (2.0 ** ((midi_note - 69) / 12.0))

    # 80'ler canlı retro funk/synth akorları (126 BPM)
    tempo = 126.0
    beat_dur = 60.0 / tempo
    total_beats = int(duration_sec / beat_dur)

    # Chords: Cmaj7 -> Am7 -> Dm7 -> G7 (Klasik neşeli 80s anime/cartoon akor dizilimi)
    chord_prog = [
        [60, 64, 67, 71], # Cmaj7
        [57, 60, 64, 67], # Am7
        [62, 65, 69, 72], # Dm7
        [55, 59, 62, 65], # G7
    ]

    for b in range(total_beats):
        t_start = b * beat_dur
        chord = chord_prog[(b // 4) % len(chord_prog)]

        # 80'ler Synth Arpej (Kare dalga + yumuşatılmış harmonikler)
        for sub in range(4):
            t_sub = t_start + sub * (beat_dur / 4.0)
            midi = chord[(b + sub * 2) % len(chord)] + 12
            freq = note_freq(midi)
            start_idx = int(t_sub * sample_rate)
            dur = int(0.28 * sample_rate)
            pan = -0.4 if sub % 2 == 0 else 0.4

            for i in range(dur):
                idx = start_idx + i
                if idx >= num_samples: break
                t = i / sample_rate
                # 80s Chiptune karemsi dalga
                env = math.exp(-9.0 * t)
                sig = math.sin(2 * math.pi * freq * t) + 0.4 * math.sin(6 * math.pi * freq * t)
                val = sig * env * 0.25
                left_channel[idx] += val * (1.0 - pan) * 0.5
                right_channel[idx] += val * (1.0 + pan) * 0.5

        # 80s Slap Synth Bass (Testere/üçgen dalga)
        bass_midi = chord[0] - 12
        bass_freq = note_freq(bass_midi)
        start_idx = int(t_start * sample_rate)
        dur = int(0.42 * sample_rate)
        for i in range(dur):
            idx = start_idx + i
            if idx >= num_samples: break
            t = i / sample_rate
            env = math.exp(-6.0 * t)
            val = (math.sin(2 * math.pi * bass_freq * t) + 0.5 * math.sin(4 * math.pi * bass_freq * t)) * env * 0.32
            left_channel[idx] += val * 0.5
            right_channel[idx] += val * 0.5

    # Karikatür Ses Efektleri (SFX)
    sfx_times = [
        (0.5, "plane_horn"),  # Havalimanı inişi
        (6.0, "neon_chime"),  # Bangla Road disko
        (11.2, "water_pop"),  # Phi Phi sürat teknesi
        (16.3, "cave_echo"),  # James Bond mağara
        (21.4, "island_ding"),# Coral Island dinlenme
        (26.5, "elephant_sfx"),# Fil su püskürtme
        (31.2, "arcade_win"), # 80'ler oyun bitiş zaferi
    ]

    for t_sfx, sfx_name in sfx_times:
        start_idx = int(t_sfx * sample_rate)
        if sfx_name == "plane_horn":
            for i in range(int(0.5 * sample_rate)):
                idx = start_idx + i
                if idx >= num_samples: break
                t = i / sample_rate
                val = (math.sin(2 * math.pi * 520 * t) + math.sin(2 * math.pi * 650 * t)) * 0.3 * math.exp(-3.0 * t)
                left_channel[idx] += val
                right_channel[idx] += val
        elif sfx_name == "neon_chime":
            for step, f in enumerate([784, 987, 1318, 1567]):
                s_idx = start_idx + int(step * 0.08 * sample_rate)
                for i in range(int(0.3 * sample_rate)):
                    idx = s_idx + i
                    if idx >= num_samples: break
                    t = i / sample_rate
                    val = math.sin(2 * math.pi * f * t) * 0.25 * math.exp(-7.0 * t)
                    left_channel[idx] += val
                    right_channel[idx] += val
        elif sfx_name == "water_pop":
            for i in range(int(0.6 * sample_rate)):
                idx = start_idx + i
                if idx >= num_samples: break
                t = i / sample_rate
                f = 600 - 400 * t
                val = (math.sin(2 * math.pi * f * t) + random.uniform(-0.4, 0.4)) * 0.3 * math.exp(-5.0 * t)
                left_channel[idx] += val
                right_channel[idx] += val
        elif sfx_name == "cave_echo":
            for i in range(int(0.7 * sample_rate)):
                idx = start_idx + i
                if idx >= num_samples: break
                t = i / sample_rate
                val = math.sin(2 * math.pi * 320 * t) * 0.28 * math.exp(-3.5 * t)
                left_channel[idx] += val
                right_channel[idx] += val
        elif sfx_name == "island_ding":
            for i in range(int(0.6 * sample_rate)):
                idx = start_idx + i
                if idx >= num_samples: break
                t = i / sample_rate
                val = (math.sin(2 * math.pi * 1046 * t) + 0.3 * math.sin(2 * math.pi * 2093 * t)) * 0.25 * math.exp(-4.0 * t)
                left_channel[idx] += val
                right_channel[idx] += val
        elif sfx_name == "elephant_sfx":
            for i in range(int(0.65 * sample_rate)):
                idx = start_idx + i
                if idx >= num_samples: break
                t = i / sample_rate
                f = 250 + 500 * t + 80 * math.sin(2 * math.pi * 14 * t)
                val = math.sin(2 * math.pi * f * t) * 0.3 * math.exp(-3.5 * t)
                left_channel[idx] += val
                right_channel[idx] += val
        elif sfx_name == "arcade_win":
            # 80'ler arcade victory fanfare
            fanfare_notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]
            for step, f in enumerate(fanfare_notes):
                s_idx = start_idx + int(step * 0.12 * sample_rate)
                dur = int(0.5 * sample_rate) if step < len(fanfare_notes) - 1 else int(1.2 * sample_rate)
                for i in range(dur):
                    idx = s_idx + i
                    if idx >= num_samples: break
                    t = i / sample_rate
                    val = (math.sin(2 * math.pi * f * t) + 0.3 * math.sin(4 * math.pi * f * t)) * 0.25 * math.exp(-2.5 * t)
                    left_channel[idx] += val
                    right_channel[idx] += val

    # Normalizasyon
    out_frames = []
    for i in range(num_samples):
        t = i / sample_rate
        fade = 1.0
        if t < 0.6: fade = t / 0.6
        elif t > (duration_sec - 1.8): fade = max(0.0, (duration_sec - t) / 1.8)

        l = max(-0.95, min(0.95, left_channel[i] * fade))
        r = max(-0.95, min(0.95, right_channel[i] * fade))
        out_frames.append(struct.pack('<hh', int(l * 32767), int(r * 32767)))

    with wave.open(output_path, 'wb') as wav:
        wav.setnchannels(2)
        wav.setsampwidth(2)
        wav.setframerate(sample_rate)
        wav.writeframes(b''.join(out_frames))
    print(f"✅ 80'ler retro müziği hazır: {output_path}")

# -------------------------------------------------------------
# 2. 1980/1990 KARİKATÜR ÇİZİM VE HAREKET MOTORU
# -------------------------------------------------------------
class RetroCartoonEngine:
    def __init__(self):
        print("🎨 80'ler çizgi film vektör motoru başlatılıyor...")
        # 80'ler Memphis desenli temel dokular
        self.memphis_dots = self.create_memphis_pattern()

    def create_memphis_pattern(self):
        pat = Image.new("RGBA", (120, 120), (0, 0, 0, 0))
        d = ImageDraw.Draw(pat)
        # Minik siyah noktalar ve zig-zag
        for x in range(0, 120, 30):
            for y in range(0, 120, 30):
                d.ellipse([x - 2, y - 2, x + 2, y + 2], fill=(0, 0, 0, 35))
        return pat

    def draw_retro_sky(self, draw, color_top, color_bot):
        """Retro çizgi roman gradyanı"""
        for y in range(HEIGHT):
            p = y / HEIGHT
            r = int(color_top[0] + (color_bot[0] - color_top[0]) * p)
            g = int(color_top[1] + (color_bot[1] - color_top[1]) * p)
            b = int(color_top[2] + (color_bot[2] - color_top[2]) * p)
            draw.line([(0, y), (WIDTH, y)], fill=(r, g, b, 255))

    def draw_comic_sun(self, draw, cx, cy, radius=120, ray_angle=0.0):
        """Gözlüklü sevimli 80'ler güneşi"""
        # Işınlar
        for i in range(12):
            ang = ray_angle + i * (2 * math.pi / 12)
            x1 = cx + (radius + 15) * math.cos(ang)
            y1 = cy + (radius + 15) * math.sin(ang)
            x2 = cx + (radius + 45) * math.cos(ang)
            y2 = cy + (radius + 45) * math.sin(ang)
            draw.line([(x1, y1), (x2, y2)], fill=COLOR_RETRO_ORANGE, width=10)

        # Güneş gövdesi
        draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], fill=COLOR_RETRO_YELLOW, outline=COLOR_INK, width=6)

        # 80'ler siyah retro güneş gözlüğü
        gw = radius * 0.7
        gh = radius * 0.35
        draw.rounded_rectangle([cx - gw - 6, cy - gh, cx - 6, cy + gh], radius=14, fill=COLOR_INK)
        draw.rounded_rectangle([cx + 6, cy - gh, cx + gw + 6, cy + gh], radius=14, fill=COLOR_INK)
        draw.line([(cx - 10, cy - 8), (cx + 10, cy - 8)], fill=COLOR_INK, width=8)
        # Gözlük camında beyaz yansıma çizgisi
        draw.line([(cx - gw + 4, cy - gh + 6), (cx - 16, cy + gh - 6)], fill=(255, 255, 255, 200), width=4)
        draw.line([(cx + 16, cy - gh + 6), (cx + gw - 4, cy + gh - 6)], fill=(255, 255, 255, 200), width=4)

        # Neşeli gülümseme
        draw.arc([cx - 40, cy + 10, cx + 40, cy + 60], start=20, end=160, fill=COLOR_INK, width=6)

    def draw_palm_tree(self, draw, bx, by, scale=1.0, swing=0.0):
        """Karikatür palmiye ağacı"""
        trunk_pts = [
            (bx, by),
            (bx + int(20 * scale) + int(10 * swing), by - int(90 * scale)),
            (bx + int(15 * scale) + int(25 * swing), by - int(180 * scale)),
            (bx - int(10 * scale) + int(45 * swing), by - int(270 * scale)),
        ]
        # Kalın gövde segmentleri
        for i in range(len(trunk_pts) - 1):
            draw.line([trunk_pts[i], trunk_pts[i + 1]], fill=(140, 85, 45, 255), width=int(24 * scale))
            draw.line([trunk_pts[i], trunk_pts[i + 1]], fill=COLOR_INK, width=int(4 * scale))

        # Yeşil yapraklar
        cx, cy = trunk_pts[-1]
        leaf_angles = [-150, -110, -70, -30, 10, 50]
        for a in leaf_angles:
            rad = math.radians(a + swing * 8)
            lx = cx + int(130 * scale * math.cos(rad))
            ly = cy + int(90 * scale * math.sin(rad))
            draw.arc([cx - int(130 * scale), cy - int(90 * scale), cx + int(130 * scale), cy + int(90 * scale)],
                     start=a - 25, end=a + 25, fill=COLOR_RETRO_GREEN, width=int(20 * scale))

    def draw_cartoon_airplane(self, draw, cx, cy, scale=1.0):
        """Sevimli tombul karikatür uçak"""
        w = int(140 * scale)
        h = int(60 * scale)
        # Gövde
        draw.rounded_rectangle([cx - w, cy - h, cx + w, cy + h], radius=h, fill=COLOR_WHITE, outline=COLOR_INK, width=5)
        # Burun
        draw.arc([cx + w - 20, cy - h, cx + w + 30, cy + h], start=270, end=90, fill=COLOR_RETRO_ORANGE, width=12)
        # Kanat
        draw.polygon([(cx - 20, cy), (cx + 30, cy), (cx - 40, cy + int(90 * scale)), (cx - 70, cy + int(90 * scale))], fill=COLOR_RETRO_CYAN, outline=COLOR_INK)
        # Kuyruk
        draw.polygon([(cx - w, cy - 10), (cx - w - 40, cy - int(80 * scale)), (cx - w + 10, cy - int(80 * scale)), (cx - w + 30, cy - 10)], fill=COLOR_RETRO_PINK, outline=COLOR_INK)
        # Pencereler
        for wx in [-50, -10, 30, 70]:
            draw.ellipse([cx + wx - 12, cy - 20, cx + wx + 12, cy + 6], fill=COLOR_RETRO_CYAN, outline=COLOR_INK, width=3)
        # Bulut pufu izi
        for puff_x in [-180, -220, -260]:
            draw.ellipse([cx + puff_x - 20, cy - 15, cx + puff_x + 20, cy + 25], fill=COLOR_WHITE, outline=COLOR_INK, width=3)

    def draw_cartoon_van(self, draw, cx, cy, scale=1.0):
        """80'ler tarzı sörf tahtalı VIP transfer minibüsü"""
        w = int(180 * scale)
        h = int(110 * scale)
        # Araç gövdesi
        draw.rounded_rectangle([cx - w, cy - h, cx + w, cy + h], radius=24, fill=COLOR_RETRO_YELLOW, outline=COLOR_INK, width=6)
        # Ön cam ve yan camlar
        draw.rounded_rectangle([cx + 40, cy - h + 15, cx + w - 20, cy], radius=10, fill=COLOR_RETRO_CYAN, outline=COLOR_INK, width=4)
        draw.rounded_rectangle([cx - 40, cy - h + 15, cx + 25, cy], radius=10, fill=COLOR_RETRO_CYAN, outline=COLOR_INK, width=4)
        draw.rounded_rectangle([cx - w + 20, cy - h + 15, cx - 55, cy], radius=10, fill=COLOR_RETRO_CYAN, outline=COLOR_INK, width=4)
        # Farlar
        draw.ellipse([cx + w - 12, cy + 20, cx + w + 8, cy + 50], fill=COLOR_RETRO_ORANGE, outline=COLOR_INK, width=4)
        # Tampon
        draw.rounded_rectangle([cx - w - 10, cy + h - 25, cx + w + 15, cy + h - 5], radius=8, fill=(180, 190, 205, 255), outline=COLOR_INK, width=4)
        # Tekerlekler
        for wx in [-w + 60, w - 60]:
            draw.ellipse([cx + wx - 34, cy + h - 25, cx + wx + 34, cy + h + 42], fill=COLOR_INK)
            draw.ellipse([cx + wx - 18, cy + h - 10, cx + wx + 18, cy + h + 26], fill=(210, 220, 235, 255), outline=COLOR_INK, width=3)
        # Tavan sörf tahtası
        draw.ellipse([cx - w - 20, cy - h - 35, cx + w + 20, cy - h], fill=COLOR_RETRO_PINK, outline=COLOR_INK, width=5)
        draw.line([(cx - w, cy - h - 18), (cx + w, cy - h - 18)], fill=COLOR_WHITE, width=4)

    def draw_cartoon_boat(self, draw, cx, cy, scale=1.0, wobble=0.0):
        """Zıplayan karikatür sürat teknesi"""
        w = int(220 * scale)
        h = int(75 * scale)
        # Tekne gövdesi
        pts = [
            (cx - w, cy - h // 2),
            (cx + w - 40, cy - h // 2),
            (cx + w + 20, cy + 10),
            (cx + w - 30, cy + h),
            (cx - w, cy + h),
        ]
        draw.polygon(pts, fill=COLOR_WHITE, outline=COLOR_INK)
        draw.line([pts[0], pts[1], pts[2], pts[3], pts[4], pts[0]], fill=COLOR_INK, width=6)
        # Gövde turuncu şeridi
        draw.polygon([(cx - w + 10, cy + 10), (cx + w - 10, cy + 10), (cx + w - 20, cy + 35), (cx - w + 10, cy + 35)], fill=COLOR_RETRO_ORANGE)
        # Ön siperlik
        draw.polygon([(cx + 20, cy - h // 2), (cx + 90, cy - h // 2), (cx + 60, cy - h - 25), (cx + 10, cy - h - 25)], fill=COLOR_RETRO_CYAN, outline=COLOR_INK, width=4)
        # Dalga köpüğü
        for i in range(5):
            bx = cx - w - 20 - i * 30
            by = cy + h - 10 + int(8 * math.sin(wobble + i))
            draw.ellipse([bx - 20, by - 15, bx + 20, by + 15], fill=COLOR_WHITE, outline=COLOR_INK, width=3)

    def draw_james_bond_rock(self, draw, cx, cy, scale=1.0):
        """İkonik mantar kireçtaşı kayası (James Bond)"""
        # Su seviyesi
        draw.rounded_rectangle([cx - 200, cy + 160, cx + 200, cy + 220], radius=15, fill=COLOR_RETRO_CYAN, outline=COLOR_INK, width=4)
        # Dar taban ve genişleyen üst kaya
        rock_pts = [
            (cx - 35 * scale, cy + 160),
            (cx - 20 * scale, cy + 80),
            (cx - 70 * scale, cy - 40),
            (cx - 90 * scale, cy - 180),
            (cx - 40 * scale, cy - 250),
            (cx + 40 * scale, cy - 250),
            (cx + 90 * scale, cy - 180),
            (cx + 70 * scale, cy - 40),
            (cx + 20 * scale, cy + 80),
            (cx + 35 * scale, cy + 160),
        ]
        draw.polygon(rock_pts, fill=(110, 140, 100, 255), outline=COLOR_INK)
        draw.line(rock_pts + [rock_pts[0]], fill=COLOR_INK, width=6)
        # Tepedeki ağaçlar
        for tx in [-60, -20, 20, 60]:
            draw.ellipse([cx + tx - 25, cy - 280, cx + tx + 25, cy - 230], fill=COLOR_RETRO_GREEN, outline=COLOR_INK, width=4)

    def draw_cartoon_elephant(self, draw, cx, cy, scale=1.0, swing=0.0):
        """Büyük kulaklı, sevimli karikatür fil"""
        body_col = (130, 170, 205, 255)
        w = int(140 * scale)
        h = int(105 * scale)

        # Arka bacaklar
        for lx in [-w // 2 + 25, w // 2 - 25]:
            draw.rounded_rectangle([cx + lx - 18, cy + 30, cx + lx + 18, cy + 110], radius=12, fill=body_col, outline=COLOR_INK, width=5)

        # Gövde
        draw.ellipse([cx - w // 2, cy - h // 2, cx + w // 2, cy + h // 2], fill=body_col, outline=COLOR_INK, width=6)

        # Kafa
        hw = int(85 * scale)
        head_cx = cx - int(65 * scale)
        head_cy = cy - int(20 * scale)
        draw.ellipse([head_cx - hw // 2, head_cy - hw // 2, head_cx + hw // 2, head_cy + hw // 2], fill=body_col, outline=COLOR_INK, width=6)

        # Kulak (pembe iç)
        ear_x = head_cx + int(35 * scale)
        ear_y = head_cy - int(10 * scale)
        draw.ellipse([ear_x - 35, ear_y - 45, ear_x + 35, ear_y + 45], fill=(255, 185, 200, 255), outline=COLOR_INK, width=5)

        # Göz
        draw.ellipse([head_cx - 15, head_cy - 16, head_cx + 8, head_cy + 8], fill=COLOR_INK)
        draw.ellipse([head_cx - 10, head_cy - 12, head_cx - 2, head_cy - 4], fill=COLOR_WHITE)

        # Hortum (su püskürten)
        draw.arc([head_cx - 75, head_cy - 20, head_cx - 15, head_cy + 60], start=90, end=270, fill=COLOR_INK, width=16)
        draw.arc([head_cx - 70, head_cy - 15, head_cx - 20, head_cy + 55], start=90, end=270, fill=body_col, width=10)

        # Su damlacıkları
        for i in range(4):
            sx = head_cx - 90 - i * 22
            sy = head_cy - 30 - i * 14 + int(10 * math.sin(swing + i))
            draw.ellipse([sx - 8, sy - 8, sx + 8, sy + 8], fill=COLOR_RETRO_CYAN, outline=COLOR_INK, width=3)

    def draw_starburst(self, draw, cx, cy, text, bg_color=COLOR_RETRO_PINK, scale=1.0):
        """Retro ses efekti patlaması"""
        pts = []
        points = 14
        r_out = int(100 * scale)
        r_in = int(62 * scale)
        for i in range(points * 2):
            r = r_out if i % 2 == 0 else r_in
            a = i * (math.pi / points)
            pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))

        # Siyah gölge ve patlama
        shadow_pts = [(x + 8, y + 8) for x, y in pts]
        draw.polygon(shadow_pts, fill=COLOR_INK)
        draw.polygon(pts, fill=bg_color, outline=COLOR_INK, width=5)

        tb = font_burst.getbbox(text)
        tw = tb[2] - tb[0]
        th = tb[3] - tb[1]
        draw.text((cx - tw // 2, cy - th // 2 - 4), text, font=font_burst, fill=COLOR_WHITE)

    def draw_speech_bubble(self, draw, x, y, w, h, speaker, text, subtext=""):
        """80'ler çizgi roman konuşma balonu"""
        # Siyah ofset gölge
        draw.rounded_rectangle([x + 8, y + 8, x + w + 8, y + h + 8], radius=24, fill=COLOR_INK)
        # Beyaz balon
        draw.rounded_rectangle([x, y, x + w, y + h], radius=24, fill=COLOR_WHITE, outline=COLOR_INK, width=5)
        # Kuyruk
        draw.polygon([(x + 40, y + h), (x + 85, y + h), (x + 20, y + h + 30)], fill=COLOR_WHITE, outline=COLOR_INK)
        draw.line([(x + 42, y + h - 2), (x + 83, y + h - 2)], fill=COLOR_WHITE, width=8)

        # Konuşmacı başlığı
        draw.rounded_rectangle([x + 24, y - 18, x + 240, y + 22], radius=12, fill=COLOR_RETRO_ORANGE, outline=COLOR_INK, width=3)
        draw.text((x + 36, y - 14), speaker, font=font_bubble_speaker, fill=COLOR_WHITE)

        # İç metinler
        draw.text((x + 28, y + 28), text, font=font_bubble_text, fill=COLOR_INK)
        if subtext:
            draw.text((x + 28, y + 68), subtext, font=font_bubble_sub, fill=(80, 80, 80, 255))

    def draw_comic_header_bar(self, draw, step_num, title, subtitle):
        """Üst başlık şeridi"""
        x, y, w, h = 60, 40, 960, 120
        # Gölge
        draw.rounded_rectangle([x + 8, y + 8, x + w + 8, y + h + 8], radius=20, fill=COLOR_INK)
        # Kutu
        draw.rounded_rectangle([x, y, x + w, y + h], radius=20, fill=COLOR_RETRO_YELLOW, outline=COLOR_INK, width=5)

        # Adım rozeti
        draw.rounded_rectangle([x + 24, y + 14, x + 200, y + 46], radius=10, fill=COLOR_RETRO_PINK, outline=COLOR_INK, width=2)
        draw.text((x + 36, y + 18), step_num, font=font_step, fill=COLOR_WHITE)

        draw.text((x + 24, y + 52), title, font=font_title, fill=COLOR_INK)
        draw.text((x + 24, y + 88), subtitle, font=font_step, fill=(60, 60, 60, 255))

    # --- 6 TEMEL HİKAYE SAHNESİ ---

    def render_scene_1_airport(self, progress):
        """0.0s - 6.0s: 1. Gün - Havalimanı Karşılama & Otele VIP Transfer"""
        img = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
        d = ImageDraw.Draw(img)
        self.draw_retro_sky(d, (135, 206, 250), (255, 235, 190))

        # Retro güneş ve palmiyeler
        self.draw_comic_sun(d, WIDTH - 260, 240, radius=110, ray_angle=progress * 2)
        self.draw_palm_tree(d, 160, HEIGHT - 80, scale=1.4, swing=math.sin(progress * 4))
        self.draw_palm_tree(d, 320, HEIGHT - 100, scale=1.1, swing=math.sin(progress * 4 + 1))

        # Asfalt yol
        d.rectangle([0, HEIGHT - 180, WIDTH, HEIGHT], fill=(60, 65, 80, 255), outline=COLOR_INK, width=5)
        for rx in range(0, WIDTH, 120):
            d.rectangle([rx, HEIGHT - 95, rx + 60, HEIGHT - 85], fill=COLOR_RETRO_YELLOW)

        # Karikatür Uçak (Yukarıdan aşağı süzülen)
        plane_x = int(300 + progress * 600)
        plane_y = int(180 + progress * 80)
        self.draw_cartoon_airplane(d, plane_x, plane_y, scale=1.2)

        # Sörf minibüsü (Yolda ilerleyen)
        van_x = int(700 + progress * 500)
        self.draw_cartoon_van(d, van_x, HEIGHT - 180, scale=1.3)

        # Başlık ve Diyalog
        self.draw_comic_header_bar(d, "1. GÜN • VARIŞ", "Havalimanından Otele VIP Transfer 🛬", "İsimli tabelayla karşılama & klimalı konforlu transfer.")
        self.draw_starburst(d, WIDTH - 320, HEIGHT - 340, "BEEP BEEP! 🚗", bg_color=COLOR_RETRO_ORANGE, scale=1.0 + 0.15 * math.sin(progress * 8))

        self.draw_speech_bubble(
            d, x=100, y=HEIGHT - 380, w=840, h=110,
            speaker="👨‍🦱 CAN & ECE",
            text="\"Uçaktan indik, bavulları kaptık, doğruca otele!\"",
            subtext="Phuket'te ilk anımızdan itibaren Türkçe destek yanımızda!"
        )
        return img

    def render_scene_2_bangla(self, progress):
        """6.0s - 11.0s: 1. Gün Akşamı - Bangla Road Gece Hayatı & Eğlence"""
        img = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
        d = ImageDraw.Draw(img)
        # Gece gökyüzü
        self.draw_retro_sky(d, (20, 15, 45), (75, 20, 90))

        # Arka plan neon sokak binaları ve silüetler
        for bx in range(80, WIDTH, 240):
            bh = 380 + (bx % 160)
            d.rounded_rectangle([bx, HEIGHT - bh, bx + 200, HEIGHT], radius=16, fill=(30, 25, 60, 255), outline=COLOR_RETRO_CYAN, width=3)
            # Pencereler
            for wy in range(HEIGHT - bh + 40, HEIGHT - 80, 50):
                d.rectangle([bx + 30, wy, bx + 70, wy + 30], fill=COLOR_RETRO_YELLOW)
                d.rectangle([bx + 110, wy, bx + 150, wy + 30], fill=COLOR_RETRO_PINK)

        # 80'ler Neon Tabelaları
        d.rounded_rectangle([600, 240, 1320, 360], radius=24, fill=(15, 10, 30, 240), outline=COLOR_RETRO_PINK, width=6)
        neon_text = "★ BANGLA ROAD NEON NIGHTS ★"
        tb = font_hero.getbbox(neon_text)
        tw = tb[2] - tb[0]
        d.text(((WIDTH - tw) // 2, 265), neon_text, font=font_hero, fill=COLOR_RETRO_CYAN)

        # Şemsiyeli retro kokteyl bardağı
        cx, cy = WIDTH - 340, 560
        d.polygon([(cx - 70, cy - 80), (cx + 70, cy - 80), (cx, cy + 20)], fill=COLOR_RETRO_PINK, outline=COLOR_WHITE, width=4)
        d.line([(cx, cy + 20), (cx, cy + 120)], fill=COLOR_WHITE, width=8)
        d.line([(cx - 45, cy + 120), (cx + 45, cy + 120)], fill=COLOR_WHITE, width=8)
        # Şemsiye ve meyve
        d.arc([cx - 40, cy - 140, cx + 40, cy - 60], start=180, end=360, fill=COLOR_RETRO_YELLOW, width=10)

        self.draw_comic_header_bar(d, "1. GÜN AKŞAMI", "Bangla Road & Patong Gece Hayatı 🎆", "Işıl ışıl sokaklar, canlı müzik, dans ve sokak lezzetleri!")
        self.draw_starburst(d, 360, 520, "PARTY TIME! 🍸", bg_color=COLOR_RETRO_PINK, scale=1.0 + 0.15 * math.sin(progress * 8))

        self.draw_speech_bubble(
            d, x=100, y=HEIGHT - 380, w=840, h=110,
            speaker="👩‍🦰 ECE",
            text="\"İlk akşam enerjimiz tavan! Bangla Road'da hayat durmuyor!\"",
            subtext="Yarın sabah ise efsane ada turumuz başlıyor: Phi Phi!"
        )
        return img

    def render_scene_3_phiphi(self, progress):
        """11.0s - 16.0s: 2. Gün - Phi Phi Adaları & Maya Bay"""
        img = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
        d = ImageDraw.Draw(img)
        self.draw_retro_sky(d, (0, 200, 255), (180, 245, 255))

        # Güneş
        self.draw_comic_sun(d, 260, 240, radius=90, ray_angle=progress * 3)

        # Zümrüt deniz dalgaları
        d.rectangle([0, HEIGHT - 360, WIDTH, HEIGHT], fill=(0, 185, 215, 255), outline=COLOR_INK, width=4)
        for wx in range(-60, WIDTH + 60, 140):
            wy = HEIGHT - 360 + int(15 * math.sin(progress * 6 + wx))
            d.arc([wx, wy - 30, wx + 140, wy + 30], start=0, end=180, fill=COLOR_WHITE, width=8)

        # Uzak kireçtaşı kayalıkları (karikatür)
        d.polygon([(700, HEIGHT - 360), (780, HEIGHT - 540), (880, HEIGHT - 360)], fill=(70, 150, 120, 255), outline=COLOR_INK, width=4)
        d.polygon([(860, HEIGHT - 360), (960, HEIGHT - 600), (1080, HEIGHT - 360)], fill=(90, 175, 140, 255), outline=COLOR_INK, width=4)

        # Sürat teknesi (Dalgalarda zıplayan)
        boat_y = HEIGHT - 320 + int(20 * math.sin(progress * 8))
        self.draw_cartoon_boat(d, WIDTH // 2 + 60, boat_y, scale=1.3, wobble=progress * 8)

        # Sıçrayan balık
        fx = WIDTH // 2 - 260
        fy = HEIGHT - 360 - int(50 * abs(math.sin(progress * 6)))
        d.ellipse([fx, fy, fx + 50, fy + 25], fill=COLOR_RETRO_ORANGE, outline=COLOR_INK, width=3)
        d.polygon([(fx, fy + 12), (fx - 20, fy - 5), (fx - 20, fy + 30)], fill=COLOR_RETRO_ORANGE, outline=COLOR_INK, width=2)

        self.draw_comic_header_bar(d, "2. GÜN • ADA TURU", "Phi Phi, Maya Bay & Pileh Lagoon 🏝️", "Sürat teknesi, lagünde yüzme ve renkli şnorkel resifleri.")
        self.draw_starburst(d, WIDTH - 340, 360, "SPLASH! 💦", bg_color=COLOR_RETRO_CYAN, scale=1.0 + 0.15 * math.sin(progress * 8))

        self.draw_speech_bubble(
            d, x=100, y=HEIGHT - 380, w=840, h=110,
            speaker="👨‍🦱 CAN",
            text="\"Bu deniz tam çizgi film gibi! Lagün akvaryum kadar berrak!\"",
            subtext="Maya Bay kumsalında yürüdük, şnorkelle mercanları izledik."
        )
        return img

    def render_scene_4_jamesbond(self, progress):
        """16.0s - 21.0s: 3. Gün - James Bond Adası & Kano Safarisi"""
        img = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
        d = ImageDraw.Draw(img)
        self.draw_retro_sky(d, (255, 160, 100), (255, 230, 180))

        # İkonik mantar ada kayası
        self.draw_james_bond_rock(d, WIDTH - 420, HEIGHT - 420, scale=1.5)

        # Deniz
        d.rectangle([0, HEIGHT - 260, WIDTH, HEIGHT], fill=(0, 150, 180, 255), outline=COLOR_INK, width=4)

        # Karikatür Kano ve Kürek Çekenler
        canoe_x = int(350 + progress * 400)
        canoe_y = HEIGHT - 240
        # Kano gövdesi
        draw_canoe_pts = [(canoe_x - 140, canoe_y), (canoe_x + 140, canoe_y), (canoe_x + 90, canoe_y + 40), (canoe_x - 90, canoe_y + 40)]
        d.polygon(draw_canoe_pts, fill=COLOR_RETRO_ORANGE, outline=COLOR_INK, width=4)
        # Turistler (Kafalar ve kasklar)
        d.ellipse([canoe_x - 50, canoe_y - 45, canoe_x - 10, canoe_y - 5], fill=(255, 210, 180, 255), outline=COLOR_INK, width=3)
        d.ellipse([canoe_x + 10, canoe_y - 45, canoe_x + 50, canoe_y - 5], fill=(255, 210, 180, 255), outline=COLOR_INK, width=3)
        d.arc([canoe_x - 55, canoe_y - 55, canoe_x - 5, cy - 15 if 'cy' in locals() else canoe_y - 5], start=180, end=360, fill=COLOR_RETRO_YELLOW, width=8)
        # Kürek
        paddle_angle = progress * 10
        px1 = canoe_x + int(60 * math.cos(paddle_angle))
        py1 = canoe_y + int(40 * math.sin(paddle_angle))
        px2 = canoe_x - int(60 * math.cos(paddle_angle))
        py2 = canoe_y - int(40 * math.sin(paddle_angle))
        d.line([(px1, py1), (px2, py2)], fill=(130, 80, 40, 255), width=8)

        self.draw_comic_header_bar(d, "3. GÜN • 007 GÖREVİ", "James Bond Adası & Deniz Mağaraları 🛶", "Kireçtaşı kayalıklar arasında kano ve gizli mağara keşfi.")
        self.draw_starburst(d, 360, 480, "007 MISSION! 🕶️", bg_color=COLOR_RETRO_YELLOW, scale=1.0 + 0.15 * math.sin(progress * 8))

        self.draw_speech_bubble(
            d, x=100, y=HEIGHT - 380, w=840, h=110,
            speaker="👩‍🦰 ECE",
            text="\"Dev mağaraların altından kano ile geçtik, manzara nefes kesici!\"",
            subtext="İkonik James Bond kayası önünde hatıra fotoğraflarımızı aldık."
        )
        return img

    def render_scene_5_other_islands(self, progress):
        """21.0s - 26.0s: 4. Gün - Diğer Adalar (Coral Island & Racha / Similan)"""
        img = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
        d = ImageDraw.Draw(img)
        self.draw_retro_sky(d, (0, 220, 255), (255, 230, 200))

        # Güneş
        self.draw_comic_sun(d, WIDTH - 260, 220, radius=100, ray_angle=progress * 2)

        # Beyaz kumsal ada
        d.ellipse([WIDTH // 2 - 500, HEIGHT - 320, WIDTH // 2 + 500, HEIGHT + 200], fill=(255, 245, 210, 255), outline=COLOR_INK, width=5)

        # Palmiye
        self.draw_palm_tree(d, WIDTH // 2 - 200, HEIGHT - 180, scale=1.4, swing=math.sin(progress * 4))

        # Karikatür Şezlong ve Hindistan Cevizi
        cx, cy = WIDTH // 2 + 100, HEIGHT - 200
        # Şezlong
        d.line([(cx - 80, cy + 30), (cx + 80, cy + 30)], fill=COLOR_RETRO_PINK, width=12)
        d.line([(cx - 80, cy + 30), (cx - 120, cy - 30)], fill=COLOR_RETRO_PINK, width=12)
        d.line([(cx - 70, cy + 30), (cx - 70, cy + 60)], fill=COLOR_INK, width=6)
        d.line([(cx + 70, cy + 30), (cx + 70, cy + 60)], fill=COLOR_INK, width=6)

        # Hindistan cevizi & pipet
        d.ellipse([cx + 120, cy + 10, cx + 160, cy + 50], fill=(120, 70, 30, 255), outline=COLOR_INK, width=4)
        d.line([(cx + 140, cy + 10), (cx + 155, cy - 20)], fill=COLOR_RETRO_CYAN, width=6)

        self.draw_comic_header_bar(d, "4. GÜN • CENNET ADALAR", "Coral & Racha / Similan Adaları 🥥", "Bembeyaz pudra kumlar, şezlongda dinlenme ve kristal su.")
        self.draw_starburst(d, 360, 480, "100% RELAX! ✨", bg_color=COLOR_RETRO_GREEN, scale=1.0 + 0.15 * math.sin(progress * 8))

        self.draw_speech_bubble(
            d, x=100, y=HEIGHT - 380, w=840, h=110,
            speaker="👨‍🦱 CAN",
            text="\"Tam bir kartpostal! Hindistan cevizimizi yudumlayıp dinlendik.\"",
            subtext="Şimdi sırada tatilin en heyecanla beklenen günü var: Fil safari!"
        )
        return img

    def render_scene_6_elephant(self, progress):
        """26.0s - 31.0s: 5. Gün - Etik Fil Barınağında Çamur Banyosu"""
        img = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
        d = ImageDraw.Draw(img)
        # Tropik orman yeşili arka plan
        self.draw_retro_sky(d, (100, 200, 120), (220, 255, 200))

        # Çamur havuzu / gölet
        d.ellipse([WIDTH // 2 - 400, HEIGHT - 280, WIDTH // 2 + 400, HEIGHT + 80], fill=(160, 110, 60, 255), outline=COLOR_INK, width=6)

        # Sevimli Fil (Hortumundan su püskürten)
        elephant_x = WIDTH // 2 + 80
        elephant_y = HEIGHT - 220
        self.draw_cartoon_elephant(d, elephant_x, elephant_y, scale=1.5, swing=progress * 8)

        # Karpuz dilimleri
        d.arc([elephant_x + 220, HEIGHT - 180, elephant_x + 280, HEIGHT - 120], start=0, end=180, fill=COLOR_RETRO_PINK, width=12)
        d.arc([elephant_x + 220, HEIGHT - 180, elephant_x + 280, HEIGHT - 120], start=0, end=180, fill=COLOR_RETRO_GREEN, width=4)

        self.draw_comic_header_bar(d, "5. GÜN • DOĞA DOSTLARI", "Etik Fil Koruma Barınağı & Çamur Banyosu 🐘", "Zincirsiz, %100 etik ortamda banyo, sevgi ve besleme.")
        self.draw_starburst(d, 360, 480, "SO CUTE! 💚", bg_color=COLOR_RETRO_PINK, scale=1.0 + 0.15 * math.sin(progress * 8))

        self.draw_speech_bubble(
            d, x=100, y=HEIGHT - 380, w=840, h=110,
            speaker="👩‍🦰 ECE & CAN",
            text="\"Zincir yok, gösteri yok! Fillerle çamurda oynadık, karpuz yedirdik!\"",
            subtext="Hayatımız boyunca unutamayacağımız en duygusal gündü."
        )
        return img

    def render_scene_7_outro(self, progress):
        """31.0s - 36.0s: Büyük Kapanış - 80'ler Arcade Stage Clear & WhatsApp"""
        img = Image.new("RGBA", (WIDTH, HEIGHT), (20, 15, 35, 255))
        d = ImageDraw.Draw(img)

        # 80'ler radyal ışınlar
        cx, cy = WIDTH // 2, HEIGHT // 2 - 40
        for i in range(32):
            ang = i * (math.pi / 16) + progress * 0.4
            r = 1400
            p1 = (cx, cy)
            p2 = (cx + r * math.cos(ang), cy + r * math.sin(ang))
            p3 = (cx + r * math.cos(ang + 0.1), cy + r * math.sin(ang + 0.1))
            col = (255, 50, 130, 255) if i % 2 == 0 else (0, 220, 255, 255)
            d.polygon([p1, p2, p3], fill=col)

        # Merkez koyu arcade kutusu
        d.rounded_rectangle([200, 120, WIDTH - 200, HEIGHT - 100], radius=32, fill=(15, 10, 30, 245), outline=COLOR_RETRO_YELLOW, width=8)

        # 80'ler Rozeti (STAGE CLEAR / PHUKET TATİLİ)
        badge_text = "★ STAGE CLEAR: TATİL GÖREVİ TAMAMLANDI! ★"
        tb = font_title.getbbox(badge_text)
        tw = tb[2] - tb[0]
        d.rounded_rectangle([(WIDTH - tw) // 2 - 20, 160, (WIDTH + tw) // 2 + 20, 220], radius=14, fill=COLOR_RETRO_PINK, outline=COLOR_WHITE, width=3)
        d.text(((WIDTH - tw) // 2, 172), badge_text, font=font_title, fill=COLOR_WHITE)

        # Ana Başlık
        head_text = "Senin Phuket Maceran Ne Zaman Başlıyor?"
        hb = font_hero.getbbox(head_text)
        hw = hb[2] - hb[0]
        d.text(((WIDTH - hw) // 2, 250), head_text, font=font_hero, fill=COLOR_RETRO_YELLOW)

        # Alt Özet
        sub_text = "Havalimanından otele, Bangla Road'dan Phi Phi, James Bond, adalara ve fillere kadar her anınız hazır!"
        sb = font_step.getbbox(sub_text)
        sw = sb[2] - sb[0]
        d.text(((WIDTH - sw) // 2, 330), sub_text, font=font_step, fill=COLOR_WHITE)

        # Büyük WhatsApp Butonu (Zıplayan animasyon)
        bounce = 1.0 + 0.04 * math.sin(progress * math.pi * 5)
        bw = int(740 * bounce)
        bh = int(130 * bounce)
        bx = (WIDTH - bw) // 2
        by = 380

        d.rounded_rectangle([bx + 8, by + 8, bx + bw + 8, by + bh + 8], radius=32, fill=(0, 0, 0, 200))
        d.rounded_rectangle([bx, by, bx + bw, by + bh], radius=32, fill=COLOR_RETRO_GREEN, outline=COLOR_WHITE, width=5)

        d.text((bx + 40, by + 20), "💬 WhatsApp Tatil Planlama Hattı", font=font_step, fill=(10, 30, 20, 220))
        d.text((bx + 40, by + 52), "+66 82 895 0665", font=font_cta, fill=(10, 30, 20, 255))
        d.text((bx + bw - 210, by + 46), "HEMEN YAZIN →", font=font_title, fill=(10, 30, 20, 255))

        # 4 Güvence Rozeti
        features = ["🇹🇷 7/24 Türkçe Rehber", "📝 Yazılı Fiyat Garantisi", "🚗 Klimalı Özel Transfer", "⚡ Tek Tıkla Rezervasyon"]
        for i, f_text in enumerate(features):
            fx = 260 + i * 360
            d.rounded_rectangle([fx, 560, fx + 320, 620], radius=14, fill=(255, 255, 255, 25), outline=COLOR_RETRO_CYAN, width=2)
            d.text((fx + 20, 580), f_text, font=font_badge, fill=COLOR_WHITE)

        # Web Adresi
        web_text = "🌐  www.phukettatili.com"
        wb = font_title.getbbox(web_text)
        ww = wb[2] - wb[0]
        d.rounded_rectangle([(WIDTH - ww) // 2 - 20, 680, (WIDTH + ww) // 2 + 20, 740], radius=16, fill=COLOR_RETRO_ORANGE, outline=COLOR_WHITE, width=3)
        d.text(((WIDTH - ww) // 2, 692), web_text, font=font_title, fill=COLOR_WHITE)

        return img

    def render_frame(self, frame_idx):
        t = frame_idx / FPS
        FADE = 0.35

        # Sahne aralıkları (saniye):
        # 1. Airport (0.0 -> 6.0)
        # 2. Bangla (6.0 -> 11.0)
        # 3. Phi Phi (11.0 -> 16.0)
        # 4. James Bond (16.0 -> 21.0)
        # 5. Other Islands (21.0 -> 26.0)
        # 6. Elephant (26.0 -> 31.0)
        # 7. Outro (31.0 -> 36.0)

        if t < 6.0:
            p = t / 6.0
            curr = self.render_scene_1_airport(p)
            if t > (6.0 - FADE):
                return Image.blend(curr, self.render_scene_2_bangla(0.0), (t - (6.0 - FADE)) / FADE)
            return curr

        elif t < 11.0:
            p = (t - 6.0) / 5.0
            curr = self.render_scene_2_bangla(p)
            if t > (11.0 - FADE):
                return Image.blend(curr, self.render_scene_3_phiphi(0.0), (t - (11.0 - FADE)) / FADE)
            return curr

        elif t < 16.0:
            p = (t - 11.0) / 5.0
            curr = self.render_scene_3_phiphi(p)
            if t > (16.0 - FADE):
                return Image.blend(curr, self.render_scene_4_jamesbond(0.0), (t - (16.0 - FADE)) / FADE)
            return curr

        elif t < 21.0:
            p = (t - 16.0) / 5.0
            curr = self.render_scene_4_jamesbond(p)
            if t > (21.0 - FADE):
                return Image.blend(curr, self.render_scene_5_other_islands(0.0), (t - (21.0 - FADE)) / FADE)
            return curr

        elif t < 26.0:
            p = (t - 21.0) / 5.0
            curr = self.render_scene_5_other_islands(p)
            if t > (26.0 - FADE):
                return Image.blend(curr, self.render_scene_6_elephant(0.0), (t - (26.0 - FADE)) / FADE)
            return curr

        elif t < 31.0:
            p = (t - 26.0) / 5.0
            curr = self.render_scene_6_elephant(p)
            if t > (31.0 - FADE):
                return Image.blend(curr, self.render_scene_7_outro(0.0), (t - (31.0 - FADE)) / FADE)
            return curr

        else:
            p = (t - 31.0) / 5.0
            return self.render_scene_7_outro(p)


def main():
    print("=" * 65)
    print("🕹️ PHUKET TATİLİ - 1980/1990 RETRO KARİKATÜR VİDEO MOTORU")
    print(f"Çözünürlük: {WIDTH}x{HEIGHT} @ {FPS} FPS | Süre: {DURATION_SEC} sn ({TOTAL_FRAMES} kare)")
    print("=" * 65)

    generate_retro_soundtrack(AUDIO_TEMP_PATH, duration_sec=DURATION_SEC)

    ffmpeg_cmd = [
        "/opt/homebrew/bin/ffmpeg",
        "-y",
        "-f", "rawvideo",
        "-vcodec", "rawvideo",
        "-s", f"{WIDTH}x{HEIGHT}",
        "-pix_fmt", "rgba",
        "-r", str(FPS),
        "-i", "-",
        "-i", AUDIO_TEMP_PATH,
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "18",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "192k",
        "-movflags", "+faststart",
        OUTPUT_VIDEO_PUBLIC
    ]

    print("🚀 FFmpeg video kodlama başlatılıyor...")
    proc = subprocess.Popen(ffmpeg_cmd, stdin=subprocess.PIPE, stderr=subprocess.PIPE)

    engine = RetroCartoonEngine()
    print(f"📽️  80'ler karikatür kareleri işleniyor ({TOTAL_FRAMES} kare)...")
    last_reported = 0

    try:
        for idx in range(TOTAL_FRAMES):
            frame = engine.render_frame(idx)
            proc.stdin.write(frame.tobytes())

            progress = int((idx + 1) / TOTAL_FRAMES * 100)
            if progress >= last_reported + 10:
                print(f"   İlerleme: %{progress} ({idx + 1}/{TOTAL_FRAMES} kare)")
                last_reported = progress

        proc.stdin.close()
        proc.wait()

        if proc.returncode != 0:
            print("❌ FFmpeg hata kodu:", proc.returncode)
            sys.exit(1)

    except Exception as e:
        print("❌ Hata:", e)
        if proc.stdin:
            proc.stdin.close()
        proc.kill()
        sys.exit(1)

    # Kopyalar
    import shutil
    try:
        shutil.copyfile(OUTPUT_VIDEO_PUBLIC, OUTPUT_VIDEO_ROOT)
        shutil.copyfile(OUTPUT_VIDEO_PUBLIC, OUTPUT_VIDEO_ALT)
    except Exception as e:
        print("Kopyalama uyarısı:", e)

    print("=" * 65)
    print("🎉 1980/1990 RETRO KARİKATÜR VİDEOSU BAŞARIYLA TAMAMLANDI!")
    print(f"📁 Web Varlık Yolu: {OUTPUT_VIDEO_PUBLIC}")
    print(f"📁 Proje Kök Yolu:  {OUTPUT_VIDEO_ROOT}")
    print(f"📁 PhuketTatili:    {OUTPUT_VIDEO_ALT}")
    print("=" * 65)

if __name__ == "__main__":
    main()
