from functools import wraps
from typing import Awaitable, Any, Callable

from sibot import on_command, CommandSession, Perm, check_perm


def only(
        func: Callable[[CommandSession], Awaitable[Any]]
) -> Callable[[CommandSession], Awaitable[Any]]:
    @wraps(func)
    async def wrapper(session: CommandSession):
        if not await check_perm(session.event, {Perm.contributor}) or \
                not await check_perm(session.event, {Perm.bot_helper}):
            await session.reply('Permission Denied：您不是 Bot 贡献者或协助者')
        else:
            return await func(session)
    return wrapper


@on_command('say')
@only
async def _(session: CommandSession):
    await session.send(session.argv)
