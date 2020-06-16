from sibot import on_command, CommandSession, check_perm, update_perm, Perm


@on_command('perm')
async def _(session: CommandSession):
    if not await check_perm(session.event, {Perm.bot_admin}):
        await session.reply('Permission Denied：您不是 Bot 管理员')
    else:
        qq = None
        try:
            for seg in session.argv:
                if seg.type == 'At':
                    qq = seg['target']
            arg = session.argv.extract_plain_text(True).split()
            if not qq:
                assert len(arg) == 3
                qq, level, op = arg
                qq = int(qq)
            else:
                assert len(arg) == 2
                level, op = arg
            if level == 'bot_admin':
                await session.reply('Due to security problem, u can only mod admins in config file')
                return
            if level not in ('banned', 'bot_helper', 'bot_sponsor'):
                await session.reply('哪来的这个标记（恼）')
                return
        except (ValueError, AssertionError):
            await session.reply('你会不会用啊（恼）')
            return
        await update_perm(qq, level, bool(int(op)))
        await session.reply('你干啥呢（')
