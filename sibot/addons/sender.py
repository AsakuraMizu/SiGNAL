from nonebot.session import BaseSession


async def _send(session: BaseSession, msg: str, **kwargs):
    msg = msg.strip('\n')
    if not session.ctx['message_type'] == 'private':
        msg = '\n' + msg
    await session.send(msg, at_sender=True, **kwargs)

BaseSession.sender = _send
