const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const siretPattern = /^\d{14}$/;
const postalCodePattern = /^\d{5}$/;
const textPattern = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]{2,100}$/;

const trim = (value) => String(value || '').trim();

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
  const email = trim(form.email).toLowerCase();
  const nom = trim(form.nom);
  const prenom = trim(form.prenom);
  const password = String(form.password || '');
  const confirmPassword = String(form.confirmPassword || '');

  if (!textPattern.test(prenom)) {
    errors.prenom = 'Prenom invalide.';
  }
  if (!textPattern.test(nom)) {
    errors.nom = 'Nom invalide.';
  }
  if (!emailPattern.test(email)) {
    errors.email = 'Adresse email invalide.';
  }
  if (password.length < 8) {
    errors.password = '8 caracteres minimum.';
  }
  if (confirmPassword !== password) {
    errors.confirmPassword = 'Les mots de passe ne correspondent pas.';
  }

  if (accountType === 'professionnel') {
    const entreprise = form.entreprise || {};
    if (!trim(entreprise.nom)) {
      errors['entreprise.nom'] = "Nom de l'entreprise requis.";
    }
    if (!siretPattern.test(trim(entreprise.siret))) {
      errors['entreprise.siret'] = 'Le SIRET doit contenir 14 chiffres.';
    }
    if (!trim(entreprise.adresse_ligne)) {
      errors['entreprise.adresse_ligne'] = "Adresse de l'entreprise requise.";
    }
    if (!postalCodePattern.test(trim(entreprise.code_postal))) {
      errors['entreprise.code_postal'] = 'Code postal invalide.';
    }
    if (!trim(entreprise.ville)) {
      errors['entreprise.ville'] = 'Ville requise.';
    }
  }

  return errors;
}

export function hasErrors(errors) {
  return Object.keys(errors).length > 0;
}
