from nonebot import on_command, CommandSession, permission

@on_command('leave', permission=permission.SUPERUSER)
async def _(session: CommandSession):
    await session.bot.set_group_leave(group_id=session.ctx['group_id'])
