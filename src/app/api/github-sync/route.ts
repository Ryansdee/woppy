import { NextResponse } from 'next/server';

const OWNER  = 'Ryansdee';
const REPO   = 'woppy';
const BRANCH = 'master';
const PER_PAGE = 30; // commits par page

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') ?? '1';

  /* 1. Liste paginée des commits */
  const listRes = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/commits?sha=${BRANCH}&per_page=${PER_PAGE}&page=${page}`,
    {
      headers: { Accept: 'application/vnd.github.v3+json' },
      next: { revalidate: 60 },
    }
  );
  if (!listRes.ok) return NextResponse.json({ error: listRes.status }, { status: listRes.status });
  const commits: any[] = await listRes.json();

  /* 2. Pour chaque commit, récupère les détails (fichiers + stats) en parallèle */
  const detailed = await Promise.all(
    commits.map(async (c: any) => {
      try {
        const detailRes = await fetch(
          `https://api.github.com/repos/${OWNER}/${REPO}/commits/${c.sha}`,
          {
            headers: { Accept: 'application/vnd.github.v3+json' },
            next: { revalidate: 3600 }, // cache plus long pour les anciens commits
          }
        );
        if (!detailRes.ok) return { ...c, stats: null, files: [] };
        const d = await detailRes.json();
        return {
          sha:       d.sha,
          html_url:  d.html_url,
          commit:    d.commit,
          author:    d.author,
          stats:     d.stats ?? null,
          files:     d.files?.map((f: any) => ({
            filename:  f.filename,
            status:    f.status,
            additions: f.additions,
            deletions: f.deletions,
          })) ?? [],
        };
      } catch {
        return { ...c, stats: null, files: [] };
      }
    })
  );

  /* 3. Retourne la liste + info pagination */
  const linkHeader = listRes.headers.get('Link') ?? '';
  const hasNext = linkHeader.includes('rel="next"');
  const totalStr = listRes.headers.get('X-Total-Count');

  return NextResponse.json({ commits: detailed, hasNext, page: Number(page) });
}