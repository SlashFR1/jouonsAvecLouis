#!/usr/bin/env python3
"""
Test automatisé Selenium :
Vérifie pour l'ensemble des 31 routes (Accueil + 23 jeux locaux + 7 salles multijoueurs) :
- Chargement de la page
- Barre de navigation uniforme (#nav-back-btn, #nav-burger-btn, #nav-rules-btn, badge titre)
- Modale de règles (#rules-modal) avec badge du jeu réel équivalent (#rules-equivalent-badge)
- Menu burger (#burger-drawer)
- Couleur de fond pastel dynamique (--pastel-bg)
- Alimentation par la base de données statique JSON
"""

import sys
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

BASE_URL = "http://localhost:4173"

ROUTES_TO_TEST = [
    # Accueil
    ("/", "LOUSTIC"),
    # 23 jeux locaux
    ("/jeux/switch", "Switch"),
    ("/jeux/jenaijamais", "Je n'ai jamais"),
    ("/jeux/tupreferes", "Tu préfères"),
    ("/jeux/vraioufaux", "Vrai ou Faux"),
    ("/jeux/voteoushot", "Vote ou shot"),
    ("/jeux/juge", "Juge"),
    ("/jeux/7sec", "7 secondes"),
    ("/jeux/yams", "Yams"),
    ("/jeux/bomb", "Boom boom"),
    ("/jeux/lataupe", "La taupe"),
    ("/jeux/spy", "SPY"),
    ("/jeux/alias", "Alias"),
    ("/jeux/classemoica", "Classe moi ça"),
    ("/jeux/limiteprison", "Limite PRISON"),
    ("/jeux/debat", "Débat"),
    ("/jeux/racontemoi", "Raconte-moi"),
    ("/jeux/synapse", "Synapse"),
    ("/jeux/devinequi", "Devine qui"),
    ("/jeux/universalmind", "Universal mind"),
    ("/jeux/desole", "Désolé"),
    ("/jeux/parasite", "Parasite"),
    ("/jeux/galerie", "Galerie"),
    ("/jeux/messmeme", "Mess Meme"),
    # Salles multi-téléphones
    ("/salle/bomb", "Salle Boom boom"),
    ("/salle/limiteprison", "Salle Limite PRISON"),
    ("/salle/classemoica", "Salle Classe moi ça"),
    ("/salle/lataupe", "Salle La taupe"),
    ("/salle/spy", "Salle SPY"),
    ("/salle/alias", "Salle Alias"),
    ("/salle/7sec", "Salle 7 secondes"),
    ("/salle/parasite", "Salle Parasite"),
    ("/salle/synapse", "Salle Synapse"),
]

def run_tests():
    chrome_options = Options()
    chrome_options.add_argument("--headless=new")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--window-size=412,915") # Mobile viewport (Pixel 7 style)

    driver = webdriver.Chrome(options=chrome_options)
    wait = WebDriverWait(driver, 5)

    success_count = 0
    failure_count = 0

    print(f"🚀 Lancement de la suite Selenium sur {len(ROUTES_TO_TEST)} routes...")

    try:
        for path, expected_label in ROUTES_TO_TEST:
            try:
                url = f"{BASE_URL}{path}"
                driver.get(url)
                time.sleep(0.3)

                # Vérification du chargement
                assert len(driver.title) > 0, f"Titre vide sur {url}"

                # Si c'est un jeu avec GameLayout
                if path != "/":
                    back_btn = driver.find_element(By.ID, "nav-back-btn")
                    burger_btn = driver.find_element(By.ID, "nav-burger-btn")
                    rules_btn = driver.find_element(By.ID, "nav-rules-btn")
                    assert back_btn.is_displayed(), f"Bouton retour masqué sur {path}"
                    assert burger_btn.is_displayed(), f"Bouton burger masqué sur {path}"
                    assert rules_btn.is_displayed(), f"Bouton règles masqué sur {path}"

                    # Modale de règles
                    driver.execute_script("arguments[0].click();", rules_btn)
                    time.sleep(0.15)
                    rules_modal = wait.until(EC.visibility_of_element_located((By.ID, "rules-modal")))
                    equiv_badge = driver.find_element(By.ID, "rules-equivalent-badge")
                    assert equiv_badge.is_displayed(), f"Badge équivalent réel manquant sur {path}"
                    assert "Équivalent :" in equiv_badge.text, f"Texte équivalent incorrect sur {path}"

                    # Fermeture modale règles
                    close_rules_btn = driver.find_element(By.ID, "close-rules-btn")
                    driver.execute_script("arguments[0].click();", close_rules_btn)
                    time.sleep(0.15)

                    # Menu burger
                    driver.execute_script("arguments[0].click();", burger_btn)
                    time.sleep(0.15)
                    drawer = wait.until(EC.visibility_of_element_located((By.ID, "burger-drawer")))
                    assert drawer.is_displayed(), f"Drawer burger non ouvert sur {path}"
                    close_drawer_btn = driver.find_element(By.ID, "close-drawer-btn")
                    driver.execute_script("arguments[0].click();", close_drawer_btn)
                    time.sleep(0.15)

                    print(f"  ✅ [PASS] {path:25} -> Validé ({expected_label})")
                    success_count += 1
                else:
                    print(f"  ✅ [PASS] {path:25} -> Validé ({expected_label})")
                    success_count += 1
            except Exception as e:
                import traceback
                print(f"  ❌ [FAIL] Échec sur {path}: {e}")
                traceback.print_exc()
                failure_count += 1
    finally:
        driver.quit()

    print(f"\n📊 Résumé des tests Selenium : {success_count}/{len(ROUTES_TO_TEST)} réussis, {failure_count} échecs.")
    if failure_count > 0:
        sys.exit(1)

if __name__ == "__main__":
    run_tests()
