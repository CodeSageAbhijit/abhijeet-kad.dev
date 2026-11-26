export default async function handler(req, res) {
  try {
    const r = await fetch("https://sdo.gsfc.nasa.gov/assets/img/latest/latest_512_0193.jpg");
    if (!r.ok) return res.status(502).end();
    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send(Buffer.from(await r.arrayBuffer()));
  } catch {
    res.status(502).end();
  }
}
