# from nonebot import on_command, CommandSession
# from nonebot import on_natural_language, NLPSession, IntentCommand
# from random import random, randint


# @on_command('gag')
# async def gag(session: CommandSession):
#     if not session.ctx['message_type'] == 'group':
#         return
#     arg = session.current_arg_text.strip()
#     if arg.isdigit():
#         info = await session.bot.get_group_member_info(group_id=session.ctx['group_id'], user_id=session.ctx['self_id'])
#         tinfo = await session.bot.get_group_member_info(**session.ctx)
#         if info['role'] == 'member':
#             await session.send('呜呜~~~~SiGNAL酱不是管理呢(>_<)~~~~', at_sender=True)
#         elif tinfo['role'] == 'owner' or (tinfo['role'] == 'admin' and info['role'] == 'admin'):
#             await session.send('呜呜~~~~SiGNAL酱t*d禁言不了你(>_<)~~~~', at_sender=True)
#         else:
#             await session.send('口球戴好～(时长' + arg + '秒)', at_sender=True)
#             await session.bot.set_group_ban(**session.ctx, duration=int(arg))
#     else:
#         await session.send('格式不正确www\nUsage: ?gag <时长(单位:秒)>', at_sender=True)


# has_bomb = False

# @on_command('bomb')
# async def _(session: CommandSession):
#     global has_bomb
#     if has_bomb:
#         await session.send('🐴？？？还挂？？？')
#         s = session
#         s.current_arg = '30'
#         await gag(s)
#     else:
#         await session.send('一位内鬼在群里埋了炸弹！被炸到会禁言随机时长！')
#         has_bomb = True


# @on_natural_language
# async def _(session: NLPSession):
#     global has_bomb
#     prob = random()
#     if prob > 0.2 or not has_bomb:
#         return
#     time = randint(1, 60)
#     has_bomb = False
#     return IntentCommand(100.0 , 'gag', current_arg=str(time))
