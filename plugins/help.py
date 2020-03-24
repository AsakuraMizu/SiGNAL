from nonebot import on_command, CommandSession
from nonebot import on_notice, NoticeSession
from nonebot import on_request, RequestSession


@on_command('help')
async def _(session: CommandSession):
    await session.send('我很可爱请给我钱', at_sender=True)

@on_request('group')
async def _(session: RequestSession):
    if session.ctx['sub_type'] == 'invite':
        await session.approve()

@on_request('friend')
async def _(session: RequestSession):
    await session.approve()

@on_notice('group_increase')
async def _(session: NoticeSession):
    if session.ctx['self_id'] == session.ctx['user_id']:
        await session.send('大家好，我是SiGNAL酱，有关我的详细信息可输入 ?help 查看哦~')
