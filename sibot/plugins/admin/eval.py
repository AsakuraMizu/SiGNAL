from nonebot import on_command, CommandSession, permission as perm
from typing import Awaitable

from importlib import import_module


@on_command('eval', permission=perm.SUPERUSER)
async def _(session: CommandSession):
    try:
        res = eval(session.current_arg)
        if isinstance(res, Awaitable):
            res = await res
        if hasattr(res, '__str__'):
            await session.send('Res:\n' + str(res))
    except Exception as e:
        await session.send('Error:\n' + str(e))
