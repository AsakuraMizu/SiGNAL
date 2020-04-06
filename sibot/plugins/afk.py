from nonebot import on_command, CommandSession


@on_command('afk')
async def _(session: CommandSession):
    if not session.ctx['message_type'] == 'group':
        return
    arg = session.current_arg_text.strip()
    if arg.isdigit():
        info = await session.bot.get_group_member_info(group_id=session.ctx['group_id'], user_id=session.ctx['self_id'])
        tinfo = await session.bot.get_group_member_info(**session.ctx)
        if info['role'] == 'member':
            await session.send('呜呜~~~~SiGNAL酱不是管理呢(>_<)~~~~', at_sender=True)
        elif tinfo['role'] == 'owner' or (tinfo['role'] == 'admin' and info['role'] == 'admin'):
            await session.send('呜呜~~~~SiGNAL酱t*d禁言不了你(>_<)~~~~', at_sender=True)
        else:
            await session.send('口球戴好～(时长' + arg + '秒)', at_sender=True)
            await session.bot.set_group_ban(**session.ctx, duration=int(arg))
    else:
        await session.send('格式不正确www\nUsage: ?gag <时长(单位:秒)>', at_sender=True)
