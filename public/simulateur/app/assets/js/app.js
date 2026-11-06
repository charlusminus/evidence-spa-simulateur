/* Simulateur Évidence Spa : démonstration proposée par Paktiz.
   Parcours : photo, spa, accès, coordonnées, rendu. Le rendu réaliste est calculé côté serveur
   ; sans webhook, ou avec ?demo=1, la page reste jouable en mode démonstration. */
(function () {
  'use strict';
  const CFG = window.ES_CONFIG || {};
  const Q = new URLSearchParams(location.search);
  const DEMO = Q.get('demo') === '1' || !CFG.webhook;
  const INTEGRE = Q.get('integre') === '1';
  const SPA_FIXE = Q.get('spa') || '';
  if (INTEGRE) document.documentElement.classList.add('integre');
  // En mode intégré, la page hôte ajuste la hauteur du cadre à chaque changement
  function annonceHauteur(haut) {
    if (!INTEGRE || window.parent === window) return;
    const h = Math.ceil(document.documentElement.scrollHeight);
    window.parent.postMessage({ type: 'es-simu-hauteur', hauteur: h, haut: !!haut }, location.origin);
  }
  if (INTEGRE) { new ResizeObserver(() => annonceHauteur(false)).observe(document.body); }
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const euro = (n) => n == null ? 'Sur devis' : new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n) + ' €';

  const S = {
    step: 0, cat: null, photo: null, place: null, spa: null, finition: null,
    filtrePlaces: 'tous', filtreCol: 'tous', formule: null, envoi: false,
    leadId: null, renduSrc: null, tracking: tracking()
  };

  function tracking() {
    const t = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'].forEach((k) => { t[k] = Q.get(k) || ''; });
    t.referrer = document.referrer || '';
    return t;
  }
  function uid() {
    const a = new Uint8Array(8); crypto.getRandomValues(a);
    return 'ES-' + new Date().toISOString().slice(2, 10).replace(/-/g, '') + '-' + Array.from(a, (b) => b.toString(16).padStart(2, '0')).join('').slice(0, 8);
  }

  /* ---------- Catalogue ---------- */
  async function chargeCatalogue() {
    if (window.ES_CATALOGUE) return window.ES_CATALOGUE;
    const r = await fetch('assets/data/catalogue.json', { cache: 'no-cache' });
    return r.json();
  }
  const spaCourant = () => S.cat.spas.find((s) => s.cle === S.spa);

  /* ---------- Navigation ---------- */
  function montre(step, depuis) {
    if (step === 2 && SPA_FIXE && S.spa === SPA_FIXE) step = (depuis === 3) ? 1 : 3;
    S.step = step;
    $$('section.step').forEach((s) => s.classList.toggle('hidden', +s.dataset.step !== step));
    $('#actions').classList.toggle('hidden', step === 0 || step === 5);
    $('#suivant').textContent = step === 4 ? 'Voir mon spa chez moi' : 'Continuer';
    if (step === 3) bilanAcces();
    if (step === 4) { suggereShowroom(); rendTurnstile(); }
    valide();
    if (INTEGRE) annonceHauteur(step > 0); else window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    const h = $(`section[data-step="${step}"] h1, section[data-step="${step}"] h2`);
    if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
  }
  /* Étapes cliquables : une étape s'ouvre dès que les précédentes sont remplies ; rien n'est effacé en revenant. */
  const ETAPES = ['Photo', 'Spa', 'Accès', 'Coordonnées'];
  function etapeOk(k) {
    if (k === 1) return !!S.photo;
    if (k === 2) return !!S.spa;
    if (k === 3) return (+$('#passage').value >= 40 || $('#passage-inconnu').checked) && !!S.formule;
    return true;
  }
  const accessible = (k) => { for (let j = 1; j < k; j++) if (!etapeOk(j)) return false; return true; };
  function majEtapes() {
    $$('nav.progress').forEach((nav) => {
      nav.innerHTML = ETAPES.map((nom, i) => {
        const k = i + 1, ici = k === S.step, on = k <= S.step;
        return `<button type="button" data-etape="${k}" class="${ici ? 'ici ' : ''}${on ? 'on' : ''}" ${accessible(k) && !ici ? '' : 'disabled'} ${ici ? 'aria-current="step"' : ''}>${k}. ${nom}</button>`;
      }).join('');
    });
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('nav.progress button[data-etape]');
    if (b && !b.disabled) montre(+b.dataset.etape);
  });
  function aDesDonnees() {
    return !!(S.photo || S.spa || $('#passage').value || $('#prenom').value || $('#email').value);
  }

  function valide() {
    let ok = false;
    if (S.step === 1) ok = !!S.photo;
    else if (S.step === 2) ok = !!S.spa;
    else if (S.step === 3) ok = +$('#passage').value >= 40 && !!S.formule;
    else if (S.step === 4) ok = true;
    $('#suivant').disabled = !ok;
    const attendu = { 1: 'Ajoutez une photo', 2: 'Choisissez un modèle', 3: 'Indiquez le passage' }[S.step];
    if (S.step < 4) $('#suivant').textContent = ok || !attendu ? 'Continuer' : attendu;
    majEtapes();
  }

  /* ---------- Étape 1 : photo ---------- */
  async function lisPhoto(file) {
    let src;
    try {
      src = await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch (e) {
      src = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = URL.createObjectURL(file); });
    }
    const max = 1600, k = Math.min(1, max / Math.max(src.width, src.height));
    const w = Math.round(src.width * k), h = Math.round(src.height * k);
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    c.getContext('2d').drawImage(src, 0, 0, w, h);
    return { dataUrl: c.toDataURL('image/jpeg', 0.85), w, h, exemple: false };
  }
  async function exemplePhoto() {
    const img = await new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.src = CFG.jardinExemple; });
    const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
    c.getContext('2d').drawImage(img, 0, 0);
    return { dataUrl: c.toDataURL('image/jpeg', 0.88), w: c.width, h: c.height, exemple: true };
  }
  function affichePhoto() {
    $('#photo-img').src = S.photo.dataUrl;
    $('#photo-apercu').classList.remove('hidden');
    $('#drop').classList.add('hidden');
    $('#photo-exemple').classList.add('hidden');
    S.place = null; $('#marker').classList.add('hidden');
    valide();
  }
  function initPhoto() {
    // Deux entrées : l'appareil photo (capture, sinon Android n'ouvre que la galerie) et les photos existantes
    ['#photo-input', '#photo-camera'].forEach((sel) => $(sel).addEventListener('change', async (e) => {
      const f = e.target.files && e.target.files[0]; if (!f) return;
      try { S.photo = await lisPhoto(f); affichePhoto(); } catch (err) { alert('Cette image ne peut pas être lue. Essayez une photo JPEG ou PNG.'); }
      e.target.value = '';
    }));
    document.querySelectorAll('.drop-actions label').forEach((l) => l.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); l.click(); } }));
    $('#photo-exemple').addEventListener('click', async () => { S.photo = await exemplePhoto(); affichePhoto(); });
    $('#photo-changer').addEventListener('click', () => {
      S.photo = null; $('#photo-apercu').classList.add('hidden'); $('#drop').classList.remove('hidden'); $('#photo-exemple').classList.remove('hidden'); valide();
    });
    $('#photo-zone').addEventListener('click', (e) => {
      const r = $('#photo-img').getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      if (x < 0 || x > 1 || y < 0 || y > 1) return;
      S.place = { x: +x.toFixed(3), y: +y.toFixed(3) };
      const m = $('#marker'); m.style.left = (x * 100) + '%'; m.style.top = (y * 100) + '%'; m.classList.remove('hidden');
    });
  }

  /* ---------- Étape 2 : spa ---------- */
  function placesOk(s) {
    const p = s.places || 0;
    if (S.filtrePlaces === '2-3') return p <= 3;
    if (S.filtrePlaces === '4-6') return p >= 4 && p <= 6;
    if (S.filtrePlaces === '7+') return p >= 7;
    return true;
  }
  function grille() {
    const g = $('#grille'); g.innerHTML = '';
    S.cat.spas.filter((s) => placesOk(s) && (S.filtreCol === 'tous' || s.collection === S.filtreCol)).forEach((s) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'carte'; b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', String(S.spa === s.cle)); b.dataset.cle = s.cle;
      const puces = [s.places + ' places' + (s.allongees ? ', dont ' + s.allongees + (s.allongees > 1 ? ' allongées' : ' allongée') : ', tout assis'), s.longueur + ' × ' + s.largeur + ' cm'];
      b.innerHTML = `<img src="${s.img.vignette}" alt="" loading="lazy" width="104" height="104">
        <div>${s.collection === 'bullfrog' ? '<div class="marque">Bullfrog Spas</div>' : ''}
        <h3>${s.nom}</h3>
        <div class="prix">${euro(s.prix)}${s.prix ? '' : ' <small>proposition au showroom</small>'}</div>
        <p class="carac">${puces.join(' · ')}</p></div>`;
      b.addEventListener('click', () => choisitSpa(s.cle));
      g.appendChild(b);
    });
  }
  function choisitSpa(cle) {
    S.spa = cle; const s = spaCourant();
    S.finition = s.finitions.length ? s.finitions[0].cle : null;
    $$('#grille .carte').forEach((c) => c.setAttribute('aria-checked', String(c.dataset.cle === cle)));
    const f = $('#finitions');
    if (s.finitions.length) {
      f.classList.remove('hidden');
      f.innerHTML = `<p class="eyebrow">Finition ${s.nom}</p><div class="choix">${s.finitions.map((x, i) =>
        `<label><input type="radio" name="finition" value="${x.cle}" ${i === 0 ? 'checked' : ''}> <span><b>${x.nom}</b><br><span class="note">${x.description || ''}</span></span></label>`).join('')}</div>`;
      $$('input[name=finition]', f).forEach((i) => i.addEventListener('change', () => { S.finition = i.value; }));
    } else { f.classList.add('hidden'); f.innerHTML = ''; }
    valide();
  }
  function initSpa() {
    $$('[data-filtre-places]').forEach((b) => b.addEventListener('click', () => {
      S.filtrePlaces = b.dataset.filtrePlaces; $$('[data-filtre-places]').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); grille();
    }));
    $$('[data-filtre-col]').forEach((b) => b.addEventListener('click', () => {
      S.filtreCol = b.dataset.filtreCol; $$('[data-filtre-col]').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); grille();
    }));
    grille();
  }

  /* ---------- Étape 3 : accès ---------- */
  const radio = (n) => ($(`input[name=${n}]:checked`) || {}).value;
  function analyseAcces() {
    const s = spaCourant();
    const passage = +$('#passage').value || 0;
    const requis = (s.hauteur || 90) + 15; // spa transporté sur la tranche, chariot compris
    const marches = radio('marches'), distance = radio('distance'), sol = radio('sol');
    const inconnu = $('#passage-inconnu').checked && !passage;
    const levage = passage > 0 && passage < requis || marches === 'escalier';
    return { passage, requis, marches, distance, sol, levage, inconnu };
  }
  function bilanAcces() {
    const b = $('#bilan'); const a = analyseAcces(); const s = spaCourant();
    if (!a.passage && !a.inconnu) { b.classList.add('hidden'); S.formule = null; valide(); return; }
    b.classList.remove('hidden'); b.classList.toggle('alerte', a.levage);
    const forms = S.cat.livraison;
    const conseil = a.levage ? 'levage' : 'installation';
    if (!S.formule || (a.levage && S.formule !== 'levage') || (!a.levage && S.formule === 'levage')) S.formule = conseil;
    const raisons = [];
    if (a.passage < a.requis) raisons.push(`le ${s.nom} passe sur la tranche : il lui faut environ ${a.requis} cm, vous indiquez ${a.passage} cm`);
    if (a.marches === 'escalier') raisons.push('un escalier ou une forte pente demande un levage ou une manutention spéciale');
    const titre = a.levage ? 'Un levage est probablement nécessaire.' : a.inconnu ? 'L\'équipe vérifiera l\'accès avec vous.' : 'Le passage semble suffisant.';
    const texte = a.levage ? raisons.join(' ; ') + '. L\'équipe étudie l\'accès avec ses partenaires de levage.'
      : a.inconnu ? `Le ${s.nom} passe sur la tranche : prévoyez environ ${a.requis} cm au point le plus étroit. Nous recommandons la formule installée, ajustée après vérification.`
      : `Le ${s.nom} mesure ${s.hauteur_affichee} cm de haut et passe sur la tranche : ${a.requis} cm de passage suffisent, vous avez ${a.passage} cm.` +
        (a.marches === 'quelques' ? ' Les quelques marches se franchissent à la manutention.' : '') +
        (a.distance === 'plus-30' ? ' Au-delà de 30 m, la manutention est à confirmer.' : '');
    const sol = a.sol === 'a-preparer' ? '<p class="note">Le spa se pose sur un support plan et stable (dalle ou plots) : à prévoir avant la livraison.</p>'
      : a.sol === 'inconnu' ? '<p class="note">Le support (dalle ou plots) se vérifie avec l\'équipe avant la livraison.</p>' : '';
    const opts = forms.filter((f) => a.levage ? f.cle === 'levage' || f.cle === 'retrait' : f.cle !== 'levage');
    b.innerHTML = `<h3>${titre}</h3><p style="margin:0">${texte}</p>${sol}
      <div class="choix formules" role="radiogroup" aria-label="Formule de livraison">${opts.map((f) =>
        `<label><input type="radio" name="formule" value="${f.cle}" ${S.formule === f.cle ? 'checked' : ''}><span><b>${f.nom}</b><br><span class="tarif">${f.prix === 0 ? 'Gratuit' : euro(f.prix)}${f.cle === conseil ? ' · recommandée' : ''}</span><br><span class="note">${f.detail}</span></span></label>`).join('')}</div>
      <p class="note" style="margin:10px 0 0">Forfaits publiés par Évidence Spa, confirmés selon votre adresse et l'accès.</p>`;
    $$('input[name=formule]', b).forEach((i) => i.addEventListener('change', () => { S.formule = i.value; valide(); }));
    valide();
  }
  function initAcces() {
    $('#passage').addEventListener('input', () => { if ($('#passage').value) $('#passage-inconnu').checked = false; bilanAcces(); });
    $('#passage-inconnu').addEventListener('change', () => { if ($('#passage-inconnu').checked) $('#passage').value = ''; bilanAcces(); });
    $$('#s-acces input[type=radio]').forEach((i) => i.addEventListener('change', bilanAcces));
  }

  /* ---------- Étape 4 : coordonnées ---------- */
  function km(a, b) {
    const R = 6371, r = Math.PI / 180, dLat = (b.lat - a.lat) * r, dLon = (b.lon - a.lon) * r;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }
  let cpFait = '';
  async function suggereShowroom() {
    const cp = $('#cp').value.trim();
    if (!/^\d{5}$/.test(cp) || cp === cpFait) return;
    cpFait = cp;
    try {
      const r = await fetch(`https://geo.api.gouv.fr/communes?codePostal=${cp}&fields=nom,centre&format=json`, { credentials: 'omit' });
      const c = (await r.json())[0]; if (!c || !c.centre) return;
      const pt = { lat: c.centre.coordinates[1], lon: c.centre.coordinates[0] };
      const d = S.cat.showrooms.map((s) => ({ s, d: km(pt, s) })).sort((x, y) => x.d - y.d);
      const proche = d[0];
      if (proche.d > 120) {
        $('#showroom').value = 'distance';
        $('#showroom-aide').textContent = `${c.nom} : le showroom le plus proche (${proche.s.nom}) est à ${Math.round(proche.d)} km. Un échange à distance est possible ; la livraison couvre toute la France.`;
      } else {
        $('#showroom').value = proche.s.cle;
        $('#showroom-aide').textContent = `${c.nom} : showroom de ${proche.s.nom} à ${Math.round(proche.d)} km.`;
      }
      majRdv();
    } catch (e) { /* le choix manuel reste possible */ }
  }
  function majRdv() {
    const sans = $('#showroom').value === 'aucun';
    $$('.rdv-champ').forEach((x) => x.classList.toggle('hidden', sans));
  }
  function erreurForm(t) { const e = $('#form-erreur'); e.textContent = t; e.classList.toggle('hidden', !t); }
  function lisContact() {
    const v = (id) => $('#' + id).value.trim();
    const c = { prenom: v('prenom'), nom: v('nom'), email: v('email'), telephone: v('tel'), code_postal: v('cp') };
    if (!c.prenom) return erreurForm('Indiquez votre prénom.'), null;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c.email)) return erreurForm('Cette adresse e-mail semble incomplète.'), null;
    if (c.code_postal && !/^\d{5}$/.test(c.code_postal)) return erreurForm('Le code postal compte cinq chiffres.'), null;
    if (!$('#consent').checked) return erreurForm('Merci de cocher l\'accord pour l\'utilisation de la photo et des coordonnées.'), null;
    erreurForm('');
    return c;
  }
  function initContact() {
    $('#cp').addEventListener('input', () => { if ($('#cp').value.trim().length === 5) suggereShowroom(); });
    $('#showroom').addEventListener('change', majRdv);
    const d = new Date(); d.setDate(d.getDate() + 1); $('#date').min = d.toISOString().slice(0, 10);
  }

  /* ---------- Turnstile (anti-robot, widget dédié Évidence Spa) ---------- */
  let tsId = null;
  function rendTurnstile() {
    if (DEMO || !CFG.turnstileSiteKey || !window.turnstile || tsId !== null) return;
    const box = $('#turnstile-box'); if (!box || box.closest('.hidden')) return;
    try { tsId = turnstile.render('#turnstile-box', { sitekey: CFG.turnstileSiteKey, theme: 'light', language: 'fr', action: 'simulateur' }); } catch (e) {}
  }
  window.esTurnstile = rendTurnstile;
  const jeton = () => { try { return tsId !== null ? turnstile.getResponse(tsId) || '' : ''; } catch (e) { return ''; } };
  const resetTs = () => { try { if (tsId !== null) turnstile.reset(tsId); } catch (e) {} };

  /* ---------- Envoi et rendu ---------- */
  function recapLocal() {
    const s = spaCourant(), f = S.cat.livraison.find((x) => x.cle === S.formule);
    const total = s.prix != null && f && f.prix != null ? s.prix + f.prix : null;
    return { spa: s.nom_complet, finition: (s.finitions.find((x) => x.cle === S.finition) || {}).nom || '', prix_spa: s.prix, formule: f ? f.nom : '', prix_formule: f ? f.prix : null, total };
  }
  function payload(contact) {
    const a = analyseAcces();
    return {
      lead_id: S.leadId, photo: S.photo.dataUrl, photo_w: S.photo.w, photo_h: S.photo.h, photo_exemple: S.photo.exemple,
      place: S.place, spa: S.spa, finition: S.finition,
      acces: { passage_cm: a.passage, requis_cm: a.requis, marches: a.marches, distance: a.distance, sol: a.sol, levage: a.levage, inconnu: !!a.inconnu },
      formule: S.formule, contact,
      rdv: { showroom: $('#showroom').value, date: $('#date').value, moment: $('#moment').value, message: $('#message').value.trim() },
      consent: true, site: $('#site').value, captcha: jeton(), tracking: S.tracking, page: location.href.split('?')[0]
    };
  }
  let timer = null;
  function attente(on) {
    $('#attente').classList.toggle('hidden', !on);
    clearInterval(timer);
    if (!on) return;
    $('#resultat').classList.add('hidden'); $('#echec').classList.add('hidden');
    const li = $$('#attente-etapes li'); li.forEach((x) => x.className = '');
    let i = 0; li[0].className = 'encours';
    timer = setInterval(() => { if (i < li.length - 1) { li[i].className = 'fait'; i++; li[i].className = 'encours'; } }, 9000);
  }
  async function envoie() {
    const contact = lisContact(); if (!contact) return;
    if (!DEMO && CFG.turnstileSiteKey && !jeton()) { erreurForm('Merci de patienter pendant la vérification anti-robot, puis réessayez.'); rendTurnstile(); return; }
    if (S.envoi) return; S.envoi = true;
    S.leadId = uid();
    montre(5); attente(true);
    const p = payload(contact);
    try {
      let rep;
      if (DEMO) rep = await renduDemo();
      else {
        const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), CFG.timeoutMs || 150000);
        const r = await fetch(CFG.webhook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p), signal: ctl.signal, credentials: 'omit' });
        clearTimeout(to);
        rep = await r.json().catch(() => ({ ok: false, raison: r.ok ? 'reponse' : 'rendu' }));
      }
      if (!rep.ok) throw rep;
      resultat(rep, contact);
    } catch (e) {
      echec(e && e.raison);
    } finally { S.envoi = false; attente(false); resetTs(); }
  }
  function echec(raison) {
    $('#echec').classList.remove('hidden');
    const t = {
      plafond: 'Le nombre de rendus de démonstration du jour est atteint. Réessayez demain, ou appelez le showroom au 02 85 52 22 59.',
      captcha: 'La vérification anti-robot a expiré. Revenez à l\'étape précédente puis renvoyez la demande.',
      origine: 'Cette page n\'est pas autorisée à envoyer des demandes.',
      plafond_email: 'Vous avez déjà demandé trois rendus aujourd\'hui avec cette adresse. Les précédents sont dans votre boîte e-mail.',
      validation: 'Une information manque dans la demande. Revenez à l\'étape précédente pour vérifier.',
      rendu: 'Le service de rendu n\'a pas répondu à temps. Votre demande est bien enregistrée : vous recevrez le rendu par e-mail dès qu\'il sera prêt.'
    };
    $('#echec-texte').textContent = t[raison] || 'La connexion a été interrompue. Vérifiez votre réseau puis réessayez ; votre photo et vos choix sont conservés.';
  }
  function resultat(rep, contact) {
    $('#resultat').classList.remove('hidden');
    const s = spaCourant();
    S.renduSrc = rep.image ? 'data:' + (rep.mime || 'image/png') + ';base64,' + rep.image : rep.image_url;
    $('#res-img').src = S.renduSrc; $('#telecharger').href = S.renduSrc;
    $('#res-badge').textContent = 'Montage de démonstration'; $('#res-badge').classList.toggle('hidden', !rep.montage);
    $('#res-note').textContent = rep.montage
      ? 'Mode démonstration : simple montage du visuel du modèle. Le rendu réaliste (échelle, lumière, ombres) est calculé par le service de rendu.'
      : 'Rendu indicatif : proportions respectées, aspect final selon la finition et l\'installation.';
    $('#res-titre').innerHTML = `${s.nom}, <em>chez vous.</em>`;
    const r = rep.recap || recapLocal();
    $('#recap').innerHTML = `<p class="eyebrow">Récapitulatif</p><h3>${r.spa}${r.finition ? ' · ' + r.finition : ''}</h3>
      <dl><dt>Spa</dt><dd>${euro(r.prix_spa)}</dd><dt>${r.formule}</dt><dd>${r.prix_formule === 0 ? 'Gratuit' : euro(r.prix_formule)}</dd>
      ${r.total != null ? `<dt class="total">Total estimatif TTC</dt><dd class="total">${euro(r.total)}</dd>` : ''}</dl>
      <p class="note" style="margin:10px 0 0">Prix publiés par Évidence Spa. Le montant se confirme après l'étude de l'accès, avec une proposition détaillée.</p>`;
    const sr = $('#showroom').value, srNom = { coueron: 'Couëron', 'saint-brevin': 'Saint-Brevin-les-Pins' }[sr];
    $('#rdv').innerHTML = sr === 'aucun'
      ? `<p class="eyebrow">Et ensuite</p><h3>Le rendu est dans votre boîte e-mail.</h3><p>Pour voir le spa en vrai et comparer les places, les showrooms reçoivent sur rendez-vous : 02 85 52 22 59.</p>`
      : `<p class="eyebrow">Votre rendez-vous</p><h3>${srNom ? 'Showroom de ' + srNom : 'Échange à distance'}</h3>
        <p>L'équipe vous rappelle pour confirmer le créneau ; aucun rendez-vous n'est réservé automatiquement.</p>
        <p>${DEMO ? 'En démonstration, aucun e-mail n\'est envoyé.' : 'Rendu et récapitulatif envoyés à ' + contact.email.replace(/</g, '') + '.'}</p>`;
    $('#voir-apres').setAttribute('aria-pressed', 'true'); $('#voir-avant').setAttribute('aria-pressed', 'false');
  }

  /* Mode démonstration : rendu d'exemple pré-calculé, sinon montage simple, signalé comme tel. */
  async function renduDemo() {
    await new Promise((r) => setTimeout(r, 2200));
    if (S.photo.exemple && CFG.exemples && CFG.exemples[S.spa]) return { ok: true, image_url: CFG.exemples[S.spa], montage: false };
    const s = spaCourant();
    const fond = await charge(S.photo.dataUrl), spa = await charge(s.img.trois_quarts || s.img.dessus);
    const c = document.createElement('canvas'); c.width = fond.naturalWidth; c.height = fond.naturalHeight;
    const g = c.getContext('2d'); g.drawImage(fond, 0, 0);
    const p = S.place || { x: 0.62, y: 0.7 }; const w = c.width * 0.36, h = w * spa.naturalHeight / spa.naturalWidth;
    const x = p.x * c.width - w / 2, y = p.y * c.height - h * 0.75;
    g.fillStyle = 'rgba(0,0,0,.28)'; g.beginPath(); g.ellipse(p.x * c.width, y + h * 0.95, w * 0.52, h * 0.1, 0, 0, Math.PI * 2); g.fill();
    // fond blanc du visuel rendu transparent
    const t = document.createElement('canvas'); t.width = spa.naturalWidth; t.height = spa.naturalHeight; const tg = t.getContext('2d'); tg.drawImage(spa, 0, 0);
    const d = tg.getImageData(0, 0, t.width, t.height); for (let i = 0; i < d.data.length; i += 4) { if (d.data[i] > 240 && d.data[i + 1] > 240 && d.data[i + 2] > 240) d.data[i + 3] = 0; }
    tg.putImageData(d, 0, 0); g.drawImage(t, x, y, w, h);
    return { ok: true, image_url: c.toDataURL('image/jpeg', 0.86), montage: true };
  }
  const charge = (src) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });

  function initRendu() {
    $('#voir-apres').addEventListener('click', () => { $('#res-img').src = S.renduSrc; $('#voir-apres').setAttribute('aria-pressed', 'true'); $('#voir-avant').setAttribute('aria-pressed', 'false'); });
    $('#voir-avant').addEventListener('click', () => { $('#res-img').src = S.photo.dataUrl; $('#voir-avant').setAttribute('aria-pressed', 'true'); $('#voir-apres').setAttribute('aria-pressed', 'false'); });
    $('#autre-spa').addEventListener('click', () => montre(2));
    $('#reessayer').addEventListener('click', () => montre(4));
  }

  /* ---------- Démarrage ---------- */
  async function init() {
    S.cat = await chargeCatalogue();
    $$('[data-go]').forEach((b) => b.addEventListener('click', () => montre(+b.dataset.go)));
    $('#retour').addEventListener('click', () => montre(Math.max(0, S.step - 1), S.step));
    $('#logo').addEventListener('click', (e) => {
      e.preventDefault();
      if (S.envoi || S.step === 0) return;
      if (aDesDonnees() && !confirm('Revenir au début du simulateur ? Votre photo, vos choix et vos coordonnées seront effacés.')) return;
      location.href = location.pathname + location.search;
    });
    window.addEventListener('beforeunload', (e) => { if (aDesDonnees() && S.step > 0 && S.step < 5) { e.preventDefault(); e.returnValue = ''; } });
    $('#suivant').addEventListener('click', () => { if (S.step === 4) envoie(); else montre(S.step + 1); });
    initPhoto(); initSpa(); initAcces(); initContact(); initRendu(); majRdv();
    if (SPA_FIXE && S.cat.spas.some((s) => s.cle === SPA_FIXE)) choisitSpa(SPA_FIXE);
    montre(INTEGRE ? 1 : 0);
    if (DEMO) document.documentElement.dataset.demo = '1';
  }
  init();
})();
