from nonebot import on_command, CommandSession
import nonebot.permission as perm


@on_command('say', permission=perm.SUPERUSER)
async def _(session: CommandSession):
    await session.send(session.current_arg)
