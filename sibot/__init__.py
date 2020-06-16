import logging
from typing import Any, Dict, Optional

from aiomirai import *
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from .log import logger
from .plugin import load_plugin, load_plugins, load_from_config
from .validate import config_schema

scheduler = AsyncIOScheduler()


class SiBot(SessionApi):
    def __init__(self, config):
        config = config_schema.validate(config)
        logger.debug('Loaded configurations: %s', config)
        super().__init__(config['api_root'], config['auth_key'], config['qq'])
        self.config_dict = config
        self.recv = WsReceiver(self, config['ping_timeout'], config['sleep_time'])
        self.cmd = CommandManager(self, config['prefix'])
        self.recv.on('FriendMessage')(self.cmd.handle_command)
        self.recv.on('GroupMessage')(self.cmd.handle_command)

    async def run(self):
        async with self:
            await self.config(enable_websocket=True)
            scheduler.configure()
            scheduler.start()
            logger.info('Scheduler started')
            logger.debug('Timezone: %s', str(scheduler.timezone))
            await self.recv.run()


_bot: Optional[SiBot] = None


def init(config: Optional[dict] = None) -> None:
    if config['debug']:
        from aiomirai.logger import Api, Receiver
        logger.setLevel(logging.DEBUG)
        Api.setLevel(logging.DEBUG)
        Receiver.setLevel(logging.DEBUG)
    else:
        logger.setLevel(logging.INFO)
    global _bot
    _bot = SiBot(config)
    load_from_config(config.get('plugins', []))


def get_bot() -> SiBot:
    if _bot is None:
        raise ValueError('SiBot instance has not been initialized')
    return _bot


def get_conf() -> Dict[str, Any]:
    return get_bot().config_dict


def run():
    import asyncio
    try:
        asyncio.run(get_bot().run())
    except KeyboardInterrupt:
        logger.info('Exiting...')


def on_command(name: str):
    return get_bot().cmd.on_command(name)


def on_event(name: str):
    return get_bot().recv.on(name)


from .db import get_coll
from .command import CommandManager, CommandSession
from .permission import Perm, check_perm, update_perm
