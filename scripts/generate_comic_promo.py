#!/usr/bin/env python3
"""
Phuket Tatili - Hikayeleştirilmiş Karikatür Tanıtım Videosu Üretici
1920x1080 Full HD @ 30 FPS, 35 Saniye Çizgi Roman / Karikatür Hikaye Akışı
Akış: Havalimanı VIP Transfer -> Otel -> Phi Phi Adaları -> Bangla Road Gece Hayatı -> James Bond Kano -> Fil Safari -> Final
Pillow (Çizgi Roman Grafikleri & Konuşma Balonları) + Python Wave (Neşeli Tropik Beat & SFX) + FFmpeg
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
DURATION_SEC = 35
TOTAL_FRAMES = FPS * DURATION_SEC

ROOT_DIR = "/Users/ymg/Downloads/PhuketTatili2"
ASSETS_DIR = os.path.join(ROOT_DIR, "public/assets")
OUTPUT_VIDEO_PUBLIC = os.path.join(ASSETS_DIR, "phuket-hikayesi-karikatur.mp4")
OUTPUT_VIDEO_ROOT = os.path.join(ROOT_DIR, "phuket-hikayesi-karikatur.mp4")
OUTPUT_VIDEO_ALT = "/Users/ymg/PhuketTatili/phuket-hikayesi-karikatur.mp4"
AUDIO_TEMP_PATH = "/tmp/phuket_comic_audio.wav"

FONT_BOLD_PATH = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
FONT_REG_PATH = "/System/Library/Fonts/Supplemental/Arial.ttf"

# Font instances
font_huge = ImageFont.truetype(FONT_BOLD_PATH, 68)
font_burst = ImageFont.truetype(FONT_BOLD_PATH, 42)
font_header_title = ImageFont.truetype(FONT_BOLD_PATH, 36)
font_header_sub = ImageFont.truetype(FONT_BOLD_PATH, 22)
font_speaker = ImageFont.truetype(FONT_BOLD_PATH, 20)
font_bubble = ImageFont.truetype(FONT_BOLD_PATH, 26)
font_bubble_sub = ImageFont.truetype(FONT_REG_PATH, 22)
font_stamp = ImageFont.truetype(FONT_BOLD_PATH, 20)
font_step = ImageFont.truetype(FONT_BOLD_PATH, 16)
font_cta_btn = ImageFont.truetype(FONT_BOLD_PATH, 42)

# Comic Colors
COLOR_COMIC_YELLOW = (255, 230, 0, 255)
COLOR_COMIC_ORANGE = (255, 90, 30, 255)
COLOR_COMIC_PINK = (255, 45, 110, 255)
COLOR_COMIC_CYAN = (0, 215, 255, 255)
COLOR_COMIC_GREEN = (37, 211, 102, 255)
COLOR_COMIC_DARK = (15, 23, 42, 255)
COLOR_COMIC_WHITE = (255, 255, 255, 255)

def ease_out_elastic(t):
    """Karikatür tarzı zıplayarak yerleşme efekti"""
    p = 0.3
    return math.pow(2, -10 * t) * math.sin((t - p / 4) * (2 * math.pi) / p) + 1 if t < 1 else 1

def ease_out(t):
    t = max(0.0, min(1.0, t))
    return 1.0 - (1.0 - t) ** 3

# -------------------------------------------------------------
# 1. NEŞELİ TROPİK BEAT VE SES EFEKTLERİ SENTEZLEYİCİ
# -------------------------------------------------------------
def generate_comic_soundtrack(output_path, duration_sec=DURATION_SEC, sample_rate=44100):
    print("🎵 Neşeli çizgi film tarzı tropik müzik ve ses efektleri sentezleniyor...")
    num_samples = int(duration_sec * sample_rate)
    left_channel = [0.0] * num_samples
    right_channel = [0.0] * num_samples

    def note_freq(midi_note):
        return 440.0 * (2.0 ** ((midi_note - 69) / 12.0))

    # Hızlı, enerjik tropik kalimba/ukulele ritmi (125 BPM)
    # Akorlar: C -> G -> Am -> F -> C -> G -> F -> G
    tempo = 125.0
    beat_dur = 60.0 / tempo # ~0.48 saniye
    chords = [
        # (root midi, notes)
        [60, 64, 67, 72], # C
        [59, 62, 67, 71], # G
        [57, 60, 64, 69], # Am
        [53, 57, 60, 65], # F
    ]

    total_beats = int(duration_sec / beat_dur)
    for b in range(total_beats):
        t_start = b * beat_dur
        chord = chords[(b // 4) % len(chords)]
        
        # 16'lık arpej notaları (enerjik adımlar)
        for sub in range(4):
            t_sub = t_start + sub * (beat_dur / 4.0)
            midi = chord[(b + sub) % len(chord)] + (12 if sub % 2 == 1 else 0)
            freq = note_freq(midi)
            start_idx = int(t_sub * sample_rate)
            note_len = int(0.35 * sample_rate)
            pan = -0.3 if sub % 2 == 0 else 0.3
            vel = 0.32 if sub == 0 else 0.22

            for i in range(note_len):
                idx = start_idx + i
                if idx >= num_samples: break
                t = i / sample_rate
                env = math.exp(-8.0 * t)
                val = (math.sin(2 * math.pi * freq * t) + 0.3 * math.sin(2 * math.pi * freq * 2 * t)) * env * vel
                left_channel[idx] += val * (1.0 - pan) * 0.5
                right_channel[idx] += val * (1.0 + pan) * 0.5

        # Bouncy Bas
        bass_midi = chord[0] - 12
        bass_freq = note_freq(bass_midi)
        start_idx = int(t_start * sample_rate)
        bass_len = int(0.4 * sample_rate)
        for i in range(bass_len):
            idx = start_idx + i
            if idx >= num_samples: break
            t = i / sample_rate
            env = math.exp(-5.0 * t)
            val = math.sin(2 * math.pi * bass_freq * t) * env * 0.28
            left_channel[idx] += val * 0.5
            right_channel[idx] += val * 0.5

    # Karikatüristik Ses Efektleri Ekleme (Her sahne geçişinde)
    sfx_cues = [
        (0.6, "horn"),     # 1. Sahne: Araba kornası / vroom
        (5.5, "splash"),   # 2. Sahne: Su sıçraması
        (10.5, "disco"),   # 3. Sahne: Neon zil / disco chime
        (16.5, "whoosh"),  # 4. Sahne: Kano mağara rüzgarı
        (22.5, "cute"),    # 5. Sahne: Sevimli pop / fil sevinci
        (28.5, "fanfare"), # 6. Sahne: Zafer akoru / CTA
    ]

    for t_sfx, sfx_type in sfx_cues:
        start_idx = int(t_sfx * sample_rate)
        if sfx_type == "horn":
            # Çift tonlu neşeli korna (587 Hz ve 740 Hz)
            dur = int(0.35 * sample_rate)
            for i in range(dur):
                idx = start_idx + i
                if idx >= num_samples: break
                t = i / sample_rate
                val = (math.sin(2 * math.pi * 587 * t) + math.sin(2 * math.pi * 740 * t)) * 0.3 * math.exp(-2.5 * t)
                left_channel[idx] += val
                right_channel[idx] += val
        elif sfx_type == "splash":
            # Su sesi (modüleli gürültü)
            dur = int(0.6 * sample_rate)
            for i in range(dur):
                idx = start_idx + i
                if idx >= num_samples: break
                t = i / sample_rate
                n = random.uniform(-1, 1) * math.exp(-4.0 * t) * 0.35
                left_channel[idx] += n
                right_channel[idx] += n
        elif sfx_type == "disco":
            # Synth chime (yükselen arpej)
            for step, f in enumerate([659, 880, 1174, 1567]):
                sub_start = start_idx + int(step * 0.08 * sample_rate)
                dur = int(0.3 * sample_rate)
                for i in range(dur):
                    idx = sub_start + i
                    if idx >= num_samples: break
                    t = i / sample_rate
                    val = math.sin(2 * math.pi * f * t) * 0.25 * math.exp(-6.0 * t)
                    left_channel[idx] += val
                    right_channel[idx] += val
        elif sfx_type == "whoosh":
            # Hızlı kano geçişi
            dur = int(0.45 * sample_rate)
            for i in range(dur):
                idx = start_idx + i
                if idx >= num_samples: break
                t = i / sample_rate
                freq = 200 + 800 * math.sin(math.pi * (t / 0.45))
                val = math.sin(2 * math.pi * freq * t) * 0.22 * math.sin(math.pi * (t / 0.45))
                left_channel[idx] += val
                right_channel[idx] += val
        elif sfx_type == "cute":
            # Sevimli karikatür zıplaması (cartoon boing)
            dur = int(0.4 * sample_rate)
            for i in range(dur):
                idx = start_idx + i
                if idx >= num_samples: break
                t = i / sample_rate
                freq = 300 + 400 * t + 80 * math.sin(2 * math.pi * 18 * t)
                val = math.sin(2 * math.pi * freq * t) * 0.35 * math.exp(-4.0 * t)
                left_channel[idx] += val
                right_channel[idx] += val
        elif sfx_type == "fanfare":
            # Büyük kapanış zafer akoru (C majör parlak zil)
            dur = int(1.8 * sample_rate)
            for freq in [523.25, 659.25, 783.99, 1046.50]:
                for i in range(dur):
                    idx = start_idx + i
                    if idx >= num_samples: break
                    t = i / sample_rate
                    val = math.sin(2 * math.pi * freq * t) * 0.2 * math.exp(-1.5 * t)
                    left_channel[idx] += val
                    right_channel[idx] += val

    # Master çıkış ve yumuşak fade
    frames = []
    for i in range(num_samples):
        t = i / sample_rate
        fade = 1.0
        if t < 0.8:
            fade = t / 0.8
        elif t > (duration_sec - 2.0):
            fade = max(0.0, (duration_sec - t) / 2.0)

        l = max(-0.95, min(0.95, left_channel[i] * fade))
        r = max(-0.95, min(0.95, right_channel[i] * fade))
        frames.append(struct.pack('<hh', int(l * 32767), int(r * 32767)))

    with wave.open(output_path, 'wb') as wav:
        wav.setnchannels(2)
        wav.setsampwidth(2)
        wav.setframerate(sample_rate)
        wav.writeframes(b''.join(frames))
    print(f"✅ Çizgi film müziği sentezlendi: {output_path}")

# -------------------------------------------------------------
# 2. ÇİZGİ ROMAN GRAFİK MOTORU
# -------------------------------------------------------------
class ComicRenderer:
    def __init__(self):
        print("🖼️  Çizgi roman varlıkları yükleniyor...")
        self.raw_images = {
            "transfer": Image.open(os.path.join(ASSETS_DIR, "culture.webp")).convert("RGBA"),
            "phiphi": Image.open(os.path.join(ASSETS_DIR, "pileh.webp")).convert("RGBA"),
            "bangla": Image.open(os.path.join(ASSETS_DIR, "beachclub.webp")).convert("RGBA"),
            "jamesbond": Image.open(os.path.join(ASSETS_DIR, "bay.webp")).convert("RGBA"),
            "elephant": Image.open(os.path.join(ASSETS_DIR, "elephant.webp")).convert("RGBA"),
            "final": Image.open(os.path.join(ASSETS_DIR, "beach.webp")).convert("RGBA"),
        }
        self.logo_symbol = Image.open(os.path.join(ASSETS_DIR, "logo-symbol.png")).convert("RGBA")
        print("✅ Çizgi roman motoru hazır.")

    def draw_comic_frame(self, base_img):
        """Çizgi roman çerçevesi (kalın dış kenarlık & köşe aksanları)"""
        d = ImageDraw.Draw(base_img)
        # Kalın siyah dış çerçeve
        d.rectangle([0, 0, WIDTH, HEIGHT], outline=(15, 23, 42, 255), width=18)
        # İç ince beyaz çizgi
        d.rectangle([18, 18, WIDTH - 18, HEIGHT - 18], outline=(255, 255, 255, 220), width=4)

    def draw_story_tracker(self, overlay, active_step=0):
        """Üst hikaye akış barı (Havalimanı -> Otel -> Phi Phi -> Bangla -> James Bond -> Fil Safari)"""
        d = ImageDraw.Draw(overlay)
        bar_w = WIDTH - 80
        bar_h = 60
        x = 40
        y = 30

        # Arka plan kutusu
        d.rounded_rectangle([x + 4, y + 4, x + bar_w + 4, y + bar_h + 4], radius=16, fill=(0, 0, 0, 180))
        d.rounded_rectangle([x, y, x + bar_w, y + bar_h], radius=16, fill=(15, 23, 42, 240), outline=(255, 255, 255, 120), width=2)

        steps = [
            ("🛬 1. İniş & Otel", 0),
            ("🏝️ 2. Phi Phi", 1),
            ("🎆 3. Bangla Road", 2),
            ("🛶 4. James Bond", 3),
            ("🐘 5. Fil Safari", 4),
            ("✨ 6. Mutlu Son!", 5),
        ]

        step_w = bar_w // len(steps)
        for i, (label, idx) in enumerate(steps):
            sx = x + i * step_w
            is_active = (idx == active_step)
            is_past = (idx < active_step)

            if is_active:
                d.rounded_rectangle([sx + 8, y + 8, sx + step_w - 8, y + bar_h - 8], radius=12, fill=COLOR_COMIC_ORANGE, outline=(255, 255, 255, 255), width=2)
                d.text((sx + 18, y + 20), label, font=font_step, fill=COLOR_COMIC_WHITE)
            elif is_past:
                d.text((sx + 18, y + 20), label, font=font_step, fill=COLOR_COMIC_CYAN)
            else:
                d.text((sx + 18, y + 20), label, font=font_step, fill=(148, 163, 184, 255))

            if i < len(steps) - 1:
                d.text((sx + step_w - 12, y + 20), "›", font=font_step, fill=(100, 116, 139, 255))

    def draw_comic_header_box(self, overlay, x, y, episode_tag, title_text, subtitle_text):
        """Sarı çizgi roman başlık kutusu"""
        d = ImageDraw.Draw(overlay)
        w = 920
        h = 135

        # Gölge
        d.rounded_rectangle([x + 8, y + 8, x + w + 8, y + h + 8], radius=20, fill=(0, 0, 0, 190))
        # Ana sarı kutu
        d.rounded_rectangle([x, y, x + w, y + h], radius=20, fill=COLOR_COMIC_YELLOW, outline=(15, 23, 42, 255), width=4)

        # Bölüm rozeti
        d.rounded_rectangle([x + 24, y + 16, x + 260, y + 48], radius=10, fill=COLOR_COMIC_ORANGE, outline=(15, 23, 42, 255), width=2)
        d.text((x + 36, y + 20), episode_tag, font=font_step, fill=COLOR_COMIC_WHITE)

        # Başlık ve Açıklama
        d.text((x + 24, y + 54), title_text, font=font_header_title, fill=(15, 23, 42, 255))
        d.text((x + 24, y + 96), subtitle_text, font=font_header_sub, fill=(60, 60, 60, 255))

    def draw_starburst(self, draw, cx, cy, r_inner, r_outer, points, fill, outline, width=3):
        """Karikatür ses efekti patlaması (starburst)"""
        pts = []
        angle_step = 2 * math.pi / (points * 2)
        for i in range(points * 2):
            r = r_outer if i % 2 == 0 else r_inner
            a = i * angle_step
            pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
        draw.polygon(pts, fill=fill, outline=outline, width=width)

    def draw_sound_fx(self, overlay, cx, cy, text, bg_color=COLOR_COMIC_PINK, scale=1.0):
        """Ekranda zıplayan çizgi roman ses efekti rozeti"""
        d = ImageDraw.Draw(overlay)
        r_out = int(85 * scale)
        r_in = int(55 * scale)

        # Gölge
        self.draw_starburst(d, cx + 6, cy + 6, r_in, r_out, 12, fill=(0, 0, 0, 160), outline=(0, 0, 0, 0), width=0)
        # Yıldız patlaması
        self.draw_starburst(d, cx, cy, r_in, r_out, 12, fill=bg_color, outline=(15, 23, 42, 255), width=4)

        tb = font_burst.getbbox(text)
        tw = tb[2] - tb[0]
        th = tb[3] - tb[1]
        d.text((cx - tw // 2, cy - th // 2 - 4), text, font=font_burst, fill=COLOR_COMIC_WHITE)

    def draw_speech_bubble(self, overlay, x, y, w, h, speaker_badge, speaker_color, line1, line2="", tail_side="left"):
        """Çizgi roman konuşma balonu"""
        d = ImageDraw.Draw(overlay)

        # Gölge
        d.rounded_rectangle([x + 8, y + 8, x + w + 8, y + h + 8], radius=24, fill=(0, 0, 0, 180))
        # Balon gövdesi
        d.rounded_rectangle([x, y, x + w, y + h], radius=24, fill=(255, 255, 255, 245), outline=(15, 23, 42, 255), width=4)

        # Balon kuyruğu
        if tail_side == "left":
            d.polygon([(x + 40, y + h), (x + 80, y + h), (x + 20, y + h + 30)], fill=(255, 255, 255, 245), outline=(15, 23, 42, 255))
            d.line([(x + 42, y + h - 2), (x + 78, y + h - 2)], fill=(255, 255, 255, 245), width=6)
        else:
            d.polygon([(x + w - 80, y + h), (x + w - 40, y + h), (x + w - 20, y + h + 30)], fill=(255, 255, 255, 245), outline=(15, 23, 42, 255))
            d.line([(x + w - 78, y + h - 2), (x + w - 42, y + h - 2)], fill=(255, 255, 255, 245), width=6)

        # Konuşmacı rozeti
        d.rounded_rectangle([x + 24, y - 18, x + 240, y + 20], radius=12, fill=speaker_color, outline=(15, 23, 42, 255), width=3)
        d.text((x + 36, y - 14), speaker_badge, font=font_speaker, fill=COLOR_COMIC_WHITE)

        # Balon içi metinler
        d.text((x + 28, y + 28), line1, font=font_bubble, fill=(15, 23, 42, 255))
        if line2:
            d.text((x + 28, y + 64), line2, font=font_bubble_sub, fill=(60, 60, 60, 255))

    # --- SAHNELER ---

    def render_scene_transfer(self, progress):
        """0.0s - 5.5s: BÖLÜM 1 - Havalimanı İnişi ve Otele VIP Transfer"""
        zoom = 1.05 + 0.1 * progress
        bg = self.raw_images["transfer"].resize((int(WIDTH * zoom), int(HEIGHT * zoom)), Image.Resampling.BILINEAR)
        ox = (bg.size[0] - WIDTH) // 2
        oy = (bg.size[1] - HEIGHT) // 2
        frame = bg.crop((ox, oy, ox + WIDTH, oy + HEIGHT))

        overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
        self.draw_comic_frame(overlay)
        self.draw_story_tracker(overlay, active_step=0)

        # Başlık Kutusu
        self.draw_comic_header_box(
            overlay, x=80, y=120,
            episode_tag="BÖLÜM 1 • İLK ADIM",
            title_text="Havalimanına İniş & Otele VIP Transfer!",
            subtitle_text="Pasaporttan çıktık, ismimiz yazılı tabelayla karşılandık!"
        )

        # Ses Patlaması (VROOOOM!)
        pop_scale = 1.0 + 0.18 * math.sin(progress * math.pi * 3) if progress < 0.7 else 1.0
        self.draw_sound_fx(overlay, cx=WIDTH - 240, cy=240, text="VROOOM! 🚗", bg_color=COLOR_COMIC_ORANGE, scale=pop_scale)

        # Konuşma Balonları (Çift karakter diyaloğu)
        b_p = min(1.0, progress * 2.0)
        if b_p > 0.2:
            self.draw_speech_bubble(
                overlay, x=100, y=HEIGHT - 380, w=840, h=110,
                speaker_badge="👨‍🦱 CAN (Gezgin)",
                speaker_color=COLOR_COMIC_CYAN,
                line1="\"Uçaktan indik, sıfır stres! Özel şoförümüz hazır bekliyordu.\"",
                line2="Klimalı VIP minibüsle doğruca otelimize geçtik.",
                tail_side="left"
            )

        if b_p > 0.5:
            self.draw_speech_bubble(
                overlay, x=WIDTH - 940, y=HEIGHT - 240, w=840, h=110,
                speaker_badge="👩‍🦰 ECE (Gezgin)",
                speaker_color=COLOR_COMIC_PINK,
                line1="\"Türkçe koordinasyon harika! Otele yerleştik, tatil başladı!\"",
                line2="Yarın sabah erkenden Phi Phi Adaları sürat teknesi bizi alacak!",
                tail_side="right"
            )

        return Image.alpha_composite(frame, overlay)

    def render_scene_phiphi(self, progress):
        """5.5s - 11.0s: BÖLÜM 2 - Otelden Phi Phi Adalarına Çıkarma"""
        zoom = 1.02 + 0.12 * progress
        bg = self.raw_images["phiphi"].resize((int(WIDTH * zoom), int(HEIGHT * zoom)), Image.Resampling.BILINEAR)
        ox = (bg.size[0] - WIDTH) // 2
        oy = (bg.size[1] - HEIGHT) // 2
        frame = bg.crop((ox, oy, ox + WIDTH, oy + HEIGHT))

        overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
        self.draw_comic_frame(overlay)
        self.draw_story_tracker(overlay, active_step=1)

        self.draw_comic_header_box(
            overlay, x=80, y=120,
            episode_tag="BÖLÜM 2 • TURKUAZ RÜYA",
            title_text="Otelden Phi Phi, Maya Bay & Pileh Lagoon!",
            subtitle_text="Sabah otelden transferle alındık, sürat teknesiyle lagüne daldık!"
        )

        pop_scale = 1.0 + 0.18 * math.sin(progress * math.pi * 3) if progress < 0.7 else 1.0
        self.draw_sound_fx(overlay, cx=WIDTH - 240, cy=240, text="SPLASH! 💦", bg_color=COLOR_COMIC_CYAN, scale=pop_scale)

        b_p = min(1.0, progress * 2.0)
        if b_p > 0.2:
            self.draw_speech_bubble(
                overlay, x=100, y=HEIGHT - 380, w=840, h=110,
                speaker_badge="👨‍🦱 CAN (Gezgin)",
                speaker_color=COLOR_COMIC_CYAN,
                line1="\"Bu lagün gerçek mi yoksa filtre mi?! Su cam gibi berrak!\"",
                line2="Pileh Lagoon'da tekneden atladık, rengarenk balıklarla yüzdük.",
                tail_side="left"
            )

        if b_p > 0.5:
            self.draw_speech_bubble(
                overlay, x=WIDTH - 940, y=HEIGHT - 240, w=840, h=110,
                speaker_badge="👩‍🦰 ECE (Gezgin)",
                speaker_color=COLOR_COMIC_PINK,
                line1="\"Maya Bay kumsalında yürüdük, Viking Mağarası'nı fotoğrafladık!\"",
                line2="Akşam rotamız ise efsane Bangla Road geceleri!",
                tail_side="right"
            )

        return Image.alpha_composite(frame, overlay)

    def render_scene_bangla(self, progress):
        """11.0s - 17.0s: BÖLÜM 3 - Akşam Bangla Road & Gece Hayatı"""
        zoom = 1.14 - 0.08 * progress
        bg = self.raw_images["bangla"].resize((int(WIDTH * zoom), int(HEIGHT * zoom)), Image.Resampling.BILINEAR)
        ox = (bg.size[0] - WIDTH) // 2
        oy = (bg.size[1] - HEIGHT) // 2
        frame = bg.crop((ox, oy, ox + WIDTH, oy + HEIGHT))

        overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
        self.draw_comic_frame(overlay)
        self.draw_story_tracker(overlay, active_step=2)

        self.draw_comic_header_box(
            overlay, x=80, y=120,
            episode_tag="BÖLÜM 3 • NEON IŞIKLARI",
            title_text="Bangla Road'a Akıyoruz! Patong Geceleri 🎆",
            subtitle_text="Canlı müzik, sokak lezzetleri ve Phuket'in kalbi burada atıyor!"
        )

        pop_scale = 1.0 + 0.18 * math.sin(progress * math.pi * 3) if progress < 0.7 else 1.0
        self.draw_sound_fx(overlay, cx=WIDTH - 240, cy=240, text="PARTY! 🍸", bg_color=COLOR_COMIC_PINK, scale=pop_scale)

        b_p = min(1.0, progress * 2.0)
        if b_p > 0.2:
            self.draw_speech_bubble(
                overlay, x=100, y=HEIGHT - 380, w=840, h=110,
                speaker_badge="👩‍🦰 ECE (Gezgin)",
                speaker_color=COLOR_COMIC_PINK,
                line1="\"Sokak tamamen yayalara açık! Işıklar, danslar ve tropik kokteyller!\"",
                line2="Mango Sticky Rice ve Tayland sokak yemeklerini denedik.",
                tail_side="left"
            )

        if b_p > 0.5:
            self.draw_speech_bubble(
                overlay, x=WIDTH - 940, y=HEIGHT - 240, w=840, h=110,
                speaker_badge="👨‍🦱 CAN (Gezgin)",
                speaker_color=COLOR_COMIC_CYAN,
                line1="\"Enerji tavan! Ama yarın sabah büyük macera var: James Bond!\"",
                line2="Phuket Tatili ekibi sabah transfer saatimizi WhatsApp'tan yazdı bile.",
                tail_side="right"
            )

        return Image.alpha_composite(frame, overlay)

    def render_scene_jamesbond(self, progress):
        """17.0s - 23.0s: BÖLÜM 4 - James Bond Adası & Kano Safarisi"""
        zoom = 1.04 + 0.11 * progress
        bg = self.raw_images["jamesbond"].resize((int(WIDTH * zoom), int(HEIGHT * zoom)), Image.Resampling.BILINEAR)
        ox = (bg.size[0] - WIDTH) // 2
        oy = (bg.size[1] - HEIGHT) // 2
        frame = bg.crop((ox, oy, ox + WIDTH, oy + HEIGHT))

        overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
        self.draw_comic_frame(overlay)
        self.draw_story_tracker(overlay, active_step=3)

        self.draw_comic_header_box(
            overlay, x=80, y=120,
            episode_tag="BÖLÜM 4 • 007 GÖREVİ",
            title_text="James Bond Adası & Deniz Mağaralarında Kano!",
            subtitle_text="Kireçtaşı kanyonlarının içine kano ile süzüldük!"
        )

        pop_scale = 1.0 + 0.18 * math.sin(progress * math.pi * 3) if progress < 0.7 else 1.0
        self.draw_sound_fx(overlay, cx=WIDTH - 240, cy=240, text="007 CAVE! 🛶", bg_color=COLOR_COMIC_YELLOW, scale=pop_scale)

        b_p = min(1.0, progress * 2.0)
        if b_p > 0.2:
            self.draw_speech_bubble(
                overlay, x=100, y=HEIGHT - 380, w=840, h=110,
                speaker_badge="👨‍🦱 CAN (Gezgin)",
                speaker_color=COLOR_COMIC_CYAN,
                line1="\"Dev kayalıkların içindeki dar tünellerden kano ile geçtik!\"",
                line2="Kano rehberimiz gizli lagünleri gezdirdi, manzara inanılmaz.",
                tail_side="left"
            )

        if b_p > 0.5:
            self.draw_speech_bubble(
                overlay, x=WIDTH - 940, y=HEIGHT - 240, w=840, h=110,
                speaker_badge="👩‍🦰 ECE (Gezgin)",
                speaker_color=COLOR_COMIC_PINK,
                line1="\"İkonik James Bond kayası önünde efsane fotoğraflar çektirdik!\"",
                line2="Ve sırada turun en duygusal günü var: Fil barınağı safari!",
                tail_side="right"
            )

        return Image.alpha_composite(frame, overlay)

    def render_scene_elephant(self, progress):
        """23.0s - 29.0s: BÖLÜM 5 - Etik Fil Barınağı & Çamur Banyosu"""
        zoom = 1.03 + 0.1 * progress
        bg = self.raw_images["elephant"].resize((int(WIDTH * zoom), int(HEIGHT * zoom)), Image.Resampling.BILINEAR)
        ox = (bg.size[0] - WIDTH) // 2
        oy = (bg.size[1] - HEIGHT) // 2
        frame = bg.crop((ox, oy, ox + WIDTH, oy + HEIGHT))

        overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
        self.draw_comic_frame(overlay)
        self.draw_story_tracker(overlay, active_step=4)

        self.draw_comic_header_box(
            overlay, x=80, y=120,
            episode_tag="BÖLÜM 5 • DOĞA VE SEVGİ",
            title_text="Dev Dostlarla Çamur Banyosu & Besleme! 🐘",
            subtitle_text="%100 etik, zincirsiz doğal yaşam parkında unutulmaz anlar."
        )

        pop_scale = 1.0 + 0.18 * math.sin(progress * math.pi * 3) if progress < 0.7 else 1.0
        self.draw_sound_fx(overlay, cx=WIDTH - 240, cy=240, text="SO CUTE! 🌿", bg_color=COLOR_COMIC_GREEN, scale=pop_scale)

        b_p = min(1.0, progress * 2.0)
        if b_p > 0.2:
            self.draw_speech_bubble(
                overlay, x=100, y=HEIGHT - 380, w=840, h=110,
                speaker_badge="👩‍🦰 ECE (Gezgin)",
                speaker_color=COLOR_COMIC_PINK,
                line1="\"Kendi ellerimizle muz ve karpuz yedirdik, çamur havuzuna girdik!\"",
                line2="Filler o kadar neşeliydi ki, hayatımın en güzel deneyimi oldu.",
                tail_side="left"
            )

        if b_p > 0.5:
            self.draw_speech_bubble(
                overlay, x=WIDTH - 940, y=HEIGHT - 240, w=840, h=110,
                speaker_badge="👨‍🦱 CAN (Gezgin)",
                speaker_color=COLOR_COMIC_CYAN,
                line1="\"Hiçbir zorlama veya zincir yok, tamamen etik bir koruma alanı!\"",
                line2="Havalimanından son güne kadar her şey kusursuz planlandı.",
                tail_side="right"
            )

        return Image.alpha_composite(frame, overlay)

    def render_scene_outro(self, progress):
        """29.0s - 35.0s: BÖLÜM 6 - Mutlu Son & Kendi Hikayeni Başlat!"""
        frame = Image.new("RGBA", (WIDTH, HEIGHT), (7, 11, 18, 255))
        d = ImageDraw.Draw(frame)

        # Karikatür tarzı radyal hız çizgileri (speed lines)
        cx, cy = WIDTH // 2, HEIGHT // 2 - 40
        num_rays = 36
        for i in range(num_rays):
            angle = i * (2 * math.pi / num_rays) + progress * 0.5
            r = 1300
            px = cx + r * math.cos(angle)
            py = cy + r * math.sin(angle)
            color = (25, 35, 55, 255) if i % 2 == 0 else (12, 18, 30, 255)
            d.polygon([(cx, cy), (px, py), (cx + r * math.cos(angle + 0.08), cy + r * math.sin(angle + 0.08))], fill=color)

        overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
        self.draw_comic_frame(overlay)
        self.draw_story_tracker(overlay, active_step=5)

        # Logo
        sym = self.logo_symbol.resize((150, 150), Image.Resampling.LANCZOS)
        overlay.alpha_composite(sym, ((WIDTH - 150) // 2, 110))

        od = ImageDraw.Draw(overlay)

        # Başlık
        title_text = "Senin Phuket Hikayen Ne Zaman Başlıyor?"
        tb = font_huge.getbbox(title_text)
        tw = tb[2] - tb[0]
        # Başlık arkası sarı bant
        od.rounded_rectangle([(WIDTH - tw) // 2 - 20, 280, (WIDTH + tw) // 2 + 20, 365], radius=16, fill=COLOR_COMIC_YELLOW, outline=(0, 0, 0, 255), width=3)
        od.text(((WIDTH - tw) // 2, 288), title_text, font=font_huge, fill=(15, 23, 42, 255))

        # Alt yazı
        sub_text = "Havalimanından adaya, otelden Bangla Road ve fil safarisine kadar her adımınız hazır!"
        sb = font_header_sub.getbbox(sub_text)
        sw = sb[2] - sb[0]
        od.text(((WIDTH - sw) // 2, 385), sub_text, font=font_header_sub, fill=COLOR_COMIC_WHITE)

        # Büyük WhatsApp Butonu (Zıplayan animasyon)
        bounce = 1.0 + 0.04 * math.sin(progress * math.pi * 4)
        btn_w = int(720 * bounce)
        btn_h = int(120 * bounce)
        bx = (WIDTH - btn_w) // 2
        by = 440

        od.rounded_rectangle([bx + 8, by + 8, bx + btn_w + 8, by + btn_h + 8], radius=32, fill=(0, 0, 0, 180))
        od.rounded_rectangle([bx, by, bx + btn_w, by + btn_h], radius=32, fill=COLOR_COMIC_GREEN, outline=(255, 255, 255, 255), width=4)

        od.text((bx + 40, by + 20), "💬 WhatsApp Müsaitlik & Planlama Hattı", font=font_speaker, fill=(15, 23, 42, 220))
        od.text((bx + 40, by + 52), "+66 82 895 0665", font=font_cta_btn, fill=(15, 23, 42, 255))
        od.text((bx + btn_w - 200, by + 42), "HEMEN YAZIN →", font=font_header_sub, fill=(15, 23, 42, 255))

        # 4'lü Güvence Rozetleri
        badges = [
            "🇹🇷 7/24 Türkçe Rehber",
            "📝 Yazılı Fiyat Garantisi",
            "🚗 Havalimanı Karşılama",
            "⚡ Hızlı Kolay Rezervasyon",
        ]
        bw_total = 1100
        start_bx = (WIDTH - bw_total) // 2
        for i, b_text in enumerate(badges):
            cur_x = start_bx + i * (bw_total // 4)
            od.rounded_rectangle([cur_x, 600, cur_x + (bw_total // 4) - 16, 650], radius=14, fill=(15, 23, 42, 220), outline=(255, 255, 255, 60), width=1)
            od.text((cur_x + 14, 616), b_text, font=font_step, fill=COLOR_COMIC_CYAN)

        # Web Sitesi Kutusu
        od.rounded_rectangle([(WIDTH - 500) // 2, 690, (WIDTH + 500) // 2, 750], radius=20, fill=(255, 255, 255, 20), outline=COLOR_COMIC_ORANGE, width=2)
        web_text = "🌐  www.phukettatili.com"
        wb = font_header_title.getbbox(web_text)
        ww = wb[2] - wb[0]
        od.text(((WIDTH - ww) // 2, 702), web_text, font=font_header_title, fill=COLOR_COMIC_WHITE)

        # Telif
        foot = "Phuket Tatili © 2026 • Tayland'daki Türkçe Seyahat Arkadaşınız"
        ft_b = font_step.getbbox(foot)
        ft_w = ft_b[2] - ft_b[0]
        od.text(((WIDTH - ft_w) // 2, HEIGHT - 70), foot, font=font_step, fill=(148, 163, 184, 255))

        return Image.alpha_composite(frame, overlay)

    def render_frame(self, frame_idx):
        """Sahne süreleri ve crossfade geçişleri"""
        t = frame_idx / FPS
        FADE = 0.4 # saniye

        # 1. Sahne: Transfer (0.0 -> 5.5)
        # 2. Sahne: Phi Phi (5.5 -> 11.0)
        # 3. Sahne: Bangla (11.0 -> 17.0)
        # 4. Sahne: James Bond (17.0 -> 23.0)
        # 5. Sahne: Elephant (23.0 -> 29.0)
        # 6. Sahne: Outro (29.0 -> 35.0)

        if t < 5.5:
            p = t / 5.5
            curr = self.render_scene_transfer(p)
            if t > (5.5 - FADE):
                fade_p = (t - (5.5 - FADE)) / FADE
                nxt = self.render_scene_phiphi(0.0)
                return Image.blend(curr, nxt, fade_p)
            return curr

        elif t < 11.0:
            p = (t - 5.5) / 5.5
            curr = self.render_scene_phiphi(p)
            if t > (11.0 - FADE):
                fade_p = (t - (11.0 - FADE)) / FADE
                nxt = self.render_scene_bangla(0.0)
                return Image.blend(curr, nxt, fade_p)
            return curr

        elif t < 17.0:
            p = (t - 11.0) / 6.0
            curr = self.render_scene_bangla(p)
            if t > (17.0 - FADE):
                fade_p = (t - (17.0 - FADE)) / FADE
                nxt = self.render_scene_jamesbond(0.0)
                return Image.blend(curr, nxt, fade_p)
            return curr

        elif t < 23.0:
            p = (t - 17.0) / 6.0
            curr = self.render_scene_jamesbond(p)
            if t > (23.0 - FADE):
                fade_p = (t - (23.0 - FADE)) / FADE
                nxt = self.render_scene_elephant(0.0)
                return Image.blend(curr, nxt, fade_p)
            return curr

        elif t < 29.0:
            p = (t - 23.0) / 6.0
            curr = self.render_scene_elephant(p)
            if t > (29.0 - FADE):
                fade_p = (t - (29.0 - FADE)) / FADE
                nxt = self.render_scene_outro(0.0)
                return Image.blend(curr, nxt, fade_p)
            return curr

        else:
            p = (t - 29.0) / 6.0
            return self.render_scene_outro(p)


def main():
    print("=" * 65)
    print("🎨 PHUKET TATİLİ - KARİKATÜR HİKAYE VİDEOSU ÜRETİMİ")
    print(f"Çözünürlük: {WIDTH}x{HEIGHT} @ {FPS} FPS | Süre: {DURATION_SEC} sn ({TOTAL_FRAMES} kare)")
    print("=" * 65)

    generate_comic_soundtrack(AUDIO_TEMP_PATH, duration_sec=DURATION_SEC)

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

    renderer = ComicRenderer()
    print(f"📽️  Karikatür kareleri hesaplanıyor ({TOTAL_FRAMES} kare)...")
    last_reported = 0

    try:
        for idx in range(TOTAL_FRAMES):
            frame = renderer.render_frame(idx)
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
    print("🎉 KARİKATÜR HİKAYE VİDEOSU BAŞARIYLA TAMAMLANDI!")
    print(f"📁 Web Varlık Yolu: {OUTPUT_VIDEO_PUBLIC}")
    print(f"📁 Proje Kök Yolu:  {OUTPUT_VIDEO_ROOT}")
    print(f"📁 PhuketTatili:    {OUTPUT_VIDEO_ALT}")
    print("=" * 65)

if __name__ == "__main__":
    main()
