from io import BytesIO

from httpx import AsyncClient

from sibot import on_command, CommandSession, Image


@on_command('dress')
async def _(session: CommandSession):
    q = session.argv.extract_plain_text()
    if not q:
        await session.reply('[dress] 从 komeiji-satori/Dress 获取制定女装照片（\n'
                            f'用法：{session.prefix}{session.name} <path>')
        return
    async with AsyncClient() as client:
        resp = await client.get(f'https://cdn.jsdelivr.net/gh/komeiji-satori/Dress/{q}')
    if resp.status_code == 404:
        await session.reply(f'没找着，你看看你是不是打错了')
        return
    if not 200 <= resp.status_code < 300:
        await session.reply(f'[dress] 错误：{resp.status_code}')
        return
    buf = BytesIO(resp.content)
    q = q.replace('/', '-')
    img_id = (await session.upload_image(buf, f'dress-{q}'))['image_id']
    await session.send(Image(img_id))
