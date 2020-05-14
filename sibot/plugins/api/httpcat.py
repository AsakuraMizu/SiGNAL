from io import BytesIO

from httpx import AsyncClient

from sibot import on_command, CommandSession, Image


@on_command('cat')
async def _(session: CommandSession):
    q = session.argv.extract_plain_text()
    if not q:
        await session.reply(f'[cat] 用法：{session.prefix}{session.name} <http_code>\n（图片均来自 https://http.cat/）')
        return
    async with AsyncClient() as client:
        resp = await client.get(f'https://cdn.jsdelivr.net/gh/httpcats/http.cat/public/images/{q}.jpg')
    if resp.status_code == 404:
        await session.reply(f'你家 HTTP 协议会返回 {q}？？？')
        return
    if not 200 <= resp.status_code < 300:
        await session.reply(f'[cat] 错误：{resp.status_code}')
        return
    buf = BytesIO(resp.content)
    img_id = (await session.upload_image(buf, f'httpcat-{q}.jpg'))['image_id']
    await session.send(Image(img_id))
