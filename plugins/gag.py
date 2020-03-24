from asyncio import sleep
from nonebot import on_command, CommandSession
from nonebot import on_natural_language, NLPSession, IntentCommand
from random import random, randint


@on_command('gag')
async def gag(session: CommandSession):
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


has_bomb = {}

@on_command('bomb')
async def _(session: CommandSession):
    if not session.ctx['message_type'] == 'group':
        return
    global has_bomb
    if has_bomb.get(session.ctx['group_id']):
        await session.send('🐴？？？还挂？？？')
        s = session
        s.current_arg = '30'
        await gag(s)
    else:
        await session.send('一位内鬼在群里埋了炸弹！被炸到会禁言随机时长！')
        has_bomb[session.ctx['group_id']] = True


@on_command('defuse')   
async def _(session: CommandSession):
    if not session.ctx['message_type'] == 'group':
        return
    global has_bomb
    if has_bomb.get(session.ctx['group_id']):
        prob = random()
        await session.send('尝试拆除炸弹！', at_sender=True)
        await sleep(1)
        await session.send('少女折寿中......')
        await sleep(1)
        if prob > 0.30:
            await session.send('啊呀拆弹失败╮(╯_╰)╭', at_sender=True)
            time = randint(1, 60)
            session.current_arg = str(time)
            await gag(session)
        else:
            await session.send('恭喜拆弹成功www', at_sender=True)
        del has_bomb[session.ctx['group_id']]
    else:
        await session.send('没炸弹拆你🐴呢', at_sender=True)


@on_natural_language
async def _(session: NLPSession):
    if not session.ctx['message_type'] == 'group':
        return
    global has_bomb
    if not has_bomb.get(session.ctx['group_id']):
        return
    prob = random()
    if prob > 0.2:
        return
    time = randint(1, 60)
    del has_bomb[session.ctx['group_id']]
    return IntentCommand(100.0 , 'gag', current_arg=str(time))
