from nonebot import on_request, RequestSession


@on_request('group')
async def _(session: RequestSession):
    if session.ctx['sub_type'] == 'invite':
        await session.approve()

@on_request('friend')
async def _(session: RequestSession):
    await session.approve()
