from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    HRFlowable,
    KeepTogether,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf" / "otabek-resume.pdf"
PUBLIC_COPY = ROOT / "public" / "otabek-resume.pdf"

INK = colors.HexColor("#09090B")
TEXT = colors.HexColor("#3F3F46")
MUTED = colors.HexColor("#71717A")
BORDER = colors.HexColor("#E4E4E7")
ACCENT = colors.HexColor("#2A3FFF")


def link(label: str, url: str) -> str:
    return f'<link href="{url}" color="#3F3F46"><u>{label}</u></link>'


def build_resume() -> None:
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)

    document = SimpleDocTemplate(
        str(OUTPUT),
        pagesize=A4,
        rightMargin=18 * mm,
        leftMargin=18 * mm,
        topMargin=15 * mm,
        bottomMargin=14 * mm,
        title="Otabek - Java and Full-Stack Developer",
        author="Otabek",
        subject="Engineering resume",
    )

    styles = getSampleStyleSheet()
    name = ParagraphStyle(
        "Name",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=27,
        leading=29,
        textColor=INK,
        spaceAfter=2,
    )
    role = ParagraphStyle(
        "Role",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=11,
        leading=14,
        textColor=TEXT,
    )
    contacts = ParagraphStyle(
        "Contacts",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.6,
        leading=12,
        alignment=TA_RIGHT,
        textColor=TEXT,
    )
    section = ParagraphStyle(
        "Section",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=10,
        tracking=1.1,
        textTransform="uppercase",
        textColor=ACCENT,
        spaceBefore=8,
        spaceAfter=6,
    )
    body = ParagraphStyle(
        "Body",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=9.2,
        leading=13.3,
        textColor=TEXT,
        spaceAfter=3,
    )
    small = ParagraphStyle(
        "Small",
        parent=body,
        fontSize=8.5,
        leading=12,
        textColor=MUTED,
    )
    project_title = ParagraphStyle(
        "ProjectTitle",
        parent=body,
        fontName="Helvetica-Bold",
        fontSize=10,
        leading=13,
        textColor=INK,
        spaceAfter=2,
    )
    skill_label = ParagraphStyle(
        "SkillLabel",
        parent=body,
        fontName="Helvetica-Bold",
        fontSize=8.8,
        leading=12,
        textColor=INK,
    )
    footer = ParagraphStyle(
        "Footer",
        parent=small,
        fontSize=7.5,
        leading=9,
        textColor=MUTED,
        alignment=TA_RIGHT,
    )

    story = []
    header = Table(
        [[
            [Paragraph("Otabek", name), Paragraph("Java &amp; Full-Stack Developer", role)],
            Paragraph(
                "<br/>".join([
                    link("otabek.dev", "https://otabek.dev"),
                    link("github.com/geekuz", "https://github.com/geekuz"),
                    link("t.me/creative_otabek", "https://t.me/creative_otabek"),
                ]),
                contacts,
            ),
        ]],
        colWidths=[110 * mm, 49 * mm],
    )
    header.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    story.extend([header, Spacer(1, 5 * mm), HRFlowable(width="100%", thickness=0.7, color=INK)])

    story.append(Paragraph("Profile", section))
    story.append(Paragraph(
        "Software developer building Java systems and full-stack web products. Focused on Spring Boot, React, PostgreSQL, secure application design, automated testing, and learning core engineering concepts by implementing them from first principles.",
        body,
    ))

    story.append(Paragraph("Core skills", section))
    skills = Table([
        [Paragraph("Backend", skill_label), Paragraph("Java 21, Spring Boot, Spring Security, REST APIs, JPA/Hibernate, Flyway", body)],
        [Paragraph("Frontend", skill_label), Paragraph("React 19, Vite, React Router, Tailwind CSS, Vitest, Playwright", body)],
        [Paragraph("Data &amp; platform", skill_label), Paragraph("PostgreSQL, Docker, Cloudflare R2, Vercel, Render, GitHub Actions", body)],
    ], colWidths=[37 * mm, 122 * mm])
    skills.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LINEBELOW", (0, 0), (-1, -2), 0.4, BORDER),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(skills)

    story.append(Paragraph("Selected engineering work", section))
    projects = [
        (
            "otabek.dev - Full-stack publishing platform",
            "React and Spring Boot product with Markdown publishing, search, secure session authentication, comments, newsletters, scheduled posts, media management, RSS, sitemap generation, and social previews.",
            "https://otabek.dev/projects/otabek-dev",
        ),
        (
            "Java HTTP Load Balancer",
            "Framework-free Java 21 load balancer using sockets and the JDK HTTP client, with concurrent forwarding, round-robin scheduling, health checks, failure removal, and recovery.",
            "https://github.com/geekuz/BYO-load-balancer",
        ),
        (
            "Build Your Own Sort",
            "Unix-style sorting CLI with multiple hand-built sorting algorithms, standard-input support, deduplication, continuous integration, and a 40-test suite.",
            "https://github.com/geekuz/BYO-sort-tool",
        ),
        (
            "Huffman Compression Tool",
            "Java command-line compressor and decompressor implementing Huffman coding, character-frequency analysis, binary round trips, and automated tests.",
            "https://github.com/geekuz/BYO-compression-tool",
        ),
    ]
    for title, description, url in projects:
        story.append(KeepTogether([
            Paragraph(f'{title}  <link href="{url}" color="#2A3FFF">[view]</link>', project_title),
            Paragraph(description, small),
            Spacer(1, 1.8 * mm),
        ]))

    story.append(Paragraph("Engineering approach", section))
    approach = Table([
        [Paragraph("01", skill_label), Paragraph("Prefer explicit boundaries, small dependencies, and secure defaults such as HTTP-only sessions, CSRF protection, validation, and rate limiting.", body)],
        [Paragraph("02", skill_label), Paragraph("Verify behavior with component, API, integration, migration, and real-browser checks before production claims.", body)],
        [Paragraph("03", skill_label), Paragraph("Document architecture and trade-offs so systems remain understandable as features grow.", body)],
    ], colWidths=[12 * mm, 147 * mm])
    approach.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 2),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
    ]))
    story.extend([approach, Spacer(1, 3 * mm), HRFlowable(width="100%", thickness=0.5, color=BORDER)])
    story.append(Paragraph("Public engineering profile - otabek.dev", footer))

    document.build(story)
    PUBLIC_COPY.write_bytes(OUTPUT.read_bytes())


if __name__ == "__main__":
    build_resume()
