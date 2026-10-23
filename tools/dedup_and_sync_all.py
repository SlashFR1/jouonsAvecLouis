# -*- coding: utf-8 -*-
import json, os, csv

FRONT_DIR = 'loustic-frontend/src/data'
BACK_DIR = 'loustic-backend/src/main/resources/data'

def load_json(name):
    path = os.path.join(FRONT_DIR, name)
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(name, data):
    for d in [FRONT_DIR, BACK_DIR]:
        path = os.path.join(d, name)
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"Saved {path}")

def clean_duplicates_list(lst, key=None):
    seen = set()
    result = []
    for item in lst:
        val = item if key is None else item.get(key)
        if isinstance(val, dict): val = str(val)
        norm = str(val).strip().lower()
        if norm not in seen:
            seen.add(norm)
            result.append(item)
    return result

# 1. Peurs & Phobies add 2 questions
vof = load_json('vraioufaux.json')
vof['affirmations']['Peurs & Phobies 😱'].append({
    "question": "L'aichmophobie est la peur morbide des objets pointus comme les couteaux ou crayons taillés",
    "answer": True
})
vof['affirmations']['Peurs & Phobies 😱'].append({
    "question": "La pharmacophobie est la peur irrationnelle de prendre des médicaments",
    "answer": True
})
vof['affirmations']['Peurs & Phobies 😱'] = clean_duplicates_list(vof['affirmations']['Peurs & Phobies 😱'], key='question')
save_json('vraioufaux.json', vof)
print(f"Peurs & Phobies: {len(vof['affirmations']['Peurs & Phobies 😱'])} questions.")

# 2. Sync debat.csv
debat = load_json('debat.json')
csv_debat = os.path.join(BACK_DIR, 'debat.csv')
with open(csv_debat, 'w', encoding='utf-8', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['id', 'format', 'mode', 'sujet'])
    idx = 1
    for fmt, sub in debat.items():
        for mode, lst in sub.items():
            for t in lst:
                writer.writerow([idx, fmt, mode, t])
                idx += 1
print(f"Saved {csv_debat} ({idx-1} rows)")

# 3. Deduplicate alias.json & alias_words.csv
alias = load_json('alias.json')
alias['words'] = clean_duplicates_list(alias['words'])
save_json('alias.json', alias)
csv_alias = os.path.join(BACK_DIR, 'alias_words.csv')
with open(csv_alias, 'w', encoding='utf-8', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['id', 'mot'])
    for i, w in enumerate(alias['words'], 1):
        writer.writerow([i, w])
print(f"Alias: {len(alias['words'])} words, saved {csv_alias}")

# 4. Deduplicate jenaijamais.json & jenaijamais.csv
jnj = load_json('jenaijamais.json')
jnj['normal'] = clean_duplicates_list(jnj['normal'])
jnj['hot'] = clean_duplicates_list(jnj['hot'])
save_json('jenaijamais.json', jnj)
csv_jnj = os.path.join(BACK_DIR, 'jenaijamais.csv')
with open(csv_jnj, 'w', encoding='utf-8', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['id', 'mode', 'texte'])
    idx = 1
    for t in jnj['normal']:
        writer.writerow([idx, 'normal', t])
        idx += 1
    for t in jnj['hot']:
        writer.writerow([idx, 'hot', t])
        idx += 1
print(f"JeNaiJamais: {len(jnj['normal'])} normal, {len(jnj['hot'])} hot, saved {csv_jnj}")

# 5. Deduplicate limiteprison.json & csv
lp = load_json('limiteprison.json')
lp['blackCards'] = clean_duplicates_list(lp['blackCards'], key='text')
lp['whiteCards'] = clean_duplicates_list(lp['whiteCards'], key='text')
lp['totalBlackCards'] = len(lp['blackCards'])
lp['totalWhiteCards'] = len(lp['whiteCards'])
lp['questions'] = [c['text'] for c in lp['blackCards']]
lp['answers'] = [c['text'] for c in lp['whiteCards']]
save_json('limiteprison.json', lp)

csv_lp_q = os.path.join(BACK_DIR, 'limiteprison_questions.csv')
with open(csv_lp_q, 'w', encoding='utf-8', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['id', 'texte', 'blanksCount'])
    for i, c in enumerate(lp['blackCards'], 1):
        writer.writerow([i, c.get('text', ''), c.get('blanksCount', 1)])
print(f"LimitePrison: {len(lp['blackCards'])} black cards, saved {csv_lp_q}")

csv_lp_a = os.path.join(BACK_DIR, 'limiteprison_answers.csv')
with open(csv_lp_a, 'w', encoding='utf-8', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['id', 'texte'])
    for i, c in enumerate(lp['whiteCards'], 1):
        writer.writerow([i, c.get('text', '')])
print(f"LimitePrison: {len(lp['whiteCards'])} white cards, saved {csv_lp_a}")

# 6. Deduplicate switch.json & switch_tasks.csv
sw = load_json('switch.json')
sw['normal'] = clean_duplicates_list(sw['normal'])
sw['hot'] = clean_duplicates_list(sw['hot'])
save_json('switch.json', sw)

csv_sw = os.path.join(BACK_DIR, 'switch_tasks.csv')
with open(csv_sw, 'w', encoding='utf-8', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['id', 'mode', 'action'])
    idx = 1
    for a in sw['normal']:
        writer.writerow([idx, 'normal', a])
        idx += 1
    for a in sw['hot']:
        writer.writerow([idx, 'hot', a])
        idx += 1
print(f"Switch: {len(sw['normal'])} normal, {len(sw['hot'])} hot, saved {csv_sw}")

# 7. Deduplicate voteoushot.json & voteoushot.csv
vos = load_json('voteoushot.json')
vos['questions'] = clean_duplicates_list(vos['questions'])
save_json('voteoushot.json', vos)

csv_vos = os.path.join(BACK_DIR, 'voteoushot.csv')
with open(csv_vos, 'w', encoding='utf-8', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['id', 'question'])
    for i, q in enumerate(vos['questions'], 1):
        wr
        iter.writerow([i, q])
print(f"VoteOuShot: {len(vos['questions'])} questions, saved {csv_vos}")
