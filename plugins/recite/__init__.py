from nonebot import on_command, CommandSession
import re

from .data import data


@on_command('recite')
async def _(session: CommandSession):
    arg = session.current_arg_text.strip()
    if len(arg) == 0:
        await session.send('SiGNAL酱现在只背过了：\n' + '\n'.join(data.keys()))
        return
    for key, va in data.items():
        if re.match(key, arg):
            await session.send(va)
            break
    else:
        await session.send('SiGNAL酱还没背过(*｀･з･)ﾑｯ', at_sender=True)
