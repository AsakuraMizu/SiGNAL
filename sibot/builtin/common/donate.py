from httpx import AsyncClient

from sibot import on_command, CommandSession


@on_command('donate')
async def _(session: CommandSession):
    async with AsyncClient() as client:
        resp = await client.get(
            'https://afdian.net/api/creator/get-sponsors?user_id=a21147923fd311ea82a252540025c377&type=amount')
    try:
        res: dict = resp.json()['data']
        res = res['list']
    except:
        res = {}
    await session.reply('\n'.join([
        '维护SiGNAL酱需要一定的费用。。。请帮助我们！',
        '爱发电链接：https://afdian.net/@water_lift',
        '部分发电用户列表：',
        *[v['name'] for k, v in res.items()]
    ]))
