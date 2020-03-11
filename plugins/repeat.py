from nonebot import on_command, CommandSession
from nonebot import on_natural_language, NLPSession


queue = []

@on_command('repeat')
async def _(session: CommandSession):
    arg = session.current_arg_text.strip()
