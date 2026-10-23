import json
import re

def transform_phrase(t):
    if not isinstance(t, str):
        return t
    t = t.strip()

    # Si déjà au format (min) / (max)
    if '(min)' in t and '(max)' in t:
        return t

    # Cas 1: "De la pire à la meilleure [suite]"
    m = re.match(r"^[Dd]e la pire [àa] la meilleure (.+)$", t, re.IGNORECASE)
    if m:
        rest = m.group(1).rstrip('. ')
        return f"De (min) à (max) : {rest}."

    # Cas 2: "Du pire au meilleur [suite]"
    m = re.match(r"^[Dd]u pire [àa]u meilleur (.+)$", t, re.IGNORECASE)
    if m:
        rest = m.group(1).rstrip('. ')
        return f"De (min) à (max) : {rest}."

    # Cas 3: "Du plus X au plus Y : [sujet]" ou "Du X au Y : [sujet]"
    m = re.match(r"^[Dd]u\s+([^:]+?)\s+[àa]u\s+([^:]+?)\s*:\s*(.+)$", t, re.IGNORECASE)
    if m:
        sujet = m.group(3).strip()
        if sujet and sujet[0].islower():
            sujet = sujet[0].upper() + sujet[1:]
        return f"{sujet} : de (min) à (max)."

    # Cas 4: "De X à Y : [sujet]"
    m = re.match(r"^[Dd]e\s+([^:]+?)\s+[àa]\s+([^:]+?)\s*:\s*(.+)$", t, re.IGNORECASE)
    if m:
        sujet = m.group(3).strip()
        if sujet and sujet[0].islower():
            sujet = sujet[0].upper() + sujet[1:]
        return f"{sujet} : de (min) à (max)."

    # Cas 5: "[Sujet]. De X à Y." ou "[Sujet] - De X à Y"
    m = re.match(r"^(.+?)[\.\,\-]\s+[Dd]e\s+(.+?)\s+[àa]\s+(.+?)\.?$", t, re.IGNORECASE)
    if m:
        sujet = m.group(1).strip()
        return f"{sujet} : de (min) à (max)."

    # Cas 6: "[Sujet]. Du X au Y."
    m = re.match(r"^(.+?)[\.\,\-]\s+[Dd]u\s+(.+?)\s+[àa]u\s+(.+?)\.?$", t, re.IGNORECASE)
    if m:
        sujet = m.group(1).strip()
        return f"{sujet} : de (min) à (max)."

    # Cas 7: "[Sujet]. Niveau de X : de Y à Z."
    m = re.match(r"^(.+?)\s+[Dd]e\s+(.+?)\s+[àa]\s+(.+?)\.?$", t, re.IGNORECASE)
    if m:
        sujet = m.group(1).strip()
        return f"{sujet} : de (min) à (max)."

    # Fallback si aucun pattern n'a matché : ajouter ": de (min) à (max)."
    clean = t.rstrip('. ')
    return f"{clean} : de (min) à (max)."

if __name__ == '__main__':
    with open('loustic-backend/src/main/resources/data/classemoica.json') as f:
        data = json.load(f)

    samples = []
    for section in ['pairs', 'themes', 'hotThemes']:
        for it in data.get(section, []):
            if isinstance(it, dict):
                for k in ['themeA', 'themeB']:
                    if k in it:
                        orig = it[k]
                        trans = transform_phrase(orig)
                        if len(samples) < 25:
                            samples.append((orig, trans))
            elif isinstance(it, str):
                orig = it
                trans = transform_phrase(orig)
                if len(samples) < 25:
                    samples.append((orig, trans))

    for orig, trans in samples:
        print(f"ORIG : {orig}")
        print(f"TRANS: {trans}\n")
