import { API_BASE_URL } from './auth-client.js';

function withCompanyScope(url, idEntreprise) {
    if (idEntreprise == null) return url;
    const scopedUrl = new URL(url, window.location.origin);
    scopedUrl.searchParams.set('idEntreprise', String(idEntreprise));
    return scopedUrl.toString();
}

export async function getProductsForProfessional(idProfessionnel, idEntreprise = null) {
    const res = await fetch(withCompanyScope(`${API_BASE_URL}/products/professionnel/${idProfessionnel}`, idEntreprise), {
        method: 'GET',
        credentials: 'include',
    });
    if (!res.ok) {
        const text = await res.text().catch(() => '');
        const msg = text && text.includes('Cannot GET') ? text.replace(/\s+/g, ' ').trim() : `${res.status} ${res.statusText}`;
        throw new Error(msg || 'Failed to fetch products for professional');
    }

    const text = await res.text().catch(() => '');
    if (!text) return null;
    try { return JSON.parse(text); } catch {
        // response body not JSON -- return raw text as error
        throw new Error('Invalid JSON response from server when fetching products');
    }
}

export async function createProductForProfessional(idProfessionnel, product, idEntreprise = null) {
    const scopedCompanyId = idEntreprise ?? product?.idEntreprise ?? null;
    const url = withCompanyScope(`${API_BASE_URL}/products/professionnel/${idProfessionnel}`, scopedCompanyId);

    let res;
    // If an image File/Blob exists, send multipart/form-data
    if (product && product.image && (product.image instanceof File || (typeof Blob !== 'undefined' && product.image instanceof Blob))) {
        const fd = new FormData();
        if (product.nomProduit != null) fd.append('nomProduit', String(product.nomProduit));
        if (product.prix != null) fd.append('prix', String(product.prix));
        if (product.nature != null) fd.append('nature', String(product.nature));
        if (product.unitaireOuKilo != null) fd.append('unitaireOuKilo', String(product.unitaireOuKilo));
        if (product.stock != null) fd.append('stock', String(product.stock));
        if (product.bio != null) fd.append('bio', String(product.bio));
        if (product.tva != null) fd.append('tva', String(product.tva));
        if (product.reductionPro != null) fd.append('reductionPro', String(product.reductionPro));
        if (scopedCompanyId != null) fd.append('idEntreprise', String(scopedCompanyId));
        fd.append('image', product.image);

        res = await fetch(url, {
            method: 'POST',
            credentials: 'include',
            body: fd,
        });
    } else {
        res = await fetch(url, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...product,
                ...(scopedCompanyId != null ? { idEntreprise: scopedCompanyId } : {}),
            }),
        });
    }

    if (!res.ok) {
        const text = await res.text().catch(() => '');
        const msg = text && text.includes('Cannot') ? text.replace(/\s+/g, ' ').trim() : `${res.status} ${res.statusText}`;
        throw new Error(msg || 'Failed to create product');
    }

    const text = await res.text().catch(() => '');
    if (!text) return null;
    try { return JSON.parse(text); } catch { return null; }
}

export async function updateProductForProfessional(idProfessionnel, idProduit, product, idEntreprise = null) {
    const scopedCompanyId = idEntreprise ?? product?.idEntreprise ?? null;
    const url = withCompanyScope(`${API_BASE_URL}/products/professionnel/${idProfessionnel}/${idProduit}`, scopedCompanyId);

    let res;
    if (product && product.image && (product.image instanceof File || (typeof Blob !== 'undefined' && product.image instanceof Blob))) {
        const fd = new FormData();
        if (product.nomProduit != null) fd.append('nomProduit', String(product.nomProduit));
        if (product.prix != null) fd.append('prix', String(product.prix));
        if (product.nature != null) fd.append('nature', String(product.nature));
        if (product.unitaireOuKilo != null) fd.append('unitaireOuKilo', String(product.unitaireOuKilo));
        if (product.stock != null) fd.append('stock', String(product.stock));
        if (product.bio != null) fd.append('bio', String(product.bio));
        if (product.tva != null) fd.append('tva', String(product.tva));
        if (product.reductionPro != null) fd.append('reductionPro', String(product.reductionPro));
        if (product.visible != null) fd.append('visible', product.visible ? '1' : '0');
        if (scopedCompanyId != null) fd.append('idEntreprise', String(scopedCompanyId));
        fd.append('image', product.image);

        res = await fetch(url, {
            method: 'PUT',
            credentials: 'include',
            body: fd,
        });
    } else {
        // ensure visible is a primitive (boolean/number) when sending JSON
        const payload = { ...product };
        if (payload.visible != null) payload.visible = payload.visible ? 1 : 0;
        if (scopedCompanyId != null) payload.idEntreprise = scopedCompanyId;
        res = await fetch(url, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
    }

    if (!res.ok) {
        const text = await res.text().catch(() => '');
        const msg = text && text.includes('Cannot') ? text.replace(/\s+/g, ' ').trim() : `${res.status} ${res.statusText}`;
        throw new Error(msg || 'Failed to update product');
    }

    const text = await res.text().catch(() => '');
    if (!text) return null;
    try { return JSON.parse(text); } catch { return null; }
}

export async function deleteProductForProfessional(idProfessionnel, idProduit, idEntreprise = null) {
    const url = withCompanyScope(`${API_BASE_URL}/products/professionnel/${idProfessionnel}/${idProduit}`, idEntreprise);
    const res = await fetch(url, {
        method: 'DELETE',
        credentials: 'include'
    });
    if (!res.ok) {
        const text = await res.text().catch(() => '');
        const msg = text && text.includes('Cannot') ? text.replace(/\s+/g, ' ').trim() : `${res.status} ${res.statusText}`;
        throw new Error(msg || 'Failed to delete product');
    }
    return true;
}
