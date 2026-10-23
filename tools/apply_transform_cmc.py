import json
import re

def transform_phrase(t):
    if not isinstance(t, str):
        return t
    t = t.strip()

    if '(min)' in t and '(max)' in t:
        return t

    # Cas 1: "De la pire à la meilleure [suite]"
    m = re.match(r"^[Dd]e la pire [àa] la meilleure (.+)$", t, re.IGNORECASE)
    if m:
        rest = m.group(1).rstrip('. ')
        if rest and rest[0].islower():
            rest = rest[0].upper() + rest[1:]
        return f"{rest} : de (min) à (max)."

    # Cas 2: "Du pire au meilleur [suite]"
    m = re.match(r"^[Dd]u pire [àa]u meilleur (.+)$", t, re.IGNORECASE)
    if m:
        rest = m.group(1).rstrip('. ')
        if rest and rest[0].islower():
            rest = rest[0].upper() + rest[1:]
        return f"{rest} : de (min) à (max)."

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

def process_file(path):
    print(f"Processing {path}...")
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    for section in ['pairs', 'themes', 'hotThemes']:
        if section in data:
            new_list = []
            for it in data[section]:
                if isinstance(it, dict):
                    new_dict = dict(it)
                    for k in ['themeA', 'themeB']:
                        if k in new_dict:
                            new_dict[k] = transform_phrase(new_dict[k])
                    new_list.append(new_dict)
                elif isinstance(it, str):
                    new_list.append(transform_phrase(it))
                else:
                    new_list.append(it)
            data[section] = new_list

    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"✅ Successfully updated {path}")

if __name__ == '__main__':
    process_file('loustic-backend/src/main/resources/data/classemoica.json')
    process_file('loustic-frontend/src/data/classemoica.json')
