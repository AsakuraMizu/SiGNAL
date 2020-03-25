from nonebot import on_command, CommandSession

@on_command('donate')
async def _(session: CommandSession):
    await session.send('爱发电地址： https://afdian.net/@water_lift')