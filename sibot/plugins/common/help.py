from nonebot import on_command, CommandSession
from nonebot import on_notice, NoticeSession


@on_command('help')
async def _(session: CommandSession):
    await session.sender('SiGNAL酱是一个免费、开源的QQ机器人，主要服务于开发人员，能够提供许多专业需求。当然SiGNAL酱也提供了一些其他的功能，详见 https://signal.solariar.tech/')


@on_command('donate')
async def _(session: CommandSession):
    await session.sender('SiGNAL酱需要一定的维护费用。。。请帮助我们！爱发电链接：https://afdian.net/@water_lift')


@on_notice('group_increase')
async def _(session: NoticeSession):
    if session.ctx['self_id'] == session.ctx['user_id']:
        await session.send('大家好，我是SiGNAL酱，有关我的详细信息可输入 ?help 查看哦~')
