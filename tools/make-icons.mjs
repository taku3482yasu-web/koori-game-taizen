// アプリの アイコン (PNG) を 作る: node tools/make-icons.mjs
// index.html の こおりくん (14×14 の ドット絵) を 大きく して、紺の 背景の まんなかに おく
import { writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

// [x, y, w, h, 色] (index.html の <symbol id="koori"> と 同じ)
const KOORI = [
    [0, 0, 14, 12, '#1b3566'], [1, 1, 12, 10, '#c6f0ff'], [11, 1, 2, 4, '#7fd3f5'], [12, 5, 1, 4, '#7fd3f5'],
    [1, 10, 12, 1, '#7fd3f5'], [1, 9, 1, 1, '#7fd3f5'], [12, 9, 1, 2, '#4fb0e6'], [1, 1, 3, 1, '#ffffff'],
    [1, 2, 2, 1, '#ffffff'], [1, 3, 1, 1, '#ffffff'], [4, 4, 1, 2, '#0e1626'], [9, 4, 1, 2, '#0e1626'],
    [2, 6, 1, 1, '#f59bb0'], [11, 6, 1, 1, '#f59bb0'], [6, 7, 2, 1, '#0e1626'], [2, 12, 3, 2, '#1b3566'],
    [9, 12, 3, 2, '#1b3566'], [3, 12, 1, 1, '#4fb0e6'], [10, 12, 1, 1, '#4fb0e6']
];
const BG = '#0b1222';
const rgb = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));

// size: 画像の 大きさ。pad: こおりくんの まわりの すきま (maskable は 大きめ)
function icon(size, pad) {
    const px = new Uint8Array(size * size * 3);
    const set = (x, y, c) => { const [r, g, b] = rgb(c); const i = (y * size + x) * 3; px[i] = r; px[i + 1] = g; px[i + 2] = b; };
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
        // 背景: 紺に 上から うすい 光
        const d = Math.hypot(x - size / 2, y - size * 0.1) / size;
        const k = Math.max(0, 0.35 - d * 0.5);
        const [r, g, b] = rgb(BG), [r2, g2, b2] = rgb('#234a80');
        const i = (y * size + x) * 3;
        px[i] = r + (r2 - r) * k * 2; px[i + 1] = g + (g2 - g) * k * 2; px[i + 2] = b + (b2 - b) * k * 2;
    }
    const cell = Math.floor((size - pad * 2) / 14), ox = Math.floor((size - cell * 14) / 2), oy = ox;
    for (const [x0, y0, w, h, c] of KOORI) {
        for (let y = y0 * cell; y < (y0 + h) * cell; y++) for (let x = x0 * cell; x < (x0 + w) * cell; x++) set(ox + x, oy + y, c);
    }
    return png(size, px);
}

function png(size, px) {
    const raw = Buffer.alloc((size * 3 + 1) * size);
    for (let y = 0; y < size; y++) {
        raw[y * (size * 3 + 1)] = 0;
        Buffer.from(px.buffer, y * size * 3, size * 3).copy(raw, y * (size * 3 + 1) + 1);
    }
    const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
    const crc = b => { let c = 0xffffffff; for (const v of b) c = crcTable[(c ^ v) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
    const chunk = (type, data) => {
        const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
        const td = Buffer.concat([Buffer.from(type), data]);
        const c = Buffer.alloc(4); c.writeUInt32BE(crc(td));
        return Buffer.concat([len, td, c]);
    };
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
    ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
    return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

mkdirSync('icons', { recursive: true });
writeFileSync('icons/icon-192.png', icon(192, 30));
writeFileSync('icons/icon-512.png', icon(512, 80));
writeFileSync('icons/maskable-512.png', icon(512, 120));   // 丸や 角丸に 切られても こおりくんが 切れない
writeFileSync('icons/apple-touch-icon.png', icon(180, 26));
console.log('icons/ に 4 つ 作った');
