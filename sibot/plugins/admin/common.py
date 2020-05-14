from sibot import on_command, CommandSession, Perm, check_perm


@on_command('leave')
async def _(session: CommandSession):
    if not await check_perm(session.event, {Perm.bot_helper}):
        await session.reply('Permission Denied：您不是 Bot 协助者')
    else:
        await session.bot.quit(target=session.event['sender']['group']['id'])


@on_command('stop')
async def _(session: CommandSession):
    if not await check_perm(session.event, {Perm.bot_admin}):
        await session.reply('Permission Denied：您不是 Bot 管理员')
    else:
        import sys
        sys.exit()
