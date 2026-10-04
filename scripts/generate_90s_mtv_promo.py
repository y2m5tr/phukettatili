#!/usr/bin/env python3
"""
Phuket Tatili - 1990'lar MTV / Zine / Pop-Kolaj Tanıtım Videosu
1920x1080 Full HD @ 30 FPS, 35 Saniye Yüksek Enerjili 90'lar Sokak & Seyahat Kurgusu
Görsel: Fotoğrafik Kolajlar + Polaroid Çerçeveler + Koli Bantları + VHS OSD + Neon Çıkartmalar
Müzik: 1990'lar Big Beat (Fatboy Slim / Prodigy tarzı) + Roland TB-303 Acid Bas + Korg M1 Piyano + Scratch SFX
"""

import os
import sys
import math
import wave
import struct
import random
import subprocess
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps

WIDTH = 1920
HEIGHT = 1080
FPS = 30
DURATION_SEC = 35
TOTAL_FRAMES = FPS * DURATION_SEC

ROOT_DIR = "/Users/ymg/Downloads/PhuketTatili2"
ASSETS_DIR = os.path.join(ROOT_DIR, "public/assets")
OUTPUT_VIDEO_PUBLIC = os.path.join(ASSETS_DIR, "phuket-90s-mtv.mp4")
OUTPUT_VIDEO_ROOT = os.path.join(ROOT_DIR, "phuket-90s-mtv.mp4")
OUTPUT_VIDEO_ALT = "/Users/ymg/PhuketTatili/phuket-90s-mtv.mp4"
AUDIO_TEMP_PATH = "/tmp/phuket_90s_audio.wav"

FONT_BOLD_PATH = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
FONT_REG_PATH = "/System/Library/Fonts/Supplemental/Arial.ttf"

# Fonts
font_vhs = ImageFont.truetype(FONT_BOLD_PATH, 24)
font_huge = ImageFont.truetype(FONT_BOLD_PATH, 74)
font_title = ImageFont.truetype(FONT_BOLD_PATH, 42)
font_badge = ImageFont.truetype(FONT_BOLD_PATH, 22)
font_note = ImageFont.truetype(FONT_BOLD_PATH, 24)
font_sub = ImageFont.truetype(FONT_REG_PATH, 20)
font_step = ImageFont.truetype(FONT_BOLD_PATH, 18)
font_cta = ImageFont.truetype(FONT_BOLD_PATH, 48)

# 90s MTV Palette
C_BLACK = (10, 10, 15, 255)
C_WHITE = (255, 255, 255, 255)
C_NEON_YELLOW = (255, 240, 0, 255)
C_NEON_PINK = (255, 20, 130, 255)
C_NEON_CYAN = (0, 235, 255, 255)
C_NEON_ORANGE = (255, 90, 20, 255)
C_NEON_LIME = (50, 255, 100, 255)
C_PURPLE = (120, 30, 220, 255)

# -------------------------------------------------------------
# 1. 1990'LAR BIG BEAT & ACID FUNK MÜZİK MOTORU
# -------------------------------------------------------------
def generate_90s_soundtrack(output_path, duration_sec=DURATION_SEC, sample_rate=44100):
    print("🥁 1990'lar Big Beat, Breakbeat ve Acid House müziği sentezleniyor...")
    num_samples = int(duration_sec * sample_rate)
    left = [0.0] * num_samples
    right = [0.0] * num_samples

    bpm = 130.0
    beat_len = 60.0 / bpm # ~0.461s
    total_beats = int(duration_sec / beat_len)

    def note_freq(midi):
        return 440.0 * (2.0 ** ((midi - 69) / 12.0))

    # Big Beat Davul Ritim Döngüsü (Ağır kick, güçlü snare ve sallanan hi-hat'ler)
    for b in range(total_beats):
        t_b = b * beat_len
        # KICK (Beat 0 ve senkoplu 2.75)
        kick_times = [t_b]
        if b % 2 == 1:
            kick_times.append(t_b + beat_len * 0.75)
        else:
            kick_times.append(t_b + beat_len * 0.5)

        for kt in kick_times:
            s_idx = int(kt * sample_rate)
            k_len = int(0.2 * sample_rate)
            for s in range(k_len):
                idx = s_idx + s
                if idx >= num_samples: break
                t = s / sample_rate
                f = 160.0 * math.exp(-32.0 * t) + 42.0
                val = math.sin(2 * math.pi * f * t) * math.exp(-11.0 * t) * 0.65
                left[idx] += val
                right[idx] += val

        # SNARE (Beat 0.5 - kuvvetli 90s crack snare)
        snare_t = t_b + beat_len * 0.5
        s_idx = int(snare_t * sample_rate)
        sn_len = int(0.22 * sample_rate)
        for s in range(sn_len):
            idx = s_idx + s
            if idx >= num_samples: break
            t = s / sample_rate
            noise = random.uniform(-1, 1) * math.exp(-16.0 * t) * 0.45
            body = math.sin(2 * math.pi * 210 * t) * math.exp(-22.0 * t) * 0.38
            val = noise + body
            left[idx] += val
            right[idx] += val

        # HI-HATS (16'lık funk groove)
        for sub in range(4):
            hat_t = t_b + sub * (beat_len / 4.0) + (0.012 if sub % 2 == 1 else 0.0)
            h_idx = int(hat_t * sample_rate)
            is_open = (sub == 2)
            h_len = int((0.14 if is_open else 0.04) * sample_rate)
            vol = 0.22 if is_open else 0.12
            for s in range(h_len):
                idx = h_idx + s
                if idx >= num_samples: break
                t = s / sample_rate
                val = random.uniform(-1, 1) * math.exp((-16.0 if is_open else -55.0) * t) * vol
                left[idx] += val * 0.8
                right[idx] += val * 1.2

    # TB-303 Acid Bassline (Sawtooth + Rezonsanlı filtre süpürmesi)
    bass_notes = [
        # Am -> C -> D -> F riffleri
        36, 36, 48, 46, 39, 36, 48, 51,
        36, 36, 48, 46, 41, 43, 44, 46,
    ]
    step_dur = beat_len / 2.0
    for i, midi in enumerate(bass_notes * (int(duration_sec / (step_dur * len(bass_notes))) + 2)):
        t_note = i * step_dur
        if t_note >= duration_sec: break
        freq = note_freq(midi)
        s_idx = int(t_note * sample_rate)
        dur = int(0.3 * sample_rate)

        # Rezonsanslı filtre hareketi
        cutoff = 400 + 1200 * (0.5 + 0.5 * math.sin(i * 0.4))
        for s in range(dur):
            idx = s_idx + s
            if idx >= num_samples: break
            t = s / sample_rate
            # Testere dalgası harmonikleri
            sig = (math.sin(2 * math.pi * freq * t) +
                   0.6 * math.sin(4 * math.pi * freq * t) +
                   0.4 * math.sin(6 * math.pi * freq * t) +
                   0.25 * math.sin(8 * math.pi * freq * t))
            env = math.exp(-9.0 * t)
            val = sig * env * 0.26
            left[idx] += val * 0.55
            right[idx] += val * 0.45

    # 90'lar Rave Piyano Stablari (Korg M1 House akorları: Cmin -> Eb -> F -> Bb)
    piano_chords = [
        [60, 63, 67, 72], # Cm
        [63, 67, 70, 75], # Eb
        [65, 68, 72, 77], # F
        [58, 62, 65, 70], # Bb
    ]
    chord_len_beats = 4
    for cb in range(int(total_beats / chord_len_beats)):
        chord = piano_chords[cb % len(piano_chords)]
        t_chord = cb * chord_len_beats * beat_len
        # Senkoplu piyano basışları
        for off_beat in [0.0, 1.5, 2.5, 3.0]:
            t_stab = t_chord + off_beat * beat_len
            s_idx = int(t_stab * sample_rate)
            p_len = int(0.35 * sample_rate)
            for note in chord:
                freq = note_freq(note)
                for s in range(p_len):
                    idx = s_idx + s
                    if idx >= num_samples: break
                    t = s / sample_rate
                    env = math.exp(-7.0 * t)
                    val = (math.sin(2 * math.pi * freq * t) + 0.3 * math.sin(4 * math.pi * freq * t)) * env * 0.08
                    left[idx] += val * 0.6
                    right[idx] += val * 0.6

    # 90'lar Vinyl Scratch & Ses Efektleri
    scratch_cues = [
        (0.2, "scratch"),
        (5.1, "rewind"),
        (10.2, "scratch"),
        (15.6, "whoosh"),
        (21.1, "camera"),
        (26.2, "splash"),
        (31.0, "airhorn"),
    ]

    for t_cue, s_type in scratch_cues:
        s_idx = int(t_cue * sample_rate)
        if s_type in ["scratch", "rewind"]:
            dur = int(0.35 * sample_rate)
            for s in range(dur):
                idx = s_idx + s
                if idx >= num_samples: break
                t = s / sample_rate
                f = 800 * math.sin(2 * math.pi * 12 * t) + 400
                val = math.sin(2 * math.pi * f * t) * random.uniform(0.5, 1.0) * math.exp(-4.0 * t) * 0.35
                left[idx] += val
                right[idx] += val
        elif s_type == "camera":
            dur = int(0.2 * sample_rate)
            for s in range(dur):
                idx = s_idx + s
                if idx >= num_samples: break
                t = s / sample_rate
                val = random.uniform(-1, 1) * math.exp(-30.0 * t) * 0.4
                left[idx] += val
                right[idx] += val
        elif s_type == "airhorn":
            # Klasik 90'lar dancehall / rave hava kornası!
            dur = int(0.6 * sample_rate)
            for s in range(dur):
                idx = s_idx + s
                if idx >= num_samples: break
                t = s / sample_rate
                val = (math.sin(2 * math.pi * 466 * t) + math.sin(2 * math.pi * 587 * t)) * 0.35 * math.exp(-2.0 * t)
                left[idx] += val
                right[idx] += val

    # Master Çıkış & Fade
    out_frames = []
    for i in range(num_samples):
        t = i / sample_rate
        fade = 1.0
        if t < 0.5: fade = t / 0.5
        elif t > (duration_sec - 1.5): fade = max(0.0, (duration_sec - t) / 1.5)

        l = max(-0.95, min(0.95, left[i] * fade))
        r = max(-0.95, min(0.95, right[i] * fade))
        out_frames.append(struct.pack('<hh', int(l * 32767), int(r * 32767)))

    with wave.open(output_path, 'wb') as wav:
        wav.setnchannels(2)
        wav.setsampwidth(2)
        wav.setframerate(sample_rate)
        wav.writeframes(b''.join(out_frames))
    print(f"✅ 90'lar müziği üretildi: {output_path}")

# -------------------------------------------------------------
# 2. 1990'LAR MTV / ZINE KOLAJ GRAFİK MOTORU
# -------------------------------------------------------------
class MtvZineEngine:
    def __init__(self):
        print("📼 90'lar MTV grafik motoru varlıkları yüklüyor...")
        self.photos = {
            "transfer": Image.open(os.path.join(ASSETS_DIR, "culture.webp")).convert("RGBA"),
            "bangla": Image.open(os.path.join(ASSETS_DIR, "beachclub.webp")).convert("RGBA"),
            "phiphi": Image.open(os.path.join(ASSETS_DIR, "pileh.webp")).convert("RGBA"),
            "jamesbond": Image.open(os.path.join(ASSETS_DIR, "bay.webp")).convert("RGBA"),
            "coral": Image.open(os.path.join(ASSETS_DIR, "beach.webp")).convert("RGBA"),
            "elephant": Image.open(os.path.join(ASSETS_DIR, "elephant.webp")).convert("RGBA"),
        }
        self.logo_symbol = Image.open(os.path.join(ASSETS_DIR, "logo-symbol.png")).convert("RGBA")
        self.scanline_overlay = self.create_scanlines()
        print("✅ 90'lar motoru hazır.")

    def create_scanlines(self):
        """Otantik 90'lar CRT/VHS tarama çizgileri"""
        im = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
        d = ImageDraw.Draw(im)
        for y in range(0, HEIGHT, 4):
            d.line([(0, y), (WIDTH, y)], fill=(0, 0, 0, 45), width=2)
        return im

    def draw_vhs_osd(self, overlay, t_sec, label_text="PHUKET_TRIP.VHS"):
        """90'lar VHS kamera arayüzü (● REC, SP, Tarih, Saat)"""
        d = ImageDraw.Draw(overlay)

        # Yanıp sönen kırmızı kayıt noktası (1 Hz)
        is_rec_on = (int(t_sec * 2) % 2 == 0)
        if is_rec_on:
            d.ellipse([70, 45, 95, 70], fill=(255, 30, 30, 255))
        d.text((105, 46), "REC", font=font_vhs, fill=C_WHITE)
        d.text((170, 46), "[SP]  CH 03  STEREO", font=font_vhs, fill=(180, 240, 255, 255))

        # Sağ üst: Tarih ve Zaman Damgası
        sec_int = int(t_sec)
        d.text((WIDTH - 420, 46), f"OCT. 24 1996  14:{24 + (sec_int // 60):02d}:{sec_int % 60:02d}", font=font_vhs, fill=C_NEON_YELLOW)

        # Sol alt: Oynatma modu
        d.text((70, HEIGHT - 70), f"PLAY ▶  {label_text}", font=font_vhs, fill=C_WHITE)
        d.text((WIDTH - 240, HEIGHT - 70), "PHUKET TATİLİ", font=font_vhs, fill=C_NEON_CYAN)

    def draw_duct_tape(self, draw, x, y, w, h, angle_deg=0):
        """90'lar koli bandı / gaffer tape efekti"""
        tape_col = (225, 230, 240, 215)
        tape_outline = (130, 140, 160, 255)
        draw.polygon([(x, y), (x + w, y - 4), (x + w - 3, y + h), (x - 3, y + h + 4)], fill=tape_col, outline=tape_outline, width=2)
        # Bant kırışıklık çizgileri
        draw.line([(x + w // 3, y), (x + w // 3 + 2, y + h)], fill=(255, 255, 255, 160), width=1)
        draw.line([(x + 2 * w // 3, y - 2), (x + 2 * w // 3 - 2, y + h)], fill=(255, 255, 255, 160), width=1)

    def draw_polaroid_frame(self, draw, img_photo, x, y, pw, ph, tilt=0, label=""):
        """Torn polaroid fotoğraf çerçevesi ve el yazısı not"""
        # Beyaz polaroid çerçevesi
        border_top = 18
        border_sides = 18
        border_bot = 80

        frame_w = pw + border_sides * 2
        frame_h = ph + border_top + border_bot

        # Gölge
        draw.rounded_rectangle([x + 12, y + 12, x + frame_w + 12, y + frame_h + 12], radius=12, fill=(0, 0, 0, 180))
        # Beyaz gövde
        draw.rounded_rectangle([x, y, x + frame_w, y + frame_h], radius=12, fill=(250, 250, 245, 255), outline=C_BLACK, width=4)

        # Fotoğrafı yerleştir
        resized_photo = img_photo.resize((pw, ph), Image.Resampling.BILINEAR)
        # Çerçeveye monte et (ana tuval üzerine bindirme)
        return resized_photo, x + border_sides, y + border_top

    def draw_90s_zine_sticker(self, draw, x, y, text, bg_color=C_NEON_YELLOW, text_color=C_BLACK, rotate=0):
        """90'lar MTV tarzı kalın sticker etiketi"""
        tb = font_badge.getbbox(text)
        tw = tb[2] - tb[0]
        th = tb[3] - tb[1]
        pad_x, pad_y = 20, 10
        w = tw + pad_x * 2
        h = th + pad_y * 2

        # Siyah ofset gölge
        draw.rectangle([x + 6, y + 6, x + w + 6, y + h + 6], fill=C_BLACK)
        draw.rectangle([x, y, x + w, y + h], fill=bg_color, outline=C_BLACK, width=3)
        draw.text((x + pad_x, y + pad_y - 2), text, font=font_badge, fill=text_color)
        return w, h

    def draw_checkerboard(self, draw, x, y, w, h, size=16):
        """90'lar ska/grunge dama deseni"""
        for cx in range(x, x + w, size):
            for cy in range(y, y + h, size):
                if ((cx - x) // size + (cy - y) // size) % 2 == 0:
                    draw.rectangle([cx, cy, cx + size, cy + size], fill=C_WHITE)
                else:
                    draw.rectangle([cx, cy, cx + size, cy + size], fill=C_BLACK)

    # --- 6 SAHNE (90'LAR SEYAHAT GÜNLÜĞÜ) ---

    def render_scene_1_airport(self, progress, t_sec):
        """0.0s - 5.5s: 1. GÜN - Havalimanı İniş & VIP Transfer"""
        frame = Image.new("RGBA", (WIDTH, HEIGHT), (25, 20, 40, 255))
        d = ImageDraw.Draw(frame)

        # 90'lar geometrik zemin (mor & sarı üçgenler)
        d.polygon([(0, 0), (WIDTH // 2, 0), (0, HEIGHT)], fill=(45, 30, 75, 255))
        d.polygon([(WIDTH, 0), (WIDTH, HEIGHT // 2), (WIDTH // 2, HEIGHT)], fill=(65, 40, 95, 255))

        # Dama deseni şeridi
        self.draw_checkerboard(d, 0, 90, WIDTH, 24, size=24)

        # Fotoğrafı polaroid çerçeveye yerleştir
        pw, ph = 760, 500
        px, py = 120, 220
        d.rounded_rectangle([px + 12, py + 12, px + pw + 48, py + ph + 112], radius=16, fill=(0, 0, 0, 190))
        d.rounded_rectangle([px, py, px + pw + 36, py + ph + 100], radius=16, fill=(250, 250, 245, 255), outline=C_BLACK, width=5)

        crop_w = int(self.photos["transfer"].size[0] / (1.0 + 0.1 * progress))
        crop_h = int(self.photos["transfer"].size[1] / (1.0 + 0.1 * progress))
        sub_photo = self.photos["transfer"].crop((0, 0, crop_w, crop_h)).resize((pw, ph), Image.Resampling.BILINEAR)
        frame.alpha_composite(sub_photo, (px + 18, py + 18))

        # Koli bantları
        self.draw_duct_tape(d, px + 40, py - 15, 120, 35)
        self.draw_duct_tape(d, px + pw - 120, py - 15, 120, 35)

        # Polaroid altı notu
        d.text((px + 30, py + ph + 34), "PHUKET INTL AIRPORT '96 ➔ BAGGAGE CLAIM", font=font_note, fill=C_BLACK)

        # Sağ Taraf: 90'lar MTV Zine Kartları
        rx = 980
        self.draw_90s_zine_sticker(d, rx, 220, "STAGE 01 // ARRIVAL & VIP TRANSFER", bg_color=C_NEON_YELLOW, text_color=C_BLACK)

        # Büyük Başlık
        d.rectangle([rx + 6, 296, rx + 846, 396], fill=C_BLACK)
        d.rectangle([rx, 290, rx + 840, 390], fill=C_NEON_PINK, outline=C_WHITE, width=4)
        d.text((rx + 24, 310), "UÇAK İNDİ, MACERA BAŞLADI!", font=font_title, fill=C_WHITE)

        # El Yazısı Not Kartı
        d.rectangle([rx + 8, 438, rx + 848, 678], fill=C_BLACK)
        d.rectangle([rx, 430, rx + 840, 670], fill=(255, 255, 255, 245), outline=C_BLACK, width=4)
        d.text((rx + 30, 460), "✈️  Pasaporttan çıktık, ismimiz yazılı tabelayla karşılandık!", font=font_note, fill=C_BLACK)
        d.text((rx + 30, 510), "🚗  Klimalı özel VIP minibüs bavulları aldı, doğruca otele.", font=font_sub, fill=(50, 50, 50, 255))
        d.text((rx + 30, 560), "🌴  Dışarıda 32 derece tropik rüzgar esiyor!", font=font_sub, fill=(50, 50, 50, 255))
        d.text((rx + 30, 610), "⚡  Akşam için rota belli: Efsane Bangla Road!", font=font_note, fill=C_NEON_ORANGE)

        # Bagaj etiketi
        d.rounded_rectangle([rx + 540, 710, rx + 840, 790], radius=14, fill=C_NEON_CYAN, outline=C_BLACK, width=3)
        d.text((rx + 560, 725), "IST ➔ HKT // PASSENGER", font=font_badge, fill=C_BLACK)
        d.text((rx + 560, 755), "VIP CONCIERGE APPROVED", font=font_step, fill=(40, 40, 40, 255))

        # VHS OSD
        frame.alpha_composite(self.scanline_overlay)
        self.draw_vhs_osd(frame, t_sec, label_text="TAPE_01 // AIRPORT_ARRIVAL")
        return frame

    def render_scene_2_bangla(self, progress, t_sec):
        """5.5s - 11.0s: 1. GÜN AKŞAMI - Bangla Road Neon Kaosu"""
        frame = Image.new("RGBA", (WIDTH, HEIGHT), (15, 10, 25, 255))
        d = ImageDraw.Draw(frame)

        # Çapraz neon çizgiler
        for i in range(-5, 15):
            x_line = i * 180 + int(progress * 60)
            d.line([(x_line, 0), (x_line + 400, HEIGHT)], fill=(35, 15, 55, 255), width=40)

        self.draw_checkerboard(d, 0, 90, WIDTH, 24, size=24)

        pw, ph = 760, 500
        px, py = 120, 220
        d.rounded_rectangle([px + 12, py + 12, px + pw + 48, py + ph + 112], radius=16, fill=(0, 0, 0, 190))
        d.rounded_rectangle([px, py, px + pw + 36, py + ph + 100], radius=16, fill=(250, 250, 245, 255), outline=C_BLACK, width=5)

        crop_w = int(self.photos["bangla"].size[0] / (1.0 + 0.12 * progress))
        crop_h = int(self.photos["bangla"].size[1] / (1.0 + 0.12 * progress))
        sub_photo = self.photos["bangla"].crop((0, 0, crop_w, crop_h)).resize((pw, ph), Image.Resampling.BILINEAR)
        frame.alpha_composite(sub_photo, (px + 18, py + 18))

        self.draw_duct_tape(d, px + 50, py - 15, 130, 35)
        self.draw_duct_tape(d, px + pw - 130, py - 15, 130, 35)
        d.text((px + 30, py + ph + 34), "BANGLA ROAD '96 ➔ SENSORY OVERLOAD!", font=font_note, fill=C_BLACK)

        rx = 980
        self.draw_90s_zine_sticker(d, rx, 220, "STAGE 02 // PATONG NIGHTLIFE & STREET FOOD", bg_color=C_NEON_PINK, text_color=C_WHITE)

        d.rectangle([rx + 6, 296, rx + 846, 396], fill=C_BLACK)
        d.rectangle([rx, 290, rx + 840, 390], fill=C_NEON_YELLOW, outline=C_BLACK, width=4)
        d.text((rx + 24, 310), "BANGLA ROAD IŞIKLARI & PARTİ! 🎆", font=font_title, fill=C_BLACK)

        d.rectangle([rx + 8, 438, rx + 848, 678], fill=C_BLACK)
        d.rectangle([rx, 430, rx + 840, 670], fill=(255, 255, 255, 245), outline=C_BLACK, width=4)
        d.text((rx + 30, 460), "🔥  Sokak tamamen yayalara kapalı, enerji tavan!", font=font_note, fill=C_BLACK)
        d.text((rx + 30, 510), "🍸  Canlı rock barları, neon tabelalar ve tropik kokteyller.", font=font_sub, fill=(50, 50, 50, 255))
        d.text((rx + 30, 560), "🍜  Sokakta taze Pad Thai ve çıtır Mango Sticky Rice!", font=font_sub, fill=(50, 50, 50, 255))
        d.text((rx + 30, 610), "🏝️  Yarın sabah: Turkuaz efsane Phi Phi çıkarması!", font=font_note, fill=C_NEON_PINK)

        self.draw_90s_zine_sticker(d, rx + 450, 710, "⚡ NO FILTER NEEDED // 100% PURE VIBE", bg_color=C_NEON_LIME, text_color=C_BLACK)

        frame.alpha_composite(self.scanline_overlay)
        self.draw_vhs_osd(frame, t_sec, label_text="TAPE_02 // BANGLA_NEON_NIGHTS")
        return frame

    def render_scene_3_phiphi(self, progress, t_sec):
        """11.0s - 16.5s: 2. GÜN - Phi Phi Adaları & Maya Bay"""
        frame = Image.new("RGBA", (WIDTH, HEIGHT), (10, 35, 50, 255))
        d = ImageDraw.Draw(frame)

        # Turkuaz ve sarı pop-art arka plan
        d.polygon([(0, 0), (WIDTH, 0), (WIDTH // 2, HEIGHT)], fill=(0, 75, 110, 255))
        self.draw_checkerboard(d, 0, 90, WIDTH, 24, size=24)

        pw, ph = 760, 500
        px, py = 120, 220
        d.rounded_rectangle([px + 12, py + 12, px + pw + 48, py + ph + 112], radius=16, fill=(0, 0, 0, 190))
        d.rounded_rectangle([px, py, px + pw + 36, py + ph + 100], radius=16, fill=(250, 250, 245, 255), outline=C_BLACK, width=5)

        crop_w = int(self.photos["phiphi"].size[0] / (1.0 + 0.15 * progress))
        crop_h = int(self.photos["phiphi"].size[1] / (1.0 + 0.15 * progress))
        sub_photo = self.photos["phiphi"].crop((0, 0, crop_w, crop_h)).resize((pw, ph), Image.Resampling.BILINEAR)
        frame.alpha_composite(sub_photo, (px + 18, py + 18))

        self.draw_duct_tape(d, px + 50, py - 15, 130, 35)
        self.draw_duct_tape(d, px + pw - 130, py - 15, 130, 35)
        d.text((px + 30, py + ph + 34), "PILEH LAGOON '96 ➔ TURQUOISE PARADISE!", font=font_note, fill=C_BLACK)

        rx = 980
        self.draw_90s_zine_sticker(d, rx, 220, "STAGE 03 // THE BEACH & PILEH LAGOON", bg_color=C_NEON_CYAN, text_color=C_BLACK)

        d.rectangle([rx + 6, 296, rx + 846, 396], fill=C_BLACK)
        d.rectangle([rx, 290, rx + 840, 390], fill=C_NEON_ORANGE, outline=C_WHITE, width=4)
        d.text((rx + 24, 310), "PHİ PHİ & ZÜMRÜT LAGÜN! 🏝️", font=font_title, fill=C_WHITE)

        d.rectangle([rx + 8, 438, rx + 848, 678], fill=C_BLACK)
        d.rectangle([rx, 430, rx + 840, 670], fill=(255, 255, 255, 245), outline=C_BLACK, width=4)
        d.text((rx + 30, 460), "🏊  Tekneden lagüne atladık, su cam gibi berrak!", font=font_note, fill=C_BLACK)
        d.text((rx + 30, 510), "⚡  VIP Sürat teknesi ile kalabalıkları geride bıraktık.", font=font_sub, fill=(50, 50, 50, 255))
        d.text((rx + 30, 560), "🐠  Şnorkelle rengarenk mercan ve tropik balık sürüleri.", font=font_sub, fill=(50, 50, 50, 255))
        d.text((rx + 30, 610), "🛶  Sırada: 007 James Bond Adası kano safarisi!", font=font_note, fill=C_NEON_ORANGE)

        self.draw_90s_zine_sticker(d, rx + 440, 710, "★ 100% CRYSTAL CLEAR WATER", bg_color=C_NEON_YELLOW, text_color=C_BLACK)

        frame.alpha_composite(self.scanline_overlay)
        self.draw_vhs_osd(frame, t_sec, label_text="TAPE_03 // PHI_PHI_ISLANDS")
        return frame

    def render_scene_4_jamesbond(self, progress, t_sec):
        """16.5s - 22.0s: 3. GÜN - James Bond Adası & Kano Safarisi"""
        frame = Image.new("RGBA", (WIDTH, HEIGHT), (35, 25, 20, 255))
        d = ImageDraw.Draw(frame)

        d.polygon([(0, HEIGHT), (WIDTH // 2, 0), (WIDTH, HEIGHT)], fill=(60, 40, 25, 255))
        self.draw_checkerboard(d, 0, 90, WIDTH, 24, size=24)

        pw, ph = 760, 500
        px, py = 120, 220
        d.rounded_rectangle([px + 12, py + 12, px + pw + 48, py + ph + 112], radius=16, fill=(0, 0, 0, 190))
        d.rounded_rectangle([px, py, px + pw + 36, py + ph + 100], radius=16, fill=(250, 250, 245, 255), outline=C_BLACK, width=5)

        crop_w = int(self.photos["jamesbond"].size[0] / (1.0 + 0.12 * progress))
        crop_h = int(self.photos["jamesbond"].size[1] / (1.0 + 0.12 * progress))
        sub_photo = self.photos["jamesbond"].crop((0, 0, crop_w, crop_h)).resize((pw, ph), Image.Resampling.BILINEAR)
        frame.alpha_composite(sub_photo, (px + 18, py + 18))

        self.draw_duct_tape(d, px + 50, py - 15, 130, 35)
        self.draw_duct_tape(d, px + pw - 130, py - 15, 130, 35)
        d.text((px + 30, py + ph + 34), "PHANG NGA BAY '96 ➔ TOP SECRET CAVES", font=font_note, fill=C_BLACK)

        rx = 980
        self.draw_90s_zine_sticker(d, rx, 220, "STAGE 04 // 007 JAMES BOND & SEA CAVES", bg_color=C_NEON_YELLOW, text_color=C_BLACK)

        d.rectangle([rx + 6, 296, rx + 846, 396], fill=C_BLACK)
        d.rectangle([rx, 290, rx + 840, 390], fill=C_PURPLE, outline=C_NEON_CYAN, width=4)
        d.text((rx + 24, 310), "007 JAMES BOND & KANO SAFARİ! 🛶", font=font_title, fill=C_WHITE)

        d.rectangle([rx + 8, 438, rx + 848, 678], fill=C_BLACK)
        d.rectangle([rx, 430, rx + 840, 670], fill=(255, 255, 255, 245), outline=C_BLACK, width=4)
        d.text((rx + 30, 460), "🕶️  Dev kayalıkların içindeki gizli deniz tünelleri!", font=font_note, fill=C_BLACK)
        d.text((rx + 30, 510), "🛶  Özel kano rehberimizle sessiz lagünlere süzüldük.", font=font_sub, fill=(50, 50, 50, 255))
        d.text((rx + 30, 560), "📸  İkonik James Bond mantar kayası önünde çekimler.", font=font_sub, fill=(50, 50, 50, 255))
        d.text((rx + 30, 610), "🥥  Sırada: Bembeyaz mercan adaları ve dinlenme!", font=font_note, fill=C_PURPLE)

        self.draw_90s_zine_sticker(d, rx + 460, 710, "⚡ AGENT 007 MISSION ACCOMPLISHED", bg_color=C_NEON_CYAN, text_color=C_BLACK)

        frame.alpha_composite(self.scanline_overlay)
        self.draw_vhs_osd(frame, t_sec, label_text="TAPE_04 // JAMES_BOND_CAVES")
        return frame

    def render_scene_5_coral(self, progress, t_sec):
        """22.0s - 27.5s: 4. GÜN - Diğer Adalar (Coral & Racha / Similan)"""
        frame = Image.new("RGBA", (WIDTH, HEIGHT), (20, 45, 30, 255))
        d = ImageDraw.Draw(frame)

        d.polygon([(0, 0), (WIDTH, HEIGHT // 2), (0, HEIGHT)], fill=(30, 75, 50, 255))
        self.draw_checkerboard(d, 0, 90, WIDTH, 24, size=24)

        pw, ph = 760, 500
        px, py = 120, 220
        d.rounded_rectangle([px + 12, py + 12, px + pw + 48, py + ph + 112], radius=16, fill=(0, 0, 0, 190))
        d.rounded_rectangle([px, py, px + pw + 36, py + ph + 100], radius=16, fill=(250, 250, 245, 255), outline=C_BLACK, width=5)

        crop_w = int(self.photos["coral"].size[0] / (1.0 + 0.12 * progress))
        crop_h = int(self.photos["coral"].size[1] / (1.0 + 0.12 * progress))
        sub_photo = self.photos["coral"].crop((0, 0, crop_w, crop_h)).resize((pw, ph), Image.Resampling.BILINEAR)
        frame.alpha_composite(sub_photo, (px + 18, py + 18))

        self.draw_duct_tape(d, px + 50, py - 15, 130, 35)
        self.draw_duct_tape(d, px + pw - 130, py - 15, 130, 35)
        d.text((px + 30, py + ph + 34), "CORAL & RACHA ISLANDS '96 ➔ TOTAL CHILL", font=font_note, fill=C_BLACK)

        rx = 980
        self.draw_90s_zine_sticker(d, rx, 220, "STAGE 05 // CORAL & RACHA ISLANDS", bg_color=C_NEON_LIME, text_color=C_BLACK)

        d.rectangle([rx + 6, 296, rx + 846, 396], fill=C_BLACK)
        d.rectangle([rx, 290, rx + 840, 390], fill=C_NEON_CYAN, outline=C_BLACK, width=4)
        d.text((rx + 24, 310), "BEYAZ KUM & DİNLENME CENNETİ 🥥", font=font_title, fill=C_BLACK)

        d.rectangle([rx + 8, 438, rx + 848, 678], fill=C_BLACK)
        d.rectangle([rx, 430, rx + 840, 670], fill=(255, 255, 255, 245), outline=C_BLACK, width=4)
        d.text((rx + 30, 460), "🏝️  Pudra beyazı kumsal, palmiyeler ve şezlong keyfi.", font=font_note, fill=C_BLACK)
        d.text((rx + 30, 510), "🥥  Taze hindistan cevizimizi yudumlayıp dinlendik.", font=font_sub, fill=(50, 50, 50, 255))
        d.text((rx + 30, 560), "🤿  Sığ resifte deniz kaplumbağaları ve mercanlar.", font=font_sub, fill=(50, 50, 50, 255))
        d.text((rx + 30, 610), "🐘  Ve son gün: Dev dostlarla fil safari barınağı!", font=font_note, fill=C_NEON_PINK)

        self.draw_90s_zine_sticker(d, rx + 440, 710, "✨ 100% PURE ISLAND FEVER", bg_color=C_NEON_ORANGE, text_color=C_WHITE)

        frame.alpha_composite(self.scanline_overlay)
        self.draw_vhs_osd(frame, t_sec, label_text="TAPE_05 // CORAL_ISLANDS")
        return frame

    def render_scene_6_elephant(self, progress, t_sec):
        """27.5s - 32.0s: 5. GÜN - Etik Fil Barınağı & Çamur Banyosu"""
        frame = Image.new("RGBA", (WIDTH, HEIGHT), (20, 30, 25, 255))
        d = ImageDraw.Draw(frame)

        d.polygon([(0, 0), (WIDTH // 2, HEIGHT), (WIDTH, 0)], fill=(40, 60, 35, 255))
        self.draw_checkerboard(d, 0, 90, WIDTH, 24, size=24)

        pw, ph = 760, 500
        px, py = 120, 220
        d.rounded_rectangle([px + 12, py + 12, px + pw + 48, py + ph + 112], radius=16, fill=(0, 0, 0, 190))
        d.rounded_rectangle([px, py, px + pw + 36, py + ph + 100], radius=16, fill=(250, 250, 245, 255), outline=C_BLACK, width=5)

        crop_w = int(self.photos["elephant"].size[0] / (1.0 + 0.12 * progress))
        crop_h = int(self.photos["elephant"].size[1] / (1.0 + 0.12 * progress))
        sub_photo = self.photos["elephant"].crop((0, 0, crop_w, crop_h)).resize((pw, ph), Image.Resampling.BILINEAR)
        frame.alpha_composite(sub_photo, (px + 18, py + 18))

        self.draw_duct_tape(d, px + 50, py - 15, 130, 35)
        self.draw_duct_tape(d, px + pw - 130, py - 15, 130, 35)
        d.text((px + 30, py + ph + 34), "ETHICAL ELEPHANT SANCTUARY '96 ➔ MUD SPA", font=font_note, fill=C_BLACK)

        rx = 980
        self.draw_90s_zine_sticker(d, rx, 220, "STAGE 06 // ETHICAL ELEPHANTS & MUD SPA", bg_color=C_NEON_YELLOW, text_color=C_BLACK)

        d.rectangle([rx + 6, 296, rx + 846, 396], fill=C_BLACK)
        d.rectangle([rx, 290, rx + 840, 390], fill=C_NEON_PINK, outline=C_WHITE, width=4)
        d.text((rx + 24, 310), "DEV FİLLERLE ÇAMUR BANYOSU! 🐘", font=font_title, fill=C_WHITE)

        d.rectangle([rx + 8, 438, rx + 848, 678], fill=C_BLACK)
        d.rectangle([rx, 430, rx + 840, 670], fill=(255, 255, 255, 245), outline=C_BLACK, width=4)
        d.text((rx + 30, 460), "🌿  Sıfır zincir, sıfır eziyet: %100 etik koruma barınağı!", font=font_note, fill=C_BLACK)
        d.text((rx + 30, 510), "🍉  Kendi ellerimizle muz ve karpuz sepetleri yedirdik.", font=font_sub, fill=(50, 50, 50, 255))
        d.text((rx + 30, 560), "💦  Çamur havuzuna girip hortumlarıyla yıkandık!", font=font_sub, fill=(50, 50, 50, 255))
        d.text((rx + 30, 610), "❤️  Tatilimizin en duygusal ve eğlenceli finali oldu!", font=font_note, fill=C_NEON_ORANGE)

        self.draw_90s_zine_sticker(d, rx + 440, 710, "💚 100% UNCHAINED & HAPPY", bg_color=C_NEON_LIME, text_color=C_BLACK)

        frame.alpha_composite(self.scanline_overlay)
        self.draw_vhs_osd(frame, t_sec, label_text="TAPE_06 // ELEPHANT_MUD_BATH")
        return frame

    def render_scene_7_outro(self, progress, t_sec):
        """32.0s - 35.0s: BÜYÜK KAPANIŞ - 90'lar MTV Kaseti & WhatsApp Hot-Line"""
        frame = Image.new("RGBA", (WIDTH, HEIGHT), (12, 10, 25, 255))
        d = ImageDraw.Draw(frame)

        # 90'lar MTV geometrik arka plan
        for x in range(0, WIDTH, 80):
            d.line([(x, 0), (x, HEIGHT)], fill=(25, 20, 45, 255), width=2)
        for y in range(0, HEIGHT, 80):
            d.line([(0, y), (WIDTH, y)], fill=(25, 20, 45, 255), width=2)

        self.draw_checkerboard(d, 0, 90, WIDTH, 24, size=24)

        # Merkez 90'lar Kaset / Konsol Kutusu
        box_w = 1200
        box_h = 680
        bx = (WIDTH - box_w) // 2
        by = 170

        d.rectangle([bx + 12, by + 12, bx + box_w + 12, by + box_h + 12], fill=C_BLACK)
        d.rectangle([bx, by, bx + box_w, by + box_h], fill=(20, 15, 35, 255), outline=C_NEON_YELLOW, width=6)

        # MTV Rozeti
        self.draw_90s_zine_sticker(d, bx + 40, by + 35, "★ MISSION COMPLETE: PHUKET UNCUT ★", bg_color=C_NEON_PINK, text_color=C_WHITE)

        # Başlık
        head_text = "Senin 90'lar Phuket Maceran Başlasın!"
        hb = font_huge.getbbox(head_text)
        hw = hb[2] - hb[0]
        d.text(((WIDTH - hw) // 2, by + 90), head_text, font=font_huge, fill=C_NEON_CYAN)

        sub_text = "Havalimanından otele, Bangla Road'dan Phi Phi, James Bond, adalara ve fillere kadar her günün hazır!"
        sb = font_badge.getbbox(sub_text)
        sw = sb[2] - sb[0]
        d.text(((WIDTH - sw) // 2, by + 185), sub_text, font=font_badge, fill=C_WHITE)

        # Büyük WhatsApp Aksiyon Kartı
        bounce = 1.0 + 0.03 * math.sin(progress * math.pi * 6)
        bw = int(820 * bounce)
        bh = int(140 * bounce)
        card_x = (WIDTH - bw) // 2
        card_y = by + 240

        d.rectangle([card_x + 8, card_y + 8, card_x + bw + 8, card_y + bh + 8], fill=C_BLACK)
        d.rectangle([card_x, card_y, card_x + bw, card_y + bh], fill=C_NEON_LIME, outline=C_WHITE, width=5)

        d.text((card_x + 40, card_y + 24), "💬 WhatsApp 7/24 Türkçe Planlama Hattı", font=font_badge, fill=C_BLACK)
        d.text((card_x + 40, card_y + 60), "+66 82 895 0665", font=font_cta, fill=C_BLACK)
        d.text((card_x + bw - 240, card_y + 54), "ROTANI BAŞLAT →", font=font_title, fill=C_BLACK)

        # 4 Güvence Damgası
        badges = ["🇹🇷 7/24 Türkçe Destek", "📝 Yazılı Fiyat Güvencesi", "🚗 Havalimanı Karşılama", "⚡ Sıfır Stres Planlama"]
        bw_tot = 1100
        for i, b_t in enumerate(badges):
            cx = (WIDTH - bw_tot) // 2 + i * (bw_tot // 4)
            d.rectangle([cx, by + 430, cx + (bw_tot // 4) - 16, by + 485], fill=(35, 25, 55, 255), outline=C_NEON_CYAN, width=2)
            d.text((cx + 12, by + 448), b_t, font=font_step, fill=C_WHITE)

        # Web Adresi
        d.rectangle([(WIDTH - 540) // 2, by + 530, (WIDTH + 540) // 2, by + 600], fill=C_NEON_ORANGE, outline=C_BLACK, width=3)
        web_text = "🌐  WWW.PHUKETTATILI.COM"
        wb = font_title.getbbox(web_text)
        ww = wb[2] - wb[0]
        d.text(((WIDTH - ww) // 2, by + 542), web_text, font=font_title, fill=C_WHITE)

        frame.alpha_composite(self.scanline_overlay)
        self.draw_vhs_osd(frame, t_sec, label_text="TAPE_END // BOOK_YOUR_TRIP")
        return frame

    def render_frame(self, frame_idx):
        t = frame_idx / FPS
        FADE = 0.3

        # Zamanlama (saniye):
        # 1. Airport (0.0 -> 5.5)
        # 2. Bangla (5.5 -> 11.0)
        # 3. Phi Phi (11.0 -> 16.5)
        # 4. James Bond (16.5 -> 22.0)
        # 5. Coral (22.0 -> 27.5)
        # 6. Elephant (27.5 -> 32.0)
        # 7. Outro (32.0 -> 35.0)

        if t < 5.5:
            p = t / 5.5
            curr = self.render_scene_1_airport(p, t)
            if t > (5.5 - FADE):
                return Image.blend(curr, self.render_scene_2_bangla(0.0, t), (t - (5.5 - FADE)) / FADE)
            return curr

        elif t < 11.0:
            p = (t - 5.5) / 5.5
            curr = self.render_scene_2_bangla(p, t)
            if t > (11.0 - FADE):
                return Image.blend(curr, self.render_scene_3_phiphi(0.0, t), (t - (11.0 - FADE)) / FADE)
            return curr

        elif t < 16.5:
            p = (t - 11.0) / 5.5
            curr = self.render_scene_3_phiphi(p, t)
            if t > (16.5 - FADE):
                return Image.blend(curr, self.render_scene_4_jamesbond(0.0, t), (t - (16.5 - FADE)) / FADE)
            return curr

        elif t < 22.0:
            p = (t - 16.5) / 5.5
            curr = self.render_scene_4_jamesbond(p, t)
            if t > (22.0 - FADE):
                return Image.blend(curr, self.render_scene_5_coral(0.0, t), (t - (22.0 - FADE)) / FADE)
            return curr

        elif t < 27.5:
            p = (t - 22.0) / 5.5
            curr = self.render_scene_5_coral(p, t)
            if t > (27.5 - FADE):
                return Image.blend(curr, self.render_scene_6_elephant(0.0, t), (t - (27.5 - FADE)) / FADE)
            return curr

        elif t < 32.0:
            p = (t - 27.5) / 4.5
            curr = self.render_scene_6_elephant(p, t)
            if t > (32.0 - FADE):
                return Image.blend(curr, self.render_scene_7_outro(0.0, t), (t - (32.0 - FADE)) / FADE)
            return curr

        else:
            p = (t - 32.0) / 3.0
            return self.render_scene_7_outro(p, t)


def main():
    print("=" * 65)
    print("📼 PHUKET TATİLİ - 1990'LAR MTV / ZINE KOLAJ VİDEO MOTORU")
    print(f"Çözünürlük: {WIDTH}x{HEIGHT} @ {FPS} FPS | Süre: {DURATION_SEC} sn ({TOTAL_FRAMES} kare)")
    print("=" * 65)

    generate_90s_soundtrack(AUDIO_TEMP_PATH, duration_sec=DURATION_SEC)

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

    engine = MtvZineEngine()
    print(f"📽️  90'lar MTV kolaj kareleri işleniyor ({TOTAL_FRAMES} kare)...")
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

    import shutil
    try:
        shutil.copyfile(OUTPUT_VIDEO_PUBLIC, OUTPUT_VIDEO_ROOT)
        shutil.copyfile(OUTPUT_VIDEO_PUBLIC, OUTPUT_VIDEO_ALT)
    except Exception as e:
        print("Kopyalama uyarısı:", e)

    print("=" * 65)
    print("🎉 1990'LAR MTV VİDEOSU BAŞARIYLA TAMAMLANDI!")
    print(f"📁 Web Varlık Yolu: {OUTPUT_VIDEO_PUBLIC}")
    print(f"📁 Proje Kök Yolu:  {OUTPUT_VIDEO_ROOT}")
    print(f"📁 PhuketTatili:    {OUTPUT_VIDEO_ALT}")
    print("=" * 65)

if __name__ == "__main__":
    main()
