const BASE = 'https://sb2frontend-altenar2.biahosted.com/api/widget';

const COMMON_PARAMS = new URLSearchParams({
  culture: 'pt-BR',
  timezoneOffset: '180',
  integration: 'esportiva',
  deviceType: '1',
  numFormat: 'en-GB',
  countryCode: 'BR',
});

const HEADERS = {
  accept: '*/*',
  'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
  authorization:
    'V2xoc1MyRkhTa2haTW14UVlWVndTbFpZY0VwTlZUVndVMWhPU21Kc1NURlpNRTVLVG10c2NtTkdhRmRSTUc4MVRHMVdOVk51UW1wUk1Hc3lVMWR3Ums1Vk1WUk9TR2hPWVd0V01WUlljRXBrVlRGeFZWUkdTbUZZWkhCWGEyTTFaRVpzV0dKSVZrcGhiVGx3V1ZWb1UwMUhUa2xVVkZwTlpWUnNjMWw2VGtOa2JVNTFWVzVDYTJKVlZqRlhWekZYVFVWNGRGTnViRXBoV0dSd1dWWmpNVTFHY0ZoYVNHeGFWMFpLZDFscVNUQmhWVGx3VTIxNGFrMHdTakpaTWpWVFkwZFNkRkpYYkUxUk1HOTRXWHBLVjJWV1JsaGFSM2hwWW14R2NGUXliRXRVYlVsNlkwaENhVkl6YUc5VVNIQldaRlV4UkZGWE9WZE5iWGd4VjJ0ak5VMHlUalZSYXpsWFVUQkdORlJWVFRCa01EazFVV3hvYUZaNlVYbFVhMUo2V2pKV1JWZFVRa3hWTUVwRFdUQm9RMk14Y0ZkYVIzaGFZVE5TZDFwRlRUUk5WVEUyV1ROV1RtVnNiRzVUTUZZd1UxWmFSazFWTVUxUk1FcDZXVlprTUdKRmJFWmFSM2hhVFc1U01sTXhUa05TUjBaSlUyNWFhVll4VmpKVVZsSlNUa1Y0Y1ZGWVZrNVJlbEl6VTFWYVQyRkdjSFJTYm14b1ZYcG5lRlJZY0dwa1ZURTJWMWRzVFZFd2NESlpNMnhLVG10c2MyUXliRmROYlhneFYydGpOVTB5VFhoa01teEtZVmhrY0Zkc2FHOWtNR3h4WWpOb1QyVnRaRE5VYTFKT1pXczFjVm96YkcxVlV6VkdZakE1UkUxSGRHMU5WVTVwV2tkT05tSXdOSFJVUjNSM1draEthMUZ1Wkc5aFZteERXVEpHVFZKdVdtNVRNalZtVGpKT05XSnRVWGM5',
  origin: 'https://esportiva.bet.br',
  priority: 'u=1, i',
  referer: 'https://esportiva.bet.br/',
  'sec-ch-ua': '"Chromium";v="148", "Google Chrome";v="148", "Not/A)Brand";v="99"',
  'sec-ch-ua-mobile': '?1',
  'sec-ch-ua-platform': '"iOS"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'cross-site',
  'user-agent':
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1',
};

export async function getAltenarEvents(champIds = '3146') {
  const params = new URLSearchParams(COMMON_PARAMS);
  params.set('eventCount', '0');
  params.set('sportId', '0');
  params.set('champIds', champIds);

  const url = `${BASE}/GetEvents?${params}`;
  console.log('[Altenar] GetEvents ->', url);

  const res = await fetch(url, { headers: HEADERS });
  console.log('[Altenar] GetEvents <-', res.status, res.statusText);
  if (!res.ok) throw new Error(`Altenar GetEvents failed: ${res.status}`);

  const data = await res.json();
  const events = data?.result?.events ?? data?.events ?? data ?? [];
  console.log('[Altenar] GetEvents — total de eventos recebidos:', events.length);
  return events;
}

// Retorna { boosts, markets }
// markets: Map<marketId, { name, selections: Map<selectionId, name> }>
export async function getEventDetails(eventId, eventName) {
  const params = new URLSearchParams(COMMON_PARAMS);
  params.set('eventId', String(eventId));
  params.set('showNonBoosts', 'true');

  const url = `${BASE}/GetEventDetails?${params}`;
  console.log(`[Altenar] GetEventDetails -> eventId=${eventId}${eventName ? ` (${eventName})` : ''}`);

  const res = await fetch(url, { headers: HEADERS });
  console.log(`[Altenar] GetEventDetails <- ${res.status} eventId=${eventId}`);
  if (!res.ok) throw new Error(`Altenar GetEventDetails failed: ${res.status} (eventId=${eventId})`);

  const data = await res.json();
  console.log(`[Altenar] RAW GetEventDetails eventId=${eventId}`, data);

  const result = data?.result ?? data;
  const boosts = result?.boosts ?? [];

  // markets: Map<marketId, marketName>
  const markets = new Map();
  for (const mkt of (result?.markets ?? [])) {
    markets.set(mkt.id, mkt.name ?? '');
  }

  // odds: Map<selectionId, selectionName>
  const oddsMap = new Map();
  for (const odd of (result?.odds ?? [])) {
    oddsMap.set(odd.id, odd.name ?? '');
  }

  if (boosts.length > 0) {
    console.log(`[Altenar] ${boosts.length} boost(s) em eventId=${eventId}`, boosts);
    console.log(`[Altenar] ${markets.size} mercado(s) encontrados para eventId=${eventId}`);
  } else {
    console.log(`[Altenar] sem boosts em eventId=${eventId}${eventName ? ` (${eventName})` : ''}`);
  }

  return { boosts, markets, oddsMap };
}

// Compat: usado em lugares que só precisam dos boosts
export async function getEventBoosts(eventId, eventName) {
  const { boosts } = await getEventDetails(eventId, eventName);
  return boosts;
}