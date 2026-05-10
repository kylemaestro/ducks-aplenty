export type DuckSpecies = {
  id: number;
  name: string;
  scientific_name: string;
};

export type FactChoice = {
  id: number;
  fact: string;
  citations: string[];
};

export type RandomFactsResponse = {
  facts: FactChoice[];
};

export type RevealResponse = {
  duck: DuckSpecies;
  fun_fact: string;
  citations: string[];
};

async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json() as Promise<T>;
}

export async function fetchRandomFactChoices(count = 3): Promise<FactChoice[]> {
  const res = await fetch(`/api/facts/random?count=${count}`);
  const data = await parseJson<RandomFactsResponse>(res);
  return data.facts;
}

export async function fetchFactReveal(factId: number): Promise<RevealResponse> {
  const res = await fetch(`/api/facts/${factId}/reveal`);
  return parseJson<RevealResponse>(res);
}
