const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const siretPattern = /^\d{14}$/;
const postalCodePattern = /^\d{5}$/;
const textPattern = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]{2,100}$/;

const trim = (value) => String(value || '').trim();

export function normalizeRegisterForm(form, accountType) {
  const normalized = {
    accountType,
    email: trim(form.email).toLowerCase(),
    nom: trim(form.nom),
    prenom: trim(form.prenom),
    password: String(form.password || ''),
    confirmPassword: String(form.confirmPassword || '')
  };

  if (accountType === 'professionnel') {
    const entreprise = form.entreprise || {};
    normalized.entreprise = {
      nom: trim(entreprise.nom),
      siret: trim(entreprise.siret),
      adresse_ligne: trim(entreprise.adresse_ligne),
      code_postal: trim(entreprise.code_postal),
      ville: trim(entreprise.ville)
    };
  }

  return normalized;
}

export function validateLoginForm(form) {
  const errors = {};
  const email = trim(form.email).toLowerCase();
  const password = String(form.password || '');

  if (!emailPattern.test(email)) {
    errors.email = 'Adresse email invalide.';
  }
  if (!password) {
    errors.password = 'Mot de passe requis.';
  }

  return errors;
}

export function validateRegisterForm(form, accountType) {
  const errors = {};
  const normalized = normalizeRegisterForm(form, accountType);
  const { email, nom, prenom, password, confirmPassword } = normalized;

  if (!textPattern.test(prenom)) {
    errors.prenom = 'Prenom invalide.';
  }
  if (!textPattern.test(nom)) {
    errors.nom = 'Nom invalide.';
  }
  if (!emailPattern.test(email)) {
    errors.email = 'Adresse email invalide.';
  }
  if (!password) {
    errors.password = 'Mot de passe requis.';
  } else if (password.length < 8) {
    errors.password = '8 caracteres minimum.';
  }
  if (!confirmPassword) {
    errors.confirmPassword = 'Confirmation requise.';
  } else if (confirmPassword !== password) {
    errors.confirmPassword = 'Les mots de passe ne correspondent pas.';
  }

  if (accountType === 'professionnel') {
    const entreprise = normalized.entreprise || {};
    if (!entreprise.nom) {
      errors['entreprise.nom'] = "Nom de l'entreprise requis.";
    }
    if (!siretPattern.test(entreprise.siret)) {
      errors['entreprise.siret'] = 'Le SIRET doit contenir 14 chiffres.';
    }
    if (!entreprise.adresse_ligne) {
      errors['entreprise.adresse_ligne'] = "Adresse de l'entreprise requise.";
    }
    if (!postalCodePattern.test(entreprise.code_postal)) {
      errors['entreprise.code_postal'] = 'Code postal invalide.';
    }
    if (!entreprise.ville) {
      errors['entreprise.ville'] = 'Ville requise.';
    }
  }

  return errors;
}

export function hasErrors(errors) {
  return Object.keys(errors).length > 0;
}
