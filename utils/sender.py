from nonebot.session import BaseSession

async def sender(session: BaseSession, msg: str, **kwargs):
    if not session.ctx['message_type'] == 'private':
        msg = '\n' + msg
    await session.send(msg, at_sender=True, **kwargs)
