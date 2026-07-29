"""
render_terminal_screenshot.py

Renders a real captured command output (a plain .txt log, no fabricated
text) as a terminal-look PNG, so the README and slide deck can show what
actually happened when the pipeline and test suite ran, without needing
a real screen-capture tool in this environment.
"""

import sys
from PIL import Image, ImageDraw, ImageFont

FONT_CANDIDATES = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf",
]


def load_font(size, bold=False):
    path = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf" if bold else \
           "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        return ImageFont.load_default()


def render(input_txt, output_png, title_bar_text, width=1180):
    with open(input_txt, "r") as fh:
        lines = fh.read().rstrip("\n").split("\n")

    font = load_font(16)
    bold_font = load_font(16, bold=True)
    line_height = 22
    padding_x = 24
    padding_top = 56
    padding_bottom = 24

    height = padding_top + padding_bottom + line_height * len(lines)
    img = Image.new("RGB", (width, height), color=(23, 24, 28))
    draw = ImageDraw.Draw(img)

    # title bar
    draw.rectangle([0, 0, width, 40], fill=(38, 39, 46))
    for i, color in enumerate([(255, 95, 86), (255, 189, 46), (39, 201, 63)]):
        draw.ellipse([18 + i * 22, 14, 30 + i * 22, 26], fill=color)
    draw.text((width // 2 - len(title_bar_text) * 4, 12), title_bar_text, font=font, fill=(180, 182, 190))

    y = padding_top
    for line in lines:
        color = (210, 213, 220)
        if line.strip().startswith("[") and "/5]" in line:
            color = (110, 190, 255)
        elif "CRITICAL" in line:
            color = (255, 110, 110)
        elif "HIGH" in line:
            color = (255, 170, 90)
        elif "LOW" in line or "SAFE" in line:
            color = (120, 220, 150)
        elif "PASSED" in line:
            color = (120, 220, 150)
        draw.text((padding_x, y), line, font=font, fill=color)
        y += line_height

    img.save(output_png)
    print(f"wrote {output_png} ({width}x{height})")


if __name__ == "__main__":
    render(sys.argv[1], sys.argv[2], sys.argv[3])