from typing import Awaitable, Callable, IO, Iterable, Optional, Tuple, Union

from aiomirai import At, Event, MessageChain, MessageSegment, Plain, SessionApi

from .log import logger


class CommandSession:
    def __init__(self, bot: SessionApi, event: Event, prefix: str, name: str, argv: MessageChain):
        self.bot = bot
        self.event = event
        self.prefix = prefix
        self.name = name
        self.argv = argv

    def send(self, msg: Union[MessageChain, MessageSegment, str]):
        if isinstance(msg, (MessageSegment, str)):
            msg = MessageChain(msg)
        qq = self.event['sender']['id']
        if self.event['type'] == 'TempMessage':
            group = self.event['sender']['group']['id']
            return self.bot.send_temp_message(qq=qq, group=group, message_chain=msg)
        if self.event['type'] == 'FriendMessage':
            return self.bot.send_friend_message(target=qq, message_chain=msg)
        if self.event['type'] == 'GroupMessage':
            group = self.event['sender']['group']['id']
            return self.bot.send_group_message(target=group, message_chain=msg)
        raise ValueError('Unrecognized Message Type')

    def reply(self, msg: Union[MessageChain, MessageSegment, str], ensure_private: bool = False, quote: bool = True):
        if isinstance(msg, (MessageSegment, str)):
            msg = MessageChain(msg)
        qq = self.event['sender']['id']
        msg_id = self.event['message_chain'][0]['id']
        if self.event['type'] == 'FriendMessage':
            return self.bot.send_friend_message(target=qq, quote=msg_id if quote else None, message_chain=msg)
        if self.event['type'] == 'TempMessage' or ensure_private:
            group = self.event['sender']['group']['id']
            return self.bot.send_temp_message(qq=qq, group=group, quote=msg_id if quote else None, message_chain=msg)
        if self.event['type'] == 'GroupMessage':
            group = self.event['sender']['group']['id']
            if quote:
                return self.bot.send_group_message(target=group, quote=msg_id, message_chain=msg)
            else:
                return self.bot.send_group_message(target=group, message_chain=At(qq) + msg)
        raise ValueError('Unrecognized Message Type')

    async def upload_image(self, img: IO, name: Optional[str]):
        if name:
            f = (name, img)
        else:
            f = img
        if self.event.type == 'GroupMessage':
            return await self.bot.upload_image(type='group', img=f)
        elif self.event.type == 'FriendMessage':
            return await self.bot.upload_image(type='friend', img=f)
        else:
            return await self.bot.upload_image(type='temp', img=f)


from .permission import Perm, check_perm


class CommandManager:
    _commands = {}

    def __init__(self, bot: SessionApi, prefix: Union[str, Iterable[str]]):
        self.bot = bot
        if isinstance(prefix, str):
            prefix = (prefix, )
        self._prefix = prefix

    def parse_command(self, message: MessageChain) -> Optional[Tuple[str, str, MessageChain]]:
        logger.debug('Parsing command: %s', message)
        msg = MessageChain(message)
        msg.pop(0)
        msg.reduce()
        cmd_seg: MessageSegment = msg.pop(0)
        if cmd_seg.type != 'Plain':
            return
        cmd_txt: str = cmd_seg['text']

        matched_prefix = None
        for p in self._prefix:
            curr_matched_prefix = None
            if cmd_txt.startswith(p):
                curr_matched_prefix = p
            if curr_matched_prefix is not None and \
                    (matched_prefix is None or
                     len(curr_matched_prefix) > len(matched_prefix)):
                matched_prefix = curr_matched_prefix
        if matched_prefix is None:
            logger.debug('Not a command.')
            return
        logger.debug(f'Matched command start: {matched_prefix}')
        cmd_txt = cmd_txt[len(matched_prefix):].lstrip()
        if not cmd_txt:
            return
        cmd_name, *cmd_res = cmd_txt.split(maxsplit=1)
        logger.debug('Split command name: %s', cmd_name)
        if cmd_res:
            msg = Plain(*cmd_res) + msg
        return matched_prefix, cmd_name, msg

    async def call_command(self, name: str, session: CommandSession) -> bool:
        if await check_perm(session.event, {Perm.banned}):
            return True
        cmd = self._commands[name]
        try:
            logger.debug('Running command %s', name)
            await cmd(session)
            return True
        except:
            logger.exception('An exception occurred while ' 'running command %s:', name)
            return False

    async def handle_command(self, event: Event) -> bool:
        try:
            res = self.parse_command(event['message_chain'])
        except:
            logger.exception('Failed to parse command. Ignore.')
            res = None
        if not res:
            return False
        prefix, name, argv = res
        session = CommandSession(self.bot, event, prefix, name, argv)
        try:
            return await self.call_command(name, session)
        except KeyError:
            logger.debug('Not a known command, ignored')
        return False

    def on_command(self, name: str):
        def deco(func: Callable[[CommandSession], Awaitable]) -> Callable[[CommandSession], Awaitable]:
            self._commands[name] = func
            return func

        return deco
