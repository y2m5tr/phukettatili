#!/usr/bin/env python3
"""
Phuket Tatili - Tanıtım Videosu Üretici (Sadece Kod ile)
1920x1080 Full HD @ 30 FPS, 32 Saniye Sinematik Tanıtım Videosu
Pillow (Görsel ve Hareketli Grafik) + Python Wave (Tropik Müzik ve Okyanus Sesi) + FFmpeg
"""

import os
import sys
import math
import wave
import struct
import random
import subprocess
from PIL import Image, ImageDraw, ImageFont, ImageFilter

WIDTH = 1920
HEIGHT = 1080
FPS = 30
DURATION_SEC = 32
TOTAL_FRAMES = FPS * DURATION_SEC

ROOT_DIR = "/Users/ymg/Downloads/PhuketTatili2"
ASSETS_DIR = os.path.join(ROOT_DIR, "public/assets")
OUTPUT_VIDEO_PUBLIC = os.path.join(ASSETS_DIR, "phuket-tatili-tanitim.mp4")
OUTPUT_VIDEO_ROOT = os.path.join(ROOT_DIR, "phuket-tatili-tanitim.mp4")
AUDIO_TEMP_PATH = "/tmp/phuket_promo_audio.wav"

FONT_BOLD_PATH = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
FONT_REG_PATH = "/System/Library/Fonts/Supplemental/Arial.ttf"

# Font instances
font_hero = ImageFont.truetype(FONT_BOLD_PATH, 72)
font_title = ImageFont.truetype(FONT_BOLD_PATH, 50)
font_card_title = ImageFont.truetype(FONT_BOLD_PATH, 38)
font_subtitle = ImageFont.truetype(FONT_REG_PATH, 24)
font_body = ImageFont.truetype(FONT_REG_PATH, 22)
font_pill = ImageFont.truetype(FONT_BOLD_PATH, 16)
font_pill_large = ImageFont.truetype(FONT_BOLD_PATH, 22)
font_small = ImageFont.truetype(FONT_REG_PATH, 16)

# Colors
COLOR_BG = (7, 11, 18, 255)
COLOR_ORANGE = (255, 87, 34, 255)
COLOR_TURQUOISE = (0, 210, 255, 255)
COLOR_GREEN = (37, 211, 102, 255) # WhatsApp green
COLOR_WHITE = (255, 255, 255, 255)
COLOR_MUTED = (148, 163, 184, 255)

def ease_in_out(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)

def ease_out(t):
    t = max(0.0, min(1.0, t))
    return 1.0 - (1.0 - t) ** 3

def draw_pill(draw, x, y, text, font, bg_color, text_color=(255, 255, 255, 255), pad_x=16, pad_y=8, border=None):
    bbox = font.getbbox(text)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    w = tw + pad_x * 2
    h = th + pad_y * 2
    outline_args = {}
    if border:
        outline_args = {"outline": border, "width": 1}
    draw.rounded_rectangle([x, y, x + w, y + h], radius=h // 2, fill=bg_color, **outline_args)
    draw.text((x + pad_x, y + pad_y - bbox[1]), text, font=font, fill=text_color)
    return w, h

def create_vignette():
    """Önceden hesaplanmış sinematik karartma maskesi"""
    mask = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    d = ImageDraw.Draw(mask)
    # Üst gradyan
    for y in range(240):
        alpha = int(180 * (1.0 - y / 240.0) ** 1.5)
        d.line([(0, y), (WIDTH, y)], fill=(7, 11, 18, alpha))
    # Alt gradyan (kartların arkası)
    for y in range(480):
        curr_y = HEIGHT - 480 + y
        alpha = int(220 * (y / 480.0) ** 1.3)
        d.line([(0, curr_y), (WIDTH, curr_y)], fill=(7, 11, 18, alpha))
    return mask

VIGNETTE_MASK = create_vignette()

# -------------------------------------------------------------
# 1. TROPİK MÜZİK VE OKYANUS SESİ SENTEZLEYİCİ
# -------------------------------------------------------------
def generate_soundtrack(output_path, duration_sec=DURATION_SEC, sample_rate=44100):
    print("🎵 Tropik akustik müzik ve okyanus sesleri sentezleniyor...")
    num_samples = int(duration_sec * sample_rate)
    left_channel = [0.0] * num_samples
    right_channel = [0.0] * num_samples

    def note_freq(midi_note):
        return 440.0 * (2.0 ** ((midi_note - 69) / 12.0))

    # Kalimba / Marimba tropik melodisi (Am7 - Fmaj7 - C - G akor yürüyüşü)
    melody_pattern = [
        # Am bar (0 - 4s)
        (0.0, 69, 0.45, -0.4), (0.5, 72, 0.35, 0.4), (1.0, 76, 0.40, -0.2), (1.5, 74, 0.35, 0.3),
        (2.0, 72, 0.50, -0.5), (2.5, 69, 0.35, 0.2), (3.0, 67, 0.38, -0.3), (3.5, 69, 0.45, 0.4),
        # F bar (4 - 8s)
        (4.0, 65, 0.45, -0.4), (4.5, 69, 0.35, 0.4), (5.0, 72, 0.40, -0.2), (5.5, 76, 0.35, 0.3),
        (6.0, 74, 0.50, -0.5), (6.5, 72, 0.35, 0.2), (7.0, 69, 0.38, -0.3), (7.5, 72, 0.45, 0.4),
        # C bar (8 - 12s)
        (8.0, 60, 0.45, -0.4), (8.5, 64, 0.35, 0.4), (9.0, 67, 0.40, -0.2), (9.5, 72, 0.35, 0.3),
        (10.0, 76, 0.50, -0.5), (10.5, 74, 0.35, 0.2), (11.0, 72, 0.38, -0.3), (11.5, 67, 0.45, 0.4),
        # G bar (12 - 16s)
        (12.0, 67, 0.45, -0.4), (12.5, 71, 0.35, 0.4), (13.0, 74, 0.40, -0.2), (13.5, 76, 0.35, 0.3),
        (14.0, 79, 0.50, -0.5), (14.5, 76, 0.35, 0.2), (15.0, 74, 0.38, -0.3), (15.5, 71, 0.45, 0.4),
    ]

    all_notes = []
    for cycle in range(2):
        t_off = cycle * 16.0
        for t, n, v, p in melody_pattern:
            all_notes.append((t + t_off, n, v, p))

    # Bas notaları
    bass_pattern = [(0.0, 45), (4.0, 41), (8.0, 48), (12.0, 43)]
    all_bass = []
    for cycle in range(2):
        t_off = cycle * 16.0
        for t, n in bass_pattern:
            all_bass.append((t + t_off, n))

    # Melodi notalarını sentezleme (Akustik Marimba harmonikleri)
    for t_start, midi, vel, pan in all_notes:
        freq = note_freq(midi)
        start_idx = int(t_start * sample_rate)
        note_samples = int(1.3 * sample_rate)
        left_gain = (1.0 - pan) * 0.5 * vel
        right_gain = (1.0 + pan) * 0.5 * vel

        for i in range(note_samples):
            idx = start_idx + i
            if idx >= num_samples: break
            t = i / sample_rate
            env = math.exp(-3.2 * t)
            sig = (math.sin(2 * math.pi * freq * t) +
                   0.35 * math.sin(2 * math.pi * freq * 2 * t) +
                   0.15 * math.sin(2 * math.pi * freq * 3 * t) +
                   0.08 * math.sin(2 * math.pi * freq * 4 * t))
            val = sig * env
            left_channel[idx] += val * left_gain * 0.36
            right_channel[idx] += val * right_gain * 0.36

    # Bas sentezi
    for t_start, midi in all_bass:
        freq = note_freq(midi)
        start_idx = int(t_start * sample_rate)
        bass_samples = int(3.8 * sample_rate)
        for i in range(bass_samples):
            idx = start_idx + i
            if idx >= num_samples: break
            t = i / sample_rate
            env = math.sin(math.pi * min(1.0, t / 0.12)) * math.exp(-0.75 * t)
            val = (math.sin(2 * math.pi * freq * t) + 0.25 * math.sin(2 * math.pi * freq * 2 * t)) * env * 0.30
            left_channel[idx] += val
            right_channel[idx] += val

    # Okyanus dalgaları ambiyansı (Filtrelenmiş dalga gürültüsü)
    noise_l, noise_r = 0.0, 0.0
    for i in range(num_samples):
        t = i / sample_rate
        # 6.5 saniyelik periyotta yükselip alçalan dalga LFO'su
        lfo = 0.5 + 0.5 * math.sin(2 * math.pi * 0.15 * t - 1.2)
        lfo_pwr = (lfo ** 2.2) * 0.09
        noise_l += (random.uniform(-1, 1) - noise_l) * 0.04
        noise_r += (random.uniform(-1, 1) - noise_r) * 0.04
        left_channel[i] += noise_l * lfo_pwr
        right_channel[i] += noise_r * lfo_pwr

    # Master seviye ve yumuşak fade-in / fade-out
    frames = []
    for i in range(num_samples):
        t = i / sample_rate
        fade = 1.0
        if t < 1.2:
            fade = t / 1.2
        elif t > (duration_sec - 2.5):
            fade = max(0.0, (duration_sec - t) / 2.5)

        l = max(-0.95, min(0.95, left_channel[i] * fade))
        r = max(-0.95, min(0.95, right_channel[i] * fade))
        frames.append(struct.pack('<hh', int(l * 32767), int(r * 32767)))

    with wave.open(output_path, 'wb') as wav:
        wav.setnchannels(2)
        wav.setsampwidth(2)
        wav.setframerate(sample_rate)
        wav.writeframes(b''.join(frames))
    print(f"✅ Müzik oluşturuldu: {output_path}")

# -------------------------------------------------------------
# 2. GÖRSEL VE HAREKETLİ GRAFİK RENDER MOTORU
# -------------------------------------------------------------
class PromoRenderer:
    def __init__(self):
        print("🖼️  Görsel varlıklar yükleniyor...")
        self.raw_images = {
            "pileh": Image.open(os.path.join(ASSETS_DIR, "pileh.webp")).convert("RGBA"),
            "bay": Image.open(os.path.join(ASSETS_DIR, "bay.webp")).convert("RGBA"),
            "elephant": Image.open(os.path.join(ASSETS_DIR, "elephant.webp")).convert("RGBA"),
            "yacht": Image.open(os.path.join(ASSETS_DIR, "yacht.webp")).convert("RGBA"),
            "beach": Image.open(os.path.join(ASSETS_DIR, "beach.webp")).convert("RGBA"),
        }
        self.logo_symbol = Image.open(os.path.join(ASSETS_DIR, "logo-symbol.png")).convert("RGBA")
        print("✅ Varlıklar hazır.")

    def render_ken_burns(self, img_key, progress, zoom_start=1.02, zoom_end=1.14, pan_dir="in"):
        """Pürüzsüz kamera yakınlaştırma ve kaydırma efekti"""
        im = self.raw_images[img_key]
        iw, ih = im.size
        # Hedef en-boy oranı 16:9
        target_ar = WIDTH / HEIGHT # 1.7778
        im_ar = iw / ih

        if im_ar > target_ar:
            # Görüntü daha geniş, yüksekliğe göre baz al
            base_h = ih
            base_w = int(ih * target_ar)
        else:
            base_w = iw
            base_h = int(iw / target_ar)

        cur_zoom = zoom_start + (zoom_end - zoom_start) * progress
        crop_w = int(base_w / cur_zoom)
        crop_h = int(base_h / cur_zoom)

        # Pan ofsetleri
        if pan_dir == "right":
            x_off = int((iw - crop_w) * (0.3 + 0.4 * progress))
            y_off = (ih - crop_h) // 2
        elif pan_dir == "down":
            x_off = (iw - crop_w) // 2
            y_off = int((ih - crop_h) * (0.2 + 0.3 * progress))
        else: # in
            x_off = (iw - crop_w) // 2
            y_off = (ih - crop_h) // 2

        cropped = im.crop((x_off, y_off, x_off + crop_w, y_off + crop_h))
        return cropped.resize((WIDTH, HEIGHT), Image.Resampling.BILINEAR)

    def draw_top_nav(self, overlay):
        d = ImageDraw.Draw(overlay)
        # Cam kapsül üst çubuk
        d.rounded_rectangle([60, 40, 420, 96], radius=28, fill=(7, 11, 18, 190), outline=(255, 255, 255, 30), width=1)
        # Minik logo simgesi
        sym_small = self.logo_symbol.resize((36, 36), Image.Resampling.LANCZOS)
        overlay.alpha_composite(sym_small, (80, 50))
        d.text((128, 56), "PHUKET TATİLİ", font=font_pill_large, fill=COLOR_WHITE)

        # Sağ üst: Türkçe Yerel Destek rozeti
        d.rounded_rectangle([WIDTH - 380, 40, WIDTH - 60, 96], radius=28, fill=(7, 11, 18, 190), outline=(255, 255, 255, 30), width=1)
        d.text((WIDTH - 355, 57), "🇹🇷 Türkçe Yerel Destek", font=font_pill_large, fill=COLOR_TURQUOISE)

    def draw_glass_card(self, overlay, x, y, w, h, badge_text, badge_color, title, desc, tags=None, slide_progress=1.0):
        """Cam efektli modern kart bileşeni"""
        d = ImageDraw.Draw(overlay)
        anim_y = y + int(40 * (1.0 - ease_out(slide_progress)))
        alpha_card = int(225 * ease_out(slide_progress))

        # Kart gövdesi
        d.rounded_rectangle([x, anim_y, x + w, anim_y + h], radius=28, fill=(7, 11, 18, alpha_card), outline=(255, 255, 255, 45), width=2)
        # Üst parlaklık çizgisi
        d.line([(x + 40, anim_y + 1), (x + w - 40, anim_y + 1)], fill=(255, 255, 255, 90), width=2)

        # Kategori Rozeti
        badge_w, badge_h = draw_pill(d, x + 36, anim_y + 36, badge_text, font_pill, badge_color, COLOR_WHITE, pad_x=14, pad_y=6)

        # Başlık
        d.text((x + 36, anim_y + 86), title, font=font_card_title, fill=COLOR_WHITE)

        # Açıklama
        d.text((x + 36, anim_y + 144), desc, font=font_body, fill=COLOR_MUTED)

        # Alt etiketler (highlights)
        if tags:
            tag_x = x + 36
            tag_y = anim_y + h - 56
            for tag in tags:
                tw, th = draw_pill(d, tag_x, tag_y, tag, font_small, (255, 255, 255, 18), COLOR_WHITE, pad_x=12, pad_y=5, border=(255, 255, 255, 40))
                tag_x += tw + 12

    # --- SAHNELER ---

    def render_scene_intro(self, progress):
        """0.0s - 4.5s: İntrodüksiyon ve Marka Başlangıcı"""
        frame = Image.new("RGBA", (WIDTH, HEIGHT), COLOR_BG)
        d = ImageDraw.Draw(frame)

        # Arka plan yumuşak neon parıltısı (radial gradient etkisi)
        glow_size = int(600 + 100 * math.sin(progress * math.pi))
        glow_im = Image.new("RGBA", (glow_size, glow_size), (0, 0, 0, 0))
        glow_d = ImageDraw.Draw(glow_im)
        for r in range(glow_size // 2, 0, -10):
            a = int(35 * (1.0 - (r / (glow_size / 2))) ** 2)
            glow_d.ellipse([glow_size // 2 - r, glow_size // 2 - r, glow_size // 2 + r, glow_size // 2 + r], fill=(255, 87, 34, a))
        frame.alpha_composite(glow_im, (WIDTH // 2 - glow_size // 2, HEIGHT // 2 - glow_size // 2 - 80))

        # Logo belirmesi
        logo_scale = 0.8 + 0.2 * ease_out(min(1.0, progress * 1.5))
        logo_w = int(220 * logo_scale)
        logo_h = int(220 * logo_scale)
        logo_resized = self.logo_symbol.resize((logo_w, logo_h), Image.Resampling.LANCZOS)
        logo_x = (WIDTH - logo_w) // 2
        logo_y = (HEIGHT // 2) - 240 + int(30 * (1.0 - ease_out(min(1.0, progress * 1.5))))
        frame.alpha_composite(logo_resized, (logo_x, logo_y))

        # Metinler
        t_prog = ease_out(max(0.0, (progress - 0.2) / 0.8))
        if t_prog > 0:
            # Rozet
            badge_text = "✦ TAYLAND'IN EN GÜVENİLİR TÜRKÇE REHBERİ ✦"
            bw, bh = font_pill.getbbox(badge_text)[2] - font_pill.getbbox(badge_text)[0], 36
            draw_pill(d, (WIDTH - bw - 40) // 2, logo_y + logo_h + 30, badge_text, font_pill, (255, 255, 255, 20), COLOR_TURQUOISE, pad_x=20, pad_y=8, border=(0, 210, 255, 80))

            # Ana Başlık
            title_text = "PHUKET TATİLİ"
            tb = font_hero.getbbox(title_text)
            tw = tb[2] - tb[0]
            d.text(((WIDTH - tw) // 2, logo_y + logo_h + 90), title_text, font=font_hero, fill=COLOR_WHITE)

            # Slogan
            slogan_text = "Phuket'i İzleme. İçinde Ol."
            sb = font_title.getbbox(slogan_text)
            sw = sb[2] - sb[0]
            d.text(((WIDTH - sw) // 2, logo_y + logo_h + 180), slogan_text, font=font_title, fill=COLOR_ORANGE)

            # Alt Açıklama
            sub_text = "Ada Turları  •  Özel Yatlar  •  Otel & Havalimanı Transferi  •  VIP Hizmetler"
            sub_b = font_subtitle.getbbox(sub_text)
            sub_w = sub_b[2] - sub_b[0]
            d.text(((WIDTH - sub_w) // 2, logo_y + logo_h + 260), sub_text, font=font_subtitle, fill=COLOR_MUTED)

        return frame

    def render_scene_islands(self, progress):
        """4.5s - 9.0s: Ada Turları (Phi Phi & Lagünler)"""
        bg = self.render_ken_burns("pileh", progress, zoom_start=1.02, zoom_end=1.16, pan_dir="in")
        overlay = VIGNETTE_MASK.copy()
        self.draw_top_nav(overlay)

        card_p = min(1.0, progress * 2.5)
        self.draw_glass_card(
            overlay,
            x=100, y=HEIGHT - 380, w=1100, h=280,
            badge_text="01 / İKONİK ADA TURLARI",
            badge_color=COLOR_TURQUOISE,
            title="Phi Phi Adaları, Maya Bay & Pileh Lagoon",
            desc="Zümrüt yeşili sığ lagünlerde yüzme, Viking Mağarası ve Maymun Plajı keşfi.",
            tags=["⚡ VIP Sürat Teknesi", "🏊 Tam Ekipman Şnorkel", "🍱 Açık Büfe Öğle Yemeği", "🇹🇷 Türkçe Rehberlik"],
            slide_progress=card_p
        )
        return Image.alpha_composite(bg, overlay)

    def render_scene_adventure(self, progress):
        """9.0s - 13.5s: Macera & Kano (James Bond & Phang Nga)"""
        bg = self.render_ken_burns("bay", progress, zoom_start=1.04, zoom_end=1.18, pan_dir="right")
        overlay = VIGNETTE_MASK.copy()
        self.draw_top_nav(overlay)

        card_p = min(1.0, progress * 2.5)
        self.draw_glass_card(
            overlay,
            x=100, y=HEIGHT - 380, w=1100, h=280,
            badge_text="02 / DOĞA & KANO SAFARİ",
            badge_color=COLOR_ORANGE,
            title="James Bond Adası & Phang Nga Körfezi",
            desc="Dev kireçtaşı kayalıklar, deniz mağaralarında kano ve Hong adası gün batımı.",
            tags=["🛶 Profesyonel Kano Rehberi", "🌊 Gizli Mağara Geçişleri", "🌅 Gün Batımı Akşam Yemeği"],
            slide_progress=card_p
        )
        return Image.alpha_composite(bg, overlay)

    def render_scene_elephant(self, progress):
        """13.5s - 18.0s: Doğa & Etik Fil Bakımı"""
        bg = self.render_ken_burns("elephant", progress, zoom_start=1.02, zoom_end=1.15, pan_dir="down")
        overlay = VIGNETTE_MASK.copy()
        self.draw_top_nav(overlay)

        card_p = min(1.0, progress * 2.5)
        self.draw_glass_card(
            overlay,
            x=100, y=HEIGHT - 380, w=1100, h=280,
            badge_text="03 / ETİK DOĞA DENEYİMİ",
            badge_color=(46, 204, 113, 255),
            title="Etik Fil Bakım & Besleme Barınağı",
            desc="Doğal ortamlarında zincirsiz fillerle bağ kurma, çamur banyosu ve besleme.",
            tags=["🐘 %100 Etik & Zincirsiz", "🌿 Doğal Yaşam Parkı", "👨‍👩‍👧 Aile ve Çocuklara Uygun"],
            slide_progress=card_p
        )
        return Image.alpha_composite(bg, overlay)

    def render_scene_yacht(self, progress):
        """18.0s - 22.5s: VIP Özel Katamaran & Longtail"""
        bg = self.render_ken_burns("yacht", progress, zoom_start=1.16, zoom_end=1.02, pan_dir="in")
        overlay = VIGNETTE_MASK.copy()
        self.draw_top_nav(overlay)

        card_p = min(1.0, progress * 2.5)
        self.draw_glass_card(
            overlay,
            x=100, y=HEIGHT - 380, w=1100, h=280,
            badge_text="04 / VIP & ÖZEL KİRALAMA",
            badge_color=(245, 158, 11, 255),
            title="Özel Lüks Katamaran & Ahşap Longtail",
            desc="Kalabalıktan tamamen uzakta, sadece size özel rota, kaptan ve gün batımı.",
            tags=["⚓ Özel Rota Seçeneği", "🥂 VIP Meyve & İkramlar", "📸 Eşsiz Gün Batımı Çekimi"],
            slide_progress=card_p
        )
        return Image.alpha_composite(bg, overlay)

    def render_scene_why_us(self, progress):
        """22.5s - 27.5s: Neden Phuket Tatili? (4 Sütun Güven Mimarisi)"""
        # Hafif karartılmış ve bulanıklaştırılmış arka plan
        bg = self.raw_images["beach"].resize((WIDTH, HEIGHT), Image.Resampling.BILINEAR)
        overlay = Image.new("RGBA", (WIDTH, HEIGHT), (7, 11, 18, 220))
        d = ImageDraw.Draw(overlay)
        self.draw_top_nav(overlay)

        # Başlık alanı
        head_p = min(1.0, progress * 3.0)
        draw_pill(d, 100, 150, "GÜVENİLİR VE RESMİ SEYAHAT ORTAĞINIZ", font_pill, (255, 255, 255, 20), COLOR_TURQUOISE)
        d.text((100, 195), "Neden Phuket Tatili ile Planlamalısınız?", font=font_title, fill=COLOR_WHITE)
        d.text((100, 260), "Tayland'da acente aramakla vakit kaybetmeyin, her detayı önceden yazılı garantiye alın.", font=font_subtitle, fill=COLOR_MUTED)

        # 4 Maddelik Kart Izgarası
        features = [
            ("01", "🇹🇷 7/24 Türkçe Destek", "Phuket'te bizzat yerel ekibimizle adadasınız. Dil engeli olmadan her an yanınızdayız."),
            ("02", "📝 Yazılı Teyit & Güvence", "Tüm program, dahil hizmetler ve ücret ödeme öncesinde yazılı teklif olarak gelir."),
            ("03", "⚡ Kişiye Özel Tatil Kurgusu", "Grup yapınıza, bütçenize ve tatil ritminize en uygun turları birlikte seçiyoruz."),
            ("04", "🛡️ Lisanslı & Sigortalı", "Yalnızca resmi Tayland Turizm Otoritesi (TAT) lisanslı seçkin operatörlerle çalışırız.")
        ]

        card_w = (WIDTH - 200 - 3 * 24) // 4
        card_h = 420
        card_y = 330

        for i, (num, f_title, f_desc) in enumerate(features):
            card_delay = 0.15 + i * 0.12
            item_p = ease_out(max(0.0, min(1.0, (progress - card_delay) / 0.5)))
            if item_p <= 0: continue

            cx = 100 + i * (card_w + 24)
            cy = card_y + int(30 * (1.0 - item_p))
            alpha = int(240 * item_p)

            d.rounded_rectangle([cx, cy, cx + card_w, cy + card_h], radius=24, fill=(15, 23, 42, alpha), outline=(255, 255, 255, 40), width=1)
            # Numara rozeti
            d.rounded_rectangle([cx + 28, cy + 28, cx + 80, cy + 80], radius=16, fill=(255, 87, 34, 40), outline=(255, 87, 34, 180), width=1)
            d.text((cx + 42, cy + 42), num, font=font_pill_large, fill=COLOR_ORANGE)

            # Başlık
            d.text((cx + 28, cy + 110), f_title, font=font_pill_large, fill=COLOR_WHITE)

            # Açıklama metni satırlara bölme
            words = f_desc.split()
            lines = []
            cur_line = []
            for w in words:
                cur_line.append(w)
                bbox = font_body.getbbox(" ".join(cur_line))
                if bbox[2] - bbox[0] > (card_w - 56):
                    cur_line.pop()
                    lines.append(" ".join(cur_line))
                    cur_line = [w]
            if cur_line:
                lines.append(" ".join(cur_line))

            ly = cy + 175
            for line in lines:
                d.text((cx + 28, ly), line, font=font_body, fill=COLOR_MUTED)
                ly += 30

        return Image.alpha_composite(bg, overlay)

    def render_scene_outro(self, progress):
        """27.5s - 32.0s: Kapanış & Call To Action (WhatsApp & Web)"""
        frame = Image.new("RGBA", (WIDTH, HEIGHT), COLOR_BG)
        d = ImageDraw.Draw(frame)

        # Arka plan neon daireleri
        glow_size = 700
        glow_im = Image.new("RGBA", (glow_size, glow_size), (0, 0, 0, 0))
        glow_d = ImageDraw.Draw(glow_im)
        for r in range(glow_size // 2, 0, -10):
            a = int(30 * (1.0 - (r / (glow_size / 2))) ** 2)
            glow_d.ellipse([glow_size // 2 - r, glow_size // 2 - r, glow_size // 2 + r, glow_size // 2 + r], fill=(0, 210, 255, a))
        frame.alpha_composite(glow_im, (WIDTH // 2 - glow_size // 2, HEIGHT // 2 - glow_size // 2))

        # Logo
        sym = self.logo_symbol.resize((140, 140), Image.Resampling.LANCZOS)
        frame.alpha_composite(sym, ((WIDTH - 140) // 2, 140))

        # Başlık
        title_text = "Phuket Tatilinizi Birlikte Planlayalım"
        tb = font_hero.getbbox(title_text)
        tw = tb[2] - tb[0]
        d.text(((WIDTH - tw) // 2, 310), title_text, font=font_hero, fill=COLOR_WHITE)

        sub_text = "Tarihlerinizi ve kişi sayınızı WhatsApp'tan iletin, dakikalar içinde rotanızı hazırlayalım."
        sb = font_subtitle.getbbox(sub_text)
        sw = sb[2] - sb[0]
        d.text(((WIDTH - sw) // 2, 400), sub_text, font=font_subtitle, fill=COLOR_MUTED)

        # Büyük WhatsApp Aksiyon Kartı
        card_w = 680
        card_h = 130
        card_x = (WIDTH - card_w) // 2
        card_y = 480
        d.rounded_rectangle([card_x, card_y, card_x + card_w, card_y + card_h], radius=32, fill=(37, 211, 102, 230), outline=(255, 255, 255, 120), width=2)

        # Telefon simgesi ve numara
        d.text((card_x + 50, card_y + 26), "💬 WhatsApp Müsaitlik Hattı", font=font_pill_large, fill=(7, 11, 18, 220))
        d.text((card_x + 50, card_y + 64), "+66 82 895 0665", font=font_title, fill=(7, 11, 18, 255))
        d.text((card_x + card_w - 180, card_y + 50), "Hemen Yaz →", font=font_pill_large, fill=(7, 11, 18, 255))

        # Web Sitesi Link Kartı
        web_card_w = 520
        web_card_h = 70
        web_card_x = (WIDTH - web_card_w) // 2
        web_card_y = 660
        d.rounded_rectangle([web_card_x, web_card_y, web_card_x + web_card_w, web_card_y + web_card_h], radius=24, fill=(15, 23, 42, 210), outline=(255, 255, 255, 40), width=1)
        web_text = "🌐  www.phukettatili.com"
        wb = font_pill_large.getbbox(web_text)
        ww = wb[2] - wb[0]
        d.text(((WIDTH - ww) // 2, web_card_y + 22), web_text, font=font_pill_large, fill=COLOR_WHITE)

        # Alt Güvence İmzası
        foot_text = "Phuket Tatili  •  Tayland'da Türkçe Yerel Rehber & Tatil Planlama  •  2026"
        fb = font_small.getbbox(foot_text)
        fw = fb[2] - fb[0]
        d.text(((WIDTH - fw) // 2, HEIGHT - 120), foot_text, font=font_small, fill=(100, 116, 139, 255))

        return frame

    def render_frame(self, frame_idx):
        """Frame indeksine göre sahne hesaplama ve yumuşak crossfade geçişleri"""
        t = frame_idx / FPS # saniye cinsinden zaman

        # Sahne zamanlama aralıkları (saniye):
        # 1. Intro: 0.0 -> 4.5
        # 2. Islands: 4.5 -> 9.0
        # 3. Adventure: 9.0 -> 13.5
        # 4. Elephant: 13.5 -> 18.0
        # 5. Yacht: 18.0 -> 22.5
        # 6. Why Us: 22.5 -> 27.5
        # 7. Outro: 27.5 -> 32.0

        FADE_DUR = 0.5 # saniye

        if t < 4.5:
            p = t / 4.5
            curr = self.render_scene_intro(p)
            if t > (4.5 - FADE_DUR):
                # Fade to scene 2
                fade_p = (t - (4.5 - FADE_DUR)) / FADE_DUR
                nxt = self.render_scene_islands(0.0)
                return Image.blend(curr, nxt, fade_p)
            return curr

        elif t < 9.0:
            p = (t - 4.5) / 4.5
            curr = self.render_scene_islands(p)
            if t > (9.0 - FADE_DUR):
                fade_p = (t - (9.0 - FADE_DUR)) / FADE_DUR
                nxt = self.render_scene_adventure(0.0)
                return Image.blend(curr, nxt, fade_p)
            return curr

        elif t < 13.5:
            p = (t - 9.0) / 4.5
            curr = self.render_scene_adventure(p)
            if t > (13.5 - FADE_DUR):
                fade_p = (t - (13.5 - FADE_DUR)) / FADE_DUR
                nxt = self.render_scene_elephant(0.0)
                return Image.blend(curr, nxt, fade_p)
            return curr

        elif t < 18.0:
            p = (t - 13.5) / 4.5
            curr = self.render_scene_elephant(p)
            if t > (18.0 - FADE_DUR):
                fade_p = (t - (18.0 - FADE_DUR)) / FADE_DUR
                nxt = self.render_scene_yacht(0.0)
                return Image.blend(curr, nxt, fade_p)
            return curr

        elif t < 22.5:
            p = (t - 18.0) / 4.5
            curr = self.render_scene_yacht(p)
            if t > (22.5 - FADE_DUR):
                fade_p = (t - (22.5 - FADE_DUR)) / FADE_DUR
                nxt = self.render_scene_why_us(0.0)
                return Image.blend(curr, nxt, fade_p)
            return curr

        elif t < 27.5:
            p = (t - 22.5) / 5.0
            curr = self.render_scene_why_us(p)
            if t > (27.5 - FADE_DUR):
                fade_p = (t - (27.5 - FADE_DUR)) / FADE_DUR
                nxt = self.render_scene_outro(0.0)
                return Image.blend(curr, nxt, fade_p)
            return curr

        else:
            p = (t - 27.5) / 4.5
            return self.render_scene_outro(p)


def main():
    print("=" * 60)
    print("🎬 PHUKET TATİLİ - KOD İLE VİDEO ÜRETİMİ BAŞLADI")
    print(f"Çözünürlük: {WIDTH}x{HEIGHT} @ {FPS} FPS | Süre: {DURATION_SEC} sn ({TOTAL_FRAMES} kare)")
    print("=" * 60)

    # 1. Ses üretimi
    generate_soundtrack(AUDIO_TEMP_PATH, duration_sec=DURATION_SEC)

    # 2. FFmpeg Pipeline Başlatma
    ffmpeg_cmd = [
        "/opt/homebrew/bin/ffmpeg",
        "-y",
        "-f", "rawvideo",
        "-vcodec", "rawvideo",
        "-s", f"{WIDTH}x{HEIGHT}",
        "-pix_fmt", "rgba",
        "-r", str(FPS),
        "-i", "-",                       # Stdin'den ham frame akışı
        "-i", AUDIO_TEMP_PATH,           # Ses dosyası
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "18",                    # Yüksek görsel kalite
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "192k",
        "-movflags", "+faststart",
        OUTPUT_VIDEO_PUBLIC
    ]

    print(f"🚀 FFmpeg video kodlama başlatılıyor...")
    proc = subprocess.Popen(ffmpeg_cmd, stdin=subprocess.PIPE, stderr=subprocess.PIPE)

    renderer = PromoRenderer()

    # 3. Kare Kare Render ve Boru Hattına Gönderme
    print(f"📽️  Kareler hesaplanıyor ve videoya işleniyor ({TOTAL_FRAMES} kare)...")
    last_reported = 0

    try:
        for idx in range(TOTAL_FRAMES):
            frame = renderer.render_frame(idx)
            # Ham RGBA baytlarını doğrudan ffmpeg stdin'ine yaz
            proc.stdin.write(frame.tobytes())

            progress = int((idx + 1) / TOTAL_FRAMES * 100)
            if progress >= last_reported + 10:
                print(f"   İlerleme: %{progress} ({idx + 1}/{TOTAL_FRAMES} kare)")
                last_reported = progress

        proc.stdin.close()
        proc.wait()

        if proc.returncode != 0:
            print("❌ FFmpeg hatası:", stderr.decode("utf-8", errors="ignore"))
            sys.exit(1)

    except Exception as e:
        print("❌ Hata oluştu:", e)
        if proc.stdin:
            proc.stdin.close()
        proc.kill()
        sys.exit(1)

    # Kök dizine de kopyala
    try:
        import shutil
        shutil.copyfile(OUTPUT_VIDEO_PUBLIC, OUTPUT_VIDEO_ROOT)
    except Exception as e:
        print("Kopyalama uyarısı:", e)

    print("=" * 60)
    print("🎉 VİDEO BAŞARIYLA TAMAMLANDI!")
    print(f"📁 Web Varlık Yolu: {OUTPUT_VIDEO_PUBLIC}")
    print(f"📁 Proje Kök Yolu:  {OUTPUT_VIDEO_ROOT}")
    print("=" * 60)

if __name__ == "__main__":
    main()
