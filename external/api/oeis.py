import io
import re

from httpx import AsyncClient
from matplotlib import pyplot

from sibot import on_command, CommandSession, MessageChain, Image


@on_command('oeis')
async def _(session: CommandSession):
    q = session.argv.extract_plain_text()
    if not q:
        await session.reply(f'[oeis] 用法：{session.prefix}{session.name} <query>')
        return
    async with AsyncClient() as client:
        resp = await client.get('https://oeis.org/search', params={'q': q, 'fmt': 'text'})
    if not 200 <= resp.status_code < 300:
        await session.reply(f'[oeis] 错误：{resp.status_code}')
        return
    res = resp.content.decode()
    if 'No results.' in res:
        await session.reply('[oeis] No results.')
        return
    cnt = re.search(r'of ([0-9]+)', res).group(1)
    fir = res.split('\n\n')[2]
    id = re.search(r'%I (.*)$', fir, re.M).group(1).split()[0]
    arr = re.search(rf'%S {id} (.*)$', fir, re.M).group(1)
    name = re.search(rf'%N {id} (.*)$', fir, re.M).group(1)
    pyplot.plot(list(map(int, arr.strip(',').split(','))))
    buf = io.BytesIO()
    pyplot.savefig(buf, format='png')
    pyplot.close()
    buf.seek(0)
    img_id = (await session.upload_image(buf, f'oeis-{id}.png'))['image_id']
    await session.reply(MessageChain(['\n'.join([f'[oeis] 共找到 {cnt} 条结果。', f'{id}：{name}', f'{arr}']), Image(img_id)]))
