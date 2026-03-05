const AXELIO_BASE_URL = process.env.AXELIO_BASE_URL || 'https://www.axelio.io';

interface WorkspaceConfig {
  id: string;
  token: string;
}

const WORKSPACES: WorkspaceConfig[] = [
  { id: process.env.CRM_WORKSPACE_ID || '', token: process.env.AXELIO_API_TOKEN || process.env.CRM_WORKSPACE_ID || '' },
  { id: process.env.CRM_WORKSPACE_ID_2 || '', token: process.env.AXELIO_API_TOKEN_2 || process.env.CRM_WORKSPACE_ID_2 || '' },
].filter(w => w.id && w.token);

function isEnabled(): boolean {
  return WORKSPACES.length > 0;
}

async function axelioPostSingle(endpoint: string, data: any, workspace: WorkspaceConfig): Promise<{ ok: boolean; status: number; body: any }> {
  const url = `${AXELIO_BASE_URL}${endpoint}?workspace_id=${workspace.id}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${workspace.token}`,
    },
    body: JSON.stringify(data),
  });

  let body;
  try {
    body = await response.json();
  } catch {
    body = await response.text();
  }

  if (!response.ok) {
    console.error(`Axelio ${endpoint} error (workspace ${workspace.id.slice(0, 8)}...):`, response.status, body);
  }

  return { ok: response.ok, status: response.status, body };
}

async function axelioPost(endpoint: string, data: any): Promise<{ ok: boolean; status: number; body: any }> {
  if (!isEnabled()) {
    return { ok: false, status: 0, body: { error: 'Axelio not configured' } };
  }

  const results = await Promise.allSettled(
    WORKSPACES.map(ws => axelioPostSingle(endpoint, data, ws))
  );

  // Return the first workspace result for backward compatibility
  const first = results[0];
  if (first.status === 'fulfilled') return first.value;
  return { ok: false, status: 0, body: { error: 'All workspace pushes failed' } };
}

// Push a signup as a lead
export async function pushLeadToAxelio(email: string, source: string = 'newsletter') {
  return axelioPost('/api/leads/openapi', {
    email,
    source,
  });
}

// Push leads in batch
export async function pushLeadsBatchToAxelio(leads: Array<{ email: string; source?: string }>) {
  return axelioPost('/api/leads/openapi', {
    leads,
  });
}

// Push a single vendor product
export async function pushProductToAxelio(product: {
  name: string;
  sku?: string;
  price?: number;
  currency?: string;
  external_product_id?: string;
  vendor_name?: string;
  url?: string;
  stock_status?: string;
  category?: string;
  [key: string]: any;
}) {
  return axelioPost('/api/ecommerce/products/openapi', product);
}

// Push vendor products in batch
export async function pushProductsBatchToAxelio(products: Array<{
  name: string;
  sku?: string;
  price?: number;
  currency?: string;
  external_product_id?: string;
  vendor_name?: string;
  url?: string;
  stock_status?: string;
  [key: string]: any;
}>) {
  return axelioPost('/api/ecommerce/products/openapi', { products });
}

// Push a single review
export async function pushReviewToAxelio(review: {
  source: 'user' | 'trustpilot' | 'google';
  source_id: string;
  product_name?: string;
  product_id?: string;
  reviewer_name: string;
  rating: number;
  title?: string;
  body: string;
  reviewed_at?: string;
}) {
  return axelioPost('/api/ecommerce/reviews/openapi', review);
}

// Push reviews in batch
export async function pushReviewsBatchToAxelio(reviews: Array<{
  source: 'user' | 'trustpilot' | 'google';
  source_id: string;
  product_name?: string;
  product_id?: string;
  reviewer_name: string;
  rating: number;
  title?: string;
  body: string;
  reviewed_at?: string;
}>) {
  return axelioPost('/api/ecommerce/reviews/openapi', { reviews });
}

export { isEnabled as isAxelioEnabled };
