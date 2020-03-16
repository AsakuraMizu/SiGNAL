from nonebot import on_command, CommandSession
import nonebot.permission as perm


@on_command('leave', permission=perm.SUPERUSER)
async def _(session: CommandSession):
    await session.bot.set_group_leave(group_id=session.ctx['group_id'])
