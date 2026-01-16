import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  if (!q) {
    return NextResponse.json({ error: 'Missing query parameter `q`' }, { status: 400 });
  }

  try {
    const res = await fetch(`https://api.tvmaze.com/singlesearch/shows?q=${encodeURIComponent(q)}&embed=nextepisode`);
    if (res.status === 404) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    if (!res.ok) {
      return NextResponse.json({ error: 'Upstream error' }, { status: 502 });
    }
    const js = await res.json();
    const nextepi = js._embedded?.nextepisode ?? null;
    const nextAirstamp = nextepi?.airstamp ?? null;

    const payload = {
      id: js.id,
      name: js.name,
      url: js.url,
      image: js.image ?? null,
      summary: js.summary ?? null,
      premiered: js.premiered ?? null,
      status: js.status ?? null,
      network: js.network ?? null,
      nextAirstamp,
      nextEpisode: nextepi,
    };

    return NextResponse.json(payload);
  } catch (e) {
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
  }
}
